import React, { useState, useEffect } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { MOCK_RESULTS, ResultMetadata } from '../data/mockResults';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { cn } from '../lib/utils';
import { Search, Filter, SlidersHorizontal, Trash2, Download, Maximize2, SplitSquareHorizontal, CheckCircle2, Star, Image as ImageIcon, Video, Type, AudioLines, Heart, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CompareWorkspace } from '../components/workspace/CompareWorkspace';
import { ResultInspector } from '../components/workspace/ResultInspector';
import { useExecution } from '../contexts/ExecutionContext';

export const Results: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'ALL' | 'IMAGE' | 'VIDEO' | 'TEXT' | 'AUDIO'>('ALL');
  const [search, setSearch] = useState('');
  
  return (
    <PageContainer
      title="Results"
      description="Compare every AI output from one workspace."
    >
      <div className="flex flex-col h-full gap-6">
        
        {/* Toolbar */}
        <div className="glass-2 border border-white/5 p-4 rounded-2xl flex flex-wrap gap-4 items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            {(['ALL', 'IMAGE', 'VIDEO', 'TEXT', 'AUDIO'] as const).map(mode => (
              <Button
                key={mode}
                variant={activeMode === mode ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setActiveMode(mode)}
                className="text-[10px]"
              >
                {mode === 'IMAGE' && <ImageIcon size={12} className="mr-1.5" />}
                {mode === 'VIDEO' && <Video size={12} className="mr-1.5" />}
                {mode === 'TEXT' && <Type size={12} className="mr-1.5" />}
                {mode === 'AUDIO' && <AudioLines size={12} className="mr-1.5" />}
                {mode}
              </Button>
            ))}
          </div>
          
          <div className="flex items-center gap-3">
             <div className="relative">
               <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-smash-text-secondary" />
               <input 
                 type="text" 
                 placeholder="Search results..."
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 className="bg-black/20 border border-white/10 rounded-lg pl-9 pr-4 py-1.5 text-sm text-white placeholder:text-smash-text-secondary focus:outline-none focus:border-[#D946EF]/50 transition-colors w-48 focus:w-64"
               />
             </div>
             <Button variant="secondary" size="icon"><Filter size={14} /></Button>
             <Button variant="secondary" size="icon"><SlidersHorizontal size={14} /></Button>
          </div>
        </div>

        {/* Gallery */}
        <div className="flex-1 overflow-y-auto">
          <GalleryGrid 
            mode={activeMode} 
            search={search}
          />
        </div>

      </div>
    </PageContainer>
  );
};

const GalleryGrid: React.FC<{ mode: string, search: string }> = ({ mode, search }) => {
  const { currentSession } = useExecution();
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [inspectedResultId, setInspectedResultId] = useState<string | null>(null);
  const [results, setResults] = useState<ResultMetadata[]>(MOCK_RESULTS);
  const [isJudging, setIsJudging] = useState(false);

  // Sync completed jobs from active session into results
  useEffect(() => {
    if (currentSession) {
      const completedJobs = currentSession.jobs.filter(j => j.status === 'COMPLETE');
      
      const newResults: ResultMetadata[] = completedJobs.map(job => {
        const isImage = currentSession.mode === 'IMAGE' || currentSession.mode === 'VIDEO';
        return {
          id: job.id,
          jobId: job.id,
          sessionId: currentSession.id,
          mode: currentSession.mode as any,
          connection: job.connection,
          prompt: currentSession.prompt,
          duration: job.duration || 0,
          timestamp: Date.now(),
          tags: [],
          status: 'NONE',
          isFavorite: false,
          contentUrl: isImage ? 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop' : undefined,
          contentText: !isImage ? `Based on your prompt, here is the generated response from ${job.connection.name}. This represents the text output module perfectly formatting the structured response with markdown support.` : undefined
        };
      });

      setResults(prev => {
        // Merge without duplicates based on ID
        const existingIds = new Set(prev.map(r => r.id));
        const filteredNew = newResults.filter(nr => !existingIds.has(nr.id));
        
        // Update existing ones (in case duration changes, etc, though COMPLETE usually doesn't change)
        const updatedPrev = prev.map(p => {
          const matchingNew = newResults.find(nr => nr.id === p.id);
          return matchingNew ? { ...p, ...matchingNew, status: p.status, isFavorite: p.isFavorite } : p;
        });

        return [...filteredNew, ...updatedPrev].sort((a, b) => b.timestamp - a.timestamp);
      });
    }
  }, [currentSession]);

  const filtered = results.filter(r => 
    (mode === 'ALL' || r.mode === mode) &&
    (r.prompt.toLowerCase().includes(search.toLowerCase()) || r.connection.name.toLowerCase().includes(search.toLowerCase()))
  );

  const handleToggleCompare = (id: string) => {
    setCompareIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleAction = (action: string, id: string) => {
    if (action === 'TOGGLE_FAV') {
      setResults(prev => prev.map(r => r.id === id ? { ...r, isFavorite: !r.isFavorite } : r));
    } else if (action === 'INSPECT') {
      setInspectedResultId(id);
    }
  };

  const handleAIJudge = () => {
    setIsJudging(true);
    setTimeout(() => {
      setIsJudging(false);
      setResults(prev => prev.map(r => {
        if (compareIds.includes(r.id) && !r.score) {
           return {
             ...r,
             score: {
               overall: Math.floor(Math.random() * 30) + 70,
               criteria: { 'Adherence': 80, 'Quality': 85 },
               explanation: 'AI Judge automatically evaluated this result.',
               issues: []
             }
           };
        }
        return r;
      }));
    }, 2000);
  };

  const inspectedResult = results.find(r => r.id === inspectedResultId) || null;

  return (
    <div className="relative">
      <div className={cn(
        "grid gap-6 pb-32",
        mode === 'IMAGE' || mode === 'VIDEO' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4" : 
        mode === 'TEXT' ? "grid-cols-1 lg:grid-cols-2" :
        "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
      )}>
        <AnimatePresence>
          {filtered.map(result => (
            <GalleryCard 
              key={result.id} 
              result={result} 
              isComparing={compareIds.length > 0}
              isSelected={compareIds.includes(result.id)}
              onToggleCompare={handleToggleCompare}
              onAction={handleAction}
            />
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {compareIds.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 z-40 glass-1 border border-white/10 rounded-2xl px-6 py-4 shadow-2xl flex flex-col md:flex-row items-center gap-6 bg-black/60 backdrop-blur-3xl w-[90%] md:w-auto"
          >
            <span className="text-sm font-black text-white">{compareIds.length} Selected</span>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setCompareIds([])}>CANCEL</Button>
              <Button variant="secondary" size="sm" onClick={handleAIJudge} disabled={isJudging}>
                {isJudging ? (
                  <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full border-2 border-[#D946EF] border-t-transparent animate-spin" /> JUDGING...</span>
                ) : (
                  <><Activity size={14} className="mr-2 text-violet-400" /> AI JUDGE</>
                )}
              </Button>
              <Button variant="primary" size="sm" disabled={compareIds.length < 2 || isJudging} onClick={() => setShowCompare(true)}>
                <SplitSquareHorizontal size={14} className="mr-2" /> COMPARE
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCompare && (
          <CompareWorkspace 
            jobs={filtered.filter(r => compareIds.includes(r.id)).map(r => ({ ...r, connection: r.connection })) as any} 
            mode={filtered.find(r => compareIds.includes(r.id))?.mode || 'IMAGE'}
            onClose={() => setShowCompare(false)} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {inspectedResult && (
          <ResultInspector 
            result={inspectedResult}
            onClose={() => setInspectedResultId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const GalleryCard: React.FC<{ result: ResultMetadata, isComparing: boolean, isSelected: boolean, onToggleCompare: (id: string) => void, onAction: (a: string, id: string) => void }> = ({ result, isComparing, isSelected, onToggleCompare, onAction }) => {
  
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onClick={() => isComparing ? onToggleCompare(result.id) : onAction('INSPECT', result.id)}
      className={cn(
        "glass-2 rounded-2xl border transition-all duration-300 flex flex-col overflow-hidden relative group cursor-pointer",
        isSelected ? "border-[#D946EF] shadow-[0_0_20px_rgba(217,70,239,0.2)]" : "border-white/5 hover:border-white/20 hover:bg-white/[0.03]",
        isComparing && !isSelected && "opacity-50 scale-[0.98]"
      )}
    >
      {/* Selection overlay */}
      {(isComparing || isSelected) && (
        <div className="absolute top-4 left-4 z-20">
          <div className={cn(
            "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors shadow-lg cursor-pointer",
            isSelected ? "bg-[#D946EF] border-[#D946EF]" : "bg-black/50 border-white/30 backdrop-blur-md"
          )} onClick={(e) => { e.stopPropagation(); onToggleCompare(result.id); }}>
            {isSelected && <CheckCircle2 size={14} className="text-white" />}
          </div>
        </div>
      )}

      {/* Score Badge */}
      {result.score && !isComparing && (
        <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
          <Badge variant={result.score.overall >= 90 ? 'success' : result.score.overall >= 80 ? 'warning' : 'danger'} className="px-2 py-1 flex items-center gap-1 shadow-lg bg-black/80 backdrop-blur-md border-white/10">
            <span className="text-[10px] uppercase font-black tracking-widest text-white/50">AI Score</span>
            <span className="text-sm font-black">{result.score.overall}</span>
          </Badge>
        </div>
      )}

      {/* Content Area */}
      <div className={cn(
        "relative w-full overflow-hidden bg-black/40 flex items-center justify-center min-h-[240px]",
        result.mode === 'IMAGE' || result.mode === 'VIDEO' ? "aspect-square" : "p-6 items-start justify-start"
      )}>
        {result.mode === 'IMAGE' || result.mode === 'VIDEO' ? (
          <>
            <img src={result.contentUrl} alt="Result" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 opacity-0 group-hover:opacity-100 transition-opacity" />
          </>
        ) : (
          <div className="text-sm text-white/90 leading-relaxed font-medium line-clamp-6 text-left w-full relative z-10">
            {result.contentText}
          </div>
        )}

        {/* Hover Actions */}
        {!isComparing && (
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px] bg-black/40 z-20">
            <Button variant="icon" className="glass-3 text-white w-10 h-10 hover:bg-[#D946EF]/20 hover:text-[#D946EF] shadow-xl" onClick={(e) => { e.stopPropagation(); onAction('INSPECT', result.id); }}><Maximize2 size={16}/></Button>
            <Button variant="icon" className="glass-3 text-white w-10 h-10 hover:bg-violet-400/20 hover:text-violet-400 shadow-xl" onClick={(e) => { e.stopPropagation(); onAction('TOGGLE_FAV', result.id); }}>
              <Heart size={16} fill={result.isFavorite ? 'currentColor' : 'none'} />
            </Button>
            <Button variant="icon" className="glass-3 text-white w-10 h-10 hover:bg-white/20 hover:text-white shadow-xl" onClick={(e) => { e.stopPropagation(); onToggleCompare(result.id); }}><SplitSquareHorizontal size={16}/></Button>
          </div>
        )}
      </div>

      {/* Metadata Footer */}
      <div className="p-4 flex flex-col gap-3 glass-1 border-t border-white/5 relative z-10 shrink-0">
        <div className="flex flex-col gap-1">
          <span className="font-bold text-sm text-white truncate flex items-center justify-between">
            {result.connection.name}
            {result.status === 'APPROVED' && <CheckCircle2 size={14} className="text-violet-400" />}
            {result.status === 'SHORTLISTED' && <Star size={14} className="text-rose-400 fill-rose-400" />}
          </span>
          <div className="flex justify-between items-center">
             <span className="text-[10px] font-black uppercase tracking-widest text-smash-text-secondary flex items-center gap-1">
               {result.connection.provider} • {result.duration.toFixed(1)}s
             </span>
             <span className="text-[10px] text-smash-text-tertiary">
               {new Date(result.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
             </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
