"use client";

import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';

export type Theme = "neon" | "light" | "dark";

interface SettingsContextType {
  isMuted: boolean;
  toggleMute: () => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [theme, setThemeState] = useState<Theme>('neon');
  
  useEffect(() => {
    const storedTheme = localStorage.getItem('supa-snake-theme') as Theme | null;
    if (storedTheme && ['neon', 'light', 'dark'].includes(storedTheme)) {
      setThemeState(storedTheme);
    }
  }, []);


  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('supa-snake-theme', newTheme);
  };

  return (
    <SettingsContext.Provider value={{ isMuted, toggleMute, theme, setTheme }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
