import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getThemePreference, setThemePreference } from '../services/storage';
import { expiria } from '../theme';

type ThemeMode = 'light' | 'dark';

interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
  isLoaded: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('light');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = await getThemePreference();
        if (stored === 'light' || stored === 'dark') {
          setModeState(stored);
        }
      } catch {
        // Default to 'light' on failure (Requirement 5.8)
      } finally {
        setIsLoaded(true);
      }
    })();
  }, []);

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
    setThemePreference(newMode);
  }, []);

  const toggle = useCallback(() => {
    setModeState((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      setThemePreference(next);
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ mode, setMode, toggle, isLoaded }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeMode(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useThemeMode must be used within a ThemeProvider');
  }
  return ctx;
}

export type ExpiryColorPalette = { [K in keyof typeof expiria.colors]: string };

export function useThemeColors(): ExpiryColorPalette {
  const { mode } = useThemeMode();
  return (mode === 'dark' ? expiria.darkColors : expiria.colors) as ExpiryColorPalette;
}
