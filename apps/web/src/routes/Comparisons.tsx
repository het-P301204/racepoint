import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GitCompare, ArrowRight } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Card, CardHeader } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { DEMO_COMPARISONS } from '../data'
import type { Comparison, InvariantResult } from '@racepoint/shared'

const INV_COLORS: Record<InvariantResult, 'coral' | 'sage' | 'marigold' | 'stone'> = {
  violated: 'coral',
  preserved: 'sage',
  inconclusive: 'marigold',
  'not-evaluated': 'stone',
}

// Demo static comparison data when no real comparisons loaded
const STATIC_COMPARISON: Comparison = {
  id: 'CMP-001',
  scenarioId: 'RACE-001',
  vulnerableRunId: 'RUN-2026-0001',
  hardenedRunId: 'RUN-2026-0002',
  createdAt: new Date().toISOString(),
  vulnerableResult: 'violated',
  hardenedResult: 'preserved',
  vulnerableRaceWindows: 3,
  hardenedRaceWindows: 0,
  vulnerableRuntimeMs: 142,
  hardenedRuntimeMs: 168,
  mitigationType: 'atomic-update',
  summary: 'Atomic UPDATE statement eliminates the TOCTOU window entirely. No race windows detected in 20 concurrent requests.',
}

export default function Comparisons() {
  const navigate = useNavigate()
  const comparisons = DEMO_COMPARISONS.length > 0 ? DEMO_COMPARISONS : [STATIC_COMPARISON]
  const [selected, setSelected] = useState<Comparison>(comparisons[0] ?? STATIC_COMPARISON)

  const barData = [
    { name: 'Race Windows', vulnerable: selected.vulnerableRaceWindows, hardened: selected.hardenedRaceWindows },
    { name: 'Runtime (ms)', vulnerable: Math.round(selected.vulnerableRuntimeMs), hardened: Math.round(selected.hardenedRuntimeMs) },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
          Comparisons
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
          Side-by-side vulnerable vs hardened analysis
        </p>
      </div>

      {/* Comparison selector */}
      <div style={{ display: 'flex', gap: 8 }}>
        {comparisons.map((c: Comparison) => (
          <button
            key={c.id}
            onClick={() => { setSelected(c) }}
            style={{
              padding: '8px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: 12,
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
              background: selected.id === c.id ? 'var(--color-iris-dim)' : 'var(--bg-secondary)',
              border: `1px solid ${selected.id === c.id ? 'rgba(146,130,173,0.3)' : 'var(--border-subtle)'}`,
              color: selected.id === c.id ? 'var(--color-iris)' : 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            {c.id}
          </button>
        ))}
      </div>

      {/* Side-by-side */}
      <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
        {/* Vulnerable side */}
        <div style={{ padding: 24, background: 'rgba(228,93,75,0.04)', borderRight: '2px solid var(--color-coral)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <Badge variant="coral">Vulnerable</Badge>
            <Button variant="ghost" size="sm" onClick={() => { navigate(`/runs/${selected.vulnerableRunId}`) }}>
              {selected.vulnerableRunId} <ArrowRight size={12} />
            </Button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Metric label="Invariant Result">
              <Badge variant={INV_COLORS[selected.vulnerableResult]}>{selected.vulnerableResult}</Badge>
            </Metric>
            <Metric label="Race Windows">
              <span style={{ fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-mono)', color: selected.vulnerableRaceWindows > 0 ? 'var(--color-coral)' : 'var(--text-primary)' }}>
                {selected.vulnerableRaceWindows}
              </span>
            </Metric>
            <Metric label="Runtime">
              <span style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-mono)' }}>
                {selected.vulnerableRuntimeMs}ms
              </span>
            </Metric>
          </div>
        </div>

        {/* Hardened side */}
        <div style={{ padding: 24, background: 'rgba(129,151,124,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <Badge variant="sage">Hardened</Badge>
            <Button variant="ghost" size="sm" onClick={() => { navigate(`/runs/${selected.hardenedRunId}`) }}>
              {selected.hardenedRunId} <ArrowRight size={12} />
            </Button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Metric label="Invariant Result">
              <Badge variant={INV_COLORS[selected.hardenedResult]}>{selected.hardenedResult}</Badge>
            </Metric>
            <Metric label="Race Windows">
              <span style={{ fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-mono)', color: selected.hardenedRaceWindows > 0 ? 'var(--color-coral)' : 'var(--color-sage)' }}>
                {selected.hardenedRaceWindows}
              </span>
            </Metric>
            <Metric label="Runtime">
              <span style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-mono)' }}>
                {selected.hardenedRuntimeMs}ms
              </span>
            </Metric>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Bar chart */}
        <Card>
          <CardHeader title="Metrics Comparison" />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} barCategoryGap="35%">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 12 }}
              />
              <Bar dataKey="vulnerable" name="Vulnerable" fill="#E45D4B" radius={[4, 4, 0, 0]} />
              <Bar dataKey="hardened" name="Hardened" fill="#81977C" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Summary */}
        <Card>
          <CardHeader title="Analysis Summary" subtitle={`Mitigation: ${selected.mitigationType}`} />
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 14 }}>
            {selected.summary}
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <Badge variant="iris">{selected.mitigationType}</Badge>
            <Badge variant="stone">{selected.scenarioId}</Badge>
          </div>
        </Card>
      </div>
    </div>
  )
}

function Metric({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
        {label}
      </div>
      {children}
    </div>
  )
}
