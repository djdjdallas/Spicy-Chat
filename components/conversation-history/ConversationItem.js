// components/conversation-history/ConversationItem.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";

export const ConversationItem = ({
  conversation,
  isSelected,
  isSelectionMode,
  onPress,
  onDelete,
}) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.conversationItem,
        {
          backgroundColor: theme.colors.surfaceSecondary,
          borderWidth: 1,
          borderColor: theme.colors.border,
        },
        isSelected && {
          backgroundColor: theme.colors.primaryMuted,
          borderColor: theme.colors.primary,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.conversationContent}>
        {isSelectionMode && (
          <View style={[styles.checkbox, { borderColor: theme.colors.border }]}>
            {isSelected && (
              <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
            )}
          </View>
        )}
        <View style={styles.textContent}>
          <Text
            style={[styles.title, { color: theme.colors.textPrimary }, theme.typography.h4]}
            numberOfLines={1}
          >
            {conversation.title}
          </Text>
          <Text style={[styles.date, { color: theme.colors.textTertiary }, theme.typography.caption]}>
            {conversation.date}
          </Text>
          <Text
            style={[styles.preview, { color: theme.colors.textSecondary }, theme.typography.bodySmall]}
            numberOfLines={2}
          >
            {conversation.preview}
          </Text>
        </View>
      </View>
      {!isSelectionMode && (
        <TouchableOpacity
          style={[styles.deleteButton, { backgroundColor: theme.colors.errorMuted }]}
          onPress={onDelete}
        >
          <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  conversationItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  conversationContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  textContent: {
    flex: 1,
  },
  title: {
    marginBottom: 4,
  },
  date: {
    marginBottom: 6,
  },
  preview: {
    lineHeight: 20,
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
});

export default ConversationItem;
