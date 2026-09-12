import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@/src/lib/utils";
import { Image, Video, FileText, Mic } from "lucide-react";

export type Mode = 'IMAGE' | 'VIDEO' | 'TEXT' | 'AUDIO';

interface ModeSwitcherProps {
  activeMode: Mode;
  onChange: (mode: Mode) => void;
  className?: string;
}

export const ModeSwitcher: React.FC<ModeSwitcherProps> = ({ activeMode, onChange, className }) => {
  const modes: { id: Mode; label: string; icon: React.ReactNode; colorClass: string }[] = [
    { id: 'IMAGE', label: 'Image', icon: <Image size={16} />, colorClass: 'text-smash-accent-violet' },
    { id: 'VIDEO', label: 'Video', icon: <Video size={16} />, colorClass: 'text-smash-accent-magenta' },
    { id: 'TEXT', label: 'Text', icon: <FileText size={16} />, colorClass: 'text-smash-accent-coral' },
    { id: 'AUDIO', label: 'Audio', icon: <Mic size={16} />, colorClass: 'text-smash-accent-purple' },
  ];

  return (
    <div className={cn("inline-flex glass-2 p-1 rounded-lg gap-1 max-w-full overflow-x-auto no-scrollbar", className)}>
      {modes.map((mode) => {
        const isActive = activeMode === mode.id;
        return (
          <button
            key={mode.id}
            onClick={() => onChange(mode.id)}
            className={cn(
              "relative flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-300 z-10",
              isActive ? "text-white" : "text-smash-text-secondary hover:text-smash-text-primary hover:bg-smash-surface"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="activeModeBackground"
                className="absolute inset-0 bg-smash-surface-hover rounded-md shadow-[0_0_15px_rgba(255,255,255,0.05)] border border-smash-border"
                initial={false}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className={cn("relative z-10", isActive && mode.colorClass)}>
              {mode.icon}
            </span>
            <span className="relative z-10">{mode.label}</span>
          </button>
        );
      })}
    </div>
  );
};
