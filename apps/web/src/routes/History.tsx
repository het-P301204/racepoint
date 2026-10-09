import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from 'recharts'
import { Card, CardHeader } from '../components/ui/Card'
import { DEMO_RUNS } from '../data'

// Build history from runs or use placeholder data
function buildHistory() {
  if (DEMO_RUNS.length > 0) {
    return DEMO_RUNS.map((r, i) => ({
      run: r.id,
      raceWindows: r.raceWindows.length,
      violated: r.invariantResult === 'violated' ? 1 : 0,
      preserved: r.invariantResult === 'preserved' ? 1 : 0,
    }))
  }
  // Placeholder data
  return Array.from({ length: 12 }, (_, i) => {
    const violated = Math.random() > 0.5 ? 1 : 0
    return {
      run: `RUN-${String(i + 1).padStart(3, '0')}`,
      raceWindows: Math.floor(Math.random() * 5),
      violated,
      preserved: 1 - violated,
    }
  })
}

const CHART_TOOLTIP_STYLE = {
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border-default)',
  borderRadius: 8,
  color: 'var(--text-primary)',
  fontSize: 12,
}

export default function History() {
  const historyData = buildHistory()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
          History
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
          Historical trends across research runs
        </p>
      </div>

      {DEMO_RUNS.length === 0 && (
        <div style={{ padding: '12px 16px', background: 'var(--color-marigold-dim)', border: '1px solid rgba(213,166,66,0.25)', borderRadius: 'var(--radius-sm)', fontSize: 13, color: 'var(--color-marigold)' }}>
          Showing placeholder data — run scenarios to see real history
        </div>
      )}

      <Card>
        <CardHeader title="Race Windows per Run" subtitle="Number of detected race windows over time" />
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={historyData}>
            <defs>
              <linearGradient id="coralGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#E45D4B" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#E45D4B" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
            <XAxis dataKey="run" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
            <Area type="monotone" dataKey="raceWindows" stroke="#E45D4B" fill="url(#coralGrad)" strokeWidth={2} name="Race Windows" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <CardHeader title="Invariant Results" subtitle="Violated vs preserved over time" />
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={historyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
            <XAxis dataKey="run" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 1]} />
            <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
            <Legend formatter={(v) => <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{v}</span>} />
            <Line type="monotone" dataKey="violated" stroke="#E45D4B" strokeWidth={2} name="Violated" dot={{ fill: '#E45D4B', r: 3 }} />
            <Line type="monotone" dataKey="preserved" stroke="#81977C" strokeWidth={2} name="Preserved" dot={{ fill: '#81977C', r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {[
          { label: 'Total Runs', value: DEMO_RUNS.length || 0, color: 'var(--color-iris)' },
          { label: 'Invariants Violated', value: DEMO_RUNS.filter((r) => r.invariantResult === 'violated').length, color: 'var(--color-coral)' },
          { label: 'Invariants Preserved', value: DEMO_RUNS.filter((r) => r.invariantResult === 'preserved').length, color: 'var(--color-sage)' },
        ].map((m) => (
          <Card key={m.label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 32, fontWeight: 800, fontFamily: 'var(--font-mono)', color: m.color, marginBottom: 4 }}>
              {m.value}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
              {m.label}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
