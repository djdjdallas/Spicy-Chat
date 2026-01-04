// pages/OnboardingPartner.js
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useConversationPartner } from "../features/ConversationPartner";
import { supabase } from "../lib/supabase";
import { useTheme } from "../context/ThemeContext";

const OnboardingPartner = ({ onComplete }) => {
  const { theme } = useTheme();
  const { partners, setCurrentPartner } = useConversationPartner();
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const getDifficultyLabel = (level) => {
    const labels = ["Beginner", "Easy", "Moderate", "Challenging", "Expert"];
    return labels[level - 1] || "Unknown";
  };

  const handlePartnerSelect = (partner) => {
    setSelectedPartner(partner);
  };

  const handleContinue = async () => {
    if (!selectedPartner) {
      Alert.alert("Select a Partner", "Please choose a conversation partner to continue");
      return;
    }

    setIsLoading(true);

    try {
      setCurrentPartner(selectedPartner);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      const { error: conversationError } = await supabase
        .from("conversations")
        .insert({
          title: `Chat with ${selectedPartner.name}`,
          model: selectedPartner.model || "cognitivecomputations/dolphin-2.9.2-qwen2-72b",
          user_id: user.id,
          last_message_at: new Date().toISOString(),
          partner_id: selectedPartner.id,
          partner_name: selectedPartner.name,
          partner_style: selectedPartner.style,
          partner_goals: selectedPartner.goals,
        });

      if (conversationError) throw conversationError;

      onComplete();
    } catch (error) {
      if (__DEV__) {
        console.error("Error selecting partner:", error);
      }
      Alert.alert("Error", "Failed to start conversation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChooseLater = () => {
    onComplete();
  };

  const renderPartner = (partner) => {
    const isSelected = selectedPartner?.id === partner.id;

    return (
      <TouchableOpacity
        key={partner.id}
        style={[
          styles.partnerCard,
          {
            backgroundColor: theme.colors.surfaceSecondary,
            borderColor: isSelected ? theme.colors.primary : theme.colors.border,
            borderWidth: isSelected ? 2 : 1,
          },
        ]}
        onPress={() => handlePartnerSelect(partner)}
        activeOpacity={0.7}
      >
        <View style={styles.partnerHeader}>
          {isSelected ? (
            <LinearGradient
              colors={theme.gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatarContainer}
            >
              <Ionicons
                name="person"
                size={24}
                color={theme.colors.pureWhite}
              />
            </LinearGradient>
          ) : (
            <View
              style={[
                styles.avatarContainer,
                { backgroundColor: theme.colors.shimmerLight },
              ]}
            >
              <Ionicons
                name="person"
                size={24}
                color={theme.colors.primary}
              />
            </View>
          )}
          <View style={styles.partnerTitleSection}>
            <Text
              style={[
                styles.partnerName,
                { color: theme.colors.textPrimary },
                theme.typography.h4,
              ]}
            >
              {partner.name}
            </Text>
            <View style={styles.difficultyBadge}>
              {[...Array(5)].map((_, i) => (
                <Ionicons
                  key={i}
                  name={i < partner.difficultyLevel ? "star" : "star-outline"}
                  size={12}
                  color={
                    i < partner.difficultyLevel
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
                {getDifficultyLabel(partner.difficultyLevel)}
              </Text>
            </View>
          </View>
          {isSelected && (
            <View
              style={[
                styles.checkmark,
                { backgroundColor: theme.colors.primary },
              ]}
            >
              <Ionicons name="checkmark" size={16} color={theme.colors.pureWhite} />
            </View>
          )}
        </View>

        <View style={styles.partnerDetails}>
          <View style={styles.detailRow}>
            <Text
              style={[
                styles.detailLabel,
                { color: theme.colors.textSecondary },
                theme.typography.caption,
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
              {partner.style
                .replace(/_/g, " ")
                .replace(/\b\w/g, (l) => l.toUpperCase())}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text
              style={[
                styles.detailLabel,
                { color: theme.colors.textSecondary },
                theme.typography.caption,
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
              {partner.goals
                .replace(/_/g, " ")
                .replace(/\b\w/g, (l) => l.toUpperCase())}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <LinearGradient
            colors={theme.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.iconContainer, theme.shadows.glow.sm]}
          >
            <Ionicons name="people-outline" size={32} color={theme.colors.pureWhite} />
          </LinearGradient>
          <Text
            style={[
              styles.title,
              { color: theme.colors.textPrimary },
              theme.typography.h2,
            ]}
          >
            Choose Your Partner
          </Text>
          <Text
            style={[
              styles.subtitle,
              { color: theme.colors.textSecondary },
              theme.typography.body,
            ]}
          >
            Select an AI conversation partner to practice with
          </Text>
        </View>

        <View style={styles.partnersList}>
          {partners.map((partner) => renderPartner(partner))}
        </View>

        <View style={styles.tipContainer}>
          <Ionicons
            name="bulb-outline"
            size={16}
            color={theme.colors.textSecondary}
          />
          <Text
            style={[
              styles.tipText,
              { color: theme.colors.textSecondary },
              theme.typography.caption,
            ]}
          >
            Start with a Beginner partner to build confidence, then try more
            challenging conversations
          </Text>
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          { backgroundColor: theme.colors.background, borderTopColor: theme.colors.border },
        ]}
      >
        {selectedPartner ? (
          <TouchableOpacity
            onPress={handleContinue}
            disabled={isLoading}
            activeOpacity={0.85}
            style={[styles.continueButtonWrapper, isLoading && styles.disabledButton]}
          >
            <LinearGradient
              colors={theme.gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.continueButton, theme.shadows.glow.sm]}
            >
              <Text
                style={[
                  styles.continueButtonText,
                  { color: theme.colors.pureWhite },
                  theme.typography.button,
                ]}
              >
                {isLoading ? "Starting..." : "Start Chatting"}
              </Text>
              {!isLoading && (
                <Ionicons
                  name="arrow-forward"
                  size={20}
                  color={theme.colors.pureWhite}
                  style={styles.buttonIcon}
                />
              )}
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <View
            style={[
              styles.continueButton,
              { backgroundColor: theme.colors.surfaceSecondary },
            ]}
          >
            <Text
              style={[
                styles.continueButtonText,
                { color: theme.colors.textTertiary },
                theme.typography.button,
              ]}
            >
              Start Chatting
            </Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleChooseLater}
          disabled={isLoading}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.skipButtonText,
              { color: theme.colors.textSecondary },
              theme.typography.button,
            ]}
          >
            Choose Later
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    textAlign: "center",
  },
  partnersList: {
    gap: 12,
    marginBottom: 24,
  },
  partnerCard: {
    borderRadius: 16,
    padding: 16,
  },
  partnerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
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
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  partnerDetails: {
    gap: 6,
    paddingLeft: 60,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailLabel: {
    marginRight: 6,
  },
  detailValue: {},
  tipContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    gap: 10,
  },
  tipText: {
    flex: 1,
    lineHeight: 20,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 34,
    borderTopWidth: 1,
  },
  continueButtonWrapper: {
    borderRadius: 16,
    overflow: "hidden",
  },
  continueButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
  },
  disabledButton: {
    opacity: 0.6,
  },
  continueButtonText: {},
  buttonIcon: {
    marginLeft: 8,
  },
  skipButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginTop: 12,
  },
  skipButtonText: {},
});

export default OnboardingPartner;
