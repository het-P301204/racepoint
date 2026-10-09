import { useState } from 'react'
import { Activity, ChevronRight, ChevronDown } from 'lucide-react'
import { Card, CardHeader } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { EmptyState } from '../components/ui/EmptyState'
import { DEMO_RUNS } from '../data'
import type { ResearchRun, StateTransition } from '@racepoint/shared'

function TransitionRow({ t, isSelected, onClick }: { t: StateTransition; isSelected: boolean; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 12px',
        background: isSelected ? 'var(--color-coral-dim)' : 'transparent',
        borderRadius: 8,
        cursor: 'pointer',
        borderBottom: '1px solid var(--border-subtle)',
        transition: 'background var(--transition-fast)',
      }}
    >
      <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-mono)', minWidth: 80 }}>
        {t.id}
      </span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>
          {t.stateId}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
          <code style={{ color: 'var(--color-coral)', fontFamily: 'var(--font-mono)' }}>
            {JSON.stringify(t.fromValue)}
          </code>
          <ChevronRight size={12} style={{ color: 'var(--text-muted)' }} />
          <code style={{ color: 'var(--color-sage)', fontFamily: 'var(--font-mono)' }}>
            {JSON.stringify(t.toValue)}
          </code>
        </div>
      </div>
      <Badge variant={t.committed ? 'sage' : 'coral'}>{t.committed ? 'committed' : 'rejected'}</Badge>
    </div>
  )
}

export default function StateInspector() {
  const [selectedRun, setSelectedRun] = useState<ResearchRun | null>(
    DEMO_RUNS.length > 0 ? (DEMO_RUNS[0] ?? null) : null
  )
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null)

  const transitions = selectedRun?.stateTransitions ?? []
  const selectedTx = transitions.find((t: StateTransition) => t.id === selectedTxId)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
          State Inspector
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
          Inspect shared state snapshots and transitions across concurrent requests
        </p>
      </div>

      {DEMO_RUNS.length === 0 ? (
        <EmptyState
          title="No run data loaded"
          description="Load demo data or run a scenario in the Attack Lab to inspect state transitions"
          icon={<Activity size={32} />}
        />
      ) : (
        <>
          {/* Run selector */}
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
            {DEMO_RUNS.map((r: ResearchRun) => (
              <button
                key={r.id}
                onClick={() => { setSelectedRun(r); setSelectedTxId(null) }}
                style={{
                  padding: '7px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 12,
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  background: selectedRun?.id === r.id ? 'var(--color-iris-dim)' : 'var(--bg-secondary)',
                  border: `1px solid ${selectedRun?.id === r.id ? 'rgba(146,130,173,0.3)' : 'var(--border-subtle)'}`,
                  color: selectedRun?.id === r.id ? 'var(--color-iris)' : 'var(--text-muted)',
                  cursor: 'pointer',
                }}
              >
                {r.id}
              </button>
            ))}
          </div>

          {selectedRun !== null && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <Card>
                <CardHeader
                  title="State Transitions"
                  subtitle={`${transitions.length} transitions`}
                />
                {transitions.length === 0 ? (
                  <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                    No state transitions recorded in this run.
                  </div>
                ) : (
                  <div style={{ maxHeight: 480, overflowY: 'auto' }}>
                    {transitions.map((t: StateTransition) => (
                      <TransitionRow
                        key={t.id}
                        t={t}
                        isSelected={selectedTxId === t.id}
                        onClick={() => { setSelectedTxId(t.id) }}
                      />
                    ))}
                  </div>
                )}
              </Card>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Selected transition detail */}
                <Card>
                  <CardHeader title="Transition Detail" />
                  {selectedTx === undefined ? (
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                      Click a transition to see details.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {[
                        { label: 'ID', value: selectedTx.id, mono: true },
                        { label: 'State ID', value: selectedTx.stateId, mono: true },
                        { label: 'Request', value: selectedTx.requestId, mono: true },
                        { label: 'From', value: JSON.stringify(selectedTx.fromValue), mono: true },
                        { label: 'To', value: JSON.stringify(selectedTx.toValue), mono: true },
                        { label: 'Committed', value: String(selectedTx.committed) },
                        { label: 'Timestamp', value: new Date(selectedTx.timestamp).toISOString() },
                      ].map(({ label, value, mono }) => (
                        <div key={label} style={{ display: 'flex', gap: 10 }}>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)', minWidth: 80 }}>{label}</span>
                          <span style={{ fontSize: 12, color: mono === true ? 'var(--text-mono)' : 'var(--text-primary)', fontFamily: mono === true ? 'var(--font-mono)' : undefined, wordBreak: 'break-all' }}>
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

                {/* Final state */}
                <Card>
                  <CardHeader title="Final State" />
                  <pre
                    style={{
                      fontSize: 12,
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--text-mono)',
                      background: 'var(--bg-surface)',
                      borderRadius: 8,
                      padding: 12,
                      overflowX: 'auto',
                      margin: 0,
                    }}
                  >
                    {JSON.stringify(selectedRun.finalState, null, 2)}
                  </pre>
                </Card>

                {/* Initial state */}
                <Card>
                  <CardHeader title="Initial State" />
                  <pre
                    style={{
                      fontSize: 12,
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--text-mono)',
                      background: 'var(--bg-surface)',
                      borderRadius: 8,
                      padding: 12,
                      overflowX: 'auto',
                      margin: 0,
                    }}
                  >
                    {JSON.stringify(selectedRun.initialState, null, 2)}
                  </pre>
                </Card>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
