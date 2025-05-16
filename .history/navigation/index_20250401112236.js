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

export const sendMessageToAPI = async (
  content,
  model,
  conversationHistory = [],
  retryCount = 0
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

    const requestBody = {
      prompt: enhancedPrompt,
      model: model,
      context: lastMessages.map((msg) => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.created_at,
        contextId: msg.id,
        referencedContext: messageContext[msg.id],
      })),
      metadata: {
        isModificationRequest: isModifyRequest,
        isTextCreationRequest,
        originalRequest: lastUserMessage?.content,
        lastResponse: lastResponse?.content,
        messageChain: conversationHistory.length,
        contextSize: lastMessages.length,
        messageContext,
        avoidPetNames: true,
        preferredGreeting: greeting,
      },
      systemInstructions,
    };

    // Rest of the API call logic remains the same...
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error Details:", {
        status: response.status,
        statusText: response.statusText,
        errorText,
      });
      throw new Error(`API request failed with status ${response.status}`);
    }

    const rawText = await response.text();

    if (!isValidResponse(rawText)) {
      throw new Error("Invalid response format from API");
    }

    let responseText = rawText;
    let metadata = {
      isModifyRequest,
      isTextCreationRequest,
      contextUsed: lastMessages.length,
      messageContext,
      avoidPetNames: true,
      preferredGreeting: greeting,
    };

    const metadataMatch = rawText.match(/<NanoGPT>(.*?)<\/NanoGPT>/);
    if (metadataMatch) {
      responseText = rawText.replace(/<NanoGPT>.*?<\/NanoGPT>/, "").trim();
      try {
        const parsedMetadata = JSON.parse(metadataMatch[1]);
        metadata = { ...metadata, ...parsedMetadata };
      } catch (error) {
        console.warn("Failed to parse metadata:", error);
      }
    }

    // Ensure the response starts with an approved greeting if it doesn't already
    if (
      !responseText.startsWith("Hey") &&
      !responseText.startsWith("Hi") &&
      !responseText.startsWith("What's up")
    ) {
      responseText = `${greeting}! ${responseText}`;
    }

    return {
      responseText,
      metadata,
      success: true,
    };
  } catch (error) {
    // Error handling remains the same...
    console.error("Error in sendMessageToAPI:", {
      error: error.message,
      retryCount,
    });

    if (error.name === "AbortError") {
      console.log("Request timed out");
    }

    if (retryCount < MAX_RETRIES) {
      console.log(`Retrying API call (${retryCount + 1}/${MAX_RETRIES})...`);
      await sleep(RETRY_DELAY * Math.pow(2, retryCount));
      return sendMessageToAPI(
        content,
        model,
        conversationHistory,
        retryCount + 1
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
