import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Sparkles, CheckSquare, History, MoreHorizontal, Settings, HelpCircle, Bell, Users, FolderHeart, GitMerge, LineChart, Contact, Building2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useGlobalUI } from '../../contexts/GlobalUIContext';
import { motion } from 'motion/react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../ui/sheet';

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
    { name: 'Brands', to: '/brands', icon: Building2 },
    { name: 'Personas', to: '/personas', icon: Contact },
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

  const itemClass = "flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 text-white/90 font-medium transition-colors";

  return (
    <>
      {/* More Drawer — non-modal so the bottom nav stays tappable while it is open. */}
      {isMoreOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm animate-in fade-in-0" />
      )}
      <Sheet open={isMoreOpen} onOpenChange={setIsMoreOpen} modal={false}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          onOpenAutoFocus={(e) => e.preventDefault()}
          onInteractOutside={(e) => {
            if ((e.target as HTMLElement | null)?.closest('[data-bottom-nav]')) e.preventDefault();
          }}
          className="z-40 md:hidden bottom-16 rounded-t-3xl border-t border-white/10 p-4 pb-8 max-h-[70vh] overflow-y-auto gap-0"
        >
          <SheetHeader className="p-0">
            <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6" />
            <SheetTitle className="sr-only">More</SheetTitle>
            <SheetDescription className="sr-only">Additional navigation</SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-2">
            {moreNav.map(item => {
              const isNotifications = item.action === 'NOTIFICATIONS';
              const inner = (
                <>
                  <div className="relative">
                    <item.icon size={20} className="text-smash-text-secondary" />
                    {isNotifications && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-smash-panel" />
                    )}
                  </div>
                  {item.name}
                </>
              );

              return item.to !== '#' ? (
                <NavLink key={item.name} to={item.to} onClick={() => setIsMoreOpen(false)} className={itemClass}>
                  {inner}
                </NavLink>
              ) : (
                <button
                  key={item.name}
                  onClick={() => {
                    if (isNotifications) setNotificationsOpen(true);
                    else setCommandPaletteOpen(true);
                    setIsMoreOpen(false);
                  }}
                  className={cn(itemClass, "text-left")}
                >
                  {inner}
                </button>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>

      <nav data-bottom-nav className="md:hidden glass-2 border-x-0 border-b-0 border-t border-white/5 flex items-center justify-around h-16 px-2 shrink-0 relative z-50">
        {mainNav.map(item => {
          const isActive = location.pathname.startsWith(item.to.split('/')[1] ? `/${item.to.split('/')[1]}` : item.to);

          return (
            <NavLink
              key={item.name}
              to={item.to}
              onClick={() => setIsMoreOpen(false)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 w-16 h-full relative transition-colors",
                isActive ? "text-[#D946EF]" : "text-smash-text-secondary"
              )}
            >
              <item.icon size={20} className={isActive ? "fill-[#D946EF]/20" : ""} />
              <span className="text-[9px] font-bold tracking-widest">{item.name}</span>
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
            "flex flex-col items-center justify-center gap-1 w-16 h-full relative transition-colors",
            isMoreOpen ? "text-white" : "text-smash-text-secondary"
          )}
        >
          <MoreHorizontal size={20} />
          <span className="text-[9px] font-bold tracking-widest">MORE</span>
        </button>
      </nav>
    </>
  );
};
