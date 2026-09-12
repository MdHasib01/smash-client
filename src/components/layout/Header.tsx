import React, { useState } from 'react';
import { useGlobalUI } from '../../contexts/GlobalUIContext';
import { useAccounts } from '../../contexts/AccountsContext';
import { Search, Bell, Activity, Layers, ChevronDown, User, Plus } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';
import { Logo } from '../ui/Logo';

export const Header: React.FC = () => {
  const { toggleCommandPalette, activeProject, setActiveProject, setNotificationsOpen } = useGlobalUI();
  const { connections } = useAccounts();
  
  // Local state for popovers (simplified for the shell)
  const [showProjects, setShowProjects] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [showHealth, setShowHealth] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const activeCount = connections.filter(c => c.status === 'ACTIVE' || c.status === 'IN_USE').length;
  const isHealthy = activeCount > 0;
  
  const limitedConnections = connections.filter(c => c.status === 'LIMIT_REACHED');

  return (
    <header className="h-16 shrink-0 flex items-center justify-between px-4 md:px-6 glass-2 border-b border-white/5 sticky top-0 z-30">
      
      {/* LEFT: Mobile Logo & Project Switcher */}
      <div className="flex items-center gap-3 md:gap-4 flex-1">
        <div className="md:hidden">
          <Logo size="sm" showText={false} />
        </div>
        <div className="relative">
          <button 
            onClick={() => setShowProjects(!showProjects)}
            className="flex items-center gap-2 text-sm font-bold text-white hover:bg-white/5 px-2 py-1.5 md:px-3 rounded-lg transition-colors"
          >
            <div className="w-6 h-6 rounded-md bg-gradient-primary flex items-center justify-center text-[10px] shrink-0">
              {activeProject.charAt(0)}
            </div>
            <span className="truncate max-w-[100px] md:max-w-none">{activeProject}</span>
            <ChevronDown size={14} className="text-smash-text-tertiary shrink-0" />
          </button>

          {showProjects && (
            <div className="absolute top-full left-0 mt-2 w-48 glass-3 rounded-xl p-2 border border-white/10 shadow-xl z-50 flex flex-col gap-1">
              <div className="text-[10px] uppercase tracking-widest text-smash-text-tertiary px-2 py-1 font-bold">Projects</div>
              {['Milkimom', 'Baby Herbs', 'NextNeed', 'Personal'].map(p => (
                <button 
                  key={p} 
                  onClick={() => { setActiveProject(p); setShowProjects(false); }}
                  className={cn("text-left px-2 py-1.5 rounded-lg text-sm text-smash-text-secondary hover:text-white hover:bg-white/5", activeProject === p && "text-white bg-white/10")}
                >
                  {p}
                </button>
              ))}
              <div className="h-px bg-white/5 my-1" />
              <button className="text-left px-2 py-1.5 rounded-lg text-sm text-[#D946EF] hover:bg-white/5 flex items-center gap-2">
                <Plus size={14} /> New Project
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CENTER: Command Palette Trigger (Hidden on Mobile) */}
      <div className="hidden md:flex flex-1 justify-center max-w-xl">
        <button 
          onClick={toggleCommandPalette}
          className="w-full glass-3 h-9 rounded-xl px-4 flex items-center justify-between text-smash-text-tertiary hover:text-smash-text-secondary hover:border-white/20 transition-all group"
        >
          <div className="flex items-center gap-2">
            <Search size={14} />
            <span className="text-xs font-medium">Search prompts, models, assets...</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded-md bg-white/5 text-[10px] font-mono group-hover:bg-white/10 transition-colors">⌘</kbd>
            <kbd className="px-1.5 py-0.5 rounded-md bg-white/5 text-[10px] font-mono group-hover:bg-white/10 transition-colors">K</kbd>
          </div>
        </button>
      </div>

      {/* RIGHT: Status, Queue, Notifications, Profile */}
      <div className="flex items-center justify-end gap-2 md:gap-3 flex-1">
        
        <Button variant="primary" size="sm" className="hidden lg:flex mr-2 h-8 rounded-lg text-xs">
          <Plus size={14} /> New Task
        </Button>

        {/* Mobile Search Button */}
        <button 
          onClick={toggleCommandPalette}
          className="md:hidden w-8 h-8 rounded-lg glass-3 flex items-center justify-center text-smash-text-secondary hover:text-white hover:bg-white/10 transition-colors"
        >
          <Search size={16} />
        </button>

        {/* System Health / Account Status */}
        <div className="relative">
          <button 
            onClick={() => setShowHealth(!showHealth)}
            className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1.5 rounded-lg glass-3 hover:bg-white/10 transition-colors text-xs font-medium text-smash-text-secondary"
          >
            <div className={cn("w-2 h-2 rounded-full animate-pulse shrink-0", isHealthy ? "bg-violet-500" : "bg-red-500")} />
            <span className="hidden sm:inline">{activeCount} Active</span>
          </button>
          
          {/* Real Health Popover */}
          {showHealth && (
            <div className="absolute top-full right-0 mt-2 w-72 glass-3 rounded-2xl p-4 border border-white/10 shadow-xl z-50 flex flex-col gap-3">
              <div className="text-[10px] uppercase tracking-widest text-smash-text-tertiary font-bold mb-1">AI Connections</div>
              
              <div className="max-h-60 overflow-y-auto pr-2 flex flex-col gap-2">
                {connections.filter(c => c.enabled).map(conn => (
                  <div key={conn.id} className="flex items-center justify-between">
                    <span className="text-xs text-white font-medium truncate pr-2 max-w-[140px]">{conn.name}</span>
                    <span className={cn(
                      "text-[10px] px-2 py-0.5 rounded-md shrink-0 font-bold",
                      conn.status === 'ACTIVE' || conn.status === 'IN_USE' ? "text-violet-400 bg-violet-500/10" :
                      conn.status === 'LIMIT_REACHED' ? "text-rose-400 bg-rose-400/10" :
                      conn.status === 'SESSION_EXPIRED' ? "text-red-400 bg-red-400/10" :
                      conn.status === 'API_ERROR' ? "text-red-500 bg-red-500/10" :
                      "text-smash-text-secondary bg-white/5"
                    )}>
                      {conn.status.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
              
              {limitedConnections.length > 0 && (
                <div className="text-[9px] text-smash-text-tertiary mt-2 pt-2 border-t border-white/10 text-right">
                  Next reset: {limitedConnections[0].limitState || 'Unknown'}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Queue Indicator */}
        <button 
          onClick={() => setShowQueue(!showQueue)}
          className="hidden sm:flex w-8 h-8 rounded-lg glass-3 items-center justify-center text-smash-text-secondary hover:text-white hover:bg-white/10 transition-colors relative"
        >
          <Layers size={16} />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#7C3AED] text-[9px] font-black flex items-center justify-center text-white">
            5
          </span>
        </button>

        {/* Notification Bell */}
        <button 
          onClick={() => setNotificationsOpen(true)}
          className="w-8 h-8 rounded-lg glass-3 flex items-center justify-center text-smash-text-secondary hover:text-white hover:bg-white/10 transition-colors relative hidden md:flex"
        >
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#FB7185]" />
        </button>

        {/* Profile */}
        <div className="relative ml-1 md:ml-2">
          <button 
            onClick={() => setShowProfile(!showProfile)}
            className="w-8 h-8 rounded-full glass-3 flex items-center justify-center border border-white/10 hover:border-white/30 transition-all overflow-hidden"
          >
            <User size={16} className="text-smash-text-secondary" />
          </button>
          
          {showProfile && (
            <div className="absolute top-full right-0 mt-2 w-48 glass-3 rounded-xl p-2 border border-white/10 shadow-xl z-50 flex flex-col gap-1">
              <div className="px-2 py-2 mb-1 border-b border-white/10">
                <div className="text-xs font-bold text-white">Admin User</div>
                <div className="text-[10px] text-smash-text-tertiary">admin@smash.ai</div>
              </div>
              <button className="text-left px-2 py-1.5 rounded-lg text-sm text-smash-text-secondary hover:text-white hover:bg-white/5">Profile</button>
              <button className="text-left px-2 py-1.5 rounded-lg text-sm text-smash-text-secondary hover:text-white hover:bg-white/5">Preferences</button>
              <button className="text-left px-2 py-1.5 rounded-lg text-sm text-smash-text-secondary hover:text-white hover:bg-white/5">Billing / Usage</button>
              <div className="h-px bg-white/5 my-1" />
              <button className="text-left px-2 py-1.5 rounded-lg text-sm text-red-400 hover:bg-white/5">Sign Out</button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
