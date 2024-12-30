// components/conversation-history/SelectionBar.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export const SelectionBar = ({ selectedCount, onDeleteSelected }) => (
  <View style={styles.selectionBar}>
    <Text style={styles.selectedCount}>{selectedCount} selected</Text>
    <TouchableOpacity
      style={styles.deleteSelectedButton}
      onPress={onDeleteSelected}
    >
      <Ionicons name="trash-outline" size={24} color="white" />
      <Text style={styles.deleteSelectedText}>Delete Selected</Text>
    </TouchableOpacity>
  </View>
);
