import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, Users, Sparkles, CheckSquare, 
  FolderHeart, History, GitMerge, LineChart, 
  Settings, HelpCircle, ChevronLeft, ChevronRight, Bell
} from 'lucide-react';
import { useGlobalUI } from '../../contexts/GlobalUIContext';
import { Logo } from '../ui/Logo';
import { cn } from '../../lib/utils';

export const Sidebar: React.FC = () => {
  const { isSidebarCollapsed, toggleSidebar, currentMode, setNotificationsOpen, setCommandPaletteOpen } = useGlobalUI();
  const location = useLocation();

  const mainNav = [
    { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { name: 'Accounts', to: '/accounts', icon: Users },
    { name: 'Generate', to: `/generate/${currentMode}`, icon: Sparkles }, // Defaults to text, will preserve state later
    { name: 'Results', to: '/results', icon: CheckSquare },
    { name: 'Assets', to: '/assets', icon: FolderHeart },
    { name: 'History', to: '/history', icon: History },
    { name: 'Workflows', to: '/workflows', icon: GitMerge },
    { name: 'Analytics', to: '/analytics', icon: LineChart },
  ];

  const bottomNav = [
    { name: 'Notifications', to: '#', icon: Bell, action: 'NOTIFICATIONS' },
    { name: 'Settings', to: '/settings', icon: Settings },
    { name: 'Help', to: '/help', icon: HelpCircle },
  ];

  const NavItem: React.FC<{ item: typeof mainNav[0] & { action?: string } }> = ({ item }) => {
    const Component = item.to === '#' ? 'button' : NavLink;
    const isNotifications = item.action === 'NOTIFICATIONS';
    const isActive = item.to !== '#' && location.pathname.startsWith(item.to.split('/')[1] ? `/${item.to.split('/')[1]}` : item.to);

    return (
      <Component
        {...(item.to !== '#' 
             ? { to: item.to } 
             : { onClick: () => isNotifications ? setNotificationsOpen(true) : setCommandPaletteOpen(true) }
        )}
        className={cn(
          "relative flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-300 group text-left w-full",
          isActive
            ? "bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]" 
            : "text-smash-text-secondary hover:text-white hover:bg-white/5 opacity-70 hover:opacity-100"
        )}
      >
        <item.icon size={20} className={cn("shrink-0", isActive && "text-[#D946EF]")} />
        
        {isNotifications && (
           <div className="absolute top-2.5 left-6 w-2 h-2 rounded-full bg-rose-500 border-2 border-black" />
        )}

        <AnimatePresence>
          {!isSidebarCollapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="font-medium text-sm whitespace-nowrap overflow-hidden"
            >
              {item.name}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Glowing side indicator for active state */}
        {isActive && (
          <motion.div
            layoutId="activeNavIndicator"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-[#D946EF] rounded-r-full shadow-[0_0_10px_#D946EF]"
          />
        )}

        {/* Floating Tooltip for collapsed state */}
        {isSidebarCollapsed && (
          <div className="absolute left-full ml-4 px-3 py-1.5 glass-3 rounded-md text-xs font-bold text-white opacity-0 group-hover:opacity-100 pointer-events-none translate-x-[-10px] group-hover:translate-x-0 transition-all z-50 whitespace-nowrap">
            {item.name}
          </div>
        )}
      </Component>
    );
  };

  return (
    <motion.aside
      animate={{ width: isSidebarCollapsed ? 80 : 256 }}
      className="hidden md:flex h-full shrink-0 flex-col gap-6 glass-1 border-r border-white/5 py-6 px-4 relative z-40 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
    >
      <div className="flex flex-col overflow-hidden px-2">
        <div className="flex items-center gap-3">
          <Logo size="md" showText={!isSidebarCollapsed} className="transition-transform duration-300" />
        </div>
        {!isSidebarCollapsed && (
          <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="text-[9px] uppercase tracking-[0.2em] text-smash-text-secondary mt-1 font-bold"
          >
            Smart Multi-AI System Hub
          </motion.p>
        )}
      </div>

      <nav className="flex flex-col gap-1 flex-1 overflow-y-auto overflow-x-hidden px-2">
        {!isSidebarCollapsed && <div className="text-[10px] uppercase tracking-widest text-smash-text-tertiary mb-2 font-black mt-2">Main Menu</div>}
        {mainNav.map(item => <NavItem key={item.name} item={item} />)}
      </nav>

      <div className="flex flex-col gap-1 px-2 mt-auto">
        {bottomNav.map(item => <NavItem key={item.name} item={item} />)}
      </div>

      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-8 w-6 h-6 rounded-full glass-3 border border-white/10 flex items-center justify-center text-smash-text-secondary hover:text-white hover:scale-110 transition-all z-50 shadow-lg"
      >
        {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </motion.aside>
  );
};
