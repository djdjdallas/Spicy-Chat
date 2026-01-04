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
import { LinearGradient } from "expo-linear-gradient";
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
            { color: theme.colors.shimmer },
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

    // User bubble with gradient
    const UserBubbleContent = () => (
      <LinearGradient
        colors={[
          theme.colors.userBubbleGradientStart,
          theme.colors.userBubbleGradientEnd,
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.messageBubble,
          styles.userBubble,
          isPartOfContext && {
            borderWidth: 2,
            borderColor: theme.colors.primaryLight,
          },
        ]}
      >
        <Text
          style={[
            styles.messageText,
            { color: theme.colors.pureWhite },
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
                { color: "rgba(255, 255, 255, 0.7)" },
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
              { backgroundColor: "rgba(255, 255, 255, 0.15)" },
            ]}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            activeOpacity={0.7}
          >
            <Ionicons
              name="copy-outline"
              size={14}
              color="rgba(255, 255, 255, 0.7)"
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );

    // Assistant bubble with solid background
    const AssistantBubbleContent = () => (
      <View
        style={[
          styles.messageBubble,
          styles.assistantBubble,
          {
            backgroundColor: theme.colors.assistantBubble,
            borderWidth: 1,
            borderColor: theme.colors.border,
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
            { color: theme.colors.textPrimary },
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
                { color: theme.colors.textTertiary },
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
              { backgroundColor: theme.colors.backgroundTertiary },
            ]}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            activeOpacity={0.7}
          >
            <Ionicons
              name="copy-outline"
              size={14}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>
    );

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
            { color: theme.colors.textMuted },
            theme.typography.caption,
            isUser ? styles.userLabel : styles.assistantLabel,
          ]}
        >
          {senderName}
        </Text>

        {isUser ? <UserBubbleContent /> : <AssistantBubbleContent />}
      </View>
    );
  },
  areEqual
);

MessageBubble.displayName = "MessageBubble";

const styles = StyleSheet.create({
  messageContainer: {
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  userMessageContainer: {
    alignItems: "flex-end",
  },
  assistantMessageContainer: {
    alignItems: "flex-start",
  },
  senderName: {
    marginBottom: 6,
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
    padding: 16,
  },
  // Asymmetric border radius for user messages
  userBubble: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 6,
  },
  // Asymmetric border radius for assistant messages
  assistantBubble: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 24,
  },
  messageText: {
    lineHeight: 23,
    marginBottom: 10,
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
