/**
 * FP-OS :: MASTER ENGINE ORCHESTRATOR
 *
 * This is the single entry point for all FP reasoning.
 * It sequences all 12 layers in the correct order and assembles
 * the final UserRuntime object that powers every UI screen.
 *
 * Call sequence:
 * Layer 1 → Layer 2 → Layer 3 → [gate check] → Layer 4 → Layer 5
 * → Layer 6 → Layer 7 → Layer 8 → Layer 9 → [present to user]
 * → Layer 10 (lock) → Layer 11 (execute) → Layer 12 (accountability)
 *
 * External consumers (API routes, server actions) should import from
 * this file only — do not import individual layers directly.
 */

// ── Layer imports ──────────────────────────────────────────────────────────
import {
  assembleContextMatrix,
  buildSocioeconomicCluster,
  parseSkillClaims,
  assessCommunicationScore,
  parseGoalVector,
  detectEgoLeveragePoint,
  scoreProcrastination,
  validateIntakeCompleteness,
  ONBOARDING_QUESTION_FLOW,
  ProcrastinationSignals,
  OnboardingQuestion,
} from './layer1_intake';

import {
  runCapabilityVectoring,
} from './layer2_capability';

import {
  runSurvivabilityAudit,
  buildSurvivalModeResponse,
  buildYellowBandConfig,
} from './layer3_survivability';

import {
  runTrajectorySimulation,
  filterEligiblePaths,
} from './layer4_simulation';

import {
  runOpportunityMapping,
} from './layer5_opportunities';

import {
  runFrictionProfiling,
} from './layer6_friction';

import {
  calculateFinalProbability,
  comparePathProbabilities,
  ProbabilityInputVector,
} from './layer7_probability';

import {
  assembleFinalPathPresentation,
  evaluatePathGates,
} from './layer8_paths';

import {
  runAmbitionFilter,
  applySocioEconomicGuardrail,
} from './layer9_ambition';

import {
  createInitialStrategyState,
  lockStrategy,
  validateUnlockRequest,
  updateConsistencyScore,
  assessStructuralPivot,
} from './layer10_statelock';

import {
  generateDailyTaskSprint,
  checkMilestoneGate,
} from './layer11_execution';

import {
  runFailureDiagnostic,
  detectDopamineLoop,
  generateRealityCheck,
} from './layer12_accountability';

import {
  buildFullSystemPrompt,
  FPStage,
} from './systemPrompt';

// ── Type imports ────────────────────────────────────────────────────────────
import {
  UserRuntime,
  ContextMatrix,
  StrategyState,
  TrajectoryPath,
  ConsistencyEvent,
  GeographyTier,
  DeviceTier,
  InternetStability,
  WorkEnvironment,
  EgoLeveragePoint,
  WorkStylePreference,
} from './types';

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC API TYPES
// These are the input/output shapes that external code uses.
// ─────────────────────────────────────────────────────────────────────────────

export interface OnboardingInput {
  userId: string;
  // Cluster A
  geographyTier: GeographyTier;
  country: string;
  region: string;
  liquidCapital: number;
  monthlyBurnRate: number;
  hasDebt: boolean;
  debtMonthlyObligation: number;
  familyDependencyScore: number;     // 0.0 = full earner for dependents, 1.0 = no dependents
  // Cluster B
  rawSkillStrings: string[];
  hasVerifiableOutputMap: Record<string, boolean>;
  positiveCommSignals: string[];
  negativeCommSignals: string[];
  // Cluster C
  dailyUninterruptedHours: number;
  deviceTier: DeviceTier;
  internetStability: InternetStability;
  workEnvironment: WorkEnvironment;
  canWorkAtNight: boolean;
  hasDedicatedWorkspace: boolean;
  // Cluster D
  procrastinationSignals: ProcrastinationSignals;
  cognitiveEnduranceMinutes: number;
  emotionalResilience: number;
  baselineDiscipline: number;
  preferredWorkStyle: WorkStylePreference;
  riskTolerance: number;
  // Cluster E
  declaredGoal: string;
  targetAmount: number;
  currency: 'INR' | 'USD' | 'other';
  timelineMonths: number;
  sacrificesToleratedList: string[];
  nonNegotiables: string[];
  pathPreference: 'high_risk_upside' | 'safe_compounding' | 'undecided';
  // Meta
  onboardingText: string;            // Full raw conversation text
  detectedFrictionSignalIds: string[]; // IDs from FRICTION_SIGNALS
}

export interface SimulationOutput {
  userRuntime: UserRuntime;
  pathPresentation: ReturnType<typeof assembleFinalPathPresentation>;
  ambitionAssessment: ReturnType<typeof runAmbitionFilter>;
  socioEconomicGuardrail: ReturnType<typeof applySocioEconomicGuardrail>;
  survivalModeResponse: ReturnType<typeof buildSurvivalModeResponse> | null;
  systemPrompt: string;
}

export interface TaskUpdateInput {
  userId: string;
  userRuntime: UserRuntime;
  taskId: string;
  outcome: 'completed' | 'failed' | 'partial';
  failureExplanation?: string;   // Required if outcome is 'failed'
  reportedEarnings?: number;
}

export interface UnlockRequestInput {
  userId: string;
  userRuntime: UserRuntime;
  reason: string;
  evidence?: string;
}

export interface CritiqueInput {
  userId: string;
  userRuntime: UserRuntime;
  userMessage: string;
  tasksCompletedToDate: number;
  tasksAttemptedToDate: number;
  consecutiveFailureCount: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// ENGINE FUNCTION 1: PROCESS ONBOARDING
// Runs Layers 1–9 and returns the full simulation output.
// ─────────────────────────────────────────────────────────────────────────────

export async function processOnboarding(input: OnboardingInput): Promise<SimulationOutput> {
  // ── LAYER 1: Build Context Matrix ──────────────────────────────────────────
  const skills = parseSkillClaims(input.rawSkillStrings, input.hasVerifiableOutputMap);
  const communicationScore = assessCommunicationScore(input.positiveCommSignals, input.negativeCommSignals);
  const procrastinationScore = scoreProcrastination(input.procrastinationSignals);
  const egoLeveragePoint = detectEgoLeveragePoint(input.declaredGoal, input.onboardingText);

  const socioeconomic = buildSocioeconomicCluster({
    geographyTier: input.geographyTier,
    country: input.country,
    region: input.region,
    liquidCapital: input.liquidCapital,
    monthlyBurnRate: input.monthlyBurnRate,
    hasDebt: input.hasDebt,
    debtMonthlyObligation: input.debtMonthlyObligation,
    familyDependencyScore: input.familyDependencyScore,
  });

  const humanCapital = {
    skills,
    communicationScore,
    technicalVelocity: skills.filter(s => s.category === 'technical').reduce((sum, s) => sum + s.verifiedLevel, 0) / Math.max(1, skills.filter(s => s.category === 'technical').length),
    learningRate: input.baselineDiscipline * 0.6 + (1 - procrastinationScore) * 0.4,
    networkQuality: 0.3,  // Default — refined by AI analysis of onboarding text
    hasVerifiableWork: Object.values(input.hasVerifiableOutputMap).some(Boolean),
    languageRegister: 'english' as const,
  };

  const infrastructure = {
    dailyUninterruptedHours: input.dailyUninterruptedHours,
    deviceTier: input.deviceTier,
    internetStability: input.internetStability,
    workEnvironment: input.workEnvironment,
    canWorkAtNight: input.canWorkAtNight,
    hasDedicatedWorkspace: input.hasDedicatedWorkspace,
  };

  const psychometric = {
    procrastinationScore,
    cognitiveEnduranceMinutes: input.cognitiveEnduranceMinutes,
    emotionalResilience: input.emotionalResilience,
    baselineDiscipline: input.baselineDiscipline,
    egoLeveragePoint,
    preferredWorkStyle: input.preferredWorkStyle,
    riskTolerance: input.riskTolerance,
    ambitionIndex: 0, // Calculated below
    age: 25,
  };

  // Temporary V_c estimate for goal vector parsing (will be refined after Layer 2)
  const tempCapabilityEstimate = skills.reduce((sum, s) => sum + s.verifiedLevel, 0) / Math.max(1, skills.length);

  const goalVector = parseGoalVector({
    declaredGoal: input.declaredGoal,
    targetAmount: input.targetAmount,
    currency: input.currency,
    timelineMonths: input.timelineMonths,
    sacrificesToleratedList: input.sacrificesToleratedList,
    nonNegotiables: input.nonNegotiables,
    pathPreference: input.pathPreference,
    trueCapabilityScore: tempCapabilityEstimate,
  });

  const contextMatrix = assembleContextMatrix({
    userId: input.userId,
    socioeconomic,
    humanCapital,
    infrastructure,
    psychometric: { ...psychometric, ambitionIndex: (goalVector as any).ambitionVelocity || 0 },
    goalVector,
    onboardingText: input.onboardingText,
  });

  // ── LAYER 2: Capability Vectoring ──────────────────────────────────────────
  const capabilityVector = runCapabilityVectoring(contextMatrix);

  // ── LAYER 3: Survivability Audit ───────────────────────────────────────────
  const survivabilityAudit = runSurvivabilityAudit(contextMatrix);

  // ── SURVIVAL MODE GATE ─────────────────────────────────────────────────────
  let survivalModeResponse = null;
  if (!survivabilityAudit.strategyGenerationUnlocked) {
    survivalModeResponse = buildSurvivalModeResponse(contextMatrix);
    // Return early — no strategy generation for Red Band
    const initialState = createInitialStrategyState();
    const userRuntime: UserRuntime = {
      contextMatrix,
      capabilityVector,
      survivabilityAudit,
      intelligenceBrief: null,
      intelligenceReport: null,
      opportunityProfile: {
        rankedOpportunities: [],
        hardBanList: null,
        topLocalOpportunity: survivalModeResponse.immediateActions[0] as any,
        topDigitalOpportunity: null,
        topSocialMediaOpportunity: null,
        intelligenceEnriched: false,
      },
      frictionProfile: runFrictionProfiling(contextMatrix, input.detectedFrictionSignalIds),
      ambitionAssessment: runAmbitionFilter(contextMatrix, capabilityVector),
      skillGapAnalysis: null,
      availablePaths: [],
      strategyState: initialState,
      currentTaskSprint: null,
      consistencyHistory: [],
      legalAuditReport: null,
    };

    return {
      userRuntime,
      pathPresentation: null as any,
      ambitionAssessment: userRuntime.ambitionAssessment,
      socioEconomicGuardrail: applySocioEconomicGuardrail(contextMatrix, capabilityVector, input.targetAmount),
      survivalModeResponse,
      systemPrompt: buildFullSystemPrompt('onboarding', userRuntime),
    };
  }

  // ── LAYER 4: Stochastic Simulation ────────────────────────────────────────
  const simulationResults = runTrajectorySimulation(contextMatrix, capabilityVector, survivabilityAudit);

  // ── LAYER 5: Opportunity Mapping ───────────────────────────────────────────
  const opportunityProfile = runOpportunityMapping(contextMatrix, capabilityVector, survivabilityAudit);

  // ── LAYER 6: Friction Profiling ────────────────────────────────────────────
  const frictionProfile = runFrictionProfiling(contextMatrix, input.detectedFrictionSignalIds);

  // ── LAYER 7: Probability Calculation ──────────────────────────────────────
  const betaResult = simulationResults.find(r => r.pathTemplate.type === 'safe_compounding') ?? simulationResults[0];
  const alphaResult = simulationResults.find(r => r.pathTemplate.type === 'high_risk_upside') ?? null;

  const probabilityInputs: ProbabilityInputVector = {
    trueCapabilityScore: capabilityVector.trueCapabilityScore,
    runwayDays: survivabilityAudit.runwayDays,
    frictionCoefficient: frictionProfile.frictionCoefficient,
    pathMarketSaturationRisk: betaResult?.shockVulnerabilityScore ?? 0.3,
    simulatedShockProbability: 0.25,
    learningRate: contextMatrix.humanCapital.learningRate,
    networkQuality: contextMatrix.humanCapital.networkQuality,
    baselineDiscipline: contextMatrix.psychometric.baselineDiscipline,
    riskTolerance: contextMatrix.psychometric.riskTolerance,
    timelineMonths: contextMatrix.goalVector.timelineMonths,
    hasVerifiableOutputs: contextMatrix.humanCapital.hasVerifiableWork,
  };

  const probabilityComparison = comparePathProbabilities(alphaResult, betaResult, probabilityInputs);

  // ── LAYER 8: Path Presentation ─────────────────────────────────────────────
  const pathPresentation = assembleFinalPathPresentation(
    contextMatrix,
    capabilityVector,
    survivabilityAudit,
    frictionProfile,
    opportunityProfile,
    simulationResults,
    probabilityComparison,
  );

  // ── LAYER 9: Ambition Filter ───────────────────────────────────────────────
  const ambitionAssessment = runAmbitionFilter(contextMatrix, capabilityVector);
  const socioEconomicGuardrail = applySocioEconomicGuardrail(contextMatrix, capabilityVector, input.targetAmount);

  // ── ASSEMBLE USER RUNTIME ──────────────────────────────────────────────────
  const initialState = createInitialStrategyState();
  initialState.status = 'awaiting_selection';

  const userRuntime: UserRuntime = {
    contextMatrix,
    capabilityVector,
    survivabilityAudit,
    intelligenceBrief: null,
    intelligenceReport: null,
    opportunityProfile,
    frictionProfile,
    ambitionAssessment,
    skillGapAnalysis: null,
    availablePaths: [
      ...(pathPresentation.pathAlpha ? [pathPresentation.pathAlpha] : []),
      pathPresentation.pathBeta,
    ],
    strategyState: initialState,
    currentTaskSprint: null,
    consistencyHistory: [],
    legalAuditReport: null,
  };

  return {
    userRuntime,
    pathPresentation,
    ambitionAssessment,
    socioEconomicGuardrail,
    survivalModeResponse: null,
    systemPrompt: buildFullSystemPrompt('simulation', userRuntime),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// ENGINE FUNCTION 2: LOCK TRAJECTORY
// Layer 10: Locks the selected path and transitions to execution mode.
// ─────────────────────────────────────────────────────────────────────────────

export function lockTrajectory(
  userRuntime: UserRuntime,
  selectedPathId: 'alpha' | 'beta',
): { updatedRuntime: UserRuntime; systemPrompt: string; day1TaskSprint: ReturnType<typeof generateDailyTaskSprint> } {
  const selectedPath = userRuntime.availablePaths.find(p => p.pathId === selectedPathId);
  if (!selectedPath) {
    throw new Error(`Path '${selectedPathId}' is not available in this runtime.`);
  }

  const lockedState = lockStrategy(userRuntime.strategyState, selectedPath);

  // Generate Day 1 task sprint immediately upon locking
  const day1Sprint = generateDailyTaskSprint(
    1,
    userRuntime.contextMatrix,
    userRuntime.capabilityVector,
    userRuntime.frictionProfile,
    lockedState,
  );

  const updatedRuntime: UserRuntime = {
    ...userRuntime,
    strategyState: lockedState,
    currentTaskSprint: day1Sprint,
  };

  return {
    updatedRuntime,
    systemPrompt: buildFullSystemPrompt('execution', updatedRuntime),
    day1TaskSprint: day1Sprint,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// ENGINE FUNCTION 3: PROCESS TASK UPDATE
// Layer 11 + 12: Handles task completion or failure.
// ─────────────────────────────────────────────────────────────────────────────

export function processTaskUpdate(input: TaskUpdateInput): {
  updatedRuntime: UserRuntime;
  consistencyEvent: ConsistencyEvent;
  failureDiagnostic: ReturnType<typeof runFailureDiagnostic> | null;
  nextDayTaskSprint: ReturnType<typeof generateDailyTaskSprint> | null;
  milestoneGateResult: ReturnType<typeof checkMilestoneGate> | null;
  systemPrompt: string;
} {
  const { userRuntime, outcome, failureExplanation, reportedEarnings } = input;
  const currentState = userRuntime.strategyState;

  // Update consistency score
  const scoreEvent = outcome === 'completed' ? 'task_completed'
    : outcome === 'partial' ? 'task_partial'
    : 'task_failed';

  const { newScore, delta, message } = updateConsistencyScore(currentState.consistencyScore, scoreEvent);

  const consistencyEvent: ConsistencyEvent = {
    date: new Date().toISOString(),
    delta,
    reason: message,
    newScore,
    streak: currentState.currentStreak || 0,
  };

  // Run failure diagnostic if task was failed
  let failureDiagnostic = null;
  if (outcome === 'failed' && failureExplanation) {
    failureDiagnostic = runFailureDiagnostic(
      failureExplanation,
      userRuntime.contextMatrix,
      userRuntime.frictionProfile,
      currentState,
      0,
      1,
    );
  }

  // Advance day counter
  const nextDayNumber = currentState.currentDayNumber + 1;
  const updatedState: StrategyState = {
    ...currentState,
    consistencyScore: newScore,
    currentDayNumber: nextDayNumber,
  };

  // Check milestone gate
  let milestoneGateResult = null;
  if (currentState.lockedPath && reportedEarnings !== undefined) {
    milestoneGateResult = checkMilestoneGate(
      currentState.currentDayNumber,
      currentState.lockedPath,
      reportedEarnings,
    );
  }

  // Generate next day's task sprint (unless strategy is being reset)
  let nextDayTaskSprint = null;
  if (nextDayNumber <= currentState.totalTargetDays) {
    nextDayTaskSprint = generateDailyTaskSprint(
      nextDayNumber,
      userRuntime.contextMatrix,
      userRuntime.capabilityVector,
      userRuntime.frictionProfile,
      updatedState,
    );
  }

  const updatedRuntime: UserRuntime = {
    ...userRuntime,
    strategyState: updatedState,
    currentTaskSprint: nextDayTaskSprint,
    consistencyHistory: [...userRuntime.consistencyHistory, consistencyEvent],
  };

  return {
    updatedRuntime,
    consistencyEvent,
    failureDiagnostic,
    nextDayTaskSprint,
    milestoneGateResult,
    systemPrompt: buildFullSystemPrompt('execution', updatedRuntime),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// ENGINE FUNCTION 4: PROCESS CRITIQUE MESSAGE
// Layer 12: Full accountability conversation processing.
// ─────────────────────────────────────────────────────────────────────────────

export function processCritiqueMessage(input: CritiqueInput): {
  responseType: string;
  engineResponse: string | null;  // null = let the AI generate freely with the system prompt
  systemPrompt: string;
  consistencyDelta: number;
  dopamineLoopDetected: boolean;
} {
  const { userRuntime, userMessage, tasksCompletedToDate, tasksAttemptedToDate, consecutiveFailureCount } = input;

  // Step 1: Check for dopamine loop
  const dopamineCheck = detectDopamineLoop(userMessage);

  if (dopamineCheck.isDopamineLoop && dopamineCheck.confidence > 0.5) {
    return {
      responseType: 'dopamine_loop_interrupt',
      engineResponse: dopamineCheck.response,
      systemPrompt: buildFullSystemPrompt('critique', userRuntime),
      consistencyDelta: 0,
      dopamineLoopDetected: true,
    };
  }

  // Step 2: Check for unlock attempt disguised as a message
  const unlockValidation = validateUnlockRequest(
    { reason: userMessage, requestedAt: new Date().toISOString() },
    userRuntime.strategyState,
  );

  if (!unlockValidation.approved && userRuntime.strategyState.isLocked) {
    // Check if the message looks like an unlock attempt
    const looksLikeUnlockAttempt = userMessage.toLowerCase().includes('want to change')
      || userMessage.toLowerCase().includes('different path')
      || userMessage.toLowerCase().includes('not working')
      || userMessage.toLowerCase().includes('try something else');

    if (looksLikeUnlockAttempt) {
      return {
        responseType: 'state_lock_enforcement',
        engineResponse: unlockValidation.systemResponse,
        systemPrompt: buildFullSystemPrompt('critique', userRuntime),
        consistencyDelta: 0,
        dopamineLoopDetected: false,
      };
    }
  }

  // Step 3: Check for reality check trigger (sustained failure pattern)
  if (consecutiveFailureCount >= 2) {
    const realityCheck = generateRealityCheck(
      consecutiveFailureCount,
      userRuntime.strategyState.consistencyScore,
      userRuntime.contextMatrix.psychometric.egoLeveragePoint,
    );

    if (consecutiveFailureCount >= 3) {
      return {
        responseType: 'reality_check',
        engineResponse: realityCheck,
        systemPrompt: buildFullSystemPrompt('critique', userRuntime),
        consistencyDelta: 0,
        dopamineLoopDetected: false,
      };
    }
  }

  // Step 4: Pass to AI with full system prompt (AI generates the specific response)
  return {
    responseType: 'ai_generated',
    engineResponse: null,  // AI generates with system prompt context
    systemPrompt: buildFullSystemPrompt('critique', userRuntime),
    consistencyDelta: 0,
    dopamineLoopDetected: false,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// ENGINE FUNCTION 5: PROCESS UNLOCK REQUEST
// Layer 10: Validates and processes a strategy change request.
// ─────────────────────────────────────────────────────────────────────────────

export function processUnlockRequest(input: UnlockRequestInput): {
  updatedRuntime: UserRuntime;
  validationResult: ReturnType<typeof validateUnlockRequest>;
  systemPrompt: string;
} {
  const validationResult = validateUnlockRequest(
    { reason: input.reason, evidence: input.evidence, requestedAt: new Date().toISOString() },
    input.userRuntime.strategyState,
  );

  let updatedState = input.userRuntime.strategyState;

  if (validationResult.approved) {
    // Apply the state transition
    updatedState = {
      ...updatedState,
      status: validationResult.nextState,
      consistencyScore: Math.max(0, updatedState.consistencyScore - validationResult.consistencyPenalty),
      unlockGranted: true,
      unlockReason: validationResult.unlockReason,
      lastUnlockRequest: new Date().toISOString(),
    };
  }

  const updatedRuntime: UserRuntime = {
    ...input.userRuntime,
    strategyState: updatedState,
  };

  const stage: FPStage = validationResult.approved && validationResult.nextState === 'reset'
    ? 'onboarding'
    : validationResult.approved && validationResult.nextState === 'simulating'
    ? 'simulation'
    : 'critique';

  return {
    updatedRuntime,
    validationResult,
    systemPrompt: buildFullSystemPrompt(stage, updatedRuntime),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// RE-EXPORTS: Everything external code needs
// ─────────────────────────────────────────────────────────────────────────────

export {
  // Layer 1
  ONBOARDING_QUESTION_FLOW,
  assessCommunicationScore,
  validateIntakeCompleteness,
} from './layer1_intake';

export type { OnboardingQuestion } from './layer1_intake';

export { FRICTION_SIGNALS } from './layer6_friction';

export {
  // Layer 10
  VALID_STATE_TRANSITIONS,
  createInitialStrategyState,
} from './layer10_statelock';

export {
  // Layer 11
  describeWorkStyleArchitecture,
  TASK_LIBRARY,
} from './layer11_execution';

export {
  // Layer 12
  detectDopamineLoop,
  generateRealityCheck,
} from './layer12_accountability';

export {
  // System prompt
  buildFullSystemPrompt,
  FP_SPECIAL_RESPONSES,
  buildUserContextBlock,
} from './systemPrompt';

// Type exports
export type {
  UserRuntime,
  ContextMatrix,
  StrategyState,
  TrajectoryPath,
  ConsistencyEvent,
} from './types';

export { ENGINE_AXIOMS } from './types';
