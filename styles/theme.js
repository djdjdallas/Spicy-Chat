// styles/theme.js

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

export const darkTheme = {
  colors: {
    // Primary colors
    primary: baseColors.primary,
    primaryDark: baseColors.primaryDark,
    primaryLight: baseColors.primaryLight,

    // Background colors
    background: "#000000",
    surface: "#121212",
    surfaceLight: "#1E1E1E",
    card: "#121212",

    // Text colors
    textPrimary: "#FFFFFF",
    textSecondary: "#B3B3B3",
    textDisabled: "#666666",

    // Border and divider colors
    border: "#333333",
    divider: "#1E1E1E",

    // Status colors
    success: baseColors.success,
    error: baseColors.error,
    warning: baseColors.warning,
    info: baseColors.info,

    // Shadow color
    shadow: "#000000",

    // Accent colors
    accent1: "#FF3333", // Bright red
    accent2: "#990000", // Dark red
    accent3: "#1E1E1E", // Dark gray
    accent4: "#2C2C2C", // Light gray
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  roundness: {
    small: 4,
    medium: 8,
    large: 12,
  },
};

export const lightTheme = {
  colors: {
    // Primary colors
    primary: baseColors.primary,
    primaryDark: baseColors.primaryDark,
    primaryLight: baseColors.primaryLight,

    // Background colors
    background: "#FFFFFF",
    surface: "#F5F5F5",
    surfaceLight: "#FAFAFA",
    card: "#FFFFFF",

    // Text colors
    textPrimary: "#000000",
    textSecondary: "#666666",
    textDisabled: "#999999",

    // Border and divider colors
    border: "#E0E0E0",
    divider: "#EEEEEE",

    // Status colors
    success: baseColors.success,
    error: baseColors.error,
    warning: baseColors.warning,
    info: baseColors.info,

    // Shadow color
    shadow: "#000000",

    // Accent colors
    accent1: "#FF0000", // Pure red
    accent2: "#CC0000", // Dark red
    accent3: "#F5F5F5", // Light gray
    accent4: "#E0E0E0", // Medium gray
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  roundness: {
    small: 4,
    medium: 8,
    large: 12,
  },
};

export default {
  dark: darkTheme,
  light: lightTheme,
};
