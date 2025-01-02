// pages/PartnerSelection.js
import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useConversationPartner } from "../features/ConversationPartner";
import { supabase } from "../lib/supabase";
import { useTheme } from "../context/ThemeContext";

export const PartnerSelection = ({ navigation }) => {
  const { theme } = useTheme();
  const { partners, setCurrentPartner } = useConversationPartner();

  const handlePartnerSelect = async (partner) => {
    try {
      setCurrentPartner(partner);

      // Create a new conversation in Supabase
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;

      // Create new conversation with individual fields instead of metadata
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

      // Navigate to Chat with all necessary parameters
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
            Level:
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

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Text style={[styles.heading, { color: theme.colors.primary }]}>
        Choose Your Conversation Partner
      </Text>
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
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
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
