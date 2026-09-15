import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useBrands } from './BrandsContext';

interface GlobalUIContextType {
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (v: boolean) => void;
  isInspectorOpen: boolean;
  toggleInspector: () => void;
  setInspectorOpen: (v: boolean) => void;
  inspectorContent: ReactNode;
  setInspectorContent: (content: ReactNode) => void;
  inspectorTitle: string;
  setInspectorTitle: (title: string) => void;
  isCommandPaletteOpen: boolean;
  toggleCommandPalette: () => void;
  setCommandPaletteOpen: (v: boolean) => void;
  isNotificationsOpen: boolean;
  setNotificationsOpen: (v: boolean) => void;
  /** Name of the active brand; backed by BrandsContext. */
  activeProject: string;
  /** Accepts a brand name or id. */
  setActiveProject: (v: string) => void;
  isBrandManagerOpen: boolean;
  setBrandManagerOpen: (v: boolean) => void;
  currentMode: string;
  setCurrentMode: (v: string) => void;
}

const GlobalUIContext = createContext<GlobalUIContextType | undefined>(undefined);

export const GlobalUIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { brands, activeBrand, setActiveBrandId } = useBrands();
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isInspectorOpen, setInspectorOpen] = useState(false);
  const [inspectorContent, setInspectorContent] = useState<ReactNode>(null);
  const [inspectorTitle, setInspectorTitle] = useState('Inspector');
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);
  const [isBrandManagerOpen, setBrandManagerOpen] = useState(false);
  const [currentMode, setCurrentMode] = useState('text');

  const toggleSidebar = () => setSidebarCollapsed(!isSidebarCollapsed);
  const toggleInspector = () => setInspectorOpen(!isInspectorOpen);
  const toggleCommandPalette = () => setCommandPaletteOpen(!isCommandPaletteOpen);

  const setActiveProject = (value: string) => {
    const brand = brands.find((b) => b.id === value || b.name === value);
    if (brand) setActiveBrandId(brand.id);
  };

  return (
    <GlobalUIContext.Provider
      value={{
        isSidebarCollapsed,
        toggleSidebar,
        setSidebarCollapsed,
        isInspectorOpen,
        toggleInspector,
        setInspectorOpen,
        inspectorContent,
        setInspectorContent,
        inspectorTitle,
        setInspectorTitle,
        isCommandPaletteOpen,
        toggleCommandPalette,
        setCommandPaletteOpen,
        isNotificationsOpen,
        setNotificationsOpen,
        activeProject: activeBrand?.name ?? '',
        setActiveProject,
        isBrandManagerOpen,
        setBrandManagerOpen,
        currentMode,
        setCurrentMode,
      }}
    >
      {children}
    </GlobalUIContext.Provider>
  );
};

export const useGlobalUI = () => {
  const context = useContext(GlobalUIContext);
  if (context === undefined) {
    throw new Error('useGlobalUI must be used within a GlobalUIProvider');
  }
  return context;
};
