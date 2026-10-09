// ─── Enumerations ────────────────────────────────────────────────────────────

export type ExecutionMode = 'demo' | 'local-lab' | 'controlled-reproduction' | 'simulated';
export type ScenarioCategory =
  | 'http-limit-override'
  | 'coupon-redemption'
  | 'gift-card-balance'
  | 'inventory-update'
  | 'account-registration'
  | 'database-toctou'
  | 'filesystem-toctou'
  | 'distributed-state'
  | 'rate-limit-counter'
  | 'queue-job-claim'
  | 'session-issuance'
  | 'atomicity-locking';

export type ScenarioDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type RunStatus = 'idle' | 'starting' | 'running' | 'completed' | 'failed' | 'cancelled' | 'inconclusive';
export type InvariantResult = 'preserved' | 'violated' | 'inconclusive' | 'not-evaluated';
export type EventType =
  | 'RUN_STARTED'
  | 'REQUEST_DISPATCHED'
  | 'REQUEST_RECEIVED'
  | 'STATE_READ'
  | 'CHECK_COMPLETED'
  | 'LOCK_REQUESTED'
  | 'LOCK_ACQUIRED'
  | 'LOCK_RELEASED'
  | 'TRANSACTION_STARTED'
  | 'TRANSACTION_COMMITTED'
  | 'TRANSACTION_ROLLED_BACK'
  | 'STATE_WRITE_ATTEMPTED'
  | 'STATE_WRITE_COMMITTED'
  | 'STATE_WRITE_REJECTED'
  | 'RESPONSE_SENT'
  | 'INVARIANT_CHECKED'
  | 'RUN_COMPLETED'
  | 'RUN_FAILED';

export type MitigationType =
  | 'atomic-update'
  | 'optimistic-locking'
  | 'pessimistic-locking'
  | 'database-constraint'
  | 'atomic-file-creation'
  | 'compare-and-set'
  | 'idempotency-key'
  | 'serialized-queue'
  | 'distributed-lock';

// ─── Core Domain ─────────────────────────────────────────────────────────────

export interface Invariant {
  type: 'minimum_balance' | 'single_use' | 'unique_account' | 'non_negative' | 'max_count';
  description: string;
  constraint: Record<string, unknown>;
}

export interface Fixture {
  id: string;
  name: string;
  version: string;
  mode: 'vulnerable' | 'hardened';
  language: 'python' | 'typescript';
  description: string;
  mitigationType?: MitigationType;
  mitigationDescription?: string;
}

export interface Scenario {
  id: string;                  // RACE-001
  name: string;
  description: string;
  category: ScenarioCategory;
  difficulty: ScenarioDifficulty;
  fixture: Fixture;
  hardenedFixture: Fixture;
  sharedState: string;
  invariant: Invariant;
  expectedVulnerableResult: InvariantResult;
  expectedHardenedResult: InvariantResult;
  executionMode: ExecutionMode;
  tags: string[];
  lastRun?: string;            // ISO timestamp
  status: 'available' | 'running' | 'unavailable';
  evidenceAvailable: boolean;
}

// ─── Events & Timeline ───────────────────────────────────────────────────────

export interface RequestEvent {
  id: string;
  runId: string;
  requestId: string;
  type: EventType;
  timestamp: string;           // ISO
  monotonicMs: number;         // ms since run start
  metadata: Record<string, unknown>;
  observedValue?: unknown;
  attemptedValue?: unknown;
  committedValue?: unknown;
  previousValue?: unknown;
  workerId?: string;
}

export interface StateSnapshot {
  stateId: string;
  value: unknown;
  timestamp: string;
  requestId: string;
  version: number;
}

export interface StateTransition {
  id: string;
  stateId: string;
  fromValue: unknown;
  toValue: unknown;
  requestId: string;
  timestamp: string;
  committed: boolean;
  transactionId?: string;
  lockOwner?: string;
  evidenceId?: string;
}

export interface RaceWindow {
  id: string;
  runId: string;
  startEventId: string;
  endEventId: string;
  startMonotonicMs: number;
  endMonotonicMs: number;
  participatingRequests: string[];
  sharedStateId: string;
  observedValues: Record<string, unknown>;   // requestId → observed value
  conclusion: 'confirmed' | 'plausible' | 'inconclusive';
  violatedInvariant?: string;
  evidence: string[];
}

// ─── Research Run ─────────────────────────────────────────────────────────────

export interface RunConfig {
  concurrencyLevel: number;
  requestLimit: number;
  timeoutSeconds: number;
  barrierEnabled: boolean;
  initialState: Record<string, unknown>;
}

export interface ResearchRun {
  id: string;                  // RUN-2026-0041
  scenarioId: string;
  executionMode: ExecutionMode;
  fixtureVersion: string;
  startedAt: string;
  completedAt?: string;
  status: RunStatus;
  config: RunConfig;
  events: RequestEvent[];
  initialState: Record<string, unknown>;
  finalState: Record<string, unknown>;
  stateTransitions: StateTransition[];
  raceWindows: RaceWindow[];
  invariantResult: InvariantResult;
  evidence: string[];          // evidence IDs
  errorMessage?: string;
  reproducibilityHash?: string;
  workerCount?: number;
}

// ─── Evidence ────────────────────────────────────────────────────────────────

export interface Evidence {
  id: string;                  // EV-00821
  runId: string;
  scenarioId: string;
  executionMode: ExecutionMode;
  fixtureVersion: string;
  requestId: string;
  eventType: EventType;
  timestamp: string;
  observedState: unknown;
  expectedInvariant: string;
  actualResult: InvariantResult;
  mitigation?: MitigationType;
  codeLocation?: string;
  environmentMetadata: Record<string, string>;
  raceWindowId?: string;
}

// ─── Comparison ──────────────────────────────────────────────────────────────

export interface Comparison {
  id: string;
  scenarioId: string;
  vulnerableRunId: string;
  hardenedRunId: string;
  createdAt: string;
  vulnerableResult: InvariantResult;
  hardenedResult: InvariantResult;
  vulnerableRaceWindows: number;
  hardenedRaceWindows: number;
  vulnerableRuntimeMs: number;
  hardenedRuntimeMs: number;
  mitigationType: MitigationType;
  summary: string;
}

// ─── Research Notes & Activity ────────────────────────────────────────────────

export interface ResearchNote {
  id: string;
  linkedType: 'scenario' | 'run' | 'evidence' | 'comparison';
  linkedId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityEntry {
  id: string;
  type:
    | 'run_completed'
    | 'run_failed'
    | 'invariant_violated'
    | 'hardened_comparison'
    | 'evidence_captured'
    | 'lab_started'
    | 'lab_stopped'
    | 'inconclusive';
  message: string;
  timestamp: string;
  linkedId?: string;
  linkedType?: 'run' | 'scenario' | 'evidence';
  result?: InvariantResult;
}

// ─── Dataset ─────────────────────────────────────────────────────────────────

export interface DatasetVersion {
  version: string;
  createdAt: string;
  scenarios: Scenario[];
  runs: ResearchRun[];
  evidence: Evidence[];
  comparisons: Comparison[];
  activity: ActivityEntry[];
}

// ─── API ─────────────────────────────────────────────────────────────────────

export interface LabRunRequest {
  scenarioId: string;
  mode: 'vulnerable' | 'hardened';
  concurrencyLevel: number;
  requestLimit: number;
}

export interface LabRunResponse {
  runId: string;
  status: RunStatus;
  message: string;
}

export interface SystemStatus {
  labReady: boolean;
  dbConnected: boolean;
  activeRuns: number;
  lastChecked: string;
}
