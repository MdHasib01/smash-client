import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

export const PIPELINE = ['Queue', 'Prompt', 'Agent', 'Render', 'Save'] as const;

interface GenerationStageProps {
  /** Index into PIPELINE of the step running now. */
  step: number;
  label: string;
  /** Start of the current attempt (ms). */
  startTime: number;
  mode: string;
  retrying?: boolean;
}

const FLAVOR: Record<string, string[]> = {
  IMAGE: ['Composing the scene', 'Balancing light', 'Matching the brand palette', 'Placing the product', 'Refining details'],
  TEXT: ['Outlining', 'Choosing the tone', 'Drafting', 'Tightening the copy'],
  DEFAULT: ['Working', 'Processing', 'Almost there'],
};

const clock = (ms: number) => {
  const safe = Math.max(0, ms);
  const total = Math.floor(safe / 1000);
  const millis = String(Math.floor(safe % 1000)).padStart(3, '0');
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}.${millis}`;
};

/** Ticks every animation frame on its own, so the rest of the stage doesn't re-render with it. */
const ElapsedClock: React.FC<{ startTime: number }> = ({ startTime }) => {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    let frame = requestAnimationFrame(function tick() {
      setNow(Date.now());
      frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, []);
  return <>{clock(now - startTime)}</>;
};

// Soft colour fields drifting behind the card, like an image slowly coming into focus.
const BLOBS = [
  { className: 'bg-violet-500/40 w-40 h-40 -left-8 -top-10', x: [0, 40, 0], y: [0, 20, 0], duration: 9 },
  { className: 'bg-fuchsia-500/35 w-44 h-44 right-[-3rem] top-4', x: [0, -30, 0], y: [0, -24, 0], duration: 11 },
  { className: 'bg-rose-400/25 w-36 h-36 left-1/3 -bottom-16', x: [0, 24, 0], y: [0, -16, 0], duration: 8 },
];

export const GenerationStage: React.FC<GenerationStageProps> = ({ step, label, startTime, mode, retrying }) => {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, []);

  const elapsed = now - startTime;
  const flavor = FLAVOR[mode] ?? FLAVOR.DEFAULT;
  const flavorLine = flavor[Math.floor(elapsed / 4000) % flavor.length];

  return (
    <div className="relative h-44 rounded-xl overflow-hidden border border-white/[0.06] bg-white/[0.02]">
      {/* Drifting colour */}
      <div className={cn('absolute inset-0 transition-opacity duration-700', retrying && 'opacity-40')}>
        {BLOBS.map((b, i) => (
          <motion.div
            key={i}
            className={cn('absolute rounded-full blur-3xl', b.className)}
            animate={{ x: b.x, y: b.y }}
            transition={{ repeat: Infinity, duration: b.duration, ease: 'easeInOut' }}
          />
        ))}
      </div>
      {retrying && <div className="absolute inset-0 bg-rose-500/10" />}

      {/* Soft shimmer, as on a loading image */}
      <motion.div
        className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent -skew-x-12"
        animate={{ left: ['-60%', '130%'] }}
        transition={{ repeat: Infinity, duration: 2.6, ease: 'easeInOut', repeatDelay: 0.6 }}
      />

      {/* Elapsed */}
      <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/30 backdrop-blur-md border border-white/10 text-[10px] font-medium tabular-nums text-white/80">
        <ElapsedClock startTime={startTime} />
      </div>

      {/* Status */}
      <div className="absolute left-4 right-4 bottom-4 flex flex-col gap-3">
        <div className="flex flex-col gap-0.5">
          <AnimatePresence mode="wait">
            <motion.span
              key={label}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25 }}
              className="text-sm font-semibold text-white"
            >
              {label}
            </motion.span>
          </AnimatePresence>
          <AnimatePresence mode="wait">
            <motion.span
              key={flavorLine}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="text-[11px] text-white/50"
            >
              {flavorLine}…
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Step segments */}
        <div className="flex gap-1">
          {PIPELINE.map((name, i) => (
            <div key={name} title={name} className="relative flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
              {i < step && <div className="absolute inset-0 bg-white/70" />}
              {i === step && (
                <motion.div
                  className={cn('absolute inset-y-0 left-0 rounded-full', retrying ? 'bg-rose-400' : 'bg-gradient-to-r from-violet-400 to-fuchsia-400')}
                  animate={{ width: ['0%', '100%'], opacity: [1, 1, 0.4] }}
                  transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
