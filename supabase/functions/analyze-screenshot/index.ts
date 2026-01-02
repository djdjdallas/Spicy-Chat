// supabase/functions/analyze-screenshot/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface UserProfile {
  display_name?: string;
  communication_style?: string;
  relationship_goal?: string;
  interests?: string[];
  values?: string[];
  hobbies?: string[];
}

interface RequestBody {
  base64Image: string;
  userProfile: UserProfile;
  platform: string;
}

interface Suggestion {
  tone: string;
  message: string;
}

interface AnalysisResponse {
  context: string;
  suggestions: Suggestion[];
  tips: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const XAI_API_KEY = Deno.env.get("XAI_API_KEY");

    if (!XAI_API_KEY) {
      throw new Error("XAI_API_KEY is not configured");
    }

    const { base64Image, userProfile, platform }: RequestBody = await req.json();

    if (!base64Image) {
      throw new Error("No image provided");
    }

    // Build personalized context from user profile
    const profileContext = buildProfileContext(userProfile);
    const platformContext = getPlatformContext(platform);

    // Construct the prompt for Grok Vision
    const systemPrompt = `You are Poise, an expert dating coach AI that helps users craft engaging, authentic responses for dating app conversations.

Your role is to:
1. Analyze the screenshot of a dating app conversation
2. Understand the context, tone, and dynamics of the conversation
3. Generate thoughtful, personalized response suggestions

${profileContext}

${platformContext}

Guidelines:
- Keep responses natural and conversational, not scripted
- Match the energy and tone of the conversation
- Be flirtatious when appropriate, but respectful
- Encourage genuine connection over pickup lines
- Consider cultural context and platform norms
- Provide responses that feel authentic to the user's communication style

Output Format (JSON):
{
  "context": "Brief analysis of the conversation dynamics, what's being discussed, and the other person's apparent interest level",
  "suggestions": [
    { "tone": "playful", "message": "A playful response option" },
    { "tone": "thoughtful", "message": "A more thoughtful/genuine response" },
    { "tone": "flirty", "message": "A subtly flirtatious response" }
  ],
  "tips": "Quick advice specific to this conversation situation"
}`;

    const userPrompt = `Analyze this dating app screenshot and provide response suggestions. The screenshot is from ${platform || "a dating app"}.`;

    // Call Grok Vision API
    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${XAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "grok-2-vision-1212",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                  detail: "high",
                },
              },
              {
                type: "text",
                text: userPrompt,
              },
            ],
          },
        ],
        max_tokens: 1024,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Grok API error:", errorText);
      throw new Error(`Grok API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from Grok API");
    }

    // Parse the JSON response
    let analysisResult: AnalysisResponse;
    try {
      // Try to extract JSON from the response (in case it's wrapped in markdown)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      // If parsing fails, create a structured response from the text
      console.error("Failed to parse Grok response:", parseError);
      analysisResult = {
        context: "Unable to fully analyze the conversation.",
        suggestions: [
          {
            tone: "friendly",
            message: content.substring(0, 200),
          },
        ],
        tips: "Try to keep the conversation flowing naturally.",
      };
    }

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "An unexpected error occurred",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

function buildProfileContext(profile: UserProfile): string {
  if (!profile) return "";

  const parts: string[] = [];

  if (profile.display_name) {
    parts.push(`The user's name is ${profile.display_name}.`);
  }

  if (profile.communication_style) {
    const styleMap: Record<string, string> = {
      casual_friendly: "casual and friendly, using relaxed language",
      direct_straightforward: "direct and straightforward, getting to the point",
      thoughtful_reserved: "thoughtful and measured, taking time to craft responses",
      playful_humorous: "playful and humorous, using wit and jokes",
      flirtatious: "naturally flirtatious and charming",
    };
    const style = styleMap[profile.communication_style] || profile.communication_style;
    parts.push(`Their communication style is ${style}.`);
  }

  if (profile.relationship_goal) {
    const goalMap: Record<string, string> = {
      not_sure_yet: "exploring and open to different connections",
      long_term_relationship: "looking for a long-term relationship",
      casual_dating: "interested in casual dating",
      friendship: "looking for friendship first",
      enm_exploration: "exploring ethical non-monogamy",
      polyamory: "practicing polyamory",
    };
    const goal = goalMap[profile.relationship_goal] || profile.relationship_goal;
    parts.push(`They are ${goal}.`);
  }

  if (profile.interests?.length) {
    parts.push(`Their interests include: ${profile.interests.join(", ")}.`);
  }

  if (profile.hobbies?.length) {
    parts.push(`Their hobbies are: ${profile.hobbies.join(", ")}.`);
  }

  if (profile.values?.length) {
    parts.push(`They value: ${profile.values.join(", ")}.`);
  }

  if (parts.length === 0) return "";

  return `User Profile:\n${parts.join("\n")}`;
}

function getPlatformContext(platform: string): string {
  const platformContexts: Record<string, string> = {
    feeld: "Platform: Feeld - A dating app focused on open-minded dating, often used by people exploring non-traditional relationships. Conversations tend to be more open and direct about desires and boundaries.",
    tinder: "Platform: Tinder - A mainstream dating app known for quick connections. Keep responses snappy and engaging. First impressions matter a lot here.",
    hinge: "Platform: Hinge - Designed for meaningful connections. Conversations often reference profile prompts. More depth is expected in conversations.",
    bumble: "Platform: Bumble - Where women make the first move. Responses should be thoughtful as matches are often more intentional.",
    okcupid: "Platform: OkCupid - Known for detailed profiles and compatibility questions. Users appreciate more substantive conversations.",
    "3fun": "Platform: 3Fun - An app for couples and singles interested in group dating. Be direct but respectful about intentions.",
    other: "General dating app context. Adapt to the conversation's existing tone and energy.",
  };

  return platformContexts[platform] || platformContexts.other;
}
