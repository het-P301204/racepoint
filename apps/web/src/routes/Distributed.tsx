import { Network, AlertTriangle } from 'lucide-react'
import { Card, CardHeader } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'

function DistributedTopologySVG() {
  const nodes = [
    { id: 'A', x: 100, y: 140, label: 'Worker A', color: '#9282AD' },
    { id: 'B', x: 300, y: 60, label: 'Worker B', color: '#D5A642' },
    { id: 'C', x: 300, y: 220, label: 'Worker C', color: '#81977C' },
    { id: 'DB', x: 500, y: 140, label: 'Shared DB', color: '#594451' },
    { id: 'LOCK', x: 200, y: 300, label: 'Lock Svc', color: '#E45D4B' },
  ]

  const edges = [
    { from: 'A', to: 'DB', label: 'read' },
    { from: 'B', to: 'DB', label: 'read' },
    { from: 'C', to: 'DB', label: 'write' },
    { from: 'A', to: 'LOCK', label: 'acquire' },
    { from: 'B', to: 'LOCK', label: 'acquire' },
  ]

  const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]))

  return (
    <svg viewBox="0 0 620 360" style={{ width: '100%', maxWidth: 560 }}>
      <rect width={620} height={360} rx={16} fill="rgba(36,35,33,0.8)" />

      {edges.map((e, i) => {
        const from = nodeMap[e.from]
        const to = nodeMap[e.to]
        if (from === undefined || to === undefined) return null
        const mx = (from.x + to.x) / 2
        const my = (from.y + to.y) / 2
        return (
          <g key={i}>
            <line
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke="rgba(227,218,206,0.12)"
              strokeWidth={1.5}
              strokeDasharray="5 3"
            />
            <text x={mx} y={my - 6} textAnchor="middle" fill="#a09a8e" fontSize={9} fontFamily="var(--font-mono)">
              {e.label}
            </text>
          </g>
        )
      })}

      {nodes.map((n) => (
        <g key={n.id}>
          <circle cx={n.x} cy={n.y} r={28} fill={`${n.color}18`} stroke={n.color} strokeWidth={1.5} />
          <text x={n.x} y={n.y + 1} textAnchor="middle" dominantBaseline="middle" fill={n.color} fontSize={10} fontFamily="var(--font-mono)" fontWeight={700}>
            {n.id}
          </text>
          <text x={n.x} y={n.y + 38} textAnchor="middle" fill="#a09a8e" fontSize={9} fontFamily="var(--font-sans)">
            {n.label}
          </text>
        </g>
      ))}

      {/* Race window annotation */}
      <rect x={80} y={40} width={280} height={30} rx={6} fill="rgba(228,93,75,0.12)" stroke="rgba(228,93,75,0.4)" strokeWidth={1} strokeDasharray="4 3" />
      <text x={220} y={59} textAnchor="middle" fill="#E45D4B" fontSize={9} fontFamily="var(--font-mono)" fontWeight={700}>
        RACE WINDOW: A and B both acquire before commit
      </text>
    </svg>
  )
}

export default function Distributed() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
          Distributed State
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
          Race conditions in distributed systems — locks, consensus, and network partitions
        </p>
      </div>

      <Card style={{ borderLeft: '3px solid var(--color-iris)' }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <Network size={20} style={{ color: 'var(--color-iris)', flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
              The Distributed Concurrency Problem
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 8 }}>
              In distributed systems, race conditions are harder to prevent because multiple processes
              may run on separate machines with no shared memory. Coordination must happen over the
              network, introducing latency, reordering, and partition risk.
            </p>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7 }}>
              Even "locked" resources can have race windows if lock acquisition is not atomic,
              if lock expiry is poorly tuned, or if the lock service itself partitions.
            </p>
          </div>
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <Card>
          <CardHeader title="Topology" subtitle="Worker ↔ shared state interactions" />
          <DistributedTopologySVG />
        </Card>

        <Card>
          <CardHeader title="Failure Modes" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { title: 'Lock Expiry Race', desc: 'Lock expires before work completes — another worker acquires it. Both workers operate on the same job.', severity: 'Critical' },
              { title: 'Double Acquire', desc: 'Advisory lock service allows two workers to acquire due to network partition or implementation bug.', severity: 'Critical' },
              { title: 'Read-Write Skew', desc: 'Worker reads consistent snapshot, makes decision, then writes — but others have already changed state.', severity: 'High' },
              { title: 'Phantom Read', desc: 'Set of matching records changes between two reads within same transaction due to other inserts.', severity: 'Medium' },
            ].map((f) => (
              <div
                key={f.title}
                style={{
                  padding: 12,
                  background: 'var(--bg-surface)',
                  borderRadius: 8,
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{f.title}</span>
                  <Badge variant={f.severity === 'Critical' ? 'coral' : f.severity === 'High' ? 'marigold' : 'stone'}>
                    {f.severity}
                  </Badge>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Mitigation Patterns" subtitle="Distributed-safe coordination" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[
            { name: 'Distributed Lock (Redis)', desc: 'Redlock algorithm with fencing tokens for strict ordering under failure.', badge: 'sage' },
            { name: 'Idempotency Keys', desc: 'Client-provided unique key per operation; server deduplicates on first success.', badge: 'sage' },
            { name: 'Optimistic Concurrency', desc: 'Version / ETag on every shared resource; reject stale writes.', badge: 'sage' },
            { name: 'Event Sourcing', desc: 'Append-only event log as source of truth; projections rebuild current state.', badge: 'sage' },
            { name: 'Saga Pattern', desc: 'Long-running operations modeled as compensatable steps; no global lock held.', badge: 'marigold' },
            { name: 'Serializable Snapshot', desc: 'Database provides SSI — serialize transactions without holding locks.', badge: 'sage' },
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
                <Badge variant={m.badge as 'sage' | 'marigold'}>{m.badge === 'sage' ? 'Recommended' : 'Situational'}</Badge>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>{m.desc}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
