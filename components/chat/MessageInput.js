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
import { useTheme } from "../../context/ThemeContext";

export const MessageInput = memo(({ sendMessage, isLoading }) => {
  const { theme } = useTheme();
  const [localInputText, setLocalInputText] = useState("");

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

  return (
    <View
      style={[
        styles.container,
        {
          borderTopColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
        },
      ]}
    >
      <View style={styles.inputContainer}>
        <View
          style={[
            styles.inputWrapper,
            {
              backgroundColor: theme.colors.inputBackground,
              borderColor: theme.colors.border,
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
            placeholderTextColor={theme.colors.textTertiary}
            multiline
            maxLength={2000}
            editable={!isLoading}
            onKeyPress={handleKeyPress}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.sendButton,
            {
              backgroundColor: isDisabled
                ? theme.colors.graphite
                : theme.colors.primary,
              ...(!isDisabled && theme.shadows.sm),
            },
          ]}
          onPress={handleSend}
          disabled={isDisabled}
          activeOpacity={0.7}
        >
          {isLoading ? (
            <ActivityIndicator color={theme.colors.pureWhite} size="small" />
          ) : (
            <Ionicons
              name="arrow-up"
              size={22}
              color={theme.colors.pureWhite}
            />
          )}
        </TouchableOpacity>
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
  sendButton: {
    borderRadius: 22,
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default MessageInput;
