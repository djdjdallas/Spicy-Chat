// hooks/useSubscription.js
// React hook for subscription state management

import { useState, useEffect, useCallback } from "react";
import {
  checkSubscriptionStatus,
  checkDailyMessageLimit,
  incrementDailyMessageCount,
  getOfferings,
  purchasePackage,
  restorePurchases,
  SUBSCRIPTION_TIERS,
  FREE_MESSAGE_LIMIT,
} from "../services/subscription";

/**
 * Hook for managing subscription state and message limits
 * @returns {object} Subscription state and actions
 */
export const useSubscription = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [tier, setTier] = useState("FREE");
  const [tierInfo, setTierInfo] = useState(SUBSCRIPTION_TIERS.FREE);
  const [messagesUsed, setMessagesUsed] = useState(0);
  const [messagesRemaining, setMessagesRemaining] = useState(FREE_MESSAGE_LIMIT);
  const [canSendMessage, setCanSendMessage] = useState(true);
  const [offerings, setOfferings] = useState(null);
  const [packages, setPackages] = useState([]);
  const [error, setError] = useState(null);

  /**
   * Load subscription status and message limits
   */
  const loadSubscriptionStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get subscription status
      const status = await checkSubscriptionStatus();
      setIsSubscribed(status.isSubscribed);
      setTier(status.tier);
      setTierInfo(status.tierInfo || SUBSCRIPTION_TIERS[status.tier]);

      // Get message limits
      const limits = await checkDailyMessageLimit();
      setMessagesUsed(limits.messagesUsed);
      setMessagesRemaining(limits.messagesRemaining);
      setCanSendMessage(limits.canSendMessage);

      // Load offerings if not subscribed
      if (!status.isSubscribed) {
        const offeringsData = await getOfferings();
        setOfferings(offeringsData.currentOffering);
        setPackages(offeringsData.packages);
      }
    } catch (err) {
      console.error("Error loading subscription status:", err);
      setError(err.message || "Failed to load subscription status");
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Refresh subscription status
   */
  const refresh = useCallback(async () => {
    await loadSubscriptionStatus();
  }, [loadSubscriptionStatus]);

  /**
   * Called after sending a message to update limits
   */
  const onMessageSent = useCallback(async () => {
    if (isSubscribed) return;

    const result = await incrementDailyMessageCount();
    setMessagesUsed(result.messagesUsed);
    setMessagesRemaining(result.messagesRemaining);
    setCanSendMessage(result.messagesRemaining > 0);
  }, [isSubscribed]);

  /**
   * Purchase a subscription package
   */
  const purchase = useCallback(async (pkg) => {
    try {
      setIsLoading(true);
      const result = await purchasePackage(pkg);

      if (result.success) {
        // Refresh status after successful purchase
        await loadSubscriptionStatus();
        return { success: true, error: null };
      }

      return { success: false, error: result.error };
    } catch (err) {
      console.error("Purchase error:", err);
      return { success: false, error: err.message || "Purchase failed" };
    } finally {
      setIsLoading(false);
    }
  }, [loadSubscriptionStatus]);

  /**
   * Restore previous purchases
   */
  const restore = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await restorePurchases();

      if (result.success && result.isSubscribed) {
        await loadSubscriptionStatus();
        return { success: true, isSubscribed: true, error: null };
      }

      return {
        success: result.success,
        isSubscribed: result.isSubscribed,
        error: result.error,
      };
    } catch (err) {
      console.error("Restore error:", err);
      return { success: false, isSubscribed: false, error: err.message || "Restore failed" };
    } finally {
      setIsLoading(false);
    }
  }, [loadSubscriptionStatus]);

  /**
   * Check if user should see the paywall
   * Returns true if:
   * - User is not subscribed AND
   * - User has 0 messages remaining OR is trying to access premium features
   */
  const shouldShowPaywall = useCallback((forPremiumFeature = false) => {
    if (isSubscribed) return false;
    if (forPremiumFeature) return true;
    return !canSendMessage;
  }, [isSubscribed, canSendMessage]);

  /**
   * Check if user should see the soft paywall prompt
   * Returns true if user has 2 or fewer messages remaining
   */
  const shouldShowUpgradePrompt = useCallback(() => {
    if (isSubscribed) return false;
    return messagesRemaining <= 2 && messagesRemaining > 0;
  }, [isSubscribed, messagesRemaining]);

  // Load on mount
  useEffect(() => {
    loadSubscriptionStatus();
  }, [loadSubscriptionStatus]);

  return {
    // State
    isLoading,
    isSubscribed,
    tier,
    tierInfo,
    messagesUsed,
    messagesRemaining,
    canSendMessage,
    offerings,
    packages,
    error,
    limit: isSubscribed ? Infinity : FREE_MESSAGE_LIMIT,

    // Actions
    refresh,
    onMessageSent,
    purchase,
    restore,
    shouldShowPaywall,
    shouldShowUpgradePrompt,
  };
};

export default useSubscription;
