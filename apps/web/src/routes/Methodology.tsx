import { BookMarked, ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { Card } from '../components/ui/Card'

interface Section {
  title: string
  content: string
}

const SECTIONS: Section[] = [
  {
    title: 'What is a Race Condition?',
    content: `A race condition occurs when the behavior of a system depends on the relative timing or ordering of concurrent events. In security contexts, race conditions become vulnerabilities when an attacker can influence this timing to violate safety properties.

The classic structure is:
1. **Read** — check the current state (e.g., "does the user have enough balance?")
2. **Decide** — make a decision based on that state (e.g., "yes, allow the transaction")
3. **Write** — act on the decision (e.g., "deduct the amount")

If another operation modifies the state between steps 1 and 3, the original decision may no longer be valid — but the system acts on it anyway.`,
  },
  {
    title: 'TOCTOU (Time-of-Check-Time-of-Use)',
    content: `TOCTOU is the formal name for a specific class of race conditions where a resource's state is verified at one point in time (check) but used at a different point (use). The gap between these two moments is the **race window**.

**TOCTOU in databases**: SELECT then UPDATE with a separate existence/balance check.
**TOCTOU in filesystems**: access() or stat() followed by open() — a symlink can be swapped in the gap.
**TOCTOU in HTTP**: Rate limit check then resource allocation, both non-atomic.

The key insight: any time a guard and the protected operation are not executed atomically, a TOCTOU race can exist.`,
  },
  {
    title: 'Research Methodology',
    content: `RACEPOINT uses a structured methodology for exposing and verifying race conditions:

**Phase 1: Fixture Design**
- Write a vulnerable fixture implementing the TOCTOU pattern
- Write a hardened fixture applying a specific mitigation
- Define the shared state and the invariant to check

**Phase 2: Execution**
- Run both fixtures under identical concurrency conditions
- Use a barrier to synchronize request launch timing
- Record every event with monotonic timestamps

**Phase 3: Analysis**
- Detect race windows: intervals where multiple requests accessed shared state concurrently
- Check the invariant against the final state
- Capture evidence records linking events to outcomes

**Phase 4: Comparison**
- Compare vulnerable and hardened runs side by side
- Quantify: how many race windows were detected? Was the invariant violated?
- Document the mitigation's effectiveness`,
  },
  {
    title: 'Invariant Verification',
    content: `An **invariant** is a property that must always hold true about the system's state. RACEPOINT defines one invariant per scenario and checks it after each run.

Example invariants:
- **minimum_balance**: account balance must always be ≥ 0
- **single_use**: a coupon may only be redeemed once
- **unique_account**: at most one account per email address
- **max_count**: inventory count must never go below 0

The invariant result is one of:
- **violated** — the property was broken (race condition exploited)
- **preserved** — the property held (mitigation worked)
- **inconclusive** — insufficient data to determine
- **not-evaluated** — run did not complete`,
  },
  {
    title: 'Mitigations Taxonomy',
    content: `RACEPOINT covers the following mitigation families:

**Database-level**
- Atomic UPDATE with WHERE clause (combine check and act)
- Optimistic locking (version/ETag column)
- Pessimistic locking (SELECT FOR UPDATE)
- Database constraints (CHECK, UNIQUE)
- Serializable isolation level

**Application-level**
- Compare-and-swap (CAS) loops
- Idempotency keys (deduplicate on unique constraint)
- In-process locks (mutexes, semaphores)

**Filesystem-level**
- O_CREAT | O_EXCL (atomic creation)
- Write-to-temp + atomic rename

**Distributed-level**
- Distributed locks (Redis Redlock, ZooKeeper)
- Fencing tokens
- Event sourcing / append-only log`,
  },
  {
    title: 'Evidence Standards',
    content: `For a race condition finding to be considered evidence-grade, RACEPOINT requires:

1. **Reproducibility** — the run must be reproducible from the same initial state and configuration. A reproducibility hash is computed over the run parameters and events.

2. **Invariant violation** — the specific invariant must be demonstrably violated (not just potentially violated).

3. **Race window** — at least one confirmed race window must be detected and recorded with start/end timestamps and participating requests.

4. **State diff** — the final state must differ from what the invariant requires, with the state transitions recorded.

All evidence records are tagged with fixture version, execution mode, environment metadata, and linked to the specific race window.`,
  },
]

function CollapsibleSection({ section }: { section: Section }) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
      <button
        onClick={() => { setOpen((o) => !o) }}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 18px',
          background: open ? 'var(--bg-surface)' : 'var(--bg-secondary)',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          transition: 'background var(--transition-fast)',
        }}
      >
        <span style={{ fontSize: 15, fontWeight: 600, color: open ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
          {section.title}
        </span>
        {open ? (
          <ChevronDown size={16} style={{ color: 'var(--color-coral)', flexShrink: 0 }} />
        ) : (
          <ChevronRight size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        )}
      </button>
      {open && (
        <div
          style={{
            padding: '16px 20px',
            background: 'var(--bg-secondary)',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <div
            style={{
              fontSize: 14,
              color: 'var(--text-muted)',
              lineHeight: 1.8,
              whiteSpace: 'pre-wrap',
            }}
          >
            {section.content.split(/\*\*(.+?)\*\*/g).map((part, i) =>
              i % 2 === 1 ? (
                <strong key={i} style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{part}</strong>
              ) : (
                part
              )
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function Methodology() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
          Methodology
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
          Research methodology, concepts, and definitions
        </p>
      </div>

      <Card style={{ borderLeft: '3px solid var(--color-plum)' }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <BookMarked size={20} style={{ color: '#c4a8be', flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
              About RACEPOINT Research
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7 }}>
              RACEPOINT provides a structured framework for exposing, analyzing, and proving
              race condition and TOCTOU vulnerabilities. Every finding is backed by observable
              evidence: reproducible runs, explicit invariants, and captured race windows.
            </p>
          </div>
        </div>
      </Card>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {SECTIONS.map((s) => (
          <CollapsibleSection key={s.title} section={s} />
        ))}
      </div>
    </div>
  )
}
