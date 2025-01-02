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
import { useTheme } from "../../context/ThemeContext";

const ContextIndicator = ({ contextChain, theme }) => {
  if (!contextChain?.length) return null;

  return (
    <View style={styles.contextChain}>
      {contextChain.map((id, index) => (
        <Text
          key={id}
          style={[
            styles.contextDot,
            { color: `${theme.colors.primary}70` },
            index === contextChain.length - 1 && {
              color: theme.colors.primary,
            },
          ]}
        >
          {index === 0 ? "↻" : "•"}
        </Text>
      ))}
    </View>
  );
};

const areEqual = (prevProps, nextProps) => {
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.content === nextProps.message.content &&
    prevProps.isPartOfContext === nextProps.isPartOfContext &&
    prevProps.senderName === nextProps.senderName &&
    JSON.stringify(prevProps.message.metadata?.contextChain) ===
      JSON.stringify(nextProps.message.metadata?.contextChain)
  );
};

export const MessageBubble = memo(
  ({ message, isPartOfContext, senderName }) => {
    const { theme } = useTheme();
    const contextChain = message.metadata?.contextChain || [];
    const isUser = message.role === "user";

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
          isUser
            ? styles.userMessageContainer
            : styles.assistantMessageContainer,
        ]}
      >
        <Text
          style={[
            styles.partnerName,
            isUser ? styles.userLabel : styles.assistantLabel,
            { color: isUser ? theme.colors.primary : theme.colors.primary },
          ]}
        >
          {senderName}
        </Text>

        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.assistantBubble,
            {
              backgroundColor: isUser
                ? theme.colors.primary
                : theme.colors.surface,
              borderColor: `${theme.colors.primary}30`,
            },
            isPartOfContext && {
              borderWidth: 1,
            },
            { shadowColor: theme.colors.shadow },
          ]}
        >
          <Text
            style={[
              styles.messageText,
              {
                color: isUser
                  ? theme.colors.textInverted
                  : theme.colors.textPrimary,
              },
            ]}
          >
            {message.content}
          </Text>

          <View style={styles.messageFooter}>
            <View style={styles.footerLeft}>
              <Text
                style={[
                  styles.timestamp,
                  {
                    color: isUser
                      ? `${theme.colors.textInverted}70`
                      : theme.colors.textSecondary,
                  },
                ]}
              >
                {formattedTime}
              </Text>
              <ContextIndicator contextChain={contextChain} theme={theme} />
            </View>

            <TouchableOpacity
              onPress={handleCopy}
              style={styles.copyButton}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <Ionicons
                name="copy-outline"
                size={16}
                color={
                  isUser
                    ? theme.colors.textInverted
                    : theme.colors.textSecondary
                }
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  },
  areEqual
);

MessageBubble.displayName = "MessageBubble";

const styles = StyleSheet.create({
  messageContainer: {
    marginVertical: 8,
    paddingHorizontal: 8,
  },
  userMessageContainer: {
    alignItems: "flex-end",
  },
  assistantMessageContainer: {
    alignItems: "flex-start",
  },
  partnerName: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
    marginLeft: 12,
  },
  userLabel: {
    marginRight: 12,
    marginLeft: 0,
  },
  assistantLabel: {
    marginLeft: 12,
    marginRight: 0,
  },
  messageBubble: {
    maxWidth: "80%",
    minWidth: 60,
    padding: 12,
    borderRadius: 20,
    elevation: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  userBubble: {
    borderBottomRightRadius: 5,
  },
  assistantBubble: {
    borderBottomLeftRadius: 5,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
    marginBottom: 4,
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
  contextChain: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 4,
  },
  contextDot: {
    fontSize: 12,
    marginHorizontal: 2,
  },
  copyButton: {
    padding: 4,
    marginLeft: 8,
  },
});

export default MessageBubble;
