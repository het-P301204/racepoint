import type { Scenario } from '@racepoint/shared'

export const DEMO_SCENARIOS: Scenario[] = [
  // ── RACE-001 ──────────────────────────────────────────────────────────────
  {
    id: 'RACE-001',
    name: 'Gift Card Balance Drain — asyncio Barrier',
    description:
      'Two concurrent withdrawal requests both read a $10 gift card balance, both pass the non-negative check, and both commit a $10 debit — producing a final balance of −$10. The asyncio.Barrier synchronises thread entry so the race window is reliably opened on every run. Demonstrates classic TOCTOU on an in-memory shared counter backed by SQLite.',
    category: 'gift-card-balance',
    difficulty: 'beginner',
    fixture: {
      id: 'FIX-001-V',
      name: 'balance_vulnerable',
      version: '1.0.0',
      mode: 'vulnerable',
      language: 'python',
      description:
        'Reads balance, checks balance >= amount, then writes balance − amount in three non-atomic steps. No locking around the read-check-write sequence.',
    },
    hardenedFixture: {
      id: 'FIX-001-H',
      name: 'balance_hardened',
      version: '1.1.0',
      mode: 'hardened',
      language: 'python',
      description:
        'Wraps the entire read-check-write sequence inside asyncio.Lock(). Only one coroutine may hold the lock at a time, serialising all balance mutations.',
      mitigationType: 'pessimistic-locking',
      mitigationDescription:
        'asyncio.Lock() acquired before read, released after write. Guarantees mutual exclusion across all concurrent withdrawal coroutines.',
    },
    sharedState: 'gift_card_balance',
    invariant: {
      type: 'non_negative',
      description: 'Gift card balance must never fall below zero',
      constraint: { minimum: 0, field: 'balance' },
    },
    expectedVulnerableResult: 'violated',
    expectedHardenedResult: 'preserved',
    executionMode: 'controlled-reproduction',
    tags: ['asyncio', 'barrier', 'toctou', 'balance', 'withdrawal'],
    lastRun: '2026-10-08T09:00:00Z',
    status: 'available',
    evidenceAvailable: true,
  },

  // ── RACE-002 ──────────────────────────────────────────────────────────────
  {
    id: 'RACE-002',
    name: 'Gift Card Overdraft — Four-Way Concurrency',
    description:
      'Four simultaneous $10 withdrawals against a $10 balance. Without locking, the SQLite read-modify-write sequence races across all four workers, allowing multiple commits and driving the balance to −$30. The asyncio.Barrier ensures all four coroutines enter the critical section concurrently.',
    category: 'gift-card-balance',
    difficulty: 'intermediate',
    fixture: {
      id: 'FIX-002-V',
      name: 'balance_overdraft_vulnerable',
      version: '1.0.0',
      mode: 'vulnerable',
      language: 'python',
      description:
        'Four-worker variant of the balance drain. No locking. SQLite default journal mode allows concurrent reads before any write lands.',
    },
    hardenedFixture: {
      id: 'FIX-002-H',
      name: 'balance_overdraft_hardened',
      version: '1.1.0',
      mode: 'hardened',
      language: 'python',
      description:
        'Uses SQLite BEGIN IMMEDIATE transaction to acquire a write lock before the read. Only one transaction succeeds; others receive SQLITE_BUSY and return an error.',
      mitigationType: 'atomic-update',
      mitigationDescription:
        'SQLite BEGIN IMMEDIATE + UPDATE WHERE balance >= amount in a single atomic statement. Rejects concurrent writes at the DB layer.',
    },
    sharedState: 'gift_card_balance',
    invariant: {
      type: 'non_negative',
      description: 'Gift card balance must never fall below zero regardless of concurrency level',
      constraint: { minimum: 0, field: 'balance', maxConcurrency: 4 },
    },
    expectedVulnerableResult: 'violated',
    expectedHardenedResult: 'preserved',
    executionMode: 'controlled-reproduction',
    tags: ['sqlite', 'four-way', 'overdraft', 'balance', 'begin-immediate'],
    lastRun: '2026-10-06T14:00:00Z',
    status: 'available',
    evidenceAvailable: true,
  },

  // ── RACE-003 ──────────────────────────────────────────────────────────────
  {
    id: 'RACE-003',
    name: 'Coupon Single-Use Bypass',
    description:
      'A promotional coupon marked single-use is redeemed twice in a race window. Both requests read the coupon status as "unredeemed", both pass the usage check, and both mark it as redeemed — resulting in two successful redemptions against a one-redemption invariant.',
    category: 'coupon-redemption',
    difficulty: 'beginner',
    fixture: {
      id: 'FIX-003-V',
      name: 'coupon_vulnerable',
      version: '1.0.0',
      mode: 'vulnerable',
      language: 'python',
      description:
        'SELECT status → check → UPDATE pattern without any row-level lock. Two concurrent requests both see status=unredeemed before either update lands.',
    },
    hardenedFixture: {
      id: 'FIX-003-H',
      name: 'coupon_hardened',
      version: '1.1.0',
      mode: 'hardened',
      language: 'python',
      description:
        'Uses SELECT FOR UPDATE (PostgreSQL) or UPDATE WHERE status=unredeemed (SQLite) with row-level locking. Only one update succeeds; the second sees zero rows affected.',
      mitigationType: 'database-constraint',
      mitigationDescription:
        'Unique partial index on (coupon_id) WHERE status = redeemed prevents duplicate redemption at the database constraint level.',
    },
    sharedState: 'coupon_status',
    invariant: {
      type: 'single_use',
      description: 'Each coupon may be redeemed at most once',
      constraint: { maxRedemptions: 1, field: 'redemption_count' },
    },
    expectedVulnerableResult: 'violated',
    expectedHardenedResult: 'preserved',
    executionMode: 'controlled-reproduction',
    tags: ['coupon', 'single-use', 'select-for-update', 'toctou', 'redemption'],
    lastRun: '2026-09-27T10:00:00Z',
    status: 'available',
    evidenceAvailable: true,
  },

  // ── RACE-004 ──────────────────────────────────────────────────────────────
  {
    id: 'RACE-004',
    name: 'Coupon Stack Overflow — Three Concurrent Claims',
    description:
      'A coupon batch limited to two redemptions is claimed three times simultaneously. The race allows all three workers to observe remaining_count > 0, decrement independently, and push the counter below zero.',
    category: 'coupon-redemption',
    difficulty: 'intermediate',
    fixture: {
      id: 'FIX-004-V',
      name: 'coupon_batch_vulnerable',
      version: '1.0.0',
      mode: 'vulnerable',
      language: 'python',
      description:
        'Read-decrement-write on coupon remaining_count with no serialisation. Three concurrent decrements can all observe count=2 before any write commits.',
    },
    hardenedFixture: {
      id: 'FIX-004-H',
      name: 'coupon_batch_hardened',
      version: '1.1.0',
      mode: 'hardened',
      language: 'python',
      description:
        'Atomic UPDATE SET remaining_count = remaining_count − 1 WHERE remaining_count > 0. Returns rows_affected; zero means the batch is exhausted.',
      mitigationType: 'atomic-update',
      mitigationDescription:
        'Single UPDATE statement atomically decrements and checks. No separate read phase. Database engine serialises concurrent writes to the same row.',
    },
    sharedState: 'coupon_batch_remaining',
    invariant: {
      type: 'max_count',
      description: 'Coupon batch redemption count must not exceed the configured maximum',
      constraint: { maxCount: 2, field: 'remaining_count', minimum: 0 },
    },
    expectedVulnerableResult: 'violated',
    expectedHardenedResult: 'preserved',
    executionMode: 'controlled-reproduction',
    tags: ['coupon', 'batch', 'counter', 'atomic-update', 'overflow'],
    lastRun: '2026-09-15T10:00:00Z',
    status: 'available',
    evidenceAvailable: true,
  },

  // ── RACE-005 ──────────────────────────────────────────────────────────────
  {
    id: 'RACE-005',
    name: 'Inventory Oversell — Concurrent Purchase Requests',
    description:
      'Two concurrent purchase requests both observe inventory_count = 1, both decrement, and commit a final inventory of −1. Classic oversell race. The asyncio.Barrier ensures both requests enter the check-and-decrement phase concurrently before either write lands.',
    category: 'inventory-update',
    difficulty: 'beginner',
    fixture: {
      id: 'FIX-005-V',
      name: 'inventory_vulnerable',
      version: '1.0.0',
      mode: 'vulnerable',
      language: 'python',
      description:
        'SELECT quantity → if quantity > 0 → UPDATE quantity = quantity − 1. No atomic update. Concurrent SELECTs all see quantity=1 before any UPDATE.',
    },
    hardenedFixture: {
      id: 'FIX-005-H',
      name: 'inventory_hardened',
      version: '1.1.0',
      mode: 'hardened',
      language: 'python',
      description:
        'UPDATE inventory SET quantity = quantity − 1 WHERE quantity > 0 AND sku = ?; checks rows_affected to determine success.',
      mitigationType: 'atomic-update',
      mitigationDescription:
        'Conditional atomic decrement. Database engine prevents quantity from going below zero by including the WHERE quantity > 0 predicate in the write.',
    },
    sharedState: 'inventory_quantity',
    invariant: {
      type: 'non_negative',
      description: 'Inventory quantity must never fall below zero',
      constraint: { minimum: 0, field: 'quantity' },
    },
    expectedVulnerableResult: 'violated',
    expectedHardenedResult: 'preserved',
    executionMode: 'controlled-reproduction',
    tags: ['inventory', 'oversell', 'quantity', 'atomic-update', 'purchase'],
    lastRun: '2026-09-12T14:00:00Z',
    status: 'available',
    evidenceAvailable: true,
  },

  // ── RACE-006 ──────────────────────────────────────────────────────────────
  {
    id: 'RACE-006',
    name: 'Flash Sale Inventory — High Concurrency Burst',
    description:
      'A flash sale with 5 units available receives 8 concurrent purchase requests. Without atomic enforcement, all 8 can observe quantity ≥ 1 and commit, leaving quantity at −3. Simulates high-load flash sale scenarios common in e-commerce platforms.',
    category: 'inventory-update',
    difficulty: 'advanced',
    fixture: {
      id: 'FIX-006-V',
      name: 'flash_sale_vulnerable',
      version: '1.0.0',
      mode: 'vulnerable',
      language: 'python',
      description:
        'Eight-worker flash sale scenario. No locking. SQLite WAL mode allows multiple concurrent readers before the first writer commits.',
    },
    hardenedFixture: {
      id: 'FIX-006-H',
      name: 'flash_sale_hardened',
      version: '1.1.0',
      mode: 'hardened',
      language: 'python',
      description:
        'Optimistic locking with version column. UPDATE ... WHERE version = ? AND quantity > 0. Retries on version mismatch. Guarantees exactly 5 successful purchases.',
      mitigationType: 'optimistic-locking',
      mitigationDescription:
        'Version-column optimistic locking. Each update includes the version read during SELECT. Mismatched version (concurrent update) triggers retry up to 3 times.',
    },
    sharedState: 'flash_sale_inventory',
    invariant: {
      type: 'non_negative',
      description: 'Flash sale inventory must not fall below zero even under burst load',
      constraint: { minimum: 0, field: 'quantity', initialStock: 5 },
    },
    expectedVulnerableResult: 'violated',
    expectedHardenedResult: 'preserved',
    executionMode: 'controlled-reproduction',
    tags: ['flash-sale', 'inventory', 'optimistic-locking', 'burst', 'version-column'],
    lastRun: '2026-08-26T14:00:00Z',
    status: 'available',
    evidenceAvailable: true,
  },

  // ── RACE-007 ──────────────────────────────────────────────────────────────
  {
    id: 'RACE-007',
    name: 'Account Registration — Duplicate Username Race',
    description:
      'Two concurrent registration requests for the same username both pass the uniqueness check simultaneously, both insert a record, and produce two accounts with identical usernames — violating the unique_account invariant. Demonstrates the classic check-then-act race in user registration flows.',
    category: 'account-registration',
    difficulty: 'intermediate',
    fixture: {
      id: 'FIX-007-V',
      name: 'registration_vulnerable',
      version: '1.0.0',
      mode: 'vulnerable',
      language: 'python',
      description:
        'SELECT COUNT(*) WHERE username = ? → if 0 → INSERT. No unique constraint on the table. Both selects return 0 before either insert commits.',
    },
    hardenedFixture: {
      id: 'FIX-007-H',
      name: 'registration_hardened',
      version: '1.1.0',
      mode: 'hardened',
      language: 'python',
      description:
        'Unique index on username column. INSERT OR IGNORE / INSERT ON CONFLICT DO NOTHING. Exactly one insert succeeds; the second receives a constraint violation.',
      mitigationType: 'database-constraint',
      mitigationDescription:
        'UNIQUE constraint on the username column enforced at the database level. The application catches IntegrityError and returns a duplicate-username error to the client.',
    },
    sharedState: 'user_account_registry',
    invariant: {
      type: 'unique_account',
      description: 'Each username must appear at most once in the user registry',
      constraint: { uniqueField: 'username', tableName: 'users' },
    },
    expectedVulnerableResult: 'violated',
    expectedHardenedResult: 'preserved',
    executionMode: 'controlled-reproduction',
    tags: ['registration', 'unique-constraint', 'insert-race', 'username', 'duplicate'],
    lastRun: '2026-08-28T15:00:00Z',
    status: 'available',
    evidenceAvailable: true,
  },

  // ── RACE-008 ──────────────────────────────────────────────────────────────
  {
    id: 'RACE-008',
    name: 'Account Registration — Email Verification Token Race',
    description:
      'Two concurrent email verification flows for the same account both validate a one-time token and attempt to mark it as consumed. Both see status=pending, both mark status=verified, potentially allowing second-use of a registration token or dual account activation.',
    category: 'account-registration',
    difficulty: 'advanced',
    fixture: {
      id: 'FIX-008-V',
      name: 'email_verify_vulnerable',
      version: '1.0.0',
      mode: 'vulnerable',
      language: 'python',
      description:
        'SELECT token WHERE status=pending → UPDATE status=verified. Non-atomic. Two concurrent flows both observe status=pending.',
    },
    hardenedFixture: {
      id: 'FIX-008-H',
      name: 'email_verify_hardened',
      version: '1.1.0',
      mode: 'hardened',
      language: 'python',
      description:
        'UPDATE tokens SET status=verified WHERE token=? AND status=pending. Checks rows_affected. Only the first update returns affected=1.',
      mitigationType: 'compare-and-set',
      mitigationDescription:
        'Compare-and-set: UPDATE only if status = pending. Atomically transitions from pending → verified. Second concurrent update hits WHERE status=pending = false and returns 0 rows affected.',
    },
    sharedState: 'email_verification_token',
    invariant: {
      type: 'single_use',
      description: 'Each email verification token may be consumed at most once',
      constraint: { field: 'token_status', allowedTransition: 'pending→verified', maxUse: 1 },
    },
    expectedVulnerableResult: 'violated',
    expectedHardenedResult: 'preserved',
    executionMode: 'controlled-reproduction',
    tags: ['registration', 'token', 'compare-and-set', 'email-verify', 'single-use'],
    lastRun: '2026-08-28T10:00:00Z',
    status: 'available',
    evidenceAvailable: true,
  },

  // ── RACE-009 ──────────────────────────────────────────────────────────────
  {
    id: 'RACE-009',
    name: 'Rate Limit Counter — Request Burst Bypass',
    description:
      'A per-user rate limiter allows 5 requests per minute. Three concurrent requests all read counter=4 (one below the limit), all increment to 5, and all receive a 200 response — allowing 3 requests through when only 1 should have been permitted before hitting the cap.',
    category: 'rate-limit-counter',
    difficulty: 'intermediate',
    fixture: {
      id: 'FIX-009-V',
      name: 'rate_limit_vulnerable',
      version: '1.0.0',
      mode: 'vulnerable',
      language: 'python',
      description:
        'GET counter → if < limit → SET counter = counter + 1 → allow. Race window between GET and SET allows multiple requests to observe counter = 4.',
    },
    hardenedFixture: {
      id: 'FIX-009-H',
      name: 'rate_limit_hardened',
      version: '1.1.0',
      mode: 'hardened',
      language: 'python',
      description:
        'Redis INCR + check. INCR is atomic: returns the post-increment value. If result > limit, respond 429 and decrement. No race between read and write.',
      mitigationType: 'atomic-update',
      mitigationDescription:
        'Redis INCR returns the new value atomically. No separate read phase. Any coroutine whose INCR result exceeds the limit is immediately rejected.',
    },
    sharedState: 'rate_limit_counter',
    invariant: {
      type: 'max_count',
      description: 'Request count within the rate limit window must not exceed the configured limit',
      constraint: { maxCount: 5, field: 'request_count', windowSeconds: 60 },
    },
    expectedVulnerableResult: 'violated',
    expectedHardenedResult: 'preserved',
    executionMode: 'controlled-reproduction',
    tags: ['rate-limit', 'redis-incr', 'counter', 'burst', 'atomic'],
    lastRun: '2026-09-02T09:00:00Z',
    status: 'available',
    evidenceAvailable: true,
  },

  // ── RACE-010 ──────────────────────────────────────────────────────────────
  {
    id: 'RACE-010',
    name: 'Rate Limit — Sliding Window Counter Race',
    description:
      'A sliding window rate limiter with a 10-request cap. Four concurrent requests all read within the window before any write commits, all produce a count of 9 (one below limit), and all proceed — allowing 4 simultaneous threshold crossings.',
    category: 'rate-limit-counter',
    difficulty: 'advanced',
    fixture: {
      id: 'FIX-010-V',
      name: 'sliding_window_vulnerable',
      version: '1.0.0',
      mode: 'vulnerable',
      language: 'python',
      description:
        'Counts requests in a sliding window using sorted set timestamps. ZCARD + ZADD without atomic wrapper allows concurrent read-add races.',
    },
    hardenedFixture: {
      id: 'FIX-010-H',
      name: 'sliding_window_hardened',
      version: '1.1.0',
      mode: 'hardened',
      language: 'python',
      description:
        'Lua script on Redis executes ZREMRANGEBYSCORE + ZCARD + ZADD atomically. Redis serialises Lua execution, preventing race between count-check and add.',
      mitigationType: 'serialized-queue',
      mitigationDescription:
        'Redis Lua script. All window operations execute atomically within the Lua interpreter. No other client commands interleave during script execution.',
    },
    sharedState: 'sliding_window_set',
    invariant: {
      type: 'max_count',
      description: 'Requests within any sliding window interval must not exceed the configured limit',
      constraint: { maxCount: 10, field: 'window_count', windowSeconds: 60 },
    },
    expectedVulnerableResult: 'violated',
    expectedHardenedResult: 'preserved',
    executionMode: 'controlled-reproduction',
    tags: ['rate-limit', 'sliding-window', 'lua-script', 'redis', 'sorted-set'],
    lastRun: '2026-09-02T14:00:00Z',
    status: 'available',
    evidenceAvailable: true,
  },

  // ── RACE-011 ──────────────────────────────────────────────────────────────
  {
    id: 'RACE-011',
    name: 'Database TOCTOU — Balance Transfer Interleave',
    description:
      'A bank transfer reads source and destination balances, checks the source has sufficient funds, then updates both accounts. A concurrent transfer on the same source account runs between the check and the update, allowing the source balance to drop below zero without detection.',
    category: 'database-toctou',
    difficulty: 'advanced',
    fixture: {
      id: 'FIX-011-V',
      name: 'transfer_vulnerable',
      version: '1.0.0',
      mode: 'vulnerable',
      language: 'python',
      description:
        'BEGIN → SELECT balance → check → UPDATE source − amount → UPDATE dest + amount → COMMIT. Default READ COMMITTED isolation allows a concurrent transaction to modify source between SELECT and UPDATE.',
    },
    hardenedFixture: {
      id: 'FIX-011-H',
      name: 'transfer_hardened',
      version: '1.1.0',
      mode: 'hardened',
      language: 'python',
      description:
        'SERIALIZABLE isolation level plus SELECT FOR UPDATE on both accounts. Concurrent transactions are serialised. The second transfer sees the updated source balance.',
      mitigationType: 'pessimistic-locking',
      mitigationDescription:
        'SELECT FOR UPDATE acquires row-level write locks on both source and destination accounts. Combined with SERIALIZABLE isolation, prevents phantom reads during the check phase.',
    },
    sharedState: 'bank_account_balance',
    invariant: {
      type: 'non_negative',
      description: 'No bank account balance may fall below zero after any transfer',
      constraint: { minimum: 0, field: 'balance', operation: 'transfer' },
    },
    expectedVulnerableResult: 'violated',
    expectedHardenedResult: 'preserved',
    executionMode: 'controlled-reproduction',
    tags: ['database', 'toctou', 'transfer', 'isolation-level', 'select-for-update'],
    lastRun: '2026-09-05T10:00:00Z',
    status: 'available',
    evidenceAvailable: true,
  },

  // ── RACE-012 ──────────────────────────────────────────────────────────────
  {
    id: 'RACE-012',
    name: 'Database TOCTOU — Auction Bid Race',
    description:
      'An auction accepts the first bid above the current highest bid. Two concurrent bids both observe current_bid = $50, both exceed the floor, and both insert as winning bids — leaving two records with conflicting winning status in the database.',
    category: 'database-toctou',
    difficulty: 'expert',
    fixture: {
      id: 'FIX-012-V',
      name: 'auction_bid_vulnerable',
      version: '1.0.0',
      mode: 'vulnerable',
      language: 'python',
      description:
        'SELECT max(amount) → check > floor → INSERT bid → UPDATE current_highest. Non-atomic. Both concurrent transactions see the same highest bid before either inserts.',
    },
    hardenedFixture: {
      id: 'FIX-012-H',
      name: 'auction_bid_hardened',
      version: '1.1.0',
      mode: 'hardened',
      language: 'python',
      description:
        'Optimistic locking on auction row version. UPDATE auctions SET current_bid = ?, version = version+1 WHERE id = ? AND version = ?. Second update sees version mismatch and retries or fails.',
      mitigationType: 'optimistic-locking',
      mitigationDescription:
        'Version-based optimistic locking on the auction record. Concurrent bid insertion is gated on matching the version read during the check phase. Version mismatch triggers a retry loop.',
    },
    sharedState: 'auction_current_bid',
    invariant: {
      type: 'single_use',
      description: 'Exactly one bid may win each auction round',
      constraint: { field: 'winning_bid_id', uniquePerAuction: true },
    },
    expectedVulnerableResult: 'violated',
    expectedHardenedResult: 'preserved',
    executionMode: 'controlled-reproduction',
    tags: ['auction', 'bid', 'optimistic-locking', 'version', 'toctou'],
    lastRun: '2026-09-05T15:00:00Z',
    status: 'available',
    evidenceAvailable: true,
  },

  // ── RACE-013 ──────────────────────────────────────────────────────────────
  {
    id: 'RACE-013',
    name: 'Filesystem TOCTOU — Lock File Creation Race',
    description:
      'Two processes both check for the absence of a lock file, both observe it missing, and both create it — resulting in two concurrent holders of a mutually-exclusive resource. Demonstrates TOCTOU on the filesystem using non-atomic check-then-create.',
    category: 'filesystem-toctou',
    difficulty: 'intermediate',
    fixture: {
      id: 'FIX-013-V',
      name: 'lockfile_vulnerable',
      version: '1.0.0',
      mode: 'vulnerable',
      language: 'python',
      description:
        'os.path.exists(lock_path) → if not exists → open(lock_path, "w"). Race between exists-check and open allows both processes to create the file.',
    },
    hardenedFixture: {
      id: 'FIX-013-H',
      name: 'lockfile_hardened',
      version: '1.1.0',
      mode: 'hardened',
      language: 'python',
      description:
        'open(lock_path, "x") — exclusive creation flag O_CREAT|O_EXCL. Atomic at the OS level. Second open raises FileExistsError without a race window.',
      mitigationType: 'atomic-file-creation',
      mitigationDescription:
        'POSIX O_CREAT|O_EXCL open flags provide atomic check-and-create. The kernel guarantees only one open succeeds; all others raise EEXIST.',
    },
    sharedState: 'filesystem_lock_file',
    invariant: {
      type: 'single_use',
      description: 'Lock file must be owned by at most one process at any time',
      constraint: { field: 'lock_owner', maxOwners: 1 },
    },
    expectedVulnerableResult: 'violated',
    expectedHardenedResult: 'preserved',
    executionMode: 'local-lab',
    tags: ['filesystem', 'lockfile', 'toctou', 'o-excl', 'posix'],
    lastRun: '2026-09-19T09:00:00Z',
    status: 'available',
    evidenceAvailable: true,
  },

  // ── RACE-014 ──────────────────────────────────────────────────────────────
  {
    id: 'RACE-014',
    name: 'Distributed State — Cross-Service Balance Sync',
    description:
      'A microservice architecture splits balance reads and writes across two services with an eventual-consistency replication lag. Service A reads stale balance from its local replica, approves a debit, and writes to Service B — while a concurrent debit from Service B has not yet replicated. Both debits succeed, violating the non-negative invariant at the system level.',
    category: 'distributed-state',
    difficulty: 'expert',
    fixture: {
      id: 'FIX-014-V',
      name: 'distributed_balance_vulnerable',
      version: '1.0.0',
      mode: 'vulnerable',
      language: 'python',
      description:
        'Two services with eventual-consistency replication. Service A reads from its local read replica (stale). Both services approve concurrent debits against the same stale balance.',
    },
    hardenedFixture: {
      id: 'FIX-014-H',
      name: 'distributed_balance_hardened',
      version: '1.1.0',
      mode: 'hardened',
      language: 'python',
      description:
        'Distributed lock via Redis SETNX with TTL. All balance mutations acquire the distributed lock first. Cross-service serialisation prevents concurrent stale reads.',
      mitigationType: 'distributed-lock',
      mitigationDescription:
        'Redis SETNX with expiry implements a distributed mutual exclusion lock. Any service must acquire the lock before reading or writing. Lock TTL prevents deadlock on service crash.',
    },
    sharedState: 'distributed_account_balance',
    invariant: {
      type: 'non_negative',
      description: 'Account balance must remain non-negative across all service replicas',
      constraint: { minimum: 0, field: 'balance', consistency: 'strong' },
    },
    expectedVulnerableResult: 'violated',
    expectedHardenedResult: 'preserved',
    executionMode: 'simulated',
    tags: ['distributed', 'replication-lag', 'microservice', 'redis-setnx', 'eventual-consistency'],
    lastRun: '2026-09-23T10:00:00Z',
    status: 'available',
    evidenceAvailable: true,
  },

  // ── RACE-015 ──────────────────────────────────────────────────────────────
  {
    id: 'RACE-015',
    name: 'Distributed State — Leader Election Double-Commit',
    description:
      'A distributed leader election protocol allows two nodes to simultaneously observe no leader and both self-elect. Both nodes commit configuration changes as the leader, causing split-brain. Simulates a network partition scenario with a two-node cluster.',
    category: 'distributed-state',
    difficulty: 'expert',
    fixture: {
      id: 'FIX-015-V',
      name: 'leader_election_vulnerable',
      version: '1.0.0',
      mode: 'vulnerable',
      language: 'python',
      description:
        'GET leader → if None → SET leader = self. Non-atomic. Network partition allows both nodes to observe leader = None before either SET arrives.',
    },
    hardenedFixture: {
      id: 'FIX-015-H',
      name: 'leader_election_hardened',
      version: '1.1.0',
      mode: 'hardened',
      language: 'python',
      description:
        'Redis SET leader self NX EX 30 — atomic conditional set with TTL. Only one node wins the SETNX; others observe their SET returned nil.',
      mitigationType: 'compare-and-set',
      mitigationDescription:
        'Redis SET NX (only if not exists) is atomic. Exactly one node receives OK; all competing nodes receive nil. TTL prevents stale lock if the leader crashes.',
    },
    sharedState: 'distributed_leader_key',
    invariant: {
      type: 'single_use',
      description: 'At most one node may hold the leader role at any point in time',
      constraint: { maxLeaders: 1, field: 'leader_id' },
    },
    expectedVulnerableResult: 'violated',
    expectedHardenedResult: 'preserved',
    executionMode: 'simulated',
    tags: ['distributed', 'leader-election', 'split-brain', 'redis-setnx', 'ttl'],
    lastRun: '2026-09-27T14:00:00Z',
    status: 'available',
    evidenceAvailable: true,
  },

  // ── RACE-016 ──────────────────────────────────────────────────────────────
  {
    id: 'RACE-016',
    name: 'Queue Job Claim — Double Dequeue Race',
    description:
      'Two worker processes both poll a shared job queue, both observe the same job in PENDING status, and both claim it — resulting in duplicate processing. The job executes twice, violating the at-most-once processing invariant.',
    category: 'queue-job-claim',
    difficulty: 'intermediate',
    fixture: {
      id: 'FIX-016-V',
      name: 'job_claim_vulnerable',
      version: '1.0.0',
      mode: 'vulnerable',
      language: 'python',
      description:
        'SELECT job WHERE status=pending LIMIT 1 → UPDATE status=claimed WHERE id=?. Non-atomic. Two workers SELECT the same job before either UPDATE commits.',
    },
    hardenedFixture: {
      id: 'FIX-016-H',
      name: 'job_claim_hardened',
      version: '1.1.0',
      mode: 'hardened',
      language: 'python',
      description:
        'UPDATE jobs SET status=claimed, worker_id=? WHERE status=pending ORDER BY id LIMIT 1. Atomic skip-locked claim. Only one row is updated; second worker gets 0 rows.',
      mitigationType: 'atomic-update',
      mitigationDescription:
        'Atomic UPDATE with LIMIT 1 and status predicate. Relies on database row-level locking during UPDATE execution. No separate SELECT phase eliminates the TOCTOU window.',
    },
    sharedState: 'job_queue',
    invariant: {
      type: 'single_use',
      description: 'Each job must be claimed and processed by at most one worker',
      constraint: { field: 'job_status', maxClaimants: 1 },
    },
    expectedVulnerableResult: 'violated',
    expectedHardenedResult: 'preserved',
    executionMode: 'controlled-reproduction',
    tags: ['queue', 'job-claim', 'double-dequeue', 'skip-locked', 'at-most-once'],
    lastRun: '2026-09-30T10:00:00Z',
    status: 'available',
    evidenceAvailable: false,
  },

  // ── RACE-017 ──────────────────────────────────────────────────────────────
  {
    id: 'RACE-017',
    name: 'Queue Job Claim — Priority Queue Skip-Lock Bypass',
    description:
      'A priority job queue uses SELECT FOR UPDATE SKIP LOCKED for safe dequeue. A misconfigured advisory lock pattern bypasses the skip-locked mechanism when workers use different connection pools, allowing two workers to claim the same high-priority job.',
    category: 'queue-job-claim',
    difficulty: 'expert',
    fixture: {
      id: 'FIX-017-V',
      name: 'priority_queue_vulnerable',
      version: '1.0.0',
      mode: 'vulnerable',
      language: 'python',
      description:
        'Mixed connection pool advisory locking. Workers on separate pools bypass the advisory lock and independently observe the same unprocessed job.',
    },
    hardenedFixture: {
      id: 'FIX-017-H',
      name: 'priority_queue_hardened',
      version: '1.1.0',
      mode: 'hardened',
      language: 'python',
      description:
        'Unified connection pool with PostgreSQL SELECT FOR UPDATE SKIP LOCKED. All workers use the same pool; skip-locked ensures no two workers see the same row.',
      mitigationType: 'pessimistic-locking',
      mitigationDescription:
        'SELECT FOR UPDATE SKIP LOCKED on a unified connection pool. Row-level locking is maintained within a single transaction; SKIP LOCKED causes competing workers to move to the next available job.',
    },
    sharedState: 'priority_job_queue',
    invariant: {
      type: 'single_use',
      description: 'Each priority job must be processed by exactly one worker',
      constraint: { field: 'job_claimed_by', uniqueClaimant: true },
    },
    expectedVulnerableResult: 'violated',
    expectedHardenedResult: 'preserved',
    executionMode: 'controlled-reproduction',
    tags: ['queue', 'skip-locked', 'advisory-lock', 'priority', 'connection-pool'],
    lastRun: '2026-10-03T09:00:00Z',
    status: 'available',
    evidenceAvailable: false,
  },

  // ── RACE-018 ──────────────────────────────────────────────────────────────
  {
    id: 'RACE-018',
    name: 'Session Issuance — Concurrent Token Generation',
    description:
      'A session creation endpoint generates a token, writes it to the session store, and returns it. Under concurrent requests for the same user, a race condition allows two sessions to be issued simultaneously — bypassing the single-active-session invariant enforced for security-sensitive accounts.',
    category: 'session-issuance',
    difficulty: 'advanced',
    fixture: {
      id: 'FIX-018-V',
      name: 'session_issue_vulnerable',
      version: '1.0.0',
      mode: 'vulnerable',
      language: 'python',
      description:
        'GET session by user_id → if None → generate token → SET session. Non-atomic. Two concurrent requests both observe no active session before either SET completes.',
    },
    hardenedFixture: {
      id: 'FIX-018-H',
      name: 'session_issue_hardened',
      version: '1.1.0',
      mode: 'hardened',
      language: 'python',
      description:
        'Idempotency key stored in Redis with NX flag. Session creation is gated on SET idempotency_key NX EX 300. Only one creation succeeds; others receive nil and await the result.',
      mitigationType: 'idempotency-key',
      mitigationDescription:
        'Idempotency key per user_id stored in Redis with SET NX. First request wins; subsequent concurrent requests detect the existing key and return the in-progress session.',
    },
    sharedState: 'user_session_store',
    invariant: {
      type: 'single_use',
      description: 'Each user may have at most one active session at any time',
      constraint: { maxActiveSessions: 1, field: 'session_token', uniquePerUser: true },
    },
    expectedVulnerableResult: 'violated',
    expectedHardenedResult: 'preserved',
    executionMode: 'controlled-reproduction',
    tags: ['session', 'idempotency-key', 'redis', 'token', 'concurrent-login'],
    lastRun: '2026-10-05T10:00:00Z',
    status: 'unavailable',
    evidenceAvailable: false,
  },

  // ── RACE-019 ──────────────────────────────────────────────────────────────
  {
    id: 'RACE-019',
    name: 'HTTP Limit Override — X-Forwarded-For Spoofing Race',
    description:
      'A rate limiter keyed on IP address from X-Forwarded-For can be bypassed by rotating the header value. Under race conditions, two requests with different spoofed IPs both pass the per-IP limit check within the same window — defeating the rate limiter entirely without per-user limits.',
    category: 'http-limit-override',
    difficulty: 'advanced',
    fixture: {
      id: 'FIX-019-V',
      name: 'xff_rate_limit_vulnerable',
      version: '1.0.0',
      mode: 'vulnerable',
      language: 'python',
      description:
        'Rate limiter trusts X-Forwarded-For header directly. Attacker rotates IP per request. No header validation or trusted-proxy allowlist.',
    },
    hardenedFixture: {
      id: 'FIX-019-H',
      name: 'xff_rate_limit_hardened',
      version: '1.1.0',
      mode: 'hardened',
      language: 'python',
      description:
        'Validates X-Forwarded-For against a trusted proxy allowlist. Falls back to authenticated user_id for rate limiting key when header is untrusted.',
      mitigationType: 'atomic-update',
      mitigationDescription:
        'Rate limit key is user_id (from authenticated JWT), not IP. X-Forwarded-For is validated against a configured trusted proxy CIDR list. Spoofed headers are ignored.',
    },
    sharedState: 'rate_limit_by_ip',
    invariant: {
      type: 'max_count',
      description: 'Per-user request rate must not exceed the configured limit regardless of header manipulation',
      constraint: { maxCount: 10, field: 'request_count', keyField: 'user_id' },
    },
    expectedVulnerableResult: 'violated',
    expectedHardenedResult: 'preserved',
    executionMode: 'controlled-reproduction',
    tags: ['http', 'rate-limit', 'xff-spoofing', 'ip-bypass', 'header-validation'],
    lastRun: '2026-10-06T14:00:00Z',
    status: 'unavailable',
    evidenceAvailable: false,
  },

  // ── RACE-020 ──────────────────────────────────────────────────────────────
  {
    id: 'RACE-020',
    name: 'Atomicity Locking — Long-Running Transaction Starve',
    description:
      'A long-running computation reads a shared counter, performs a 500ms calculation, and writes back the result. Concurrent short transactions interleave within the long transaction, causing lost updates. The final counter value reflects only the last writer, losing all intermediate increments.',
    category: 'atomicity-locking',
    difficulty: 'expert',
    fixture: {
      id: 'FIX-020-V',
      name: 'long_txn_vulnerable',
      version: '1.0.0',
      mode: 'vulnerable',
      language: 'python',
      description:
        'Read counter → sleep(0.5s) → write counter + computed_delta. Long delay allows many concurrent short transactions to also read and overwrite the counter during the sleep.',
    },
    hardenedFixture: {
      id: 'FIX-020-H',
      name: 'long_txn_hardened',
      version: '1.1.0',
      mode: 'hardened',
      language: 'python',
      description:
        'Async queue serialises all counter mutations. Long-running computation posts a job; a single worker processes jobs sequentially. Counter state is always consistent.',
      mitigationType: 'serialized-queue',
      mitigationDescription:
        'Mutation serialisation via asyncio.Queue with a single consumer. All read-modify-write operations are posted as coroutines and processed in order. No concurrent mutation possible.',
    },
    sharedState: 'shared_computation_counter',
    invariant: {
      type: 'non_negative',
      description: 'Counter must reflect the sum of all committed increments with no lost updates',
      constraint: { field: 'counter_value', noLostUpdates: true },
    },
    expectedVulnerableResult: 'violated',
    expectedHardenedResult: 'preserved',
    executionMode: 'controlled-reproduction',
    tags: ['atomicity', 'long-transaction', 'lost-update', 'serialized-queue', 'starvation'],
    lastRun: '2026-10-08T09:00:00Z',
    status: 'unavailable',
    evidenceAvailable: false,
  },
]
