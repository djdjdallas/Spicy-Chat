// components/chat/MessageInput.js
import React, { memo, useCallback, useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../context/ThemeContext";

export const MessageInput = memo(({ sendMessage, isLoading, initialText = "" }) => {
  const { theme, isDark } = useTheme();
  const [localInputText, setLocalInputText] = useState(initialText);
  const [isFocused, setIsFocused] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Handle initialText updates (when navigating with prefilled text)
  React.useEffect(() => {
    if (initialText && !hasInitialized) {
      setLocalInputText(initialText);
      setHasInitialized(true);
    }
  }, [initialText, hasInitialized]);

  const handleChangeText = useCallback((text) => {
    setLocalInputText(text);
  }, []);

  const handleSend = useCallback(() => {
    if (localInputText.trim()) {
      const messageToSend = localInputText;
      setLocalInputText("");
      Keyboard.dismiss();
      sendMessage(messageToSend);
    }
  }, [localInputText, sendMessage]);

  const handleKeyPress = useCallback(
    ({ nativeEvent }) => {
      if (
        Platform.OS === "ios" &&
        nativeEvent.key === "Enter" &&
        !nativeEvent.shiftKey
      ) {
        handleSend();
      }
    },
    [handleSend]
  );

  const isDisabled = !localInputText?.trim() || isLoading;

  // Gradient button for send
  const SendButton = () => {
    if (isDisabled) {
      return (
        <View
          style={[
            styles.sendButton,
            { backgroundColor: theme.colors.backgroundTertiary },
          ]}
        >
          {isLoading ? (
            <ActivityIndicator color={theme.colors.textMuted} size="small" />
          ) : (
            <Ionicons
              name="arrow-up"
              size={22}
              color={theme.colors.textMuted}
            />
          )}
        </View>
      );
    }

    return (
      <TouchableOpacity
        onPress={handleSend}
        activeOpacity={0.8}
        style={styles.sendButtonWrapper}
      >
        <LinearGradient
          colors={theme.gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.sendButton, theme.shadows.glow.sm]}
        >
          <Ionicons name="arrow-up" size={22} color={theme.colors.pureWhite} />
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? theme.colors.headerBackground
            : theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
      ]}
    >
      <View style={styles.inputContainer}>
        <View
          style={[
            styles.inputWrapper,
            {
              backgroundColor: theme.colors.inputBackground,
              borderColor: isFocused
                ? theme.colors.inputFocusBorder
                : theme.colors.inputBorder,
            },
            isFocused && {
              ...theme.shadows.glow.sm,
            },
          ]}
        >
          <TextInput
            style={[
              styles.input,
              { color: theme.colors.textPrimary },
              theme.typography.body,
            ]}
            value={localInputText}
            onChangeText={handleChangeText}
            placeholder="Type a message..."
            placeholderTextColor={theme.colors.textMuted}
            multiline
            maxLength={2000}
            editable={!isLoading}
            onKeyPress={handleKeyPress}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
        </View>

        <SendButton />
      </View>
    </View>
  );
});

MessageInput.displayName = "MessageInput";

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    width: "100%",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 12,
    paddingBottom: Platform.OS === "ios" ? 28 : 12,
    gap: 10,
  },
  inputWrapper: {
    flex: 1,
    borderRadius: 24,
    borderWidth: 1,
    overflow: "hidden",
  },
  input: {
    paddingHorizontal: 18,
    paddingTop: Platform.OS === "ios" ? 12 : 10,
    paddingBottom: Platform.OS === "ios" ? 12 : 10,
    maxHeight: 120,
    minHeight: 44,
  },
  sendButtonWrapper: {
    borderRadius: 22,
    overflow: "hidden",
  },
  sendButton: {
    borderRadius: 22,
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default MessageInput;
