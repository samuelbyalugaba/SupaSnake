
'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useCosmetics as useCosmeticsHook } from '@/hooks/use-cosmetics';

// Extract the return type of the hook
type CosmeticsHookType = ReturnType<typeof useCosmeticsHook>;

// Create the context with a default undefined value
const CosmeticsContext = createContext<CosmeticsHookType | undefined>(undefined);

// Provider component
export const CosmeticsProvider = ({ children }: { children: ReactNode }) => {
  const cosmetics = useCosmeticsHook();
  return <CosmeticsContext.Provider value={cosmetics}>{children}</CosmeticsContext.Provider>;
};

// Custom hook to use the context.
export const useCosmetics = () => {
  const context = useContext(CosmeticsContext);
  if (context === undefined) {
    throw new Error('useCosmetics must be used within a CosmeticsProvider');
  }
  return context;
};
