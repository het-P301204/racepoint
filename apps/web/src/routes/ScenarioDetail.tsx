import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, FlaskConical, Shield, GitCompare, Tag, Clock } from 'lucide-react'
import { Card, CardHeader } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { DEMO_SCENARIOS, DEMO_RUNS } from '../data'
import type { ScenarioDifficulty, InvariantResult } from '@racepoint/shared'

const DIFFICULTY_COLORS: Record<ScenarioDifficulty, 'stone' | 'sage' | 'marigold' | 'coral'> = {
  beginner: 'sage',
  intermediate: 'marigold',
  advanced: 'coral',
  expert: 'coral',
}

const INVARIANT_COLORS: Record<InvariantResult, 'coral' | 'sage' | 'marigold' | 'stone'> = {
  violated: 'coral',
  preserved: 'sage',
  inconclusive: 'marigold',
  'not-evaluated': 'stone',
}

export default function ScenarioDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const scenario = DEMO_SCENARIOS.find((s) => s.id === id)
  const relatedRuns = DEMO_RUNS.filter((r) => r.scenarioId === id)

  if (scenario === undefined) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <button
          onClick={() => { navigate('/scenarios') }}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 13,
            padding: 0,
          }}
        >
          <ArrowLeft size={14} /> Back to Scenarios
        </button>
        <Card>
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
              Scenario not found: {id}
            </p>
            <p style={{ fontSize: 14 }}>Load demo data or check the scenario ID.</p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={() => { navigate('/scenarios') }}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 13,
            padding: 0,
          }}
        >
          <ArrowLeft size={14} /> Back
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-mono)' }}>
              {scenario.id}
            </span>
            <Badge variant={DIFFICULTY_COLORS[scenario.difficulty]}>{scenario.difficulty}</Badge>
            <Badge variant={scenario.status === 'available' ? 'sage' : 'stone'}>{scenario.status}</Badge>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
            {scenario.name}
          </h1>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: 600 }}>
            {scenario.description}
          </p>
        </div>
        <Button variant="primary" onClick={() => { navigate('/lab') }}>
          <FlaskConical size={14} /> Run in Lab
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Fixtures */}
          <Card>
            <CardHeader title="Fixtures" subtitle="Vulnerable and hardened implementations" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ background: 'var(--color-coral-dim)', border: '1px solid rgba(228,93,75,0.2)', borderRadius: 'var(--radius-sm)', padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <Badge variant="coral">Vulnerable</Badge>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                  {scenario.fixture.name}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                  {scenario.fixture.description}
                </div>
                <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-mono)' }}>
                  v{scenario.fixture.version} · {scenario.fixture.language}
                </div>
              </div>
              <div style={{ background: 'var(--color-sage-dim)', border: '1px solid rgba(129,151,124,0.2)', borderRadius: 'var(--radius-sm)', padding: 16 }}>
                <div style={{ marginBottom: 8 }}>
                  <Badge variant="sage">Hardened</Badge>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                  {scenario.hardenedFixture.name}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                  {scenario.hardenedFixture.description}
                </div>
                {scenario.hardenedFixture.mitigationDescription !== undefined && (
                  <div style={{ fontSize: 12, color: 'var(--color-sage)', fontStyle: 'italic' }}>
                    Mitigation: {scenario.hardenedFixture.mitigationDescription}
                  </div>
                )}
                <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-mono)', marginTop: 6 }}>
                  v{scenario.hardenedFixture.version} · {scenario.hardenedFixture.language}
                </div>
              </div>
            </div>
          </Card>

          {/* Related Runs */}
          <Card>
            <CardHeader
              title="Related Runs"
              subtitle={`${relatedRuns.length} run(s) for this scenario`}
              action={
                <Button variant="ghost" size="sm" onClick={() => { navigate('/runs') }}>
                  All runs
                </Button>
              }
            />
            {relatedRuns.length === 0 ? (
              <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                No runs yet for this scenario.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {relatedRuns.map((run) => (
                  <div
                    key={run.id}
                    onClick={() => { navigate(`/runs/${run.id}`) }}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 12px',
                      background: 'var(--bg-surface)',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--text-mono)' }}>
                      {run.id}
                    </span>
                    <Badge variant={INVARIANT_COLORS[run.invariantResult]}>{run.invariantResult}</Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card>
            <CardHeader title="Invariant" />
            <div style={{ fontSize: 13, color: 'var(--text-primary)', marginBottom: 12, lineHeight: 1.6 }}>
              {scenario.invariant.description}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Expected (Vulnerable)</div>
                <Badge variant={INVARIANT_COLORS[scenario.expectedVulnerableResult]}>
                  {scenario.expectedVulnerableResult}
                </Badge>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Expected (Hardened)</div>
                <Badge variant={INVARIANT_COLORS[scenario.expectedHardenedResult]}>
                  {scenario.expectedHardenedResult}
                </Badge>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Shared State" />
            <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--text-mono)', padding: '10px', background: 'var(--bg-surface)', borderRadius: 8 }}>
              {scenario.sharedState}
            </div>
          </Card>

          <Card>
            <CardHeader title="Tags" />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {scenario.tags.map((t) => (
                <span
                  key={t}
                  style={{
                    fontSize: 11,
                    padding: '3px 9px',
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
          </Card>

          {scenario.lastRun !== undefined && (
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Clock size={13} style={{ color: 'var(--text-muted)' }} />
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Last Run</div>
                  <div style={{ fontSize: 13, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                    {new Date(scenario.lastRun).toLocaleString()}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
