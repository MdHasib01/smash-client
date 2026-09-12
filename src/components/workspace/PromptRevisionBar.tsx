import React from 'react';
import { Button } from '../ui/Button';
import { Send, Sparkles, History } from 'lucide-react';
import { motion } from 'motion/react';

interface PromptRevisionBarProps {
  onRevise: (prompt: string) => void;
}

export const PromptRevisionBar: React.FC<PromptRevisionBarProps> = ({ onRevise }) => {
  const [revision, setRevision] = React.useState('');

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky bottom-6 mt-8 max-w-4xl mx-auto w-full z-30"
    >
      <div className="glass-1 backdrop-blur-xl border border-white/10 p-2 rounded-2xl shadow-2xl shadow-black/80 flex items-center gap-2">
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
          <History size={18} className="text-smash-text-secondary" />
        </div>
        <input 
          type="text"
          value={revision}
          onChange={(e) => setRevision(e.target.value)}
          placeholder="Tell SMASH what to change (e.g., Mother face same রাখো, background আরও premium করো)..."
          className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-white placeholder:text-smash-text-tertiary px-2"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && revision.trim()) {
              onRevise(revision);
              setRevision('');
            }
          }}
        />
        <Button 
          variant="primary" 
          size="sm" 
          className="h-10 px-4 rounded-xl font-bold tracking-tight"
          disabled={!revision.trim()}
          onClick={() => {
            onRevise(revision);
            setRevision('');
          }}
        >
          <Sparkles size={14} className="mr-2" /> REVISE
        </Button>
      </div>
    </motion.div>
  );
};
