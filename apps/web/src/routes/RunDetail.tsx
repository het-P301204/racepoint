import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, GitCompare } from 'lucide-react'
import { Card, CardHeader } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { DEMO_RUNS } from '../data'
import type { InvariantResult, RunStatus, RequestEvent, StateTransition } from '@racepoint/shared'
import { useTimelineStore } from '../store/timelineStore'

const STATUS_COLORS: Record<RunStatus, 'sage' | 'coral' | 'marigold' | 'stone' | 'iris'> = {
  completed: 'sage',
  failed: 'coral',
  running: 'marigold',
  idle: 'stone',
  starting: 'marigold',
  cancelled: 'stone',
  inconclusive: 'iris',
}

const INV_COLORS: Record<InvariantResult, 'coral' | 'sage' | 'marigold' | 'stone'> = {
  violated: 'coral',
  preserved: 'sage',
  inconclusive: 'marigold',
  'not-evaluated': 'stone',
}

export default function RunDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const setSelectedRun = useTimelineStore((s) => s.setSelectedRun)

  const run = DEMO_RUNS.find((r) => r.id === id)

  if (run === undefined) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <button
          onClick={() => { navigate('/runs') }}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, padding: 0 }}
        >
          <ArrowLeft size={14} /> Back to Runs
        </button>
        <Card>
          <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
            Run not found: {id}. Load demo data or run a scenario first.
          </div>
        </Card>
      </div>
    )
  }

  const durationMs = run.completedAt !== undefined
    ? new Date(run.completedAt).getTime() - new Date(run.startedAt).getTime()
    : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={() => { navigate('/runs') }}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, padding: 0 }}
        >
          <ArrowLeft size={14} /> Back
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <Badge variant={STATUS_COLORS[run.status]}>{run.status}</Badge>
            <Badge variant={INV_COLORS[run.invariantResult]}>{run.invariantResult}</Badge>
            <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-mono)' }}>
              {run.executionMode}
            </span>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
            {run.id}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Scenario: <strong style={{ color: 'var(--text-secondary)' }}>{run.scenarioId}</strong>
            {durationMs !== null && (
              <> · Duration: <strong style={{ color: 'var(--text-secondary)' }}>{durationMs}ms</strong></>
            )}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setSelectedRun(run)
              navigate('/race-timeline')
            }}
          >
            <Clock size={13} /> View Timeline
          </Button>
          <Button variant="secondary" size="sm" onClick={() => { navigate('/comparisons') }}>
            <GitCompare size={13} /> Compare
          </Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        {[
          { label: 'Events', value: run.events.length },
          { label: 'Race Windows', value: run.raceWindows.length },
          { label: 'State Transitions', value: run.stateTransitions.length },
          { label: 'Concurrency', value: run.config.concurrencyLevel },
          { label: 'Request Limit', value: run.config.requestLimit },
          { label: 'Workers', value: run.workerCount ?? '—' },
        ].map((m) => (
          <Card key={m.label}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
              {m.label}
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
              {m.value}
            </div>
          </Card>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Event log */}
        <Card>
          <CardHeader title="Event Log" subtitle={`${run.events.length} events`} />
          <div style={{ maxHeight: 360, overflowY: 'auto' }}>
            {run.events.length === 0 ? (
              <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                No events recorded.
              </div>
            ) : (
              run.events.map((ev: RequestEvent) => (
                <div
                  key={ev.id}
                  style={{
                    display: 'flex',
                    gap: 10,
                    padding: '7px 0',
                    borderBottom: '1px solid var(--border-subtle)',
                    fontSize: 12,
                  }}
                >
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', minWidth: 56 }}>
                    {ev.monotonicMs.toFixed(1)}ms
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-mono)', minWidth: 180 }}>
                    {ev.type}
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>{ev.requestId.slice(0, 10)}</span>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Race windows & state */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card>
            <CardHeader title="Race Windows" subtitle={`${run.raceWindows.length} detected`} />
            {run.raceWindows.length === 0 ? (
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>No race windows detected.</div>
            ) : (
              run.raceWindows.map((rw) => (
                <div key={rw.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-mono)' }}>{rw.id}</span>
                    <Badge variant={rw.conclusion === 'confirmed' ? 'coral' : 'marigold'}>{rw.conclusion}</Badge>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {rw.startMonotonicMs.toFixed(1)}ms → {rw.endMonotonicMs.toFixed(1)}ms
                    ({(rw.endMonotonicMs - rw.startMonotonicMs).toFixed(2)}ms)
                  </div>
                </div>
              ))
            )}
          </Card>

          <Card>
            <CardHeader title="Final State" />
            <pre style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-mono)', background: 'var(--bg-surface)', borderRadius: 8, padding: 12, overflow: 'auto', margin: 0, maxHeight: 180 }}>
              {JSON.stringify(run.finalState, null, 2)}
            </pre>
          </Card>

          {run.reproducibilityHash !== undefined && (
            <Card>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Reproducibility Hash</div>
              <code style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-mono)', wordBreak: 'break-all' }}>
                {run.reproducibilityHash}
              </code>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
