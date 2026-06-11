import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import {
  processOnboarding,
  processCritiqueMessage,
  processTaskUpdate,
  runCircumstantialDiagnosis,
  runTacticalArchitect,
  processOperatorTaskUpdate,
  processOperatorCritique,
  generateDailyTaskSprint,
  buildFullSystemPrompt,
  transitionToExecution
} from '../engine/index';
import { updateConsistencyScore } from '../engine/layer10_statelock';
import { runLegalAudit } from '../engine/layer13_legalaudit';
import { LLMService } from '../services/llm.service';

function getAIErrorMessage(err: any): string {
  if (!err) return 'Unknown AI error';
  return (
    err?.message ||
    err?.error?.message ||
    err?.cause?.message ||
    JSON.stringify(err)
  );
}

function isQuotaStyleError(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes('quota exceeded') ||
    m.includes('resource_exhausted') ||
    m.includes('429') ||
    m.includes('rate limit') ||
    m.includes('too many requests')
  );
}

function isRetryableAIError(message: string): boolean {
  const m = message.toLowerCase();
  return (
    isQuotaStyleError(m) ||
    m.includes('503') ||
    m.includes('overloaded') ||
    m.includes('unavailable') ||
    m.includes('internal error') ||
    m.includes('deadline exceeded') ||
    m.includes('timeout') ||
    m.includes('timed out') ||
    m.includes('socket hang up') ||
    m.includes('econnreset')
  );
}

function toUserSafeAIText(err: any): string {
  const message = getAIErrorMessage(err).toLowerCase();

  if (isQuotaStyleError(message)) {
    return 'AI is busy right now. Please retry in about a minute.';
  }

  if (isRetryableAIError(message)) {
    return 'Temporary AI issue on the backend. Please retry in a moment.';
  }

  return 'Something went wrong while generating the reply. Please try again.';
}
import { DbService } from '../services/db.service';
import { VectorService } from '../services/vector.service';
import { requireAuth } from '../middleware/auth.middleware';

export const interactionRoutes = new Hono<{ Variables: { userId: string } }>();

// Enforce Zero-Trust auth globally on all interaction endpoints
interactionRoutes.use('*', requireAuth);

const messageSchema = z.object({
  user_id: z.string().optional(),
  message: z.string(),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'model']),
    parts: z.array(z.object({ text: z.string() }))
  })).optional().default([]),
  state_context: z.any().optional(),
  action: z.enum(['onboarding', 'task_update', 'critique', 'unlock']).default('onboarding'),
  thread_id: z.string().nullable().optional(),
  model: z.string().optional()
});

// Primary chat/onboarding interaction message handler
interactionRoutes.post('/message', zValidator('json', messageSchema), async (c) => {
  const { user_id, message, conversationHistory, state_context, action, thread_id, model } = c.req.valid('json');
  const actualUserId = c.get('userId');

  if (!actualUserId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    let currentThreadId = thread_id;
    if (!currentThreadId) {
      let title = "New Conversation";
      try {
        const titlePrompt = `Summarize the following message into a concise 2-4 word topic or context suitable for a chat sidebar menu. Output ONLY the short title string and nothing else.\n\nMessage: "${message}"`;
        // Quick background-priority generation to prevent hanging
        const titleRes = await LLMService.generateValidatedResponse(actualUserId, titlePrompt, [], [], 1, 1000, true);
        if (titleRes && titleRes.response_text) {
          title = titleRes.response_text.trim().replace(/^["']|["']$/g, '');
        }
      } catch (err) {
        title = message.substring(0, 40) + (message.length > 40 ? '...' : '');
      }
      const newThread = await DbService.createChatThread(actualUserId, title);
      currentThreadId = newThread.id;
    }

    // Save user message
    await DbService.saveMessage(currentThreadId, actualUserId, 'user', message);

    let result: any;
    let systemPrompt = '';
    let isTransitioningToExecution = false;
    
    // Check if user already has locked mission trajectory in DB
    let activeMission = await DbService.getActiveMission(actualUserId);

    if (activeMission) {
      console.log(`MESSAGE: Found active locked mission for ${actualUserId}. Running execution/critique mode.`);
      
      const critiqueResult = processCritiqueMessage({
        userId: actualUserId,
        userRuntime: state_context || {},
        userMessage: message,
        tasksCompletedToDate: activeMission.dayNumber,
        tasksAttemptedToDate: activeMission.dayNumber,
        consecutiveFailureCount: activeMission.streakDays === 0 ? 1 : 0
      });

      systemPrompt = critiqueResult.systemPrompt;
      result = { type: 'critique_response', data: critiqueResult };
    } else {
      // User has no active mission. Let's see if onboarding is complete!
      const currentHistory = [...conversationHistory, { role: 'user', parts: [{ text: message }] }] as any;
      let extraction;
      try {
        extraction = await LLMService.extractOnboardingData(currentHistory);
      } catch (err: any) {
        console.error('ONBOARDING_EXTRACTION_ERROR:', getAIErrorMessage(err));

        return c.json(
          {
            status: 'success',
            data: {
              engine_result: { type: 'chat_response', data: {} },
              ai_response: {
                response_text: toUserSafeAIText(err)
              }
            }
          },
          200
        );
      }
      
      if (extraction.isComplete) {
        // Onboarding parameters are complete!
        // Check if user is choosing Alpha or Beta
        const msgClean = message.toLowerCase().trim();
        const isAlphaChoice = /\b(alpha|path\s*1|option\s*a|1|a)\b/i.test(msgClean);
        const isBetaChoice = /\b(beta|path\s*2|option\s*b|2|b)\b/i.test(msgClean);
        
        if (isAlphaChoice || isBetaChoice) {
          const chosenPath = isAlphaChoice ? 'alpha' : 'beta';
          console.log(`MESSAGE: User selected path '${chosenPath}'. Locking trajectory in chat.`);
          
          const geoLower = (extraction.region || '').toLowerCase();
          let geographyTier: 'tier1_city' | 'tier2_city' | 'tier3_city' = 'tier2_city';
          if (geoLower.match(/delhi|mumbai|bangalore|bengaluru|kolkata|chennai|hyderabad|pune/)) geographyTier = 'tier1_city';
          else if (geoLower.match(/kanpur|lucknow|jaipur|patna|indore|bhopal|nagpur|agra/)) geographyTier = 'tier2_city';
          else geographyTier = 'tier3_city';

          const onboardingInput = {
            userId: actualUserId,
            geographyTier: geographyTier as any,
            country: geoLower.includes("india") ? "IN" : "US",
            region: extraction.region || 'Unknown',
            liquidCapital: extraction.liquidCapital || 5000,
            monthlyBurnRate: Math.max(3000, Math.floor((extraction.liquidCapital || 5000) / 4)),
            hasDebt: false,
            debtMonthlyObligation: 0,
            familyDependencyScore: 1.0,
            rawSkillStrings: extraction.rawSkillStrings && extraction.rawSkillStrings.length > 0 ? extraction.rawSkillStrings : ["general"],
            hasVerifiableOutputMap: {} as Record<string, boolean>,
            positiveCommSignals: ["clear"] as string[],
            negativeCommSignals: [] as string[],
            dailyUninterruptedHours: extraction.dailyUninterruptedHours || 4,
            deviceTier: "mid_range" as const,
            internetStability: "4g_stable" as const,
            workEnvironment: "dedicated_quiet" as const,
            canWorkAtNight: true,
            hasDedicatedWorkspace: true,
            procrastinationSignals: {
              tookLongBetweenAnswers: false, setOptimisticDeadlines: false, gavelVagueGoalsNotSpecific: false, mentionedPastFailedAttempts: false, usedPassiveLanguage: false, conflatedPlanningWithExecution: false
            },
            cognitiveEnduranceMinutes: 120,
            emotionalResilience: 0.8,
            baselineDiscipline: 0.7,
            preferredWorkStyle: "deep_work_clusters" as const,
            riskTolerance: 0.6,
            declaredGoal: extraction.declaredGoal,
            targetAmount: (extraction.liquidCapital || 5000) * 2,
            currency: "INR" as const,
            timelineMonths: 3,
            sacrificesToleratedList: ["sleep"] as string[],
            nonNegotiables: [] as string[],
            pathPreference: chosenPath === 'alpha' ? 'high_risk_upside' as const : 'safe_compounding' as const,
            onboardingText: `Goal: ${extraction.declaredGoal}. Capital: ${extraction.liquidCapital}. Hours: ${extraction.dailyUninterruptedHours}. Geo: ${extraction.region}`,
            detectedFrictionSignalIds: [] as string[]
          };

          const simulationData = await processOnboarding(onboardingInput);
          const executionResult = await transitionToExecution(simulationData.userRuntime, chosenPath);
          
          const targetPath = chosenPath === 'alpha' ? simulationData.pathPresentation.pathAlpha : simulationData.pathPresentation.pathBeta;
          const missionPayload = {
            user_id: actualUserId,
            missionName: targetPath?.opportunityUsed || (chosenPath === 'alpha' ? "Asymmetric Upside Strategy" : "Compounding Strategy"),
            lockedPath: chosenPath,
            probabilityLow: targetPath?.probabilityRangeLow || (chosenPath === 'alpha' ? 18.4 : 74.2),
            probabilityHigh: targetPath?.probabilityRangeHigh || (chosenPath === 'alpha' ? 24.0 : 82.5),
            dayNumber: 1,
            totalDays: (targetPath?.timelineMonths || 3) * 30,
            consistencyScore: 100,
            streakDays: 0,
            mindsetBrief: targetPath?.firstStepToday || "Start executing immediate discovery steps.",
            strategyContent: targetPath?.description || "Compounding action vector.",
            chatThreadId: currentThreadId
          };

          await DbService.saveMission(missionPayload);
          await DbService.addConsistencyLog(actualUserId, 100);
          
          activeMission = await DbService.getActiveMission(actualUserId);
          isTransitioningToExecution = true;

          // Asynchronously generate initial market report on locking
          const mandate = `
═══════════════════════════════════════════════════════════════
FP-OS INTELLIGENCE RESEARCH MANDATE
User Profile: ${actualUserId}
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
          
          LLMService.generateGroundedIntelligenceReport(mandate).then(async (groundedData) => {
            await DbService.saveMarketReport(actualUserId, groundedData);
          }).catch(err => console.error('MARKET_REPORT: Initial generation failed on chat lock:', err));

          systemPrompt = buildFullSystemPrompt('execution', executionResult.updatedRuntime);
          result = { type: 'trajectory_locked', data: executionResult };
        } else {
          // Onboarding complete, but user hasn't made a choice yet. Present simulated paths.
          const geoLower = (extraction.region || '').toLowerCase();
          let geographyTier: 'tier1_city' | 'tier2_city' | 'tier3_city' = 'tier2_city';
          if (geoLower.match(/delhi|mumbai|bangalore|bengaluru|kolkata|chennai|hyderabad|pune/)) geographyTier = 'tier1_city';
          else if (geoLower.match(/kanpur|lucknow|jaipur|patna|indore|bhopal|nagpur|agra/)) geographyTier = 'tier2_city';
          else geographyTier = 'tier3_city';

          const onboardingInput = {
            userId: actualUserId,
            geographyTier: geographyTier as any,
            country: geoLower.includes("india") ? "IN" : "US",
            region: extraction.region || 'Unknown',
            liquidCapital: extraction.liquidCapital || 5000,
            monthlyBurnRate: Math.max(3000, Math.floor((extraction.liquidCapital || 5000) / 4)),
            hasDebt: false,
            debtMonthlyObligation: 0,
            familyDependencyScore: 1.0,
            rawSkillStrings: extraction.rawSkillStrings && extraction.rawSkillStrings.length > 0 ? extraction.rawSkillStrings : ["general"],
            hasVerifiableOutputMap: {} as Record<string, boolean>,
            positiveCommSignals: ["clear"] as string[],
            negativeCommSignals: [] as string[],
            dailyUninterruptedHours: extraction.dailyUninterruptedHours || 4,
            deviceTier: "mid_range" as const,
            internetStability: "4g_stable" as const,
            workEnvironment: "dedicated_quiet" as const,
            canWorkAtNight: true,
            hasDedicatedWorkspace: true,
            procrastinationSignals: {
              tookLongBetweenAnswers: false, setOptimisticDeadlines: false, gavelVagueGoalsNotSpecific: false, mentionedPastFailedAttempts: false, usedPassiveLanguage: false, conflatedPlanningWithExecution: false
            },
            cognitiveEnduranceMinutes: 120,
            emotionalResilience: 0.8,
            baselineDiscipline: 0.7,
            preferredWorkStyle: "deep_work_clusters" as const,
            riskTolerance: 0.6,
            declaredGoal: extraction.declaredGoal,
            targetAmount: (extraction.liquidCapital || 5000) * 2,
            currency: "INR" as const,
            timelineMonths: 3,
            sacrificesToleratedList: ["sleep"] as string[],
            nonNegotiables: [] as string[],
            pathPreference: extraction.pathPreference,
            onboardingText: `Goal: ${extraction.declaredGoal}. Capital: ${extraction.liquidCapital}. Hours: ${extraction.dailyUninterruptedHours}. Geo: ${extraction.region}`,
            detectedFrictionSignalIds: [] as string[]
          };

          const simulationData = await processOnboarding(onboardingInput);
          systemPrompt = buildFullSystemPrompt('simulation', simulationData.userRuntime);
          result = { type: 'onboarding_complete', data: simulationData };
        }
      } else {
        // Onboarding is incomplete. Normal onboarding chat prompt.
        systemPrompt = buildFullSystemPrompt('onboarding', {});
        result = { type: 'chat_response', data: {} };
      }
    }

    // Call LLM with the generated system prompt from the engine
    let llmResponse = { response_text: "System prompt generated, awaiting LLM..." };
    if (systemPrompt) {
      const enrichedPrompt = systemPrompt + "\n\n" + 
        (activeMission ? "If user explicitly logs a task completion/failure, set task_classification to 'completed' or 'failed'. **EXECUTION MIRROR LINGUISTIC RADAR**: At the end of your response, casually ask a 1-sentence question about their current execution/mission activity today. Analyze their incoming message text for hesitation words ('but', 'maybe', 'try') or abnormally short sentence length to detect early dropout risk signals (avoidance/stress)." : "Extract any onboarding constraints to build context, or prompt user to lock either Option A (Alpha) or Option B (Beta).");
      
      let smartResponse;
      try {
        smartResponse = await LLMService.generateSmartResponse(
          actualUserId,
          enrichedPrompt,
          [...conversationHistory, { role: 'user', parts: [{ text: message }] }] as any,
          !activeMission,
          model
        );
      } catch (err: any) {
        console.error('SMART_RESPONSE_ERROR:', getAIErrorMessage(err));

        const safeText = toUserSafeAIText(err);

        await DbService.saveMessage(currentThreadId, actualUserId, 'fp', safeText);

        return c.json(
          {
            status: 'success',
            data: {
              engine_result: result,
              ai_response: {
                response_text: safeText
              }
            }
          },
          200
        );
      }

      llmResponse.response_text = smartResponse.response_text;

      // 1. Handle Task Outcome Logging
      if (activeMission && !isTransitioningToExecution && smartResponse.task_classification && smartResponse.task_classification !== 'none') {
        const classification = smartResponse.task_classification;
        console.log(`MESSAGE: Detected task outcome -> ${classification}. Updating database.`);
        const scoreEvent = classification === 'completed' ? 'task_completed' : 'task_failed';
        const { newScore } = updateConsistencyScore(activeMission.consistencyScore, scoreEvent);
        
        let newStreak = activeMission.streakDays;
        if (classification === 'completed') newStreak += 1;
        else newStreak = 0;

        const updatedMission = {
          ...activeMission,
          consistencyScore: newScore,
          streakDays: newStreak,
          dayNumber: Math.min(activeMission.totalDays, activeMission.dayNumber + 1)
        };

        await DbService.saveMission(updatedMission);
        await DbService.addConsistencyLog(actualUserId, newScore);
      }

      // Layer 13: Critique/Message LLM Output Audit Interceptor & Disclaimer Appendage
      if (activeMission && state_context && state_context.contextMatrix) {
        const auditReport = runLegalAudit(
          state_context.contextMatrix,
          state_context.availablePaths || [],
          state_context.ambitionAssessment || { probabilityOfDeclaredGoal: 50 },
          activeMission.streakDays === 0 ? 1 : 0,
          activeMission.consistencyScore,
          llmResponse.response_text
        );

        if (!auditReport.passedLegalGate) {
          console.warn(`LEGAL_AUDIT: Critique response blocked due to compliance violation.`);
          return c.json({
            status: 'success',
            data: {
              engine_result: result,
              ai_response: {
                response_text: auditReport.requiredDisclaimers.join('\n\n') || "Response blocked due to legal compliance checks."
              }
            }
          });
        }

        if (auditReport.requiredDisclaimers && auditReport.requiredDisclaimers.length > 0) {
          llmResponse.response_text += "\n\n---\n*Disclaimer: " + auditReport.requiredDisclaimers.join(' | ') + "*";
        }
      }
    }

    // Save AI response
    if (llmResponse && llmResponse.response_text) {
      await DbService.saveMessage(currentThreadId, actualUserId, 'fp', llmResponse.response_text);
    }

    // =======================================================================
    // DEEP ANALYTICS: BACKGROUND LINGUISTIC EXTRACTION & RISK CALCULATION
    // =======================================================================
    if (activeMission) {
      (async () => {
        try {
          // 1. Calculate Delays & Baseline Math
          const lastSignal = await DbService.getLastLinguisticSignal(actualUserId);
          const messageLength = message.length;
          
          let responseDelayMinutes = 0;
          if (lastSignal) {
            const lastTime = new Date(lastSignal.timestamp).getTime();
            const nowTime = new Date().getTime();
            responseDelayMinutes = Math.floor((nowTime - lastTime) / 60000);
          }

          // 2. Simple sync linguistic analysis (Mocking deep LLM extraction for performance)
          const lowerMsg = message.toLowerCase();
          const hesitationWords = ['maybe', 'try', 'but', 'perhaps', 'trying', 'kal se', 'sochunga', 'not sure'];
          const hesitationCount = hesitationWords.reduce((count, word) => count + (lowerMsg.split(word).length - 1), 0);
          
          const stressDetected = hesitationCount > 1 || messageLength < 15;
          let energyLevel = 'medium';
          if (messageLength > 100 && !stressDetected) energyLevel = 'high';
          else if (stressDetected) energyLevel = 'low';

          // Detect subjects roughly
          let subject = 'none';
          if (lowerMsg.match(/(physics|maths|chemistry|bio|rotational|kinematics|organic)/)) {
            subject = lowerMsg.match(/(physics|maths|chemistry|bio|rotational|kinematics|organic)/)![0];
          }

          // 3. Save Deep Signal
          await DbService.saveLinguisticSignal({
            user_id: actualUserId,
            message_length: messageLength,
            response_delay_minutes: responseDelayMinutes,
            hesitation_count: hesitationCount,
            stress_detected: stressDetected,
            subject,
            energy_level: energyLevel
          });

          // 4. Seven-Day Risk Report Aggregation Check
          const last7Days = await DbService.getLinguisticSignalsLast7Days(actualUserId);
          if (last7Days.length >= 7 && last7Days.length % 7 === 0) { // Gen report every 7 interactions
            const avgHesitation = last7Days.reduce((sum, log) => sum + log.hesitation_count, 0) / 7;
            const stressRatio = last7Days.filter(l => l.stress_detected).length / 7;
            
            const dropoutRiskScore = Math.min(100, Math.floor((avgHesitation * 15) + (stressRatio * 50) + 10));
            
            await DbService.saveWeeklyRiskReport({
              user_id: actualUserId,
              dropout_risk_score: dropoutRiskScore,
              dominant_avoidance_subject: subject,
              consistency_fingerprint_trend: stressRatio > 0.5 ? 'declining' : 'improving'
            });
            console.log(`[DEEP ANALYTICS] Generated Weekly Risk Report for ${actualUserId}. Risk Score: ${dropoutRiskScore}`);
          }

        } catch (e) {
          console.error('[DEEP ANALYTICS] Background extraction failed:', e);
        }
      })();
    }

    // Background task: Auto-extract mission if no active mission exists yet and this seems like a goal
    if (!activeMission && conversationHistory.length >= 2) {
      LLMService.classifyMessageOutcome(message).then(async () => {
        try {
          const extractionPrompt = `
Analyze the following conversation to determine if the user has established a clear overarching goal or mission.
If they have NOT established a clear goal, return null.
If they HAVE established a goal, extract it into this JSON format:
{
  "missionName": "Short descriptive title (max 4 words)",
  "lockedPath": "alpha or beta (alpha = aggressive, beta = conservative)",
  "totalDays": 90,
  "mindsetBrief": "Short motivational quote summarizing their drive",
  "strategyContent": "High-level summary of the phases/steps they need to execute."
}

Conversation:
${conversationHistory.map(m => m.role + ': ' + m.parts[0].text).join('\n')}
user: ${message}

Output ONLY valid JSON inside the response_text string value. Do not include markdown formatting.
For example: {"response_text": "{\\"missionName\\":\\"My Goal\\", \\"lockedPath\\":\\"alpha\\"}"}`;

          const extractionRes = await LLMService.generateValidatedResponse(actualUserId, extractionPrompt, [], [], 3, 1000, true);
          if (extractionRes.response_text && extractionRes.response_text.trim() !== 'null') {
            const parsed = JSON.parse(extractionRes.response_text);
            if (parsed.missionName) {
              await DbService.saveMission({
                user_id: actualUserId,
                missionName: parsed.missionName,
                lockedPath: parsed.lockedPath || 'alpha',
                probabilityLow: 25.0,
                probabilityHigh: 75.0,
                dayNumber: 1,
                totalDays: parsed.totalDays || 90,
                consistencyScore: 100,
                streakDays: 0,
                mindsetBrief: parsed.mindsetBrief || "Execute the vision.",
                strategyContent: parsed.strategyContent || "Phase 1 initialized.",
                chatThreadId: currentThreadId
              });
              await DbService.addConsistencyLog(actualUserId, 100);
            }
          }
        } catch (e) {
          console.error('Background Mission Extraction Error:', e);
        }
      });
    }

    return c.json({
      status: 'success',
      data: {
        engine_result: result,
        ai_response: llmResponse,
        thread_id: currentThreadId
      }
    });

  } catch (err: any) {
    const safeText = toUserSafeAIText(err);

    console.error('INTERACTION_MESSAGE_FATAL:', getAIErrorMessage(err));

    return c.json(
      {
        status: 'success',
        data: {
          engine_result: { type: 'chat_response', data: {} },
          ai_response: {
            response_text: safeText
          }
        }
      },
      200
    );
  }
});

// Endpoint to fetch current user's active locked mission
interactionRoutes.get('/active-mission', async (c) => {
  const userId = c.get('userId');

  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

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

  let dynamicMindset = mission.mindsetBrief;
  let dynamicCoreStrategy = "Follow the locked path. Execute daily targets without fail.";
  let dynamicProtocol = mission.strategyContent;

  try {
    const prompt = `Generate a dynamic, real-time daily execution brief for the user's current state. 
Mission: ${mission.missionName}
Day: ${mission.dayNumber}/${mission.totalDays}
Consistency Score: ${mission.consistencyScore}%
Streak: ${mission.streakDays} days
Debt Days (missed days): ${debtDays}

Output ONLY valid JSON in this EXACT format:
{
  "mindsetBrief": "Short professional yet highly encouraging Hinglish motivational quote based on their current streak or progress (hybrid of ChatGPT, Claude, and Gemini style).",
  "coreStrategy": "1-2 lines summarizing the aggressive strategy for today.",
  "strategyContent": "List of 3-4 actionable protocol steps for today. Prefix each with a hyphen. Example:\\n- Wake up at 5 AM\\n- Clear 2 backlog lectures"
}
Do not use markdown blocks.`;
    
    const response = await LLMService.generateValidatedResponse(userId, prompt, [], []);
    if (response && response.response_text) {
      try {
        const parsed = JSON.parse(response.response_text);
        if (parsed.mindsetBrief) dynamicMindset = parsed.mindsetBrief;
        if (parsed.coreStrategy) dynamicCoreStrategy = parsed.coreStrategy;
        if (parsed.strategyContent) dynamicProtocol = parsed.strategyContent;
      } catch (e) { }
    } else if (response && (response as any).mindsetBrief) {
       dynamicMindset = (response as any).mindsetBrief;
       if ((response as any).coreStrategy) dynamicCoreStrategy = (response as any).coreStrategy;
       if ((response as any).strategyContent) dynamicProtocol = (response as any).strategyContent;
    }
  } catch (err) {
    console.error('ACTIVE_MISSION: Failed to generate dynamic brief, using stale:', err);
  }

  return c.json({
    status: 'success',
    data: {
      ...mission,
      mindsetBrief: dynamicMindset,
      coreStrategy: dynamicCoreStrategy,
      strategyContent: dynamicProtocol,
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
    
    const actualUserId = c.get('userId');

    if (!actualUserId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
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

    // Save initial lock profile to Vector Memory (Hive Mind)
    const profileText = `Goal: ${mission.missionName} | Path: ${mission.lockedPath} | Total Days: ${mission.totalDays} | Mindset: ${mission.mindsetBrief}`;
    VectorService.saveMemory({
      user_id: actualUserId,
      mission_name: mission.missionName,
      locked_path: mission.lockedPath,
      profile_text: profileText,
      outcome_summary: `Trajectory locked. Initial consistency set to 100%. Path: ${mission.lockedPath}.`,
      success_rate: 100
    }).catch(err => console.error('HIVE_MIND: Failed to store trajectory lock memory:', err));

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
    const actualUserId = c.get('userId');

    if (!actualUserId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

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

    // Log task completion outcome in Vector Memory (Hive Mind)
    VectorService.saveMemory({
      user_id: actualUserId,
      mission_name: activeMission.missionName,
      locked_path: activeMission.lockedPath,
      profile_text: `Goal: ${activeMission.missionName} | Path: ${activeMission.lockedPath} | Day: ${activeMission.dayNumber}`,
      outcome_summary: `Task completion logged via action button: ${outcome}. New consistency score: ${newScore}%. Streak: ${newStreak} days.`,
      success_rate: newScore
    }).catch(err => console.error('HIVE_MIND: Failed to store task outcome memory:', err));

    return c.json({ status: 'success', data: updatedMission });
  } catch (err: any) {
    const safeText = toUserSafeAIText(err);

    console.error('INTERACTION_ROUTE /log-task ERROR:', getAIErrorMessage(err));

    return c.json(
      {
        status: 'success',
        data: {
          engine_result: { type: 'chat_response', data: {} },
          ai_response: {
            response_text: safeText
          }
        }
      },
      200
    );
  }
});

// Endpoint to fetch consistency log and AI strengths/bottlenecks for Reality Mirror
interactionRoutes.get('/reality-mirror', async (c) => {
  const userId = c.get('userId');

  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
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
      insightData = {
        strengths: response.strengths,
        bottlenecks: response.bottlenecks,
        insight: response.insight || ""
      };
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
  const userId = c.get('userId');

  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
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
  const userId = c.get('userId');

  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

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

// Mode 1: Material Circumstances & Calibration Diagnosis
interactionRoutes.post('/diagnostic', async (c) => {
  try {
    const input = await c.req.json();
    const result = runCircumstantialDiagnosis(input);
    return c.json({ status: 'success', data: result });
  } catch (error: any) {
    console.error('Diagnostic API Error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Mode 2: Tactical Architect Simulation & Opportunities Builder
interactionRoutes.post('/architect', async (c) => {
  try {
    const input = await c.req.json();
    const result = await runTacticalArchitect(input);
    return c.json({ status: 'success', data: result });
  } catch (error: any) {
    console.error('Tactical Architect API Error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Mode 3: Execution Operator Task Logging (Adaptive + Self-Correcting Recalibration Loop)
interactionRoutes.post('/operator/task', async (c) => {
  try {
    const { input: taskInput, matrix, capabilityVector, frictionProfile } = await c.req.json();
    const actualUserId = c.get('userId');

    if (!actualUserId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    taskInput.userId = actualUserId;

    const result = await processOperatorTaskUpdate(taskInput, matrix, capabilityVector, frictionProfile);
    
    // Save state back to DB if mission is active
    const activeMission = await DbService.getActiveMission(actualUserId);
    if (activeMission) {
      const updatedMission = {
        ...activeMission,
        consistencyScore: result.updatedRuntime.strategyState.consistencyScore,
        streakDays: result.updatedRuntime.strategyState.currentStreak,
        dayNumber: result.updatedRuntime.strategyState.currentDayNumber
      };
      await DbService.saveMission(updatedMission);
      await DbService.addConsistencyLog(actualUserId, updatedMission.consistencyScore);

      // Log task update in Vector Memory (Hive Mind)
      VectorService.saveMemory({
        user_id: actualUserId,
        mission_name: activeMission.missionName,
        locked_path: activeMission.lockedPath,
        profile_text: `Goal: ${activeMission.missionName} | Path: ${activeMission.lockedPath} | Day: ${activeMission.dayNumber}`,
        outcome_summary: `Operator task update processed. Outcomes: ${taskInput.outcome}. Consistency updated to ${result.updatedRuntime.strategyState.consistencyScore}%.`,
        success_rate: result.updatedRuntime.strategyState.consistencyScore
      }).catch(err => console.error('HIVE_MIND: Failed to store task outcome memory:', err));
    }
    
    return c.json({ status: 'success', data: result });
  } catch (error: any) {
    console.error('Execution Operator Task Update API Error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Mode 3: Execution Operator Critique Terminal (Dopamine & State Lock Audit checks)
interactionRoutes.post('/operator/critique', async (c) => {
  try {
    const input = await c.req.json();
    const actualUserId = c.get('userId');

    if (!actualUserId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    input.userId = actualUserId;

    const result = processOperatorCritique(input);
    return c.json({ status: 'success', data: result });
  } catch (error: any) {
    console.error('Execution Operator Critique API Error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Mode 3: Dynamic task generation/fetch for current day execution
interactionRoutes.post('/operator/current-tasks', async (c) => {
  try {
    const { dayNumber, matrix, capabilityVector, frictionProfile, strategyState } = await c.req.json();
    const taskSprint = await generateDailyTaskSprint(
      dayNumber || 1,
      matrix,
      capabilityVector,
      frictionProfile,
      strategyState
    );
    return c.json({ status: 'success', data: taskSprint });
  } catch (error: any) {
    console.error('Fetch Current Tasks API Error:', error);
    return c.json({ error: error.message }, 500);
  }
});
