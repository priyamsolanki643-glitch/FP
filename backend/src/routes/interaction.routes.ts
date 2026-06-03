import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { processOnboarding, processCritiqueMessage, processTaskUpdate, processUnlockRequest } from '../engine/index';
import { LLMService } from '../services/llm.service';

export const interactionRoutes = new Hono();

const messageSchema = z.object({
  user_id: z.string().uuid().optional(),
  message: z.string(),
  // For simplicity, passing full runtime state from the frontend in this iteration.
  // In a real production app, this would be fetched from Redis/Postgres using user_id.
  state_context: z.any().optional(),
  action: z.enum(['onboarding', 'task_update', 'critique', 'unlock']).default('onboarding')
});

interactionRoutes.post('/message', zValidator('json', messageSchema), async (c) => {
  const { user_id, message, state_context, action } = c.req.valid('json');

  try {
    let result: any;
    let systemPrompt = '';

    if (action === 'onboarding') {
      // Create a mock onboarding input for now, relying on message and state
      const mockInput = {
        userId: user_id || 'test-user',
        geographyTier: 'tier2_city' as const,
        country: 'US',
        region: 'NA',
        liquidCapital: 1000,
        monthlyBurnRate: 500,
        hasDebt: false,
        debtMonthlyObligation: 0,
        familyDependencyScore: 1.0,
        rawSkillStrings: ['typescript', 'react'],
        hasVerifiableOutputMap: { 'typescript': true },
        positiveCommSignals: ['clear'],
        negativeCommSignals: [] as string[],
        dailyUninterruptedHours: 4,
        deviceTier: 'mid_range' as const,
        internetStability: '4g_stable' as const,
        workEnvironment: 'dedicated_quiet' as const,
        canWorkAtNight: true,
        hasDedicatedWorkspace: true,
        procrastinationSignals: {} as any,
        cognitiveEnduranceMinutes: 120,
        emotionalResilience: 0.8,
        baselineDiscipline: 0.7,
        preferredWorkStyle: 'deep_work_clusters' as const,
        riskTolerance: 0.5,
        declaredGoal: 'Build an AI app',
        targetAmount: 10000,
        currency: 'USD' as const,
        timelineMonths: 6,
        sacrificesToleratedList: ['sleep'] as any[],
        nonNegotiables: ['health'],
        pathPreference: 'high_risk_upside' as const,
        onboardingText: message,
        detectedFrictionSignalIds: [] as string[]
      };

      const onboardingResult = await processOnboarding(mockInput);
      systemPrompt = onboardingResult.systemPrompt;
      result = { type: 'onboarding_complete', data: onboardingResult };
    } else if (action === 'critique') {
      const critiqueResult = processCritiqueMessage({
        userId: user_id || 'test-user',
        userRuntime: state_context,
        userMessage: message,
        tasksCompletedToDate: 5,
        tasksAttemptedToDate: 5,
        consecutiveFailureCount: 0
      });
      systemPrompt = critiqueResult.systemPrompt;
      result = { type: 'critique_response', data: critiqueResult };
    }
    
    // Call LLM with the generated system prompt from the engine
    let llmResponse = { response_text: "System prompt generated, awaiting LLM..." };
    if (systemPrompt) {
        llmResponse = await LLMService.generateValidatedResponse(user_id || 'test-user', systemPrompt, []);
    }

    return c.json({
      status: 'success',
      data: {
        engine_result: result,
        ai_response: llmResponse
      }
    });

  } catch (error: any) {
    console.error('Interaction Error:', error);
    return c.json({ error: error.message }, 500);
  }
});
