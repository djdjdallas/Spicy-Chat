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
} from "react-native";
import { useConversationPartner } from "../features/ConversationPartner";
import { supabase } from "../lib/supabase";
import { useTheme } from "../context/ThemeContext";

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
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("has_subscription")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      setHasSubscription(profile?.has_subscription || false);

      if (!profile?.has_subscription) {
        Alert.alert(
          "Subscription Required",
          "Conversation partners are only available with a subscription. Please upgrade to access this feature.",
          [
            {
              text: "Upgrade",
              onPress: () => navigation.navigate("Settings"),
            },
            {
              text: "Go Back",
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
      Alert.alert("Error", "Failed to check subscription status");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePartnerSelect = async (partner) => {
    if (!hasSubscription) {
      Alert.alert(
        "Subscription Required",
        "Please upgrade to chat with conversation partners.",
        [
          {
            text: "Upgrade",
            onPress: () => navigation.navigate("Settings"),
          },
          {
            text: "Cancel",
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
          model: "dolphin-2.9.2-qwen2-72b",
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
      console.error("Error selecting partner:", error);
      Alert.alert(
        "Error",
        "Failed to start conversation with partner. Please try again."
      );
    }
  };

  const renderPartner = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.partnerCard,
        {
          backgroundColor: theme.colors.surface,
          shadowColor: theme.colors.shadow,
          opacity: hasSubscription ? 1 : 0.5,
        },
      ]}
      onPress={() => handlePartnerSelect(item)}
    >
      <View style={styles.partnerInfo}>
        <Text style={[styles.partnerName, { color: theme.colors.textPrimary }]}>
          {item.name}
        </Text>
        <Text
          style={[styles.partnerStyle, { color: theme.colors.textSecondary }]}
        >
          Style:{" "}
          {item.style
            .replace(/_/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase())}
        </Text>
        <Text
          style={[styles.partnerGoals, { color: theme.colors.textSecondary }]}
        >
          Focus:{" "}
          {item.goals
            .replace(/_/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase())}
        </Text>
        <View style={styles.difficultyContainer}>
          <Text
            style={[
              styles.difficultyLabel,
              { color: theme.colors.textSecondary },
            ]}
          >
            Level:{" "}
          </Text>
          {[...Array(item.difficultyLevel)].map((_, i) => (
            <Text
              key={i}
              style={[styles.star, { color: theme.colors.primary }]}
            >
              ★
            </Text>
          ))}
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
      <Text style={[styles.heading, { color: theme.colors.primary }]}>
        Choose Your Conversation Partner
      </Text>
      {!hasSubscription && (
        <View
          style={[
            styles.subscriptionBanner,
            { backgroundColor: theme.colors.primary },
          ]}
        >
          <Text style={styles.bannerText}>
            Upgrade to unlock conversation partners
          </Text>
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={() => navigation.navigate("Settings")}
          >
            <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
          </TouchableOpacity>
        </View>
      )}
      <FlatList
        data={partners}
        renderItem={renderPartner}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  subscriptionBanner: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bannerText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
  },
  upgradeButton: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  upgradeButtonText: {
    color: "#FF0000",
    fontWeight: "bold",
  },
  list: {
    padding: 10,
  },
  partnerCard: {
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  partnerInfo: {
    gap: 5,
  },
  partnerName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  partnerStyle: {
    fontSize: 16,
  },
  partnerGoals: {
    fontSize: 16,
  },
  difficultyContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  difficultyLabel: {
    fontSize: 16,
  },
  star: {
    fontSize: 16,
  },
});

export default PartnerSelection;
