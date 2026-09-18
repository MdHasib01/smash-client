import React from 'react';
import { Bell, X, Activity, CheckCircle2, Clock, ShieldAlert, Settings } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../ui/sheet';

export const NotificationsPanel: React.FC<{ isOpen: boolean, onClose: () => void }> = ({ isOpen, onClose }) => {
  const notifications = [
    { id: 1, type: 'SUCCESS', title: 'Task Completed', desc: 'Premium product hero shot finished generating.', time: 'Just now', icon: CheckCircle2, color: 'text-violet-400', bg: 'bg-violet-400/10' },
    { id: 2, type: 'WARNING', title: 'Account Limited', desc: 'Gemini Web #3 reached hourly quota.', time: '10m ago', icon: Clock, color: 'text-rose-400', bg: 'bg-rose-400/10' },
    { id: 3, type: 'CRITICAL', title: 'API Spend Alert', desc: 'Monthly API budget has reached 90% ($450/$500).', time: '1h ago', icon: ShieldAlert, color: 'text-rose-400', bg: 'bg-rose-400/10' },
    { id: 4, type: 'INFO', title: 'Workflow Saved', desc: 'Multi-AI Image Battle v3 was saved successfully.', time: '2h ago', icon: Activity, color: 'text-[#D946EF]', bg: 'bg-[#D946EF]/10' },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent side="right" showCloseButton={false} className="w-full sm:max-w-sm gap-0 p-0">
        <SheetHeader className="flex-row items-center justify-between p-6 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bell size={20} className="text-white" />
              <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-smash-panel" />
            </div>
            <SheetTitle className="text-lg font-bold text-white tracking-tight">Notifications</SheetTitle>
            <SheetDescription className="sr-only">Recent activity and alerts</SheetDescription>
          </div>
          <SheetClose asChild>
            <Button variant="icon" size="icon-sm" aria-label="Close"><X size={16} /></Button>
          </SheetClose>
        </SheetHeader>

        <div className="px-4 py-3 border-b border-white/5 flex gap-2 shrink-0">
          <Button variant="secondary" size="sm" className="flex-1 text-[10px] tracking-wider">MARK ALL READ</Button>
          <Button variant="ghost" size="icon-sm" aria-label="Notification settings"><Settings size={14} /></Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {notifications.map(n => (
            <div key={n.id} className="border border-white/5 bg-white/[0.02] p-4 rounded-xl flex gap-4 relative group hover:bg-white/[0.05] hover:border-white/10 transition-colors cursor-pointer">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-white/10", n.bg)}>
                <n.icon size={16} className={n.color} />
              </div>
              <div className="flex flex-col gap-1 pr-6">
                <span className="text-sm font-semibold text-white">{n.title}</span>
                <span className="text-xs text-smash-text-secondary leading-relaxed">{n.desc}</span>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-smash-text-tertiary mt-1">{n.time}</span>
              </div>

              <button className="absolute top-4 right-4 text-white/20 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Dismiss">
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};
