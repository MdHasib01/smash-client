import * as React from "react";
import { cn } from "@/src/lib/utils";
import { motion } from "motion/react";

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  animate?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className, size = 'md', showText = true, animate = false }) => {
  const sizes = {
    sm: { text: "text-lg", icon: 20 },
    md: { text: "text-2xl", icon: 28 },
    lg: { text: "text-4xl", icon: 40 },
  };

  const s = sizes[size];

  return (
    <div className={cn("flex items-center gap-2 select-none", className)}>
      <svg width={s.icon} height={s.icon} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
        <defs>
          <linearGradient id="smash-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#7C3AED" />
            <stop offset="0.5" stopColor="#D946EF" />
            <stop offset="1" stopColor="#FB7185" />
          </linearGradient>
        </defs>
        <motion.g initial={animate ? { opacity: 0 } : false} animate={{ opacity: 1 }} transition={{ duration: 0.5, staggerChildren: 0.1 }}>
          {/* Nodes and paths */}
          <motion.path d="M20 20L8 10" stroke="url(#smash-grad)" strokeWidth="2" strokeLinecap="round" initial={animate ? { pathLength: 0 } : false} animate={{ pathLength: 1 }} transition={{ delay: 0.1, duration: 0.4 }} />
          <motion.path d="M20 20L32 10" stroke="url(#smash-grad)" strokeWidth="2" strokeLinecap="round" initial={animate ? { pathLength: 0 } : false} animate={{ pathLength: 1 }} transition={{ delay: 0.2, duration: 0.4 }} />
          <motion.path d="M20 20L10 32" stroke="url(#smash-grad)" strokeWidth="2" strokeLinecap="round" initial={animate ? { pathLength: 0 } : false} animate={{ pathLength: 1 }} transition={{ delay: 0.3, duration: 0.4 }} />
          <motion.path d="M20 20L32 30" stroke="url(#smash-grad)" strokeWidth="2" strokeLinecap="round" initial={animate ? { pathLength: 0 } : false} animate={{ pathLength: 1 }} transition={{ delay: 0.4, duration: 0.4 }} />
          
          {/* Outer nodes */}
          <motion.circle cx="8" cy="10" r="3" fill="url(#smash-grad)" initial={animate ? { scale: 0 } : false} animate={{ scale: 1 }} transition={{ delay: 0.1 }} />
          <motion.circle cx="32" cy="10" r="3" fill="url(#smash-grad)" initial={animate ? { scale: 0 } : false} animate={{ scale: 1 }} transition={{ delay: 0.2 }} />
          <motion.circle cx="10" cy="32" r="3" fill="url(#smash-grad)" initial={animate ? { scale: 0 } : false} animate={{ scale: 1 }} transition={{ delay: 0.3 }} />
          <motion.circle cx="32" cy="30" r="3" fill="url(#smash-grad)" initial={animate ? { scale: 0 } : false} animate={{ scale: 1 }} transition={{ delay: 0.4 }} />

          {/* Core */}
          <motion.circle cx="20" cy="20" r="6" fill="#fff" className="drop-shadow-[0_0_8px_rgba(217,70,239,0.5)]" initial={animate ? { scale: 0 } : false} animate={{ scale: 1 }} transition={{ delay: 0.6, type: 'spring' }} />
        </motion.g>
      </svg>
      {showText && (
        <motion.div 
          initial={animate ? { opacity: 0, x: -10 } : false} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ delay: 0.8 }}
          className={cn("font-black tracking-tight text-white uppercase", s.text)}
        >
          SMASH
        </motion.div>
      )}
    </div>
  );
};
