// context/ThemeContext.js
// Stoic Design System - Minimal, disciplined, purposeful
// "Every element has a purpose. Clarity over decoration. Confidence through restraint."

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const THEME_STORAGE_KEY = "@poise_theme_preference";

// Stoic Design System Colors
const colors = {
  primary: {
    main: "#E63946",
    light: "#FF6B6B",
    dark: "#C1121F",
    muted: "#E6394620",
  },
  neutral: {
    black: "#0A0A0A",
    charcoal: "#1A1A1A",
    darkGray: "#2D2D2D",
    gray: "#6B6B6B",
    mediumGray: "#9A9A9A",
    lightGray: "#E5E5E5",
    offWhite: "#F5F5F5",
    white: "#FAFAFA",
    pureWhite: "#FFFFFF",
  },
  semantic: {
    success: "#22C55E",
    successMuted: "#22C55E15",
    warning: "#F59E0B",
    warningMuted: "#F59E0B15",
    error: "#E63946",
    errorMuted: "#E6394615",
    info: "#6B6B6B",
  },
};

// Typography Scale
export const typography = {
  hero: {
    fontSize: 48,
    lineHeight: 56,
    fontWeight: "700",
    letterSpacing: -1.5,
  },
  h1: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "600",
    letterSpacing: -0.25,
  },
  h3: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "600",
    letterSpacing: 0,
  },
  h4: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "600",
    letterSpacing: 0,
  },
  bodyLarge: {
    fontSize: 18,
    lineHeight: 28,
    fontWeight: "400",
    letterSpacing: 0,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400",
    letterSpacing: 0,
  },
  bodySmall: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400",
    letterSpacing: 0.1,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "400",
    letterSpacing: 0.2,
  },
  overline: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  button: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
    letterSpacing: 0.25,
  },
  buttonSmall: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    letterSpacing: 0.25,
  },
};

// Spacing Scale
export const spacing = {
  xxxs: 2,
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
  section: 80,
};

// Border Radius Scale
export const borderRadius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

// Shadows
export const shadows = {
  none: {
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: "#0A0A0A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: "#0A0A0A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: "#0A0A0A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: "#0A0A0A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: "#0A0A0A",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
  },
};

// Animation durations
export const animation = {
  instant: 100,
  fast: 150,
  normal: 250,
  slow: 350,
  slower: 500,
};

// Light Theme
const lightTheme = {
  colors: {
    // Primary
    primary: colors.primary.main,
    primaryLight: colors.primary.light,
    primaryDark: colors.primary.dark,
    primaryMuted: colors.primary.muted,

    // Background
    background: colors.neutral.white,
    backgroundSecondary: colors.neutral.pureWhite,
    backgroundTertiary: colors.neutral.offWhite,
    backgroundElevated: colors.neutral.pureWhite,

    // Surface (cards, modals)
    surface: colors.neutral.pureWhite,
    surfaceSecondary: colors.neutral.offWhite,

    // Text
    textPrimary: colors.neutral.black,
    textSecondary: colors.neutral.gray,
    textTertiary: colors.neutral.mediumGray,
    textInverted: colors.neutral.white,
    textAccent: colors.primary.main,
    textDisabled: colors.neutral.mediumGray,

    // Border
    border: colors.neutral.lightGray,
    borderMedium: "#D4D4D4",
    borderAccent: colors.primary.main,

    // Semantic
    success: colors.semantic.success,
    successMuted: colors.semantic.successMuted,
    warning: colors.semantic.warning,
    warningMuted: colors.semantic.warningMuted,
    error: colors.semantic.error,
    errorMuted: colors.semantic.errorMuted,
    info: colors.semantic.info,

    // Neutrals (for direct access)
    black: colors.neutral.black,
    charcoal: colors.neutral.charcoal,
    darkGray: colors.neutral.darkGray,
    gray: colors.neutral.gray,
    mediumGray: colors.neutral.mediumGray,
    lightGray: colors.neutral.lightGray,
    offWhite: colors.neutral.offWhite,
    white: colors.neutral.white,
    pureWhite: colors.neutral.pureWhite,

    // Component-specific
    inputBackground: colors.neutral.offWhite,
    inputBorder: colors.neutral.lightGray,
    inputFocusBorder: colors.neutral.black,
    cardBackground: colors.neutral.pureWhite,
    divider: colors.neutral.lightGray,
    overlay: "rgba(10, 10, 10, 0.6)",
    skeleton: colors.neutral.lightGray,
    skeletonHighlight: colors.neutral.offWhite,

    // Tab/Navigation
    tabActive: colors.neutral.black,
    tabInactive: colors.neutral.mediumGray,

    // Header
    headerBackground: colors.neutral.white,
    headerText: colors.neutral.black,
    headerIcon: colors.neutral.black,
  },
  typography,
  spacing,
  borderRadius,
  shadows,
  animation,
};

// Dark Theme
const darkTheme = {
  colors: {
    // Primary
    primary: colors.primary.main,
    primaryLight: colors.primary.light,
    primaryDark: colors.primary.dark,
    primaryMuted: colors.primary.muted,

    // Background
    background: colors.neutral.black,
    backgroundSecondary: colors.neutral.charcoal,
    backgroundTertiary: colors.neutral.darkGray,
    backgroundElevated: colors.neutral.charcoal,

    // Surface (cards, modals)
    surface: colors.neutral.charcoal,
    surfaceSecondary: colors.neutral.darkGray,

    // Text
    textPrimary: colors.neutral.white,
    textSecondary: colors.neutral.mediumGray,
    textTertiary: colors.neutral.gray,
    textInverted: colors.neutral.black,
    textAccent: colors.primary.light,
    textDisabled: colors.neutral.gray,

    // Border
    border: colors.neutral.darkGray,
    borderMedium: "#3D3D3D",
    borderAccent: colors.primary.main,

    // Semantic
    success: colors.semantic.success,
    successMuted: colors.semantic.successMuted,
    warning: colors.semantic.warning,
    warningMuted: colors.semantic.warningMuted,
    error: colors.semantic.error,
    errorMuted: colors.semantic.errorMuted,
    info: colors.semantic.info,

    // Neutrals (for direct access)
    black: colors.neutral.black,
    charcoal: colors.neutral.charcoal,
    darkGray: colors.neutral.darkGray,
    gray: colors.neutral.gray,
    mediumGray: colors.neutral.mediumGray,
    lightGray: colors.neutral.lightGray,
    offWhite: colors.neutral.offWhite,
    white: colors.neutral.white,
    pureWhite: colors.neutral.pureWhite,

    // Component-specific
    inputBackground: colors.neutral.darkGray,
    inputBorder: colors.neutral.darkGray,
    inputFocusBorder: colors.neutral.white,
    cardBackground: colors.neutral.charcoal,
    divider: colors.neutral.darkGray,
    overlay: "rgba(10, 10, 10, 0.8)",
    skeleton: colors.neutral.darkGray,
    skeletonHighlight: colors.neutral.charcoal,

    // Tab/Navigation
    tabActive: colors.neutral.white,
    tabInactive: colors.neutral.gray,

    // Header
    headerBackground: colors.neutral.black,
    headerText: colors.neutral.white,
    headerIcon: colors.neutral.white,
  },
  typography,
  spacing,
  borderRadius,
  shadows,
  animation,
};

export const themes = {
  light: lightTheme,
  dark: darkTheme,
};

// Default theme for fallback
const defaultTheme = lightTheme;

const ThemeContext = createContext({
  theme: defaultTheme,
  isDark: false,
  toggleTheme: () => {},
  setThemeMode: () => {},
});

export const ThemeProvider = ({ children }) => {
  const deviceColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(deviceColorScheme === "dark");
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme preference
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme !== null) {
          setIsDark(savedTheme === "dark");
        }
      } catch (error) {
        console.warn("Failed to load theme preference:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadThemePreference();
  }, []);

  // Save theme preference when it changes
  const saveThemePreference = async (darkMode) => {
    try {
      await AsyncStorage.setItem(
        THEME_STORAGE_KEY,
        darkMode ? "dark" : "light"
      );
    } catch (error) {
      console.warn("Failed to save theme preference:", error);
    }
  };

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const newValue = !prev;
      saveThemePreference(newValue);
      return newValue;
    });
  }, []);

  const setThemeMode = useCallback((mode) => {
    const darkMode = mode === "dark";
    setIsDark(darkMode);
    saveThemePreference(darkMode);
  }, []);

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, setThemeMode }}>
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
