import React, { createContext, useContext, useState, useEffect } from 'react';
import { themes, defaultTheme } from '../themes';

const ThemeContext = createContext();

export const useTheme = () => {
  return useContext(ThemeContext);
};

export const ThemeProvider = ({ children }) => {
  const [themeName, setThemeName] = useState(() => {
    return localStorage.getItem('theme') || defaultTheme;
  });

  useEffect(() => {
    const theme = themes[themeName] || themes[defaultTheme];
    
    Object.entries(theme.colors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--color-${key}`, value);
    });

    localStorage.setItem('theme', themeName);
    document.documentElement.setAttribute('data-theme', themeName);
  }, [themeName]);

  const setTheme = (theme) => {
    if (themes[theme]) {
      setThemeName(theme);
    }
  };

  const getTheme = () => {
    return {
      ...themes[themeName],
      name: themeName,
      setTheme,
      availableThemes: Object.keys(themes)
    };
  };

  return (
    <ThemeContext.Provider value={getTheme()}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;