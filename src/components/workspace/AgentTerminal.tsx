import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface TerminalLine {
  key: string;
  time: number;
  text: string;
  /** 'system' = Smash's own session events, 'agent' = the CLI transcript. */
  source: 'system' | 'agent';
  tone?: 'INFO' | 'SUCCESS' | 'WARNING' | 'CRITICAL';
}

interface AgentTerminalProps {
  lines: TerminalLine[];
  live: boolean;
  /** How many of the newest lines to show. */
  visible?: number;
  className?: string;
}

type Kind = 'ok' | 'error' | 'warn' | 'info';

/** Read the markers node-agent and the engine write (✓ ✗ ▸ $ ──) and drop them from the text. */
function describe(line: TerminalLine): { kind: Kind; text: string } {
  const raw = line.text.trim();
  const text = raw.replace(/^(✓|✗|▸|\$|…)\s*/, '').replace(/^──\s*|\s*──$/g, '');
  if (raw.startsWith('✗') || line.tone === 'CRITICAL') return { kind: 'error', text };
  if (raw.startsWith('✓') || line.tone === 'SUCCESS') return { kind: 'ok', text };
  if (line.tone === 'WARNING') return { kind: 'warn', text };
  return { kind: 'info', text };
}

/** A compact live feed: only the newest few lines, sliding up as the agent works. */
export const AgentTerminal: React.FC<AgentTerminalProps> = ({ lines, live, visible = 3, className }) => {
  const shown = lines.filter((l) => l.text.trim()).slice(-visible);

  return (
    <div className={cn('rounded-xl border border-white/[0.06] bg-black/20 px-3.5 py-3', className)}>
      <div className="flex items-center gap-2 mb-2">
        <span className="relative flex w-1.5 h-1.5">
          {live && <span className="absolute inset-0 rounded-full bg-fuchsia-400 animate-ping opacity-60" />}
          <span className={cn('relative w-1.5 h-1.5 rounded-full', live ? 'bg-fuchsia-400' : 'bg-white/30')} />
        </span>
        <span className="text-[10px] font-medium text-white/40">{live ? 'Agent activity' : 'Last activity'}</span>
      </div>

      <div className="flex flex-col gap-1 min-h-[3.75rem]">
        {shown.length === 0 && <span className="text-[11px] text-white/30">Waiting for the agent…</span>}
        <AnimatePresence mode="popLayout" initial={false}>
          {shown.map((line, i) => {
            const { kind, text } = describe(line);
            const newest = i === shown.length - 1;
            return (
              <motion.div
                layout
                key={line.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: newest ? 1 : i === shown.length - 2 ? 0.55 : 0.3, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="flex items-center gap-2 min-w-0 h-[18px]"
              >
                <span className="shrink-0 w-3 flex justify-center">
                  {kind === 'ok' ? (
                    <Check size={11} className="text-emerald-400" />
                  ) : kind === 'error' ? (
                    <X size={11} className="text-red-400" />
                  ) : (
                    <span className={cn('w-1 h-1 rounded-full', kind === 'warn' ? 'bg-amber-300' : 'bg-white/40')} />
                  )}
                </span>
                <span
                  title={text}
                  className={cn(
                    'truncate text-[11.5px]',
                    kind === 'error' ? 'text-red-300' : kind === 'warn' ? 'text-amber-200' : kind === 'ok' ? 'text-emerald-300' : 'text-white/85'
                  )}
                >
                  {text}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
