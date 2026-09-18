import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Plus,
  Building2,
  Check,
  Pencil,
  Trash2,
  Sparkles,
  Images,
  UserRound,
  Package,
  Contact,
  ChevronRight,
  X,
} from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { Button } from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';
import { PersonaEditor } from '../components/personas/PersonaEditor';
import { useBrands } from '../contexts/BrandsContext';
import { usePersonas } from '../contexts/PersonasContext';
import { useToast } from '../contexts/ToastContext';
import { list } from '../lib/api';
import { Brand, Persona, PersonaKind } from '../types/api';
import { cn } from '../lib/utils';
import { useConfirm } from '../contexts/ConfirmContext';
import { Badge } from '../components/ui/Badge';
import { Label } from '../components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '../components/ui/tooltip';

const SWATCHES = ['#D946EF', '#8B5CF6', '#F43F5E', '#06B6D4', '#10B981', '#F59E0B'];

const KIND_ICON: Record<PersonaKind, typeof Building2> = {
  BRAND: Building2,
  PRODUCT: Package,
  PROFILE: UserRound,
};

const brandIdOf = (p: Persona) => (typeof p.project === 'object' ? p.project.id : p.project);

/**
 * Brand hub: every brand with its personas and results in one place. Each card
 * is the jumping-off point for that brand - new persona, generate, results.
 */
export const BrandsWorkspace: React.FC = () => {
  const navigate = useNavigate();
  const { brands, activeBrand, setActiveBrandId, createBrand, updateBrand, deleteBrand, isLoading } = useBrands();
  const { personas } = usePersonas();
  const { addToast } = useToast();
  const confirm = useConfirm();

  const [resultCounts, setResultCounts] = useState<Record<string, number>>({});
  const [isCreating, setIsCreating] = useState(false);
  const [editorBrandId, setEditorBrandId] = useState<string | null>(null);

  // Result totals per brand, for the card stats.
  useEffect(() => {
    let cancelled = false;
    Promise.all(
      brands.map(async (b) => {
        try {
          const { meta } = await list('/results', { project: b.id, limit: 1 });
          return [b.id, meta?.total ?? 0] as const;
        } catch {
          return [b.id, 0] as const;
        }
      })
    ).then((entries) => !cancelled && setResultCounts(Object.fromEntries(entries)));
    return () => {
      cancelled = true;
    };
  }, [brands]);

  /** Every action on a card makes that brand active first, so the next screen shows it. */
  const go = (brand: Brand, path: string) => {
    setActiveBrandId(brand.id);
    navigate(path);
  };

  const handleDelete = async (brand: Brand) => {
    const count = personas.filter((p) => brandIdOf(p) === brand.id).length;
    const warning = count
      ? `Delete "${brand.name}"? Its ${count} persona(s) and their results will lose their brand.`
      : `Delete "${brand.name}"?`;
    if (!(await confirm({ title: 'Delete brand?', description: warning }))) return;
    try {
      await deleteBrand(brand.id);
      addToast(`Brand "${brand.name}" deleted`, 'SUCCESS');
    } catch (err) {
      addToast((err as Error).message, 'ERROR');
    }
  };

  return (
    <PageContainer
      title="Brands"
      description="Each brand keeps its own personas and results. Pick one to work in."
      primaryAction={
        <Button variant="primary" onClick={() => setIsCreating(true)}>
          <Plus size={16} /> New Brand
        </Button>
      }
    >
      <div className="flex flex-col gap-6 pb-20">
        {isCreating && (
          <BrandForm
            onCancel={() => setIsCreating(false)}
            onSubmit={async (input) => {
              const brand = await createBrand(input);
              setActiveBrandId(brand.id);
              addToast(`Brand "${brand.name}" created`, 'SUCCESS');
              setIsCreating(false);
            }}
          />
        )}

        {!brands.length && !isLoading && !isCreating && (
          <div className="glass-1 border border-white/5 rounded-3xl p-12 text-center flex flex-col items-center gap-4">
            <Building2 size={32} className="text-smash-text-secondary" />
            <div>
              <h3 className="text-lg font-bold text-white">No brands yet</h3>
              <p className="text-sm text-smash-text-secondary mt-1">
                Create one for each business or profile you make creative for — Milkimom, Baby Herbs, your own page.
              </p>
            </div>
            <Button variant="primary" onClick={() => setIsCreating(true)}>
              <Plus size={16} /> New Brand
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-5">
          {brands.map((brand, index) => (
            <BrandCard
              key={brand.id}
              index={index}
              brand={brand}
              isActive={activeBrand?.id === brand.id}
              personas={personas.filter((p) => brandIdOf(p) === brand.id)}
              resultCount={resultCounts[brand.id]}
              onActivate={() => setActiveBrandId(brand.id)}
              onGenerate={() => go(brand, '/generate/image')}
              onResults={() => go(brand, '/results')}
              onPersonas={() => go(brand, `/personas?brand=${brand.id}`)}
              onUsePersona={(persona) => go(brand, `/generate/image?persona=${persona.id}`)}
              onNewPersona={() => {
                setActiveBrandId(brand.id);
                setEditorBrandId(brand.id);
              }}
              onSave={async (input) => {
                await updateBrand(brand.id, input);
                addToast('Brand updated', 'SUCCESS');
              }}
              onDelete={() => handleDelete(brand)}
            />
          ))}
        </div>
      </div>

      {editorBrandId && (
        <PersonaEditor
          isOpen
          persona={null}
          defaultBrandId={editorBrandId}
          onClose={() => setEditorBrandId(null)}
        />
      )}
    </PageContainer>
  );
};

// ---------------------------------------------------------------------------

interface BrandInput {
  name: string;
  description?: string;
  color?: string;
}

const BrandForm: React.FC<{
  initial?: Brand;
  onSubmit: (input: BrandInput) => Promise<void>;
  onCancel: () => void;
}> = ({ initial, onSubmit, onCancel }) => {
  const { addToast } = useToast();
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [color, setColor] = useState(initial?.color ?? SWATCHES[0]);
  const [isSaving, setIsSaving] = useState(false);

  const submit = async () => {
    if (!name.trim()) return;
    setIsSaving(true);
    try {
      await onSubmit({ name: name.trim(), description: description.trim(), color });
    } catch (err) {
      addToast((err as Error).message, 'ERROR');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="glass-2 border border-[#D946EF]/30 rounded-3xl p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Label className="text-[10px] font-bold tracking-widest uppercase text-smash-text-secondary">
          {initial ? 'Edit brand' : 'New brand'}
        </Label>
        <Button variant="ghost" size="icon-sm" onClick={onCancel} aria-label="Cancel" title="Cancel">
          <X size={16} />
        </Button>
      </div>
      <Input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        placeholder="Brand name, e.g. Milkimom"
      />
      <Textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="What it is and who it's for (optional)"
        className="min-h-[70px] resize-none"
      />
      <div className="flex items-center gap-2 flex-wrap">
        {SWATCHES.map((swatch) => (
          <button
            key={swatch}
            onClick={() => setColor(swatch)}
            style={{ backgroundColor: swatch }}
            className={cn(
              'w-7 h-7 rounded-lg flex items-center justify-center transition-transform outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
              color === swatch ? 'scale-110 ring-2 ring-white/40' : 'hover:scale-105'
            )}
            title={swatch}
          >
            {color === swatch && <Check size={13} className="text-white" />}
          </button>
        ))}
        <div className="ml-auto flex gap-2">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" isLoading={isSaving} disabled={!name.trim()} onClick={submit}>
            {initial ? 'Save' : 'Create'}
          </Button>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------

const BrandCard: React.FC<{
  index: number;
  brand: Brand;
  isActive: boolean;
  personas: Persona[];
  resultCount?: number;
  onActivate: () => void;
  onGenerate: () => void;
  onResults: () => void;
  onPersonas: () => void;
  onUsePersona: (persona: Persona) => void;
  onNewPersona: () => void;
  onSave: (input: BrandInput) => Promise<void>;
  onDelete: () => void;
}> = ({
  index,
  brand,
  isActive,
  personas,
  resultCount,
  onActivate,
  onGenerate,
  onResults,
  onPersonas,
  onUsePersona,
  onNewPersona,
  onSave,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <BrandForm
        initial={brand}
        onCancel={() => setIsEditing(false)}
        onSubmit={async (input) => {
          await onSave(input);
          setIsEditing(false);
        }}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className={cn(
        'glass-2 border rounded-2xl overflow-hidden flex flex-col transition-colors',
        isActive ? 'border-[#D946EF]/40 shadow-[0_0_25px_rgba(217,70,239,0.12)]' : 'border-white/10 hover:border-white/20'
      )}
    >
      <div className="h-1.5" style={{ backgroundColor: brand.color }} />

      <div className="p-5 flex flex-col gap-4 flex-1">
        {/* Identity */}
        <div className="flex items-start gap-3">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-base font-bold text-white shrink-0"
            style={{ backgroundColor: brand.color }}
          >
            {brand.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white truncate">{brand.name}</h3>
              {isActive ? (
                <Badge variant="status" statusColor="paused" className="text-[9px] tracking-widest px-1.5 shrink-0">
                  Active
                </Badge>
              ) : (
                <Button
                  variant="outline"
                  onClick={onActivate}
                  className="h-auto rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-smash-text-tertiary hover:text-white shrink-0"
                >
                  Set active
                </Button>
              )}
            </div>
            <p className="text-xs text-smash-text-secondary line-clamp-2 mt-0.5">
              {brand.description || 'No description yet.'}
            </p>
          </div>
          <div className="flex gap-1 shrink-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon-sm" onClick={() => setIsEditing(true)} aria-label="Edit" className="text-smash-text-tertiary">
                  <Pencil size={13} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon-sm" onClick={onDelete} aria-label="Delete" className="text-smash-text-tertiary hover:text-rose-300">
                  <Trash2 size={13} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onPersonas}
            className="glass-3 rounded-xl p-3 text-left hover:bg-white/[0.08] hover:border-white/20 transition-colors group outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
          >
            <span className="text-[9px] font-bold uppercase tracking-widest text-smash-text-tertiary flex items-center gap-1">
              <Contact size={10} /> Personas
            </span>
            <span className="text-2xl font-mono font-bold text-white flex items-center justify-between">
              {personas.length}
              <ChevronRight size={14} className="text-smash-text-tertiary group-hover:text-white" />
            </span>
          </button>
          <button onClick={onResults} className="glass-3 rounded-xl p-3 text-left hover:bg-white/[0.08] hover:border-white/20 transition-colors group outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40">
            <span className="text-[9px] font-bold uppercase tracking-widest text-smash-text-tertiary flex items-center gap-1">
              <Images size={10} /> Results
            </span>
            <span className="text-2xl font-mono font-bold text-white flex items-center justify-between">
              {resultCount ?? '–'}
              <ChevronRight size={14} className="text-smash-text-tertiary group-hover:text-white" />
            </span>
          </button>
        </div>

        {/* Personas of this brand */}
        <div className="flex flex-col gap-2">
          <span className="text-[9px] font-bold uppercase tracking-widest text-smash-text-tertiary">Personas</span>
          {personas.length ? (
            <div className="flex flex-col gap-1.5">
              {personas.slice(0, 4).map((persona) => {
                const Icon = KIND_ICON[persona.kind];
                const primary = persona.references.find((r) => r.isPrimary) ?? persona.references[0];
                const thumb = primary && typeof primary.asset === 'object' ? primary.asset.url : null;
                return (
                  <div
                    key={persona.id}
                    className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.02] border border-white/5"
                  >
                    {thumb ? (
                      <img src={thumb} alt="" className="w-8 h-8 rounded-lg object-cover bg-black/40 shrink-0" />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                        <Icon size={13} className="text-smash-text-tertiary" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">{persona.name}</p>
                      <p className="text-[10px] text-smash-text-tertiary">
                        {persona.kind} · {persona.references.length} refs
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => onUsePersona(persona)}
                      className="text-[10px] text-[#D946EF] hover:text-[#D946EF] hover:bg-[#D946EF]/10 shrink-0"
                    >
                      Use
                    </Button>
                  </div>
                );
              })}
              {personas.length > 4 && (
                <button onClick={onPersonas} className="text-[10px] font-bold text-smash-text-secondary hover:text-white text-left px-1">
                  +{personas.length - 4} more →
                </button>
              )}
            </div>
          ) : (
            <p className="text-xs text-smash-text-tertiary">No personas yet — add the logo, products or people for this brand.</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-auto pt-3 border-t border-white/5">
          <Button variant="secondary" size="sm" className="flex-1 text-[11px]" onClick={onNewPersona}>
            <Plus size={13} /> Persona
          </Button>
          <Button variant="secondary" size="sm" className="flex-1 text-[11px]" onClick={onResults}>
            <Images size={13} /> Results
          </Button>
          <Button variant="primary" size="sm" className="flex-1 text-[11px]" onClick={onGenerate}>
            <Sparkles size={13} /> Generate
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
