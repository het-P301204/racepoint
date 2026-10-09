import { Database, AlertTriangle, Shield, Code2 } from 'lucide-react'
import { Card, CardHeader } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'

const CODE_VULNERABLE = `-- VULNERABLE: Non-atomic check-then-act
BEGIN;
SELECT balance FROM accounts WHERE id = $1;
-- ← Race window: another transaction reads same balance here
UPDATE accounts SET balance = balance - $2 WHERE id = $1;
COMMIT;

-- Both transactions read balance = 100
-- Both compute 100 - 75 = 25 (should be -50 → reject)`

const CODE_HARDENED = `-- HARDENED: Atomic update with constraint
BEGIN;
UPDATE accounts
  SET balance = balance - $2
  WHERE id = $1
    AND balance >= $2  -- Atomic check inside UPDATE
RETURNING balance;

-- If no rows returned → constraint violated → rollback
-- Database enforces atomicity, no race window
COMMIT;`

const CODE_OPTIMISTIC = `-- HARDENED: Optimistic locking (version check)
BEGIN;
SELECT balance, version FROM accounts WHERE id = $1;
-- Store version = 42

UPDATE accounts
  SET balance = balance - $2,
      version = version + 1
  WHERE id = $1
    AND version = $3  -- Must match the version we read
RETURNING balance;

-- Concurrent update increments version to 43
-- Our update with version = 42 matches 0 rows → retry
COMMIT;`

function CodeBlock({ code, label }: { code: string; label: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
        {label}
      </div>
      <pre
        style={{
          margin: 0,
          padding: '14px 16px',
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)',
          fontSize: 12,
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-mono)',
          overflowX: 'auto',
          lineHeight: 1.7,
        }}
      >
        <code>{code}</code>
      </pre>
    </div>
  )
}

export default function Database_() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
          Database TOCTOU
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
          Time-of-check-time-of-use vulnerabilities in database operations
        </p>
      </div>

      {/* Intro */}
      <Card style={{ borderLeft: '3px solid var(--color-iris)' }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <Database size={20} style={{ color: 'var(--color-iris)', flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
              What is Database TOCTOU?
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 10 }}>
              A TOCTOU (Time-of-Check-Time-of-Use) race condition in database operations occurs when
              a process checks a condition (e.g., "does the user have enough balance?") and then
              acts on it (e.g., "deduct the amount") as separate, non-atomic operations.
            </p>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7 }}>
              Between the check and the act, another concurrent operation can change the state,
              invalidating the check's conclusion — yet the original process proceeds as if nothing changed.
            </p>
          </div>
        </div>
      </Card>

      {/* Attack pattern */}
      <Card>
        <CardHeader
          title="Attack Pattern"
          action={<Badge variant="coral">Vulnerable</Badge>}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div
            style={{
              display: 'flex',
              gap: 16,
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-sm)',
              padding: 16,
            }}
          >
            {[
              { step: '1', label: 'READ', desc: 'Both requests read balance = $100', color: 'var(--color-iris)' },
              { step: '2', label: 'CHECK', desc: 'Both compute $100 ≥ $75 → TRUE', color: 'var(--color-marigold)' },
              { step: '3', label: 'WRITE', desc: 'Both write balance = $25 (should be -$50!)', color: 'var(--color-coral)' },
            ].map((s) => (
              <div
                key={s.step}
                style={{
                  flex: 1,
                  padding: 14,
                  borderRadius: 10,
                  background: 'var(--bg-elevated)',
                  border: `1px solid ${s.color}30`,
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 20, fontWeight: 800, color: s.color, fontFamily: 'var(--font-mono)', marginBottom: 6 }}>
                  {s.step}
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: s.color, marginBottom: 4, letterSpacing: '0.05em' }}>
                  {s.label}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.desc}</div>
              </div>
            ))}
          </div>
          <CodeBlock code={CODE_VULNERABLE} label="Vulnerable SQL" />
        </div>
      </Card>

      {/* Mitigations */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card>
          <CardHeader
            title="Atomic Update"
            action={<Badge variant="sage">Hardened</Badge>}
          />
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.6 }}>
            Combine the check and act into a single atomic SQL statement using a conditional UPDATE.
            The database engine ensures no other transaction can interleave.
          </p>
          <CodeBlock code={CODE_HARDENED} label="Atomic WHERE Clause" />
        </Card>

        <Card>
          <CardHeader
            title="Optimistic Locking"
            action={<Badge variant="sage">Hardened</Badge>}
          />
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.6 }}>
            Add a version column. Any concurrent modification increments the version, causing
            the original transaction's version check to fail — triggering a retry.
          </p>
          <CodeBlock code={CODE_OPTIMISTIC} label="Version-based CAS" />
        </Card>
      </div>

      {/* Mitigations reference */}
      <Card>
        <CardHeader title="Mitigation Techniques" subtitle="Database-level countermeasures" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[
            { name: 'Atomic UPDATE', desc: 'Embed check in WHERE clause of UPDATE statement', difficulty: 'Easy' },
            { name: 'Optimistic Locking', desc: 'Version column with compare-and-swap retry loop', difficulty: 'Medium' },
            { name: 'Pessimistic Locking', desc: 'SELECT FOR UPDATE acquires row lock before read', difficulty: 'Easy' },
            { name: 'Serializable Isolation', desc: 'Highest isolation level prevents all anomalies', difficulty: 'Hard' },
            { name: 'Database Constraint', desc: 'CHECK constraint enforces non-negative balance', difficulty: 'Easy' },
            { name: 'Idempotency Key', desc: 'Unique constraint on (user_id, operation_id)', difficulty: 'Medium' },
          ].map((m) => (
            <div
              key={m.name}
              style={{
                padding: 14,
                background: 'var(--bg-surface)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{m.name}</span>
                <Badge variant={m.difficulty === 'Easy' ? 'sage' : m.difficulty === 'Medium' ? 'marigold' : 'coral'}>
                  {m.difficulty}
                </Badge>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>{m.desc}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
