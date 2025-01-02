// components/chat/WelcomeMessages.js
import React from "react";
import { View } from "react-native";
import { MessageBubble } from "./MessageBubble";

export const WelcomeMessages = ({ theme, partnerName }) => {
  const welcomeMessages = [
    {
      id: "welcome-1",
      role: "assistant",
      content: `Hey, I'm ${
        partnerName || "your conversation partner"
      }! Ready to help you practice your conversation skills. How can I help you today?`,
      created_at: new Date().toISOString(),
      metadata: {
        partnerName: partnerName,
        isPartnerMessage: true,
      },
    },
  ];

  return (
    <View>
      {welcomeMessages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          isPartOfContext={false}
          theme={theme}
          senderName={partnerName || "Assistant"}
        />
      ))}
    </View>
  );
};

export default WelcomeMessages;
