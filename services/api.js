// services/api.js
import { Alert } from "react-native";

const API_KEY = "91b130c4-10bb-4e29-b66a-7e44359326a3";
const API_URL = "https://nano-gpt.com/api/talk-to-gpt";
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isValidResponse = (text) => {
  if (!text || typeof text !== "string") return false;
  return text.length > 0 && text.length < 10000;
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

    // Get recent context
    const lastMessages = conversationHistory.slice(-3);
    const lastResponse = lastMessages
      .filter((msg) => msg.role === "assistant")
      .pop();
    const lastUserMessage = lastMessages
      .filter((msg) => msg.role === "user")
      .pop();

    const isModifyRequest = detectModificationRequest(content);

    // Build the prompt with context
    let enhancedPrompt = content;
    if (isModifyRequest && lastResponse) {
      enhancedPrompt = `
Previous response to modify:
"""
${lastResponse.content}
"""

Modification requested: ${content}

Please modify the previous response as requested while maintaining context and relevance.
`.trim();
    }

    // Structure request with context
    const requestBody = {
      prompt: enhancedPrompt,
      model: model,
      context: lastMessages.map((msg) => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.created_at,
      })),
      metadata: {
        isModificationRequest: isModifyRequest,
        originalRequest: lastUserMessage?.content,
        lastResponse: lastResponse?.content,
        messageChain: conversationHistory.length,
      },
      systemInstructions: {
        useContext: true,
        maintainContext: true,
        contextType: isModifyRequest ? "modification" : "continuation",
        modifyExisting: isModifyRequest,
        referenceMessage: isModifyRequest ? lastResponse?.id : null,
      },
    };

    console.log("Sending request with context:", {
      isModifyRequest,
      originalContent: content,
      enhancedPrompt,
      systemInstructions: requestBody.systemInstructions,
    });

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
    let metadata = { isModifyRequest };

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

    return {
      responseText,
      metadata,
      success: true,
    };
  } catch (error) {
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
        "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
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
      },
    }))
    .filter((msg) => msg.content.trim() !== "");
};

export const validateMessage = (content) => {
  if (!content || typeof content !== "string") return false;
  const trimmedContent = content.trim();
  return trimmedContent.length > 0 && trimmedContent.length <= 2000;
};
