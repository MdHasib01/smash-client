import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Building2, Package, UserRound, Star, Trash2, Check, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input, Textarea } from '../ui/Input';
import { ImageDropzone } from '../ui/ImageDropzone';
import { useBrands } from '../../contexts/BrandsContext';
import { usePersonas } from '../../contexts/PersonasContext';
import { useToast } from '../../contexts/ToastContext';
import { Persona, PersonaKind, ReferenceRole, StylePreset } from '../../types/api';
import { cn } from '../../lib/utils';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '../ui/dialog';
import { Label as UiLabel } from '../ui/label';
import { SelectField } from '../ui/select-field';
import { Switch } from '../ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

const KINDS: { kind: PersonaKind; icon: typeof Building2; title: string; blurb: string }[] = [
  { kind: 'BRAND', icon: Building2, title: 'Brand', blurb: 'A whole brand — logo, products, tone of voice.' },
  { kind: 'PRODUCT', icon: Package, title: 'Product', blurb: 'One specific product that must look identical every time.' },
  { kind: 'PROFILE', icon: UserRound, title: 'Personal Profile', blurb: 'You and your family, for personal social posts.' },
];

/** Roles worth offering, per persona kind, with kind-aware label hints. */
const ROLE_OPTIONS: Record<PersonaKind, { role: ReferenceRole; hint: string }[]> = {
  BRAND: [
    { role: 'PRODUCT', hint: 'e.g. "400g tin, front"' },
    { role: 'LOGO', hint: 'e.g. "wordmark, white"' },
    { role: 'PERSON', hint: 'e.g. "brand model"' },
    { role: 'STYLE_REF', hint: 'e.g. "campaign look"' },
    { role: 'BACKGROUND', hint: 'e.g. "kitchen set"' },
    { role: 'OTHER', hint: 'anything else' },
  ],
  PRODUCT: [
    { role: 'PRODUCT', hint: 'e.g. "front of pack"' },
    { role: 'LOGO', hint: 'e.g. "logo on lid"' },
    { role: 'BACKGROUND', hint: 'e.g. "marble counter"' },
    { role: 'STYLE_REF', hint: 'e.g. "reference shot"' },
    { role: 'OTHER', hint: 'anything else' },
  ],
  PROFILE: [
    { role: 'PERSON', hint: 'e.g. "me"' },
    { role: 'CHILD', hint: 'e.g. "my son Rayan"' },
    { role: 'PET', hint: 'e.g. "our cat Mishti"' },
    { role: 'BACKGROUND', hint: 'e.g. "our living room"' },
    { role: 'STYLE_REF', hint: 'e.g. "look I like"' },
    { role: 'OTHER', hint: 'anything else' },
  ],
};

const GUIDELINE_PLACEHOLDER: Record<PersonaKind, string> = {
  BRAND:
    'One rule per line, e.g.\nAlways show the tin label legible and unaltered\nWarm morning light, domestic setting\nNever imply a medical claim',
  PRODUCT:
    'One rule per line, e.g.\nKeep the label text and colour exact\nShow the product upright and unobstructed\nNo competing products in frame',
  PROFILE:
    'One rule per line, e.g.\nKeep faces natural, no beauty filter\nEveryday clothes, relaxed poses\nNever put us somewhere we have never been',
};

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <UiLabel className="text-[10px] font-bold tracking-widest uppercase text-smash-text-secondary">{children}</UiLabel>
);

const Field: React.FC<{ label: string; children: React.ReactNode; hint?: string }> = ({ label, children, hint }) => (
  <div className="flex flex-col gap-1.5">
    <Label>{label}</Label>
    {children}
    {hint && <span className="text-[11px] text-smash-text-tertiary">{hint}</span>}
  </div>
);


interface PersonaEditorProps {
  isOpen: boolean;
  onClose: () => void;
  /** Editing an existing persona, or null to create one. */
  persona: Persona | null;
  /** Brand to preselect when creating (e.g. from a brand card). */
  defaultBrandId?: string;
}

const STEPS = ['Kind', 'Identity', 'References', 'Style'];

export const PersonaEditor: React.FC<PersonaEditorProps> = ({ isOpen, onClose, persona, defaultBrandId }) => {
  const { brands, activeBrand } = useBrands();
  const { styles, createPersona, updatePersona, addReference, updateReference, removeReference } = usePersonas();
  const { addToast } = useToast();

  const isEditing = Boolean(persona);
  const [step, setStep] = useState(isEditing ? 1 : 0);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);

  const [kind, setKind] = useState<PersonaKind>(persona?.kind ?? 'BRAND');
  const [name, setName] = useState(persona?.name ?? '');
  const [projectId, setProjectId] = useState(
    typeof persona?.project === 'object' ? persona.project.id : (persona?.project ?? defaultBrandId ?? activeBrand?.id ?? '')
  );
  const [description, setDescription] = useState(persona?.description ?? '');
  const [guidelines, setGuidelines] = useState(persona?.promptGuidelines ?? '');
  const [brandBrief, setBrandBrief] = useState(persona?.brandBrief ?? '');
  const [negative, setNegative] = useState(persona?.negativePrompt ?? '');
  const [styleId, setStyleId] = useState(
    typeof persona?.defaultStyle === 'object' && persona.defaultStyle ? persona.defaultStyle.id : (persona?.defaultStyle as string) ?? ''
  );
  const [refinePrompts, setRefinePrompts] = useState(persona?.refinePrompts ?? true);

  // The persona being edited; created on first save so references can attach.
  const [draft, setDraft] = useState<Persona | null>(persona);

  const roleOptions = ROLE_OPTIONS[kind];
  const references = draft?.references ?? [];

  const canSaveIdentity = name.trim().length > 0 && projectId.length > 0;

  const reset = () => {
    setStep(0);
    setDraft(null);
    setName('');
    setDescription('');
    setGuidelines('');
    setBrandBrief('');
    setNegative('');
    setStyleId('');
    setKind('BRAND');
  };

  const handleClose = () => {
    if (!isEditing) reset();
    onClose();
  };

  /** Save identity, creating the persona if this is the first time through. */
  const saveIdentity = async (): Promise<Persona | null> => {
    setIsSaving(true);
    try {
      const payload = {
        name: name.trim(),
        kind,
        project: projectId,
        description: description.trim(),
        brandBrief: brandBrief.trim(),
        promptGuidelines: guidelines.trim(),
        negativePrompt: negative.trim(),
        refinePrompts,
        ...(styleId ? { defaultStyle: styleId } : {}),
      };

      const saved = draft
        ? await updatePersona(draft.id, payload as Partial<Persona>)
        : await createPersona(payload as any);
      setDraft(saved);
      return saved;
    } catch (err) {
      addToast((err as Error).message, 'ERROR');
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const handleFiles = async (files: File[]) => {
    if (!draft) return;
    setUploadingCount(files.length);
    try {
      for (const file of files) {
        // Label defaults to the filename; the user renames it in the row below.
        const fallbackLabel = file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').slice(0, 60);
        // Each call returns the whole persona, so the list stays in sync as we go.
        setDraft(
          await addReference(draft.id, {
            file,
            label: fallbackLabel || 'reference',
            role: roleOptions[0].role,
          })
        );
      }
      addToast(`${files.length} reference${files.length > 1 ? 's' : ''} uploaded — now label them`, 'SUCCESS');
    } catch (err) {
      addToast((err as Error).message, 'ERROR');
    } finally {
      setUploadingCount(0);
    }
  };

  const patchReference = async (refId: string, input: Record<string, unknown>) => {
    if (!draft) return;
    try {
      setDraft(await updateReference(draft.id, refId, input as any));
    } catch (err) {
      addToast((err as Error).message, 'ERROR');
    }
  };

  const dropReference = async (refId: string) => {
    if (!draft) return;
    try {
      setDraft(await removeReference(draft.id, refId));
    } catch (err) {
      addToast((err as Error).message, 'ERROR');
    }
  };

  const finish = async () => {
    const saved = await saveIdentity();
    if (!saved) return;
    addToast(`Persona "${saved.name}" saved`, 'SUCCESS');
    handleClose();
  };

  const groupedStyles = useMemo(() => {
    const builtIn = styles.filter((s) => s.isBuiltIn);
    const custom = styles.filter((s) => !s.isBuiltIn);
    return { builtIn, custom };
  }, [styles]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent
        showCloseButton={false}
        className="flex flex-col gap-0 p-0 overflow-hidden sm:max-w-2xl max-h-[90vh] rounded-3xl"
      >
        {/* Header + progress */}
        <div className="p-6 pb-4 border-b border-white/5 shrink-0">
          <div className="flex items-start justify-between mb-4">
            <div>
              <DialogTitle className="text-lg font-bold text-white tracking-tight">
                {isEditing ? `Edit ${persona?.name}` : 'New Persona'}
              </DialogTitle>
              <DialogDescription className="text-xs text-smash-text-secondary mt-0.5">
                A reusable subject that gets injected into every generation.
              </DialogDescription>
            </div>
            <DialogClose asChild>
              <Button variant="icon" size="icon-sm" aria-label="Close">
                <X size={16} />
              </Button>
            </DialogClose>
          </div>

          <div className="flex gap-1.5">
            {STEPS.map((s, i) => (
              <button
                key={s}
                onClick={() => draft && setStep(i)}
                disabled={!draft && i > 1}
                className={cn(
                  'flex-1 flex flex-col gap-1.5 text-left disabled:cursor-not-allowed outline-none focus-visible:[&>div]:ring-2 focus-visible:[&>div]:ring-ring/50',
                  !draft && i > 1 && 'opacity-40'
                )}
              >
                <div className={cn('h-1 rounded-full transition-all', i <= step ? 'bg-gradient-primary' : 'bg-white/10')} />
                <span
                  className={cn(
                    'text-[9px] font-bold uppercase tracking-widest',
                    i <= step ? 'text-white' : 'text-smash-text-tertiary'
                  )}
                >
                  {s}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="kind" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="flex flex-col gap-3">
                {KINDS.map(({ kind: k, icon: Icon, title, blurb }) => (
                  <button
                    key={k}
                    onClick={() => setKind(k)}
                    className={cn(
                      'flex items-start gap-4 p-4 rounded-2xl border text-left transition-all outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40',
                      kind === k
                        ? 'border-[#D946EF]/50 bg-[#D946EF]/10'
                        : 'border-white/10 bg-white/[0.02] hover:bg-white/5 hover:border-white/20'
                    )}
                  >
                    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', kind === k ? 'bg-[#D946EF]/20 text-[#D946EF]' : 'bg-white/5 text-smash-text-secondary')}>
                      <Icon size={18} />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-bold text-white">{title}</span>
                      <span className="text-xs text-smash-text-secondary">{blurb}</span>
                    </div>
                    {kind === k && <Check size={16} className="text-[#D946EF] ml-auto shrink-0" />}
                  </button>
                ))}
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="identity" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="flex flex-col gap-4">
                <Field label="Name">
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={kind === 'PROFILE' ? 'My Facebook profile' : 'Milkimom'}
                  />
                </Field>

                <Field label="Brand" hint="Personas live inside a brand; generations inherit it.">
                  <SelectField
                    aria-label="Brand"
                    value={projectId}
                    onValueChange={setProjectId}
                    placeholder="Select a brand…"
                    options={brands.map((b) => ({
                      value: b.id,
                      label: (
                        <>
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: b.color }} />
                          {b.name}
                        </>
                      ),
                    }))}
                  />
                </Field>

                <Field label="Description" hint="Who or what this is. The model reads this first.">
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={
                      kind === 'PROFILE'
                        ? 'Me, my wife and our son. Everyday family moments at home in Dhaka.'
                        : 'Milk supplement for breastfeeding mothers in Bangladesh. Warm, reassuring, evidence-based.'
                    }
                    className="min-h-[80px] resize-none"
                  />
                </Field>

                <Field
                  label="Master brief (optional)"
                  hint={`Your complete art-direction prompt — model, wardrobe, home, lighting, product rules. Sent word for word with every generation; your prompt then says what happens in the scene. ${brandBrief.length.toLocaleString()} / 20,000`}
                >
                  <Textarea
                    value={brandBrief}
                    onChange={(e) => setBrandBrief(e.target.value.slice(0, 20000))}
                    placeholder={'Paste the full visual-direction prompt for this persona here.\n\nE.g. "You are the dedicated AI visual director for the Milkimom brand…"'}
                    className="min-h-[200px] resize-y font-mono text-xs leading-relaxed"
                  />
                </Field>

                <Field label="Guidelines" hint="One rule per line — always applied to this persona.">
                  <Textarea
                    value={guidelines}
                    onChange={(e) => setGuidelines(e.target.value)}
                    placeholder={GUIDELINE_PLACEHOLDER[kind]}
                    className="min-h-[110px] resize-none"
                  />
                </Field>

                <Field label="Never include" hint="Sent to the model as a negative prompt.">
                  <Input
                    value={negative}
                    onChange={(e) => setNegative(e.target.value)}
                    placeholder="distorted hands, unreadable label, invented slogans"
                  />
                </Field>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="references" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="flex flex-col gap-4">
                <p className="text-xs text-smash-text-secondary">
                  Upload photos, then <span className="text-white font-bold">label each one</span>. The label is what
                  lets a prompt like “me and my baby” pick the right images.
                </p>

                <ImageDropzone
                  onSelect={handleFiles}
                  disabled={!draft || uploadingCount > 0}
                  label={uploadingCount > 0 ? `Uploading ${uploadingCount}…` : 'Drop reference images here'}
                />

                <div className="flex flex-col gap-2">
                  {references.map((ref) => {
                    const asset = typeof ref.asset === 'object' ? ref.asset : null;
                    return (
                      <div key={ref.id} className="flex gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/10">
                        {asset?.url ? (
                          <img src={asset.url} alt={ref.label} className="w-16 h-16 rounded-xl object-cover bg-black/40 shrink-0" />
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-black/40 shrink-0" />
                        )}

                        <div className="flex-1 flex flex-col gap-2 min-w-0">
                          <Input
                            defaultValue={ref.label}
                            onBlur={(e) => e.target.value !== ref.label && patchReference(ref.id, { label: e.target.value })}
                            placeholder={roleOptions.find((r) => r.role === ref.role)?.hint ?? 'label this image'}
                            className="h-8 text-xs"
                          />
                          <div className="flex gap-2">
                            <div className="flex-1 min-w-0">
                              <SelectField
                                size="sm"
                                aria-label="Role"
                                className="text-xs"
                                value={ref.role}
                                onValueChange={(v) => patchReference(ref.id, { role: v })}
                                // Keep the saved role selectable even if this kind no longer offers it.
                                options={[
                                  ...(roleOptions.some((r) => r.role === ref.role) ? [] : [{ value: ref.role, label: ref.role.replace('_', ' ') }]),
                                  ...roleOptions.map(({ role }) => ({ value: role, label: role.replace('_', ' ') })),
                                ]}
                              />
                            </div>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="icon"
                                  size="icon-sm"
                                  aria-label="Mark as the main reference for this role"
                                  onClick={() => patchReference(ref.id, { isPrimary: !ref.isPrimary })}
                                  className={cn(
                                    ref.isPrimary && 'bg-amber-400/15 text-amber-300 border-amber-400/30 hover:bg-amber-400/20 hover:text-amber-300'
                                  )}
                                >
                                  <Star size={13} fill={ref.isPrimary ? 'currentColor' : 'none'} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Mark as the main reference for this role</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="icon"
                                  size="icon-sm"
                                  aria-label="Remove"
                                  onClick={() => dropReference(ref.id)}
                                  className="hover:text-rose-300 hover:border-rose-500/30"
                                >
                                  <Trash2 size={13} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Remove</TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {!references.length && draft && (
                    <p className="text-xs text-smash-text-tertiary text-center py-4">
                      No references yet. A persona works without them, but faces and products stay consistent only
                      when you add some.
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="style" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="flex flex-col gap-4">
                <Field label="Default style" hint="You can override this per generation.">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <StyleCard style={null} selected={!styleId} onSelect={() => setStyleId('')} />
                    {[...groupedStyles.builtIn, ...groupedStyles.custom].map((s) => (
                      <StyleCard key={s.id} style={s} selected={styleId === s.id} onSelect={() => setStyleId(s.id)} />
                    ))}
                  </div>
                </Field>

                <label className="flex items-start gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/10 cursor-pointer hover:border-white/20 transition-colors">
                  <span className="flex flex-col gap-0.5 flex-1">
                    <span className="text-sm font-bold text-white">Let the local agent refine prompts</span>
                    <span className="text-xs text-smash-text-secondary">
                      The node agent rewrites the assembled prompt and picks which references matter. Falls back to the
                      assembled prompt if the agent is offline.
                    </span>
                  </span>
                  <Switch checked={refinePrompts} onCheckedChange={setRefinePrompts} className="mt-0.5" />
                </label>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-6 pt-4 border-t border-white/5 flex items-center justify-between shrink-0">
          <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
            Back
          </Button>

          <div className="flex items-center gap-2">
            {step === 1 && !canSaveIdentity && (
              <span className="text-[11px] text-smash-text-tertiary">Name and brand are required</span>
            )}
            {step < 3 ? (
              <Button
                variant="primary"
                isLoading={isSaving}
                disabled={step === 1 && !canSaveIdentity}
                onClick={async () => {
                  // Identity has to exist before references can attach to it.
                  if (step === 1) {
                    const saved = await saveIdentity();
                    if (!saved) return;
                  }
                  setStep((s) => s + 1);
                }}
              >
                {isSaving ? <Loader2 size={14} className="animate-spin" /> : 'Continue'}
              </Button>
            ) : (
              <Button variant="primary" isLoading={isSaving} onClick={finish}>
                Save Persona
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const StyleCard: React.FC<{ style: StylePreset | null; selected: boolean; onSelect: () => void }> = ({
  style,
  selected,
  onSelect,
}) => (
  <button
    onClick={onSelect}
    className={cn(
      'flex flex-col gap-1 p-3 rounded-xl border text-left transition-all outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40',
      selected ? 'border-[#D946EF]/50 bg-[#D946EF]/10' : 'border-white/10 bg-white/[0.02] hover:bg-white/5'
    )}
  >
    <span className="text-xs font-bold text-white flex items-center gap-1.5">
      {style?.name ?? 'No style'}
      {selected && <Check size={12} className="text-[#D946EF]" />}
    </span>
    <span className="text-[11px] text-smash-text-secondary line-clamp-2">
      {style?.description ?? 'Use the persona and prompt only.'}
    </span>
  </button>
);
