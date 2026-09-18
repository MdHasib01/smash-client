import React, { useState } from 'react';
import { useGlobalUI } from '../../contexts/GlobalUIContext';
import { useAccounts } from '../../contexts/AccountsContext';
import { Search, Bell, Layers, ChevronDown, User, Plus, LogOut, CreditCard, SlidersHorizontal, Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';
import { Logo } from '../ui/Logo';
import { useBrands } from '../../contexts/BrandsContext';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { Separator } from '../ui/separator';
import { Kbd } from '../ui/kbd';

export const Header: React.FC = () => {
  const {
    toggleCommandPalette,
    activeProject,
    setActiveProject,
    setNotificationsOpen,
  } = useGlobalUI();
  const { brands } = useBrands();
  const navigate = useNavigate();
  const { connections } = useAccounts();

  const [showQueue, setShowQueue] = useState(false);

  const activeCount = connections.filter(c => c.status === 'ACTIVE' || c.status === 'IN_USE').length;
  const isHealthy = activeCount > 0;

  const limitedConnections = connections.filter(c => c.status === 'LIMIT_REACHED');

  return (
    <header className="h-16 shrink-0 flex items-center justify-between gap-3 px-4 md:px-6 glass-2 border-x-0 border-t-0 border-b border-white/5 sticky top-0 z-30">

      {/* LEFT: Mobile Logo & Project Switcher */}
      <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
        <div className="md:hidden">
          <Logo size="sm" showText={false} />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 text-sm font-semibold text-white hover:bg-white/5 px-2 py-1.5 md:px-3 rounded-lg transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40 data-[state=open]:bg-white/5 min-w-0">
              <div className="w-6 h-6 rounded-md bg-gradient-primary flex items-center justify-center text-[10px] font-bold shrink-0 shadow-[0_0_12px_rgba(217,70,239,0.35)]">
                {(activeProject || '?').charAt(0)}
              </div>
              <span className="truncate max-w-[100px] md:max-w-none">{activeProject || 'Add a brand'}</span>
              <ChevronDown size={14} className="text-smash-text-tertiary shrink-0" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-smash-text-tertiary font-bold">Brands</DropdownMenuLabel>
            {brands.map(b => (
              <DropdownMenuItem
                key={b.id}
                onSelect={() => setActiveProject(b.id)}
                className={cn(activeProject === b.name && 'bg-white/10 text-white')}
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: b.color }} />
                <span className="truncate flex-1">{b.name}</span>
                {activeProject === b.name && <Check className="text-[#D946EF]" />}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => navigate('/brands')} className="text-[#D946EF] focus:text-[#D946EF]">
              <Plus className="text-[#D946EF]" /> Manage Brands
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => navigate('/personas')}>
              <User /> Personas
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* CENTER: Command Palette Trigger (Hidden on Mobile) */}
      <div className="hidden md:flex flex-1 justify-center max-w-xl">
        <button
          onClick={toggleCommandPalette}
          className="w-full h-9 rounded-xl px-3 flex items-center justify-between border border-white/10 bg-white/[0.04] text-smash-text-tertiary hover:text-smash-text-secondary hover:border-white/20 hover:bg-white/[0.06] transition-all group outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
        >
          <div className="flex items-center gap-2">
            <Search size={14} />
            <span className="text-xs font-medium">Search prompts, models, assets...</span>
          </div>
          <div className="flex items-center gap-1">
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </div>
        </button>
      </div>

      {/* RIGHT: Status, Queue, Notifications, Profile */}
      <div className="flex items-center justify-end gap-2 md:gap-2.5 flex-1">

        <Button variant="primary" size="sm" className="hidden lg:flex mr-2">
          <Plus size={14} /> New Task
        </Button>

        {/* Mobile Search Button */}
        <Button variant="icon" size="icon-sm" onClick={toggleCommandPalette} className="md:hidden" aria-label="Search">
          <Search size={16} />
        </Button>

        {/* System Health / Account Status */}
        <Popover>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-1.5 md:gap-2 h-8 px-2 md:px-3 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/10 transition-colors text-xs font-medium text-smash-text-secondary outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40 data-[state=open]:bg-white/10">
              <span className="relative flex w-2 h-2 shrink-0">
                <span className={cn("absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping", isHealthy ? "bg-violet-500" : "bg-red-500")} />
                <span className={cn("relative inline-flex w-2 h-2 rounded-full", isHealthy ? "bg-violet-500" : "bg-red-500")} />
              </span>
              <span className="hidden sm:inline">{activeCount} Active</span>
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-72 flex flex-col gap-3">
            <div className="text-[10px] uppercase tracking-widest text-smash-text-tertiary font-bold">AI Connections</div>

            <div className="max-h-60 overflow-y-auto pr-1 flex flex-col gap-2">
              {connections.filter(c => c.enabled).map(conn => (
                <div key={conn.id} className="flex items-center justify-between">
                  <span className="text-xs text-white font-medium truncate pr-2 max-w-[140px]">{conn.name}</span>
                  <span className={cn(
                    "text-[10px] px-2 py-0.5 rounded-md shrink-0 font-semibold",
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
              <>
                <Separator />
                <div className="text-[9px] text-smash-text-tertiary text-right">
                  Next reset: {limitedConnections[0].limitState || 'Unknown'}
                </div>
              </>
            )}
          </PopoverContent>
        </Popover>

        {/* Queue Indicator */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="icon"
              size="icon-sm"
              onClick={() => setShowQueue(!showQueue)}
              className="hidden sm:inline-flex"
              aria-label="Queue"
            >
              <Layers size={16} />
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#7C3AED] text-[9px] font-bold flex items-center justify-center text-white ring-2 ring-smash-base">
                5
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Queue</TooltipContent>
        </Tooltip>

        {/* Notification Bell */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="icon"
              size="icon-sm"
              onClick={() => setNotificationsOpen(true)}
              className="hidden md:inline-flex"
              aria-label="Notifications"
            >
              <Bell size={16} />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#FB7185] ring-2 ring-smash-base" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Notifications</TooltipContent>
        </Tooltip>

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="ml-1 md:ml-2 w-8 h-8 rounded-full flex items-center justify-center border border-white/10 bg-white/[0.05] hover:border-white/30 transition-all overflow-hidden outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
              aria-label="Profile"
            >
              <User size={16} className="text-smash-text-secondary" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="flex flex-col gap-0.5">
              <span className="text-xs font-semibold text-white">Admin User</span>
              <span className="text-[10px] font-normal text-smash-text-tertiary">admin@smash.ai</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem><User /> Profile</DropdownMenuItem>
            <DropdownMenuItem><SlidersHorizontal /> Preferences</DropdownMenuItem>
            <DropdownMenuItem><CreditCard /> Billing / Usage</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive"><LogOut /> Sign Out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

      </div>
    </header>
  );
};
