/**
 * AI Orchestration event names.
 *
 * In-process events (NestJS EventEmitter — fast, non-durable):
 *   Used for triggering side-effects within the same process.
 *
 * Redis Streams events (durable, replayable):
 *   Used for cross-service / crash-safe coordination.
 *   Published by AiEventBusService.
 */

// ─── Workflow events ────────────────────────────────────────────────────────
export const AI_EVENTS = {
  WORKFLOW_CREATED: 'ai.workflow.created',
  WORKFLOW_STARTED: 'ai.workflow.started',
  WORKFLOW_COMPLETED: 'ai.workflow.completed',
  WORKFLOW_FAILED: 'ai.workflow.failed',
  WORKFLOW_CANCELLED: 'ai.workflow.cancelled',

  // ─── Task (agent) events ──────────────────────────────────────────────
  TASK_CREATED: 'ai.task.created',
  TASK_STARTED: 'ai.task.started',
  TASK_COMPLETED: 'ai.task.completed',
  TASK_FAILED: 'ai.task.failed',

  // ─── Retry / healing ─────────────────────────────────────────────────
  RETRY_TRIGGERED: 'ai.retry.triggered',
  HEALING_STARTED: 'ai.healing.started',
  HEALING_COMPLETED: 'ai.healing.completed',
  HEALING_FAILED: 'ai.healing.failed',

  // ─── Provider ────────────────────────────────────────────────────────
  PROVIDER_FAILED: 'ai.provider.failed',
  PROVIDER_RECOVERED: 'ai.provider.recovered',

  // ─── Resources ───────────────────────────────────────────────────────
  TOKENS_CONSUMED: 'ai.tokens.consumed',
  BUDGET_EXHAUSTED: 'ai.budget.exhausted',

  // ─── Memory ──────────────────────────────────────────────────────────
  MEMORY_UPDATED: 'ai.memory.updated',

  // ─── AUTO MODE ───────────────────────────────────────────────────────
  AUTO_MODE_TRIGGERED: 'ai.auto_mode.triggered',
  AUTO_MODE_IDLE: 'ai.auto_mode.idle',
} as const;

export type AiEventName = (typeof AI_EVENTS)[keyof typeof AI_EVENTS];

export const AI_STREAM_NAME = 'raos:ai:events';
