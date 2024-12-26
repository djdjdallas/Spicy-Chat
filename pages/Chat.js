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
import { WelcomeMessages } from "../components/chat/WelcomeMessages";
import { useConversation } from "../hooks/useConversation";
import { useConversationPartner } from "../features/ConversationPartner";
import { sendMessageToAPI, formatMessageHistory } from "../services/api";

const Chat = ({ navigation, route }) => {
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef();

  // Track message context
  const [messageContext, setMessageContext] = useState({
    lastMessageId: null,
    lastResponseId: null,
    contextChain: [],
  });

  const {
    conversation,
    messages,
    setMessages,
    contextWindow,
    isLoading: conversationLoading,
    error,
    initializeConversation,
  } = useConversation(supabase, route);

  const { currentPartner, getInteractionFeedback } = useConversationPartner();

  // Initialize conversation when component mounts
  useEffect(() => {
    const init = async () => {
      if (!conversation) {
        await initializeConversation(true); // Force new conversation
      }
    };
    init();
  }, []);

  // Initialize new chat with context tracking
  const initializeNewChat = async () => {
    try {
      // Initialize new conversation in Supabase
      await initializeConversation(true);

      // Reset message context
      setMessageContext({
        lastMessageId: null,
        lastResponseId: null,
        contextChain: [],
      });
    } catch (error) {
      console.error("Error initializing new chat:", error);
      Alert.alert("Error", "Failed to start new chat. Please try again.");
    }
  };

  const saveMessageToDatabase = async (content, role, metadata = {}) => {
    try {
      if (!conversation) {
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

  const sendMessage = async (messageText) => {
    if (!messageText?.trim() || isLoading) {
      return;
    }

    // Ensure we have a conversation
    if (!conversation) {
      try {
        await initializeConversation(true);
      } catch (error) {
        console.error("Failed to initialize conversation:", error);
        Alert.alert("Error", "Failed to start conversation. Please try again.");
        return;
      }
    }

    const messageContent = messageText.trim();

    try {
      setIsLoading(true);

      // Save user message with context
      const savedUserMessage = await saveMessageToDatabase(
        messageContent,
        "user"
      );

      // Update messages array with the new user message
      setMessages((prevMessages) => [...prevMessages, savedUserMessage]);

      // Update context tracking
      const newContext = {
        lastMessageId: savedUserMessage.id,
        lastResponseId: messageContext.lastResponseId,
        contextChain: [...messageContext.contextChain, savedUserMessage.id],
      };
      setMessageContext(newContext);

      // Get API response with context
      const { responseText, metadata, success } = await sendMessageToAPI(
        messageContent,
        conversation.model,
        formatMessageHistory([...messages, savedUserMessage].slice(-5))
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

      // Update messages array with the AI response
      setMessages((prevMessages) => [...prevMessages, savedAiMessage]);

      // Update context with AI response
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
          ListHeaderComponent={<WelcomeMessages />}
          data={messages}
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
