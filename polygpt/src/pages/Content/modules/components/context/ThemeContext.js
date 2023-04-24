import React, { createContext, useState, useCallback } from 'react';
import { LightThemeType } from '../codes/ThemeType';
const LOCAL_STORAGE_THEME_KEY = 'chatbot:theme:key';
const defaultTheme = window.localStorage.getItem(LOCAL_STORAGE_THEME_KEY) || LightThemeType;

export const ThemeContext = createContext({
  theme: defaultTheme,
  changeTheme: (theme) => {},
});

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(defaultTheme);

  const changeTheme = useCallback((theme) => {
    window.localStorage.setItem(LOCAL_STORAGE_THEME_KEY, theme);
    setTheme(theme);
  }, []);

  return <ThemeContext.Provider value={{ theme, changeTheme }}>{children}</ThemeContext.Provider>;
};

export default ThemeProvider;
