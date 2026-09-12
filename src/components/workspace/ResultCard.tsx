import React from 'react';
import { Job } from '../../types/execution';
import { Button } from '../ui/Button';
import { Maximize2, Download, RefreshCcw, Edit3, Star, Copy, Send, Check } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';

interface ResultCardProps {
  job: Job;
  mode: string;
  isComparing: boolean;
  isSelectedForCompare: boolean;
  onToggleCompare: (id: string) => void;
  onAction?: (action: string, jobId: string) => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({ job, mode, isComparing, isSelectedForCompare, onToggleCompare, onAction }) => {
  const isImage = mode === 'IMAGE';
  const isText = mode === 'TEXT';
  const isVideo = mode === 'VIDEO';
  const isAudio = mode === 'AUDIO';

  const renderContent = () => {
    if (isImage || isVideo) {
      return (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-magenta-500/20 mix-blend-overlay" />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop')] bg-cover bg-center opacity-80 mix-blend-luminosity" />
          {isVideo && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/40">
                <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-white border-b-[8px] border-b-transparent ml-1" />
              </div>
            </div>
          )}
          {!isComparing && (
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
              <Button variant="icon" className="glass-3 text-white w-10 h-10 hover:bg-[#D946EF]/20 hover:text-[#D946EF]"><Maximize2 size={16}/></Button>
              <Button variant="icon" className="glass-3 text-white w-10 h-10 hover:bg-[#D946EF]/20 hover:text-[#D946EF]"><Download size={16}/></Button>
            </div>
          )}
        </>
      );
    }
    
    if (isAudio) {
      return (
        <div className="w-full p-6 flex flex-col gap-4">
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

    // Default TEXT
    return (
      <div className="text-sm text-white/90 leading-relaxed font-medium whitespace-pre-wrap">
        Based on your prompt, here is the generated response from {job.connection.name}. This represents the text output module perfectly formatting the structured response with markdown support.
      </div>
    );
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "glass-2 rounded-[24px] border transition-all duration-300 flex flex-col overflow-hidden relative group",
        isSelectedForCompare ? "border-[#D946EF] shadow-[0_0_20px_rgba(217,70,239,0.2)]" : "border-white/5",
        isComparing && !isSelectedForCompare && "opacity-50 scale-[0.98]"
      )}
      onClick={() => isComparing && onToggleCompare(job.id)}
    >
      {/* Compare Mode Checkbox Overlay */}
      {isComparing && (
        <div className="absolute top-4 right-4 z-20">
          <div className={cn(
            "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors shadow-lg",
            isSelectedForCompare ? "bg-[#D946EF] border-[#D946EF]" : "bg-black/50 border-white/30 backdrop-blur-md"
          )}>
            {isSelectedForCompare && <Check size={14} className="text-white" />}
          </div>
        </div>
      )}

      {/* Result Display Area */}
      <div className={cn(
        "relative w-full overflow-hidden bg-black/40 flex items-center justify-center",
        isImage || isVideo ? "aspect-square" : isAudio ? "min-h-[120px]" : "min-h-[200px] p-6 items-start justify-start"
      )}>
        {renderContent()}
      </div>

      {/* Metadata & Actions Footer */}
      <div className="p-4 flex flex-col gap-3 glass-1 border-t border-white/5 relative z-10">
        <div className="flex justify-between items-center">
          <div className="flex flex-col gap-0.5">
            <span className="font-bold text-sm text-white flex items-center gap-1.5">
              {job.connection.name}
              {job.attempts.length > 1 && <Badge variant="warning" className="text-[8px] px-1 py-0 h-4">Auto-Fixed</Badge>}
            </span>
            <span className="text-[9px] font-black uppercase tracking-widest text-smash-text-secondary flex items-center gap-1">
              {job.connection.provider} • {job.duration?.toFixed(1)}s
            </span>
          </div>
          <Button variant="icon" size="sm" className="h-7 w-7 text-smash-text-tertiary hover:text-rose-400 hover:bg-rose-400/10">
            <Star size={14} />
          </Button>
        </div>

        {!isComparing && (
          <div className="flex gap-1.5">
            <Button variant="secondary" size="sm" className="h-7 px-2 text-[9px] flex-1">
              <Copy size={10} className="mr-1.5" /> {(isImage || isVideo || isAudio) ? 'COPY URL' : 'COPY'}
            </Button>
            <Button variant="secondary" size="sm" className="h-7 px-2 text-[9px] flex-1" onClick={() => onAction && onAction('RETRY', job.id)}>
              <RefreshCcw size={10} className="mr-1.5" /> RETRY
            </Button>
            {(isImage || isVideo || isAudio) && (
              <Button variant="secondary" size="sm" className="h-7 px-2 text-[9px] flex-1 text-[#D946EF] hover:bg-[#D946EF]/10 border-[#D946EF]/20" onClick={() => onAction && onAction('USE_REF', job.id)}>
                <Send size={10} className="mr-1.5" /> USE REF
              </Button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};
