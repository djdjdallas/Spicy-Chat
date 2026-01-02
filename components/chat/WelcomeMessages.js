// components/chat/WelcomeMessages.js
import React from "react";
import { View } from "react-native";
import { MessageBubble } from "./MessageBubble";

export const WelcomeMessages = ({ theme, partnerName }) => {
  const welcomeMessages = [
    {
      id: "welcome-1",
      role: "assistant",
      content: `Hey there, I'm ${
        partnerName || "your conversation partner"
      }. I've been waiting for you... Ready to turn up the heat and explore some fun conversations? What's on your mind tonight?`,
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
