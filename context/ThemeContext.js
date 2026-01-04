// context/ThemeContext.js
// Velvet Design System - Sophisticated, discreet, and refined
// "Elegance through warmth. Premium through subtlety. Confidence through sophistication."

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

// Velvet Design System Colors
const colors = {
  // Brand colors - Deep purples with warm undertones
  primary: {
    50: "#FAF5FF",
    100: "#F3E8FF",
    200: "#E9D5FF",
    300: "#D8B4FE",
    400: "#C084FC",
    500: "#A855F7", // Main brand color - Royal Purple
    600: "#9333EA",
    700: "#7E22CE",
    800: "#6B21A8",
    900: "#581C87",
  },

  // Accent - Warm rose gold for highlights
  accent: {
    50: "#FFF1F2",
    100: "#FFE4E6",
    200: "#FECDD3",
    300: "#FDA4AF",
    400: "#FB7185",
    500: "#F43F5E", // Rose
    600: "#E11D48",
    700: "#BE123C",
    800: "#9F1239",
    900: "#881337",
  },

  // Neutrals - Warm grays with depth
  neutral: {
    50: "#FAFAF9",
    100: "#F5F5F4",
    200: "#E7E5E4",
    300: "#D6D3D1",
    400: "#A8A29E",
    500: "#78716C",
    600: "#57534E",
    700: "#44403C",
    800: "#292524",
    900: "#1C1917",
    950: "#0C0A09", // Deep background
  },

  // Semantic colors
  semantic: {
    success: "#10B981", // Emerald
    successMuted: "#10B98115",
    warning: "#F59E0B", // Amber
    warningMuted: "#F59E0B15",
    error: "#EF4444", // Red
    errorMuted: "#EF444415",
    info: "#6366F1", // Indigo
    infoMuted: "#6366F115",
  },

  // Special surfaces
  glass: "rgba(255, 255, 255, 0.05)",
  glassHeavy: "rgba(255, 255, 255, 0.08)",
  glassDark: "rgba(0, 0, 0, 0.3)",
  overlay: "rgba(12, 10, 9, 0.7)",
  shimmer: "rgba(168, 85, 247, 0.1)",
  shimmerLight: "rgba(168, 85, 247, 0.05)",
};

// Typography Scale
export const typography = {
  hero: {
    fontSize: 43,
    lineHeight: 47,
    fontWeight: "700",
    letterSpacing: -1.3,
  },
  h1: {
    fontSize: 35,
    lineHeight: 42,
    fontWeight: "700",
    letterSpacing: -0.7,
  },
  h2: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "600",
    letterSpacing: -0.56,
  },
  h3: {
    fontSize: 23,
    lineHeight: 30,
    fontWeight: "600",
    letterSpacing: -0.46,
  },
  h4: {
    fontSize: 19,
    lineHeight: 25,
    fontWeight: "600",
    letterSpacing: 0,
  },
  bodyLarge: {
    fontSize: 17,
    lineHeight: 26,
    fontWeight: "400",
    letterSpacing: 0,
  },
  body: {
    fontSize: 15,
    lineHeight: 23,
    fontWeight: "400",
    letterSpacing: 0,
  },
  bodySmall: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "400",
    letterSpacing: 0.13,
  },
  caption: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "400",
    letterSpacing: 0.22,
  },
  overline: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "600",
    letterSpacing: 0.88,
    textTransform: "uppercase",
  },
  button: {
    fontSize: 15,
    lineHeight: 23,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  buttonSmall: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
    letterSpacing: 0.26,
  },
};

// Spacing Scale (4px grid system)
export const spacing = {
  px: 1,
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

// Border Radius Scale - Softer, more premium feel
export const borderRadius = {
  none: 0,
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  "2xl": 32,
  full: 9999,
};

// Shadows with glow effects for premium feel
export const shadows = {
  none: {
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: "#0C0A09",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: "#0C0A09",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: "#0C0A09",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: "#0C0A09",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  xl: {
    shadowColor: "#0C0A09",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.1,
    shadowRadius: 25,
    elevation: 12,
  },
  "2xl": {
    shadowColor: "#0C0A09",
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.25,
    shadowRadius: 50,
    elevation: 16,
  },
  // Glow effects
  glow: {
    sm: {
      shadowColor: "#A855F7",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 4,
    },
    md: {
      shadowColor: "#A855F7",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 20,
      elevation: 8,
    },
    lg: {
      shadowColor: "#A855F7",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 30,
      elevation: 12,
    },
  },
};

// Animation durations and easing
export const animation = {
  // Duration
  duration: {
    instant: 75,
    fast: 150,
    base: 250,
    slow: 350,
    slower: 500,
    lazy: 750,
  },
  // Legacy support
  instant: 75,
  fast: 150,
  normal: 250,
  slow: 350,
  slower: 500,
};

// Gradients for premium UI elements
export const gradients = {
  primary: ["#9333EA", "#7E22CE"],
  primaryLight: ["#A855F7", "#9333EA"],
  accent: ["#F43F5E", "#E11D48"],
  surface: ["rgba(255,255,255,0.08)", "rgba(255,255,255,0.02)"],
  dark: ["#1C1917", "#0C0A09"],
};

// Component-specific design tokens
const componentTokens = {
  // Message bubbles with asymmetric border radius
  messageBubble: {
    user: {
      borderRadii: {
        topLeft: borderRadius.xl,
        topRight: borderRadius.xl,
        bottomLeft: borderRadius.xl,
        bottomRight: borderRadius.xs,
      },
    },
    assistant: {
      borderRadii: {
        topLeft: borderRadius.xl,
        topRight: borderRadius.xl,
        bottomLeft: borderRadius.xs,
        bottomRight: borderRadius.xl,
      },
    },
  },
  // Glass morphism settings
  glass: {
    blur: 20,
    opacity: 0.05,
  },
};

// Dark Theme (Primary - Velvet aesthetic)
const darkTheme = {
  colors: {
    // Primary brand
    primary: colors.primary[500],
    primaryLight: colors.primary[400],
    primaryDark: colors.primary[600],
    primaryMuted: colors.shimmer,

    // Background hierarchy
    background: colors.neutral[950],
    backgroundSecondary: colors.neutral[900],
    backgroundTertiary: colors.neutral[800],
    backgroundElevated: colors.neutral[800],

    // Glass surfaces
    surface: colors.glass,
    surfaceHeavy: colors.glassHeavy,
    surfaceSecondary: colors.neutral[800],

    // Text hierarchy
    textPrimary: colors.neutral[50],
    textSecondary: colors.neutral[300],
    textTertiary: colors.neutral[400],
    textMuted: colors.neutral[500],
    textInverted: colors.neutral[950],
    textAccent: colors.primary[400],
    textDisabled: colors.neutral[600],

    // Borders
    border: colors.neutral[800],
    borderLight: colors.neutral[700],
    borderMedium: colors.neutral[700],
    borderAccent: colors.primary[500],

    // Semantic colors
    success: colors.semantic.success,
    successMuted: colors.semantic.successMuted,
    warning: colors.semantic.warning,
    warningMuted: colors.semantic.warningMuted,
    error: colors.semantic.error,
    errorMuted: colors.semantic.errorMuted,
    info: colors.semantic.info,
    infoMuted: colors.semantic.infoMuted,

    // Legacy neutral access (for backward compatibility)
    black: colors.neutral[950],
    charcoal: colors.neutral[900],
    darkGray: colors.neutral[800],
    gray: colors.neutral[500],
    mediumGray: colors.neutral[400],
    lightGray: colors.neutral[200],
    offWhite: colors.neutral[100],
    white: colors.neutral[50],
    pureWhite: "#FFFFFF",

    // Component-specific colors
    inputBackground: colors.neutral[900],
    inputBorder: colors.neutral[700],
    inputFocusBorder: colors.primary[500],
    cardBackground: colors.glass,
    divider: colors.neutral[800],
    overlay: colors.overlay,
    skeleton: colors.neutral[800],
    skeletonHighlight: colors.neutral[700],

    // Tab/Navigation
    tabActive: colors.neutral[50],
    tabInactive: colors.neutral[500],

    // Header (glass morphism)
    headerBackground: "rgba(12, 10, 9, 0.8)",
    headerText: colors.neutral[50],
    headerIcon: colors.neutral[50],

    // Message bubbles
    userBubble: colors.primary[600],
    userBubbleGradientStart: colors.primary[600],
    userBubbleGradientEnd: colors.primary[700],
    assistantBubble: colors.neutral[800],

    // Special effects
    shimmer: colors.shimmer,
    shimmerLight: colors.shimmerLight,
    glass: colors.glass,
    glassHeavy: colors.glassHeavy,

    // Accent color
    accent: colors.accent[500],
    accentLight: colors.accent[400],
    accentDark: colors.accent[600],
  },
  typography,
  spacing,
  borderRadius,
  shadows,
  animation,
  gradients,
  componentTokens,
};

// Light Theme
const lightTheme = {
  colors: {
    // Primary brand
    primary: colors.primary[600],
    primaryLight: colors.primary[500],
    primaryDark: colors.primary[700],
    primaryMuted: "rgba(168, 85, 247, 0.1)",

    // Background hierarchy
    background: colors.neutral[50],
    backgroundSecondary: colors.neutral[100],
    backgroundTertiary: colors.neutral[200],
    backgroundElevated: "#FFFFFF",

    // Surfaces
    surface: colors.neutral[50],
    surfaceHeavy: colors.neutral[100],
    surfaceSecondary: colors.neutral[100],

    // Text hierarchy
    textPrimary: colors.neutral[900],
    textSecondary: colors.neutral[700],
    textTertiary: colors.neutral[600],
    textMuted: colors.neutral[500],
    textInverted: colors.neutral[50],
    textAccent: colors.primary[600],
    textDisabled: colors.neutral[400],

    // Borders
    border: colors.neutral[200],
    borderLight: colors.neutral[100],
    borderMedium: colors.neutral[300],
    borderAccent: colors.primary[500],

    // Semantic colors
    success: colors.semantic.success,
    successMuted: colors.semantic.successMuted,
    warning: colors.semantic.warning,
    warningMuted: colors.semantic.warningMuted,
    error: colors.semantic.error,
    errorMuted: colors.semantic.errorMuted,
    info: colors.semantic.info,
    infoMuted: colors.semantic.infoMuted,

    // Legacy neutral access (for backward compatibility)
    black: colors.neutral[950],
    charcoal: colors.neutral[900],
    darkGray: colors.neutral[800],
    gray: colors.neutral[500],
    mediumGray: colors.neutral[400],
    lightGray: colors.neutral[200],
    offWhite: colors.neutral[100],
    white: colors.neutral[50],
    pureWhite: "#FFFFFF",

    // Component-specific colors
    inputBackground: colors.neutral[100],
    inputBorder: colors.neutral[200],
    inputFocusBorder: colors.primary[500],
    cardBackground: "#FFFFFF",
    divider: colors.neutral[200],
    overlay: "rgba(0, 0, 0, 0.5)",
    skeleton: colors.neutral[200],
    skeletonHighlight: colors.neutral[100],

    // Tab/Navigation
    tabActive: colors.neutral[900],
    tabInactive: colors.neutral[500],

    // Header
    headerBackground: colors.neutral[50],
    headerText: colors.neutral[900],
    headerIcon: colors.neutral[900],

    // Message bubbles
    userBubble: colors.primary[600],
    userBubbleGradientStart: colors.primary[600],
    userBubbleGradientEnd: colors.primary[700],
    assistantBubble: colors.neutral[100],

    // Special effects
    shimmer: "rgba(168, 85, 247, 0.08)",
    shimmerLight: "rgba(168, 85, 247, 0.04)",
    glass: "rgba(255, 255, 255, 0.8)",
    glassHeavy: "rgba(255, 255, 255, 0.9)",

    // Accent color
    accent: colors.accent[500],
    accentLight: colors.accent[400],
    accentDark: colors.accent[600],
  },
  typography,
  spacing,
  borderRadius,
  shadows: {
    ...shadows,
    glow: {
      sm: {
        shadowColor: "#A855F7",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 4,
      },
      md: {
        shadowColor: "#A855F7",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 8,
      },
      lg: {
        shadowColor: "#A855F7",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 30,
        elevation: 12,
      },
    },
  },
  animation,
  gradients,
  componentTokens,
};

export const themes = {
  light: lightTheme,
  dark: darkTheme,
};

// Default theme for fallback
const defaultTheme = darkTheme;

const ThemeContext = createContext({
  theme: defaultTheme,
  isDark: true,
  toggleTheme: () => {},
  setThemeMode: () => {},
});

export const ThemeProvider = ({ children }) => {
  // Device color scheme available for future use
  const _deviceColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(true); // Default to dark for Velvet aesthetic
  const [_isLoading, setIsLoading] = useState(true);

  // Load saved theme preference
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme !== null) {
          setIsDark(savedTheme === "dark");
        } else {
          // Default to dark theme for Velvet aesthetic
          setIsDark(true);
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
