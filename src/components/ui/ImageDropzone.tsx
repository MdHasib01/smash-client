import * as React from 'react';
import { UploadCloud, ImagePlus } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export interface ImageDropzoneProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  onSelect: (files: File[]) => void;
  multiple?: boolean;
  accept?: string;
  disabled?: boolean;
  label?: string;
  hint?: string;
  compact?: boolean;
}

/**
 * Click-or-drop file picker. The app's only file input, so it owns the
 * drag-state and the hidden <input> plumbing.
 */
export const ImageDropzone = React.forwardRef<HTMLDivElement, ImageDropzoneProps>(
  (
    {
      className,
      onSelect,
      multiple = true,
      accept = 'image/*',
      disabled,
      label = 'Drop images here',
      hint = 'PNG, JPG or WebP — click to browse',
      compact = false,
      ...props
    },
    ref
  ) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = React.useState(false);

    const emit = (fileList: FileList | null) => {
      const files = Array.from(fileList ?? []).filter((f) => f.type.startsWith('image/'));
      if (files.length) onSelect(multiple ? files : files.slice(0, 1));
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;
      emit(e.dataTransfer.files);
    };

    return (
      <div
        ref={ref}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed text-center transition-all duration-300 cursor-pointer',
          compact ? 'p-4' : 'p-8',
          isDragging
            ? 'border-[#D946EF] bg-[#D946EF]/10 text-white'
            : 'border-white/15 bg-white/[0.02] text-smash-text-secondary hover:border-white/30 hover:bg-white/5 hover:text-white',
          disabled && 'opacity-50 pointer-events-none',
          className
        )}
        {...props}
      >
        {compact ? <ImagePlus size={18} /> : <UploadCloud size={24} />}
        <span className={cn('font-bold', compact ? 'text-xs' : 'text-sm')}>{label}</span>
        {!compact && <span className="text-[11px] text-smash-text-tertiary">{hint}</span>}

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          className="hidden"
          onChange={(e) => {
            emit(e.target.files);
            // Allow re-selecting the same file immediately after.
            e.target.value = '';
          }}
        />
      </div>
    );
  }
);
ImageDropzone.displayName = 'ImageDropzone';
