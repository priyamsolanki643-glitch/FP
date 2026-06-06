import { GoogleGenAI, Type, Schema } from '@google/genai';
import { ContextMatrix, CapabilityVector } from '../engine/types';

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
   * Exponential backoff helper for rate limits.
   */
  private static async sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Sends a constructed prompt to the LLM and guarantees output via responseSchema.
   */
  static async generateValidatedResponse(
    userId: string,
    systemPrompt: string,
    conversationHistory: { role: "user" | "model", parts: { text: string }[] }[] = [],
    bannedCategories: string[],
    retries = 3,
    delayMs = 1000
  ): Promise<{ response_text: string; strengths?: string[]; bottlenecks?: string[]; insight?: string }> {
    try {
      const contents = [
        { role: 'user', parts: [{ text: systemPrompt }] },
        ...conversationHistory
      ];

      const responseSchema: Schema = {
        type: Type.OBJECT,
        properties: {
          response_text: { type: Type.STRING },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          bottlenecks: { type: Type.ARRAY, items: { type: Type.STRING } },
          insight: { type: Type.STRING }
        },
        required: ['response_text']
      };

      const response = await getAI().models.generateContent({
        model: 'gemini-1.5-flash',
        contents: contents as any,
        config: {
          responseMimeType: 'application/json',
          responseSchema: responseSchema,
          temperature: 0.3, 
        }
      });

      const rawText = response.text;
      if (!rawText) throw new Error("Empty response from LLM");

      return JSON.parse(rawText);
    } catch (error: any) {
      if (error.status === 429) {
        console.warn(`LLM Rate limit hit. Not retrying to save quota.`);
        throw new Error("Rate limit exceeded. Please try again in a few seconds.");
      }
      if (retries > 0) {
        console.warn(`LLM Generation failed. Retries left: ${retries - 1}`);
        return this.generateValidatedResponse(userId, systemPrompt, conversationHistory, bannedCategories, retries - 1, delayMs);
      }
      console.error('LLM Generation Error:', error);
      throw error;
    }
  }

  /**
   * Generates a grounded intelligence report by searching the web using Gemini's Google Search tool.
   */
  static async generateGroundedIntelligenceReport(
    researchMandate: string,
    retries = 2,
    delayMs = 1000
  ): Promise<any> {
    try {
      const responseSchema: Schema = {
        type: Type.OBJECT,
        properties: {
          marketSummary: { type: Type.STRING },
          localOpportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
          competitorLandscape: { type: Type.ARRAY, items: { type: Type.STRING } },
          recommendedAction: { type: Type.STRING },
          confidenceScore: { type: Type.NUMBER }
        },
        required: ['marketSummary', 'localOpportunities', 'competitorLandscape', 'recommendedAction', 'confidenceScore']
      };

      const response = await getAI().models.generateContent({
        model: 'gemini-1.5-flash',
        contents: [{ role: 'user', parts: [{ text: researchMandate }] }] as any,
        config: {
          responseMimeType: 'application/json',
          responseSchema: responseSchema,
          temperature: 0.2,
          tools: [{ googleSearch: {} }],
        }
      });

      const rawText = response.text;
      if (!rawText) throw new Error("Empty response from LLM Grounding");

      return JSON.parse(rawText);
    } catch (error: any) {
      if (retries > 0) {
        console.warn(`LLM Grounding failed. Retries left: ${retries - 1}`);
        await this.sleep(delayMs);
        return this.generateGroundedIntelligenceReport(researchMandate, retries - 1, delayMs * 2);
      }
      console.error('LLM Grounding Error:', error);
      throw error;
    }
  }

  /**
   * Removed LLM classification for task outcome to prevent gamification/spoofing.
   * This is now handled deterministically by the backend.
   */
  static async classifyMessageOutcome(message: string): Promise<'completed' | 'failed' | 'none'> {
    console.warn("LLMService.classifyMessageOutcome is deprecated for security reasons.");
    return 'none';
  }

  /**
   * Generates dynamic tasks leveraging Parkinson's Law and strict execution bounds.
   */
  static async generateDynamicTaskSprint(
    strategyState: any,
    frictionProfile: any,
    contextMatrix: any,
    capability: any,
    retries = 2,
    delayMs = 1000
  ): Promise<any> {
    try {
      const isRedBand = contextMatrix.socioeconomic.runwayDays < 45;
      const isShortTimeline = contextMatrix.goalVector.timelineMonths <= 1;
      const isSprintZeroActive = (isRedBand || isShortTimeline) && strategyState.currentDayNumber <= 7;
      
      const consecutiveFailures = strategyState.consecutiveFailureCount || 0;
      const consistencyScore = strategyState.consistencyScore ?? 100;
      
      const strictPrompt = `You are the FP-OS Dynamic Execution Generator.
Your job is to generate a daily task sprint for a user trying to achieve: "${contextMatrix.goalVector.declaredGoal}".

Current Day: Day ${strategyState.currentDayNumber} of ${strategyState.totalTargetDays}.
Friction Level: ${frictionProfile.frictionLevel} (Coefficient: ${frictionProfile.frictionCoefficient.toFixed(2)})
User Consistency Score: ${consistencyScore}/100.
Consecutive Failure Count: ${consecutiveFailures}.
Assigned Work Style: ${frictionProfile.assignedWorkStyle}
Runway: ${contextMatrix.socioeconomic.runwayDays} days.
Calibrated Skills: ${capability.calibratedSkills.map((s: any) => `${s.skillName} (level ${s.verifiedLevel})`).join(', ')}

YOU MUST IMPLEMENT THE FOLLOWING ADAPTIVE ENGINE RULES:
1. Sprint 0: First-Rupee Velocity (Status: ${isSprintZeroActive ? 'ACTIVE' : 'INACTIVE'}): If ACTIVE, focus 100% of tasks on rapid, direct outreach or offering services for immediate revenue.
2. Cognitive Load Balancer: If consistency score is low (< 40) OR consecutive failures >= 2, adjust tasks to be ultra-simple "micro-tasks".
3. Parkinson's Law Compression: Estimate the standard hours needed for each task and apply Parkinson's Law compression (e.g., compress 4 hours to 2 hours of focused work).

LEGAL SAFETY: You are strictly forbidden from generating any task that constitutes formal financial advice, medical advice, or illegal activities.`;

      const responseSchema: Schema = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            metricBound: { type: Type.STRING },
            timeAllocationHours: { type: Type.NUMBER }
          },
          required: ['title', 'description', 'metricBound', 'timeAllocationHours']
        }
      };

      const response = await getAI().models.generateContent({
        model: 'gemini-1.5-flash',
        contents: [{ role: 'user', parts: [{ text: strictPrompt }] }] as any,
        config: {
          responseMimeType: 'application/json',
          responseSchema: responseSchema,
          temperature: 0.4,
        }
      });

      const rawText = response.text;
      if (!rawText) throw new Error("Empty response from LLM Task Generator");

      return JSON.parse(rawText);
    } catch (error: any) {
      if (retries > 0) {
        console.warn(`LLM Task Gen failed. Retries left: ${retries - 1}`);
        await this.sleep(delayMs);
        return this.generateDynamicTaskSprint(strategyState, frictionProfile, contextMatrix, capability, retries - 1, delayMs * 2);
      }
      console.error('LLM Task Generator Error:', error);
      throw error;
    }
  }

  static async generateDynamicOpportunities(
    matrix: ContextMatrix,
    capability: CapabilityVector,
    retries = 2,
    delayMs = 1000
  ): Promise<any[]> {
    try {
      const strictPrompt = `You are the FP-OS Universal Opportunity Generator.
Your job is to generate exactly 3 custom business/revenue opportunities for this specific user based on their skills and constraints.
Goal: "${matrix.goalVector.declaredGoal}"
Location Tier: ${matrix.socioeconomic.geographyTier}
Liquid Capital: INR ${matrix.socioeconomic.liquidCapital}
Top Skills: ${capability.calibratedSkills.map((s: any) => s.skillName).join(', ')}`;

      const responseSchema: Schema = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            category: { type: Type.STRING, enum: ["local_geo_arbitrage", "national_digital_remote", "trend_window_exploitation"] },
            opportunityScore: { type: Type.NUMBER },
            capitalRequired: { type: Type.NUMBER },
            timeToFirstRevenue: { type: Type.NUMBER },
            whyThisForThisUser: { type: Type.STRING }
          },
          required: ['id', 'title', 'category', 'opportunityScore', 'capitalRequired', 'timeToFirstRevenue', 'whyThisForThisUser']
        }
      };

      const response = await getAI().models.generateContent({
        model: 'gemini-1.5-flash',
        contents: [{ role: 'user', parts: [{ text: strictPrompt }] }] as any,
        config: {
          responseMimeType: 'application/json',
          responseSchema: responseSchema,
          temperature: 0.4,
        }
      });

      const rawText = response.text;
      if (!rawText) throw new Error("Empty response from LLM Opportunity Generator");

      return JSON.parse(rawText);
    } catch (error: any) {
      if (retries > 0) {
        console.warn(`LLM Opportunity Gen failed. Retries left: ${retries - 1}`);
        await this.sleep(delayMs);
        return this.generateDynamicOpportunities(matrix, capability, retries - 1, delayMs * 2);
      }
      console.error('LLM Opportunity Generator Error:', error);
      throw error;
    }
  }

  /**
   * Generates text embedding vector using text-embedding-004.
   */
  static async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await getAI().models.embedContent({
        model: 'text-embedding-004',
        contents: text,
      });
      
      if (!response.embeddings || response.embeddings.length === 0 || !response.embeddings[0].values) {
        throw new Error("Failed to generate embedding");
      }
      
      return response.embeddings[0].values;
    } catch (error) {
      console.error("LLMService: Embedding generation failed:", error);
      throw error;
    }
  }
}
