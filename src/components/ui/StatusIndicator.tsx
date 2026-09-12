import * as React from "react";
import { cn } from "@/src/lib/utils";
import { motion } from "motion/react";
import { CheckCircle2, AlertCircle, XCircle, Clock, Loader2, PauseCircle, PlayCircle } from "lucide-react";

export type StatusState = 'IDLE' | 'QUEUED' | 'GENERATING' | 'PROCESSING' | 'RETRYING' | 'LIMIT_REACHED' | 'PAUSED' | 'FAILED' | 'COMPLETE' | 'ACTIVE_AGAIN' | 'ACTIVE' | 'OFFLINE' | 'SESSION_EXPIRED' | 'ERROR' | 'STOPPED' | 'WAITING_FOR_LIMIT' | 'CONNECTION_LOST' | 'BROWSER_ISSUE' | 'READY' | string;

interface StatusIndicatorProps {
  state: StatusState;
  label?: string;
  className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ state, label, className }) => {
  
  const getStatusContent = () => {
    switch (state) {
      case 'IDLE':
        return {
          icon: <div className="w-2 h-2 rounded-full bg-smash-text-tertiary" />,
          color: "text-smash-text-secondary",
          defaultLabel: "Idle"
        };
      case 'QUEUED':
        return {
          icon: (
            <div className="flex space-x-1">
              <motion.div className="w-1.5 h-1.5 rounded-full bg-smash-text-secondary" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0 }} />
              <motion.div className="w-1.5 h-1.5 rounded-full bg-smash-text-secondary" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.3 }} />
              <motion.div className="w-1.5 h-1.5 rounded-full bg-smash-text-secondary" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.6 }} />
            </div>
          ),
          color: "text-smash-text-secondary",
          defaultLabel: "Queued"
        };
      case 'GENERATING':
        return {
          icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
          color: "text-smash-accent-violet drop-shadow-[0_0_5px_rgba(139,92,246,0.5)]",
          defaultLabel: "Generating..."
        };
      case 'PROCESSING':
        return {
          icon: (
             <div className="relative w-3.5 h-3.5 rounded-full overflow-hidden border border-smash-accent-magenta/30">
               <motion.div 
                 className="absolute inset-0 bg-gradient-to-tr from-smash-accent-violet via-smash-accent-magenta to-smash-accent-coral"
                 animate={{ rotate: 360 }}
                 transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
               />
               <div className="absolute inset-[2px] bg-smash-surface rounded-full" />
             </div>
          ),
          color: "text-smash-accent-magenta",
          defaultLabel: "Processing"
        };
      case 'RETRYING':
        return {
          icon: <Clock className="w-3.5 h-3.5 animate-pulse" />,
          color: "text-smash-status-warning",
          defaultLabel: "Retrying..."
        };
      case 'LIMIT_REACHED':
        return {
          icon: <AlertCircle className="w-3.5 h-3.5 animate-bounce" />,
          color: "text-smash-status-warning",
          defaultLabel: "Limit Reached"
        };
      case 'PAUSED':
        return {
          icon: <PauseCircle className="w-3.5 h-3.5" />,
          color: "text-smash-status-paused",
          defaultLabel: "Paused"
        };
      case 'FAILED':
        return {
          icon: <XCircle className="w-3.5 h-3.5" />,
          color: "text-smash-status-error",
          defaultLabel: "Failed"
        };
      case 'COMPLETE':
        return {
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
          color: "text-smash-status-connected drop-shadow-[0_0_5px_rgba(139,92,246,0.4)]",
          defaultLabel: "Complete"
        };
      case 'ACTIVE_AGAIN':
        return {
          icon: <PlayCircle className="w-3.5 h-3.5 animate-pulse" />,
          color: "text-smash-status-connected",
          defaultLabel: "Active Again"
        };
      case 'ACTIVE':
        return {
          icon: <div className="w-2.5 h-2.5 rounded-full bg-violet-500 animate-pulse shadow-[0_0_8px_rgba(139,92,246,0.6)]" />,
          color: "text-violet-400",
          defaultLabel: "Active"
        };
      case 'OFFLINE':
        return {
          icon: <div className="w-2.5 h-2.5 rounded-full bg-smash-text-tertiary" />,
          color: "text-smash-text-secondary",
          defaultLabel: "Offline"
        };
      case 'SESSION_EXPIRED':
        return {
          icon: <AlertCircle className="w-3.5 h-3.5" />,
          color: "text-rose-400",
          defaultLabel: "Session Expired"
        };
      case 'ERROR':
        return {
          icon: <XCircle className="w-3.5 h-3.5" />,
          color: "text-red-500",
          defaultLabel: "Error"
        };
      case 'STOPPED':
        return {
          icon: <XCircle className="w-3.5 h-3.5" />,
          color: "text-smash-text-secondary",
          defaultLabel: "Stopped"
        };
      case 'WAITING_FOR_LIMIT':
        return {
          icon: <AlertCircle className="w-3.5 h-3.5 animate-bounce" />,
          color: "text-smash-status-warning",
          defaultLabel: "Waiting for Limit"
        };
      case 'CONNECTION_LOST':
      case 'BROWSER_ISSUE':
        return {
          icon: <AlertCircle className="w-3.5 h-3.5" />,
          color: "text-red-500",
          defaultLabel: "Connection Issue"
        };
      case 'READY':
        return {
          icon: <div className="w-2.5 h-2.5 rounded-full bg-violet-500" />,
          color: "text-violet-400",
          defaultLabel: "Ready"
        };
      default:
        return {
          icon: <AlertCircle className="w-3.5 h-3.5" />,
          color: "text-smash-text-secondary",
          defaultLabel: state || "Unknown"
        };
    }
  };

  const content = getStatusContent();

  return (
    <div className={cn("flex items-center gap-2 text-[10px] uppercase font-black tracking-widest", content.color, className)}>
      {content.icon}
      <span>{label || content.defaultLabel}</span>
    </div>
  );
};
