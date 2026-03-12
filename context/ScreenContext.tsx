'use client';

import { createContext, useContext, useState, useCallback } from 'react';

interface ScreenContextValue {
  /** ID of the currently selected screen, or null if none */
  selectedScreenId: number | null;
  /** Select a screen by ID. Pass null to deselect. */
  selectScreen: (id: number | null) => void;
  /** Toggle selection - selects if not selected, deselects if already selected */
  toggleScreen: (id: number) => void;
}

const ScreenContext = createContext<ScreenContextValue | null>(null);

export function ScreenProvider({ children }: { children: React.ReactNode }) {
  const [selectedScreenId, setSelectedScreenId] = useState<number | null>(null);

  const selectScreen = useCallback((id: number | null) => {
    setSelectedScreenId(id);
  }, []);

  const toggleScreen = useCallback((id: number) => {
    setSelectedScreenId((prev) => (prev === id ? null : id));
  }, []);

  return (
    <ScreenContext.Provider value={{ selectedScreenId, selectScreen, toggleScreen }}>
      {children}
    </ScreenContext.Provider>
  );
}

export function useScreenContext(): ScreenContextValue {
  const ctx = useContext(ScreenContext);
  if (!ctx) throw new Error('useScreenContext must be used inside ScreenProvider');
  return ctx;
}
