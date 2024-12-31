// context/ThemeContext.js
import React, { createContext, useContext, useState, useCallback } from "react";
import { useColorScheme } from "react-native";

const baseColors = {
  // Primary brand colors
  primary: "#FF0000", // Red instead of blue
  primaryDark: "#CC0000",
  primaryLight: "#FF4D4D",

  // Basic colors
  white: "#FFFFFF",
  black: "#000000",

  // Status colors
  success: "#4CAF50",
  error: "#FF453A",
  warning: "#FFD60A",
  info: "#0A84FF",
};

export const themes = {
  light: {
    colors: {
      primary: baseColors.primary,
      primaryDark: baseColors.primaryDark,
      primaryLight: baseColors.primaryLight,
      background: "#FFFFFF",
      surface: "#F5F5F5",
      surfaceLight: "#FAFAFA",
      card: "#FFFFFF",
      textPrimary: "#000000",
      textSecondary: "#666666",
      textDisabled: "#999999",
      textInverted: "#FFFFFF",
      border: "#E0E0E0",
      divider: "#EEEEEE",
      shadow: "#000000",
      accent1: "#FF0000",
      accent2: "#CC0000",
      accent3: "#F5F5F5",
      accent4: "#E0E0E0",
      ...baseColors,
    },
  },
  dark: {
    colors: {
      primary: baseColors.primary,
      primaryDark: baseColors.primaryDark,
      primaryLight: baseColors.primaryLight,
      background: "#000000",
      surface: "#121212",
      surfaceLight: "#1E1E1E",
      card: "#121212",
      textPrimary: "#FFFFFF",
      textSecondary: "#B3B3B3",
      textDisabled: "#666666",
      textInverted: "#000000",
      border: "#333333",
      divider: "#1E1E1E",
      shadow: "#000000",
      accent1: "#FF3333",
      accent2: "#990000",
      accent3: "#1E1E1E",
      accent4: "#2C2C2C",
      ...baseColors,
    },
  },
};

// Ensure theme is always available with default values
const defaultTheme = themes.light;

const ThemeContext = createContext({
  theme: defaultTheme,
  isDark: false,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  const deviceColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(deviceColorScheme === "dark");

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => !prev);
  }, []);

  const theme = isDark ? themes.dark : themes.light;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export default ThemeContext;
