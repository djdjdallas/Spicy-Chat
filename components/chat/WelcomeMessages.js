// components/chat/WelcomeMessages.js
import React from "react";
import { View } from "react-native";
import { MessageBubble } from "./MessageBubble";

export const WelcomeMessages = () => {
  const welcomeMessages = [
    {
      id: "welcome-1",
      role: "assistant",
      content:
        "Hey, I'm Spicy GPT! 🌶️ Ready to help you spice up your conversations. How can I help you today?",
      created_at: new Date().toISOString(),
    },
  ];

  return (
    <View>
      {welcomeMessages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          isPartOfContext={false}
        />
      ))}
    </View>
  );
};
