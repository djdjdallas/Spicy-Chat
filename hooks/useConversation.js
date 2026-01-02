import { useState, useEffect, useCallback } from "react";
import { Alert } from "react-native";
import {
  sendMessageToAPI,
  validateMessage,
  formatMessageHistory,
  FREE_MESSAGE_LIMIT,
} from "../services/api";

export const useConversation = (supabase, route) => {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [contextWindow, setContextWindow] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError) throw userError;

        // Changed from .single() to just getting all matches
        const { data, error } = await supabase
          .from("subscriptions")
          .select("status")
          .eq("user_id", user.id);

        if (error) {
          if (__DEV__) {
            console.error("Error checking subscription:", error);
          }
          setIsSubscribed(false); // Default to not subscribed on error
        } else {
          // Check if there are any active subscriptions
          const hasActiveSubscription = data?.some(
            (sub) => sub.status === "active"
          );
          setIsSubscribed(hasActiveSubscription);
        }
      } catch (error) {
        if (__DEV__) {
          console.error("Error checking subscription:", error);
        }
        setIsSubscribed(false); // Default to not subscribed on error
      }
    };

    checkSubscription();
  }, []);

  const loadMessages = async (conversationId) => {
    try {
      setIsLoading(true);
      setError(null);
      if (__DEV__) {
        console.log("Loading messages for conversation:", conversationId);
      }

      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const validMessages = data || [];
      if (__DEV__) {
        console.log(`Loaded ${validMessages.length} messages`);
      }
      setMessages(validMessages);
      setContextWindow(validMessages.slice(-5));

      return validMessages;
    } catch (error) {
      if (__DEV__) {
        console.error("Error loading messages:", error);
      }
      setError(error.message);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const initializeConversation = async (forceNew = false) => {
    if (__DEV__) {
      console.log("Initializing conversation, forceNew:", forceNew);
      console.log("Current isInitialized:", isInitialized);
    }

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
      if (__DEV__) {
        console.log("Conversation ID from route params:", conversationId);
      }

      // Handle existing conversation
      if (conversationId && !forceNew) {
        if (__DEV__) {
          console.log("Attempting to load existing conversation:", conversationId);
        }
        const { data: existingConversation, error: conversationError } =
          await supabase
            .from("conversations")
            .select("*")
            .eq("id", conversationId)
            .single();

        if (conversationError) {
          if (__DEV__) {
            console.error("Error fetching conversation:", conversationError);
          }
          throw conversationError;
        }

        if (existingConversation) {
          if (__DEV__) {
            console.log("Found existing conversation:", existingConversation.id);
          }
          setConversation(existingConversation);
          const loadedMessages = await loadMessages(conversationId);
          if (loadedMessages.length > 0) {
            setIsInitialized(true);
            return;
          }
        }
      }

      // Only create new if explicitly forced or no existing conversation found
      if (forceNew || !conversationId) {
        if (__DEV__) {
          console.log("Creating new conversation");
        }
        const { data: newConversation, error: newConversationError } =
          await supabase
            .from("conversations")
            .insert({
              title: "New Chat",
              model: "cognitivecomputations/dolphin-2.9.2-qwen2-72b",
              user_id: user.id,
            })
            .select()
            .single();

        if (newConversationError) throw newConversationError;

        if (__DEV__) {
          console.log("Created new conversation:", newConversation.id);
        }
        setConversation(newConversation);
        setMessages([]); // Clear messages for new conversation
        setContextWindow([]); // Clear context window for new conversation
      }

      setIsInitialized(true);
    } catch (error) {
      if (__DEV__) {
        console.error("Error initializing conversation:", error);
      }
      setError(error.message);
      Alert.alert("Error", "Failed to start conversation");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const conversationId = route.params?.conversationId;
    if (conversationId) {
      if (__DEV__) {
        console.log("Conversation ID changed:", conversationId);
      }
      setIsInitialized(false);
      setConversation(null);
      setMessages([]);
      setContextWindow([]);
      initializeConversation(false);
    }
  }, [route.params?.conversationId]);

  const sendMessage = useCallback(
    async (content) => {
      if (!isSubscribed && messageCount >= FREE_MESSAGE_LIMIT) {
        Alert.alert(
          "Message Limit Reached",
          "You have reached the maximum number of messages for free accounts. Please subscribe to continue.",
          [
            {
              text: "Subscribe",
              onPress: () => {
                // Navigate to subscription page
              },
            },
            {
              text: "Cancel",
              style: "cancel",
            },
          ]
        );
        return;
      }

      if (!validateMessage(content)) {
        Alert.alert("Error", "Invalid message content");
        return;
      }

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

        const { data: savedMessage, error: insertError } = await supabase
          .from("messages")
          .insert(userMessage)
          .select()
          .single();

        if (insertError) throw insertError;

        // Update local state with the saved message
        const updatedMessages = [...messages, savedMessage];
        setMessages(updatedMessages);

        // Use current context window plus the new message for API request
        const currentContext = [...contextWindow, savedMessage];
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

        const { data: savedAiMessage, error: aiInsertError } = await supabase
          .from("messages")
          .insert(aiMessage)
          .select()
          .single();

        if (aiInsertError) throw aiInsertError;

        // Update messages and context window with saved messages
        const finalMessages = [...updatedMessages, savedAiMessage];
        setMessages(finalMessages);
        setContextWindow(finalMessages.slice(-5));

        await updateConversationTimestamp();

        setMessageCount((prevCount) => prevCount + 1);

        return { success: true };
      } catch (error) {
        if (__DEV__) {
          console.error("Error sending message:", error);
        }
        setError(error.message);
        Alert.alert("Error", "Failed to send message");
        return { success: false, error };
      } finally {
        setIsLoading(false);
      }
    },
    [conversation, messages, contextWindow, isSubscribed, messageCount]
  );

  const updateConversationTimestamp = async () => {
    if (!conversation) return;

    try {
      const { error } = await supabase
        .from("conversations")
        .update({ last_message_at: new Date().toISOString() })
        .eq("id", conversation.id);

      if (error) throw error;
    } catch (error) {
      if (__DEV__) {
        console.error("Error updating conversation timestamp:", error);
      }
    }
  };

  return {
    conversation,
    messages,
    setMessages,
    contextWindow,
    isLoading,
    error,
    sendMessage,
    loadMessages,
    updateConversationTimestamp,
    initializeConversation,
  };
};

export default useConversation;
