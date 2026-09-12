import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, SplitSquareHorizontal, Download, Copy, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

interface CompareWorkspaceProps {
  jobs: any[]; // Using any to accommodate both Job from LiveExecution and ResultMetadata from Results gallery
  mode: string;
  onClose: () => void;
}

export const CompareWorkspace: React.FC<CompareWorkspaceProps> = ({ jobs, mode, onClose }) => {
  const isImage = mode === 'IMAGE';
  const isVideo = mode === 'VIDEO';
  const isAudio = mode === 'AUDIO';
  const [activeMobileTab, setActiveMobileTab] = useState(0);

  const renderContent = (job: any) => {
    if (isImage || isVideo) {
      return (
        <div className="w-full h-full relative">
           <img 
             src={job.contentUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop'} 
             alt="Generated" 
             className="absolute inset-0 w-full h-full object-cover mix-blend-luminosity hover:mix-blend-normal transition-all" 
           />
           <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-magenta-500/20 mix-blend-overlay pointer-events-none" />
           {isVideo && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/40">
                <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-white border-b-[8px] border-b-transparent ml-1" />
              </div>
            </div>
          )}
        </div>
      );
    }
    
    if (isAudio) {
      return (
        <div className="w-full h-full p-6 flex flex-col justify-center gap-4">
          <div className="flex items-center gap-4 w-full">
            <Button variant="icon" className="glass-3 text-white w-12 h-12 shrink-0 rounded-full hover:bg-[#D946EF]/20 hover:text-[#D946EF] border border-white/10">
               <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent ml-1" />
            </Button>
            <div className="flex-1 h-8 flex items-center gap-1 opacity-60">
              {/* Mock Waveform */}
              {Array.from({ length: 30 }).map((_, i) => (
                <div key={i} className="flex-1 bg-white/40 rounded-full" style={{ height: `${Math.max(10, Math.random() * 100)}%` }} />
              ))}
            </div>
          </div>
          <div className="text-xs font-bold text-white/50 tracking-widest text-right">0:00 / 0:14</div>
        </div>
      );
    }

    return (
      <div className="text-sm text-white/90 leading-relaxed font-medium whitespace-pre-wrap">
        {job.contentText || "Based on your prompt, here is the generated response. This represents the text output module perfectly formatting the structured response."}
      </div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed inset-0 z-[200] glass-1 backdrop-blur-3xl flex flex-col bg-black/60"
    >
      <div className="h-16 border-b border-white/5 flex items-center justify-between px-6 shrink-0 bg-black/40">
        <div className="flex items-center gap-3">
          <SplitSquareHorizontal size={20} className="text-[#D946EF]" />
          <h2 className="text-lg font-black text-white tracking-tight">Compare {jobs.length} Results</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" className="hidden md:flex h-8 text-[10px]">SAVE SELECTION</Button>
          <Button variant="icon" onClick={onClose} className="w-8 h-8 glass-3 text-smash-text-secondary hover:text-white">
            <X size={16} />
          </Button>
        </div>
      </div>

      {/* Mobile Tab Selector */}
      <div className="md:hidden flex overflow-x-auto no-scrollbar border-b border-white/5 p-2 gap-2 bg-black/40 shrink-0">
        {jobs.map((job, idx) => (
          <button
            key={job.id}
            onClick={() => setActiveMobileTab(idx)}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all",
              activeMobileTab === idx ? "bg-white/10 text-white border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]" : "text-smash-text-secondary border border-transparent"
            )}
          >
            {job.connection.name}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-hidden p-4 md:p-6 flex flex-col">
        {/* Desktop Grid Layout */}
        <div className={cn(
          "hidden md:grid h-full gap-4",
          jobs.length === 2 ? "grid-cols-2" : jobs.length === 3 ? "grid-cols-3" : "grid-cols-2 lg:grid-cols-4"
        )}>
          {jobs.map((job) => (
            <div key={job.id} className="glass-2 rounded-2xl border border-white/10 flex flex-col overflow-hidden h-full shadow-2xl relative">
              <div className="p-3 border-b border-white/5 flex justify-between items-center bg-black/40 shrink-0 z-10">
                <span className="font-bold text-sm text-white truncate">{job.connection.name}</span>
                <span className="text-[9px] font-black uppercase text-smash-text-tertiary tracking-widest">{job.connection.provider}</span>
              </div>
              
              <div className={cn(
                "flex-1 overflow-y-auto relative bg-black/40",
                (isImage || isVideo) ? "flex items-center justify-center" : isAudio ? "min-h-[120px]" : "p-6"
              )}>
                {renderContent(job)}
              </div>
              
              <div className="p-3 border-t border-white/5 flex gap-2 shrink-0 glass-1 z-10">
                <Button variant="secondary" size="sm" className="flex-1 h-8 text-[10px]"><Copy size={12} className="mr-1.5"/> COPY</Button>
                {(isImage || isVideo || isAudio) && <Button variant="secondary" size="sm" className="flex-1 h-8 text-[10px]"><Download size={12} className="mr-1.5"/> SAVE</Button>}
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Tabbed Layout */}
        <div className="md:hidden flex-1 flex flex-col h-full relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeMobileTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="glass-2 rounded-2xl border border-white/10 flex flex-col overflow-hidden h-full shadow-2xl relative w-full"
            >
               <div className="p-3 border-b border-white/5 flex justify-between items-center bg-black/40 shrink-0 z-10">
                <span className="font-bold text-sm text-white truncate">{jobs[activeMobileTab]?.connection.name}</span>
                <span className="text-[9px] font-black uppercase text-smash-text-tertiary tracking-widest">{jobs[activeMobileTab]?.connection.provider}</span>
              </div>
              
              <div className={cn(
                "flex-1 overflow-y-auto relative bg-black/40",
                (isImage || isVideo) ? "flex items-center justify-center" : isAudio ? "min-h-[120px]" : "p-6"
              )}>
                {renderContent(jobs[activeMobileTab])}
              </div>
              
              <div className="p-3 border-t border-white/5 flex gap-2 shrink-0 glass-1 z-10">
                <Button variant="secondary" size="sm" className="flex-1 h-10 text-xs"><Copy size={14} className="mr-1.5"/> COPY</Button>
                {(isImage || isVideo || isAudio) && <Button variant="secondary" size="sm" className="flex-1 h-10 text-xs"><Download size={14} className="mr-1.5"/> SAVE</Button>}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};
