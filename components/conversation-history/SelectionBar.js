// components/conversation-history/SelectionBar.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../context/ThemeContext";

export const SelectionBar = ({ selectedCount, onDeleteSelected }) => {
  const { theme } = useTheme();

  return (
    <LinearGradient
      colors={theme.gradients.primary}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.selectionBar, theme.shadows.glow.sm]}
    >
      <Text style={[styles.selectedCount, { color: theme.colors.pureWhite }, theme.typography.body]}>
        {selectedCount} selected
      </Text>
      <TouchableOpacity
        style={[styles.deleteSelectedButton, { backgroundColor: theme.colors.error }]}
        onPress={onDeleteSelected}
        activeOpacity={0.85}
      >
        <Ionicons name="trash-outline" size={20} color={theme.colors.pureWhite} />
        <Text style={[styles.deleteSelectedText, { color: theme.colors.pureWhite }, theme.typography.buttonSmall]}>
          Delete
        </Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  selectionBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  selectedCount: {
    fontWeight: "600",
  },
  deleteSelectedButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  deleteSelectedText: {},
});

export default SelectionBar;
