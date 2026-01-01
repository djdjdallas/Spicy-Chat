// components/conversation-history/Header.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "../../context/ThemeContext";

export const Header = ({
  conversationsExist,
  isSelectionMode,
  toggleSelectionMode,
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.header}>
      <Text style={[styles.heading, { color: theme.colors.textPrimary }, theme.typography.h2]}>
        Conversation History
      </Text>
      {conversationsExist && (
        <TouchableOpacity
          style={[
            styles.selectButton,
            {
              backgroundColor: isSelectionMode
                ? theme.colors.primaryMuted
                : theme.colors.surfaceSecondary,
            },
          ]}
          onPress={toggleSelectionMode}
        >
          <Text
            style={[
              styles.selectButtonText,
              {
                color: isSelectionMode
                  ? theme.colors.primary
                  : theme.colors.textSecondary,
              },
              theme.typography.buttonSmall,
            ]}
          >
            {isSelectionMode ? "Cancel" : "Select"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  heading: {},
  selectButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  selectButtonText: {},
});

export default Header;
