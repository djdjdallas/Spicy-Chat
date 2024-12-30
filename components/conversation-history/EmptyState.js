// components/conversation-history/EmptyState.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";

export const EmptyState = () => (
  <View style={styles.emptyState}>
    <Text style={styles.emptyStateText}>No conversations yet</Text>
  </View>
);
