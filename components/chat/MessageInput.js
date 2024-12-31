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
      Keyboard.dismiss();
      sendMessage(localInputText);
      setLocalInputText("");
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
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.background,
              color: theme.colors.textPrimary,
              borderColor: theme.colors.border,
            },
          ]}
          value={localInputText}
          onChangeText={handleChangeText}
          placeholder="Type a message..."
          placeholderTextColor={theme.colors.textSecondary}
          multiline
          maxLength={2000}
          editable={!isLoading}
          onKeyPress={handleKeyPress}
        />

        <TouchableOpacity
          style={[
            styles.sendButton,
            {
              backgroundColor: isDisabled
                ? theme.colors.border
                : theme.colors.primary,
              shadowColor: theme.colors.shadow,
            },
          ]}
          onPress={handleSend}
          disabled={isDisabled}
        >
          {isLoading ? (
            <ActivityIndicator color={theme.colors.textInverted} size="small" />
          ) : (
            <Ionicons
              name="send"
              size={24}
              color={
                isDisabled
                  ? theme.colors.textSecondary
                  : theme.colors.textInverted
              }
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
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 20,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingTop: Platform.OS === "ios" ? 10 : 8,
    paddingBottom: Platform.OS === "ios" ? 10 : 8,
    marginRight: 10,
    fontSize: 16,
    maxHeight: 100,
    minHeight: 40,
  },
  sendButton: {
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
});

export default MessageInput;
