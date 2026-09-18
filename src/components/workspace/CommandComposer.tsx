import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Input';
import { Paperclip, Image as ImageIcon, Send, Sparkles, Mic, FileText, FileVideo, Coins, FileAudio, Link, Folder } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { useGlobalUI } from '../../contexts/GlobalUIContext';
import { usePersonas } from '../../contexts/PersonasContext';
import { PersonaSelector } from './PersonaSelector';

interface CommandComposerProps {
  prompt: string;
  setPrompt: (p: string) => void;
  onRun: () => void;
  selectedCount: number;
  activeMode: string;
  isRunning?: boolean;
  personaId: string | null;
  onPersonaChange: (id: string | null) => void;
  styleId: string | null;
  onStyleChange: (id: string | null) => void;
  referenceIds: string[];
  onReferencesChange: (ids: string[]) => void;
}

export const CommandComposer: React.FC<CommandComposerProps> = ({
  prompt,
  setPrompt,
  onRun,
  selectedCount,
  activeMode,
  isRunning,
  personaId,
  onPersonaChange,
  styleId,
  onStyleChange,
  referenceIds,
  onReferencesChange,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const { activeProject } = useGlobalUI();
  const { personas } = usePersonas();
  const persona = personas.find((p) => p.id === personaId);

  const getPlaceholder = () => {
    if (persona && activeMode === 'IMAGE') {
      return persona.kind === 'PROFILE'
        ? 'e.g. generate an image of me and my baby at the park'
        : `e.g. a mom taking care of her baby, with ${persona.name} on the table`;
    }
    switch(activeMode) {
      case 'IMAGE': return `Describe the image for ${activeProject}...`;
      case 'VIDEO': return `Describe the video scene for ${activeProject}...`;
      case 'AUDIO': return `Provide the script or audio for ${activeProject}...`;
      default: return `What do you want to create for ${activeProject}? (Supports English & Bangla)`;
    }
  };

  const getPresets = () => {
    switch(activeMode) {
      case 'IMAGE': return ['Product Ad', 'Photorealistic', 'Social Creative', 'Character', 'Packaging'];
      case 'VIDEO': return ['Product Commercial', 'Image Animation', 'Short Reel'];
      case 'TEXT': return ['Research', 'Copywriting', 'Coding', 'Analysis'];
      case 'AUDIO': return ['Voiceover', 'Transcription', 'Sound', 'Music'];
      default: return [];
    }
  };

  const renderAttachmentsTray = () => {
    return (
      <div className="absolute top-4 right-4 flex gap-2">
        {activeMode === 'IMAGE' && (
          <div className="rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs font-semibold text-smash-text-secondary border border-white/10 bg-white/5 backdrop-blur-md cursor-pointer hover:bg-white/10 hover:text-white transition-colors">
            <ImageIcon size={14} /> Add Reference
          </div>
        )}
        {activeMode === 'VIDEO' && (
          <div className="rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs font-semibold text-smash-text-secondary border border-white/10 bg-white/5 backdrop-blur-md cursor-pointer hover:bg-white/10 hover:text-white transition-colors">
            <FileVideo size={14} /> Image/Video Ref
          </div>
        )}
        {activeMode === 'TEXT' && (
          <>
            <div className="rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs font-semibold text-smash-text-secondary border border-white/10 bg-white/5 backdrop-blur-md cursor-pointer hover:bg-white/10 hover:text-white transition-colors">
              <Link size={14} /> Add URL
            </div>
            <div className="rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs font-semibold text-smash-text-secondary border border-white/10 bg-white/5 backdrop-blur-md cursor-pointer hover:bg-white/10 hover:text-white transition-colors">
              <FileText size={14} /> Attach File
            </div>
          </>
        )}
         {activeMode === 'AUDIO' && (
          <div className="rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs font-semibold text-smash-text-secondary border border-white/10 bg-white/5 backdrop-blur-md cursor-pointer hover:bg-white/10 hover:text-white transition-colors">
            <FileAudio size={14} /> Source Audio
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <PersonaSelector
        personaId={personaId}
        onPersonaChange={onPersonaChange}
        styleId={styleId}
        onStyleChange={onStyleChange}
        enabledReferenceIds={referenceIds}
        onReferencesChange={onReferencesChange}
      />

      {/* Quick Presets */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <span className="text-[9px] font-bold tracking-widest uppercase text-smash-text-tertiary shrink-0 mr-2">Presets:</span>
        {getPresets().map(preset => (
          <button 
            key={preset}
            onClick={() => setPrompt(`Generate a ${preset.toLowerCase()} featuring...`)}
            className="shrink-0 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.04] text-[11px] font-semibold text-smash-text-secondary hover:text-white hover:bg-[#D946EF]/10 hover:border-[#D946EF]/40 transition-all outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
          >
            {preset}
          </button>
        ))}
      </div>

      <div className={cn(
        "glass-2 rounded-3xl p-2 transition-all duration-300 border flex flex-col",
        isFocused ? "border-[#D946EF]/50 shadow-[0_0_30px_rgba(217,70,239,0.15)]" : "border-white/5 shadow-2xl shadow-black/50"
      )}>
        <div className="relative">
          <Textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={getPlaceholder()}
            className="min-h-[160px] bg-transparent border-none shadow-none hover:border-none focus:bg-transparent focus:ring-0 text-lg md:text-xl p-6 placeholder:opacity-30 placeholder:text-white pb-20 resize-none"
          />
          
          {/* Floating Attachments Tray */}
          <AnimatePresence>
            {isFocused && (
               <motion.div initial={{opacity:0, y:-10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}}>
                 {renderAttachmentsTray()}
               </motion.div>
            )}
            {!isFocused && prompt.length === 0 && (
                <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                  {renderAttachmentsTray()}
                </motion.div>
            )}
          </AnimatePresence>

          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
            <div className="flex gap-2">
              <Button variant="icon" size="icon" className="rounded-xl" aria-label="Attach">
                <Paperclip size={18} />
              </Button>
              <Button variant="icon" size="icon" className="rounded-xl" aria-label="Voice input">
                <Mic size={18} />
              </Button>
            </div>
            
            <div className="hidden lg:flex items-center gap-4">
              <div className="flex flex-col items-end mr-2">
                <span className="text-[10px] font-bold tracking-widest uppercase text-smash-text-secondary">
                  {selectedCount} {selectedCount === 1 ? 'Model' : 'Models'} Selected
                </span>
                <span className="text-[9px] font-bold text-violet-400 flex items-center gap-1 mt-0.5">
                  <Coins size={10} /> Est. Cost: {selectedCount > 0 ? `~$${(selectedCount * 0.02).toFixed(2)}` : '$0.00'}
                </span>
              </div>
              <Button 
                variant="primary" 
                size="lg" 
                onClick={onRun}
                disabled={selectedCount === 0 || !prompt.trim() || isRunning}
                isLoading={isRunning}
                className="px-8 rounded-xl text-sm tracking-wide"
              >
                <Sparkles size={16} /> RUN SMASH
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
