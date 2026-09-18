import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGlobalUI } from '../../contexts/GlobalUIContext';
import { X, SlidersHorizontal, Info } from 'lucide-react';
import { Button } from '../ui/Button';

export const RightInspector: React.FC = () => {
  const { isInspectorOpen, setInspectorOpen, inspectorContent, inspectorTitle } = useGlobalUI();

  return (
    <AnimatePresence>
      {isInspectorOpen && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 340, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="h-full shrink-0 glass-1 border-y-0 border-r-0 border-l border-white/5 flex flex-col overflow-hidden relative z-20"
        >
          <div className="w-[340px] h-full flex flex-col">
            <div className="h-14 border-b border-white/5 flex items-center justify-between px-4 shrink-0 bg-white/[0.02]">
              <div className="flex items-center gap-2 text-white">
                <SlidersHorizontal size={14} className="text-[#D946EF]" />
                <span className="font-bold tracking-wide text-xs uppercase">{inspectorTitle}</span>
              </div>
              <Button
                variant="icon"
                size="icon-xs"
                onClick={() => setInspectorOpen(false)}
                aria-label="Close inspector"
              >
                <X size={14} />
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
              {inspectorContent || (
                <div className="flex flex-col items-center justify-center h-full text-center opacity-50 gap-3">
                  <Info size={24} />
                  <p className="text-xs font-bold max-w-[200px]">Select an item to view its configuration and metadata here.</p>
                </div>
              )}
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};
