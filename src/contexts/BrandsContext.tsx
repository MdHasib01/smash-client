import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { del, list, patch, post } from '../lib/api';
import { Brand } from '../types/api';
import { useAuth } from './AuthContext';

/**
 * Brands are the server's `Project` resource. This replaces the hardcoded
 * ['Milkimom','Baby Herbs','NextNeed','Personal'] arrays that used to be
 * duplicated across the Header, Assets and History screens.
 */
interface BrandsContextType {
  brands: Brand[];
  isLoading: boolean;
  error: string | null;
  activeBrand: Brand | null;
  setActiveBrandId: (id: string | null) => void;
  reload: () => Promise<void>;
  createBrand: (input: { name: string; description?: string; color?: string }) => Promise<Brand>;
  updateBrand: (id: string, input: Partial<Pick<Brand, 'name' | 'description' | 'color' | 'isArchived'>>) => Promise<Brand>;
  deleteBrand: (id: string) => Promise<void>;
}

const BrandsContext = createContext<BrandsContextType | undefined>(undefined);

const ACTIVE_KEY = 'smash.activeBrand';

const readStored = () => {
  try {
    return localStorage.getItem(ACTIVE_KEY);
  } catch {
    return null;
  }
};

export const BrandsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(readStored);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { items } = await list<Brand>('/projects', { limit: 100 });
      setBrands(items);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) reload();
    else setBrands([]);
  }, [user, reload]);

  const setActiveBrandId = useCallback((id: string | null) => {
    setActiveId(id);
    try {
      if (id) localStorage.setItem(ACTIVE_KEY, id);
      else localStorage.removeItem(ACTIVE_KEY);
    } catch {
      /* storage unavailable - selection just won't survive a reload */
    }
  }, []);

  // Fall back to the first brand when nothing is stored, or the stored one is gone.
  const activeBrand = useMemo(() => {
    if (!brands.length) return null;
    return brands.find((b) => b.id === activeId) ?? brands[0];
  }, [brands, activeId]);

  const createBrand: BrandsContextType['createBrand'] = useCallback(
    async (input) => {
      const brand = await post<Brand>('/projects', input);
      await reload();
      return brand;
    },
    [reload]
  );

  const updateBrand: BrandsContextType['updateBrand'] = useCallback(
    async (id, input) => {
      const brand = await patch<Brand>(`/projects/${id}`, input);
      await reload();
      return brand;
    },
    [reload]
  );

  const deleteBrand = useCallback(
    async (id: string) => {
      await del(`/projects/${id}`);
      if (activeId === id) setActiveBrandId(null);
      await reload();
    },
    [activeId, reload, setActiveBrandId]
  );

  return (
    <BrandsContext.Provider
      value={{ brands, isLoading, error, activeBrand, setActiveBrandId, reload, createBrand, updateBrand, deleteBrand }}
    >
      {children}
    </BrandsContext.Provider>
  );
};

export const useBrands = () => {
  const context = useContext(BrandsContext);
  if (context === undefined) {
    throw new Error('useBrands must be used within a BrandsProvider');
  }
  return context;
};
