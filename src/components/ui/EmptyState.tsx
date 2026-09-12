import React from 'react';
import { Button } from './Button';
import { cn } from '../../lib/utils';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description, actionLabel, onAction, className }) => {
  return (
    <div className={cn("flex flex-col items-center justify-center p-12 text-center h-full min-h-[400px] glass-1 border border-white/5 rounded-3xl", className)}>
      <div className="w-20 h-20 rounded-full glass-2 flex items-center justify-center mb-6 border border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
        <Icon size={32} className="text-smash-text-secondary" />
      </div>
      <h3 className="text-lg font-black text-white mb-2">{title}</h3>
      <p className="text-sm text-smash-text-secondary max-w-sm leading-relaxed mb-8">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
