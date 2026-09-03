import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeId, ThemeMode, ThemeDefinition, getTheme } from '../styles/themes';
import { audio } from '../services/audio';

const STORAGE_KEY_THEME = 'playflix_theme_v2';
const STORAGE_KEY_MODE = 'playflix_mode_v2';

interface ThemeContextType {
  theme: ThemeId;
  themeDefinition: ThemeDefinition;
  mode: ThemeMode;
  setTheme: (themeId: ThemeId) => void;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  isThemePickerOpen: boolean;
  setIsThemePickerOpen: (open: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeId>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_THEME) as ThemeId;
      if (saved && ['kawaii', 'japanese', 'isometric', 'futuristic', 'luxury'].includes(saved)) {
        return saved;
      }
    } catch (e) {
      console.warn('Could not read saved theme:', e);
    }
    return 'futuristic'; // Thème par défaut moderne
  });

  const [mode, setModeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MODE) as ThemeMode;
      if (saved && ['dark', 'light'].includes(saved)) {
        return saved;
      }
    } catch (e) {
      console.warn('Could not read saved mode:', e);
    }
    return 'dark';
  });

  const [isThemePickerOpen, setIsThemePickerOpen] = useState<boolean>(false);

  // Synchronise les attributs HTML pour CSS et Tailwind
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.setAttribute('data-mode', mode);

    try {
      localStorage.setItem(STORAGE_KEY_THEME, theme);
      localStorage.setItem(STORAGE_KEY_MODE, mode);
    } catch (e) {
      console.warn('Could not save theme to storage:', e);
    }
  }, [theme, mode]);

  const setTheme = (newTheme: ThemeId) => {
    audio.playSelect();
    setThemeState(newTheme);
  };

  const setMode = (newMode: ThemeMode) => {
    audio.playSelect();
    setModeState(newMode);
  };

  const toggleMode = () => {
    audio.playDiceRoll();
    setModeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const themeDefinition = getTheme(theme);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeDefinition,
        mode,
        setTheme,
        setMode,
        toggleMode,
        isThemePickerOpen,
        setIsThemePickerOpen,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
