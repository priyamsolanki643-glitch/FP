import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { processOnboarding, processCritiqueMessage, processTaskUpdate } from '../engine/index';
import { updateConsistencyScore } from '../engine/layer10_statelock';
import { LLMService } from '../services/llm.service';
import { DbService } from '../services/db.service';

export const interactionRoutes = new Hono();

const messageSchema = z.object({
  user_id: z.string().optional(),
  message: z.string(),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'model']),
    parts: z.array(z.object({ text: z.string() }))
  })).optional().default([]),
  state_context: z.any().optional(),
  action: z.enum(['onboarding', 'task_update', 'critique', 'unlock']).default('onboarding')
});

// Primary chat/onboarding interaction message handler
interactionRoutes.post('/message', zValidator('json', messageSchema), async (c) => {
  const { user_id, message, conversationHistory, state_context, action } = c.req.valid('json');
  const actualUserId = user_id || 'test-user';

  try {
    let result: any;
    let systemPrompt = '';
    
    // Check if user already has locked mission trajectory in DB
    const activeMission = await DbService.getActiveMission(actualUserId);

    if (activeMission) {
      console.log(`MESSAGE: Found active locked mission for ${actualUserId}. Running execution/critique mode.`);
      
      // 1. Detect if the message is logging a task outcome in chat
      const classification = await LLMService.classifyMessageOutcome(message);
      
      if (classification === 'completed' || classification === 'failed') {
        console.log(`MESSAGE: Detected task outcome in chat message -> ${classification}. Updating database.`);
        const scoreEvent = classification === 'completed' ? 'task_completed' : 'task_failed';
        const { newScore } = updateConsistencyScore(activeMission.consistencyScore, scoreEvent);
        
        let newStreak = activeMission.streakDays;
        if (classification === 'completed') {
          newStreak += 1;
        } else {
          newStreak = 0;
        }

        const updatedMission = {
          ...activeMission,
          consistencyScore: newScore,
          streakDays: newStreak,
          dayNumber: Math.min(activeMission.totalDays, activeMission.dayNumber + 1)
        };

        await DbService.saveMission(updatedMission);
        await DbService.addConsistencyLog(actualUserId, newScore);
      }

      // 2. Fetch updated mission details for the critique prompt
      const latestMission = await DbService.getActiveMission(actualUserId);
      const critiqueResult = processCritiqueMessage({
        userId: actualUserId,
        userRuntime: state_context || {},
        userMessage: message,
        tasksCompletedToDate: latestMission.dayNumber,
        tasksAttemptedToDate: latestMission.dayNumber,
        consecutiveFailureCount: latestMission.streakDays === 0 ? 1 : 0
      });

      systemPrompt = critiqueResult.systemPrompt;
      result = { type: 'critique_response', data: critiqueResult };
    } else {
      // Run the initial onboarding intake sequence
      console.log(`MESSAGE: No active mission. Running onboarding simulation engine.`);
      
      const mockInput = {
        userId: actualUserId,
        geographyTier: 'tier2_city' as const,
        country: 'IN',
        region: 'Uttar Pradesh',
        liquidCapital: 15000,
        monthlyBurnRate: 5000,
        hasDebt: false,
        debtMonthlyObligation: 0,
        familyDependencyScore: 1.0,
        rawSkillStrings: ['typescript', 'react', 'no-code-automation'],
        hasVerifiableOutputMap: { 'typescript': true },
        positiveCommSignals: ['clear', 'proactive'],
        negativeCommSignals: [] as string[],
        dailyUninterruptedHours: 4,
        deviceTier: 'mid_range' as const,
        internetStability: '4g_stable' as const,
        workEnvironment: 'dedicated_quiet' as const,
        canWorkAtNight: true,
        hasDedicatedWorkspace: true,
        procrastinationSignals: {
          tookLongBetweenAnswers: false,
          setOptimisticDeadlines: false,
          gavelVagueGoalsNotSpecific: false,
          mentionedPastFailedAttempts: false,
          usedPassiveLanguage: false,
          conflatedPlanningWithExecution: false
        },
        cognitiveEnduranceMinutes: 120,
        emotionalResilience: 0.8,
        baselineDiscipline: 0.7,
        preferredWorkStyle: 'deep_work_clusters' as const,
        riskTolerance: 0.5,
        declaredGoal: message, // Treat user input as goal
        targetAmount: 50000,
        currency: 'INR' as const,
        timelineMonths: 3,
        sacrificesToleratedList: ['sleep', 'entertainment'],
        nonNegotiables: ['health'],
        pathPreference: 'high_risk_upside' as const,
        onboardingText: message,
        detectedFrictionSignalIds: [] as string[]
      };

      const onboardingResult = await processOnboarding(mockInput);
      systemPrompt = onboardingResult.systemPrompt;
      result = { type: 'onboarding_complete', data: onboardingResult };
    }

    // Call LLM with the generated system prompt from the engine
    let llmResponse = { response_text: "System prompt generated, awaiting LLM..." };
    if (systemPrompt) {
      llmResponse = await LLMService.generateValidatedResponse(actualUserId, systemPrompt, conversationHistory, []);
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

// Endpoint to fetch current user's active locked mission
interactionRoutes.get('/active-mission', async (c) => {
  const userId = c.req.query('userId') || 'test-user';
  const mission = await DbService.getActiveMission(userId);
  if (!mission) {
    return c.json({ status: 'success', data: null });
  }

  // Calculate debt days
  const history = await DbService.getConsistencyHistory(userId);
  let debtDays = 0;
  if (history.length > 0) {
    const lastLog = history[history.length - 1];
    const lastDate = new Date(lastLog.logged_date + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = today.getTime() - lastDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    debtDays = Math.max(0, diffDays); // consecutive days since last log
  }

  const daysToGoal = Math.max(0, mission.totalDays - mission.dayNumber);

  return c.json({
    status: 'success',
    data: {
      ...mission,
      debtDays,
      daysToGoal
    }
  });
});

// Endpoint to lock strategy trajectory when onboarding completes
interactionRoutes.post('/lock-trajectory', async (c) => {
  try {
    const {
      userId,
      missionName,
      lockedPath,
      probabilityLow,
      probabilityHigh,
      totalDays,
      mindsetBrief,
      strategyContent,
      chatThreadId
    } = await c.req.json();
    
    const actualUserId = userId || 'test-user';
    
    const mission = {
      user_id: actualUserId,
      missionName: missionName || 'SaaS Trajectory Lock',
      lockedPath: lockedPath || 'alpha',
      probabilityLow: probabilityLow || 18.4,
      probabilityHigh: probabilityHigh || 24.0,
      dayNumber: 1,
      totalDays: totalDays || 90,
      consistencyScore: 100,
      streakDays: 0,
      mindsetBrief: mindsetBrief || 'Tu average nahi hai. Execute kar.',
      strategyContent: strategyContent || 'Phase 1: Foundation lock (Day 1-30).',
      chatThreadId: chatThreadId || 'thread-' + Date.now()
    };
    
    const savedMission = await DbService.saveMission(mission);
    await DbService.addConsistencyLog(actualUserId, 100);

    // Asynchronously generate initial market report on locking
    const mandate = `
═══════════════════════════════════════════════════════════════
FP-OS INTELLIGENCE RESEARCH MANDATE
User Profile: ${actualUserId}
Generated: ${new Date().toISOString()}
═══════════════════════════════════════════════════════════════
Active Mission: ${mission.missionName}
Locked Path: ${mission.lockedPath}
Total Days: ${mission.totalDays}

MANDATE:
Analyze real-time market opportunities, local gaps, competitor landscape, and timing signals for the target: "${mission.missionName}" using the ${mission.lockedPath} path.
Provide hyper-local data for Kanpur, Uttar Pradesh, India if applicable, or general metrics for remote work.
Ensure the returned JSON perfectly adheres to the MarketIntelligenceReport interface.
    `.trim();

    LLMService.generateGroundedIntelligenceReport(mandate)
      .then(async (groundedData) => {
        await DbService.saveMarketReport(actualUserId, groundedData);
        console.log('MARKET_REPORT: Generated and saved initial grounded report on lock.');
      })
      .catch((err) => {
        console.error('MARKET_REPORT: Initial generation failed on lock:', err);
      });

    return c.json({ status: 'success', data: savedMission });
  } catch (error: any) {
    console.error('Lock Trajectory Error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Endpoint to log task completion/failure via button click
interactionRoutes.post('/log-task', async (c) => {
  try {
    const { userId, outcome } = await c.req.json();
    const actualUserId = userId || 'test-user';

    const activeMission = await DbService.getActiveMission(actualUserId);
    if (!activeMission) {
      return c.json({ error: 'No active mission found' }, 404);
    }

    const scoreEvent = outcome === 'completed' ? 'task_completed' : 'task_failed';
    const { newScore } = updateConsistencyScore(activeMission.consistencyScore, scoreEvent);

    let newStreak = activeMission.streakDays;
    if (outcome === 'completed') {
      newStreak += 1;
    } else {
      newStreak = 0;
    }

    const updatedMission = {
      ...activeMission,
      consistencyScore: newScore,
      streakDays: newStreak,
      dayNumber: Math.min(activeMission.totalDays, activeMission.dayNumber + 1)
    };

    await DbService.saveMission(updatedMission);
    await DbService.addConsistencyLog(actualUserId, newScore);

    return c.json({ status: 'success', data: updatedMission });
  } catch (error: any) {
    console.error('Log Task Error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Endpoint to fetch consistency log and AI strengths/bottlenecks for Reality Mirror
interactionRoutes.get('/reality-mirror', async (c) => {
  const userId = c.req.query('userId') || 'test-user';
  
  const activeMission = await DbService.getActiveMission(userId);
  if (!activeMission) {
    return c.json({ status: 'success', data: null });
  }

  const history = await DbService.getConsistencyHistory(userId);
  const scores = history.map(h => h.score);

  let trend: 'up' | 'down' = 'up';
  if (scores.length >= 2) {
    const mid = Math.floor(scores.length / 2);
    const firstHalfAvg = scores.slice(0, mid).reduce((a, b) => a + b, 0) / mid;
    const secondHalfAvg = scores.slice(mid).reduce((a, b) => a + b, 0) / (scores.length - mid);
    trend = secondHalfAvg >= firstHalfAvg ? 'up' : 'down';
  }

  let insightData = {
    strengths: [
      "Technical velocity is strong: stack expertise confirmed",
      "Liquid capital runway: stable status band",
      "Goal intent: high clarity on milestone metrics",
      "System parameters alignment: steady starting discipline"
    ],
    bottlenecks: [
      "Complexity trigger: likely to stall on integration gaps",
      "Execution environment: suboptimal setup for focus",
      "Consistency decay: vulnerable to weekend drifts",
      "Outreach loop delay: cold feedback cycles"
    ],
    insight: `Tu active mode ke paas hai. Score: ${activeMission.consistencyScore}/100. Teri technical setup ready hai. Daily execution check points log karna shuru kar. Bhai rukna mat.`
  };

  try {
    const prompt = `Analyze this user's active trajectory and current progress.
Active Mission Name: "${activeMission.missionName}"
Locked Path: "${activeMission.lockedPath}"
Current Day Number: ${activeMission.dayNumber} of ${activeMission.totalDays}
Consistency Score: ${activeMission.consistencyScore}/100
Streak Days: ${activeMission.streakDays}
Current Trend Direction: ${trend}

Generate:
1. 4 specific Strengths (in Hinglish/English, matching their execution style)
2. 4 specific Bottlenecks (in Hinglish/English, highlighting potential triggers like laziness, distraction)
3. A behavioral insight paragraph in friendly Hinglish (supportive, motivational but honest).

You must respond in ONLY JSON format conforming to this interface:
{
  "strengths": string[],
  "bottlenecks": string[],
  "insight": string
}
Do not include markdown or backticks.`;

    const response = await LLMService.generateValidatedResponse(userId, prompt, [], []);
    if (response && response.response_text) {
      try {
        const parsed = JSON.parse(response.response_text);
        if (parsed.strengths && parsed.bottlenecks) {
          insightData = parsed;
        }
      } catch {}
    } else if (response && response.strengths && response.bottlenecks) {
      insightData = response;
    }
  } catch (err) {
    console.error('REALITY_MIRROR: Insight LLM fail, using fallback:', err);
  }

  return c.json({
    status: 'success',
    data: {
      history: scores.length > 0 ? scores : [activeMission.consistencyScore],
      trend,
      strengths: insightData.strengths,
      bottlenecks: insightData.bottlenecks,
      insight: insightData.insight
    }
  });
});

// Endpoint to fetch and cache dynamic market reports
interactionRoutes.get('/market-report', async (c) => {
  const userId = c.req.query('userId') || 'test-user';
  
  let report = await DbService.getMarketReport(userId);
  
  let needsRefresh = false;
  if (!report) {
    needsRefresh = true;
  } else {
    const ageMs = Date.now() - new Date(report.created_at).getTime();
    const hours = ageMs / (1000 * 60 * 60);
    if (hours >= 24) {
      needsRefresh = true;
    }
  }
  
  if (needsRefresh) {
    console.log('MARKET_REPORT: Refreshing report data...');
    const activeMission = await DbService.getActiveMission(userId);
    if (activeMission) {
      const mandate = `
═══════════════════════════════════════════════════════════════
FP-OS INTELLIGENCE RESEARCH MANDATE
User Profile: ${userId}
Generated: ${new Date().toISOString()}
═══════════════════════════════════════════════════════════════
CONTEXT:
Active Mission: ${activeMission.missionName}
Locked Path: ${activeMission.lockedPath}
Total Days: ${activeMission.totalDays}

MANDATE:
Analyze real-time market opportunities, local gaps, competitor landscape, and timing signals for the target: "${activeMission.missionName}" using the ${activeMission.lockedPath} path.
Provide hyper-local data for Kanpur, Uttar Pradesh, India if applicable, or general metrics for remote work.
Ensure the returned JSON perfectly adheres to the MarketIntelligenceReport interface.
      `.trim();
      
      try {
        const groundedData = await LLMService.generateGroundedIntelligenceReport(mandate);
        report = await DbService.saveMarketReport(userId, groundedData);
      } catch (err) {
        console.error('MARKET_REPORT: Failed to generate new report, using stale:', err);
      }
    }
  }
  
  return c.json({
    status: 'success',
    data: report ? report.report_data : null
  });
});

// Endpoint to fetch aggregated anonymous stats for Rival Index
interactionRoutes.get('/rival-index', async (c) => {
  const userId = c.req.query('userId') || 'test-user';
  const activeMission = await DbService.getActiveMission(userId);
  
  if (!activeMission) {
    return c.json({ status: 'success', data: null });
  }
  
  const stats = await DbService.getRivalIndexStats(userId, activeMission.missionName);
  return c.json({
    status: 'success',
    data: {
      totalUsers: stats.totalUsers,
      milestonePassedUsers: stats.milestonePassedUsers,
      category: activeMission.missionName
    }
  });
});
