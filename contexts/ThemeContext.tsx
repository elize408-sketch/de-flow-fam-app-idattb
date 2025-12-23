
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { colors } from '@/styles/commonStyles';

// Module color mapping using Flow Fam palette
// Function colors are subtle accents, not dominant
export const MODULE_COLORS = {
  agenda: '#4A90E2',           // Blue accent (small icons, status)
  tasks: '#7ED321',            // Green accent (checkbox, progress)
  shopping: '#f08a48',         // Orange accent (primary)
  finances: '#34C759',         // Green accent (money)
  memories: '#e53f59',         // Red accent (photos)
  meals: '#f08a48',            // Orange accent (food)
  notes: '#cfa692',            // Beige accent (notes)
  documents: '#50E3C2',        // Teal accent (docs)
  shop: '#e53f59',             // Red accent (rewards)
  profile: '#cfa692',          // Beige accent (profile)
  home: colors.warmOrange,     // Primary orange
  contactbook: '#9013FE',      // Purple accent (contacts)
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
