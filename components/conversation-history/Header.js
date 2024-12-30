// components/conversation-history/Header.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export const Header = ({
  conversationsExist,
  isSelectionMode,
  toggleSelectionMode,
}) => (
  <View style={styles.header}>
    <Text style={styles.heading}>Conversation History</Text>
    {conversationsExist && (
      <TouchableOpacity
        style={styles.selectButton}
        onPress={toggleSelectionMode}
      >
        <Text style={styles.selectButtonText}>
          {isSelectionMode ? "Cancel" : "Select"}
        </Text>
      </TouchableOpacity>
    )}
  </View>
);
