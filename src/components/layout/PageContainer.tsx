import React from 'react';
import { cn } from '../../lib/utils';
import { useGlobalUI } from '../../contexts/GlobalUIContext';
import { PanelRightOpen } from 'lucide-react';
import { Button } from '../ui/Button';

interface PageContainerProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  primaryAction?: React.ReactNode;
  secondaryToolbar?: React.ReactNode;
  className?: string;
  inspectorContext?: React.ReactNode;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  title,
  description,
  children,
  primaryAction,
  secondaryToolbar,
  className,
  inspectorContext,
}) => {
  const { isInspectorOpen, setInspectorOpen } = useGlobalUI();

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Page Header */}
      <header className="shrink-0 flex items-start justify-between gap-4 pb-6 border-b border-white/5 mb-6">
        <div className="flex flex-col gap-1 max-w-2xl">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white leading-tight">
            {title}
          </h1>
          {description && (
            <p className="text-sm font-medium text-smash-text-secondary">
              {description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {primaryAction}
          {inspectorContext && !isInspectorOpen && (
            <Button 
              variant="icon" 
              onClick={() => setInspectorOpen(true)}
              aria-label="Open inspector"
              className="text-[#D946EF] hover:text-[#D946EF] hover:bg-[#D946EF]/10 hover:border-[#D946EF]/20"
            >
              <PanelRightOpen size={16} />
            </Button>
          )}
        </div>
      </header>

      {/* Secondary Toolbar */}
      {secondaryToolbar && (
        <div className="shrink-0 mb-6 flex items-center max-w-full overflow-x-auto">
          {secondaryToolbar}
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto relative min-h-0">
        {children}
      </div>
    </div>
  );
};
