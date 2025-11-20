import { GoogleGenAI, Chat, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { GeminiModel } from "../types";

// Initialize the default SDK instance
const defaultAi = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const createContestantChat = (
  model: GeminiModel,
  systemInstruction: string,
  apiKey?: string
): Chat => {
  // If a custom API key is provided for this contestant, create a new instance.
  // Otherwise, use the default instance powered by process.env.API_KEY
  const client = apiKey ? new GoogleGenAI({ apiKey }) : defaultAi;

  return client.chats.create({
    model: model,
    config: {
      systemInstruction: systemInstruction,
      // Increased from 20 to 60. 
      // 20 was too tight and caused MAX_TOKENS errors before a sentence could finish.
      // The system prompt "Limit answer to max 10 words" handles the logical constraint.
      maxOutputTokens: 60, 
      temperature: 0.7,
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ]
    },
  });
};

export const getChatResponse = async (
  chat: Chat,
  message: string
): Promise<string> => {
  try {
    const response = await chat.sendMessage({ message });
    
    if (response.text) {
      return response.text;
    }

    console.warn("Gemini response missing .text property:", response);

    // Attempt to recover partial text from candidates if .text is undefined but content exists
    const partialText = response.candidates?.[0]?.content?.parts?.[0]?.text;
    if (partialText) {
        return partialText;
    }

    // If we really have no text, check the finish reason
    if (response.candidates && response.candidates.length > 0 && response.candidates[0].finishReason) {
         return `[System: Answer blocked (${response.candidates[0].finishReason})]`;
    }

    return "I'm speechless! (Empty response)";
  } catch (error) {
    console.error("Chat error:", error);
    return "Err... *static noise* (Connection Error)";
  }
};

export type { Chat };