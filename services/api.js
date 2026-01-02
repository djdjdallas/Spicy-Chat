// services/api.js
import { Alert } from "react-native";
import { API_KEY, API_URL } from "@env";
export const FREE_MESSAGE_LIMIT = 10;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;
export const CHARACTER_LIMIT = 500;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isValidResponse = (text) => {
  if (!text || typeof text !== "string") return false;
  return text.length > 0 && text.length < 10000;
};

// Detect pet names and terms of endearment
export const containsPetNames = (message) => {
  const petNames = [
    "babe",
    "baby",
    "darling",
    "sweetheart",
    "sweetie",
    "honey",
    "dear",
    "love",
    "lovey",
    "hun",
    "cutie",
    "sugar",
    "sexy",
    "beautiful",
  ];

  const normalizedMessage = message.toLowerCase().trim();

  return petNames.some(
    (name) =>
      normalizedMessage.includes(name) ||
      normalizedMessage.startsWith(name) ||
      normalizedMessage.endsWith(name)
  );
};

// Approved greeting options
const getRandomGreeting = () => {
  const greetings = ["Hey", "Hi", "What's up"];

  return greetings[Math.floor(Math.random() * greetings.length)];
};

// Detect text creation requests
const detectTextCreationRequest = (message) => {
  const creationPhrases = [
    "write",
    "create",
    "compose",
    "draft",
    "generate",
    "make",
    "help me write",
    "craft",
    "author",
    "formulate",
  ];

  const contentTypes = [
    "text",
    "message",
    "email",
    "letter",
    "post",
    "story",
    "essay",
    "article",
    "bio",
    "description",
    "response",
    "reply",
  ];

  const normalizedMessage = message.toLowerCase().trim();

  return creationPhrases.some(
    (phrase) =>
      normalizedMessage.includes(phrase) &&
      contentTypes.some((type) => normalizedMessage.includes(type))
  );
};

const detectModificationRequest = (message) => {
  const modificationPhrases = [
    "make it shorter",
    "shorter",
    "make shorter",
    "summarize",
    "brief",
    "modify",
    "change",
    "revise",
    "update",
    "edit",
    "previous",
    "shorten",
    "condense",
  ];

  const normalizedMessage = message.toLowerCase().trim();
  return modificationPhrases.some(
    (phrase) =>
      normalizedMessage.includes(phrase) || normalizedMessage.startsWith(phrase)
  );
};

const buildMessageContext = (messages) => {
  return messages.reduce((context, msg, index) => {
    const prevMessage = messages[index - 1];
    return {
      ...context,
      [msg.id]: {
        role: msg.role,
        content: msg.content,
        timestamp: msg.created_at,
        referencesId: prevMessage?.id,
        contextDepth: index + 1,
      },
    };
  }, {});
};

const buildUserProfileContext = (profile) => {
  if (!profile) return "";

  const parts = [];

  if (profile.display_name) {
    parts.push(`The user's name is ${profile.display_name}.`);
  }

  if (profile.bio) {
    parts.push(`About them: ${profile.bio}`);
  }

  if (profile.communication_style) {
    parts.push(`Their preferred communication style is: ${profile.communication_style}.`);
  }

  if (profile.relationship_goal) {
    parts.push(`They are looking for: ${profile.relationship_goal}.`);
  }

  if (profile.interests && Array.isArray(profile.interests) && profile.interests.length > 0) {
    parts.push(`Their interests include: ${profile.interests.join(", ")}.`);
  }

  if (profile.hobbies && Array.isArray(profile.hobbies) && profile.hobbies.length > 0) {
    parts.push(`Their hobbies include: ${profile.hobbies.join(", ")}.`);
  }

  if (profile.values && Array.isArray(profile.values) && profile.values.length > 0) {
    parts.push(`They value: ${profile.values.join(", ")}.`);
  }

  if (parts.length === 0) return "";

  return `
USER PROFILE:
${parts.join("\n")}

Use this information to personalize your responses and match their communication style and interests.
`;
};

export const sendMessageToAPI = async (
  content,
  model,
  conversationHistory = [],
  retryCount = 0,
  userProfile = null
) => {
  try {
    if (!content || typeof content !== "string") {
      throw new Error("Invalid message content");
    }

    const lastMessages = conversationHistory.slice(-5);
    const lastResponse = lastMessages
      .filter((msg) => msg.role === "assistant")
      .pop();
    const lastUserMessage = lastMessages
      .filter((msg) => msg.role === "user")
      .pop();

    const isModifyRequest = detectModificationRequest(content);
    const isTextCreationRequest = detectTextCreationRequest(content);
    const messageContext = buildMessageContext(lastMessages);
    const greeting = getRandomGreeting();
    const profileContext = buildUserProfileContext(userProfile);

    // Build enhanced prompt based on request type
    let enhancedPrompt = "";
    let systemInstructions = {
      useContext: true,
      maintainContext: true,
      contextType: isModifyRequest ? "modification" : "continuation",
      modifyExisting: isModifyRequest,
      referenceMessage: isModifyRequest ? lastResponse?.id : null,
      contextBehavior: "continuous_conversation",
      contextDepth: lastMessages.length,
      avoidPetNames: true,
      startWithGreeting: true,
      approvedGreetings: ["Hey", "Hi", "What's up"],
    };

    if (isTextCreationRequest) {
      enhancedPrompt = `
I will help you create the text you requested. I'll write it in first person as if I were you.
${profileContext}
PREVIOUS CONTEXT:
${lastMessages
  .map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`)
  .join("\n\n")}

YOUR REQUEST: ${content}

I'll compose this in first person, naturally incorporating your voice and style.
Please don't use pet names or terms of endearment like "babe", "baby", "darling", "sweetheart", etc.
Start your response with one of these greetings: "Hey", "Hi", or "What's up" if appropriate for the context.
Do not use "Hey there" or "Hi there".
`.trim();

      systemInstructions = {
        ...systemInstructions,
        responseStyle: "first_person",
        creativeWriting: true,
        userVoice: true,
      };
    } else if (isModifyRequest && lastResponse) {
      enhancedPrompt = `
${profileContext}
Previous response to modify:
"""
${lastResponse.content}
"""

Modification requested: ${content}

Please modify the previous response while maintaining conversation context and relevance.
Do not use pet names or terms of endearment like "babe", "baby", "darling", etc.
Start your response with one of these greetings: "Hey", "Hi", or "What's up" if appropriate for the context.
Do not use "Hey there" or "Hi there".
`.trim();
    } else {
      enhancedPrompt = `
${profileContext}
${lastMessages
  .map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`)
  .join("\n\n")}

CURRENT REQUEST: ${content}

Please maintain conversation continuity and reference previous context when appropriate.
Do not use pet names or terms of endearment like "babe", "baby", "darling", "sweetheart", etc.
Start your response with one of these greetings: "Hey", "Hi", or "What's up" if appropriate for the context.
Do not use "Hey there" or "Hi there".
`.trim();
    }

    // Build messages array for NanoGPT API
    const messages = [
      {
        role: "system",
        content: enhancedPrompt,
      },
      ...lastMessages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      {
        role: "user",
        content: content,
      },
    ];

    const requestBody = {
      model: model,
      messages: messages,
      stream: false,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      if (__DEV__) {
        console.error("API Error Details:", {
          status: response.status,
          statusText: response.statusText,
          errorText,
        });
      }
      throw new Error(`API request failed with status ${response.status}`);
    }

    const jsonResponse = await response.json();

    // Extract message content from NanoGPT response format
    let responseText = jsonResponse?.choices?.[0]?.message?.content;

    if (!responseText || typeof responseText !== "string") {
      if (__DEV__) {
        console.error("Invalid API response structure:", jsonResponse);
      }
      throw new Error("Invalid response format from API");
    }

    let metadata = {
      isModifyRequest,
      isTextCreationRequest,
      contextUsed: lastMessages.length,
      messageContext,
      avoidPetNames: true,
      preferredGreeting: greeting,
      usage: jsonResponse?.usage,
    };

    return {
      responseText,
      metadata,
      success: true,
    };
  } catch (error) {
    if (__DEV__) {
      console.error("Error in sendMessageToAPI:", {
        error: error.message,
        retryCount,
      });

      if (error.name === "AbortError") {
        console.log("Request timed out");
      }
    }

    if (retryCount < MAX_RETRIES) {
      if (__DEV__) {
        console.log(`Retrying API call (${retryCount + 1}/${MAX_RETRIES})...`);
      }
      await sleep(RETRY_DELAY * Math.pow(2, retryCount));
      return sendMessageToAPI(
        content,
        model,
        conversationHistory,
        retryCount + 1,
        userProfile
      );
    }

    Alert.alert(
      "Connection Error",
      "Having trouble connecting to the server. Please check your internet connection and try again.",
      [{ text: "OK" }]
    );

    return {
      responseText:
        "Hey! I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
      metadata: {},
      success: false,
    };
  }
};

export const formatMessageHistory = (messages, limit = 10) => {
  if (!Array.isArray(messages)) return [];

  return messages
    .slice(-limit)
    .map((msg) => ({
      role: msg.role || "user",
      content: msg.content || "",
      created_at: msg.created_at || new Date().toISOString(),
      metadata: {
        ...msg.metadata,
        isRelevant: true,
        maintainContext: true,
        contextChain: messages
          .slice(0, messages.indexOf(msg) + 1)
          .map((m) => m.id),
      },
    }))
    .filter((msg) => msg.content.trim() !== "");
};

export const validateMessage = (content) => {
  if (!content || typeof content !== "string") return false;
  const trimmedContent = content.trim();

  // Check message length
  if (trimmedContent.length === 0 || trimmedContent.length > CHARACTER_LIMIT) {
    return false;
  }

  // Check for pet names
  if (containsPetNames(trimmedContent)) {
    Alert.alert(
      "Message Not Sent",
      "Please avoid using pet names or terms of endearment in your messages."
    );
    return false;
  }

  return true;
};
