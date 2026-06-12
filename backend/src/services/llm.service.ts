import '../utils/env';
import { GoogleGenAI, Type, Schema } from '@google/genai';
import { ContextMatrix, CapabilityVector } from '../engine/types';

// ─────────────────────────────────────────────────────────────────────────────
// API KEY POOL — 4 keys × rotating = near-zero quota failures
// ─────────────────────────────────────────────────────────────────────────────
const HARDCODED_KEYS: string[] = [
  "AIzaSyADhnxSuEtdP5GHMJ_QJbOhNfgDfIujumI",
  "AIzaSyApmNdQKeuXuN55w6ajnQhjAK0V8ALHhew",
  "AIzaSyCiOefYmmgmuZKg_Fu5XcUhWIafRmsEeB0",
  "AIzaSyCSB9xsxVZWXoFq56PtkeAvT113kpu5nVw"
];

// ─────────────────────────────────────────────────────────────────────────────
// COOLDOWN MAP — prevents hammering a quota-exhausted key
// key = `${model}-${keyIndex}`, value = expiry timestamp
// ─────────────────────────────────────────────────────────────────────────────
const globalCooldownMap = new Map<string, number>();

// ─────────────────────────────────────────────────────────────────────────────
// CORE EXECUTOR — smart key rotation with per-key cooldowns
// ─────────────────────────────────────────────────────────────────────────────
export async function executeWithRotation(
  payload: any,
  maxRetries = 15
): Promise<any> {
  const keys = [
    ...(process.env.AI_KEYS ? process.env.AI_KEYS.split(',') : []),
    ...(process.env.GEMINI_KEYS ? process.env.GEMINI_KEYS.split(',') : []),
    ...(process.env.AI_PROVIDER_KEY ? process.env.AI_PROVIDER_KEY.split(',') : []),
    ...(process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.split(',') : []),
    ...(process.env.GOOGLE_API_KEY ? process.env.GOOGLE_API_KEY.split(',') : []),
    ...HARDCODED_KEYS
  ]
    .map(k => k?.trim())
    .filter(Boolean) as string[];

  if (keys.length === 0) {
    throw new Error('No AI API Keys configured');
  }

  const actualModel = payload.model || 'gemini-2.5-flash';
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const getErrorMessage = (err: any): string => {
    if (!err) return 'Unknown error';
    return err?.message || err?.error?.message || err?.statusText || JSON.stringify(err);
  };

  const parseRetryDelayMs = (message: string): number | null => {
    if (!message) return null;
    const retryInMatch = message.match(/retry in\s+([\d.]+)s/i);
    if (retryInMatch) return Math.ceil(parseFloat(retryInMatch[1]) * 1000) + 500;
    const tryAgainMatch = message.match(/try again in\s+([\d.]+)s/i);
    if (tryAgainMatch) return Math.ceil(parseFloat(tryAgainMatch[1]) * 1000) + 500;
    return null;
  };

  const isQuotaError = (message: string): boolean => {
    const m = message.toLowerCase();
    return m.includes('quota exceeded') || m.includes('resource_exhausted') ||
      m.includes('429') || m.includes('rate limit') || m.includes('too many requests');
  };

  const isModelError = (message: string): boolean => {
    const m = message.toLowerCase();
    return m.includes('model not found') || m.includes('unsupported model') ||
      m.includes('is not found for api version') || m.includes('invalid model');
  };

  const isRetryableInfraError = (message: string): boolean => {
    const m = message.toLowerCase();
    return m.includes('503') || m.includes('overloaded') || m.includes('unavailable') ||
      m.includes('internal error') || m.includes('deadline exceeded') ||
      m.includes('timed out') || m.includes('timeout') ||
      m.includes('econnreset') || m.includes('socket hang up');
  };

  let lastError: any = null;
  let attempt = 0;

  for (let keyIndex = 0; keyIndex < keys.length; keyIndex++) {
    if (attempt >= maxRetries) break;
    attempt++;

    const key = keys[keyIndex];
    const cooldownId = `${actualModel}-${keyIndex}`;

    const cooldownUntil = globalCooldownMap.get(cooldownId);
    if (cooldownUntil && Date.now() < cooldownUntil) {
      console.log(`[LLM] Skipping key=${keyIndex + 1} (cooldown ${Math.ceil((cooldownUntil - Date.now()) / 1000)}s left)`);
      continue;
    }

    const client = new GoogleGenAI({ apiKey: key });

    try {
      const attemptPayload = { ...payload, model: actualModel };
      console.log(`[LLM] Attempt ${attempt}/${maxRetries} | model=${actualModel} | key=${keyIndex + 1}/${keys.length}`);

      const result = await client.models.generateContent(attemptPayload as any);
      globalCooldownMap.delete(cooldownId);
      return result;

    } catch (err: any) {
      lastError = err;
      const message = getErrorMessage(err);
      console.warn(`[LLM] Failed | attempt=${attempt} | model=${actualModel} | key=${keyIndex + 1} | error=${message}`);

      if (isModelError(message)) {
        console.warn(`[LLM] Invalid model: ${actualModel}, aborting`);
        break;
      }

      if (isQuotaError(message)) {
        const retryDelay = parseRetryDelayMs(message) ?? 60_000;
        globalCooldownMap.set(cooldownId, Date.now() + retryDelay);
        console.warn(`[LLM] Quota hit key=${keyIndex + 1}. Cooldown ${retryDelay}ms. Trying next key.`);
        continue;
      }

      if (isRetryableInfraError(message)) {
        const backoff = Math.min(1500 * attempt, 8000);
        await sleep(backoff);
        continue;
      }

      await sleep(400);
    }
  }

  throw lastError;
}

// ─────────────────────────────────────────────────────────────────────────────
// SAFE JSON BUILDER — constructs a safe, Gemini-parseable contents array
// Rules:
//   1. Must have at least 1 element
//   2. First element must be role='user'  
//   3. Alternating user/model
//   4. Last element must be role='user'
// ─────────────────────────────────────────────────────────────────────────────
function buildSafeContents(
  history: { role: 'user' | 'model'; parts: { text: string }[] }[]
): { role: 'user' | 'model'; parts: { text: string }[] }[] {
  if (!history || history.length === 0) {
    return [{ role: 'user', parts: [{ text: '...' }] }];
  }

  // Ensure valid alternating turns
  const fixed: { role: 'user' | 'model'; parts: { text: string }[] }[] = [];
  for (const turn of history) {
    if (fixed.length === 0 && turn.role !== 'user') continue; // skip leading model turns
    if (fixed.length > 0 && fixed[fixed.length - 1].role === turn.role) {
      // Merge consecutive same-role turns
      fixed[fixed.length - 1].parts.push(...turn.parts);
    } else {
      fixed.push({ role: turn.role, parts: [...turn.parts] });
    }
  }

  if (fixed.length === 0) {
    return [{ role: 'user', parts: [{ text: '...' }] }];
  }

  // Last must be user
  if (fixed[fixed.length - 1].role === 'model') {
    fixed.push({ role: 'user', parts: [{ text: '...' }] });
  }

  return fixed;
}

// ─────────────────────────────────────────────────────────────────────────────
// JSON CLEANER — last-resort fallback if Gemini ignores JSON mode
// ─────────────────────────────────────────────────────────────────────────────
function cleanAndParseJSON(text: string): any {
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(json)?\s*/i, '').replace(/\s*```$/, '');
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

  // Escape unescaped control characters inside strings
  cleaned = cleaned.replace(/"([^"\\]|\\.)*"/g, (match) => {
    return match.replace(/[\n\r\t]/g, (c) => {
      if (c === '\n') return '\\n';
      if (c === '\r') return '\\r';
      if (c === '\t') return '\\t';
      return c;
    });
  });

  return JSON.parse(cleaned);
}

// ─────────────────────────────────────────────────────────────────────────────
// STRIP MARKDOWN — removes ** ## etc from system instructions
// (Gemini's JSON constrained mode can get confused by markdown in systemInstruction)
// ─────────────────────────────────────────────────────────────────────────────
function stripMarkdownForSystemInstruction(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1')   // **bold** → bold
    .replace(/\*([^*]+)\*/g, '$1')         // *italic* → italic
    .replace(/^#{1,6}\s+/gm, '')           // ## headers → plain
    .replace(/^---+$/gm, '')               // --- dividers → nothing
    .trim();
}

// ─────────────────────────────────────────────────────────────────────────────
// LUMENSKY AI SERVICE
// ─────────────────────────────────────────────────────────────────────────────
export class LLMService {
  private static async sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ──────────────────────────────────────────────────────────────────────────
  // PRIMARY CHAT RESPONDER
  // Called for every user message. Returns response_text + task_classification.
  // Uses JSON mode with responseSchema for 100% structured output.
  // ──────────────────────────────────────────────────────────────────────────
  static async generateSmartResponse(
    userId: string,
    systemPrompt: string,
    conversationHistory: { role: 'user' | 'model'; parts: { text: string }[] }[] = [],
    isModeOnboarding: boolean,
    modelName?: string
  ): Promise<{
    response_text: string;
    task_classification: 'completed' | 'failed' | 'none';
    onboarding_data?: any;
  }> {
    // Schema definition
    const responseSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        response_text: {
          type: Type.STRING,
          description: 'Your response to the user in natural Hinglish. No markdown.'
        },
        task_classification: {
          type: Type.STRING,
          enum: ['completed', 'failed', 'none'],
          description: "If user is reporting a task outcome: 'completed' or 'failed'. Otherwise: 'none'."
        }
      },
      required: ['response_text', 'task_classification']
    };

    if (isModeOnboarding) {
      responseSchema.properties!['onboarding_data'] = {
        type: Type.OBJECT,
        properties: {
          isComplete: { type: Type.BOOLEAN },
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

    // Trim to last 10 turns for speed
    const MAX_HISTORY = 10;
    const rawHistory = conversationHistory.length > MAX_HISTORY
      ? conversationHistory.slice(-MAX_HISTORY)
      : conversationHistory;

    const safeContents = buildSafeContents(rawHistory);

    // systemInstruction must not have markdown when used with JSON mode
    const cleanSystemInstruction = stripMarkdownForSystemInstruction(systemPrompt);

    try {
      const response = await executeWithRotation({
        model: modelName || 'gemini-2.5-flash',
        contents: safeContents as any,
        config: {
          systemInstruction: cleanSystemInstruction,
          responseMimeType: 'application/json',
          responseSchema: responseSchema,
          temperature: 0.9,
          maxOutputTokens: 1024,
        }
      });

      const rawText = response.text;
      if (!rawText) throw new Error('Empty response from LLM');

      const parsed = JSON.parse(rawText);

      // Normalise task_classification
      if (!['completed', 'failed', 'none'].includes(parsed.task_classification)) {
        parsed.task_classification = 'none';
      }

      return parsed;
    } catch (primaryErr: any) {
      console.error('[generateSmartResponse] Primary error:', primaryErr?.message || primaryErr);

      // ── FALLBACK: plain text mode (no JSON constraint) ──────────────────────
      // If JSON mode fails for any reason, fall back to asking the model to
      // output JSON manually in a plain text response, then parse it.
      try {
        console.log('[generateSmartResponse] Attempting plain-text fallback...');
        const fallbackPrompt = cleanSystemInstruction +
          '\n\nIMPORTANT: Respond ONLY with a valid JSON object with exactly these fields: ' +
          '{"response_text": "your message here", "task_classification": "none"}. No extra text.';

        const fallbackResponse = await executeWithRotation({
          model: 'gemini-2.5-flash',
          contents: safeContents as any,
          config: {
            systemInstruction: fallbackPrompt,
            temperature: 0.7,
            maxOutputTokens: 512,
          }
        });

        const fallbackText = fallbackResponse.text;
        if (!fallbackText) throw new Error('Empty fallback response');

        return cleanAndParseJSON(fallbackText);
      } catch (fallbackErr: any) {
        console.error('[generateSmartResponse] Fallback also failed:', fallbackErr?.message);
        throw primaryErr; // Re-throw original for upstream error handling
      }
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // VALIDATED RESPONSE — for titles, analysis, grounding tasks
  // ──────────────────────────────────────────────────────────────────────────
  static async generateValidatedResponse(
    userId: string,
    systemPrompt: string,
    conversationHistory: { role: 'user' | 'model'; parts: { text: string }[] }[],
    bannedCategories: string[],
    retries = 3,
    delayMs = 1000,
    isBackground = false
  ): Promise<{ response_text: string; strengths?: string[]; bottlenecks?: string[]; insight?: string }> {
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

    const MAX_HISTORY = 10;
    const rawHistory = conversationHistory.length > MAX_HISTORY
      ? conversationHistory.slice(-MAX_HISTORY)
      : conversationHistory;

    const safeContents = buildSafeContents(rawHistory);
    const cleanInstruction = stripMarkdownForSystemInstruction(systemPrompt);

    try {
      const response = await executeWithRotation({
        model: 'gemini-2.5-flash',
        contents: safeContents as any,
        config: {
          systemInstruction: cleanInstruction,
          responseMimeType: 'application/json',
          responseSchema: responseSchema,
          temperature: 0.3,
        }
      });

      const rawText = response.text;
      if (!rawText) throw new Error('Empty response from LLM');
      return JSON.parse(rawText);
    } catch (error: any) {
      console.error('[generateValidatedResponse] Error:', error?.message);
      throw error;
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // GROUNDED INTELLIGENCE REPORT — with Google Search
  // ──────────────────────────────────────────────────────────────────────────
  static async generateGroundedIntelligenceReport(
    researchMandate: string,
    retries = 2,
    delayMs = 1000
  ): Promise<any> {
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

    try {
      const response = await executeWithRotation({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: researchMandate }] }] as any,
        config: {
          temperature: 0.2,
          tools: [{ googleSearch: {} }],
        }
      });

      const rawText = response.text;
      if (!rawText) throw new Error('Empty response from LLM Grounding');
      return cleanAndParseJSON(rawText);
    } catch (error: any) {
      console.error('[generateGroundedIntelligenceReport] Error:', error?.message);
      throw error;
    }
  }

  static async classifyMessageOutcome(message: string): Promise<'completed' | 'failed' | 'none'> {
    console.warn('LLMService.classifyMessageOutcome is deprecated.');
    return 'none';
  }

  // ──────────────────────────────────────────────────────────────────────────
  // DYNAMIC TASK SPRINT GENERATOR
  // ──────────────────────────────────────────────────────────────────────────
  static async generateDynamicTaskSprint(
    strategyState: any,
    frictionProfile: any,
    contextMatrix: any,
    capability: any,
    retries = 2,
    delayMs = 1000
  ): Promise<any> {
    const isRedBand = contextMatrix.socioeconomic.runwayDays < 45;
    const isShortTimeline = contextMatrix.goalVector.timelineMonths <= 1;
    const isSprintZeroActive = (isRedBand || isShortTimeline) && strategyState.currentDayNumber <= 7;
    const consecutiveFailures = strategyState.consecutiveFailureCount || 0;
    const consistencyScore = strategyState.consistencyScore ?? 100;

    const strictPrompt = `You are the FP-OS Dynamic Execution Generator.
Goal: "${contextMatrix.goalVector.declaredGoal}"
Day ${strategyState.currentDayNumber} of ${strategyState.totalTargetDays}.
Friction: ${frictionProfile.frictionLevel} (${frictionProfile.frictionCoefficient.toFixed(2)})
Consistency: ${consistencyScore}/100. Failures: ${consecutiveFailures}.
Work Style: ${frictionProfile.assignedWorkStyle}
Runway: ${contextMatrix.socioeconomic.runwayDays} days.
Skills: ${capability.calibratedSkills.map((s: any) => `${s.skillName} (level ${s.verifiedLevel})`).join(', ')}

Sprint 0 (First Revenue): ${isSprintZeroActive ? 'ACTIVE — 100% focus on direct outreach' : 'INACTIVE'}.
If consistency < 40 or failures >= 2: use ultra-simple micro-tasks only.
Apply Parkinson Law compression to time estimates.`;

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

    const response = await executeWithRotation({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: strictPrompt }] }] as any,
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
        temperature: 0.4,
      }
    });

    const rawText = response.text;
    if (!rawText) throw new Error('Empty response from LLM Task Generator');
    return JSON.parse(rawText);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // DYNAMIC OPPORTUNITIES GENERATOR
  // ──────────────────────────────────────────────────────────────────────────
  static async generateDynamicOpportunities(
    matrix: ContextMatrix,
    capability: CapabilityVector,
    retries = 2,
    delayMs = 1000
  ): Promise<any[]> {
    const strictPrompt = `You are the FP-OS Universal Opportunity Generator.
Generate exactly 3 custom business/revenue opportunities for this user.
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
          category: { type: Type.STRING, enum: ['local_geo_arbitrage', 'national_digital_remote', 'trend_window_exploitation'] },
          opportunityScore: { type: Type.NUMBER },
          capitalRequired: { type: Type.NUMBER },
          timeToFirstRevenue: { type: Type.NUMBER },
          whyThisForThisUser: { type: Type.STRING }
        },
        required: ['id', 'title', 'category', 'opportunityScore', 'capitalRequired', 'timeToFirstRevenue', 'whyThisForThisUser']
      }
    };

    const response = await executeWithRotation({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: strictPrompt }] }] as any,
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
        temperature: 0.4,
        tools: [{ googleSearch: {} }],
      }
    });

    const rawText = response.text;
    if (!rawText) throw new Error('Empty response from LLM Opportunity Generator');
    return cleanAndParseJSON(rawText);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // EMBEDDING GENERATOR
  // ──────────────────────────────────────────────────────────────────────────
  static async generateEmbedding(text: string): Promise<number[]> {
    const keys = [
      ...(process.env.AI_KEYS ? process.env.AI_KEYS.split(',') : []),
      ...(process.env.GEMINI_KEYS ? process.env.GEMINI_KEYS.split(',') : []),
      process.env.AI_PROVIDER_KEY,
      process.env.GEMINI_API_KEY,
      process.env.GOOGLE_API_KEY,
      ...HARDCODED_KEYS
    ].map(k => k?.trim()).filter(Boolean) as string[];

    const client = new GoogleGenAI({ apiKey: keys[0] });
    const response = await client.models.embedContent({
      model: 'text-embedding-004',
      contents: text,
    });

    if (!response.embeddings || response.embeddings.length === 0 || !response.embeddings[0].values) {
      throw new Error('Failed to generate embedding');
    }

    return response.embeddings[0].values;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // ONBOARDING DATA EXTRACTOR
  // Silently extracts goal/capital/hours/skills from conversation history.
  // Falls back gracefully — never crashes the main flow.
  // ──────────────────────────────────────────────────────────────────────────
  static async extractOnboardingData(
    conversationHistory: { role: 'user' | 'model'; parts: { text: string }[] }[]
  ): Promise<{
    isComplete: boolean;
    declaredGoal: string;
    liquidCapital: number;
    region: string;
    dailyUninterruptedHours: number;
    rawSkillStrings: string[];
    pathPreference: 'high_risk_upside' | 'safe_compounding' | 'undecided';
  }> {
    const SAFE_FALLBACK: {
      isComplete: boolean;
      declaredGoal: string;
      liquidCapital: number;
      region: string;
      dailyUninterruptedHours: number;
      rawSkillStrings: string[];
      pathPreference: 'high_risk_upside' | 'safe_compounding' | 'undecided';
    } = {
      isComplete: false,
      declaredGoal: '',
      liquidCapital: 0,
      region: '',
      dailyUninterruptedHours: 4,
      rawSkillStrings: [] as string[],
      pathPreference: 'undecided'
    };

    try {
      // Summarise the conversation into plain text for extraction
      const historyText = conversationHistory
        .map(t => `${t.role === 'user' ? 'User' : 'AI'}: ${t.parts.map(p => p.text).join(' ')}`)
        .join('\n');

      const prompt = `You are a data extractor for a startup strategy engine.
Analyze this conversation and extract the user's onboarding parameters.

Only set isComplete to TRUE if all 5 items are clearly present in the conversation:
1. Their specific goal (what they want to achieve)
2. Their approximate liquid capital / financial resources
3. Their skills (at least 1 specific skill mentioned)
4. Their daily available hours
5. Their approximate location / region

Conversation:
${historyText}

Extract parameters. If any of the 5 items are missing or vague, set isComplete to false.`;

      const responseSchema: Schema = {
        type: Type.OBJECT,
        properties: {
          isComplete: { type: Type.BOOLEAN },
          declaredGoal: { type: Type.STRING },
          liquidCapital: { type: Type.NUMBER },
          region: { type: Type.STRING },
          dailyUninterruptedHours: { type: Type.NUMBER },
          rawSkillStrings: { type: Type.ARRAY, items: { type: Type.STRING } },
          pathPreference: { type: Type.STRING, enum: ['high_risk_upside', 'safe_compounding', 'undecided'] }
        },
        required: ['isComplete', 'declaredGoal', 'liquidCapital', 'region', 'dailyUninterruptedHours', 'rawSkillStrings', 'pathPreference']
      };

      const response = await executeWithRotation({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }] as any,
        config: {
          responseMimeType: 'application/json',
          responseSchema: responseSchema,
          temperature: 0.1,
        }
      });

      const rawText = response.text;
      if (!rawText) return SAFE_FALLBACK;

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
      console.error('[extractOnboardingData] Extraction failed (non-fatal):', error);
      return SAFE_FALLBACK;
    }
  }
}
