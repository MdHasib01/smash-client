import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGlobalUI } from '../../contexts/GlobalUIContext';
import { Search, Image, FileText, Zap, Settings, Sparkles, Terminal } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';

export const CommandPalette: React.FC = () => {
  const { isCommandPaletteOpen, setCommandPaletteOpen } = useGlobalUI();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
      }
      if (e.key === 'Escape' && isCommandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setCommandPaletteOpen]);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
    }
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const suggestions = [
    { id: 1, title: 'Open Image Workspace', icon: Image, action: () => navigate('/generate/image'), cat: 'Generators' },
    { id: 2, title: 'Open Text Orchestration', icon: FileText, action: () => navigate('/generate/text'), cat: 'Generators' },
    { id: 3, title: 'Manage Accounts', icon: Sparkles, action: () => navigate('/accounts'), cat: 'System' },
    { id: 5, title: 'Global Settings', icon: Settings, action: () => navigate('/settings'), cat: 'System' },
    { id: 6, title: 'Asset Library', icon: Zap, action: () => navigate('/assets'), cat: 'Workspaces' },
    { id: 7, title: 'Workflow Builder', icon: Terminal, action: () => navigate('/workflows'), cat: 'Workspaces' },
    { id: 8, title: 'Analytics Dashboard', icon: Terminal, action: () => navigate('/analytics'), cat: 'Workspaces' },
    { id: 9, title: 'Premium Product Ad (Prompt Template)', icon: Sparkles, action: () => navigate('/assets'), cat: 'Prompts' },
    { id: 10, title: 'Milkimom Campaign (Project)', icon: Zap, action: () => navigate('/assets'), cat: 'Projects' },
  ];

  const filtered = query 
    ? suggestions.filter(s => s.title.toLowerCase().includes(query.toLowerCase()) || s.cat.toLowerCase().includes(query.toLowerCase()))
    : suggestions;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        onClick={() => setCommandPaletteOpen(false)}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        transition={{ type: "spring", duration: 0.4, bounce: 0 }}
        className="relative w-full max-w-2xl glass-1 border border-white/10 shadow-2xl rounded-2xl overflow-hidden flex flex-col"
      >
        <div className="flex items-center px-4 py-3 border-b border-white/5">
          <Search size={18} className="text-[#D946EF]" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search commands, workspaces, models..."
            className="flex-1 bg-transparent border-none outline-none text-white px-3 font-medium placeholder:text-smash-text-tertiary"
          />
          <kbd className="px-2 py-1 rounded-md glass-3 text-[10px] font-mono text-smash-text-secondary">ESC</kbd>
        </div>

        <div className="p-2 max-h-[60vh] overflow-y-auto">
          {filtered.length > 0 ? (
            <div className="flex flex-col gap-1">
              <div className="px-3 py-2 text-[10px] uppercase font-bold tracking-widest text-smash-text-tertiary">
                {query ? 'Results' : 'Suggested Actions'}
              </div>
              {filtered.map((item, i) => (
                <button
                  key={item.id}
                  onClick={() => {
                    item.action();
                    setCommandPaletteOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-colors text-left",
                    i === 0 ? "bg-white/10 text-white" : "text-smash-text-secondary hover:bg-white/5 hover:text-white"
                  )}
                >
                  <div className="w-8 h-8 rounded-lg glass-3 flex items-center justify-center text-[#D946EF]">
                    <item.icon size={16} />
                  </div>
                  <span className="font-medium text-sm">{item.title}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="px-4 py-8 text-center text-sm text-smash-text-secondary">
              No results found for "{query}"
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
