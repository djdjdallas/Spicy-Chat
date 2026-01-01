// components/conversation-history/EmptyState.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";

export const EmptyState = () => {
  const { theme } = useTheme();

  return (
    <View style={styles.emptyState}>
      <View style={[styles.iconContainer, { backgroundColor: theme.colors.surfaceSecondary }]}>
        <Ionicons name="chatbubbles-outline" size={48} color={theme.colors.textTertiary} />
      </View>
      <Text style={[styles.emptyStateTitle, { color: theme.colors.textPrimary }, theme.typography.h3]}>
        No conversations yet
      </Text>
      <Text style={[styles.emptyStateText, { color: theme.colors.textSecondary }, theme.typography.body]}>
        Start a new conversation to see your history here
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingTop: 80,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyStateTitle: {
    marginBottom: 8,
    textAlign: "center",
  },
  emptyStateText: {
    textAlign: "center",
  },
});

export default EmptyState;
