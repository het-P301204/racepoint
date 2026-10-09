import { useState } from 'react'
import { BookOpen, ChevronDown, ChevronRight } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'

interface DocSection {
  id: string
  title: string
  badge?: string
  content: React.ReactNode
}

function CodeBlock({ code, lang = '' }: { code: string; lang?: string }) {
  return (
    <pre
      style={{
        margin: '10px 0',
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
  )
}

function P({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 10 }}>{children}</p>
}

function H3({ children }: { children: React.ReactNode }) {
  return <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6, marginTop: 14 }}>{children}</h3>
}

const SECTIONS: DocSection[] = [
  {
    id: 'api',
    title: 'REST API Reference',
    badge: 'API',
    content: (
      <>
        <P>The lab backend exposes a REST API at <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-mono)' }}>http://localhost:8000</code>.</P>
        <H3>POST /api/run</H3>
        <P>Start a new research run.</P>
        <CodeBlock lang="json" code={`POST /api/run
Content-Type: application/json

{
  "scenarioId": "RACE-001",
  "mode": "vulnerable",          // or "hardened"
  "concurrencyLevel": 10,
  "requestLimit": 20,
  "timeoutSeconds": 30,
  "barrierEnabled": true
}

// Response
{
  "runId": "RUN-2026-0041",
  "status": "starting",
  "message": "Run initiated"
}`} />
        <H3>GET /api/runs/:id</H3>
        <P>Fetch a completed run by ID. Returns the full ResearchRun object.</P>
        <H3>GET /api/status</H3>
        <P>Check lab server health. Returns SystemStatus.</P>
      </>
    ),
  },
  {
    id: 'types',
    title: 'Core Types',
    badge: 'TypeScript',
    content: (
      <>
        <P>All shared types are in <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-mono)' }}>packages/shared/src/types.ts</code>.</P>
        <H3>ResearchRun</H3>
        <CodeBlock code={`interface ResearchRun {
  id: string                    // RUN-2026-0041
  scenarioId: string
  executionMode: ExecutionMode
  events: RequestEvent[]
  raceWindows: RaceWindow[]
  stateTransitions: StateTransition[]
  invariantResult: InvariantResult
  finalState: Record<string, unknown>
}`} />
        <H3>RequestEvent</H3>
        <CodeBlock code={`interface RequestEvent {
  id: string
  runId: string
  requestId: string
  type: EventType
  monotonicMs: number           // ms since run start
  observedValue?: unknown
  committedValue?: unknown
}`} />
        <H3>RaceWindow</H3>
        <CodeBlock code={`interface RaceWindow {
  startMonotonicMs: number
  endMonotonicMs: number
  participatingRequests: string[]
  conclusion: 'confirmed' | 'plausible' | 'inconclusive'
  violatedInvariant?: string
}`} />
      </>
    ),
  },
  {
    id: 'scenarios',
    title: 'Adding Scenarios',
    badge: 'Guide',
    content: (
      <>
        <P>Each scenario requires a vulnerable fixture, a hardened fixture, and a scenario definition.</P>
        <H3>1. Define the scenario in shared/src/</H3>
        <CodeBlock code={`const scenario: Scenario = {
  id: 'RACE-013',
  name: 'My New Race Condition',
  category: 'database-toctou',
  difficulty: 'intermediate',
  fixture: vulnerableFixture,
  hardenedFixture: hardenedFixture,
  sharedState: 'account.balance',
  invariant: {
    type: 'minimum_balance',
    description: 'Balance must never go below 0',
    constraint: { min: 0 }
  },
  expectedVulnerableResult: 'violated',
  expectedHardenedResult: 'preserved',
  executionMode: 'simulated',
  tags: ['database', 'balance'],
  status: 'available',
  evidenceAvailable: false
}`} />
        <H3>2. Implement fixtures in lab/</H3>
        <P>Fixtures are Python or TypeScript implementations of the vulnerable and hardened patterns. The lab engine invokes them with concurrent HTTP requests.</P>
        <H3>3. Register in demo data</H3>
        <P>Add the scenario to <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-mono)' }}>apps/web/src/data/index.ts</code> once you have demo run data.</P>
      </>
    ),
  },
  {
    id: 'architecture',
    title: 'Architecture',
    badge: 'System',
    content: (
      <>
        <P>RACEPOINT is a monorepo with three main packages:</P>
        <CodeBlock code={`racepoint/
├── apps/
│   ├── web/          React+TS+Vite frontend (this app)
│   └── api/          FastAPI backend (lab engine)
├── packages/
│   └── shared/       Types shared between web and api
└── lab/              Fixture implementations (Python/TS)`} />
        <H3>Data Flow</H3>
        <P>1. User configures a run in the Attack Lab and clicks "Run".</P>
        <P>2. Frontend POSTs to /api/run. The lab engine spawns concurrent workers.</P>
        <P>3. Each worker emits RequestEvents. The engine detects RaceWindows.</P>
        <P>4. At completion, the engine evaluates the invariant and returns a ResearchRun.</P>
        <P>5. The frontend fetches the run and renders the Race Timeline.</P>
      </>
    ),
  },
]

export default function Documentation() {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['api']))

  function toggle(id: string) {
    setOpenSections((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
          Documentation
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
          Technical reference for the RACEPOINT platform
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {SECTIONS.map((sec) => {
          const isOpen = openSections.has(sec.id)
          return (
            <div
              key={sec.id}
              style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}
            >
              <button
                onClick={() => { toggle(sec.id) }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '14px 18px',
                  background: isOpen ? 'var(--bg-surface)' : 'var(--bg-secondary)',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background var(--transition-fast)',
                }}
              >
                {isOpen
                  ? <ChevronDown size={15} style={{ color: 'var(--color-iris)', flexShrink: 0 }} />
                  : <ChevronRight size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                }
                <span style={{ fontSize: 15, fontWeight: 600, color: isOpen ? 'var(--text-primary)' : 'var(--text-secondary)', flex: 1 }}>
                  {sec.title}
                </span>
                {sec.badge !== undefined && <Badge variant="iris">{sec.badge}</Badge>}
              </button>
              {isOpen && (
                <div style={{ padding: '16px 20px', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-subtle)' }}>
                  {sec.content}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
