import type { ResearchRun, RequestEvent, StateTransition, RaceWindow, RunConfig } from '@racepoint/shared';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function dt(base: string, offsetMs: number): string {
  return new Date(new Date(base).getTime() + offsetMs).toISOString();
}

function mkEvent(
  idx: number,
  runId: string,
  requestId: string,
  type: RequestEvent['type'],
  monotonicMs: number,
  base: string,
  extra: Partial<RequestEvent> = {},
): RequestEvent {
  return {
    id: `ev-${runId}-${idx}`,
    runId,
    requestId,
    type,
    timestamp: dt(base, monotonicMs),
    monotonicMs,
    metadata: {},
    ...extra,
  };
}

function vulnEvents(runId: string, base: string, initBalance = 10, withdrawal = 10): RequestEvent[] {
  return [
    mkEvent(1, runId, 'system', 'RUN_STARTED', 0, base),
    mkEvent(2, runId, 'REQ-001', 'REQUEST_DISPATCHED', 1.2, base, { workerId: 'W-1', metadata: { workerId: 'W-1' } }),
    mkEvent(3, runId, 'REQ-002', 'REQUEST_DISPATCHED', 1.3, base, { workerId: 'W-2', metadata: { workerId: 'W-2' } }),
    mkEvent(4, runId, 'REQ-001', 'REQUEST_RECEIVED', 5.1, base),
    mkEvent(5, runId, 'REQ-002', 'REQUEST_RECEIVED', 5.2, base),
    mkEvent(6, runId, 'REQ-001', 'STATE_READ', 5.8, base, { observedValue: initBalance, metadata: { stateId: 'balance' } }),
    mkEvent(7, runId, 'REQ-002', 'STATE_READ', 5.9, base, { observedValue: initBalance, metadata: { stateId: 'balance' } }),
    mkEvent(8, runId, 'REQ-001', 'CHECK_COMPLETED', 6.2, base, { metadata: { check: 'balance >= withdrawal', result: true } }),
    mkEvent(9, runId, 'REQ-002', 'CHECK_COMPLETED', 6.3, base, { metadata: { check: 'balance >= withdrawal', result: true } }),
    mkEvent(10, runId, 'REQ-001', 'STATE_WRITE_ATTEMPTED', 10.1, base, { previousValue: initBalance, attemptedValue: initBalance - withdrawal }),
    mkEvent(11, runId, 'REQ-001', 'STATE_WRITE_COMMITTED', 10.4, base, { committedValue: initBalance - withdrawal }),
    mkEvent(12, runId, 'REQ-002', 'STATE_WRITE_ATTEMPTED', 10.2, base, { previousValue: initBalance, attemptedValue: initBalance - withdrawal }),
    mkEvent(13, runId, 'REQ-002', 'STATE_WRITE_COMMITTED', 10.5, base, { committedValue: (initBalance - withdrawal) - withdrawal }),
    mkEvent(14, runId, 'system', 'INVARIANT_CHECKED', 10.9, base, { metadata: { preserved: false } }),
    mkEvent(15, runId, 'system', 'RUN_COMPLETED', 11.2, base, { metadata: { invariantPreserved: false } }),
  ];
}

function hardEvents(runId: string, base: string, initBalance = 10, withdrawal = 10): RequestEvent[] {
  return [
    mkEvent(1, runId, 'system', 'RUN_STARTED', 0, base),
    mkEvent(2, runId, 'REQ-001', 'REQUEST_DISPATCHED', 1.1, base, { workerId: 'W-1', metadata: { workerId: 'W-1' } }),
    mkEvent(3, runId, 'REQ-002', 'REQUEST_DISPATCHED', 1.2, base, { workerId: 'W-2', metadata: { workerId: 'W-2' } }),
    mkEvent(4, runId, 'REQ-001', 'REQUEST_RECEIVED', 5.0, base),
    mkEvent(5, runId, 'REQ-002', 'REQUEST_RECEIVED', 5.1, base),
    mkEvent(6, runId, 'REQ-001', 'LOCK_REQUESTED', 5.3, base, { metadata: { lockId: 'balance_lock' } }),
    mkEvent(7, runId, 'REQ-001', 'LOCK_ACQUIRED', 5.5, base, { metadata: { lockId: 'balance_lock' } }),
    mkEvent(8, runId, 'REQ-002', 'LOCK_REQUESTED', 5.4, base, { metadata: { lockId: 'balance_lock' } }),
    mkEvent(9, runId, 'REQ-001', 'STATE_READ', 5.8, base, { observedValue: initBalance, metadata: { stateId: 'balance' } }),
    mkEvent(10, runId, 'REQ-001', 'CHECK_COMPLETED', 6.1, base, { metadata: { result: true } }),
    mkEvent(11, runId, 'REQ-001', 'STATE_WRITE_ATTEMPTED', 10.0, base, { previousValue: initBalance, attemptedValue: initBalance - withdrawal }),
    mkEvent(12, runId, 'REQ-001', 'STATE_WRITE_COMMITTED', 10.3, base, { committedValue: initBalance - withdrawal }),
    mkEvent(13, runId, 'REQ-001', 'LOCK_RELEASED', 10.5, base, { metadata: { lockId: 'balance_lock' } }),
    mkEvent(14, runId, 'REQ-002', 'LOCK_ACQUIRED', 10.6, base, { metadata: { lockId: 'balance_lock' } }),
    mkEvent(15, runId, 'REQ-002', 'STATE_READ', 10.8, base, { observedValue: 0, metadata: { stateId: 'balance' } }),
    mkEvent(16, runId, 'REQ-002', 'CHECK_COMPLETED', 11.0, base, { metadata: { result: false } }),
    mkEvent(17, runId, 'REQ-002', 'STATE_WRITE_REJECTED', 11.1, base, { metadata: { reason: 'insufficient_balance' } }),
    mkEvent(18, runId, 'REQ-002', 'LOCK_RELEASED', 11.2, base, { metadata: { lockId: 'balance_lock' } }),
    mkEvent(19, runId, 'system', 'INVARIANT_CHECKED', 11.5, base, { metadata: { preserved: true } }),
    mkEvent(20, runId, 'system', 'RUN_COMPLETED', 11.8, base, { metadata: { invariantPreserved: true } }),
  ];
}

function vulnTransitions(runId: string, base: string): StateTransition[] {
  return [
    { id: `st-${runId}-1`, stateId: 'balance', fromValue: 10, toValue: 0, requestId: 'REQ-001', timestamp: dt(base, 10.4), committed: true, evidenceId: `EV-${runId.slice(-4).padStart(5,'0')}a` },
    { id: `st-${runId}-2`, stateId: 'balance', fromValue: 10, toValue: -10, requestId: 'REQ-002', timestamp: dt(base, 10.5), committed: true, evidenceId: `EV-${runId.slice(-4).padStart(5,'0')}b` },
  ];
}

function hardTransitions(runId: string, base: string): StateTransition[] {
  return [
    { id: `st-${runId}-1`, stateId: 'balance', fromValue: 10, toValue: 0, requestId: 'REQ-001', timestamp: dt(base, 10.3), committed: true, lockOwner: 'REQ-001' },
  ];
}

function vulnRaceWindows(runId: string): RaceWindow[] {
  return [{
    id: `rw-${runId}-1`,
    runId,
    startEventId: `ev-${runId}-6`,
    endEventId: `ev-${runId}-11`,
    startMonotonicMs: 5.8,
    endMonotonicMs: 10.4,
    participatingRequests: ['REQ-001', 'REQ-002'],
    sharedStateId: 'balance',
    observedValues: { 'REQ-001': 10, 'REQ-002': 10 },
    conclusion: 'confirmed',
    violatedInvariant: 'Balance must not fall below 0',
    evidence: [`EV-${runId.slice(-4).padStart(5,'0')}a`],
  }];
}

const cfg = (n = 2, limit = 4, bal = 10): RunConfig => ({
  concurrencyLevel: n,
  requestLimit: limit,
  timeoutSeconds: 10,
  barrierEnabled: true,
  initialState: { balance: bal },
});

// ─── Runs ─────────────────────────────────────────────────────────────────────

export const DEMO_RUNS: ResearchRun[] = [
  // RUN-2026-0001 — RACE-001 Vulnerable, violated
  {
    id: 'RUN-2026-0001', scenarioId: 'RACE-001', executionMode: 'demo', fixtureVersion: '1.0.0',
    startedAt: '2026-10-08T14:32:10.000Z', completedAt: '2026-10-08T14:32:10.012Z', status: 'completed',
    config: cfg(2, 4, 10), initialState: { balance: 10 }, finalState: { balance: -10 },
    events: vulnEvents('RUN-2026-0001', '2026-10-08T14:32:10.000Z'),
    stateTransitions: vulnTransitions('RUN-2026-0001', '2026-10-08T14:32:10.000Z'),
    raceWindows: vulnRaceWindows('RUN-2026-0001'),
    invariantResult: 'violated', evidence: ['EV-00001', 'EV-00002'],
    reproducibilityHash: 'a3f8c291b44e71d2', workerCount: 2,
  },
  // RUN-2026-0002 — RACE-001 Hardened, preserved
  {
    id: 'RUN-2026-0002', scenarioId: 'RACE-001', executionMode: 'demo', fixtureVersion: '1.0.0',
    startedAt: '2026-10-08T14:35:22.000Z', completedAt: '2026-10-08T14:35:22.014Z', status: 'completed',
    config: cfg(2, 4, 10), initialState: { balance: 10 }, finalState: { balance: 0 },
    events: hardEvents('RUN-2026-0002', '2026-10-08T14:35:22.000Z'),
    stateTransitions: hardTransitions('RUN-2026-0002', '2026-10-08T14:35:22.000Z'),
    raceWindows: [],
    invariantResult: 'preserved', evidence: ['EV-00003'],
    reproducibilityHash: 'b8d1e049c72a3f55', workerCount: 2,
  },
  // RUN-2026-0003 — RACE-002 Vulnerable, violated
  {
    id: 'RUN-2026-0003', scenarioId: 'RACE-002', executionMode: 'demo', fixtureVersion: '1.0.0',
    startedAt: '2026-10-08T10:11:05.000Z', completedAt: '2026-10-08T10:11:05.015Z', status: 'completed',
    config: cfg(4, 8, 10), initialState: { balance: 10 }, finalState: { balance: -30 },
    events: vulnEvents('RUN-2026-0003', '2026-10-08T10:11:05.000Z', 10, 10),
    stateTransitions: vulnTransitions('RUN-2026-0003', '2026-10-08T10:11:05.000Z'),
    raceWindows: vulnRaceWindows('RUN-2026-0003'),
    invariantResult: 'violated', evidence: ['EV-00004', 'EV-00005'],
    reproducibilityHash: 'c91f7b03e85a2d44', workerCount: 4,
  },
  // RUN-2026-0004 — RACE-002 Hardened, preserved
  {
    id: 'RUN-2026-0004', scenarioId: 'RACE-002', executionMode: 'demo', fixtureVersion: '1.0.0',
    startedAt: '2026-10-08T10:15:40.000Z', completedAt: '2026-10-08T10:15:40.022Z', status: 'completed',
    config: cfg(4, 8, 10), initialState: { balance: 10 }, finalState: { balance: 0 },
    events: hardEvents('RUN-2026-0004', '2026-10-08T10:15:40.000Z'),
    stateTransitions: hardTransitions('RUN-2026-0004', '2026-10-08T10:15:40.000Z'),
    raceWindows: [],
    invariantResult: 'preserved', evidence: ['EV-00006'],
    reproducibilityHash: 'd204a81f930c5e77', workerCount: 4,
  },
  // RUN-2026-0005 — RACE-003 Vulnerable, violated
  {
    id: 'RUN-2026-0005', scenarioId: 'RACE-003', executionMode: 'demo', fixtureVersion: '1.0.0',
    startedAt: '2026-10-07T16:44:18.000Z', completedAt: '2026-10-07T16:44:18.013Z', status: 'completed',
    config: cfg(2, 4, 10), initialState: { inventory: 1 }, finalState: { inventory: -1 },
    events: vulnEvents('RUN-2026-0005', '2026-10-07T16:44:18.000Z', 1, 1),
    stateTransitions: [{ id: 'st-RUN-2026-0005-1', stateId: 'inventory', fromValue: 1, toValue: -1, requestId: 'REQ-002', timestamp: '2026-10-07T16:44:18.010Z', committed: true }],
    raceWindows: vulnRaceWindows('RUN-2026-0005'),
    invariantResult: 'violated', evidence: ['EV-00007', 'EV-00008'],
    reproducibilityHash: 'e315b92c0a47f688', workerCount: 2,
  },
  // RUN-2026-0006 — RACE-003 Hardened, preserved
  {
    id: 'RUN-2026-0006', scenarioId: 'RACE-003', executionMode: 'demo', fixtureVersion: '1.0.0',
    startedAt: '2026-10-07T16:50:03.000Z', completedAt: '2026-10-07T16:50:03.016Z', status: 'completed',
    config: cfg(2, 4, 10), initialState: { inventory: 1 }, finalState: { inventory: 0 },
    events: hardEvents('RUN-2026-0006', '2026-10-07T16:50:03.000Z', 1, 1),
    stateTransitions: [{ id: 'st-RUN-2026-0006-1', stateId: 'inventory', fromValue: 1, toValue: 0, requestId: 'REQ-001', timestamp: '2026-10-07T16:50:03.011Z', committed: true }],
    raceWindows: [],
    invariantResult: 'preserved', evidence: ['EV-00009'],
    reproducibilityHash: 'f426ca3d1b58076e', workerCount: 2,
  },
  // RUN-2026-0007 — RACE-004 Vulnerable, violated
  {
    id: 'RUN-2026-0007', scenarioId: 'RACE-004', executionMode: 'demo', fixtureVersion: '1.0.0',
    startedAt: '2026-10-07T09:22:57.000Z', completedAt: '2026-10-07T09:22:57.014Z', status: 'completed',
    config: cfg(2, 4, 10), initialState: { coupon_used: false }, finalState: { used_count: 2 },
    events: vulnEvents('RUN-2026-0007', '2026-10-07T09:22:57.000Z', 1, 1),
    stateTransitions: [
      { id: 'st-RUN-2026-0007-1', stateId: 'coupon_used', fromValue: false, toValue: true, requestId: 'REQ-001', timestamp: '2026-10-07T09:22:57.010Z', committed: true },
      { id: 'st-RUN-2026-0007-2', stateId: 'coupon_used', fromValue: false, toValue: true, requestId: 'REQ-002', timestamp: '2026-10-07T09:22:57.011Z', committed: true },
    ],
    raceWindows: vulnRaceWindows('RUN-2026-0007'),
    invariantResult: 'violated', evidence: ['EV-00010', 'EV-00011'],
    reproducibilityHash: '04a7db4e2c691f89', workerCount: 2,
  },
  // RUN-2026-0008 — RACE-004 Hardened, preserved
  {
    id: 'RUN-2026-0008', scenarioId: 'RACE-004', executionMode: 'demo', fixtureVersion: '1.0.0',
    startedAt: '2026-10-07T09:28:15.000Z', completedAt: '2026-10-07T09:28:15.018Z', status: 'completed',
    config: cfg(2, 4, 10), initialState: { coupon_used: false }, finalState: { used_count: 1 },
    events: hardEvents('RUN-2026-0008', '2026-10-07T09:28:15.000Z'),
    stateTransitions: [{ id: 'st-RUN-2026-0008-1', stateId: 'coupon_used', fromValue: false, toValue: true, requestId: 'REQ-001', timestamp: '2026-10-07T09:28:15.011Z', committed: true }],
    raceWindows: [],
    invariantResult: 'preserved', evidence: ['EV-00012'],
    reproducibilityHash: '1bde4c5f7a803e90', workerCount: 2,
  },
  // RUN-2026-0009 — RACE-005 Vulnerable, violated
  {
    id: 'RUN-2026-0009', scenarioId: 'RACE-005', executionMode: 'demo', fixtureVersion: '1.0.0',
    startedAt: '2026-10-06T15:08:33.000Z', completedAt: '2026-10-06T15:08:33.012Z', status: 'completed',
    config: cfg(2, 4, 10), initialState: { balance: 10 }, finalState: { balance: -10 },
    events: vulnEvents('RUN-2026-0009', '2026-10-06T15:08:33.000Z'),
    stateTransitions: vulnTransitions('RUN-2026-0009', '2026-10-06T15:08:33.000Z'),
    raceWindows: vulnRaceWindows('RUN-2026-0009'),
    invariantResult: 'violated', evidence: ['EV-00013', 'EV-00014'],
    reproducibilityHash: '2cef5d6e8b914f01', workerCount: 2,
  },
  // RUN-2026-0010 — RACE-005 Hardened, preserved
  {
    id: 'RUN-2026-0010', scenarioId: 'RACE-005', executionMode: 'demo', fixtureVersion: '1.0.0',
    startedAt: '2026-10-06T15:12:44.000Z', completedAt: '2026-10-06T15:12:44.019Z', status: 'completed',
    config: cfg(2, 4, 10), initialState: { balance: 10 }, finalState: { balance: 0 },
    events: hardEvents('RUN-2026-0010', '2026-10-06T15:12:44.000Z'),
    stateTransitions: hardTransitions('RUN-2026-0010', '2026-10-06T15:12:44.000Z'),
    raceWindows: [],
    invariantResult: 'preserved', evidence: ['EV-00015'],
    reproducibilityHash: '3df06e7f9c025012', workerCount: 2,
  },
  // RUN-2026-0011 — RACE-006 Vulnerable, violated
  {
    id: 'RUN-2026-0011', scenarioId: 'RACE-006', executionMode: 'demo', fixtureVersion: '1.0.0',
    startedAt: '2026-10-06T11:31:09.000Z', completedAt: '2026-10-06T11:31:09.010Z', status: 'completed',
    config: cfg(2, 4, 10), initialState: { balance: 10 }, finalState: { balance: -10 },
    events: vulnEvents('RUN-2026-0011', '2026-10-06T11:31:09.000Z'),
    stateTransitions: vulnTransitions('RUN-2026-0011', '2026-10-06T11:31:09.000Z'),
    raceWindows: vulnRaceWindows('RUN-2026-0011'),
    invariantResult: 'violated', evidence: ['EV-00016', 'EV-00017'],
    reproducibilityHash: '4e017f8a0d136123', workerCount: 2,
  },
  // RUN-2026-0012 — RACE-006 Hardened, preserved
  {
    id: 'RUN-2026-0012', scenarioId: 'RACE-006', executionMode: 'demo', fixtureVersion: '1.0.0',
    startedAt: '2026-10-06T11:38:50.000Z', completedAt: '2026-10-06T11:38:50.021Z', status: 'completed',
    config: cfg(2, 4, 10), initialState: { balance: 10 }, finalState: { balance: 0 },
    events: hardEvents('RUN-2026-0012', '2026-10-06T11:38:50.000Z'),
    stateTransitions: hardTransitions('RUN-2026-0012', '2026-10-06T11:38:50.000Z'),
    raceWindows: [],
    invariantResult: 'preserved', evidence: ['EV-00018'],
    reproducibilityHash: '5f128e9b1e247234', workerCount: 2,
  },
  // RUN-2026-0013 — RACE-007 Vulnerable, violated
  {
    id: 'RUN-2026-0013', scenarioId: 'RACE-007', executionMode: 'demo', fixtureVersion: '1.0.0',
    startedAt: '2026-10-05T18:05:27.000Z', completedAt: '2026-10-05T18:05:27.011Z', status: 'completed',
    config: cfg(2, 4), initialState: { account_count: 0 }, finalState: { account_count: 2, duplicate_count: 1 },
    events: vulnEvents('RUN-2026-0013', '2026-10-05T18:05:27.000Z'),
    stateTransitions: [
      { id: 'st-RUN-2026-0013-1', stateId: 'user_registry', fromValue: 0, toValue: 1, requestId: 'REQ-001', timestamp: '2026-10-05T18:05:27.010Z', committed: true },
      { id: 'st-RUN-2026-0013-2', stateId: 'user_registry', fromValue: 0, toValue: 2, requestId: 'REQ-002', timestamp: '2026-10-05T18:05:27.011Z', committed: true },
    ],
    raceWindows: vulnRaceWindows('RUN-2026-0013'),
    invariantResult: 'violated', evidence: ['EV-00019', 'EV-00020'],
    reproducibilityHash: '6023f0ac2f358345', workerCount: 2,
  },
  // RUN-2026-0014 — RACE-007 Hardened, preserved
  {
    id: 'RUN-2026-0014', scenarioId: 'RACE-007', executionMode: 'demo', fixtureVersion: '1.0.0',
    startedAt: '2026-10-05T18:12:14.000Z', completedAt: '2026-10-05T18:12:14.024Z', status: 'completed',
    config: cfg(2, 4), initialState: { account_count: 0 }, finalState: { account_count: 1, duplicate_count: 0 },
    events: hardEvents('RUN-2026-0014', '2026-10-05T18:12:14.000Z'),
    stateTransitions: [{ id: 'st-RUN-2026-0014-1', stateId: 'user_registry', fromValue: 0, toValue: 1, requestId: 'REQ-001', timestamp: '2026-10-05T18:12:14.012Z', committed: true }],
    raceWindows: [],
    invariantResult: 'preserved', evidence: ['EV-00021'],
    reproducibilityHash: '7134a1bd3046c456', workerCount: 2,
  },
  // RUN-2026-0015 — RACE-008 Violated
  {
    id: 'RUN-2026-0015', scenarioId: 'RACE-008', executionMode: 'demo', fixtureVersion: '1.0.0',
    startedAt: '2026-10-05T12:55:01.000Z', completedAt: '2026-10-05T12:55:01.013Z', status: 'completed',
    config: cfg(2, 4), initialState: { counter: 0, limit: 5 }, finalState: { counter: 7 },
    events: vulnEvents('RUN-2026-0015', '2026-10-05T12:55:01.000Z'),
    stateTransitions: vulnTransitions('RUN-2026-0015', '2026-10-05T12:55:01.000Z'),
    raceWindows: vulnRaceWindows('RUN-2026-0015'),
    invariantResult: 'violated', evidence: ['EV-00022', 'EV-00023'],
    reproducibilityHash: '8245b2ce4157d567', workerCount: 2,
  },
  // RUN-2026-0016 — RACE-008 Preserved
  {
    id: 'RUN-2026-0016', scenarioId: 'RACE-008', executionMode: 'demo', fixtureVersion: '1.0.0',
    startedAt: '2026-10-05T13:02:18.000Z', completedAt: '2026-10-05T13:02:18.020Z', status: 'completed',
    config: cfg(2, 4), initialState: { counter: 0, limit: 5 }, finalState: { counter: 5 },
    events: hardEvents('RUN-2026-0016', '2026-10-05T13:02:18.000Z'),
    stateTransitions: hardTransitions('RUN-2026-0016', '2026-10-05T13:02:18.000Z'),
    raceWindows: [],
    invariantResult: 'preserved', evidence: ['EV-00024'],
    reproducibilityHash: '9356c3df5268e678', workerCount: 2,
  },
  // RUN-2026-0017 — Inconclusive
  {
    id: 'RUN-2026-0017', scenarioId: 'RACE-009', executionMode: 'demo', fixtureVersion: '1.0.0',
    startedAt: '2026-10-04T20:18:45.000Z', completedAt: '2026-10-04T20:18:45.011Z', status: 'completed',
    config: cfg(2, 4), initialState: { balance: 10 }, finalState: { balance: 0 },
    events: vulnEvents('RUN-2026-0017', '2026-10-04T20:18:45.000Z'),
    stateTransitions: [],
    raceWindows: [],
    invariantResult: 'inconclusive', evidence: ['EV-00025'],
    reproducibilityHash: 'a467d4e06379f789', workerCount: 2,
  },
  // RUN-2026-0018 — RACE-009 Violated
  {
    id: 'RUN-2026-0018', scenarioId: 'RACE-009', executionMode: 'demo', fixtureVersion: '1.0.0',
    startedAt: '2026-10-04T17:32:22.000Z', completedAt: '2026-10-04T17:32:22.014Z', status: 'completed',
    config: cfg(2, 4), initialState: { balance: 10 }, finalState: { balance: -10 },
    events: vulnEvents('RUN-2026-0018', '2026-10-04T17:32:22.000Z'),
    stateTransitions: vulnTransitions('RUN-2026-0018', '2026-10-04T17:32:22.000Z'),
    raceWindows: vulnRaceWindows('RUN-2026-0018'),
    invariantResult: 'violated', evidence: ['EV-00026', 'EV-00027'],
    reproducibilityHash: 'b578e5f1748a0890', workerCount: 2,
  },
  // RUN-2026-0019 — RACE-010 Violated
  {
    id: 'RUN-2026-0019', scenarioId: 'RACE-010', executionMode: 'demo', fixtureVersion: '1.0.0',
    startedAt: '2026-10-04T14:10:06.000Z', completedAt: '2026-10-04T14:10:06.016Z', status: 'completed',
    config: cfg(2, 4), initialState: { balance: 10 }, finalState: { balance: -10 },
    events: vulnEvents('RUN-2026-0019', '2026-10-04T14:10:06.000Z'),
    stateTransitions: vulnTransitions('RUN-2026-0019', '2026-10-04T14:10:06.000Z'),
    raceWindows: vulnRaceWindows('RUN-2026-0019'),
    invariantResult: 'violated', evidence: ['EV-00028', 'EV-00029'],
    reproducibilityHash: 'c689f602859b1901', workerCount: 2,
  },
  // RUN-2026-0020 — RACE-010 Preserved
  {
    id: 'RUN-2026-0020', scenarioId: 'RACE-010', executionMode: 'demo', fixtureVersion: '1.0.0',
    startedAt: '2026-10-04T14:18:55.000Z', completedAt: '2026-10-04T14:18:55.019Z', status: 'completed',
    config: cfg(2, 4), initialState: { balance: 10 }, finalState: { balance: 0 },
    events: hardEvents('RUN-2026-0020', '2026-10-04T14:18:55.000Z'),
    stateTransitions: hardTransitions('RUN-2026-0020', '2026-10-04T14:18:55.000Z'),
    raceWindows: [],
    invariantResult: 'preserved', evidence: ['EV-00030'],
    reproducibilityHash: 'd790071396ac2012', workerCount: 2,
  },
  // RUN-2026-0021 — RACE-011 Violated
  {
    id: 'RUN-2026-0021', scenarioId: 'RACE-011', executionMode: 'demo', fixtureVersion: '1.0.0',
    startedAt: '2026-10-03T19:45:30.000Z', completedAt: '2026-10-03T19:45:30.012Z', status: 'completed',
    config: cfg(2, 4), initialState: { balance: 10 }, finalState: { balance: -10 },
    events: vulnEvents('RUN-2026-0021', '2026-10-03T19:45:30.000Z'),
    stateTransitions: vulnTransitions('RUN-2026-0021', '2026-10-03T19:45:30.000Z'),
    raceWindows: vulnRaceWindows('RUN-2026-0021'),
    invariantResult: 'violated', evidence: ['EV-00031', 'EV-00032'],
    reproducibilityHash: 'e8a1182407bd3123', workerCount: 2,
  },
  // RUN-2026-0022 — RACE-011 Preserved
  {
    id: 'RUN-2026-0022', scenarioId: 'RACE-011', executionMode: 'demo', fixtureVersion: '1.0.0',
    startedAt: '2026-10-03T19:52:17.000Z', completedAt: '2026-10-03T19:52:17.023Z', status: 'completed',
    config: cfg(2, 4), initialState: { balance: 10 }, finalState: { balance: 0 },
    events: hardEvents('RUN-2026-0022', '2026-10-03T19:52:17.000Z'),
    stateTransitions: hardTransitions('RUN-2026-0022', '2026-10-03T19:52:17.000Z'),
    raceWindows: [],
    invariantResult: 'preserved', evidence: ['EV-00033'],
    reproducibilityHash: 'f9b2293518ce4234', workerCount: 2,
  },
  // RUN-2026-0023 — RACE-012 Violated
  {
    id: 'RUN-2026-0023', scenarioId: 'RACE-012', executionMode: 'demo', fixtureVersion: '1.0.0',
    startedAt: '2026-10-03T11:27:04.000Z', completedAt: '2026-10-03T11:27:04.014Z', status: 'completed',
    config: cfg(2, 4), initialState: { balance: 10 }, finalState: { balance: -10 },
    events: vulnEvents('RUN-2026-0023', '2026-10-03T11:27:04.000Z'),
    stateTransitions: vulnTransitions('RUN-2026-0023', '2026-10-03T11:27:04.000Z'),
    raceWindows: vulnRaceWindows('RUN-2026-0023'),
    invariantResult: 'violated', evidence: ['EV-00034', 'EV-00035'],
    reproducibilityHash: '0ac33a4629df5345', workerCount: 2,
  },
  // RUN-2026-0024 — RACE-012 Preserved
  {
    id: 'RUN-2026-0024', scenarioId: 'RACE-012', executionMode: 'demo', fixtureVersion: '1.0.0',
    startedAt: '2026-10-03T11:35:50.000Z', completedAt: '2026-10-03T11:35:50.018Z', status: 'completed',
    config: cfg(2, 4), initialState: { balance: 10 }, finalState: { balance: 0 },
    events: hardEvents('RUN-2026-0024', '2026-10-03T11:35:50.000Z'),
    stateTransitions: hardTransitions('RUN-2026-0024', '2026-10-03T11:35:50.000Z'),
    raceWindows: [],
    invariantResult: 'preserved', evidence: ['EV-00036'],
    reproducibilityHash: '1bd44b5730e06456', workerCount: 2,
  },
  // RUN-2026-0025 — RACE-013 Violated
  {
    id: 'RUN-2026-0025', scenarioId: 'RACE-013', executionMode: 'demo', fixtureVersion: '1.0.0',
    startedAt: '2026-10-02T22:18:41.000Z', completedAt: '2026-10-02T22:18:41.013Z', status: 'completed',
    config: cfg(2, 4), initialState: { balance: 10 }, finalState: { balance: -10 },
    events: vulnEvents('RUN-2026-0025', '2026-10-02T22:18:41.000Z'),
    stateTransitions: vulnTransitions('RUN-2026-0025', '2026-10-02T22:18:41.000Z'),
    raceWindows: vulnRaceWindows('RUN-2026-0025'),
    invariantResult: 'violated', evidence: ['EV-00037', 'EV-00038'],
    reproducibilityHash: '2ce55c6841f17567', workerCount: 2,
  },
  // RUN-2026-0026 — RACE-013 Preserved
  {
    id: 'RUN-2026-0026', scenarioId: 'RACE-013', executionMode: 'demo', fixtureVersion: '1.0.0',
    startedAt: '2026-10-02T22:26:09.000Z', completedAt: '2026-10-02T22:26:09.020Z', status: 'completed',
    config: cfg(2, 4), initialState: { balance: 10 }, finalState: { balance: 0 },
    events: hardEvents('RUN-2026-0026', '2026-10-02T22:26:09.000Z'),
    stateTransitions: hardTransitions('RUN-2026-0026', '2026-10-02T22:26:09.000Z'),
    raceWindows: [],
    invariantResult: 'preserved', evidence: ['EV-00039'],
    reproducibilityHash: '3df66d7952028678', workerCount: 2,
  },
  // RUN-2026-0027 — Failed run
  {
    id: 'RUN-2026-0027', scenarioId: 'RACE-014', executionMode: 'local-lab', fixtureVersion: '1.0.0',
    startedAt: '2026-10-02T14:05:33.000Z', status: 'failed',
    config: cfg(4, 8), initialState: { balance: 10 }, finalState: {},
    events: [mkEvent(1, 'RUN-2026-0027', 'system', 'RUN_STARTED', 0, '2026-10-02T14:05:33.000Z')],
    stateTransitions: [], raceWindows: [],
    invariantResult: 'not-evaluated', evidence: [],
    errorMessage: 'Fixture timeout: barrier wait exceeded 15.0s — all 4 coroutines failed to synchronize',
    workerCount: 4,
  },
  // RUN-2026-0028 — RACE-014 Violated
  {
    id: 'RUN-2026-0028', scenarioId: 'RACE-014', executionMode: 'demo', fixtureVersion: '1.0.0',
    startedAt: '2026-10-01T16:40:12.000Z', completedAt: '2026-10-01T16:40:12.015Z', status: 'completed',
    config: cfg(2, 4), initialState: { balance: 10 }, finalState: { balance: -10 },
    events: vulnEvents('RUN-2026-0028', '2026-10-01T16:40:12.000Z'),
    stateTransitions: vulnTransitions('RUN-2026-0028', '2026-10-01T16:40:12.000Z'),
    raceWindows: vulnRaceWindows('RUN-2026-0028'),
    invariantResult: 'violated', evidence: ['EV-00040', 'EV-00041'],
    reproducibilityHash: '4e077e8a63139789', workerCount: 2,
  },
  // RUN-2026-0029 — RACE-014 Preserved
  {
    id: 'RUN-2026-0029', scenarioId: 'RACE-014', executionMode: 'demo', fixtureVersion: '1.0.0',
    startedAt: '2026-10-01T16:48:44.000Z', completedAt: '2026-10-01T16:48:44.022Z', status: 'completed',
    config: cfg(2, 4), initialState: { balance: 10 }, finalState: { balance: 0 },
    events: hardEvents('RUN-2026-0029', '2026-10-01T16:48:44.000Z'),
    stateTransitions: hardTransitions('RUN-2026-0029', '2026-10-01T16:48:44.000Z'),
    raceWindows: [],
    invariantResult: 'preserved', evidence: ['EV-00042'],
    reproducibilityHash: '5f188f9b74240890', workerCount: 2,
  },
  // RUN-2026-0030 — Inconclusive
  {
    id: 'RUN-2026-0030', scenarioId: 'RACE-015', executionMode: 'demo', fixtureVersion: '1.0.0',
    startedAt: '2026-09-30T10:22:07.000Z', completedAt: '2026-09-30T10:22:07.012Z', status: 'completed',
    config: cfg(2, 4), initialState: { balance: 10 }, finalState: { balance: 5 },
    events: vulnEvents('RUN-2026-0030', '2026-09-30T10:22:07.000Z'),
    stateTransitions: [], raceWindows: [],
    invariantResult: 'inconclusive', evidence: ['EV-00043'],
    reproducibilityHash: '6029a0ac853518901', workerCount: 2,
  },
  // RUN-2026-0031 — RACE-015 Violated
  {
    id: 'RUN-2026-0031', scenarioId: 'RACE-015', executionMode: 'demo', fixtureVersion: '1.0.0',
    startedAt: '2026-09-29T18:15:33.000Z', completedAt: '2026-09-29T18:15:33.016Z', status: 'completed',
    config: cfg(2, 4), initialState: { balance: 10 }, finalState: { balance: -10 },
    events: vulnEvents('RUN-2026-0031', '2026-09-29T18:15:33.000Z'),
    stateTransitions: vulnTransitions('RUN-2026-0031', '2026-09-29T18:15:33.000Z'),
    raceWindows: vulnRaceWindows('RUN-2026-0031'),
    invariantResult: 'violated', evidence: ['EV-00044', 'EV-00045'],
    reproducibilityHash: '713ab1bd964629012', workerCount: 2,
  },
  // RUN-2026-0032 — RACE-015 Preserved
  {
    id: 'RUN-2026-0032', scenarioId: 'RACE-015', executionMode: 'demo', fixtureVersion: '1.0.0',
    startedAt: '2026-09-29T18:23:55.000Z', completedAt: '2026-09-29T18:23:55.024Z', status: 'completed',
    config: cfg(2, 4), initialState: { balance: 10 }, finalState: { balance: 0 },
    events: hardEvents('RUN-2026-0032', '2026-09-29T18:23:55.000Z'),
    stateTransitions: hardTransitions('RUN-2026-0032', '2026-09-29T18:23:55.000Z'),
    raceWindows: [],
    invariantResult: 'preserved', evidence: ['EV-00046'],
    reproducibilityHash: '824bc2ce0a7730123', workerCount: 2,
  },
  // RUN-2026-0033 — RACE-016 Violated (recent)
  {
    id: 'RUN-2026-0033', scenarioId: 'RACE-016', executionMode: 'demo', fixtureVersion: '1.0.0',
    startedAt: '2026-10-09T08:11:22.000Z', completedAt: '2026-10-09T08:11:22.013Z', status: 'completed',
    config: cfg(2, 4), initialState: { balance: 10 }, finalState: { balance: -10 },
    events: vulnEvents('RUN-2026-0033', '2026-10-09T08:11:22.000Z'),
    stateTransitions: vulnTransitions('RUN-2026-0033', '2026-10-09T08:11:22.000Z'),
    raceWindows: vulnRaceWindows('RUN-2026-0033'),
    invariantResult: 'violated', evidence: ['EV-00047', 'EV-00048'],
    reproducibilityHash: '935cd3df1b8841234', workerCount: 2,
  },
  // RUN-2026-0034 — RACE-016 Preserved (most recent)
  {
    id: 'RUN-2026-0034', scenarioId: 'RACE-016', executionMode: 'demo', fixtureVersion: '1.0.0',
    startedAt: '2026-10-09T08:19:44.000Z', completedAt: '2026-10-09T08:19:44.021Z', status: 'completed',
    config: cfg(2, 4), initialState: { balance: 10 }, finalState: { balance: 0 },
    events: hardEvents('RUN-2026-0034', '2026-10-09T08:19:44.000Z'),
    stateTransitions: hardTransitions('RUN-2026-0034', '2026-10-09T08:19:44.000Z'),
    raceWindows: [],
    invariantResult: 'preserved', evidence: ['EV-00049'],
    reproducibilityHash: 'a46de4e02c995345', workerCount: 2,
  },
  // RUN-2026-0035 — Failed
  {
    id: 'RUN-2026-0035', scenarioId: 'RACE-017', executionMode: 'local-lab', fixtureVersion: '1.0.0',
    startedAt: '2026-09-28T14:55:19.000Z', status: 'failed',
    config: cfg(2, 4), initialState: { balance: 10 }, finalState: {},
    events: [mkEvent(1, 'RUN-2026-0035', 'system', 'RUN_STARTED', 0, '2026-09-28T14:55:19.000Z')],
    stateTransitions: [], raceWindows: [],
    invariantResult: 'not-evaluated', evidence: [],
    errorMessage: 'SQLite connection error: database is locked (timeout 10s)',
    workerCount: 2,
  },
  // RUN-2026-0036 — RACE-017 Priority Queue, Violated
  {
    id: 'RUN-2026-0036', scenarioId: 'RACE-017', executionMode: 'demo', fixtureVersion: '1.0.0',
    startedAt: '2026-10-03T09:11:00.000Z', completedAt: '2026-10-03T09:11:00.016Z', status: 'completed',
    config: cfg(2, 4), initialState: { job_claimed_by: null, queue_depth: 5 }, finalState: { job_claimed_by: ['W-1','W-2'], queue_depth: 4 },
    events: vulnEvents('RUN-2026-0036', '2026-10-03T09:11:00.000Z'),
    stateTransitions: vulnTransitions('RUN-2026-0036', '2026-10-03T09:11:00.000Z'),
    raceWindows: vulnRaceWindows('RUN-2026-0036'),
    invariantResult: 'violated', evidence: ['EV-00050', 'EV-00051'],
    reproducibilityHash: 'b57ef5f13daa56345', workerCount: 2,
  },
  // RUN-2026-0037 — RACE-017 Priority Queue, Preserved
  {
    id: 'RUN-2026-0037', scenarioId: 'RACE-017', executionMode: 'demo', fixtureVersion: '1.1.0',
    startedAt: '2026-10-03T09:21:33.000Z', completedAt: '2026-10-03T09:21:33.019Z', status: 'completed',
    config: cfg(2, 4), initialState: { job_claimed_by: null, queue_depth: 5 }, finalState: { job_claimed_by: 'W-1', queue_depth: 4 },
    events: hardEvents('RUN-2026-0037', '2026-10-03T09:21:33.000Z'),
    stateTransitions: hardTransitions('RUN-2026-0037', '2026-10-03T09:21:33.000Z'),
    raceWindows: [],
    invariantResult: 'preserved', evidence: ['EV-00052'],
    reproducibilityHash: 'c68f060e4ebb67456', workerCount: 2,
  },
  // RUN-2026-0038 — RACE-018 Session Token, Violated
  {
    id: 'RUN-2026-0038', scenarioId: 'RACE-018', executionMode: 'demo', fixtureVersion: '1.0.0',
    startedAt: '2026-10-05T10:08:44.000Z', completedAt: '2026-10-05T10:08:44.014Z', status: 'completed',
    config: cfg(2, 4), initialState: { active_sessions: 0 }, finalState: { active_sessions: 2 },
    events: vulnEvents('RUN-2026-0038', '2026-10-05T10:08:44.000Z'),
    stateTransitions: vulnTransitions('RUN-2026-0038', '2026-10-05T10:08:44.000Z'),
    raceWindows: vulnRaceWindows('RUN-2026-0038'),
    invariantResult: 'violated', evidence: ['EV-00053', 'EV-00054'],
    reproducibilityHash: 'd79071f5fcc778567', workerCount: 2,
  },
  // RUN-2026-0039 — RACE-018 Session Token, Preserved
  {
    id: 'RUN-2026-0039', scenarioId: 'RACE-018', executionMode: 'demo', fixtureVersion: '1.1.0',
    startedAt: '2026-10-05T10:17:55.000Z', completedAt: '2026-10-05T10:17:55.022Z', status: 'completed',
    config: cfg(2, 4), initialState: { active_sessions: 0 }, finalState: { active_sessions: 1 },
    events: hardEvents('RUN-2026-0039', '2026-10-05T10:17:55.000Z'),
    stateTransitions: hardTransitions('RUN-2026-0039', '2026-10-05T10:17:55.000Z'),
    raceWindows: [],
    invariantResult: 'preserved', evidence: ['EV-00055'],
    reproducibilityHash: 'e8a182062dd889678', workerCount: 2,
  },
  // RUN-2026-0040 — RACE-019 XFF Rate Limit, Violated
  {
    id: 'RUN-2026-0040', scenarioId: 'RACE-019', executionMode: 'demo', fixtureVersion: '1.0.0',
    startedAt: '2026-10-06T14:12:11.000Z', completedAt: '2026-10-06T14:12:11.013Z', status: 'completed',
    config: cfg(2, 4), initialState: { request_count: 0 }, finalState: { request_count: 12 },
    events: vulnEvents('RUN-2026-0040', '2026-10-06T14:12:11.000Z'),
    stateTransitions: vulnTransitions('RUN-2026-0040', '2026-10-06T14:12:11.000Z'),
    raceWindows: vulnRaceWindows('RUN-2026-0040'),
    invariantResult: 'violated', evidence: ['EV-00056', 'EV-00057'],
    reproducibilityHash: 'f9b293173ee99a789', workerCount: 2,
  },
  // RUN-2026-0041 — RACE-019 XFF Rate Limit, Preserved
  {
    id: 'RUN-2026-0041', scenarioId: 'RACE-019', executionMode: 'demo', fixtureVersion: '1.1.0',
    startedAt: '2026-10-06T14:21:44.000Z', completedAt: '2026-10-06T14:21:44.018Z', status: 'completed',
    config: cfg(2, 4), initialState: { request_count: 0 }, finalState: { request_count: 10 },
    events: hardEvents('RUN-2026-0041', '2026-10-06T14:21:44.000Z'),
    stateTransitions: hardTransitions('RUN-2026-0041', '2026-10-06T14:21:44.000Z'),
    raceWindows: [],
    invariantResult: 'preserved', evidence: ['EV-00058'],
    reproducibilityHash: '0ac3a4284ffaab890', workerCount: 2,
  },
  // RUN-2026-0042 — RACE-020 Long Transaction, Violated
  {
    id: 'RUN-2026-0042', scenarioId: 'RACE-020', executionMode: 'demo', fixtureVersion: '1.0.0',
    startedAt: '2026-10-08T09:30:22.000Z', completedAt: '2026-10-08T09:30:22.531Z', status: 'completed',
    config: cfg(3, 6), initialState: { counter_value: 0 }, finalState: { counter_value: 7 },
    events: vulnEvents('RUN-2026-0042', '2026-10-08T09:30:22.000Z'),
    stateTransitions: vulnTransitions('RUN-2026-0042', '2026-10-08T09:30:22.000Z'),
    raceWindows: vulnRaceWindows('RUN-2026-0042'),
    invariantResult: 'violated', evidence: ['EV-00059', 'EV-00060'],
    reproducibilityHash: '1bd4b5395001bc901', workerCount: 3,
  },
  // RUN-2026-0043 — RACE-020 Long Transaction, Preserved
  {
    id: 'RUN-2026-0043', scenarioId: 'RACE-020', executionMode: 'demo', fixtureVersion: '1.1.0',
    startedAt: '2026-10-08T09:42:50.000Z', completedAt: '2026-10-08T09:43:01.234Z', status: 'completed',
    config: cfg(3, 6), initialState: { counter_value: 0 }, finalState: { counter_value: 15 },
    events: hardEvents('RUN-2026-0043', '2026-10-08T09:42:50.000Z'),
    stateTransitions: hardTransitions('RUN-2026-0043', '2026-10-08T09:42:50.000Z'),
    raceWindows: [],
    invariantResult: 'preserved', evidence: ['EV-00061'],
    reproducibilityHash: '2ce5c640611bcd012', workerCount: 3,
  },
];
