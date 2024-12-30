// components/conversation-history/ConversationItem.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export const ConversationItem = ({
  conversation,
  isSelected,
  isSelectionMode,
  onPress,
  onDelete,
}) => (
  <TouchableOpacity
    style={[styles.conversationItem, isSelected && styles.selectedItem]}
    onPress={onPress}
  >
    <View style={styles.conversationContent}>
      {isSelectionMode && (
        <View style={styles.checkbox}>
          {isSelected && (
            <Ionicons name="checkmark-circle" size={24} color="#0084ff" />
          )}
        </View>
      )}
      <View style={styles.textContent}>
        <Text style={styles.title}>{conversation.title}</Text>
        <Text style={styles.date}>{conversation.date}</Text>
        <Text style={styles.preview} numberOfLines={2}>
          {conversation.preview}
        </Text>
      </View>
    </View>
    {!isSelectionMode && (
      <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
        <Ionicons name="trash-outline" size={24} color="#ff4444" />
      </TouchableOpacity>
    )}
  </TouchableOpacity>
);
