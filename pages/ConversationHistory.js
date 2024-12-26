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

const ConversationHistory = () => {
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

              // Delete messages for all selected conversations
              const { error: messagesError } = await supabase
                .from("messages")
                .delete()
                .in("conversation_id", Array.from(selectedConversations));

              if (messagesError) throw messagesError;

              // Delete the conversations
              const { error: conversationsError } = await supabase
                .from("conversations")
                .delete()
                .in("id", Array.from(selectedConversations));

              if (conversationsError) throw conversationsError;

              // Update local state
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0084ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Conversation History</Text>
        {conversations.length > 0 && (
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

      {isSelectionMode && selectedConversations.size > 0 && (
        <View style={styles.selectionBar}>
          <Text style={styles.selectedCount}>
            {selectedConversations.size} selected
          </Text>
          <TouchableOpacity
            style={styles.deleteSelectedButton}
            onPress={handleDeleteSelected}
          >
            <Ionicons name="trash-outline" size={24} color="white" />
            <Text style={styles.deleteSelectedText}>Delete Selected</Text>
          </TouchableOpacity>
        </View>
      )}

      {conversations.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No conversations yet</Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.conversationItem,
                selectedConversations.has(item.id) && styles.selectedItem,
              ]}
              onPress={() => handleConversationPress(item.id)}
            >
              <View style={styles.conversationContent}>
                {isSelectionMode && (
                  <View style={styles.checkbox}>
                    {selectedConversations.has(item.id) && (
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color="#0084ff"
                      />
                    )}
                  </View>
                )}
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.date}>{item.date}</Text>
                <Text style={styles.preview} numberOfLines={2}>
                  {item.preview}
                </Text>
              </View>
              {!isSelectionMode && (
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(item.id)}
                >
                  <Ionicons name="trash-outline" size={24} color="#ff4444" />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          )}
          refreshing={loading}
          onRefresh={fetchConversations}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 15,
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
    color: "#0084ff",
  },
  selectButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#0084ff",
  },
  selectButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  selectionBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  selectedCount: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  deleteSelectedButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ff4444",
    padding: 8,
    borderRadius: 8,
    gap: 8,
  },
  deleteSelectedText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  conversationItem: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    flexDirection: "row",
    alignItems: "center",
  },
  selectedItem: {
    backgroundColor: "#e3efff",
    borderColor: "#0084ff",
    borderWidth: 1,
  },
  conversationContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  checkbox: {
    width: 24,
    height: 24,
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#0084ff",
    borderRadius: 12,
  },
  deleteButton: {
    padding: 10,
    marginLeft: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
    flex: 1,
  },
  date: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  preview: {
    fontSize: 16,
    color: "#333",
    marginTop: 5,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
  },
});

export default ConversationHistory;
