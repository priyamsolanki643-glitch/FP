/**
 * FP-OS :: LAYER 12 — BEHAVIORAL ACCOUNTABILITY & EGO-CRITIQUE ENGINE
 *
 * The most psychologically sophisticated layer of FP-OS.
 *
 * When execution gaps occur, FP does NOT deploy generic motivational platitudes.
 * It initiates a root-cause forensic analysis sequence.
 *
 * This layer is the "reality-critique interface" — where the state machine
 * manages accountability tracking and analyzes execution errors.
 *
 * Core behaviors:
 * 1. Distinguish internal failure (procrastination, burnout) from external (infrastructure, market)
 * 2. Trigger ego-critique only for internal failures — external failures get tactical pivots
 * 3. Calculate the growth delta (what the user HAS achieved) to provide grounded assessment
 * 4. Never give a guarantee. Never give empty reassurance. Give calibrated honesty.
 */

import {
  ContextMatrix,
  FrictionProfile,
  StrategyState,
  FailureDiagnostic,
  FailureType,
  AccountabilityResponseType,
  DiagnosticChoice,
  ConsistencyEvent,
  ENGINE_AXIOMS,
  EgoLeveragePoint,
} from './types';
import { updateConsistencyScore } from './layer10_statelock';

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 1: FAILURE TYPE CLASSIFIER
// Determines whether a failure is internal or external.
// This is the first branch in the forensic analysis tree.
// ─────────────────────────────────────────────────────────────────────────────

const INTERNAL_FAILURE_SIGNALS = [
  'procrastinated', 'procrastination', 'didn\'t start', 'couldn\'t start',
  'was distracted', 'distracted', 'scrolled', 'watched videos', 'netflix',
  'didn\'t feel like', 'wasn\'t motivated', 'laziness', 'lazy',
  'kept delaying', 'delayed', 'pushed it off', 'avoided',
  'spent time on', 'wasted time', 'lost track', 'forgot',
  'got bored', 'bored', 'overthought', 'in my head', 'overthinking',
  'burnout', 'burnt out', 'tired', 'exhausted', 'drained',
];

const EXTERNAL_FAILURE_SIGNALS = [
  'internet went', 'internet down', 'no internet', 'power cut', 'power outage',
  'device broke', 'phone died', 'laptop crashed', 'computer stopped',
  'family emergency', 'health emergency', 'hospital', 'sick', 'ill',
  'client cancelled', 'client backed out', 'client ghosted',
  'market changed', 'platform changed', 'platform shut down',
  'natural disaster', 'flood', 'no electricity', 'shop closed',
  'exam', 'unexpected commitment', 'forced to attend',
];

export function classifyFailureType(userExplanation: string): {
  failureType: FailureType;
  isInternal: boolean;
  confidence: number;
} {
  const explanationLower = userExplanation.toLowerCase();

  const internalMatchCount = INTERNAL_FAILURE_SIGNALS.filter((s) =>
    explanationLower.includes(s)
  ).length;

  const externalMatchCount = EXTERNAL_FAILURE_SIGNALS.filter((s) =>
    explanationLower.includes(s)
  ).length;

  if (externalMatchCount > internalMatchCount) {
    // Further classify external type
    const isInfrastructure = explanationLower.includes('internet') || explanationLower.includes('device')
      || explanationLower.includes('power') || explanationLower.includes('electricity');
    const isPersonalEmergency = explanationLower.includes('health') || explanationLower.includes('family')
      || explanationLower.includes('hospital') || explanationLower.includes('sick');

    return {
      failureType: isInfrastructure ? 'external_infrastructure'
        : isPersonalEmergency ? 'external_personal_emergency'
        : 'external_market',
      isInternal: false,
      confidence: Math.min(1.0, externalMatchCount / 3),
    };
  }

  if (internalMatchCount > 0) {
    const isBurnout = explanationLower.includes('burnout') || explanationLower.includes('burnt out')
      || explanationLower.includes('exhausted') || explanationLower.includes('drained');

    return {
      failureType: isBurnout ? 'internal_burnout' : 'internal_procrastination',
      isInternal: true,
      confidence: Math.min(1.0, internalMatchCount / 3),
    };
  }

  // Default to procrastination when ambiguous (most common actual cause)
  return {
    failureType: 'internal_procrastination',
    isInternal: true,
    confidence: 0.40, // Low confidence — ambiguous
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 2: EGO-CRITIQUE ENGINE
// Triggered only for internal failures.
// Uses the user's ego leverage point (identified in Layer 1) to
// apply precision psychological pressure — not generic motivation.
// ─────────────────────────────────────────────────────────────────────────────

export function generateEgoCritique(
  egoLeveragePoint: EgoLeveragePoint,
  failureType: FailureType,
  userFailureText: string,
  consistencyScore: number,
  dayNumber: number,
): string {
  const isBurnout = failureType === 'internal_burnout';

  if (isBurnout) {
    // Burnout gets a different response — it's real and requires tactical adjustment
    return `This is not procrastination — this is burnout. Those require different responses.

Burnout is your body/mind telling you the system is unsustainable. I take that seriously.

Here's the adjustment: Your task load is being recalibrated. The next 48 hours, you have ONE task per day, half the normal time allocation. This is not a reward — it is a recovery protocol to restore your execution capacity.

What I will not do: lower the goal. What I will adjust: the sprint intensity until your cognitive endurance recovers.

You've made it to day ${dayNumber}. Your consistency score is ${consistencyScore}/100. That represents real momentum. Do not interpret recovery as failure.`;
  }

  // Procrastination — ego-critique by leverage point
  const baseResponse = `You missed today's task. Let me be direct.`;

  const leverageResponses: Record<EgoLeveragePoint, string> = {
    family: `${baseResponse}

There is someone in your family whose financial stability depends on this working. Every day you procrastinate is a day they continue carrying a weight that doesn't need to be there.

I'm not saying this to make you feel guilty. I'm saying it because you told me this is your reason. The gap between your stated motivation and today's execution is information. What is it telling you?

You have two choices:
[Choice A] Run a 90-minute recovery sprint RIGHT NOW. Not tomorrow — now.
[Choice B] Sit with the fact that the dopamine of imagining success feels better than the discomfort of building it. And decide if that's okay with you.`,

    proving_someone_wrong: `${baseResponse}

Someone said you couldn't do this. And today you proved them right — not by failing at the task, but by not even attempting it.

The person who doubted you is not thinking about you right now. They're living their life. The only person this inaction is hurting is you.

[Choice A] Start your task sprint in the next 10 minutes.
[Choice B] Stay exactly where you are and let this be another day where someone else was right about you.`,

    money: `${baseResponse}

You said you want financial results. Today's inaction is a direct vote against that. Not philosophically — literally. Every task you skip is revenue you don't generate. That's the math.

Your procrastination has a price. You're paying it today.

[Choice A] Begin your recovery sprint now. The task is still completable today.
[Choice B] Log this as a failed day and accept the consistency score penalty. Then execute tomorrow with double intensity.`,

    freedom: `${baseResponse}

You said you want freedom — from the routine, from the obligation, from the constraint. The path to that freedom runs directly through the discomfort of doing today's task.

Every day you avoid the work, the timeline to freedom extends. Not by motivation. By math.

[Choice A] Execute your task in the next 90 minutes.
[Choice B] Accept that you are choosing continued constraint over short-term discomfort.`,

    status: `${baseResponse}

People who achieve things that are worth respecting are not stopped by the kind of day you're having. That's the gap you need to close — not in skill, but in execution character.

The status you want comes from a track record. Track records are built on days exactly like today, when you did the work anyway.

[Choice A] Run your task sprint now. Add to your track record.
[Choice B] Stay where you are. This day joins the others.`,

    impact: `${baseResponse}

The problem you said you wanted to solve still exists today. The people you wanted to help are still dealing with it. And today, you chose not to move closer to that.

I'm not judging the impulse — I'm reflecting the reality. Your impact goal requires sustained execution. Today was a gap.

[Choice A] Close the gap. Begin your task sprint.
[Choice B] Acknowledge this was a lost day and commit to zero gaps tomorrow.`,
  };

  return leverageResponses[egoLeveragePoint] ?? `${baseResponse}

You procrastinated. This is not a moral failure — it is an execution pattern that your strategy cannot absorb indefinitely.

Your consistency score is at ${consistencyScore}/100. If this pattern continues, your trajectory probability drops.

[Choice A] Execute your task in the next 90 minutes.
[Choice B] Declare the day failed and commit to full execution tomorrow.`;
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 3: EXTERNAL FAILURE HANDLER
// External failures don't get ego-critique — they get tactical pivots.
// ─────────────────────────────────────────────────────────────────────────────

export function generateExternalFailureResponse(
  failureType: FailureType,
  userExplanation: string,
  strategyState: StrategyState,
): string {
  switch (failureType) {
    case 'external_infrastructure':
      return `Infrastructure failure logged. This is a real external constraint, not a personal execution failure.

Your consistency score is not penalized for genuine infrastructure events.

Immediate tactical adjustment:
1. Identify offline-executable tasks from your task list
2. Use this downtime to plan tomorrow's sprint in detail
3. If this infrastructure issue is recurring (not a one-off), flag it — we need to build infrastructure redundancy into your execution plan

What specifically failed and how long is it expected to affect you?`;

    case 'external_personal_emergency':
      return `Personal or family emergency logged. This is a legitimate interruption to normal execution.

Your trajectory is paused — not cancelled. Your consistency score is held at ${strategyState.consistencyScore} during the emergency period.

When you are ready to resume: Give me an update on your current status and we will recalibrate your task cadence from your re-entry day. No need to "catch up" on missed days — we rebuild from where you are.

Take care of what needs to be taken care of. The strategy will be here.`;

    case 'external_market':
      return `External market change logged. This requires a tactical assessment.

Your core trajectory may still be valid — market changes require a delta analysis, not an automatic pivot.

Tell me specifically: What changed? Platform policy? Local economic condition? A competitor? Client decision?

Based on that, I'll determine whether this requires:
[Option A] Minor tactical adjustment within your locked trajectory
[Option B] Re-simulation with updated market parameters (does NOT wipe consistency score)
[Option C] Full goal reset (only if the market change makes your target permanently inaccessible)`;

    default:
      return `External factor logged. Provide more specific details about what happened for me to generate an accurate tactical response.`;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 4: GROWTH DELTA CALCULATOR
// When a timeline fails or the user complains about not hitting the goal,
// the engine calculates what they HAVE achieved — quantitatively.
// This is not motivational padding — it's honest measurement.
// ─────────────────────────────────────────────────────────────────────────────

export interface GrowthDelta {
  day0ConsistencyScore: number;       // Where they started
  currentConsistencyScore: number;    // Where they are now
  consistencyGrowthPercent: number;
  tasksCompletedCount: number;
  tasksAttemptedCount: number;
  completionRate: number;
  cognitive_endurance_day0: number;   // Minutes
  cognitive_endurance_current: number;
  enduranceGrowthPercent: number;
  growthNarrative: string;
}

export function calculateGrowthDelta(
  day0ConsistencyScore: number,
  currentConsistencyScore: number,
  tasksCompletedCount: number,
  tasksAttemptedCount: number,
  cognitiveEnduranceDay0: number,
  cognitiveEnduranceCurrent: number,
): GrowthDelta {
  const consistencyGrowthPercent = day0ConsistencyScore > 0
    ? ((currentConsistencyScore - day0ConsistencyScore) / day0ConsistencyScore) * 100
    : currentConsistencyScore;

  const completionRate = tasksAttemptedCount > 0
    ? (tasksCompletedCount / tasksAttemptedCount) * 100
    : 0;

  const enduranceGrowthPercent = cognitiveEnduranceDay0 > 0
    ? ((cognitiveEnduranceCurrent - cognitiveEnduranceDay0) / cognitiveEnduranceDay0) * 100
    : 0;

  const growthNarrative = generateGrowthNarrative(
    consistencyGrowthPercent,
    completionRate,
    enduranceGrowthPercent,
    tasksCompletedCount,
    cognitiveEnduranceDay0,
    cognitiveEnduranceCurrent,
  );

  return {
    day0ConsistencyScore,
    currentConsistencyScore,
    consistencyGrowthPercent,
    tasksCompletedCount,
    tasksAttemptedCount,
    completionRate,
    cognitive_endurance_day0: cognitiveEnduranceDay0,
    cognitive_endurance_current: cognitiveEnduranceCurrent,
    enduranceGrowthPercent,
    growthNarrative,
  };
}

function generateGrowthNarrative(
  consistencyGrowth: number,
  completionRate: number,
  enduranceGrowth: number,
  tasksCompleted: number,
  enduranceStart: number,
  enduranceCurrent: number,
): string {
  let narrative = `The system has logged your trajectory data. Here's what the numbers actually say:\n\n`;

  if (enduranceGrowth > 50) {
    narrative += `At Day 0, your cognitive endurance was ${enduranceStart} minutes. Today it is ${enduranceCurrent} minutes. That is a ${enduranceGrowth.toFixed(0)}% improvement in your sustained focus capacity. This is not a small thing.\n\n`;
  }

  if (tasksCompleted > 0) {
    narrative += `You completed ${tasksCompleted} tasks over this period at a ${completionRate.toFixed(0)}% completion rate. Every single one of those was you choosing execution over avoidance.\n\n`;
  }

  narrative += `Success in high-yield domains is rarely linear. The people who eventually reach these targets are not the ones who succeeded on every attempt — they are the ones who attempted the most times.\n\n`;

  narrative += `The goal was not hit this cycle. That is a real result. The growth in your execution capacity is also a real result. Both are true simultaneously.\n\n`;

  narrative += `The engine is resetting to Target Loop 2 with your updated baseline metrics. Your capability score is higher than Day 0. Your procrastination patterns are better documented. Your next attempt has a higher probability than your first.`;

  return narrative;
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 5: FULL FAILURE DIAGNOSTIC ORCHESTRATOR
// The main function that runs the full forensic analysis tree.
// ─────────────────────────────────────────────────────────────────────────────

export function runFailureDiagnostic(
  userExplanation: string,
  matrix: ContextMatrix,
  frictionProfile: FrictionProfile,
  strategyState: StrategyState,
  tasksCompletedCount: number,
  tasksAttemptedCount: number,
): FailureDiagnostic {
  // Step 1: Classify failure type
  const { failureType, isInternal, confidence } = classifyFailureType(userExplanation);

  // Step 2: Calculate consistency impact
  const consistencyUpdate = updateConsistencyScore(
    strategyState.consistencyScore,
    isInternal ? 'task_failed' : 'task_partial', // External failures are partial, not full failures
  );

  // Step 3: Generate appropriate response
  let fpResponse: string;
  let responseType: AccountabilityResponseType;

  if (isInternal) {
    fpResponse = generateEgoCritique(
      matrix.psychometric.egoLeveragePoint,
      failureType,
      userExplanation,
      strategyState.consistencyScore,
      strategyState.currentDayNumber,
    );
    responseType = failureType === 'internal_burnout' ? 'failure_forensic' : 'ego_critique';
  } else {
    fpResponse = generateExternalFailureResponse(failureType, userExplanation, strategyState);
    responseType = 'failure_forensic';
  }

  // Step 4: Build choice architecture
  const choices: DiagnosticChoice[] = buildDiagnosticChoices(isInternal, failureType);

  // Step 5: Build growth delta message (only for sustained failures, not single-task failures)
  const growthDeltaMessage = tasksAttemptedCount >= 5
    ? calculateGrowthDelta(
        100,
        strategyState.consistencyScore,
        tasksCompletedCount,
        tasksAttemptedCount,
        matrix.psychometric.cognitiveEnduranceMinutes,
        matrix.psychometric.cognitiveEnduranceMinutes * 1.5, // Estimated growth
      ).growthNarrative
    : null;

  return {
    failureType,
    isInternal,
    isExternal: !isInternal,
    consistencyScoreDelta: isInternal ? -ENGINE_AXIOMS.CONSISTENCY_FAILURE_PENALTY : 0,
    responseType,
    fpResponse,
    choices,
    growthDeltaMessage,
    wellnessCheckTriggered: false,
    wellnessReferral: null,
  };
}

function buildDiagnosticChoices(isInternal: boolean, failureType: FailureType): DiagnosticChoice[] {
  if (failureType === 'internal_procrastination') {
    return [
      {
        label: 'Run a recovery sprint NOW',
        action: 'recovery_sprint',
        consequence: 'Partial task completion logged. Consistency score stabilized. Day does not count as a full failure.',
      },
      {
        label: 'Accept today as a failed day and commit to tomorrow',
        action: 'failure_mode_acknowledged',
        consequence: `Consistency score decreases by ${ENGINE_AXIOMS.CONSISTENCY_FAILURE_PENALTY} points. Tomorrow's task sprint intensity remains unchanged.`,
      },
    ];
  }

  if (failureType === 'internal_burnout') {
    return [
      {
        label: 'Begin recovery protocol (reduced load for 48 hours)',
        action: 'recovery_sprint',
        consequence: 'Task load reduced by 50% for 48 hours. This is tactical, not a reward.',
      },
      {
        label: 'Continue at full load (high risk of deeper burnout)',
        action: 'ego_accepted_comeback',
        consequence: 'Full sprint continues. Monitor closely for compounding burnout.',
      },
    ];
  }

  // External failures
  return [
    {
      label: 'Log the external event and reschedule the task',
      action: 'recovery_sprint',
      consequence: 'Task rescheduled. Consistency score not penalized for genuine external events.',
    },
    {
      label: 'Request tactical pivot assessment',
      action: 'structural_pivot_request',
      consequence: 'Engine evaluates whether the external event requires strategy adjustment.',
    },
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 6: DOPAMINE LOOP DETECTOR
// Detects when a user is seeking validation instead of executing.
// The most subtle and important behavioral pattern to catch.
// ─────────────────────────────────────────────────────────────────────────────

const DOPAMINE_LOOP_SIGNALS = [
  'what do you think', 'is this good', 'am i on track', 'do you think i can',
  'i\'ve been thinking about', 'i have this idea', 'what if i', 'should i pivot',
  'tell me about', 'explain more about', 'can you give me more', 'what\'s the best way',
  'i want to learn more', 'i\'ve been researching', 'i read that', 'i watched',
  'motivate me', 'i need motivation', 'inspire me', 'i\'m feeling',
];

const EXECUTION_SIGNALS = [
  'i completed', 'i finished', 'i submitted', 'i sent', 'i built', 'i created',
  'i launched', 'i contacted', 'i delivered', 'i published', 'here is the result',
  'done', 'completed', 'finished', 'submitted', 'sent it', 'delivered',
];

export function detectDopamineLoop(userMessage: string): {
  isDopamineLoop: boolean;
  isExecution: boolean;
  confidence: number;
  response: string | null;
} {
  const messageLower = userMessage.toLowerCase();

  const dopamineSignalCount = DOPAMINE_LOOP_SIGNALS.filter((s) =>
    messageLower.includes(s)
  ).length;

  const executionSignalCount = EXECUTION_SIGNALS.filter((s) =>
    messageLower.includes(s)
  ).length;

  if (executionSignalCount > 0) {
    return {
      isDopamineLoop: false,
      isExecution: true,
      confidence: Math.min(1.0, executionSignalCount / 2),
      response: null, // Execution = proceed normally, log completion
    };
  }

  if (dopamineSignalCount > 0) {
    return {
      isDopamineLoop: true,
      isExecution: false,
      confidence: Math.min(1.0, dopamineSignalCount / 3),
      response: `Let me ask you something before I answer that.

Have you completed your current assigned task?

If yes — log the completion and then ask your question. I'll answer it after the log.
If no — the question you're asking right now is a form of productive procrastination. You're seeking mental engagement without doing the work that actually moves your trajectory.

I am not here to be an interesting conversation. I am here to get you to your goal.

Task completion status: [yes/no]?`,
    };
  }

  return {
    isDopamineLoop: false,
    isExecution: false,
    confidence: 0,
    response: null,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 7: REALITY CHECKER RESPONSES
// FP's signature "are you seeking dopamine or results?" challenge.
// Used when user shows consistent gap between stated goals and behavior.
// ─────────────────────────────────────────────────────────────────────────────

export function generateRealityCheck(
  consecutiveFailureCount: number,
  consistencyScore: number,
  egoLeveragePoint: EgoLeveragePoint,
): string {
  if (consecutiveFailureCount >= 3 && consistencyScore < 50) {
    return `We need to have an honest conversation.

You've had ${consecutiveFailureCount} consecutive execution gaps. Your consistency score is at ${consistencyScore}/100.

I want to ask you something directly: Do you actually want to achieve this goal? Or do you want the feeling of working toward a goal?

Those are different things. And I've been designed to tell you the difference.

Working toward a goal feels productive. Reading about strategy, planning the next steps, asking good questions — all of this generates a feeling of progress without requiring execution. This is the dopamine loop. It's comfortable, it's safe, and it will guarantee you don't reach your target.

Achieving a goal requires doing the specific, uncomfortable task in front of you, every day, even when you don't feel like it, even when it's hard, even when you're unsure if it's working.

Right now, which one are you choosing?

I'm not asking rhetorically. I need your actual answer.

[A] I want to achieve the goal. I am ready to commit to full execution starting now.
[B] I'm not ready right now. I want to pause the trajectory without resetting.
[C] I want to reset. I need to pick a goal I'm actually committed to.`;
  }

  if (consecutiveFailureCount >= 2) {
    return `Two consecutive execution gaps. This is a pattern forming.

The strategy doesn't stop working because you stopped executing. It just stops advancing.

Tomorrow's task is the same as yesterday's. Not because I didn't notice — but because the work still needs to happen.

What's one specific thing you will do in the next 2 hours?`;
  }

  return `One execution gap. The system notes it.

Recovery is simple: execute the task today, even partially. Partial execution beats zero execution.

What's your plan for the next 90 minutes?`;
}
