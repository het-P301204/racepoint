import type { ResearchNote } from '@racepoint/shared';

export const DEMO_NOTES: ResearchNote[] = [
  {
    id: 'NOTE-001', linkedType: 'scenario', linkedId: 'RACE-001',
    content: 'Classic balance-floor race. The 5 ms artificial sleep in the vulnerable fixture is intentional — it widens the window to make the race reliably reproducible in testing. Real-world APIs often have equivalent latency from DB round-trips or external calls.\n\nKey observation: asyncio.Barrier guarantees all N coroutines enter the fixture simultaneously, making this 100% reproducible rather than probabilistic.',
    createdAt: '2026-10-08T14:40:00.000Z', updatedAt: '2026-10-08T14:40:00.000Z',
  },
  {
    id: 'NOTE-002', linkedType: 'run', linkedId: 'RUN-2026-0001',
    content: 'Race window width: 4.6 ms (from first STATE_READ to first STATE_WRITE_COMMITTED). Both requests observe balance=10 at t=5.8–5.9 ms. REQ-001 commits at t=10.4 ms, REQ-002 commits at t=10.5 ms.\n\nFinal balance: -10. Two successful withdrawals from a starting balance of 10.',
    createdAt: '2026-10-08T14:38:00.000Z', updatedAt: '2026-10-08T14:38:00.000Z',
  },
  {
    id: 'NOTE-003', linkedType: 'comparison', linkedId: 'CMP-0001',
    content: 'Runtime overhead of mutex: +2 ms (12 ms → 14 ms). Acceptable trade-off for correctness.\n\nNote: the hardened runtime includes lock acquisition and release overhead. Under higher concurrency (N=8), the overhead grows to ~+8 ms due to queued waits — still well within acceptable bounds for financial operations.',
    createdAt: '2026-10-08T14:37:00.000Z', updatedAt: '2026-10-09T09:00:00.000Z',
  },
  {
    id: 'NOTE-004', linkedType: 'scenario', linkedId: 'RACE-004',
    content: 'Coupon double-spend is one of the most common race conditions in e-commerce systems. The atomic CAS mitigation is more efficient than a mutex here because it avoids the overhead of acquiring a lock for the read phase.\n\nAlternative mitigations:\n- Database-level: UPDATE coupons SET used=1 WHERE id=? AND used=0 (check return code for 0 rows)\n- Redis: SET NX (set if not exists) for distributed systems\n- Application-level: asyncio.Lock (simpler but adds lock overhead to read path)',
    createdAt: '2026-10-07T09:35:00.000Z', updatedAt: '2026-10-07T09:35:00.000Z',
  },
  {
    id: 'NOTE-005', linkedType: 'scenario', linkedId: 'RACE-007',
    content: 'The DB UNIQUE constraint mitigation is arguably the most robust approach for account creation — it handles the race at the storage layer regardless of application-level concurrency control.\n\nCaveat: the application must handle IntegrityError correctly and return a proper user-facing error. Some ORMs swallow this error or convert it to a generic 500.',
    createdAt: '2026-10-05T18:20:00.000Z', updatedAt: '2026-10-05T18:20:00.000Z',
  },
  {
    id: 'NOTE-006', linkedType: 'run', linkedId: 'RUN-2026-0027',
    content: 'Failed run — barrier timeout with 4 workers. Root cause: the fixture\'s 5 ms sleep is per-request, so barrier wait deadline was too tight at the default 15 s.\n\nFix: increase barrier_wait_timeout in RunConfig, or reduce the fixture sleep. This is a test harness configuration issue, not a vulnerability.',
    createdAt: '2026-10-02T14:10:00.000Z', updatedAt: '2026-10-02T14:10:00.000Z',
  },
  {
    id: 'NOTE-007', linkedType: 'evidence', linkedId: 'EV-00002',
    content: 'The most severe single evidence record in this dataset. Final committed value of -10 with two concurrent withdrawals from balance=10 is a textbook TOCTOU violation.\n\nThis exact pattern was behind several real-world fintech incidents in 2022–2024, including a reported $2M loss at a crypto exchange from concurrent API calls.',
    createdAt: '2026-10-08T14:45:00.000Z', updatedAt: '2026-10-08T14:45:00.000Z',
  },
  {
    id: 'NOTE-008', linkedType: 'run', linkedId: 'RUN-2026-0017',
    content: 'Inconclusive run — the race window existed (both STATE_READ events observed balance=10) but by the time REQ-002 attempted its write, the OS scheduler had already let REQ-001 complete. This is normal non-determinism.\n\nThe follow-up run RUN-2026-0018 used the same config and reproduced the violation, confirming this was a timing fluke rather than a false negative.',
    createdAt: '2026-10-04T20:25:00.000Z', updatedAt: '2026-10-04T20:25:00.000Z',
  },
];
