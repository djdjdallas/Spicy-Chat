// config/app.js
// Centralized app configuration

import Constants from "expo-constants";

// App metadata
export const APP_NAME = "Poise";
export const APP_TAGLINE = "Master the art of conversation";
export const APP_DESCRIPTION = "AI-powered message generator for confident conversations";

// Version from app.json via Expo Constants
export const APP_VERSION = Constants.expoConfig?.version || "1.0.0";

// Support URLs
export const SUPPORT_EMAIL = "support@poise.app";
export const HELP_URL = "https://poise.app/help";

// Legal URLs
export const TERMS_URL = "https://poise.app/terms";
export const PRIVACY_URL = "https://poise.app/privacy";

// Deep linking scheme
export const URL_SCHEME = "poise";

// Social links (optional)
export const SOCIAL_LINKS = {
  twitter: "https://twitter.com/poiseapp",
  instagram: "https://instagram.com/poiseapp",
};

// Feature flags
export const FEATURES = {
  enableNotifications: false, // Not yet implemented
  enableConversationSync: true,
  enableProfileCoaching: true,
};

// Default export for convenience
export default {
  APP_NAME,
  APP_TAGLINE,
  APP_DESCRIPTION,
  APP_VERSION,
  SUPPORT_EMAIL,
  HELP_URL,
  TERMS_URL,
  PRIVACY_URL,
  URL_SCHEME,
  SOCIAL_LINKS,
  FEATURES,
};
