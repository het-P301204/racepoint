import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Filter, BookOpen } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { DEMO_SCENARIOS } from '../data'
import type { ScenarioCategory, ScenarioDifficulty } from '@racepoint/shared'

const CATEGORIES: Array<{ value: ScenarioCategory | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'http-limit-override', label: 'HTTP Limit' },
  { value: 'coupon-redemption', label: 'Coupon' },
  { value: 'gift-card-balance', label: 'Gift Card' },
  { value: 'inventory-update', label: 'Inventory' },
  { value: 'account-registration', label: 'Account' },
  { value: 'database-toctou', label: 'Database' },
  { value: 'filesystem-toctou', label: 'Filesystem' },
  { value: 'distributed-state', label: 'Distributed' },
  { value: 'rate-limit-counter', label: 'Rate Limit' },
  { value: 'queue-job-claim', label: 'Queue' },
  { value: 'session-issuance', label: 'Session' },
  { value: 'atomicity-locking', label: 'Atomicity' },
]

const DIFFICULTY_COLORS: Record<ScenarioDifficulty, 'stone' | 'sage' | 'marigold' | 'coral'> = {
  beginner: 'sage',
  intermediate: 'marigold',
  advanced: 'coral',
  expert: 'coral',
}

// Static showcase scenarios when no data loaded
const STATIC_SCENARIOS = [
  { id: 'RACE-001', name: 'HTTP Rate Limit Override', category: 'http-limit-override', difficulty: 'intermediate', description: 'Two concurrent requests bypass the single-use rate limit by reading before the other writes.', tags: ['toctou', 'http', 'limit'], status: 'available', evidenceAvailable: true },
  { id: 'RACE-002', name: 'Coupon Double Redemption', category: 'coupon-redemption', difficulty: 'beginner', description: 'Concurrent redemptions race past a single-use coupon guard.', tags: ['coupon', 'payment', 'race'], status: 'available', evidenceAvailable: true },
  { id: 'RACE-003', name: 'Gift Card Balance Drain', category: 'gift-card-balance', difficulty: 'intermediate', description: 'Parallel withdrawals exceed gift card balance via read-write-commit race.', tags: ['balance', 'payment'], status: 'available', evidenceAvailable: false },
  { id: 'RACE-004', name: 'Inventory Oversell', category: 'inventory-update', difficulty: 'beginner', description: 'Race condition allows selling more inventory than available.', tags: ['inventory', 'count'], status: 'available', evidenceAvailable: false },
  { id: 'RACE-005', name: 'Account Registration Duplicate', category: 'account-registration', difficulty: 'advanced', description: 'Concurrent registrations create duplicate accounts for the same email.', tags: ['account', 'uniqueness'], status: 'available', evidenceAvailable: true },
  { id: 'RACE-006', name: 'Database TOCTOU: Balance Check', category: 'database-toctou', difficulty: 'intermediate', description: 'Read-check-write pattern on non-atomic balance query.', tags: ['database', 'toctou', 'sql'], status: 'available', evidenceAvailable: true },
  { id: 'RACE-007', name: 'Filesystem Race: Temp File Overwrite', category: 'filesystem-toctou', difficulty: 'advanced', description: 'TOCTOU between file existence check and creation allows overwrite.', tags: ['filesystem', 'toctou'], status: 'available', evidenceAvailable: false },
  { id: 'RACE-008', name: 'Distributed Lock Bypass', category: 'distributed-state', difficulty: 'expert', description: 'Distributed state race bypasses advisory locks under network partition.', tags: ['distributed', 'lock', 'partition'], status: 'available', evidenceAvailable: false },
  { id: 'RACE-009', name: 'Rate Limit Counter Race', category: 'rate-limit-counter', difficulty: 'beginner', description: 'Counter increment race allows exceeding per-user rate limit.', tags: ['rate-limit', 'counter'], status: 'available', evidenceAvailable: true },
  { id: 'RACE-010', name: 'Queue Job Double-Claim', category: 'queue-job-claim', difficulty: 'intermediate', description: 'Two workers claim the same job due to non-atomic dequeue.', tags: ['queue', 'job', 'claim'], status: 'available', evidenceAvailable: false },
  { id: 'RACE-011', name: 'Session Token Issuance Race', category: 'session-issuance', difficulty: 'advanced', description: 'Concurrent session creation for same user bypasses singleton guard.', tags: ['session', 'auth', 'token'], status: 'available', evidenceAvailable: true },
  { id: 'RACE-012', name: 'Atomic Update vs CAS Failure', category: 'atomicity-locking', difficulty: 'expert', description: 'Compare-and-swap vs non-atomic update race under contention.', tags: ['cas', 'atomic', 'lock'], status: 'available', evidenceAvailable: false },
]

export default function Scenarios() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all')

  const scenarios = DEMO_SCENARIOS.length > 0 ? DEMO_SCENARIOS : STATIC_SCENARIOS

  const filtered = scenarios.filter((s) => {
    const matchQ = query === '' || s.name.toLowerCase().includes(query.toLowerCase()) || s.description.toLowerCase().includes(query.toLowerCase())
    const matchC = categoryFilter === 'all' || s.category === categoryFilter
    const matchD = difficultyFilter === 'all' || s.difficulty === difficultyFilter
    return matchQ && matchC && matchD
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
          Scenario Library
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
          {scenarios.length} race condition scenarios across {CATEGORIES.length - 1} categories
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative' }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value) }}
            placeholder="Search scenarios..."
            style={{
              padding: '8px 12px 8px 30px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
              fontSize: 13,
              fontFamily: 'var(--font-sans)',
              outline: 'none',
              width: 240,
            }}
          />
        </div>

        <select
          value={difficultyFilter}
          onChange={(e) => { setDifficultyFilter(e.target.value) }}
          style={{
            padding: '8px 12px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-secondary)',
            fontSize: 13,
            fontFamily: 'var(--font-sans)',
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          <option value="all">All Difficulties</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
          <option value="expert">Expert</option>
        </select>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {CATEGORIES.slice(0, 6).map((c) => (
            <button
              key={c.value}
              onClick={() => { setCategoryFilter(c.value) }}
              style={{
                padding: '5px 12px',
                borderRadius: 'var(--radius-pill)',
                fontSize: 12,
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                background: categoryFilter === c.value ? 'var(--color-coral)' : 'var(--bg-elevated)',
                color: categoryFilter === c.value ? 'var(--color-ivory)' : 'var(--text-muted)',
                transition: 'all var(--transition-fast)',
              }}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No scenarios match your filters"
          description="Try adjusting your search or filters"
          icon={<BookOpen size={32} />}
          action={<Button onClick={() => { setQuery(''); setCategoryFilter('all') }}>Clear Filters</Button>}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {filtered.map((s) => {
            const diff = s.difficulty as ScenarioDifficulty
            return (
              <Card
                key={s.id}
                hover
                onClick={() => { navigate(`/scenarios/${s.id}`) }}
                style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-mono)', fontWeight: 600 }}>
                    {s.id}
                  </span>
                  <Badge variant={DIFFICULTY_COLORS[diff]}>{diff}</Badge>
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                    {s.name}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.55 }}>
                    {s.description}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 'auto' }}>
                  {s.tags.slice(0, 4).map((t: string) => (
                    <span
                      key={t}
                      style={{
                        fontSize: 10,
                        padding: '2px 7px',
                        borderRadius: 'var(--radius-pill)',
                        background: 'var(--bg-surface)',
                        color: 'var(--text-muted)',
                        border: '1px solid var(--border-subtle)',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px solid var(--border-subtle)' }}>
                  <Badge variant={s.status === 'available' ? 'sage' : 'stone'}>{s.status}</Badge>
                  {s.evidenceAvailable && <Badge variant="iris">Evidence</Badge>}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
