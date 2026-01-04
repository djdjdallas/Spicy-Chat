// services/subscription.js
// Poise Subscription Service - RevenueCat Integration

import Purchases from "react-native-purchases";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../lib/supabase";
import Constants from "expo-constants";

// Get env vars from expo-constants extra
const extra = Constants.expoConfig?.extra || Constants.manifest?.extra || {};
const REVENUECAT_API_KEY = extra.revenuecatApiKey;
const REVENUECAT_IOS_KEY = extra.revenuecatIosKey;
const REVENUECAT_ANDROID_KEY = extra.revenuecatAndroidKey;

// Entitlement identifiers
export const ENTITLEMENTS = {
  WEEKLY: "poise_weekly",
  MONTHLY: "poise_monthly",
  ANNUAL: "poise_annual",
  PRO: "poise_pro", // Umbrella entitlement for any paid tier
};

// Subscription tiers with features
export const SUBSCRIPTION_TIERS = {
  FREE: {
    id: "free",
    name: "Free",
    price: null,
    period: null,
    dailyMessageLimit: 3,
    features: [
      "3 messages per day",
      "Basic conversation styles",
      "Standard AI responses",
    ],
  },
  WEEKLY: {
    id: "weekly",
    name: "Weekly",
    price: "$7.99",
    period: "week",
    dailyMessageLimit: Infinity,
    features: [
      "Unlimited message generations",
      "All conversation styles",
      "Priority AI responses",
    ],
  },
  MONTHLY: {
    id: "monthly",
    name: "Monthly",
    price: "$14.99",
    period: "month",
    badge: "POPULAR",
    dailyMessageLimit: Infinity,
    features: [
      "Unlimited message generations",
      "All conversation styles",
      "Priority AI responses",
      "Conversation history sync",
    ],
  },
  ANNUAL: {
    id: "annual",
    name: "Annual",
    price: "$99.99",
    period: "year",
    badge: "SAVE 44%",
    dailyMessageLimit: Infinity,
    features: [
      "Unlimited message generations",
      "All conversation styles",
      "Priority AI responses",
      "Conversation history sync",
      "Profile coaching features",
    ],
  },
};

// Free tier daily limit
export const FREE_MESSAGE_LIMIT = 3;

// Storage keys
const DAILY_COUNT_KEY = "@poise_daily_message_count";
const DAILY_COUNT_DATE_KEY = "@poise_daily_message_date";

/**
 * Initialize RevenueCat SDK
 * Call this once when the app starts
 */
export const initializeRevenueCat = async () => {
  try {
    // Use platform-specific keys if available, otherwise fall back to generic key
    let apiKey = Platform.OS === "ios" ? REVENUECAT_IOS_KEY : REVENUECAT_ANDROID_KEY;

    // Fall back to generic API key (useful for Test Store)
    if (!apiKey && REVENUECAT_API_KEY) {
      apiKey = REVENUECAT_API_KEY;
    }

    if (!apiKey) {
      console.warn("RevenueCat: API key not configured. Set REVENUECAT_API_KEY in .env");
      return false;
    }

    await Purchases.configure({ apiKey });

    // Identify user with Supabase user ID
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await Purchases.logIn(user.id);
    }

    console.log("RevenueCat initialized successfully");
    return true;
  } catch (error) {
    console.error("RevenueCat initialization failed:", error);
    return false;
  }
};

/**
 * Identify user with RevenueCat (call after login)
 * @param {string} userId - The user's unique ID (Supabase user.id)
 */
export const identifyUser = async (userId) => {
  try {
    if (!userId) return;
    await Purchases.logIn(userId);
  } catch (error) {
    console.error("RevenueCat identify failed:", error);
  }
};

/**
 * Log out user from RevenueCat (call on sign out)
 */
export const logoutUser = async () => {
  try {
    await Purchases.logOut();
    // Reset daily message count
    await AsyncStorage.multiRemove([DAILY_COUNT_KEY, DAILY_COUNT_DATE_KEY]);
  } catch (error) {
    console.error("RevenueCat logout failed:", error);
  }
};

/**
 * Get customer info from RevenueCat
 * @returns {Promise<object|null>}
 */
export const getCustomerInfo = async () => {
  try {
    return await Purchases.getCustomerInfo();
  } catch (error) {
    console.error("RevenueCat get customer info failed:", error);
    return null;
  }
};

/**
 * Check if user has active subscription
 * @returns {Promise<{isSubscribed: boolean, tier: string, customerInfo: object|null, entitlements: object}>}
 */
export const checkSubscriptionStatus = async () => {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    const activeEntitlements = customerInfo?.entitlements?.active || {};

    // Check for umbrella entitlement first
    const hasPro = typeof activeEntitlements[ENTITLEMENTS.PRO] !== "undefined";

    // Determine specific tier
    let tier = "FREE";
    let isSubscribed = false;

    if (hasPro || typeof activeEntitlements[ENTITLEMENTS.ANNUAL] !== "undefined") {
      tier = "ANNUAL";
      isSubscribed = true;
    } else if (typeof activeEntitlements[ENTITLEMENTS.MONTHLY] !== "undefined") {
      tier = "MONTHLY";
      isSubscribed = true;
    } else if (typeof activeEntitlements[ENTITLEMENTS.WEEKLY] !== "undefined") {
      tier = "WEEKLY";
      isSubscribed = true;
    }

    // Sync to Supabase
    await syncSubscriptionToSupabase(isSubscribed, tier);

    return {
      isSubscribed,
      tier,
      tierInfo: SUBSCRIPTION_TIERS[tier],
      customerInfo,
      entitlements: activeEntitlements,
      messageLimit: isSubscribed ? Infinity : FREE_MESSAGE_LIMIT,
    };
  } catch (error) {
    console.error("RevenueCat subscription check failed:", error);
    return {
      isSubscribed: false,
      tier: "FREE",
      tierInfo: SUBSCRIPTION_TIERS.FREE,
      customerInfo: null,
      entitlements: {},
      messageLimit: FREE_MESSAGE_LIMIT,
    };
  }
};

/**
 * Sync subscription status to Supabase profiles table
 */
const syncSubscriptionToSupabase = async (isSubscribed, tier) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("profiles")
      .update({
        has_subscription: isSubscribed,
        subscription_tier: tier,
        subscription_updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);
  } catch (error) {
    console.error("Failed to sync subscription to Supabase:", error);
  }
};

/**
 * Get available subscription offerings
 * @returns {Promise<{offerings: object|null, currentOffering: object|null, packages: array}>}
 */
export const getOfferings = async () => {
  try {
    const offerings = await Purchases.getOfferings();
    return {
      offerings,
      currentOffering: offerings.current,
      packages: offerings.current?.availablePackages || [],
    };
  } catch (error) {
    console.error("RevenueCat get offerings failed:", error);
    return {
      offerings: null,
      currentOffering: null,
      packages: [],
    };
  }
};

/**
 * Purchase a subscription package
 * @param {object} pkg - The package to purchase
 * @returns {Promise<{success: boolean, customerInfo: object|null, error: string|null}>}
 */
export const purchasePackage = async (pkg) => {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    const activeEntitlements = customerInfo?.entitlements?.active || {};

    const isSubscribed =
      typeof activeEntitlements[ENTITLEMENTS.PRO] !== "undefined" ||
      typeof activeEntitlements[ENTITLEMENTS.WEEKLY] !== "undefined" ||
      typeof activeEntitlements[ENTITLEMENTS.MONTHLY] !== "undefined" ||
      typeof activeEntitlements[ENTITLEMENTS.ANNUAL] !== "undefined";

    return {
      success: isSubscribed,
      customerInfo,
      error: null,
    };
  } catch (error) {
    // User cancelled
    if (error.userCancelled) {
      return {
        success: false,
        customerInfo: null,
        error: null,
      };
    }

    console.error("RevenueCat purchase failed:", error);
    return {
      success: false,
      customerInfo: null,
      error: error.message || "Purchase failed",
    };
  }
};

/**
 * Restore previous purchases
 * @returns {Promise<{success: boolean, isSubscribed: boolean, error: string|null}>}
 */
export const restorePurchases = async () => {
  try {
    const customerInfo = await Purchases.restorePurchases();
    const activeEntitlements = customerInfo?.entitlements?.active || {};

    const isSubscribed =
      typeof activeEntitlements[ENTITLEMENTS.PRO] !== "undefined" ||
      typeof activeEntitlements[ENTITLEMENTS.WEEKLY] !== "undefined" ||
      typeof activeEntitlements[ENTITLEMENTS.MONTHLY] !== "undefined" ||
      typeof activeEntitlements[ENTITLEMENTS.ANNUAL] !== "undefined";

    return {
      success: true,
      isSubscribed,
      customerInfo,
      error: null,
    };
  } catch (error) {
    console.error("RevenueCat restore failed:", error);
    return {
      success: false,
      isSubscribed: false,
      customerInfo: null,
      error: error.message || "Restore failed",
    };
  }
};

/**
 * Get management subscription URL
 * @returns {Promise<string|null>}
 */
export const getManageSubscriptionUrl = async () => {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo?.managementURL || null;
  } catch (error) {
    console.error("RevenueCat get management URL failed:", error);
    return null;
  }
};

// ============================================
// Daily Message Limit Functions (Free Tier)
// ============================================

/**
 * Get today's date string for comparison
 */
const getTodayDateString = () => {
  const today = new Date();
  return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
};

/**
 * Check daily message limit for free users
 * @returns {Promise<{canSendMessage: boolean, messagesUsed: number, messagesRemaining: number, limit: number}>}
 */
export const checkDailyMessageLimit = async () => {
  try {
    // First check if user is subscribed
    const { isSubscribed } = await checkSubscriptionStatus();

    if (isSubscribed) {
      return {
        canSendMessage: true,
        messagesUsed: 0,
        messagesRemaining: Infinity,
        limit: Infinity,
        isSubscribed: true,
      };
    }

    // Check stored date
    const storedDate = await AsyncStorage.getItem(DAILY_COUNT_DATE_KEY);
    const todayDate = getTodayDateString();

    let messagesUsed = 0;

    // Reset count if it's a new day
    if (storedDate !== todayDate) {
      await AsyncStorage.setItem(DAILY_COUNT_DATE_KEY, todayDate);
      await AsyncStorage.setItem(DAILY_COUNT_KEY, "0");
      messagesUsed = 0;
    } else {
      const storedCount = await AsyncStorage.getItem(DAILY_COUNT_KEY);
      messagesUsed = parseInt(storedCount || "0", 10);
    }

    const messagesRemaining = Math.max(0, FREE_MESSAGE_LIMIT - messagesUsed);
    const canSendMessage = messagesRemaining > 0;

    return {
      canSendMessage,
      messagesUsed,
      messagesRemaining,
      limit: FREE_MESSAGE_LIMIT,
      isSubscribed: false,
    };
  } catch (error) {
    console.error("Error checking daily message limit:", error);
    // Default to allowing message on error
    return {
      canSendMessage: true,
      messagesUsed: 0,
      messagesRemaining: FREE_MESSAGE_LIMIT,
      limit: FREE_MESSAGE_LIMIT,
      isSubscribed: false,
    };
  }
};

/**
 * Increment daily message count (call after sending a message)
 * @returns {Promise<{messagesUsed: number, messagesRemaining: number}>}
 */
export const incrementDailyMessageCount = async () => {
  try {
    // First check if user is subscribed
    const { isSubscribed } = await checkSubscriptionStatus();

    if (isSubscribed) {
      return {
        messagesUsed: 0,
        messagesRemaining: Infinity,
      };
    }

    const storedDate = await AsyncStorage.getItem(DAILY_COUNT_DATE_KEY);
    const todayDate = getTodayDateString();

    let messagesUsed = 0;

    // Reset count if it's a new day
    if (storedDate !== todayDate) {
      await AsyncStorage.setItem(DAILY_COUNT_DATE_KEY, todayDate);
      messagesUsed = 1;
    } else {
      const storedCount = await AsyncStorage.getItem(DAILY_COUNT_KEY);
      messagesUsed = parseInt(storedCount || "0", 10) + 1;
    }

    await AsyncStorage.setItem(DAILY_COUNT_KEY, messagesUsed.toString());

    const messagesRemaining = Math.max(0, FREE_MESSAGE_LIMIT - messagesUsed);

    return {
      messagesUsed,
      messagesRemaining,
    };
  } catch (error) {
    console.error("Error incrementing daily message count:", error);
    return {
      messagesUsed: 0,
      messagesRemaining: FREE_MESSAGE_LIMIT,
    };
  }
};

/**
 * Reset daily message count (for testing or support)
 */
export const resetDailyMessageCount = async () => {
  try {
    await AsyncStorage.multiRemove([DAILY_COUNT_KEY, DAILY_COUNT_DATE_KEY]);
  } catch (error) {
    console.error("Error resetting daily message count:", error);
  }
};
