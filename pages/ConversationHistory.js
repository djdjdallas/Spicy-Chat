// pages/ConversationHistory.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { supabase } from "../lib/supabase";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

export default function ConversationHistory() {
  const { theme } = useTheme();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedConversations, setSelectedConversations] = useState(new Set());
  const navigation = useNavigation();

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data: conversationsData, error: conversationsError } =
        await supabase
          .from("conversations")
          .select("*")
          .eq("user_id", user.id)
          .order("last_message_at", { ascending: false });

      if (conversationsError) throw conversationsError;

      const conversationsWithPreviews = await Promise.all(
        conversationsData.map(async (conversation) => {
          try {
            const { data: messages, error: messagesError } = await supabase
              .from("messages")
              .select("content, created_at")
              .eq("conversation_id", conversation.id)
              .order("created_at", { ascending: false })
              .limit(1);

            if (messagesError) throw messagesError;

            const lastMessage =
              messages && messages.length > 0 ? messages[0] : null;

            return {
              id: conversation.id,
              title: conversation.title || "New Chat",
              date: new Date(conversation.last_message_at).toLocaleDateString(),
              preview: lastMessage ? lastMessage.content : "No messages yet",
            };
          } catch (error) {
            console.warn(
              `Error fetching messages for conversation ${conversation.id}:`,
              error
            );
            return {
              id: conversation.id,
              title: conversation.title || "New Chat",
              date: new Date(conversation.last_message_at).toLocaleDateString(),
              preview: "Error loading messages",
            };
          }
        })
      );

      setConversations(conversationsWithPreviews);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      Alert.alert("Error", "Failed to load conversation history");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedConversations(new Set());
  };

  const toggleConversationSelection = (conversationId) => {
    const newSelectedConversations = new Set(selectedConversations);
    if (newSelectedConversations.has(conversationId)) {
      newSelectedConversations.delete(conversationId);
    } else {
      newSelectedConversations.add(conversationId);
    }
    setSelectedConversations(newSelectedConversations);
  };

  const handleConversationPress = (conversationId) => {
    if (isSelectionMode) {
      toggleConversationSelection(conversationId);
    } else {
      navigation.navigate("Chat", { conversationId });
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedConversations.size === 0) return;

    Alert.alert(
      "Delete Selected Conversations",
      `Are you sure you want to delete ${selectedConversations.size} conversation(s)? This action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              const selectedIds = Array.from(selectedConversations);

              // Delete context_memory entries
              for (const conversationId of selectedIds) {
                const { data: messages, error: messagesQueryError } =
                  await supabase
                    .from("messages")
                    .select("id")
                    .eq("conversation_id", conversationId);

                if (messagesQueryError) throw messagesQueryError;

                if (messages?.length > 0) {
                  const messageIds = messages.map((msg) => msg.id);
                  const { error: contextDeleteError } = await supabase
                    .from("context_memory")
                    .delete()
                    .in("source_message_id", messageIds);

                  if (contextDeleteError) throw contextDeleteError;
                }

                // Delete messages
                const { error: messagesError } = await supabase
                  .from("messages")
                  .delete()
                  .eq("conversation_id", conversationId);

                if (messagesError) throw messagesError;
              }

              // Delete conversations
              const { error: conversationsError } = await supabase
                .from("conversations")
                .delete()
                .in("id", selectedIds);

              if (conversationsError) throw conversationsError;

              setConversations((prev) =>
                prev.filter((conv) => !selectedConversations.has(conv.id))
              );
              setSelectedConversations(new Set());
              setIsSelectionMode(false);

              Alert.alert(
                "Success",
                "Selected conversations deleted successfully"
              );
            } catch (error) {
              console.error("Error deleting conversations:", error);
              Alert.alert("Error", "Failed to delete conversations");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleDelete = (conversationId) => {
    Alert.alert(
      "Delete Conversation",
      "Are you sure you want to delete this conversation? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);

              // Delete context_memory entries first
              const { data: messages, error: messagesQueryError } =
                await supabase
                  .from("messages")
                  .select("id")
                  .eq("conversation_id", conversationId);

              if (messagesQueryError) throw messagesQueryError;

              if (messages?.length > 0) {
                const messageIds = messages.map((msg) => msg.id);
                const { error: contextDeleteError } = await supabase
                  .from("context_memory")
                  .delete()
                  .in("source_message_id", messageIds);

                if (contextDeleteError) throw contextDeleteError;
              }

              // Delete messages
              const { error: messagesError } = await supabase
                .from("messages")
                .delete()
                .eq("conversation_id", conversationId);

              if (messagesError) throw messagesError;

              // Delete conversation
              const { error: conversationError } = await supabase
                .from("conversations")
                .delete()
                .eq("id", conversationId);

              if (conversationError) throw conversationError;

              setConversations((prev) =>
                prev.filter((conv) => conv.id !== conversationId)
              );
              Alert.alert("Success", "Conversation deleted successfully");
            } catch (error) {
              console.error("Error deleting conversation:", error);
              Alert.alert("Error", "Failed to delete conversation");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderConversationItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.conversationItem,
        {
          backgroundColor: theme.colors.surface,
          shadowColor: theme.colors.shadow,
        },
        selectedConversations.has(item.id) && {
          backgroundColor: `${theme.colors.primary}15`,
          borderColor: theme.colors.primary,
          borderWidth: 1,
        },
      ]}
      onPress={() => handleConversationPress(item.id)}
    >
      <View style={styles.conversationContent}>
        {isSelectionMode && (
          <View
            style={[styles.checkbox, { borderColor: theme.colors.primary }]}
          >
            {selectedConversations.has(item.id) && (
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={theme.colors.primary}
              />
            )}
          </View>
        )}
        <View style={styles.textContent}>
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
            {item.title}
          </Text>
          <Text style={[styles.date, { color: theme.colors.textSecondary }]}>
            {item.date}
          </Text>
          <Text
            style={[styles.preview, { color: theme.colors.textPrimary }]}
            numberOfLines={2}
          >
            {item.preview}
          </Text>
        </View>
        {!isSelectionMode && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(item.id)}
          >
            <Ionicons
              name="trash-outline"
              size={24}
              color={theme.colors.error}
            />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.heading, { color: theme.colors.primary }]}>
          Conversation History
        </Text>
        {conversations.length > 0 && (
          <TouchableOpacity
            style={[
              styles.selectButton,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={toggleSelectionMode}
          >
            <Text style={{ color: theme.colors.textInverted }}>
              {isSelectionMode ? "Cancel" : "Select"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {isSelectionMode && selectedConversations.size > 0 && (
        <View
          style={[
            styles.selectionBar,
            {
              backgroundColor: theme.colors.surface,
              shadowColor: theme.colors.shadow,
            },
          ]}
        >
          <Text
            style={[styles.selectedCount, { color: theme.colors.textPrimary }]}
          >
            {selectedConversations.size} selected
          </Text>
          <TouchableOpacity
            style={[
              styles.deleteSelectedButton,
              { backgroundColor: theme.colors.error },
            ]}
            onPress={handleDeleteSelected}
          >
            <Ionicons
              name="trash-outline"
              size={24}
              color={theme.colors.textInverted}
            />
            <Text
              style={[
                styles.deleteSelectedText,
                { color: theme.colors.textInverted },
              ]}
            >
              Delete Selected
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {conversations.length === 0 ? (
        <View style={styles.emptyState}>
          <Text
            style={[
              styles.emptyStateText,
              { color: theme.colors.textSecondary },
            ]}
          >
            No conversations yet
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderConversationItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshing={loading}
          onRefresh={fetchConversations}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
  },
  selectButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  selectionBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  selectedCount: {
    fontSize: 16,
    fontWeight: "500",
  },
  deleteSelectedButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
    gap: 8,
  },
  deleteSelectedText: {
    fontSize: 16,
    fontWeight: "500",
  },
  listContent: {
    flexGrow: 1,
  },
  conversationItem: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  conversationContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  textContent: {
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    marginRight: 12,
    borderWidth: 2,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButton: {
    padding: 8,
    marginLeft: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  date: {
    fontSize: 14,
    marginBottom: 5,
  },
  preview: {
    fontSize: 16,
    marginTop: 5,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 16,
  },
});
