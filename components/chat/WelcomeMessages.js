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
        "Hey! 👋 I'm here to help you level up your dating game. Whether you're looking to improve your confidence, conversation skills, or just want to practice flirting in a safe space, I've got you covered!",
      created_at: new Date().toISOString(),
    },
    {
      id: "welcome-2",
      role: "assistant",
      content:
        "Feel free to roleplay different scenarios like first dates, dating app conversations, or getting someone's number. I'll provide feedback and tips to help you improve. What would you like to practice?",
      created_at: new Date(Date.now() + 100).toISOString(),
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
