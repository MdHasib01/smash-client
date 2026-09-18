import React, { useEffect, useState } from 'react';
import { useGlobalUI } from '../../contexts/GlobalUIContext';
import { Search, Image, FileText, Zap, Settings, Sparkles, Terminal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Command as CommandPrimitive } from 'cmdk';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '../ui/command';
import { Kbd } from '../ui/kbd';

export const CommandPalette: React.FC = () => {
  const { isCommandPaletteOpen, setCommandPaletteOpen } = useGlobalUI();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setCommandPaletteOpen]);

  useEffect(() => {
    if (isCommandPaletteOpen) setQuery('');
  }, [isCommandPaletteOpen]);

  const suggestions = [
    { id: 1, title: 'Open Image Workspace', icon: Image, action: () => navigate('/generate/image'), cat: 'Generators' },
    { id: 2, title: 'Open Text Orchestration', icon: FileText, action: () => navigate('/generate/text'), cat: 'Generators' },
    { id: 3, title: 'Manage Accounts', icon: Sparkles, action: () => navigate('/accounts'), cat: 'System' },
    { id: 11, title: 'Manage Brands', icon: Zap, action: () => navigate('/brands'), cat: 'Workspaces' },
    { id: 4, title: 'Manage Personas', icon: Sparkles, action: () => navigate('/personas'), cat: 'Workspaces' },
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
    <Dialog open={isCommandPaletteOpen} onOpenChange={setCommandPaletteOpen}>
      <DialogContent
        showCloseButton={false}
        className="top-[15vh] translate-y-0 overflow-hidden p-0 gap-0 sm:max-w-2xl"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Command Palette</DialogTitle>
          <DialogDescription>Search commands, workspaces, models...</DialogDescription>
        </DialogHeader>
        {/* Filtering stays our own (title or category substring) rather than cmdk's fuzzy match. */}
        <Command shouldFilter={false} className="bg-transparent">
          <div className="flex items-center gap-3 px-4 border-b border-white/5">
            <Search size={18} className="text-[#D946EF] shrink-0" />
            <CommandPrimitive.Input
              autoFocus
              value={query}
              onValueChange={setQuery}
              placeholder="Search commands, workspaces, models..."
              className="flex h-12 w-full bg-transparent text-white font-medium outline-none placeholder:text-smash-text-tertiary"
            />
            <Kbd>ESC</Kbd>
          </div>

          <CommandList className="max-h-[60vh] p-2">
            <CommandEmpty className="px-4 py-8 text-center text-sm text-smash-text-secondary">
              No results found for "{query}"
            </CommandEmpty>
            {filtered.length > 0 && (
              <CommandGroup
                heading={query ? 'Results' : 'Suggested Actions'}
                className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:tracking-widest [&_[cmdk-group-heading]]:text-smash-text-tertiary"
              >
                {filtered.map(item => (
                  <CommandItem
                    key={item.id}
                    value={`${item.id}-${item.title}`}
                    onSelect={() => {
                      item.action();
                      setCommandPaletteOpen(false);
                    }}
                    className="gap-3 px-3 py-2.5 rounded-xl text-smash-text-secondary data-[selected=true]:bg-white/10 data-[selected=true]:text-white"
                  >
                    <div className="w-8 h-8 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center text-[#D946EF] shrink-0">
                      <item.icon size={16} />
                    </div>
                    <span className="font-medium text-sm flex-1">{item.title}</span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-smash-text-tertiary">{item.cat}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
};
