// components/chat/MessageBubble.js
import React, { memo, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Clipboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const ContextIndicator = ({ contextChain }) => {
  if (!contextChain?.length) return null;

  return (
    <View style={styles.contextChain}>
      {contextChain.map((id, index) => (
        <Text
          key={id}
          style={[
            styles.contextDot,
            index === contextChain.length - 1 && styles.currentContextDot,
          ]}
        >
          {index === 0 ? "↻" : "•"}
        </Text>
      ))}
    </View>
  );
};

// Memoize component comparison
const areEqual = (prevProps, nextProps) => {
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.content === nextProps.message.content &&
    prevProps.isPartOfContext === nextProps.isPartOfContext &&
    JSON.stringify(prevProps.message.metadata?.contextChain) ===
      JSON.stringify(nextProps.message.metadata?.contextChain)
  );
};

export const MessageBubble = memo(({ message, isPartOfContext }) => {
  const isUser = message.role === "user";
  const contextChain = message.metadata?.contextChain || [];

  // Memoize timestamp formatting
  const formattedTime = useMemo(() => {
    try {
      const date = new Date(message.created_at);
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.warn("Error formatting timestamp:", error);
      return "";
    }
  }, [message.created_at]);

  // Memoize copy handler
  const handleCopy = useMemo(() => {
    return async () => {
      try {
        await Clipboard.setString(message.content);
      } catch (error) {
        console.error("Error copying text:", error);
      }
    };
  }, [message.content]);

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

        <View style={styles.messageFooter}>
          <View style={styles.footerLeft}>
            <Text
              style={[
                styles.timestamp,
                isUser ? styles.userTimestamp : styles.assistantTimestamp,
              ]}
            >
              {formattedTime}
            </Text>
            <ContextIndicator contextChain={contextChain} />
          </View>

          {!isUser && (
            <TouchableOpacity
              onPress={handleCopy}
              style={styles.copyButton}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <Ionicons
                name="copy-outline"
                size={16}
                color={
                  isUser ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.5)"
                }
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}, areEqual);

// Add display name for easier debugging
MessageBubble.displayName = "MessageBubble";

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
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 2,
  },
  footerLeft: {
    flexDirection: "row",
    alignItems: "center",
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
  contextChain: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 4,
  },
  contextDot: {
    fontSize: 12,
    color: "rgba(0, 132, 255, 0.7)",
    marginHorizontal: 2,
  },
  currentContextDot: {
    color: "rgba(0, 132, 255, 1)",
  },
  copyButton: {
    padding: 4,
    marginLeft: 8,
  },
});

export default MessageBubble;
