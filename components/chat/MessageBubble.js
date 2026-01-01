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
            { color: theme.colors.primaryMuted },
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
            styles.senderName,
            { color: theme.colors.textSecondary },
            theme.typography.caption,
            isUser ? styles.userLabel : styles.assistantLabel,
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
                ? theme.colors.black
                : theme.colors.surface,
              ...theme.shadows.sm,
            },
            isPartOfContext && {
              borderWidth: 2,
              borderColor: theme.colors.primary,
            },
          ]}
        >
          <Text
            style={[
              styles.messageText,
              {
                color: isUser
                  ? theme.colors.pureWhite
                  : theme.colors.textPrimary,
              },
              theme.typography.body,
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
                      ? theme.colors.silver
                      : theme.colors.textTertiary,
                  },
                  theme.typography.caption,
                ]}
              >
                {formattedTime}
              </Text>
              <ContextIndicator contextChain={contextChain} theme={theme} />
            </View>

            <TouchableOpacity
              onPress={handleCopy}
              style={[
                styles.copyButton,
                { backgroundColor: isUser ? theme.colors.charcoal : theme.colors.backgroundTertiary },
              ]}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
              activeOpacity={0.7}
            >
              <Ionicons
                name="copy-outline"
                size={14}
                color={
                  isUser
                    ? theme.colors.silver
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
    marginVertical: 6,
    paddingHorizontal: 16,
  },
  userMessageContainer: {
    alignItems: "flex-end",
  },
  assistantMessageContainer: {
    alignItems: "flex-start",
  },
  senderName: {
    marginBottom: 4,
    marginHorizontal: 4,
  },
  userLabel: {
    textAlign: "right",
  },
  assistantLabel: {
    textAlign: "left",
  },
  messageBubble: {
    maxWidth: "85%",
    minWidth: 80,
    padding: 14,
    borderRadius: 16,
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    lineHeight: 22,
    marginBottom: 8,
  },
  messageFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  timestamp: {
    // Typography applied via theme
  },
  contextChain: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 6,
  },
  contextDot: {
    fontSize: 12,
    marginHorizontal: 1,
  },
  copyButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
});

export default MessageBubble;
