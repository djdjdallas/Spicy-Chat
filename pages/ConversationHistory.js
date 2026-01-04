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
import { LinearGradient } from "expo-linear-gradient";
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
      "Delete Selected",
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

                const { error: messagesError } = await supabase
                  .from("messages")
                  .delete()
                  .eq("conversation_id", conversationId);

                if (messagesError) throw messagesError;
              }

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

              Alert.alert("Success", "Selected conversations deleted");
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

              const { error: messagesError } = await supabase
                .from("messages")
                .delete()
                .eq("conversation_id", conversationId);

              if (messagesError) throw messagesError;

              const { error: conversationError } = await supabase
                .from("conversations")
                .delete()
                .eq("id", conversationId);

              if (conversationError) throw conversationError;

              setConversations((prev) =>
                prev.filter((conv) => conv.id !== conversationId)
              );
              Alert.alert("Success", "Conversation deleted");
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

  const renderConversationItem = ({ item }) => {
    const isSelected = selectedConversations.has(item.id);

    return (
      <TouchableOpacity
        style={[
          styles.conversationCard,
          {
            backgroundColor: theme.colors.surfaceSecondary,
            borderWidth: 1,
            borderColor: theme.colors.border,
          },
          isSelected && {
            backgroundColor: theme.colors.primaryMuted,
            borderWidth: 2,
            borderColor: theme.colors.primary,
          },
        ]}
        onPress={() => handleConversationPress(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.cardContent}>
          {isSelectionMode && (
            <View
              style={[
                styles.checkbox,
                {
                  borderColor: isSelected
                    ? theme.colors.primary
                    : theme.colors.border,
                  backgroundColor: isSelected
                    ? theme.colors.primary
                    : "transparent",
                },
              ]}
            >
              {isSelected && (
                <Ionicons name="checkmark" size={16} color={theme.colors.pureWhite} />
              )}
            </View>
          )}

          <View
            style={[
              styles.iconContainer,
              { backgroundColor: theme.colors.shimmerLight },
            ]}
          >
            <Ionicons
              name="chatbubble-outline"
              size={20}
              color={theme.colors.primary}
            />
          </View>

          <View style={styles.textContent}>
            <View style={styles.titleRow}>
              <Text
                style={[
                  styles.title,
                  { color: theme.colors.textPrimary },
                  theme.typography.h4,
                ]}
                numberOfLines={1}
              >
                {item.title}
              </Text>
              <Text
                style={[
                  styles.date,
                  { color: theme.colors.textTertiary },
                  theme.typography.caption,
                ]}
              >
                {item.date}
              </Text>
            </View>
            <Text
              style={[
                styles.preview,
                { color: theme.colors.textSecondary },
                theme.typography.bodySmall,
              ]}
              numberOfLines={2}
            >
              {item.preview}
            </Text>
          </View>

          {!isSelectionMode && (
            <TouchableOpacity
              style={[
                styles.deleteButton,
                { backgroundColor: theme.colors.errorMuted },
              ]}
              onPress={() => handleDelete(item.id)}
              activeOpacity={0.7}
            >
              <Ionicons
                name="trash-outline"
                size={18}
                color={theme.colors.error}
              />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

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
        <View>
          <Text
            style={[
              styles.heading,
              { color: theme.colors.textPrimary },
              theme.typography.h2,
            ]}
          >
            History
          </Text>
          <Text
            style={[
              styles.subtitle,
              { color: theme.colors.textSecondary },
              theme.typography.bodySmall,
            ]}
          >
            {conversations.length} conversation{conversations.length !== 1 ? "s" : ""}
          </Text>
        </View>
        {conversations.length > 0 && (
          <TouchableOpacity
            style={[
              styles.selectButton,
              {
                backgroundColor: isSelectionMode
                  ? theme.colors.primaryMuted
                  : theme.colors.surfaceSecondary,
                borderWidth: 1,
                borderColor: isSelectionMode
                  ? theme.colors.primary
                  : theme.colors.border,
              },
            ]}
            onPress={toggleSelectionMode}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.selectButtonText,
                {
                  color: isSelectionMode
                    ? theme.colors.primary
                    : theme.colors.textSecondary,
                },
                theme.typography.button,
              ]}
            >
              {isSelectionMode ? "Cancel" : "Select"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {isSelectionMode && selectedConversations.size > 0 && (
        <LinearGradient
          colors={theme.gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.selectionBar, theme.shadows.glow.sm]}
        >
          <Text
            style={[
              styles.selectedCount,
              { color: theme.colors.pureWhite },
              theme.typography.body,
            ]}
          >
            {selectedConversations.size} selected
          </Text>
          <TouchableOpacity
            style={[
              styles.deleteSelectedButton,
              { backgroundColor: theme.colors.error },
            ]}
            onPress={handleDeleteSelected}
            activeOpacity={0.85}
          >
            <Ionicons
              name="trash-outline"
              size={18}
              color={theme.colors.pureWhite}
            />
            <Text
              style={[
                styles.deleteSelectedText,
                { color: theme.colors.pureWhite },
                theme.typography.button,
              ]}
            >
              Delete
            </Text>
          </TouchableOpacity>
        </LinearGradient>
      )}

      {conversations.length === 0 ? (
        <View style={styles.emptyState}>
          <LinearGradient
            colors={theme.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.emptyIcon, theme.shadows.glow.sm]}
          >
            <Ionicons
              name="chatbubbles-outline"
              size={48}
              color={theme.colors.pureWhite}
            />
          </LinearGradient>
          <Text
            style={[
              styles.emptyTitle,
              { color: theme.colors.textPrimary },
              theme.typography.h4,
            ]}
          >
            No Conversations Yet
          </Text>
          <Text
            style={[
              styles.emptyDescription,
              { color: theme.colors.textSecondary },
              theme.typography.body,
            ]}
          >
            Start a new chat to begin practicing your conversation skills
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("Chat")}
            activeOpacity={0.85}
            style={styles.startChatWrapper}
          >
            <LinearGradient
              colors={theme.gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.startChatButton, theme.shadows.glow.sm]}
            >
              <Text
                style={[
                  styles.startChatText,
                  { color: theme.colors.pureWhite },
                  theme.typography.button,
                ]}
              >
                Start a Chat
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderConversationItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshing={loading}
          onRefresh={fetchConversations}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  heading: {
    marginBottom: 4,
  },
  subtitle: {
    // Typography applied via theme
  },
  selectButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  selectButtonText: {
    // Typography applied via theme
  },
  selectionBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  selectedCount: {
    // Typography applied via theme
  },
  deleteSelectedButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 6,
  },
  deleteSelectedText: {
    // Typography applied via theme
  },
  listContent: {
    paddingBottom: 24,
    gap: 12,
  },
  conversationCard: {
    borderRadius: 16,
    padding: 16,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  textContent: {
    flex: 1,
    marginLeft: 12,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  title: {
    flex: 1,
    marginRight: 8,
  },
  date: {
    // Typography applied via theme
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
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    marginBottom: 8,
    textAlign: "center",
  },
  emptyDescription: {
    textAlign: "center",
    marginBottom: 24,
  },
  startChatWrapper: {
    borderRadius: 16,
    overflow: "hidden",
  },
  startChatButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 16,
  },
  startChatText: {
    // Typography applied via theme
  },
});
