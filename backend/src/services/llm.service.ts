import '../utils/env';
import { GoogleGenAI, Type, Schema } from '@google/genai';
import { ContextMatrix, CapabilityVector } from '../engine/types';

function getAIClientForModel(modelName?: string): { client: GoogleGenAI, actualModel: string } {
  const keys = process.env.AI_KEYS 
    ? process.env.AI_KEYS.split(',').map(k => k.trim()).filter(Boolean)
    : process.env.GEMINI_KEYS
    ? process.env.GEMINI_KEYS.split(',').map(k => k.trim()).filter(Boolean)
    : process.env.AI_PROVIDER_KEY 
    ? [process.env.AI_PROVIDER_KEY]
    : process.env.AI_STRATEGIST_PROVIDER_KEY
    ? [process.env.AI_STRATEGIST_PROVIDER_KEY]
    : process.env.GEMINI_API_KEY
    ? [process.env.GEMINI_API_KEY]
    : process.env.GOOGLE_API_KEY
    ? [process.env.GOOGLE_API_KEY]
    : [];

  if (keys.length === 0) {
    throw new Error('No AI API Keys configured');
  }

  // Force single key and use latest eligible model
  const key = keys[0];
  const actualModel = 'gemini-2.5-flash';
  
  return { client: new GoogleGenAI({ apiKey: key }), actualModel };
}

function cleanAndParseJSON(text: string): any {
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(json)?\s*/i, '');
    cleaned = cleaned.replace(/\s*```$/, '');
  }
  
  const firstBrace = cleaned.indexOf('{');
  const firstBracket = cleaned.indexOf('[');
  let startIdx = -1;
  let endIdx = -1;
  
  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    startIdx = firstBrace;
    endIdx = cleaned.lastIndexOf('}');
  } else if (firstBracket !== -1) {
    startIdx = firstBracket;
    endIdx = cleaned.lastIndexOf(']');
  }
  
  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    cleaned = cleaned.substring(startIdx, endIdx + 1);
  }
  
  // Replace raw control characters (ASCII 0-31, e.g. newlines, tabs) inside string literals with their escaped equivalents
  cleaned = cleaned.replace(/"([^"\\]|\\.)*"/g, (match) => {
    return match.replace(/[\u0000-\u001f]/g, (ctrl) => {
      if (ctrl === '\n') return '\\n';
      if (ctrl === '\r') return '\\r';
      if (ctrl === '\t') return '\\t';
      return ctrl;
    });
  });
  
  return JSON.parse(cleaned);
}

export class LLMService {
  private static async sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static async generateSmartResponse(
    userId: string,
    systemPrompt: string,
    conversationHistory: { role: "user" | "model", parts: { text: string }[] }[] = [],
    isModeOnboarding: boolean,
    modelName?: string
  ): Promise<{ 
    response_text: string; 
    task_classification: "completed" | "failed" | "none"; 
    onboarding_data?: any 
  }> {
    try {
      const responseSchema: Schema = {
        type: Type.OBJECT,
        properties: {
          response_text: { 
            type: Type.STRING,
            description: "Your conversational response to the user. Maintain the aggressive, buddy-like Hinglish persona."
          },
          task_classification: { 
            type: Type.STRING,
            description: "If the user is reporting the outcome of a task they were supposed to do, classify it as 'completed' or 'failed'. Otherwise return 'none'."
          }
        },
        required: ['response_text', 'task_classification']
      };

      if (isModeOnboarding) {
        responseSchema.properties!['onboarding_data'] = {
          type: Type.OBJECT,
          properties: {
            isComplete: { type: Type.BOOLEAN, description: "True if all constraints (Goal, Capital, Time, Location) are extracted." },
            declaredGoal: { type: Type.STRING },
            region: { type: Type.STRING },
            liquidCapital: { type: Type.NUMBER },
            dailyUninterruptedHours: { type: Type.NUMBER },
            pathPreference: { type: Type.STRING },
            rawSkillStrings: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ['isComplete']
        };
      }

      const fullContents = [
        { role: 'user', parts: [{ text: systemPrompt + "\n\nIMPORTANT: You must output your response in JSON format matching this schema: " + JSON.stringify(responseSchema) + ". Do not include any markdown formatting, just pure JSON. CRITICAL: Your response_text MUST strictly follow the TEXTING FORMATTING RULES (short sentences, double line breaks, max 2-3 sentences per block)." }] },
        ...conversationHistory
      ];

      const { client, actualModel } = getAIClientForModel(modelName);
      
      const response = await client.models.generateContent({
        model: actualModel,
        contents: fullContents as any,
        config: {
          temperature: 0.3,
          tools: [{ googleSearch: {} }],
        }
      });

      const rawText = response.text;
      if (!rawText) throw new Error("Empty response from LLM");

      return cleanAndParseJSON(rawText);
    } catch (error: any) {
      console.error('LLM Smart Generation Error:', error);
      throw error;
    }
  }

  static async generateValidatedResponse(
    userId: string,
    systemPrompt: string,
    conversationHistory: { role: "user" | "model", parts: { text: string }[] }[] = [],
    bannedCategories: string[],
    retries = 3,
    delayMs = 1000,
    isBackground = false
  ): Promise<{ response_text: string; strengths?: string[]; bottlenecks?: string[]; insight?: string }> {
    try {
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

      const { client, actualModel } = getAIClientForModel('FP Pro'); // Use pro for backend logic by default
      
      const fullContents = [
        { role: 'user', parts: [{ text: systemPrompt + "\n\nCRITICAL: Your response_text MUST strictly follow the TEXTING FORMATTING RULES (short sentences, double line breaks, max 2-3 sentences per block)." }] },
        ...conversationHistory
      ];

      const response = await client.models.generateContent({
        model: actualModel,
        contents: fullContents as any,
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
      console.error('LLM Generation Error:', error);
      throw error;
    }
  }

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

      const { client, actualModel } = getAIClientForModel('FP Elite'); // High reasoning for reports
      
      const response = await client.models.generateContent({
        model: actualModel,
        contents: [{ role: 'user', parts: [{ text: researchMandate + "\n\nIMPORTANT: You must return the report in JSON format matching the schema: { marketSummary: string, localOpportunities: string[], competitorLandscape: string[], recommendedAction: string, confidenceScore: number }. Output ONLY valid JSON." }] }] as any,
        config: {
          temperature: 0.2,
          tools: [{ googleSearch: {} }],
        }
      });

      const rawText = response.text;
      if (!rawText) throw new Error("Empty response from LLM Grounding");

      return cleanAndParseJSON(rawText);
    } catch (error: any) {
      console.error('LLM Grounding Error:', error);
      throw error;
    }
  }

  static async classifyMessageOutcome(message: string): Promise<'completed' | 'failed' | 'none'> {
    console.warn("LLMService.classifyMessageOutcome is deprecated for security reasons.");
    return 'none';
  }

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
3. Parkinson's Law Compression: Estimate the standard hours needed for each task and apply Parkinson's Law compression.`;

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

      const { client, actualModel } = getAIClientForModel('FP Pro');
      
      const response = await client.models.generateContent({
        model: actualModel,
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

      const { client, actualModel } = getAIClientForModel('FP Elite');
      
      const response = await client.models.generateContent({
        model: actualModel,
        contents: [{ role: 'user', parts: [{ text: strictPrompt + "\n\nIMPORTANT: You must return the output in JSON format matching the schema: Array of objects with properties { id: string, title: string, category: string, opportunityScore: number, capitalRequired: number, timeToFirstRevenue: number, whyThisForThisUser: string }. Output ONLY valid JSON." }] }] as any,
        config: {
          temperature: 0.4,
          tools: [{ googleSearch: {} }],
        }
      });

      const rawText = response.text;
      if (!rawText) throw new Error("Empty response from LLM Opportunity Generator");

      return cleanAndParseJSON(rawText);
    } catch (error: any) {
      console.error('LLM Opportunity Generator Error:', error);
      throw error;
    }
  }

  static async generateEmbedding(text: string): Promise<number[]> {
    try {
      const { client } = getAIClientForModel('FP Pro');
      const response = await client.models.embedContent({
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

  static async extractOnboardingData(
    conversationHistory: { role: "user" | "model", parts: { text: string }[] }[]
  ): Promise<{
    isComplete: boolean;
    declaredGoal: string;
    liquidCapital: number;
    region: string;
    dailyUninterruptedHours: number;
    rawSkillStrings: string[];
    pathPreference: 'high_risk_upside' | 'safe_compounding' | 'undecided';
  }> {
    try {
      const prompt = `You are a data extractor for a startup strategy engine.
Analyze the conversation history between the User and the AI Buddy (FP) to extract the following circumstantial parameters.
Only set isComplete to true if the user has clearly specified:
1. What their goal is
2. Their approximate financial resources/liquid capital
3. Their current skills
4. Their available hours per day
5. Their approximate location/locality

If any of these 5 core items are missing or unclear, set isComplete to false.

Conversation History:
${JSON.stringify(conversationHistory)}

Extract the parameters and output ONLY a JSON object matching the requested schema.`;

      const responseSchema: Schema = {
        type: Type.OBJECT,
        properties: {
          isComplete: { type: Type.BOOLEAN },
          declaredGoal: { type: Type.STRING },
          liquidCapital: { type: Type.NUMBER },
          region: { type: Type.STRING },
          dailyUninterruptedHours: { type: Type.NUMBER },
          rawSkillStrings: { type: Type.ARRAY, items: { type: Type.STRING } },
          pathPreference: { type: Type.STRING }
        },
        required: ['isComplete', 'declaredGoal', 'liquidCapital', 'region', 'dailyUninterruptedHours', 'rawSkillStrings', 'pathPreference']
      };

      const { client, actualModel } = getAIClientForModel('FP Pro');
      
      const response = await client.models.generateContent({
        model: actualModel,
        contents: [{ role: 'user', parts: [{ text: prompt }] }] as any,
        config: {
          responseMimeType: 'application/json',
          responseSchema: responseSchema,
          temperature: 0.3,
        }
      });

      const rawText = response.text;
      if (!rawText) throw new Error("Empty response from Onboarding Extractor");

      const parsed = JSON.parse(rawText);
      let pathPref: 'high_risk_upside' | 'safe_compounding' | 'undecided' = 'undecided';
      if (parsed.pathPreference === 'high_risk_upside' || parsed.pathPreference === 'safe_compounding') {
        pathPref = parsed.pathPreference;
      }

      return {
        isComplete: !!parsed.isComplete,
        declaredGoal: parsed.declaredGoal || '',
        liquidCapital: parsed.liquidCapital || 0,
        region: parsed.region || '',
        dailyUninterruptedHours: parsed.dailyUninterruptedHours || 4,
        rawSkillStrings: Array.isArray(parsed.rawSkillStrings) ? parsed.rawSkillStrings : [],
        pathPreference: pathPref
      };
    } catch (error) {
      console.error("LLMService: Onboarding extraction failed:", error);
      return {
        isComplete: false,
        declaredGoal: '',
        liquidCapital: 0,
        region: '',
        dailyUninterruptedHours: 4,
        rawSkillStrings: [],
        pathPreference: 'undecided'
      };
    }
  }
}
