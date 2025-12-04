
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { colors } from '@/styles/commonStyles';

// Module color mapping based on homepage icons
export const MODULE_COLORS = {
  agenda: '#4A90E2',           // Blue
  tasks: '#4CAF50',            // Green (matching home button)
  shopping: '#F5A623',         // Orange
  finances: '#34C759',         // Green
  memories: '#9013FE',         // Purple (Fotoboek)
  meals: '#FF6B9D',            // Pink
  notes: '#F5A623',            // Orange
  documents: '#50E3C2',        // Turquoise
  shop: '#50E3C2',             // Mint/Turquoise
  profile: '#999999',          // Grey
  home: colors.accent,         // Default
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
