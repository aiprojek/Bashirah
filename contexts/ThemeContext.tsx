import React, { createContext, useContext, useEffect, useState } from 'react';
import * as DB from '../services/db';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initTheme = async () => {
      const savedTheme = await DB.getSetting('theme') as Theme;
      if (savedTheme) {
        setTheme(savedTheme);
      }
      setIsLoading(false);
    };
    initTheme();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const root = window.document.documentElement;
    
    // Apply class to HTML tag
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    DB.setSetting('theme', theme);
  }, [theme, isLoading]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
