import React, { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { del, list, patch, post, upload } from '../lib/api';
import { Persona, PersonaReference, ReferenceRole, StylePreset } from '../types/api';
import { useAuth } from './AuthContext';
import { useBrands } from './BrandsContext';

export interface ReferenceUpload {
  file: File;
  label: string;
  role: ReferenceRole;
  notes?: string;
  isPrimary?: boolean;
}

interface PersonasContextType {
  personas: Persona[];
  styles: StylePreset[];
  isLoading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  reloadStyles: () => Promise<void>;
  createPersona: (input: Partial<Persona> & { name: string; kind: string; project: string }) => Promise<Persona>;
  updatePersona: (id: string, input: Partial<Persona>) => Promise<Persona>;
  deletePersona: (id: string) => Promise<void>;
  duplicatePersona: (id: string) => Promise<Persona>;
  addReference: (personaId: string, input: ReferenceUpload) => Promise<Persona>;
  updateReference: (personaId: string, refId: string, input: Partial<PersonaReference>) => Promise<Persona>;
  removeReference: (personaId: string, refId: string) => Promise<Persona>;
  createStyle: (input: { name: string; prompt: string; description?: string; project?: string }) => Promise<StylePreset>;
}

const PersonasContext = createContext<PersonasContextType | undefined>(undefined);

export const PersonasProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { activeBrand } = useBrands();
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [styles, setStyles] = useState<StylePreset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      // No brand filter: the Personas screen groups across brands itself.
      const { items } = await list<Persona>('/personas', { limit: 100 });
      setPersonas(items);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const reloadStyles = useCallback(async () => {
    if (!user) return;
    try {
      const { items } = await list<StylePreset>('/styles', { limit: 100 });
      setStyles(items);
    } catch (err) {
      setError((err as Error).message);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setPersonas([]);
      setStyles([]);
      return;
    }
    reload();
    reloadStyles();
  }, [user, reload, reloadStyles]);

  // A new brand can bring personas the current list has not seen.
  useEffect(() => {
    if (user && activeBrand) reload();
  }, [activeBrand?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const createPersona: PersonasContextType['createPersona'] = useCallback(
    async (input) => {
      const persona = await post<Persona>('/personas', input);
      await reload();
      return persona;
    },
    [reload]
  );

  const updatePersona: PersonasContextType['updatePersona'] = useCallback(
    async (id, input) => {
      const persona = await patch<Persona>(`/personas/${id}`, input);
      setPersonas((prev) => prev.map((p) => (p.id === id ? persona : p)));
      return persona;
    },
    []
  );

  const deletePersona = useCallback(
    async (id: string) => {
      await del(`/personas/${id}`);
      setPersonas((prev) => prev.filter((p) => p.id !== id));
    },
    []
  );

  const duplicatePersona = useCallback(
    async (id: string) => {
      const persona = await post<Persona>(`/personas/${id}/duplicate`);
      await reload();
      return persona;
    },
    [reload]
  );

  /** One round trip: the file and its label go up together. */
  const addReference = useCallback(async (personaId: string, input: ReferenceUpload) => {
    const form = new FormData();
    form.append('file', input.file);
    form.append('label', input.label);
    form.append('role', input.role);
    if (input.notes) form.append('notes', input.notes);
    if (input.isPrimary) form.append('isPrimary', 'true');

    const persona = await upload<Persona>(`/personas/${personaId}/references`, form);
    setPersonas((prev) => prev.map((p) => (p.id === personaId ? persona : p)));
    return persona;
  }, []);

  const updateReference = useCallback(
    async (personaId: string, refId: string, input: Partial<PersonaReference>) => {
      const persona = await patch<Persona>(`/personas/${personaId}/references/${refId}`, input);
      setPersonas((prev) => prev.map((p) => (p.id === personaId ? persona : p)));
      return persona;
    },
    []
  );

  const removeReference = useCallback(async (personaId: string, refId: string) => {
    const persona = await del<Persona>(`/personas/${personaId}/references/${refId}`);
    setPersonas((prev) => prev.map((p) => (p.id === personaId ? persona : p)));
    return persona;
  }, []);

  const createStyle: PersonasContextType['createStyle'] = useCallback(
    async (input) => {
      const style = await post<StylePreset>('/styles', input);
      await reloadStyles();
      return style;
    },
    [reloadStyles]
  );

  return (
    <PersonasContext.Provider
      value={{
        personas,
        styles,
        isLoading,
        error,
        reload,
        reloadStyles,
        createPersona,
        updatePersona,
        deletePersona,
        duplicatePersona,
        addReference,
        updateReference,
        removeReference,
        createStyle,
      }}
    >
      {children}
    </PersonasContext.Provider>
  );
};

export const usePersonas = () => {
  const context = useContext(PersonasContext);
  if (context === undefined) {
    throw new Error('usePersonas must be used within a PersonasProvider');
  }
  return context;
};
