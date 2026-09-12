import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Sparkles, CheckSquare, History, MoreHorizontal, Settings, HelpCircle, Bell, Users, FolderHeart, GitMerge, LineChart } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useGlobalUI } from '../../contexts/GlobalUIContext';
import { AnimatePresence, motion } from 'motion/react';

export const BottomNav: React.FC = () => {
  const { currentMode, setNotificationsOpen, setCommandPaletteOpen } = useGlobalUI();
  const location = useLocation();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const mainNav = [
    { name: 'HOME', to: '/dashboard', icon: LayoutDashboard },
    { name: 'CREATE', to: `/generate/${currentMode}`, icon: Sparkles },
    { name: 'RESULTS', to: '/results', icon: CheckSquare },
    { name: 'TASKS', to: '/history', icon: History },
  ];

  const moreNav = [
    { name: 'Accounts', to: '/accounts', icon: Users },
    { name: 'Assets', to: '/assets', icon: FolderHeart },
    { name: 'Workflows', to: '/workflows', icon: GitMerge },
    { name: 'Analytics', to: '/analytics', icon: LineChart },
    { name: 'Notifications', to: '#', icon: Bell, action: 'NOTIFICATIONS' },
    { name: 'Settings', to: '/settings', icon: Settings },
    { name: 'Help', to: '/help', icon: HelpCircle },
  ];

  const handleMoreClick = () => {
    setIsMoreOpen(!isMoreOpen);
  };

  return (
    <>
      {/* More Drawer Overlay */}
      <AnimatePresence>
        {isMoreOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMoreOpen(false)}
              className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed bottom-16 left-0 right-0 glass-2 border-t border-white/10 p-4 rounded-t-3xl z-40 md:hidden max-h-[70vh] overflow-y-auto pb-8"
            >
              <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6" />
              <div className="flex flex-col gap-2">
                {moreNav.map(item => {
                  const Component = item.to === '#' ? 'button' : NavLink;
                  const isNotifications = item.action === 'NOTIFICATIONS';

                  return (
                    <Component
                      key={item.name}
                      {...(item.to !== '#' 
                        ? { to: item.to, onClick: () => setIsMoreOpen(false) } 
                        : { onClick: () => { 
                            if (isNotifications) setNotificationsOpen(true); 
                            else setCommandPaletteOpen(true); 
                            setIsMoreOpen(false); 
                          }}
                      )}
                      className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 text-white/90 font-medium"
                    >
                      <div className="relative">
                        <item.icon size={20} className="text-smash-text-secondary" />
                        {isNotifications && (
                           <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 border-2 border-black" />
                        )}
                      </div>
                      {item.name}
                    </Component>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <nav className="md:hidden glass-2 border-t border-white/5 flex items-center justify-around h-16 px-2 shrink-0 relative z-50">
        {mainNav.map(item => {
          const isActive = location.pathname.startsWith(item.to.split('/')[1] ? `/${item.to.split('/')[1]}` : item.to);
          
          return (
            <NavLink
              key={item.name}
              to={item.to}
              onClick={() => setIsMoreOpen(false)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 w-16 h-full relative",
                isActive ? "text-[#D946EF]" : "text-smash-text-secondary"
              )}
            >
              <item.icon size={20} className={isActive ? "fill-[#D946EF]/20" : ""} />
              <span className="text-[9px] font-black tracking-widest">{item.name}</span>
              {isActive && (
                <motion.div 
                  layoutId="mobileNavIndicator"
                  className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-1 bg-[#D946EF] rounded-b-full shadow-[0_0_10px_#D946EF]"
                />
              )}
            </NavLink>
          );
        })}
        <button
          onClick={handleMoreClick}
          className={cn(
            "flex flex-col items-center justify-center gap-1 w-16 h-full relative",
            isMoreOpen ? "text-white" : "text-smash-text-secondary"
          )}
        >
          <MoreHorizontal size={20} />
          <span className="text-[9px] font-black tracking-widest">MORE</span>
        </button>
      </nav>
    </>
  );
};
