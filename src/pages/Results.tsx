import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Search,
  Heart,
  Download,
  Trash2,
  Maximize2,
  Sparkles,
  UserRound,
  Image as ImageIcon,
  Type,
  Video,
  AudioLines,
  Building2,
  Loader2,
} from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { EmptyState } from '../components/ui/EmptyState';
import { ResultLightbox, LightboxItem } from '../components/results/ResultLightbox';
import { useBrands } from '../contexts/BrandsContext';
import { useToast } from '../contexts/ToastContext';
import { del, list, post, ApiMeta } from '../lib/api';
import { downloadUrl, fileNameFor } from '../lib/download';
import { ApiResult, Capability } from '../types/api';
import { cn } from '../lib/utils';

const MODES: { key: 'ALL' | Capability; label: string; icon?: typeof ImageIcon }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'IMAGE', label: 'Image', icon: ImageIcon },
  { key: 'TEXT', label: 'Text', icon: Type },
  { key: 'VIDEO', label: 'Video', icon: Video },
  { key: 'AUDIO', label: 'Audio', icon: AudioLines },
];

const PAGE_SIZE = 36;

const relativeTime = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(iso).toLocaleDateString();
};

/** Every generation for the active brand. Switching brand switches the gallery. */
export const Results: React.FC = () => {
  const navigate = useNavigate();
  const { brands, activeBrand, setActiveBrandId } = useBrands();
  const { addToast } = useToast();

  const [results, setResults] = useState<ApiResult[]>([]);
  const [meta, setMeta] = useState<ApiMeta | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [mode, setMode] = useState<'ALL' | Capability>('ALL');
  const [personaFilter, setPersonaFilter] = useState('ALL');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [lightbox, setLightbox] = useState<LightboxItem | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(
    async (page = 1) => {
      if (!activeBrand) {
        setResults([]);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const { items, meta: nextMeta } = await list<ApiResult>('/results', {
          project: activeBrand.id,
          mode: mode === 'ALL' ? undefined : mode,
          favorite: favoritesOnly || undefined,
          search: debouncedSearch || undefined,
          limit: PAGE_SIZE,
          page,
          sort: '-createdAt',
        });
        setResults((prev) => (page === 1 ? items : [...prev, ...items]));
        setMeta(nextMeta);
      } catch (err) {
        addToast((err as Error).message, 'ERROR');
      } finally {
        setIsLoading(false);
      }
    },
    [activeBrand, mode, favoritesOnly, debouncedSearch, addToast]
  );

  useEffect(() => {
    setPersonaFilter('ALL');
  }, [activeBrand?.id]);

  useEffect(() => {
    load(1);
  }, [load]);

  // Personas that actually appear in this brand's results.
  const personaOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const r of results) {
      if (r.context?.persona && r.context.personaName) seen.set(String(r.context.persona), r.context.personaName);
    }
    return [...seen.entries()];
  }, [results]);

  const visible = useMemo(
    () =>
      personaFilter === 'ALL'
        ? results
        : personaFilter === 'NONE'
          ? results.filter((r) => !r.context?.persona)
          : results.filter((r) => String(r.context?.persona) === personaFilter),
    [results, personaFilter]
  );

  const toggleFavorite = async (result: ApiResult) => {
    // Optimistic: flip now, reconcile with the server's answer.
    setResults((prev) => prev.map((r) => (r.id === result.id ? { ...r, isFavorite: !r.isFavorite } : r)));
    try {
      const updated = await post<ApiResult>(`/results/${result.id}/favorite`);
      if (updated && typeof updated.isFavorite === 'boolean') {
        setResults((prev) => prev.map((r) => (r.id === result.id ? { ...r, isFavorite: updated.isFavorite } : r)));
      }
    } catch (err) {
      setResults((prev) => prev.map((r) => (r.id === result.id ? { ...r, isFavorite: result.isFavorite } : r)));
      addToast((err as Error).message, 'ERROR');
    }
  };

  const remove = async (result: ApiResult) => {
    if (!window.confirm('Delete this result? This cannot be undone.')) return;
    try {
      await del(`/results/${result.id}`);
      setResults((prev) => prev.filter((r) => r.id !== result.id));
      addToast('Result deleted', 'SUCCESS');
    } catch (err) {
      addToast((err as Error).message, 'ERROR');
    }
  };

  const titleFor = (r: ApiResult) =>
    `${r.context?.personaName ? `${r.context.personaName} — ` : ''}${r.connection?.name ?? 'Result'}`;

  const open = (r: ApiResult) =>
    setLightbox({
      url: r.contentUrl,
      text: r.contentUrl ? undefined : r.contentText,
      mimeType: r.mimeType,
      title: titleFor(r),
      subtitle: [activeBrand?.name, r.connection?.provider, relativeTime(r.createdAt)].filter(Boolean).join(' · '),
      prompt: r.context?.rawPrompt ?? r.prompt,
      chips: [r.context?.personaName, r.context?.styleName, r.mode].filter(Boolean) as string[],
    });

  const hasMore = meta ? meta.page < meta.pages : false;

  return (
    <PageContainer
      title={activeBrand ? `${activeBrand.name} Results` : 'Results'}
      description="Every generation filed under the active brand. Switch brand to see its gallery."
      primaryAction={
        <Button variant="primary" onClick={() => navigate('/generate/image')} disabled={!activeBrand}>
          <Sparkles size={16} className="mr-1.5" /> Generate
        </Button>
      }
      secondaryToolbar={
        <div className="w-full flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <Building2 size={14} className="text-smash-text-secondary" />
            <select
              value={activeBrand?.id ?? ''}
              onChange={(e) => setActiveBrandId(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-lg h-9 px-3 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-[#D946EF] [&>option]:bg-black"
            >
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-1 p-1 rounded-xl glass-3 border border-white/5">
            {MODES.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setMode(key)}
                className={cn(
                  'px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1',
                  mode === key ? 'bg-white/10 text-white' : 'text-smash-text-tertiary hover:text-white'
                )}
              >
                {Icon && <Icon size={11} />} {label}
              </button>
            ))}
          </div>

          {personaOptions.length > 0 && (
            <select
              value={personaFilter}
              onChange={(e) => setPersonaFilter(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-lg h-9 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#D946EF] [&>option]:bg-black"
            >
              <option value="ALL">All personas</option>
              {personaOptions.map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
              <option value="NONE">No persona</option>
            </select>
          )}

          <button
            onClick={() => setFavoritesOnly((v) => !v)}
            className={cn(
              'h-9 px-3 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-colors',
              favoritesOnly
                ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                : 'bg-black/40 border-white/10 text-smash-text-secondary hover:text-white'
            )}
          >
            <Heart size={12} fill={favoritesOnly ? 'currentColor' : 'none'} /> Favorites
          </button>

          <div className="ml-auto w-full sm:w-56">
            <Input
              icon={<Search size={14} />}
              placeholder="Search prompts…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 text-xs"
            />
          </div>
        </div>
      }
    >
      {!activeBrand && !isLoading ? (
        <EmptyState
          icon={Building2}
          title="No brand yet"
          description="Results are filed by brand. Create a brand to start generating."
          actionLabel="Go to Brands"
          onAction={() => navigate('/brands')}
        />
      ) : !visible.length && !isLoading ? (
        <EmptyState
          icon={ImageIcon}
          title={`Nothing for ${activeBrand?.name ?? 'this brand'} yet`}
          description="Generations made while this brand is active — or with one of its personas — show up here."
          actionLabel="Generate"
          onAction={() => navigate('/generate/image')}
        />
      ) : (
        <div className="flex flex-col gap-6 pb-20">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {visible.map((r, index) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index, 12) * 0.02 }}
                className="group glass-2 border border-white/10 rounded-3xl overflow-hidden flex flex-col hover:border-white/20 transition-colors"
              >
                <button
                  onClick={() => open(r)}
                  className="relative aspect-square bg-black/40 overflow-hidden text-left"
                  title="View"
                >
                  {r.contentUrl && !r.mimeType?.startsWith('audio/') ? (
                    r.mimeType?.startsWith('video/') ? (
                      <video src={r.contentUrl} muted loop playsInline className="w-full h-full object-cover" />
                    ) : (
                      <img
                        src={r.contentUrl}
                        alt={r.prompt ?? 'Generated image'}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )
                  ) : r.contentUrl ? (
                    <div className="w-full h-full flex items-center justify-center text-smash-text-tertiary">
                      <AudioLines size={28} />
                    </div>
                  ) : (
                    <div className="w-full h-full p-4 text-xs text-white/80 leading-relaxed whitespace-pre-wrap overflow-hidden">
                      {r.contentText}
                      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/80 to-transparent" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Maximize2 size={20} className="text-white" />
                  </div>
                </button>

                <div className="p-3 flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{r.connection?.name ?? 'Result'}</p>
                      <p className="text-[10px] text-smash-text-tertiary">{relativeTime(r.createdAt)}</p>
                    </div>
                    <button
                      onClick={() => toggleFavorite(r)}
                      title={r.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                      className={cn(
                        'w-7 h-7 rounded-lg flex items-center justify-center transition-colors shrink-0',
                        r.isFavorite ? 'text-rose-400' : 'text-smash-text-tertiary hover:text-rose-300'
                      )}
                    >
                      <Heart size={14} fill={r.isFavorite ? 'currentColor' : 'none'} />
                    </button>
                  </div>

                  {r.context?.personaName && (
                    <span className="self-start flex items-center gap-1 text-[10px] font-bold text-[#D946EF] bg-[#D946EF]/10 px-2 py-0.5 rounded-md max-w-full truncate">
                      <UserRound size={10} className="shrink-0" /> {r.context.personaName}
                    </span>
                  )}

                  <div className="flex items-center gap-1 pt-1 border-t border-white/5">
                    {r.contentUrl && (
                      <button
                        onClick={() => downloadUrl(r.contentUrl!, fileNameFor(titleFor(r), r.contentUrl))}
                        className="flex-1 h-7 rounded-lg text-[10px] font-bold text-smash-text-secondary hover:text-white hover:bg-white/5 flex items-center justify-center gap-1"
                      >
                        <Download size={11} /> Save
                      </button>
                    )}
                    <button
                      onClick={() => remove(r)}
                      className="flex-1 h-7 rounded-lg text-[10px] font-bold text-smash-text-secondary hover:text-rose-300 hover:bg-white/5 flex items-center justify-center gap-1"
                    >
                      <Trash2 size={11} /> Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {(hasMore || isLoading) && (
            <div className="flex justify-center">
              <Button variant="secondary" onClick={() => load((meta?.page ?? 1) + 1)} disabled={isLoading}>
                {isLoading ? <Loader2 size={14} className="animate-spin" /> : 'Load more'}
              </Button>
            </div>
          )}
        </div>
      )}

      <ResultLightbox item={lightbox} onClose={() => setLightbox(null)} />
    </PageContainer>
  );
};
