// hooks/useConversationManagement.js
import { useState } from "react";
import { Alert } from "react-native";

export const useConversationManagement = (supabase) => {
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedConversations, setSelectedConversations] = useState(new Set());

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

  const deleteConversations = async (conversationIds, onSuccess) => {
    try {
      // Get all message IDs for the selected conversations
      const { data: messagesData, error: messagesQueryError } = await supabase
        .from("messages")
        .select("id, conversation_id")
        .in("conversation_id", conversationIds);

      if (messagesQueryError) throw messagesQueryError;
      const messageIds = messagesData?.map((msg) => msg.id) || [];

      // Delete context_memory entries in batches
      if (messageIds.length > 0) {
        const batchSize = 100;
        for (let i = 0; i < messageIds.length; i += batchSize) {
          const batchIds = messageIds.slice(i, i + batchSize);
          const { error: contextDeleteError } = await supabase
            .from("context_memory")
            .delete()
            .in("source_message_id", batchIds);

          if (contextDeleteError) throw contextDeleteError;
        }
      }

      // Delete messages for each conversation
      for (const conversationId of conversationIds) {
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
        .in("id", conversationIds);

      if (conversationsError) throw conversationsError;

      onSuccess();
      return true;
    } catch (error) {
      console.error("Error deleting conversations:", error);
      Alert.alert(
        "Error",
        `Failed to delete conversation(s): ${error.message || "Unknown error"}`
      );
      return false;
    }
  };

  return {
    isSelectionMode,
    selectedConversations,
    toggleSelectionMode,
    toggleConversationSelection,
    deleteConversations,
  };
};
