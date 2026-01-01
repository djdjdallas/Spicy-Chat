// pages/Subscription.js (Paywall)
// Poise Pro subscription paywall with 3-tier pricing

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  Linking,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import {
  checkSubscriptionStatus,
  getOfferings,
  purchasePackage,
  restorePurchases,
  getManageSubscriptionUrl,
  SUBSCRIPTION_TIERS,
} from "../services/subscription";

// Features list for paywall
const FEATURES = [
  { icon: "infinite", text: "Unlimited message generations", tiers: ["weekly", "monthly", "annual"] },
  { icon: "color-palette", text: "All conversation styles", tiers: ["weekly", "monthly", "annual"] },
  { icon: "flash", text: "Priority AI responses", tiers: ["weekly", "monthly", "annual"] },
  { icon: "time", text: "Conversation history sync", tiers: ["monthly", "annual"] },
  { icon: "school", text: "Profile coaching features", tiers: ["annual"] },
];

// Tier configurations with fallback pricing
const TIER_CONFIG = {
  weekly: {
    name: "Weekly",
    price: "$7.99",
    period: "/week",
    badge: null,
    color: "textSecondary",
  },
  monthly: {
    name: "Monthly",
    price: "$14.99",
    period: "/month",
    badge: "POPULAR",
    color: "primary",
  },
  annual: {
    name: "Annual",
    price: "$99.99",
    period: "/year",
    badge: "SAVE 44%",
    color: "success",
  },
};

export const Subscription = ({ navigation, route }) => {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [currentTier, setCurrentTier] = useState("FREE");
  const [packages, setPackages] = useState([]);
  const [selectedTier, setSelectedTier] = useState("monthly");
  const [isPurchasing, setIsPurchasing] = useState(false);

  // Animation values
  const scaleAnims = useRef({
    weekly: new Animated.Value(1),
    monthly: new Animated.Value(1),
    annual: new Animated.Value(1),
  }).current;

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  // Animate tier selection
  useEffect(() => {
    Object.keys(scaleAnims).forEach((tier) => {
      Animated.spring(scaleAnims[tier], {
        toValue: selectedTier === tier ? 1.02 : 1,
        friction: 8,
        tension: 100,
        useNativeDriver: true,
      }).start();
    });
  }, [selectedTier]);

  const loadSubscriptionData = async () => {
    try {
      setIsLoading(true);

      const status = await checkSubscriptionStatus();
      setIsSubscribed(status.isSubscribed);
      setCurrentTier(status.tier);

      if (!status.isSubscribed) {
        const { packages: availablePackages } = await getOfferings();
        setPackages(availablePackages);
      }
    } catch (error) {
      console.error("Error loading subscription data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPackageForTier = (tierName) => {
    // Try to find matching package from RevenueCat
    return packages.find((pkg) => {
      const pkgType = pkg.packageType?.toLowerCase();
      return (
        pkgType === tierName ||
        pkg.identifier?.toLowerCase().includes(tierName)
      );
    });
  };

  const handlePurchase = async () => {
    const pkg = getPackageForTier(selectedTier);

    if (!pkg) {
      Alert.alert(
        "Not Available",
        "This subscription plan is not available yet. Please try again later or contact support."
      );
      return;
    }

    try {
      setIsPurchasing(true);
      const { success, error } = await purchasePackage(pkg);

      if (success) {
        setIsSubscribed(true);
        Alert.alert(
          "Welcome to Poise Pro!",
          "You now have access to all premium features.",
          [{ text: "Let's Go", onPress: () => navigation.goBack() }]
        );
      } else if (error) {
        Alert.alert("Purchase Failed", error);
      }
    } catch (error) {
      console.error("Purchase error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestore = async () => {
    try {
      setIsPurchasing(true);
      const { success, isSubscribed: subscribed, error } = await restorePurchases();

      if (success && subscribed) {
        setIsSubscribed(true);
        Alert.alert(
          "Restored!",
          "Your subscription has been restored.",
          [{ text: "OK", onPress: () => navigation.goBack() }]
        );
      } else if (success && !subscribed) {
        Alert.alert("No Subscription Found", "We couldn't find any previous subscriptions.");
      } else if (error) {
        Alert.alert("Restore Failed", error);
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleManageSubscription = async () => {
    const url = await getManageSubscriptionUrl();
    if (url) {
      Linking.openURL(url);
    } else {
      Alert.alert("Error", "Unable to open subscription management");
    }
  };

  const renderTierCard = (tierKey) => {
    const config = TIER_CONFIG[tierKey];
    const isSelected = selectedTier === tierKey;
    const pkg = getPackageForTier(tierKey);

    // Use RevenueCat price if available, otherwise fallback
    const price = pkg?.product?.priceString || config.price;

    return (
      <Animated.View
        key={tierKey}
        style={[
          styles.tierCard,
          {
            transform: [{ scale: scaleAnims[tierKey] }],
            backgroundColor: theme.colors.surface,
            borderColor: isSelected ? theme.colors.primary : theme.colors.border,
            borderWidth: isSelected ? 2 : 1,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.tierCardContent}
          onPress={() => setSelectedTier(tierKey)}
          activeOpacity={0.8}
        >
          {config.badge && (
            <View
              style={[
                styles.tierBadge,
                {
                  backgroundColor:
                    config.color === "success"
                      ? theme.colors.successMuted
                      : theme.colors.primaryMuted,
                },
              ]}
            >
              <Text
                style={[
                  styles.tierBadgeText,
                  {
                    color:
                      config.color === "success"
                        ? theme.colors.success
                        : theme.colors.primary,
                  },
                  theme.typography.overline,
                ]}
              >
                {config.badge}
              </Text>
            </View>
          )}

          <Text
            style={[
              styles.tierName,
              { color: theme.colors.textSecondary },
              theme.typography.overline,
            ]}
          >
            {config.name.toUpperCase()}
          </Text>

          <View style={styles.priceRow}>
            <Text
              style={[
                styles.tierPrice,
                { color: theme.colors.textPrimary },
                theme.typography.h2,
              ]}
            >
              {price}
            </Text>
            <Text
              style={[
                styles.tierPeriod,
                { color: theme.colors.textSecondary },
                theme.typography.bodySmall,
              ]}
            >
              {config.period}
            </Text>
          </View>

          {isSelected && (
            <View style={[styles.selectedIndicator, { backgroundColor: theme.colors.primary }]}>
              <Ionicons name="checkmark" size={16} color={theme.colors.pureWhite} />
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // Already subscribed view
  if (isSubscribed) {
    const tierInfo = SUBSCRIPTION_TIERS[currentTier] || SUBSCRIPTION_TIERS.MONTHLY;

    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.subscribedContainer}>
            <View style={[styles.checkCircle, { backgroundColor: theme.colors.successMuted }]}>
              <Ionicons name="diamond" size={48} color={theme.colors.success} />
            </View>

            <Text style={[styles.subscribedTitle, { color: theme.colors.textPrimary }, theme.typography.h2]}>
              You're a Poise Pro!
            </Text>

            <View style={[styles.tierBadgeLarge, { backgroundColor: theme.colors.primaryMuted }]}>
              <Text style={[{ color: theme.colors.primary }, theme.typography.button]}>
                {tierInfo.name} Plan
              </Text>
            </View>

            <Text style={[styles.subscribedSubtitle, { color: theme.colors.textSecondary }, theme.typography.body]}>
              You have access to all premium features
            </Text>

            <View style={styles.subscribedFeatures}>
              {tierInfo.features.map((feature, index) => (
                <View key={index} style={styles.featureRow}>
                  <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
                  <Text style={[styles.featureText, { color: theme.colors.textPrimary }, theme.typography.body]}>
                    {feature}
                  </Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.manageButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
              onPress={handleManageSubscription}
            >
              <Ionicons name="settings-outline" size={20} color={theme.colors.textPrimary} />
              <Text style={[styles.manageButtonText, { color: theme.colors.textPrimary }, theme.typography.button]}>
                Manage Subscription
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Text style={[styles.backButtonText, { color: theme.colors.primary }, theme.typography.button]}>
                Go Back
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  // Paywall view
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.proIcon, { backgroundColor: theme.colors.primaryMuted }]}>
            <Ionicons name="diamond" size={32} color={theme.colors.primary} />
          </View>
          <Text style={[styles.title, { color: theme.colors.textPrimary }, theme.typography.h1]}>
            POISE PRO
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }, theme.typography.body]}>
            Unlock Your Conversation Game
          </Text>
        </View>

        {/* Tier Selection */}
        <View style={styles.tiersContainer}>
          {renderTierCard("weekly")}
          {renderTierCard("monthly")}
          {renderTierCard("annual")}
        </View>

        {/* Features List */}
        <View style={styles.featuresContainer}>
          {FEATURES.map((feature, index) => {
            const isIncluded = feature.tiers.includes(selectedTier);
            return (
              <View key={index} style={styles.featureItem}>
                <Ionicons
                  name={isIncluded ? "checkmark-circle" : "close-circle"}
                  size={22}
                  color={isIncluded ? theme.colors.success : theme.colors.textTertiary}
                />
                <Text
                  style={[
                    styles.featureItemText,
                    {
                      color: isIncluded ? theme.colors.textPrimary : theme.colors.textTertiary,
                    },
                    theme.typography.body,
                  ]}
                >
                  {feature.text}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Purchase Button */}
        <TouchableOpacity
          style={[
            styles.purchaseButton,
            {
              backgroundColor: theme.colors.primary,
              opacity: isPurchasing ? 0.7 : 1,
            },
          ]}
          onPress={handlePurchase}
          disabled={isPurchasing}
          activeOpacity={0.85}
        >
          {isPurchasing ? (
            <ActivityIndicator color={theme.colors.pureWhite} />
          ) : (
            <Text style={[styles.purchaseButtonText, { color: theme.colors.pureWhite }, theme.typography.button]}>
              Continue with {TIER_CONFIG[selectedTier].name}
            </Text>
          )}
        </TouchableOpacity>

        {/* Footer Links */}
        <View style={styles.footerLinks}>
          <TouchableOpacity onPress={handleRestore} disabled={isPurchasing}>
            <Text style={[styles.footerLink, { color: theme.colors.textSecondary }, theme.typography.bodySmall]}>
              Restore Purchases
            </Text>
          </TouchableOpacity>

          <Text style={[styles.footerDivider, { color: theme.colors.textTertiary }]}>|</Text>

          <TouchableOpacity onPress={() => Linking.openURL("https://poise.app/terms")}>
            <Text style={[styles.footerLink, { color: theme.colors.textSecondary }, theme.typography.bodySmall]}>
              Terms & Privacy
            </Text>
          </TouchableOpacity>
        </View>

        {/* Terms Text */}
        <Text style={[styles.terms, { color: theme.colors.textTertiary }, theme.typography.caption]}>
          Subscriptions automatically renew unless cancelled at least 24 hours before the end of the current period.
          Your account will be charged through your App Store account.
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  proIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    marginBottom: 8,
    textAlign: "center",
    letterSpacing: 2,
  },
  subtitle: {
    textAlign: "center",
  },
  tiersContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 32,
  },
  tierCard: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
  },
  tierCardContent: {
    padding: 16,
    alignItems: "center",
    minHeight: 120,
    justifyContent: "center",
  },
  tierBadge: {
    position: "absolute",
    top: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tierBadgeText: {},
  tierName: {
    marginBottom: 8,
  },
  priceRow: {
    alignItems: "center",
  },
  tierPrice: {
    marginBottom: 2,
  },
  tierPeriod: {},
  selectedIndicator: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  featuresContainer: {
    marginBottom: 32,
    gap: 12,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  featureItemText: {},
  purchaseButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  purchaseButtonText: {},
  footerLinks: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  footerLink: {},
  footerDivider: {},
  terms: {
    textAlign: "center",
    paddingHorizontal: 16,
  },
  // Subscribed styles
  subscribedContainer: {
    flex: 1,
    alignItems: "center",
    paddingTop: 40,
  },
  checkCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  subscribedTitle: {
    marginBottom: 12,
    textAlign: "center",
  },
  tierBadgeLarge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
  },
  subscribedSubtitle: {
    textAlign: "center",
    marginBottom: 32,
  },
  subscribedFeatures: {
    gap: 12,
    marginBottom: 32,
    width: "100%",
    paddingHorizontal: 20,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  featureText: {},
  manageButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  manageButtonText: {},
  backButton: {
    paddingVertical: 12,
  },
  backButtonText: {},
});

export default Subscription;
