// pages/Tips.js
import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

const tipsData = [
  {
    id: "1",
    title: "Active Listening",
    icon: "ear-outline",
    content:
      "Show genuine interest by asking follow-up questions and remembering details. Mirror key points back to show you're engaged.",
  },
  {
    id: "2",
    title: "Be Authentic",
    icon: "heart-outline",
    content:
      "Stay true to yourself while maintaining respectful communication. Authenticity builds trust and deeper connections.",
  },
  {
    id: "3",
    title: "Open-Ended Questions",
    icon: "help-circle-outline",
    content:
      "Ask questions that can't be answered with just 'yes' or 'no'. This encourages deeper conversation and shows curiosity.",
  },
  {
    id: "4",
    title: "Body Language Awareness",
    icon: "body-outline",
    content:
      "In person, maintain eye contact, face the person, and use open gestures. These non-verbal cues show engagement.",
  },
  {
    id: "5",
    title: "Find Common Ground",
    icon: "git-merge-outline",
    content:
      "Look for shared interests, experiences, or values. Common ground creates natural connection points for conversation.",
  },
  {
    id: "6",
    title: "Respect Boundaries",
    icon: "shield-checkmark-outline",
    content:
      "Pay attention to verbal and non-verbal cues. If someone seems uncomfortable, gracefully change the topic.",
  },
  {
    id: "7",
    title: "Balance Speaking & Listening",
    icon: "swap-horizontal-outline",
    content:
      "Aim for a natural back-and-forth. Share about yourself, but make sure to give space for the other person too.",
  },
  {
    id: "8",
    title: "Use Humor Appropriately",
    icon: "happy-outline",
    content:
      "Light humor can ease tension and build rapport. Keep it positive and be mindful of your audience.",
  },
];

const Tips = () => {
  const { theme } = useTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <Text
        style={[
          styles.heading,
          { color: theme.colors.textPrimary },
          theme.typography.h2,
        ]}
      >
        Conversation Tips
      </Text>

      <Text
        style={[
          styles.subtitle,
          { color: theme.colors.textSecondary },
          theme.typography.body,
        ]}
      >
        Master the fundamentals of meaningful conversation
      </Text>

      <View style={styles.tipsGrid}>
        {tipsData.map((tip) => (
          <View
            key={tip.id}
            style={[
              styles.tipCard,
              {
                backgroundColor: theme.colors.surface,
                ...theme.shadows.sm,
              },
            ]}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: theme.colors.primaryMuted },
              ]}
            >
              <Ionicons
                name={tip.icon}
                size={24}
                color={theme.colors.primary}
              />
            </View>
            <Text
              style={[
                styles.tipTitle,
                { color: theme.colors.textPrimary },
                theme.typography.h4,
              ]}
            >
              {tip.title}
            </Text>
            <Text
              style={[
                styles.tipContent,
                { color: theme.colors.textSecondary },
                theme.typography.bodySmall,
              ]}
            >
              {tip.content}
            </Text>
          </View>
        ))}
      </View>

      {/* Quote Card */}
      <View
        style={[
          styles.quoteCard,
          { backgroundColor: theme.colors.backgroundTertiary },
        ]}
      >
        <Text
          style={[
            styles.quoteText,
            { color: theme.colors.textSecondary },
            theme.typography.bodyLarge,
          ]}
        >
          "The most important thing in communication is hearing what isn't said."
        </Text>
        <Text
          style={[
            styles.quoteAuthor,
            { color: theme.colors.textTertiary },
            theme.typography.caption,
          ]}
        >
          — Peter Drucker
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 48,
  },
  heading: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 24,
  },
  tipsGrid: {
    gap: 16,
  },
  tipCard: {
    borderRadius: 16,
    padding: 20,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  tipTitle: {
    marginBottom: 8,
  },
  tipContent: {
    lineHeight: 22,
  },
  quoteCard: {
    marginTop: 24,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  quoteText: {
    textAlign: "center",
    fontStyle: "italic",
    marginBottom: 12,
  },
  quoteAuthor: {
    letterSpacing: 0.5,
  },
});

export default Tips;
