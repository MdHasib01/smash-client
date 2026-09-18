import React, { useState } from 'react';
import { Job } from '../../types/execution';
import { Button } from '../ui/Button';
import { Maximize2, Download, RefreshCcw, Copy, Send, Check, ExternalLink, Bot, UserRound, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';
import { ResultLightbox, LightboxItem } from '../results/ResultLightbox';
import { copyText, downloadUrl, fileNameFor } from '../../lib/download';
import { useToast } from '../../contexts/ToastContext';
import { Badge } from '../ui/Badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

interface ResultCardProps {
  job: Job;
  mode: string;
  isComparing: boolean;
  isSelectedForCompare: boolean;
  onToggleCompare: (id: string) => void;
  onAction?: (action: string, jobId: string) => void;
  prompt?: string;
}

/** One finished job on the live execution screen, showing its real output. */
export const ResultCard: React.FC<ResultCardProps> = ({
  job,
  mode,
  isComparing,
  isSelectedForCompare,
  onToggleCompare,
  onAction,
  prompt,
}) => {
  const { addToast } = useToast();
  const [lightbox, setLightbox] = useState<LightboxItem | null>(null);
  const [imageFailed, setImageFailed] = useState(false);

  const url = job.resultUrl;
  const text = job.contentText;
  const mime = job.mimeType ?? '';
  const isVideo = mime.startsWith('video/');
  const isAudio = mime.startsWith('audio/') || mode === 'AUDIO';
  const isVisual = Boolean(url) && !isAudio;
  // The output arrives one poll after the job flips to COMPLETE.
  const isPending = !url && !text;

  const agentLine = job.target?.cli ? `${job.target.cli}${job.target.model ? ` · ${job.target.model}` : ''}` : null;
  const title = `${job.personaName ? `${job.personaName} — ` : ''}${job.connection.name}`;

  const openLightbox = () =>
    setLightbox({
      url,
      text: url ? undefined : text,
      mimeType: mime,
      title,
      subtitle: [job.connection.provider, agentLine, job.duration ? `${job.duration.toFixed(1)}s` : null]
        .filter(Boolean)
        .join(' · '),
      prompt,
      chips: [job.personaName, job.styleName].filter(Boolean) as string[],
    });

  const copy = async () => {
    const ok = await copyText(url ?? text ?? '');
    addToast(ok ? (url ? 'Image URL copied' : 'Text copied') : 'Could not copy', ok ? 'SUCCESS' : 'ERROR');
  };

  const renderContent = () => {
    if (isPending) {
      return (
        <div className="flex flex-col items-center gap-2 text-smash-text-tertiary">
          <Loader2 size={20} className="animate-spin" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Loading output…</span>
        </div>
      );
    }

    if (isAudio && url) {
      return (
        <div className="w-full p-6">
          <audio src={url} controls className="w-full" />
        </div>
      );
    }

    if (isVisual) {
      if (imageFailed) {
        return (
          <div className="flex flex-col items-center gap-2 text-center p-6 text-smash-text-tertiary">
            <span className="text-xs">The output could not be displayed.</span>
            <a href={url} target="_blank" rel="noopener" className="text-xs text-[#D946EF] hover:underline">
              Open it directly
            </a>
          </div>
        );
      }
      return (
        <>
          {/* Blurred copy fills the frame behind a non-square image. */}
          {!isVideo && (
            <img src={url} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-110" />
          )}
          {isVideo ? (
            <video src={url} className="relative w-full h-full object-contain" muted loop playsInline autoPlay />
          ) : (
            <img
              src={url}
              alt={prompt ?? 'Generated image'}
              loading="lazy"
              onError={() => setImageFailed(true)}
              className="relative w-full h-full object-contain"
            />
          )}
          {!isComparing && (
            <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="icon" size="icon" aria-label="View full size" onClick={openLightbox} className="text-white hover:text-[#D946EF]">
                    <Maximize2 size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>View full size</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="icon"
                    size="icon"
                    aria-label="Download"
                    onClick={() => downloadUrl(url!, fileNameFor(title, url))}
                    className="text-white hover:text-[#D946EF]"
                  >
                    <Download size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Download</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="icon"
                    size="icon"
                    aria-label="Open in a new tab"
                    onClick={() => window.open(url, '_blank', 'noopener')}
                    className="text-white hover:text-[#D946EF]"
                  >
                    <ExternalLink size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Open in a new tab</TooltipContent>
              </Tooltip>
            </div>
          )}
        </>
      );
    }

    // Text output.
    return (
      <div className="relative w-full h-full">
        <div className="text-sm text-white/90 leading-relaxed whitespace-pre-wrap break-words max-h-72 overflow-y-auto pr-1">
          {text}
        </div>
        {!isComparing && (text?.length ?? 0) > 400 && (
          <button
            onClick={openLightbox}
            className="mt-3 text-[10px] font-bold uppercase tracking-widest text-[#D946EF] hover:underline"
          >
            Read full response
          </button>
        )}
      </div>
    );
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          'glass-2 rounded-2xl border transition-all duration-300 flex flex-col overflow-hidden relative group',
          isSelectedForCompare ? 'border-[#D946EF] shadow-[0_0_20px_rgba(217,70,239,0.2)]' : 'border-white/5',
          isComparing && !isSelectedForCompare && 'opacity-50 scale-[0.98]'
        )}
        onClick={() => isComparing && onToggleCompare(job.id)}
      >
        {isComparing && (
          <div className="absolute top-4 right-4 z-20">
            <div
              className={cn(
                'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors shadow-lg',
                isSelectedForCompare ? 'bg-[#D946EF] border-[#D946EF]' : 'bg-black/50 border-white/30 backdrop-blur-md'
              )}
            >
              {isSelectedForCompare && <Check size={14} className="text-white" />}
            </div>
          </div>
        )}

        <div
          className={cn(
            'relative w-full overflow-hidden bg-black/40 flex items-center justify-center',
            isVisual || (isPending && mode !== 'TEXT') ? 'aspect-square' : isAudio ? 'min-h-[120px]' : 'min-h-[200px] p-6 items-start justify-start'
          )}
        >
          {renderContent()}
        </div>

        <div className="p-4 flex flex-col gap-3 bg-black/30 backdrop-blur-md border-t border-white/5 relative z-10">
          <div className="flex flex-col gap-1 min-w-0">
            <span className="font-bold text-sm text-white flex items-center gap-1.5 min-w-0">
              <span className="truncate">{job.connection.name}</span>
              {job.attempts.length > 1 && (
                <Badge variant="warning" className="shrink-0 text-[8px] tracking-widest px-1.5">
                  Auto-fixed
                </Badge>
              )}
            </span>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[9px] font-bold uppercase tracking-widest text-smash-text-secondary">
              <span>{job.connection.provider}</span>
              {agentLine && (
                <span className="flex items-center gap-1 text-violet-300">
                  <Bot size={10} /> {agentLine}
                </span>
              )}
              {job.duration != null && <span>{job.duration.toFixed(1)}s</span>}
              {job.personaName && (
                <span className="flex items-center gap-1 text-[#D946EF]">
                  <UserRound size={10} /> {job.personaName}
                </span>
              )}
            </div>
          </div>

          {!isComparing && !isPending && (
            <div className="flex gap-1.5">
              <Button variant="secondary" size="sm" className="h-7 px-2 gap-1 text-[9px] flex-1" onClick={copy}>
                <Copy size={10} /> {url ? 'COPY URL' : 'COPY'}
              </Button>
              {url ? (
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-7 px-2 gap-1 text-[9px] flex-1"
                  onClick={() => downloadUrl(url, fileNameFor(title, url))}
                >
                  <Download size={10} /> SAVE
                </Button>
              ) : (
                <Button variant="secondary" size="sm" className="h-7 px-2 gap-1 text-[9px] flex-1" onClick={openLightbox}>
                  <Maximize2 size={10} /> VIEW
                </Button>
              )}
              <Button
                variant="secondary"
                size="sm"
                className="h-7 px-2 gap-1 text-[9px] flex-1"
                onClick={() => onAction && onAction('RETRY', job.id)}
              >
                <RefreshCcw size={10} /> RETRY
              </Button>
              {url && !isAudio && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-7 px-2 gap-1 text-[9px] flex-1 text-[#D946EF] hover:bg-[#D946EF]/10 border-[#D946EF]/20"
                  onClick={() => onAction && onAction('USE_REF', job.id)}
                >
                  <Send size={10} /> USE REF
                </Button>
              )}
            </div>
          )}
        </div>
      </motion.div>

      <ResultLightbox item={lightbox} onClose={() => setLightbox(null)} />
    </>
  );
};
