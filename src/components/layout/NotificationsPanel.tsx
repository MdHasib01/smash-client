import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, Activity, CheckCircle2, AlertTriangle, Zap, Clock, ShieldAlert } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';

export const NotificationsPanel: React.FC<{ isOpen: boolean, onClose: () => void }> = ({ isOpen, onClose }) => {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const notifications = [
    { id: 1, type: 'SUCCESS', title: 'Task Completed', desc: 'Premium product hero shot finished generating.', time: 'Just now', icon: CheckCircle2, color: 'text-violet-400', bg: 'bg-violet-400/10' },
    { id: 2, type: 'WARNING', title: 'Account Limited', desc: 'Gemini Web #3 reached hourly quota.', time: '10m ago', icon: Clock, color: 'text-rose-400', bg: 'bg-rose-400/10' },
    { id: 3, type: 'CRITICAL', title: 'API Spend Alert', desc: 'Monthly API budget has reached 90% ($450/$500).', time: '1h ago', icon: ShieldAlert, color: 'text-rose-400', bg: 'bg-rose-400/10' },
    { id: 4, type: 'INFO', title: 'Workflow Saved', desc: 'Multi-AI Image Battle v3 was saved successfully.', time: '2h ago', icon: Activity, color: 'text-[#D946EF]', bg: 'bg-[#D946EF]/10' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        onClick={onClose}
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="relative w-full max-w-sm glass-1 border-l border-white/10 shadow-2xl h-full flex flex-col bg-black/60 backdrop-blur-3xl"
      >
        <div className="flex items-center justify-between p-6 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-3">
             <div className="relative">
               <Bell size={20} className="text-white" />
               <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 border border-black" />
             </div>
             <h2 className="text-lg font-black text-white tracking-tight">Notifications</h2>
          </div>
          <Button variant="icon" className="w-8 h-8 glass-3 text-smash-text-secondary hover:text-white" onClick={onClose}><X size={16}/></Button>
        </div>

        <div className="p-4 border-b border-white/5 flex gap-2 shrink-0 glass-2">
           <Button variant="secondary" size="sm" className="flex-1 text-[10px]">MARK ALL READ</Button>
           <Button variant="ghost" size="sm" className="w-8 h-8 px-0"><Settings size={14}/></Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
           {notifications.map(n => (
             <div key={n.id} className="glass-2 border border-white/5 p-4 rounded-xl flex gap-4 relative group hover:bg-white/[0.03] transition-colors cursor-pointer">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-white/10", n.bg)}>
                  <n.icon size={16} className={n.color} />
                </div>
                <div className="flex flex-col gap-1 pr-6">
                  <span className="text-sm font-bold text-white">{n.title}</span>
                  <span className="text-xs text-smash-text-secondary leading-relaxed font-medium">{n.desc}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-smash-text-tertiary mt-1">{n.time}</span>
                </div>
                
                <button className="absolute top-4 right-4 text-white/20 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                   <X size={14} />
                </button>
             </div>
           ))}
        </div>
      </motion.div>
    </div>
  );
};

// Dummy import since Settings wasn't imported above
import { Settings } from 'lucide-react';
