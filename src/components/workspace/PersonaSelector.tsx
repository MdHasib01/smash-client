import React, { useMemo, useState } from 'react';
import { UserRound, ChevronDown, Sparkles, Images, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePersonas } from '../../contexts/PersonasContext';
import { useBrands } from '../../contexts/BrandsContext';
import { Persona, StylePreset } from '../../types/api';
import { cn } from '../../lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Separator } from '../ui/separator';

interface PersonaSelectorProps {
  personaId: string | null;
  onPersonaChange: (id: string | null) => void;
  styleId: string | null;
  onStyleChange: (id: string | null) => void;
  /** Reference ids enabled for this run; empty means "all of them". */
  enabledReferenceIds: string[];
  onReferencesChange: (ids: string[]) => void;
}

export const PersonaSelector: React.FC<PersonaSelectorProps> = ({
  personaId,
  onPersonaChange,
  styleId,
  onStyleChange,
  enabledReferenceIds,
  onReferencesChange,
}) => {
  const navigate = useNavigate();
  const { personas, styles } = usePersonas();
  const { activeBrand } = useBrands();
  const [isPersonaOpen, setPersonaOpen] = useState(false);
  const [isStyleOpen, setStyleOpen] = useState(false);

  const persona = useMemo(() => personas.find((p) => p.id === personaId) ?? null, [personas, personaId]);

  // Default style comes from the persona unless overridden for this run.
  const effectiveStyle: StylePreset | null = useMemo(() => {
    if (styleId) return styles.find((s) => s.id === styleId) ?? null;
    if (persona && typeof persona.defaultStyle === 'object') return persona.defaultStyle;
    return null;
  }, [styleId, styles, persona]);

  const references = persona?.references ?? [];
  const isRefEnabled = (id: string) => !enabledReferenceIds.length || enabledReferenceIds.includes(id);

  const toggleRef = (id: string) => {
    // Empty means "all", so materialise the full list before removing one.
    const current = enabledReferenceIds.length ? enabledReferenceIds : references.map((r) => r.id);
    const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
    onReferencesChange(next.length === references.length ? [] : next);
  };

  const brandPersonas = useMemo(() => {
    if (!activeBrand) return personas;
    // Personas from the active brand first, but never hide the others.
    return [...personas].sort((a, b) => {
      const aid = typeof a.project === 'object' ? a.project.id : a.project;
      const bid = typeof b.project === 'object' ? b.project.id : b.project;
      return Number(bid === activeBrand.id) - Number(aid === activeBrand.id);
    });
  }, [personas, activeBrand]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 flex-wrap">
        {/* Brand the run is filed under - links to the Brands page. */}
        <button
          onClick={() => navigate('/brands')}
          title="Runs and results are filed under this brand. Click to manage brands."
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest bg-white/5 text-white/80 border border-white/10 hover:bg-white/10 transition-colors"
        >
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: activeBrand?.color ?? '#666' }} />
          {activeBrand?.name ?? 'No brand'}
        </button>

        {/* Persona pill */}
        <Popover open={isPersonaOpen} onOpenChange={(open) => { setPersonaOpen(open); if (open) setStyleOpen(false); }}>
          <PopoverTrigger asChild>
          <button
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40',
              persona
                ? 'bg-[#D946EF]/10 text-[#D946EF] border-[#D946EF]/20'
                : 'bg-white/5 text-smash-text-secondary border-white/10 hover:text-white'
            )}
          >
            <UserRound size={11} />
            {persona ? persona.name : 'No persona'}
            <ChevronDown size={11} />
          </button>
          </PopoverTrigger>

              <PopoverContent
                align="start"
                className="w-72 max-h-80 overflow-y-auto rounded-xl p-2 flex flex-col gap-1"
              >
                <button
                  onClick={() => {
                    onPersonaChange(null);
                    onReferencesChange([]);
                    setPersonaOpen(false);
                  }}
                  className={cn(
                    'text-left px-2 py-1.5 rounded-lg text-xs hover:bg-white/5',
                    !persona ? 'text-white bg-white/10' : 'text-smash-text-secondary hover:text-white'
                  )}
                >
                  No persona — use my prompt as-is
                </button>

                <Separator className="my-1 bg-white/5" />

                {brandPersonas.map((p) => (
                  <PersonaRow
                    key={p.id}
                    persona={p}
                    selected={p.id === personaId}
                    onSelect={() => {
                      onPersonaChange(p.id);
                      onReferencesChange([]);
                      onStyleChange(null);
                      setPersonaOpen(false);
                    }}
                  />
                ))}

                {!personas.length && (
                  <button
                    onClick={() => navigate('/personas')}
                    className="text-left px-2 py-1.5 rounded-lg text-xs text-[#D946EF] hover:bg-white/5"
                  >
                    Create your first persona →
                  </button>
                )}
              </PopoverContent>
        </Popover>

        {/* Style pill */}
        {persona && (
          <Popover open={isStyleOpen} onOpenChange={(open) => { setStyleOpen(open); if (open) setPersonaOpen(false); }}>
            <PopoverTrigger asChild>
            <button
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest bg-violet-500/10 text-violet-300 border border-violet-500/20 hover:bg-violet-500/20 transition-colors"
            >
              <Sparkles size={11} />
              {effectiveStyle?.name ?? 'No style'}
              <ChevronDown size={11} />
            </button>
            </PopoverTrigger>

                <PopoverContent
                  align="start"
                  className="w-64 max-h-80 overflow-y-auto rounded-xl p-2 flex flex-col gap-1"
                >
                  <button
                    onClick={() => {
                      onStyleChange(null);
                      setStyleOpen(false);
                    }}
                    className="text-left px-2 py-1.5 rounded-lg text-xs text-smash-text-secondary hover:text-white hover:bg-white/5"
                  >
                    Persona default
                  </button>
                  <Separator className="my-1 bg-white/5" />
                  {styles.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        onStyleChange(s.id);
                        setStyleOpen(false);
                      }}
                      className={cn(
                        'text-left px-2 py-1.5 rounded-lg text-xs hover:bg-white/5',
                        styleId === s.id ? 'text-white bg-white/10' : 'text-smash-text-secondary hover:text-white'
                      )}
                    >
                      {s.name}
                    </button>
                  ))}
                </PopoverContent>
          </Popover>
        )}

        {persona && references.length > 0 && (
          <span className="text-[10px] text-smash-text-tertiary flex items-center gap-1">
            <Images size={10} />
            {enabledReferenceIds.length || references.length}/{references.length} references
          </span>
        )}
      </div>

      {/* Reference strip — toggle which images go into this run */}
      {persona && references.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {references.map((ref) => {
            const asset = typeof ref.asset === 'object' ? ref.asset : null;
            const enabled = isRefEnabled(ref.id);
            return (
              <button
                key={ref.id}
                onClick={() => toggleRef(ref.id)}
                title={`${ref.role}: ${ref.label}`}
                className={cn(
                  'relative shrink-0 w-14 rounded-xl overflow-hidden border transition-all group',
                  enabled ? 'border-[#D946EF]/50' : 'border-white/10 opacity-40 hover:opacity-70'
                )}
              >
                {asset?.url ? (
                  <img src={asset.url} alt={ref.label} className="w-14 h-14 object-cover bg-black/40" />
                ) : (
                  <div className="w-14 h-14 bg-black/40" />
                )}
                <span className="block px-1 py-0.5 text-[8px] font-bold text-white truncate bg-black/60">
                  {ref.label}
                </span>
                <span
                  className={cn(
                    'absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center',
                    enabled ? 'bg-[#D946EF] text-white' : 'bg-black/60 text-white/50'
                  )}
                >
                  {enabled ? <Check size={9} /> : <X size={9} />}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

const PersonaRow: React.FC<{ persona: Persona; selected: boolean; onSelect: () => void }> = ({
  persona,
  selected,
  onSelect,
}) => {
  const primary = persona.references.find((r) => r.isPrimary) ?? persona.references[0];
  const thumb = primary && typeof primary.asset === 'object' ? primary.asset.url : null;
  const brandName = typeof persona.project === 'object' ? persona.project.name : '';

  return (
    <button
      onClick={onSelect}
      className={cn(
        'flex items-center gap-2.5 text-left px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors',
        selected && 'bg-white/10'
      )}
    >
      {thumb ? (
        <img src={thumb} alt="" className="w-8 h-8 rounded-lg object-cover bg-black/40 shrink-0" />
      ) : (
        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
          <UserRound size={13} className="text-smash-text-tertiary" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <span className={cn('block text-xs font-bold truncate', selected ? 'text-white' : 'text-smash-text-secondary')}>
          {persona.name}
        </span>
        <span className="block text-[10px] text-smash-text-tertiary truncate">
          {persona.kind} · {brandName} · {persona.references.length} refs
        </span>
      </div>
      {selected && <Check size={13} className="text-[#D946EF] shrink-0" />}
    </button>
  );
};
