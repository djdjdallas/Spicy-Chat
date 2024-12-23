// pages/Chat.js
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import { supabase } from "../lib/supabase";
import { ChatHeader } from "../components/chat/Header";
import { MessageBubble } from "../components/chat/MessageBubble";
import { MessageInput } from "../components/chat/MessageInput";
import { useConversation } from "../hooks/useConversation";
import { useConversationPartner } from "../features/ConversationPartner";
import { sendMessageToAPI, formatMessageHistory } from "../services/api";

const Chat = ({ navigation, route }) => {
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef();

  // Track message context
  const [messageContext, setMessageContext] = useState({
    lastMessageId: null,
    lastResponseId: null,
    contextChain: [],
  });

  const [localMessages, setLocalMessages] = useState([
    {
      id: "welcome-message-1",
      role: "assistant",
      content:
        "Hey! 👋 I'm here to help you level up your dating game. Whether you're looking to improve your confidence, conversation skills, or just want to practice flirting in a safe space, I've got you covered!",
      conversation_id: null,
      created_at: new Date().toISOString(),
      context_id: "welcome-context",
    },
    {
      id: "welcome-message-2",
      role: "assistant",
      content:
        "Feel free to roleplay different scenarios like first dates, dating app conversations, or getting someone's number. I'll provide feedback and tips to help you improve. What would you like to practice?",
      conversation_id: null,
      created_at: new Date(Date.now() + 100).toISOString(),
      context_id: "welcome-context",
    },
  ]);

  const {
    conversation,
    messages,
    contextWindow,
    isLoading: conversationLoading,
    error,
    initializeConversation,
  } = useConversation(supabase, route);

  const { currentPartner, getInteractionFeedback } = useConversationPartner();

  // Initialize conversation when component mounts
  useEffect(() => {
    const init = async () => {
      console.log("Initializing conversation...");
      if (!conversation) {
        await initializeConversation(true); // Force new conversation
      }
    };
    init();
  }, []);

  // Debug logging
  useEffect(() => {
    console.log("Conversation state:", conversation);
  }, [conversation]);

  useEffect(() => {
    console.log("Local messages:", localMessages);
  }, [localMessages]);

  // Initialize new chat with context tracking
  const initializeNewChat = async () => {
    try {
      // Initialize new conversation in Supabase
      await initializeConversation(true);

      // Reset local messages with welcome messages
      const welcomeMessages = [
        {
          id: "welcome-message-1",
          role: "assistant",
          content:
            "Hey! 👋 I'm here to help you level up your dating game. Whether you're looking to improve your confidence, conversation skills, or just want to practice flirting in a safe space, I've got you covered!",
          conversation_id: conversation?.id,
          created_at: new Date().toISOString(),
          context_id: "welcome-context-new",
        },
        {
          id: "welcome-message-2",
          role: "assistant",
          content:
            "Feel free to roleplay different scenarios like first dates, dating app conversations, or getting someone's number. I'll provide feedback and tips to help you improve. What would you like to practice?",
          conversation_id: conversation?.id,
          created_at: new Date(Date.now() + 100).toISOString(),
          context_id: "welcome-context-new",
        },
      ];
      setLocalMessages(welcomeMessages);

      // Reset message context
      setMessageContext({
        lastMessageId: null,
        lastResponseId: null,
        contextChain: ["welcome-context-new"],
      });
    } catch (error) {
      console.error("Error initializing new chat:", error);
      Alert.alert("Error", "Failed to start new chat. Please try again.");
    }
  };

  const saveMessageToDatabase = async (content, role, metadata = {}) => {
    try {
      if (!conversation) {
        console.log("No conversation, initializing...");
        await initializeConversation(true);
      }

      const messageData = {
        conversation_id: conversation.id,
        user_id: conversation.user_id,
        role: role,
        content: content,
        metadata: {
          ...metadata,
          context_id: messageContext.lastMessageId,
          context_chain: messageContext.contextChain,
        },
      };

      const { data, error } = await supabase
        .from("messages")
        .insert(messageData)
        .select()
        .single();

      if (error) throw error;

      // Update conversation timestamp
      const { error: timestampError } = await supabase
        .from("conversations")
        .update({ last_message_at: new Date().toISOString() })
        .eq("id", conversation.id)
        .eq("user_id", conversation.user_id);

      if (timestampError) throw timestampError;

      return data;
    } catch (error) {
      console.error("Error saving message:", error);
      throw error;
    }
  };

  const sendMessage = async () => {
    console.log("sendMessage called, inputText:", inputText);

    if (!inputText?.trim() || isLoading) {
      console.log("Send conditions not met:", {
        hasInput: !!inputText?.trim(),
        isLoading,
      });
      return;
    }

    // Ensure we have a conversation
    if (!conversation) {
      console.log("No conversation, initializing...");
      try {
        await initializeConversation(true);
      } catch (error) {
        console.error("Failed to initialize conversation:", error);
        Alert.alert("Error", "Failed to start conversation. Please try again.");
        return;
      }
    }

    const messageContent = inputText.trim();
    setInputText(""); // Clear input immediately for better UX

    try {
      setIsLoading(true);

      // Save user message with context
      const savedUserMessage = await saveMessageToDatabase(
        messageContent,
        "user"
      );
      console.log("User message saved:", savedUserMessage);

      // Update local messages and context
      const updatedMessages = [...localMessages, savedUserMessage];
      setLocalMessages(updatedMessages);

      // Update context tracking
      const newContext = {
        lastMessageId: savedUserMessage.id,
        lastResponseId: messageContext.lastResponseId,
        contextChain: [...messageContext.contextChain, savedUserMessage.id],
      };
      setMessageContext(newContext);

      // Get API response with context
      console.log("Sending message to API...");
      const { responseText, metadata, success } = await sendMessageToAPI(
        messageContent,
        conversation.model,
        formatMessageHistory(updatedMessages.slice(-5))
      );

      if (!success) {
        throw new Error("Failed to get response from API");
      }

      // Get interaction feedback if partner exists
      let feedbackMetadata = {};
      if (currentPartner) {
        const feedback = getInteractionFeedback(
          messageContent,
          currentPartner.id
        );
        feedbackMetadata = {
          ...metadata,
          feedback,
          contextual_feedback: true,
        };
      }

      // Save AI response with enhanced context
      const savedAiMessage = await saveMessageToDatabase(
        responseText,
        "assistant",
        {
          ...feedbackMetadata,
          reference_message_id: savedUserMessage.id,
          context_chain: newContext.contextChain,
        }
      );

      // Update local messages and context with AI response
      setLocalMessages([...updatedMessages, savedAiMessage]);
      setMessageContext({
        ...newContext,
        lastResponseId: savedAiMessage.id,
        contextChain: [...newContext.contextChain, savedAiMessage.id],
      });

      // Scroll to bottom
      if (flatListRef.current) {
        setTimeout(
          () => flatListRef.current.scrollToEnd({ animated: true }),
          100
        );
      }
    } catch (error) {
      console.error("Error in sendMessage:", error);

      // Add error message to local state with context
      const errorMessage = {
        id: "error-" + Date.now(),
        role: "assistant",
        content: "I'm having trouble responding right now. Please try again.",
        conversation_id: conversation?.id,
        isError: true,
        created_at: new Date().toISOString(),
        context_id: messageContext.lastMessageId,
      };

      setLocalMessages((prev) => [...prev, errorMessage]);
      Alert.alert("Error", "Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ChatHeader onNewChat={initializeNewChat} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.chatContainer}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={localMessages}
          renderItem={({ item }) => (
            <MessageBubble
              message={item}
              isPartOfContext={messageContext.contextChain.includes(item.id)}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          onLayout={() => flatListRef.current?.scrollToEnd()}
        />

        {(isLoading || conversationLoading) && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0084ff" />
          </View>
        )}

        <MessageInput
          inputText={inputText}
          setInputText={setInputText}
          sendMessage={sendMessage}
          isLoading={isLoading || conversationLoading}
        />
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  chatContainer: {
    flex: 1,
  },
  messageList: {
    padding: 15,
    paddingBottom: 30,
  },
  loadingContainer: {
    padding: 10,
    alignItems: "center",
  },
});

export default Chat;
