import { useNavigate } from 'react-router-dom'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts'
import { ArrowRight, FlaskConical, Shield, Activity, Clock, GitCompare } from 'lucide-react'
import { Card, CardHeader } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { DEMO_RUNS, DEMO_SCENARIOS, DEMO_ACTIVITY, DEMO_METRICS, DEMO_COMPARISONS } from '../data'

const M = DEMO_METRICS

const METRICS = [
  { label: 'Total Runs', value: String(M.totalRuns), sub: `${M.completedRuns} completed, ${M.failedRuns} failed`, color: 'var(--color-iris)', icon: Activity },
  { label: 'Invariants Violated', value: String(M.violatedRuns), sub: `${Math.round(M.violationRate * 100)}% violation rate`, color: 'var(--color-coral)', icon: Shield },
  { label: 'Race Windows Found', value: String(M.totalRaceWindows), sub: `${M.inconclusiveRuns} inconclusive`, color: 'var(--color-marigold)', icon: Clock },
  { label: 'Scenarios Available', value: String(DEMO_SCENARIOS.length), sub: 'Across 4 categories', color: 'var(--color-sage)', icon: FlaskConical },
  { label: 'Comparisons', value: String(M.totalComparisons), sub: `${Math.round(M.mitigationSuccessRate * 100)}% mitigation success`, color: 'var(--color-plum)', icon: GitCompare },
]

const PIE_DATA = [
  { name: 'HTTP / Rate Limit', value: 4, color: '#E45D4B' },
  { name: 'Database TOCTOU', value: 4, color: '#9282AD' },
  { name: 'Filesystem TOCTOU', value: 4, color: '#D5A642' },
  { name: 'Distributed State', value: 4, color: '#81977C' },
  { name: 'Account / Session', value: 4, color: '#594451' },
]

const BAR_DATA = DEMO_COMPARISONS.slice(0, 8).map(c => ({
  name: c.scenarioId,
  violated: c.vulnerableRaceWindows,
  preserved: c.hardenedRaceWindows === 0 ? 1 : 0,
}))

export default function Overview() {
  const navigate = useNavigate()
  const hasData = DEMO_RUNS.length > 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
            Research Dashboard
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
            Race condition &amp; TOCTOU research overview
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="primary" size="sm" onClick={() => { navigate('/lab') }}>
            <FlaskConical size={14} /> Open Lab
          </Button>
          <Button variant="secondary" size="sm" onClick={() => { navigate('/showcase') }}>
            View Showcase
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
        {METRICS.map((m) => {
          const Icon = m.icon
          return (
            <Card key={m.label} style={{ borderLeft: `2px solid ${m.color}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Icon size={14} style={{ color: m.color }} />
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {m.label}
                </span>
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>
                {m.value}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.sub}</div>
            </Card>
          )
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Scenario Coverage Pie */}
        <Card>
          <CardHeader title="Scenario Coverage" subtitle="By category" />
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={PIE_DATA}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {PIE_DATA.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 8,
                  color: 'var(--text-primary)',
                  fontSize: 12,
                }}
              />
              <Legend
                formatter={(value) => (
                  <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Vulnerable vs Hardened Bar */}
        <Card>
          <CardHeader title="Invariant Violations" subtitle="Vulnerable vs Hardened (demo)" />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={BAR_DATA} barCategoryGap="35%">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 1]} />
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 8,
                  color: 'var(--text-primary)',
                  fontSize: 12,
                }}
              />
              <Bar dataKey="violated" name="Violated" fill="#E45D4B" radius={[4, 4, 0, 0]} />
              <Bar dataKey="preserved" name="Preserved" fill="#81977C" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Activity feed */}
      <Card>
        <CardHeader
          title="Activity Feed"
          subtitle="Recent research events"
          action={
            <Button variant="ghost" size="sm" onClick={() => { navigate('/runs') }}>
              View all runs <ArrowRight size={12} />
            </Button>
          }
        />
        {DEMO_ACTIVITY.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: 14 }}>
            <p>No activity yet. Run a scenario in the <strong style={{ color: 'var(--color-coral)' }}>Attack Lab</strong> to get started.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {DEMO_ACTIVITY.slice(0, 10).map((a) => (
              <div
                key={a.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 0',
                  borderBottom: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ fontSize: 13, color: 'var(--text-primary)', flex: 1 }}>{a.message}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {new Date(a.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
