// components/chat/MessageBubble.js
import React, { memo } from "react";
import { View, Text, StyleSheet } from "react-native";

export const MessageBubble = memo(({ message, isPartOfContext }) => {
  const isUser = message.role === "user";

  // Format timestamp
  const formatTime = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.warn("Error formatting timestamp:", error);
      return "";
    }
  };

  return (
    <View
      style={[
        styles.messageContainer,
        isUser ? styles.userMessageContainer : styles.assistantMessageContainer,
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.assistantBubble,
          isPartOfContext && styles.contextualMessage,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            isUser ? styles.userText : styles.assistantText,
          ]}
        >
          {message.content}
        </Text>

        {message.created_at && (
          <View style={styles.messageFooter}>
            <Text
              style={[
                styles.timestamp,
                isUser ? styles.userTimestamp : styles.assistantTimestamp,
              ]}
            >
              {formatTime(message.created_at)}
            </Text>
            {isPartOfContext && <Text style={styles.contextIndicator}>↻</Text>}
          </View>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  messageContainer: {
    flexDirection: "row",
    marginVertical: 4,
    paddingHorizontal: 8,
  },
  userMessageContainer: {
    justifyContent: "flex-end",
  },
  assistantMessageContainer: {
    justifyContent: "flex-start",
  },
  messageBubble: {
    maxWidth: "80%",
    minWidth: 60,
    padding: 12,
    borderRadius: 20,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  userBubble: {
    backgroundColor: "#0084ff",
    borderBottomRightRadius: 5,
  },
  assistantBubble: {
    backgroundColor: "#fff",
    borderBottomLeftRadius: 5,
  },
  contextualMessage: {
    borderWidth: 1,
    borderColor: "rgba(0, 132, 255, 0.3)",
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
    marginBottom: 4,
  },
  userText: {
    color: "#fff",
  },
  assistantText: {
    color: "#333",
  },
  messageFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 2,
  },
  timestamp: {
    fontSize: 11,
  },
  userTimestamp: {
    color: "rgba(255, 255, 255, 0.7)",
  },
  assistantTimestamp: {
    color: "rgba(0, 0, 0, 0.5)",
  },
  contextIndicator: {
    marginLeft: 4,
    fontSize: 12,
    color: "rgba(0, 132, 255, 0.7)",
  },
});

export default MessageBubble;
