// pages/PartnerSelection.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useConversationPartner } from "../features/ConversationPartner";
import { supabase } from "../lib/supabase";
import { useTheme } from "../context/ThemeContext";
import { checkSubscriptionStatus } from "../services/subscription";

export const PartnerSelection = ({ navigation }) => {
  const { theme } = useTheme();
  const { partners, setCurrentPartner } = useConversationPartner();
  const [hasSubscription, setHasSubscription] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    try {
      const { isSubscribed } = await checkSubscriptionStatus();
      setHasSubscription(isSubscribed);

      if (!isSubscribed) {
        Alert.alert(
          "Premium Feature",
          "Conversation partners are available with Poise Pro. Upgrade to unlock all partners and unlimited messages.",
          [
            {
              text: "Upgrade",
              onPress: () => navigation.navigate("Subscription"),
            },
            {
              text: "Maybe Later",
              style: "cancel",
            },
          ]
        );
      }
    } catch (error) {
      if (__DEV__) {
        console.error("Error checking subscription:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePartnerSelect = async (partner) => {
    if (!hasSubscription) {
      Alert.alert(
        "Upgrade to Poise Pro",
        "Unlock conversation partners and unlimited messages.",
        [
          {
            text: "Upgrade",
            onPress: () => navigation.navigate("Subscription"),
          },
          {
            text: "Not Now",
            style: "cancel",
          },
        ]
      );
      return;
    }

    try {
      setCurrentPartner(partner);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data: newConversation, error: conversationError } = await supabase
        .from("conversations")
        .insert({
          title: `Chat with ${partner.name}`,
          model: partner.model || "cognitivecomputations/dolphin-2.9.2-qwen2-72b",
          user_id: user.id,
          last_message_at: new Date().toISOString(),
          partner_id: partner.id,
          partner_name: partner.name,
          partner_style: partner.style,
          partner_goals: partner.goals,
        })
        .select()
        .single();

      if (conversationError) throw conversationError;

      navigation.navigate("Chat", {
        partnerId: partner.id,
        partnerName: partner.name,
        partnerStyle: partner.style,
        partnerGoals: partner.goals,
        conversationId: newConversation.id,
        forceNew: true,
      });
    } catch (error) {
      if (__DEV__) {
        console.error("Error selecting partner:", error);
      }
      Alert.alert(
        "Error",
        "Failed to start conversation with partner. Please try again."
      );
    }
  };

  const getDifficultyLabel = (level) => {
    const labels = ["Beginner", "Easy", "Moderate", "Challenging", "Expert"];
    return labels[level - 1] || "Unknown";
  };

  const renderPartner = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.partnerCard,
        {
          backgroundColor: theme.colors.surface,
          ...theme.shadows.sm,
          opacity: hasSubscription ? 1 : 0.6,
        },
      ]}
      onPress={() => handlePartnerSelect(item)}
      activeOpacity={0.7}
    >
      <View style={styles.partnerHeader}>
        <View
          style={[
            styles.avatarContainer,
            { backgroundColor: theme.colors.primaryMuted },
          ]}
        >
          <Ionicons name="person" size={28} color={theme.colors.primary} />
        </View>
        <View style={styles.partnerTitleSection}>
          <Text
            style={[
              styles.partnerName,
              { color: theme.colors.textPrimary },
              theme.typography.h4,
            ]}
          >
            {item.name}
          </Text>
          <View style={styles.difficultyBadge}>
            {[...Array(5)].map((_, i) => (
              <Ionicons
                key={i}
                name={i < item.difficultyLevel ? "star" : "star-outline"}
                size={14}
                color={
                  i < item.difficultyLevel
                    ? theme.colors.primary
                    : theme.colors.border
                }
              />
            ))}
            <Text
              style={[
                styles.difficultyLabel,
                { color: theme.colors.textSecondary },
                theme.typography.caption,
              ]}
            >
              {getDifficultyLabel(item.difficultyLevel)}
            </Text>
          </View>
        </View>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={theme.colors.textTertiary}
        />
      </View>

      <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

      <View style={styles.partnerDetails}>
        <View style={styles.detailRow}>
          <View
            style={[
              styles.detailIcon,
              { backgroundColor: theme.colors.backgroundTertiary },
            ]}
          >
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={16}
              color={theme.colors.textSecondary}
            />
          </View>
          <Text
            style={[
              styles.detailLabel,
              { color: theme.colors.textSecondary },
              theme.typography.bodySmall,
            ]}
          >
            Style:
          </Text>
          <Text
            style={[
              styles.detailValue,
              { color: theme.colors.textPrimary },
              theme.typography.bodySmall,
            ]}
          >
            {item.style
              .replace(/_/g, " ")
              .replace(/\b\w/g, (l) => l.toUpperCase())}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <View
            style={[
              styles.detailIcon,
              { backgroundColor: theme.colors.backgroundTertiary },
            ]}
          >
            <Ionicons
              name="flag-outline"
              size={16}
              color={theme.colors.textSecondary}
            />
          </View>
          <Text
            style={[
              styles.detailLabel,
              { color: theme.colors.textSecondary },
              theme.typography.bodySmall,
            ]}
          >
            Focus:
          </Text>
          <Text
            style={[
              styles.detailValue,
              { color: theme.colors.textPrimary },
              theme.typography.bodySmall,
            ]}
          >
            {item.goals
              .replace(/_/g, " ")
              .replace(/\b\w/g, (l) => l.toUpperCase())}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          styles.loadingContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={[
            styles.heading,
            { color: theme.colors.textPrimary },
            theme.typography.h2,
          ]}
        >
          Conversation Partners
        </Text>
        <Text
          style={[
            styles.subtitle,
            { color: theme.colors.textSecondary },
            theme.typography.body,
          ]}
        >
          Practice with AI personalities designed to improve your skills
        </Text>

        {!hasSubscription && (
          <View
            style={[
              styles.subscriptionBanner,
              { backgroundColor: theme.colors.black },
            ]}
          >
            <View style={styles.bannerContent}>
              <View
                style={[
                  styles.bannerIcon,
                  { backgroundColor: theme.colors.primaryMuted },
                ]}
              >
                <Ionicons name="lock-closed" size={20} color={theme.colors.primary} />
              </View>
              <View style={styles.bannerText}>
                <Text
                  style={[
                    styles.bannerTitle,
                    { color: theme.colors.pureWhite },
                    theme.typography.h4,
                  ]}
                >
                  Premium Feature
                </Text>
                <Text
                  style={[
                    styles.bannerDescription,
                    { color: theme.colors.silver },
                    theme.typography.bodySmall,
                  ]}
                >
                  Unlock conversation partners with a subscription
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[
                styles.upgradeButton,
                { backgroundColor: theme.colors.primary },
              ]}
              onPress={() => navigation.navigate("Subscription")}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.upgradeButtonText,
                  { color: theme.colors.pureWhite },
                  theme.typography.button,
                ]}
              >
                Upgrade
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.partnersList}>
          {partners.map((partner) => (
            <View key={partner.id}>
              {renderPartner({ item: partner })}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  heading: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 24,
  },
  subscriptionBanner: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  bannerContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  bannerIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  bannerText: {
    flex: 1,
    marginLeft: 12,
  },
  bannerTitle: {
    marginBottom: 2,
  },
  bannerDescription: {
    // Typography applied via theme
  },
  upgradeButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  upgradeButtonText: {
    // Typography applied via theme
  },
  partnersList: {
    gap: 16,
  },
  partnerCard: {
    borderRadius: 16,
    padding: 16,
  },
  partnerHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  partnerTitleSection: {
    flex: 1,
    marginLeft: 12,
  },
  partnerName: {
    marginBottom: 4,
  },
  difficultyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  difficultyLabel: {
    marginLeft: 6,
  },
  divider: {
    height: 1,
    marginVertical: 14,
  },
  partnerDetails: {
    gap: 10,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  detailLabel: {
    marginLeft: 10,
    marginRight: 4,
  },
  detailValue: {
    flex: 1,
  },
});

export default PartnerSelection;
