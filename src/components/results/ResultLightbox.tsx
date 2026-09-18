import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../ui/dialog';
import { Badge } from '../ui/Badge';
import { X, Download, ExternalLink, Copy } from 'lucide-react';
import { Button } from '../ui/Button';
import { copyText, downloadUrl, fileNameFor } from '../../lib/download';
import { useToast } from '../../contexts/ToastContext';

export interface LightboxItem {
  url?: string;
  text?: string;
  mimeType?: string;
  title: string;
  subtitle?: string;
  prompt?: string;
  chips?: string[];
}

interface ResultLightboxProps {
  item: LightboxItem | null;
  onClose: () => void;
}

/** Full-screen view of one result: the image at full size, or the full text. */
export const ResultLightbox: React.FC<ResultLightboxProps> = ({ item, onClose }) => {
  const { addToast } = useToast();

  const isVideo = item?.mimeType?.startsWith('video/');
  const isAudio = item?.mimeType?.startsWith('audio/');

  const copy = async () => {
    const value = item?.url ?? item?.text ?? '';
    addToast((await copyText(value)) ? 'Copied to clipboard' : 'Could not copy', 'INFO');
  };

  return (
    <Dialog open={!!item} onOpenChange={(open) => { if (!open) onClose(); }}>
      {item && (
        <DialogContent
          showCloseButton={false}
          aria-describedby={undefined}
          className="inset-0 top-0 left-0 translate-x-0 translate-y-0 w-screen max-w-none sm:max-w-none h-dvh rounded-none border-0 p-0 gap-0 flex flex-col bg-black/90 backdrop-blur-xl shadow-none"
          onClick={onClose}
        >
          <div
            className="flex items-start justify-between gap-4 p-4 md:p-6 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="min-w-0">
              <DialogTitle className="text-sm font-bold text-white truncate">{item.title}</DialogTitle>
              {item.subtitle && <DialogDescription className="text-xs text-smash-text-secondary truncate">{item.subtitle}</DialogDescription>}
              {item.chips?.length ? (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {item.chips.map((chip) => (
                    <Badge key={chip} variant="outline" className="tracking-widest">
                      {chip}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="secondary" size="sm" onClick={copy}>
                <Copy size={13} /> {item.url ? 'Copy URL' : 'Copy'}
              </Button>
              {item.url && (
                <>
                  <Button variant="secondary" size="sm" onClick={() => window.open(item.url, '_blank', 'noopener')}>
                    <ExternalLink size={13} /> Open
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => downloadUrl(item.url!, fileNameFor(item.title, item.url))}
                  >
                    <Download size={13} /> Download
                  </Button>
                </>
              )}
              <Button variant="icon" size="icon-sm" onClick={onClose} className="size-9" title="Close (Esc)" aria-label="Close">
                <X size={16} />
              </Button>
            </div>
          </div>

          <div className="flex-1 min-h-0 flex items-center justify-center px-4 md:px-10 pb-4">
            <div className="max-w-full max-h-full" onClick={(e) => e.stopPropagation()}>
              {item.url && isVideo && <video src={item.url} controls autoPlay className="max-h-[75vh] rounded-2xl" />}
              {item.url && isAudio && <audio src={item.url} controls autoPlay className="w-[min(90vw,480px)]" />}
              {item.url && !isVideo && !isAudio && (
                <img
                  src={item.url}
                  alt={item.title}
                  className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl shadow-black"
                />
              )}
              {!item.url && item.text && (
                <div className="w-[min(92vw,820px)] max-h-[75vh] overflow-y-auto glass-2 border border-white/10 rounded-2xl p-6 md:p-8 text-sm md:text-base leading-relaxed text-white/90 whitespace-pre-wrap break-words">
                  {item.text}
                </div>
              )}
            </div>
          </div>

          {item.prompt && (
            <div className="shrink-0 px-4 md:px-10 pb-6" onClick={(e) => e.stopPropagation()}>
              <p className="mx-auto max-w-3xl text-xs text-smash-text-secondary line-clamp-3 text-center">
                <span className="font-bold text-white/70">Prompt: </span>
                {item.prompt}
              </p>
            </div>
          )}
        </DialogContent>
      )}
    </Dialog>
  );
};
