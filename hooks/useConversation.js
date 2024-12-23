// hooks/useConversation.js
import { useState, useEffect, useCallback } from "react";
import { Alert } from "react-native";
import {
  sendMessageToAPI,
  validateMessage,
  formatMessageHistory,
} from "../services/api";

export const useConversation = (supabase, route) => {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [contextWindow, setContextWindow] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const initializeConversation = async (forceNew = false) => {
    if (isInitialized && !forceNew) return; // Don't initialize if already done unless forced

    try {
      setIsLoading(true);
      setError(null);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("No authenticated user found");

      const conversationId = route.params?.conversationId;
      if (conversationId && !forceNew) {
        const { data: existingConversation, error: conversationError } =
          await supabase
            .from("conversations")
            .select("*")
            .eq("id", conversationId)
            .eq("user_id", user.id)
            .single();

        if (!conversationError && existingConversation) {
          setConversation(existingConversation);
          await loadMessages(conversationId);
          setIsInitialized(true);
          return;
        }
      }

      // Only create new conversation if forced or no existing conversation
      if (forceNew || !conversation) {
        const { data: newConversation, error: newConversationError } =
          await supabase
            .from("conversations")
            .insert({
              title: "New Chat",
              model: "dolphin-2.9.2-qwen2-72b",
              user_id: user.id,
            })
            .select()
            .single();

        if (newConversationError) throw newConversationError;
        setConversation(newConversation);
        setMessages([]); // Clear messages for new conversation
        setContextWindow([]); // Clear context window for new conversation
      }

      setIsInitialized(true);
    } catch (error) {
      console.error("Error initializing conversation:", error);
      setError(error.message);
      Alert.alert("Error", "Failed to start conversation");
    } finally {
      setIsLoading(false);
    }
  };

  // Only initialize on first mount if we have a conversationId
  useEffect(() => {
    if (route.params?.conversationId && !isInitialized) {
      initializeConversation();
    }
  }, []);

  const loadMessages = async (conversationId) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const validMessages = data || [];
      setMessages(validMessages);
      setContextWindow(validMessages.slice(-5));
    } catch (error) {
      console.error("Error loading messages:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = useCallback(
    async (content) => {
      if (!validateMessage(content)) {
        Alert.alert("Error", "Invalid message content");
        return;
      }

      // Initialize conversation if not already done
      if (!conversation) {
        await initializeConversation();
      }

      try {
        setIsLoading(true);
        setError(null);

        // Create user message
        const userMessage = {
          role: "user",
          content: content,
          conversation_id: conversation.id,
          created_at: new Date().toISOString(),
        };

        const { error: insertError } = await supabase
          .from("messages")
          .insert(userMessage);

        if (insertError) throw insertError;

        // Update local state and context
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);

        // Use current context window plus the new message for API request
        const currentContext = [...contextWindow, userMessage];
        setContextWindow(currentContext);

        const { responseText, metadata, success } = await sendMessageToAPI(
          content,
          conversation.model,
          formatMessageHistory(currentContext)
        );

        if (!success) throw new Error("Failed to get AI response");

        // Save AI response
        const aiMessage = {
          role: "assistant",
          content: responseText,
          conversation_id: conversation.id,
          metadata: metadata,
          created_at: new Date().toISOString(),
        };

        const { error: aiInsertError } = await supabase
          .from("messages")
          .insert(aiMessage);

        if (aiInsertError) throw aiInsertError;

        // Update messages and context window
        const finalMessages = [...updatedMessages, aiMessage];
        setMessages(finalMessages);
        setContextWindow(finalMessages.slice(-5));

        await updateConversationTimestamp();

        return { success: true };
      } catch (error) {
        console.error("Error sending message:", error);
        setError(error.message);
        Alert.alert("Error", "Failed to send message");
        return { success: false, error };
      } finally {
        setIsLoading(false);
      }
    },
    [conversation, messages, contextWindow]
  );

  const updateConversationTimestamp = async () => {
    if (!conversation) return;

    try {
      const { error } = await supabase
        .from("conversations")
        .update({ last_message_at: new Date().toISOString() })
        .eq("id", conversation.id)
        .eq("user_id", conversation.user_id);

      if (error) throw error;
    } catch (error) {
      console.error("Error updating conversation timestamp:", error);
    }
  };

  return {
    conversation,
    messages,
    contextWindow,
    isLoading,
    error,
    sendMessage,
    loadMessages,
    updateConversationTimestamp,
    initializeConversation,
  };
};
