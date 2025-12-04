
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { colors } from '@/styles/commonStyles';

// Module color mapping using Flow Fam palette
export const MODULE_COLORS = {
  agenda: '#4A90E2',           // Blue (keep for calendar)
  tasks: '#7ED321',            // Green (keep for tasks)
  shopping: '#f08a48',         // warm orange
  finances: '#34C759',         // Green (keep for money)
  memories: '#e53f59',         // red/pink
  meals: '#f08a48',            // warm orange
  notes: '#cfa692',            // soft beige-rose
  documents: '#50E3C2',        // Turquoise (keep for docs)
  shop: '#e53f59',             // red/pink
  profile: '#cfa692',          // soft beige-rose
  home: colors.warmOrange,     // warm orange
} as const;

export type ModuleName = keyof typeof MODULE_COLORS;

interface ThemeContextType {
  currentModule: ModuleName;
  accentColor: string;
  setModule: (module: ModuleName) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  module?: ModuleName;
}

export function ModuleThemeProvider({ children, module = 'home' }: ThemeProviderProps) {
  const [currentModule, setCurrentModule] = useState<ModuleName>(module);
  const accentColor = MODULE_COLORS[currentModule];

  const setModule = (newModule: ModuleName) => {
    setCurrentModule(newModule);
  };

  return (
    <ThemeContext.Provider value={{ currentModule, accentColor, setModule }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useModuleTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useModuleTheme must be used within a ModuleThemeProvider');
  }
  return context;
}

// Hook to get accent color for a specific module without changing context
export function useModuleColor(module: ModuleName): string {
  return MODULE_COLORS[module];
}
