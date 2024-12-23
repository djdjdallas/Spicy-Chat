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

  const handleConversationPress = (conversationId) => {
    navigation.navigate("Chat", { conversationId });
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

              // First delete all messages associated with this conversation
              const { error: messagesError } = await supabase
                .from("messages")
                .delete()
                .eq("conversation_id", conversationId);

              if (messagesError) throw messagesError;

              // Then delete the conversation itself
              const { error: conversationError } = await supabase
                .from("conversations")
                .delete()
                .eq("id", conversationId);

              if (conversationError) throw conversationError;

              // Update the local state to remove the deleted conversation
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
      <Text style={styles.heading}>Conversation History</Text>
      {conversations.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No conversations yet</Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.conversationItem}>
              <TouchableOpacity
                style={styles.conversationContent}
                onPress={() => handleConversationPress(item.id)}
              >
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.date}>{item.date}</Text>
                <Text style={styles.preview} numberOfLines={2}>
                  {item.preview}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(item.id)}
              >
                <Ionicons name="trash-outline" size={24} color="#ff4444" />
              </TouchableOpacity>
            </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0084ff",
    marginBottom: 20,
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
  conversationContent: {
    flex: 1,
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
