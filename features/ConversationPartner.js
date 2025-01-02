import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export const useConversationPartner = () => {
  const [partners, setPartners] = useState([]);
  const [currentPartner, setCurrentPartner] = useState(null);

  // Define conversation partner profiles with realistic traits
  const partnerProfiles = {
    communicationStyles: {
      direct: {
        traits: [
          "clear boundaries",
          "straightforward communication",
          "values honesty",
        ],
        responseStyle: "clear and direct",
        learningGoals: ["respectful assertion", "clear communication"],
      },
      thoughtful: {
        traits: ["reflective", "values deep conversation", "emotionally aware"],
        responseStyle: "detailed and considerate",
        learningGoals: ["emotional intelligence", "active listening"],
      },
      social: {
        traits: ["outgoing", "values humor", "group-oriented"],
        responseStyle: "energetic and engaging",
        learningGoals: ["group dynamics", "reading social cues"],
      },
      flirtatious: {
        traits: [
          "playful banter",
          "subtle compliments",
          "charming personality",
          "emotionally intelligent",
        ],
        responseStyle: "warm and engaging with playful undertones",
        learningGoals: [
          "reading social cues",
          "appropriate flirting",
          "maintaining boundaries",
        ],
      },
      romantic: {
        traits: [
          "emotionally expressive",
          "genuine interest",
          "romantic gestures",
          "deep connection",
        ],
        responseStyle: "warm and intimate while maintaining respect",
        learningGoals: [
          "building emotional connection",
          "expressing romantic interest appropriately",
          "understanding consent and boundaries",
        ],
      },
    },

    interactionGoals: {
      friendship: {
        scenarios: [
          "group activities",
          "shared interests",
          "platonic boundaries",
        ],
        skillFocus: ["building rapport", "respecting boundaries"],
      },
      dating: {
        scenarios: [
          "first date conversation",
          "shared values discussion",
          "future goals",
          "flirting practice",
          "asking someone out",
        ],
        skillFocus: [
          "expressing interest appropriately",
          "understanding compatibility",
          "flirting naturally",
          "reading romantic signals",
        ],
      },
      networking: {
        scenarios: ["professional events", "mentorship", "career goals"],
        skillFocus: ["professional boundaries", "mutual benefit"],
      },
    },

    personalityTraits: {
      morgan: {
        style: "flirtatious",
        bio: "A charming and witty individual who loves playful banter and knows how to keep conversations engaging. Expert in reading social cues and maintaining appropriate boundaries while flirting.",
        interests: ["comedy", "dancing", "social events", "creative arts"],
        flirtingStyle: "playful and witty with subtle compliments",
        conversationPreferences: ["humor", "personal stories", "light teasing"],
      },
      casey: {
        style: "romantic",
        bio: "A romantic soul who believes in deep connections and meaningful conversations. Skilled at creating emotional intimacy while maintaining respect and boundaries.",
        interests: ["poetry", "music", "deep conversations", "romantic films"],
        flirtingStyle:
          "sincere and emotionally connected with genuine compliments",
        conversationPreferences: [
          "deep topics",
          "shared experiences",
          "emotional expression",
        ],
      },
    },

    // Method to generate appropriate responses based on style and context
    generateResponse(message, style, context) {
      const basePrompt = {
        direct: "Respond clearly and directly while maintaining respect",
        thoughtful: "Provide a reflective and detailed response",
        social: "Respond in an engaging and friendly manner",
        flirtatious:
          "Respond with playful charm while maintaining appropriate boundaries",
        romantic:
          "Respond with emotional depth and genuine interest while staying respectful",
      };

      return {
        prompt: `${basePrompt[style]}. Context: ${context}`,
        learningPoints: this.communicationStyles[style].learningGoals,
        interactionType: context,
      };
    },
  };

  // Initialize partners
  useEffect(() => {
    initializePartners();
  }, []);

  const initializePartners = async () => {
    const availablePartners = generatePartners(5);
    setPartners(availablePartners);
  };

  // Generate diverse, realistic conversation partners
  const generatePartners = (count) => {
    const partnerDefinitions = [
      {
        name: "Alex Chen",
        style: "direct",
        goals: "networking",
        expertise: "communication",
        difficultyLevel: 1,
        bio: "A straightforward communicator focused on professional development",
      },
      {
        name: "Morgan Taylor",
        style: "flirtatious",
        goals: "dating",
        expertise: "social skills",
        difficultyLevel: 2,
        bio: partnerProfiles.personalityTraits.morgan.bio,
        interests: partnerProfiles.personalityTraits.morgan.interests,
        flirtingStyle: partnerProfiles.personalityTraits.morgan.flirtingStyle,
      },
      {
        name: "Jordan Lee",
        style: "thoughtful",
        goals: "friendship",
        expertise: "boundaries",
        difficultyLevel: 1,
        bio: "An empathetic listener who values meaningful connections",
      },
      {
        name: "Sam Rivera",
        style: "social",
        goals: "friendship",
        expertise: "social skills",
        difficultyLevel: 2,
        bio: "An outgoing personality who excels in group dynamics",
      },
      {
        name: "Casey Morgan",
        style: "romantic",
        goals: "dating",
        expertise: "emotional intelligence",
        difficultyLevel: 3,
        bio: partnerProfiles.personalityTraits.casey.bio,
        interests: partnerProfiles.personalityTraits.casey.interests,
        flirtingStyle: partnerProfiles.personalityTraits.casey.flirtingStyle,
      },
    ];

    return partnerDefinitions.map((partner, index) => ({
      id: `partner-${index}`,
      ...partner,
    }));
  };

  // Get personalized feedback based on interaction
  const getInteractionFeedback = (message, partnerId) => {
    const partner = partners.find((p) => p.id === partnerId);
    if (!partner) return null;

    const style = partnerProfiles.communicationStyles[partner.style];
    const personalityTrait = partner.name.toLowerCase().includes("morgan")
      ? partnerProfiles.personalityTraits.morgan
      : partner.name.toLowerCase().includes("casey")
      ? partnerProfiles.personalityTraits.casey
      : null;

    return {
      feedback: generateFeedback(message, style, personalityTrait),
      learningPoints: style.learningGoals,
      suggestionForImprovement: generateSuggestions(
        message,
        style,
        personalityTrait
      ),
    };
  };

  // Helper function to generate feedback
  const generateFeedback = (message, style, personalityTrait) => {
    if (personalityTrait) {
      return {
        tone: "Your message matched well with their flirting style",
        clarity: "Clear romantic/flirting intent while maintaining respect",
        suggestion:
          "Consider incorporating their interests in the conversation",
        flirtingStyle: `They prefer ${personalityTrait.flirtingStyle}`,
      };
    }

    return {
      tone: "Your message was well-structured",
      clarity: "Clear communication",
      suggestion: "Consider adding more specific examples",
    };
  };

  // Helper function to generate suggestions
  const generateSuggestions = (message, style, personalityTrait) => {
    if (personalityTrait) {
      return [
        "Try incorporating their interests in conversation",
        "Match their flirting style while staying authentic",
        "Practice reading and responding to social cues",
        "Remember to maintain appropriate boundaries",
      ];
    }

    return [
      "Try asking open-ended questions",
      "Share your own experiences",
      "Express interest in their perspective",
    ];
  };

  return {
    partners,
    currentPartner,
    setCurrentPartner,
    getInteractionFeedback,
    partnerProfiles,
  };
};
