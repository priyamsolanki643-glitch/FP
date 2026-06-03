import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env';

const ai = new GoogleGenAI({ apiKey: env.AI_PROVIDER_KEY });

export class LLMService {
  /**
   * Sends a constructed prompt to the LLM and validates the output.
   * If validation fails, it attempts to regenerate up to 3 times.
   */
  static async generateValidatedResponse(
    userId: string,
    systemPrompt: string,
    bannedCategories: string[],
    retries = 3
  ): Promise<any> {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: systemPrompt,
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
          return this.generateValidatedResponse(userId, retryPrompt, bannedCategories, retries - 1);
        }
        throw new Error('LLM Failed validation after maximum retries. Invalid JSON.');
      }

    } catch (error) {
      console.error('LLM Generation Error:', error);
      throw error;
    }
  }
}
