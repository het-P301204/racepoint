import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FlaskConical, Play, Info, Settings2, Wifi, WifiOff } from 'lucide-react'
import { Card, CardHeader } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { useAppStore } from '../store/appStore'
import { useToast } from '../hooks/useToast'

const SCENARIOS_META = [
  { id: 'RACE-001', name: 'HTTP Rate Limit Override', difficulty: 'intermediate' },
  { id: 'RACE-002', name: 'Coupon Double Redemption', difficulty: 'beginner' },
  { id: 'RACE-003', name: 'Gift Card Balance Drain', difficulty: 'intermediate' },
  { id: 'RACE-004', name: 'Inventory Oversell', difficulty: 'beginner' },
  { id: 'RACE-005', name: 'Account Registration Duplicate', difficulty: 'advanced' },
  { id: 'RACE-006', name: 'Database TOCTOU: Balance Check', difficulty: 'intermediate' },
]

export default function Lab() {
  const mode = useAppStore((s) => s.mode)
  const navigate = useNavigate()
  const toast = useToast()

  const [selectedScenario, setSelectedScenario] = useState('RACE-001')
  const [fixtureMode, setFixtureMode] = useState<'vulnerable' | 'hardened'>('vulnerable')
  const [concurrency, setConcurrency] = useState(10)
  const [requestLimit, setRequestLimit] = useState(20)
  const [timeout, setTimeout_] = useState(30)
  const [barrier, setBarrier] = useState(true)
  const [running, setRunning] = useState(false)

  async function handleRun() {
    if (mode === 'demo') {
      toast.info('Switch to Local Lab mode to execute real runs. Demo mode shows pre-recorded data.')
      return
    }
    setRunning(true)
    toast.info(`Starting ${fixtureMode} run for ${selectedScenario}...`)
    try {
      const res = await fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioId: selectedScenario,
          mode: fixtureMode,
          concurrencyLevel: concurrency,
          requestLimit,
          timeoutSeconds: timeout,
          barrierEnabled: barrier,
        }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json() as { runId: string }
      toast.success(`Run started: ${data.runId}`)
      navigate(`/runs/${data.runId}`)
    } catch (err) {
      toast.error('Failed to start run. Is the lab server running?')
    } finally {
      setRunning(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
            Attack Lab
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
            Configure and execute race condition scenarios
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {mode === 'local-lab' ? (
            <Badge variant="sage"><Wifi size={10} style={{ display: 'inline', marginRight: 4 }} />Local Lab</Badge>
          ) : (
            <Badge variant="marigold"><WifiOff size={10} style={{ display: 'inline', marginRight: 4 }} />Demo Mode</Badge>
          )}
        </div>
      </div>

      {mode === 'demo' && (
        <Card style={{ border: '1px solid rgba(213,166,66,0.3)', background: 'var(--color-marigold-dim)' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Info size={16} style={{ color: 'var(--color-marigold)', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-marigold)', marginBottom: 2 }}>
                Demo Mode Active
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                Connect to a Local Lab instance to execute real runs. Switch mode in the header or Settings.
                In Demo mode, run buttons will show pre-recorded results.
              </div>
            </div>
          </div>
        </Card>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Scenario selector */}
          <Card>
            <CardHeader title="Scenario" subtitle="Select a race condition to test" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {SCENARIOS_META.map((s) => (
                <label
                  key={s.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 14px',
                    background: selectedScenario === s.id ? 'var(--color-coral-dim)' : 'var(--bg-surface)',
                    border: `1px solid ${selectedScenario === s.id ? 'rgba(228,93,75,0.3)' : 'var(--border-subtle)'}`,
                    borderRadius: 10,
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <input
                    type="radio"
                    name="scenario"
                    value={s.id}
                    checked={selectedScenario === s.id}
                    onChange={() => { setSelectedScenario(s.id) }}
                    style={{ accentColor: 'var(--color-coral)', width: 14, height: 14 }}
                  />
                  <span style={{ flex: 1, fontSize: 14, fontWeight: selectedScenario === s.id ? 600 : 400, color: selectedScenario === s.id ? 'var(--color-coral)' : 'var(--text-primary)' }}>
                    {s.name}
                  </span>
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-mono)' }}>{s.id}</span>
                </label>
              ))}
            </div>
          </Card>

          {/* Fixture mode */}
          <Card>
            <CardHeader title="Fixture Mode" subtitle="Choose implementation to test" />
            <div style={{ display: 'flex', gap: 12 }}>
              {(['vulnerable', 'hardened'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => { setFixtureMode(m) }}
                  style={{
                    flex: 1,
                    padding: '14px',
                    borderRadius: 'var(--radius-sm)',
                    border: `2px solid ${fixtureMode === m ? (m === 'vulnerable' ? 'var(--color-coral)' : 'var(--color-sage)') : 'var(--border-subtle)'}`,
                    background: fixtureMode === m ? (m === 'vulnerable' ? 'var(--color-coral-dim)' : 'var(--color-sage-dim)') : 'var(--bg-surface)',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 700, color: fixtureMode === m ? (m === 'vulnerable' ? 'var(--color-coral)' : 'var(--color-sage)') : 'var(--text-muted)', marginBottom: 4 }}>
                    {m === 'vulnerable' ? 'Vulnerable' : 'Hardened'}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {m === 'vulnerable' ? 'Expect invariant violation' : 'Expect invariant preserved'}
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Config panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card>
            <CardHeader title="Configuration" subtitle="Run parameters" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <FieldRow
                label="Concurrency"
                hint="Parallel requests"
                value={concurrency}
                onChange={setConcurrency}
                min={2}
                max={50}
              />
              <FieldRow
                label="Request Limit"
                hint="Max total requests"
                value={requestLimit}
                onChange={setRequestLimit}
                min={2}
                max={200}
              />
              <FieldRow
                label="Timeout (s)"
                hint="Max run duration"
                value={timeout}
                onChange={setTimeout_}
                min={5}
                max={300}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Barrier Sync</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Synchronized launch</div>
                </div>
                <button
                  onClick={() => { setBarrier((b) => !b) }}
                  style={{
                    width: 40,
                    height: 22,
                    borderRadius: 11,
                    background: barrier ? 'var(--color-coral)' : 'var(--bg-elevated)',
                    border: '1px solid var(--border-default)',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'background var(--transition-fast)',
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      top: 2,
                      left: barrier ? 20 : 2,
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      background: '#F5F0E7',
                      transition: 'left var(--transition-fast)',
                    }}
                  />
                </button>
              </div>
            </div>
          </Card>

          <Button
            variant="primary"
            size="lg"
            loading={running}
            onClick={() => void handleRun()}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <Play size={16} />
            {running ? 'Running...' : `Run ${fixtureMode}`}
          </Button>

          <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.5 }}>
            Results will appear in <strong style={{ color: 'var(--text-secondary)' }}>Runs</strong> and the{' '}
            <strong style={{ color: 'var(--text-secondary)' }}>Race Timeline</strong>
          </div>
        </div>
      </div>
    </div>
  )
}

function FieldRow({
  label,
  hint,
  value,
  onChange,
  min,
  max,
}: {
  label: string
  hint: string
  value: number
  onChange: (v: number) => void
  min: number
  max: number
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{label}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{hint}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          onClick={() => { onChange(Math.max(min, value - 1)) }}
          style={{
            width: 26,
            height: 26,
            borderRadius: 6,
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          −
        </button>
        <span style={{ fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-mono)', minWidth: 28, textAlign: 'center' }}>
          {value}
        </span>
        <button
          onClick={() => { onChange(Math.min(max, value + 1)) }}
          style={{
            width: 26,
            height: 26,
            borderRadius: 6,
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          +
        </button>
      </div>
    </div>
  )
}
