import { GoogleGenAI } from '@google/genai';

// Lazy client — created only when first needed, NOT at import time.
// This prevents crashes during Cloud Run startup health checks.
let _ai: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!_ai) {
    const apiKey = process.env.AI_PROVIDER_KEY || '';
    _ai = new GoogleGenAI({ apiKey });
  }
  return _ai;
}

export class LLMService {
  /**
   * Sends a constructed prompt to the LLM and validates the output.
   * If validation fails, it attempts to regenerate up to 3 times.
   */
  static async generateValidatedResponse(
    userId: string,
    systemPrompt: string,
    conversationHistory: { role: "user" | "model", parts: { text: string }[] }[] = [],
    bannedCategories: string[],
    retries = 3
  ): Promise<any> {
    try {
      const strictPrompt = systemPrompt + "\n\nIMPORTANT: You must respond in ONLY raw JSON format. Your response MUST be a JSON object containing exactly one key named 'response_text' containing your actual response to the user. Do not include markdown formatting or backticks. Example: {\"response_text\": \"Hello, how can I help?\"}";

      const contents = [
        { role: 'user', parts: [{ text: strictPrompt }] },
        ...conversationHistory
      ];

      const response = await getAI().models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents as any,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3, // Low temperature for deterministic output
        }
      });

      const rawText = response.text;
      
      if (!rawText) {
         throw new Error("Empty response from LLM");
      }

      let cleanOutput = rawText.trim();
      // Basic JSON cleanup
      if (cleanOutput.startsWith('```json')) cleanOutput = cleanOutput.substring(7);
      if (cleanOutput.startsWith('```')) cleanOutput = cleanOutput.substring(3);
      if (cleanOutput.endsWith('```')) cleanOutput = cleanOutput.substring(0, cleanOutput.length - 3);
      
      try {
        return JSON.parse(cleanOutput.trim());
      } catch (parseError) {
        if (retries > 0) {
          console.warn(`LLM Output JSON parse failed. Retries left: ${retries - 1}`);
          const retryPrompt = `${systemPrompt}\n\n[SYSTEM REJECTION]\nYour previous output was not valid JSON. Fix it and output only raw JSON.`;
          return this.generateValidatedResponse(userId, retryPrompt, conversationHistory, bannedCategories, retries - 1);
        }
        throw new Error('LLM Failed validation after maximum retries. Invalid JSON.');
      }

    } catch (error) {
      console.error('LLM Generation Error:', error);
      throw error;
    }
  }

  /**
   * Generates a grounded intelligence report by searching the web using Gemini's Google Search tool.
   */
  static async generateGroundedIntelligenceReport(
    researchMandate: string,
    retries = 2
  ): Promise<any> {
    try {
      const strictPrompt = researchMandate + "\n\nIMPORTANT: You must respond in ONLY raw JSON format exactly matching the `MarketIntelligenceReport` TypeScript interface. No markdown formatting or backticks. DO NOT INCLUDE ```json anywhere.";

      const response = await getAI().models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: strictPrompt }] }] as any,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2, // Slightly higher to allow search variation
          tools: [{ googleSearch: {} }],
        }
      });

      const rawText = response.text;
      if (!rawText) throw new Error("Empty response from LLM Grounding");

      let cleanOutput = rawText.trim();
      if (cleanOutput.startsWith('```json')) cleanOutput = cleanOutput.substring(7);
      if (cleanOutput.startsWith('```')) cleanOutput = cleanOutput.substring(3);
      if (cleanOutput.endsWith('```')) cleanOutput = cleanOutput.substring(0, cleanOutput.length - 3);

      return JSON.parse(cleanOutput.trim());
    } catch (error) {
      if (retries > 0) {
        console.warn(`LLM Grounding JSON parse failed. Retries left: ${retries - 1}`);
        return this.generateGroundedIntelligenceReport(researchMandate, retries - 1);
      }
      console.error('LLM Grounding Error:', error);
      throw error;
    }
  }

  /**
   * Analyzes if a message indicates task completion or failure.
   */
  static async classifyMessageOutcome(message: string): Promise<'completed' | 'failed' | 'none'> {
    try {
      const prompt = `Analyze the user's message and determine if they are indicating that they completed a task, failed a task, or if this is a general message.
User Message: "${message}"

You must respond in ONLY JSON format containing exactly one key named 'outcome' with value 'completed', 'failed', or 'none'. Do not include markdown formatting or backticks. Example: {"outcome": "completed"}`;
      
      const response = await getAI().models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }] as any,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        }
      });

      const rawText = response.text;
      if (!rawText) return 'none';
      const clean = rawText.trim();
      const parsed = JSON.parse(clean);
      return parsed.outcome || 'none';
    } catch (e) {
      console.error("Message outcome classification error:", e);
      return 'none';
    }
  }
}
