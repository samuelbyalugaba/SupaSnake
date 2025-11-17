"use client";

import { useSettings } from "@/context/SettingsContext";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

export default function AppWithSettings({ children }: { children: React.ReactNode }) {
  const { theme } = useSettings();

  useEffect(() => {
    const root = window.document.documentElement;
    
    root.classList.remove('light', 'dark', 'neon');
    
    if (theme === 'neon') {
        // Neon is default, no class needed if we set it up that way in globals.css
    } else {
        root.classList.add(theme);
    }
  }, [theme]);

  return (
    <div className={cn("h-full flex flex-col", theme)}>
        {children}
    </div>
  )
}
