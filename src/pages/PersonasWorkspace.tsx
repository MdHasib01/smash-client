import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Building2, Package, UserRound, Copy, Trash2, Pencil, Images, Sparkles, FileText } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { PersonaEditor } from '../components/personas/PersonaEditor';
import { useBrands } from '../contexts/BrandsContext';
import { usePersonas } from '../contexts/PersonasContext';
import { useToast } from '../contexts/ToastContext';
import { Persona, PersonaKind } from '../types/api';
import { cn } from '../lib/utils';

const KIND_ICON: Record<PersonaKind, typeof Building2> = {
  BRAND: Building2,
  PRODUCT: Package,
  PROFILE: UserRound,
};

const FILTERS: (PersonaKind | 'ALL')[] = ['ALL', 'BRAND', 'PRODUCT', 'PROFILE'];

export const PersonasWorkspace: React.FC = () => {
  const navigate = useNavigate();
  const { brands } = useBrands();
  const { personas, isLoading, error, deletePersona, duplicatePersona } = usePersonas();
  const { addToast } = useToast();

  const [filter, setFilter] = useState<PersonaKind | 'ALL'>('ALL');
  const [searchParams] = useSearchParams();
  // /personas?brand=<id> arrives from a card on the Brands page.
  const [brandFilter, setBrandFilter] = useState<string>(() => searchParams.get('brand') ?? 'ALL');
  const [editing, setEditing] = useState<Persona | null>(null);
  const [isEditorOpen, setEditorOpen] = useState(false);

  const visible = useMemo(
    () =>
      personas.filter((p) => {
        if (filter !== 'ALL' && p.kind !== filter) return false;
        if (brandFilter === 'ALL') return true;
        const pid = typeof p.project === 'object' ? p.project.id : p.project;
        return pid === brandFilter;
      }),
    [personas, filter, brandFilter]
  );

  const openEditor = (persona: Persona | null) => {
    setEditing(persona);
    setEditorOpen(true);
  };

  const handleDelete = async (persona: Persona) => {
    if (!window.confirm(`Delete "${persona.name}"? Its reference images will be removed too.`)) return;
    try {
      await deletePersona(persona.id);
      addToast(`Persona "${persona.name}" deleted`, 'SUCCESS');
    } catch (err) {
      addToast((err as Error).message, 'ERROR');
    }
  };

  const handleDuplicate = async (persona: Persona) => {
    try {
      const copy = await duplicatePersona(persona.id);
      addToast(`Created "${copy.name}"`, 'SUCCESS');
    } catch (err) {
      addToast((err as Error).message, 'ERROR');
    }
  };

  return (
    <PageContainer
      title="Personas"
      description="Reusable subjects — a brand, a product, or you and your family — injected into every generation."
      primaryAction={
        <Button variant="primary" onClick={() => openEditor(null)} disabled={!brands.length}>
          <Plus size={16} className="mr-1.5" /> New Persona
        </Button>
      }
      secondaryToolbar={
        <div className="w-full flex flex-wrap items-center gap-2">
          <div className="flex gap-1 p-1 rounded-xl glass-3 border border-white/5">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all',
                  filter === f ? 'bg-white/10 text-white' : 'text-smash-text-tertiary hover:text-white'
                )}
              >
                {f}
              </button>
            ))}
          </div>

          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="bg-black/40 border border-white/10 rounded-lg h-9 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#D946EF]"
          >
            <option value="ALL">All brands</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      }
    >
      {error && (
        <div className="mb-4 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3">{error}</div>
      )}

      {!brands.length && !isLoading ? (
        <EmptyState
          icon={Building2}
          title="Create a brand first"
          description="Personas live inside a brand. Add one from the brand selector in the header."
        />
      ) : !visible.length && !isLoading ? (
        <EmptyState
          icon={UserRound}
          title="No personas yet"
          description="A persona holds your logo, product shots or family photos plus a style, so every generation stays consistent."
          actionLabel="New Persona"
          onAction={() => openEditor(null)}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {visible.map((persona, index) => {
            const Icon = KIND_ICON[persona.kind];
            const primary =
              persona.references.find((r) => r.isPrimary) ?? persona.references[0];
            const thumb = primary && typeof primary.asset === 'object' ? primary.asset.url : null;
            const brandName = typeof persona.project === 'object' ? persona.project.name : '';
            const styleName =
              typeof persona.defaultStyle === 'object' && persona.defaultStyle ? persona.defaultStyle.name : null;

            return (
              <motion.div
                key={persona.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="glass-2 border border-white/10 rounded-3xl p-4 flex flex-col gap-3 hover:border-white/20 transition-all group"
              >
                <div className="flex items-start gap-3">
                  {thumb ? (
                    <img src={thumb} alt={persona.name} className="w-14 h-14 rounded-2xl object-cover bg-black/40 shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-smash-text-tertiary shrink-0">
                      <Icon size={20} />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black text-white truncate">{persona.name}</h3>
                      {persona.isDefault && <Badge variant="connection">Default</Badge>}
                    </div>
                    <p className="text-[11px] text-smash-text-tertiary truncate">{brandName}</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <Badge variant="outline">{persona.kind}</Badge>
                      <span className="text-[10px] text-smash-text-tertiary flex items-center gap-1">
                        <Images size={10} /> {persona.references.length}
                      </span>
                    </div>
                  </div>
                </div>

                {persona.description && (
                  <p className="text-xs text-smash-text-secondary line-clamp-2">{persona.description}</p>
                )}

                {persona.brandBrief && (
                  <div
                    className="flex items-center gap-1.5 text-[10px] font-bold text-amber-200/90"
                    title={persona.brandBrief.slice(0, 400) + (persona.brandBrief.length > 400 ? '…' : '')}
                  >
                    <FileText size={10} /> Master brief · {persona.brandBrief.length.toLocaleString()} chars
                  </div>
                )}

                {styleName && (
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-violet-300">
                    <Sparkles size={10} /> {styleName}
                  </div>
                )}

                <div className="flex items-center gap-1.5 mt-auto pt-2 border-t border-white/5">
                  <Button variant="tertiary" size="sm" className="flex-1 text-[10px]" onClick={() => navigate(`/generate/image?persona=${persona.id}`)}>
                    Use
                  </Button>
                  <Button variant="icon" size="sm" className="w-8 h-8" title="Edit" onClick={() => openEditor(persona)}>
                    <Pencil size={13} />
                  </Button>
                  <Button variant="icon" size="sm" className="w-8 h-8" title="Duplicate" onClick={() => handleDuplicate(persona)}>
                    <Copy size={13} />
                  </Button>
                  <Button
                    variant="icon"
                    size="sm"
                    className="w-8 h-8 hover:text-rose-300"
                    title="Delete"
                    onClick={() => handleDelete(persona)}
                  >
                    <Trash2 size={13} />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {isEditorOpen && (
        <PersonaEditor
          isOpen={isEditorOpen}
          persona={editing}
          onClose={() => {
            setEditorOpen(false);
            setEditing(null);
          }}
        />
      )}
    </PageContainer>
  );
};
