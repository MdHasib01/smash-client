import React from 'react';
import { X, ExternalLink, Activity, Info, Tag, Layers, RefreshCcw, Copy, Trash2, Heart, Download, Edit3, Send, CheckCircle2, Star, Save } from 'lucide-react';
import { ResultMetadata } from '../../data/mockResults';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { cn } from '../../lib/utils';
import { useToast } from '../../contexts/ToastContext';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle } from '../ui/sheet';
import { Separator } from '../ui/separator';

interface ResultInspectorProps {
  result: ResultMetadata;
  onClose: () => void;
}

export const ResultInspector: React.FC<ResultInspectorProps> = ({ result, onClose }) => {
  const { toast } = useToast();

  const handleSaveToAssets = () => {
    toast('Saved to Assets', `${result.mode} output from ${result.connection.name} saved to active project.`, 'success');
  };

  return (
    <Sheet open onOpenChange={(open) => { if (!open) onClose(); }}>
    <SheetContent
      side="right"
      showCloseButton={false}
      className="w-full sm:max-w-none md:w-[600px] gap-0 p-0"
    >
      <div className="h-16 border-b border-white/5 flex items-center justify-between px-6 shrink-0 bg-black/40">
        <div className="flex items-center gap-3">
          <Badge variant="connection">{result.mode}</Badge>
          <SheetTitle className="text-sm font-bold text-white uppercase tracking-wider">{result.connection.name}</SheetTitle>
          <SheetDescription className="sr-only">Result details</SheetDescription>
        </div>
        <SheetClose asChild>
          <Button variant="icon" size="icon-sm" aria-label="Close">
            <X size={16} />
          </Button>
        </SheetClose>
      </div>

      <div className="flex-1 overflow-y-auto pb-32">
        {/* Content Viewer */}
        <div className={cn(
          "relative w-full bg-black/80 flex items-center justify-center border-b border-white/5",
          (result.mode === 'IMAGE' || result.mode === 'VIDEO') ? "aspect-video" : "min-h-[300px] p-8"
        )}>
          {(result.mode === 'IMAGE' || result.mode === 'VIDEO') ? (
            <img src={result.contentUrl} alt="Result" className="w-full h-full object-contain" />
          ) : (
            <div className="text-base text-white/90 leading-relaxed font-medium text-left w-full h-full overflow-y-auto whitespace-pre-wrap">
              {result.contentText}
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="p-4 border-b border-white/5 bg-white/[0.02] flex gap-2 overflow-x-auto no-scrollbar shrink-0 items-center">
          <Button variant="secondary" size="sm" className="h-8 text-[10px] whitespace-nowrap"><RefreshCcw size={12}/> RETRY</Button>
          <Button variant="secondary" size="sm" className="h-8 text-[10px] whitespace-nowrap"><Edit3 size={12}/> EDIT & RETRY</Button>
          <Button variant="secondary" size="sm" className="h-8 text-[10px] whitespace-nowrap text-[#D946EF] hover:bg-[#D946EF]/10 border-[#D946EF]/20"><Send size={12}/> SEND TO AI</Button>
          <Button variant="secondary" size="sm" className="h-8 text-[10px] whitespace-nowrap" onClick={handleSaveToAssets}><Save size={12}/> SAVE TO ASSETS</Button>
          
          <Separator orientation="vertical" className="h-4! bg-white/10 mx-1" />
          
          <Button variant={result.status === 'APPROVED' ? 'primary' : 'secondary'} size="sm" className={cn("h-8 text-[10px] whitespace-nowrap", result.status === 'APPROVED' && "bg-violet-500 hover:bg-violet-600 text-white border-violet-500")}>
            <CheckCircle2 size={12}/> APPROVE
          </Button>
          <Button variant={result.status === 'SHORTLISTED' ? 'primary' : 'secondary'} size="sm" className={cn("h-8 text-[10px] whitespace-nowrap", result.status === 'SHORTLISTED' && "bg-rose-500 hover:bg-rose-600 text-white border-rose-500")}>
            <Star size={12}/> SHORTLIST
          </Button>

          <Separator orientation="vertical" className="h-4! bg-white/10 mx-1" />

          <Button variant="icon" size="icon-sm" aria-label="Favorite"><Heart size={14} className={result.isFavorite ? "fill-white" : ""} /></Button>
          <Button variant="icon" size="icon-sm" aria-label="Download"><Download size={14}/></Button>
          <Button variant="icon" size="icon-sm" aria-label="Delete" className="hover:text-red-400 hover:bg-red-400/10"><Trash2 size={14}/></Button>
        </div>

        <div className="p-6 flex flex-col gap-8">
          
          {/* AI Judge Result */}
          {result.score && (
            <div className="flex flex-col gap-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-smash-text-tertiary flex items-center gap-1.5">
                <Activity size={12} /> AI Judge Analysis
              </h3>
              <div className="glass-2 p-5 rounded-2xl border border-white/5 flex flex-col gap-6 relative overflow-hidden">
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-[#D946EF] blur-[80px] opacity-20" />
                
                <div className="flex items-center gap-6 z-10">
                  <div className="flex flex-col items-center justify-center shrink-0">
                    <span className={cn(
                      "text-5xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-br",
                      result.score.overall >= 90 ? "from-violet-400 to-violet-600" :
                      result.score.overall >= 80 ? "from-rose-400 to-rose-600" :
                      "from-red-400 to-red-600"
                    )}>{result.score.overall}</span>
                    <span className="text-[9px] uppercase tracking-widest text-smash-text-secondary mt-1">Overall Score</span>
                  </div>
                  <div className="flex-1 flex flex-col gap-2">
                    <p className="text-xs text-white/90 leading-relaxed font-medium">"{result.score.explanation}"</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 z-10">
                  {Object.entries(result.score.criteria).map(([key, val]) => (
                    <div key={key} className="flex justify-between items-center bg-black/20 px-3 py-2 rounded-lg border border-white/5">
                      <span className="text-[10px] text-smash-text-secondary font-medium">{key}</span>
                      <span className="text-xs font-bold text-white">{val}</span>
                    </div>
                  ))}
                </div>

                {result.score.issues.length > 0 && (
                  <div className="flex flex-col gap-2 z-10">
                    <span className="text-[10px] uppercase font-bold text-rose-400">Potential Issues Detected</span>
                    {result.score.issues.map((issue, idx) => (
                      <div key={idx} className="text-xs text-white/80 bg-rose-500/10 px-3 py-2 rounded border border-rose-500/20">{issue}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Master Prompt */}
          <div className="flex flex-col gap-3">
             <h3 className="text-[10px] font-bold uppercase tracking-widest text-smash-text-tertiary flex items-center gap-1.5">
                <Info size={12} /> Master Prompt
             </h3>
             <div className="glass-3 p-4 rounded-xl border border-white/5 text-sm text-white/90 font-medium">
               {result.prompt}
             </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase font-bold text-smash-text-tertiary">Session ID</span>
              <span className="text-xs font-mono text-white/90">{result.sessionId}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase font-bold text-smash-text-tertiary">Duration</span>
              <span className="text-xs font-mono text-white/90">{result.duration.toFixed(2)}s</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase font-bold text-smash-text-tertiary">Generated At</span>
              <span className="text-xs font-mono text-white/90">{new Date(result.timestamp).toLocaleString()}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase font-bold text-smash-text-tertiary">Provider</span>
              <span className="text-xs font-bold text-white/90">{result.connection.provider}</span>
            </div>
          </div>

          {/* Tags */}
          {result.tags.length > 0 && (
            <div className="flex flex-col gap-3">
               <h3 className="text-[10px] font-bold uppercase tracking-widest text-smash-text-tertiary flex items-center gap-1.5">
                  <Tag size={12} /> Tags
               </h3>
               <div className="flex flex-wrap gap-2">
                 {result.tags.map(tag => (
                   <Badge key={tag} variant="outline" className="px-2 py-1 tracking-wider">{tag}</Badge>
                 ))}
                 <Button variant="ghost" size="xs" className="text-[10px]">+ ADD TAG</Button>
               </div>
            </div>
          )}

        </div>
      </div>
    </SheetContent>
    </Sheet>
  );
};
