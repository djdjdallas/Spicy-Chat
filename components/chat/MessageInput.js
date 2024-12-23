// components/chat/MessageInput.js
import React, { memo, useCallback } from "react";
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

export const MessageInput = memo(
  ({ inputText, setInputText, sendMessage, isLoading }) => {
    // Memoize the change handler
    const handleChangeText = useCallback(
      (text) => {
        console.log("Input text changed:", text); // Debug log
        setInputText(text);
      },
      [setInputText]
    );

    // Memoize the send handler
    const handleSend = useCallback(() => {
      console.log("Send button pressed, current text:", inputText); // Debug log
      if (inputText.trim()) {
        Keyboard.dismiss();
        sendMessage(inputText); // Pass the input text directly
      }
    }, [inputText, sendMessage]);

    // Handle return key press
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

    const isDisabled = !inputText?.trim() || isLoading;

    return (
      <View style={styles.container}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={handleChangeText}
            placeholder="Type a message..."
            placeholderTextColor="#666"
            multiline
            maxLength={2000}
            editable={!isLoading}
            onKeyPress={handleKeyPress}
          />

          <TouchableOpacity
            style={[styles.sendButton, isDisabled && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={isDisabled}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Ionicons
                name="send"
                size={24}
                color={isDisabled ? "#999" : "#fff"}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }
);

// Add display name for easier debugging
MessageInput.displayName = "MessageInput";

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
    backgroundColor: "#fff",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 10,
  },
  input: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingTop: Platform.OS === "ios" ? 10 : 8,
    paddingBottom: Platform.OS === "ios" ? 10 : 8,
    marginRight: 10,
    fontSize: 16,
    color: "#333",
    maxHeight: 100,
    minHeight: 40,
  },
  sendButton: {
    backgroundColor: "#0084ff",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  sendButtonDisabled: {
    backgroundColor: "#e0e0e0",
  },
});

export default MessageInput;
