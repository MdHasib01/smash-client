import React, { useEffect } from 'react';
import { useGlobalUI } from '../../contexts/GlobalUIContext';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { Header } from './Header';
import { RightInspector } from './RightInspector';
import { CommandPalette } from './CommandPalette';
import { NotificationsPanel } from './NotificationsPanel';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Setup global keyboard shortcuts or responsive behavior here
  const { setSidebarCollapsed, isNotificationsOpen, setNotificationsOpen } = useGlobalUI();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      }
    };
    
    // Initial check
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setSidebarCollapsed]);

  return (
    <div className="flex h-screen w-screen overflow-hidden text-smash-text-primary">
      {/* Background radial gradients are applied globally via CSS */}
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 relative">
        <Header />
        <main className="flex-1 flex overflow-hidden relative">
          <div className="flex-1 flex flex-col overflow-hidden relative">
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 lg:p-10">
              {children}
            </div>
            <BottomNav />
          </div>
          <RightInspector />
        </main>
      </div>
      <CommandPalette />
      <NotificationsPanel isOpen={isNotificationsOpen} onClose={() => setNotificationsOpen(false)} />
    </div>
  );
};
