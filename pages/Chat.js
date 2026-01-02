// Chat.js
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
import { useTheme } from "../context/ThemeContext";

const Chat = ({ navigation, route }) => {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef();
  const [listHeight, setListHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [userProfile, setUserProfile] = useState(null);

  // Get partner info from route params
  const partnerName = route.params?.partnerName || "Assistant";
  const partnerId = route.params?.partnerId;
  const partnerStyle = route.params?.partnerStyle;
  const partnerGoals = route.params?.partnerGoals;

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
        await initializeConversation(true);
      }
    };
    init();
  }, []);

  // Fetch user profile for personalization
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          if (!error && profile) {
            setUserProfile(profile);
          }
        }
      } catch (error) {
        if (__DEV__) {
          console.error("Error fetching user profile:", error);
        }
      }
    };
    fetchUserProfile();
  }, []);

  // Auto-scroll when new messages are added
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  // Initialize new chat with context tracking
  const initializeNewChat = async () => {
    try {
      await initializeConversation(true);
      setMessageContext({
        lastMessageId: null,
        lastResponseId: null,
        contextChain: [],
      });
    } catch (error) {
      if (__DEV__) {
        console.error("Error initializing new chat:", error);
      }
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
          partnerName: partnerName,
          partnerId: partnerId,
          partnerStyle: partnerStyle,
          partnerGoals: partnerGoals,
          isPartnerMessage: role !== "user",
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
      if (__DEV__) {
        console.error("Error saving message:", error);
      }
      throw error;
    }
  };

  const sendMessage = async (messageText) => {
    if (!messageText?.trim() || isLoading) {
      return;
    }

    try {
      setIsLoading(true);

      // Save user message with context
      const savedUserMessage = await saveMessageToDatabase(messageText, "user");

      // Update messages array with the new user message
      setMessages((prevMessages) => [...prevMessages, savedUserMessage]);

      // Get API response with context
      const { responseText, metadata, success } = await sendMessageToAPI(
        messageText,
        conversation.model,
        formatMessageHistory([...messages, savedUserMessage].slice(-5)),
        0,
        userProfile
      );

      if (!success) {
        throw new Error("Failed to get response from API");
      }

      // Get interaction feedback if partner exists
      let feedbackMetadata = {};
      if (partnerId) {
        const feedback = getInteractionFeedback(messageText, partnerId);
        feedbackMetadata = {
          ...metadata,
          feedback,
          contextual_feedback: true,
        };
      }

      // Save AI response with partner information
      const savedAiMessage = await saveMessageToDatabase(
        responseText,
        "assistant",
        {
          ...feedbackMetadata,
          reference_message_id: savedUserMessage.id,
          context_chain: [...messageContext.contextChain, savedUserMessage.id],
          isPartnerMessage: true,
          partnerName: partnerName,
        }
      );

      // Add AI response to the UI
      setMessages((prevMessages) => {
        const uniqueMessages = prevMessages.filter(
          (msg) => msg.id !== savedAiMessage.id
        );
        return [...uniqueMessages, savedAiMessage];
      });

      // Update context
      setMessageContext({
        lastMessageId: savedUserMessage.id,
        lastResponseId: savedAiMessage.id,
        contextChain: [
          ...messageContext.contextChain,
          savedUserMessage.id,
          savedAiMessage.id,
        ],
      });

      // Scroll to bottom
      if (flatListRef.current) {
        setTimeout(
          () => flatListRef.current.scrollToEnd({ animated: true }),
          100
        );
      }
    } catch (error) {
      if (__DEV__) {
        console.error("Error in sendMessage:", error);
      }
      Alert.alert("Error", "Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ChatHeader
        onNewChat={initializeNewChat}
        theme={theme}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.chatContainer}
        keyboardVerticalOffset={Platform.OS === "ios" ? 5 : 0}
      >
        <View
          style={[
            styles.scrollContainer,
            { backgroundColor: theme.colors.background },
          ]}
          onLayout={(event) => {
            const { height } = event.nativeEvent.layout;
            setListHeight(height);
          }}
        >
          <FlatList
            ref={flatListRef}
            ListHeaderComponent={
              <WelcomeMessages
                theme={theme}
                partnerName={partnerName}
              />
            }
            data={messages}
            renderItem={({ item }) => (
              <MessageBubble
                message={item}
                isPartOfContext={messageContext.contextChain.includes(item.id)}
                theme={theme}
                senderName={item.role === "user" ? "You" : partnerName}
              />
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[
              styles.messageList,
              {
                paddingTop: Math.max(0, listHeight - contentHeight),
                backgroundColor: theme.colors.background,
              },
            ]}
            onContentSizeChange={(width, height) => {
              setContentHeight(height);
              if (flatListRef.current) {
                flatListRef.current.scrollToEnd({ animated: false });
              }
            }}
            onLayout={() => {
              if (flatListRef.current) {
                flatListRef.current.scrollToEnd({ animated: false });
              }
            }}
          />
        </View>

        {(isLoading || conversationLoading) && (
          <View
            style={[
              styles.loadingContainer,
              { backgroundColor: theme.colors.background },
            ]}
          >
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        )}

        <MessageInput
          sendMessage={sendMessage}
          isLoading={isLoading || conversationLoading}
          theme={theme}
        />
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chatContainer: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
    marginBottom: Platform.OS === "ios" ? 0 : 60,
  },
  messageList: {
    padding: 15,
    paddingBottom: 70,
    flexGrow: 1,
  },
  loadingContainer: {
    padding: 10,
    alignItems: "center",
  },
});

export default Chat;
