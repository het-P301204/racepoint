import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, X, ChevronRight, Download } from 'lucide-react'
import { DataTable } from '../components/ui/DataTable'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card, CardHeader } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { DEMO_EVIDENCE } from '../data'
import type { Evidence, InvariantResult } from '@racepoint/shared'
import type { Column } from '../components/ui/DataTable'

const INV_COLORS: Record<InvariantResult, 'coral' | 'sage' | 'marigold' | 'stone'> = {
  violated: 'coral',
  preserved: 'sage',
  inconclusive: 'marigold',
  'not-evaluated': 'stone',
}

type EvidenceRow = Record<string, unknown>
type EvidenceFilter = 'all' | 'violated' | 'preserved' | 'inconclusive'

const EV_FILTER_OPTIONS: { label: string; value: EvidenceFilter; color: string }[] = [
  { label: 'All', value: 'all', color: 'var(--text-muted)' },
  { label: 'Violated', value: 'violated', color: 'var(--color-coral)' },
  { label: 'Preserved', value: 'preserved', color: 'var(--color-sage)' },
  { label: 'Inconclusive', value: 'inconclusive', color: 'var(--color-marigold)' },
]

function exportEvidence(records: Evidence[]) {
  const blob = new Blob([JSON.stringify(records, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `racepoint-evidence-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export default function Evidence_() {
  const navigate = useNavigate()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null)
  const [evFilter, setEvFilter] = useState<EvidenceFilter>('all')

  const filteredEvidence = DEMO_EVIDENCE.filter((e) =>
    evFilter === 'all' || e.actualResult === evFilter
  )

  const columns: Column<EvidenceRow>[] = [
    {
      key: 'id',
      header: 'Evidence ID',
      sortable: true,
      render: (row) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-mono)' }}>
          {String(row['id'])}
        </span>
      ),
    },
    {
      key: 'scenarioId',
      header: 'Scenario',
      sortable: true,
      render: (row) => (
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{String(row['scenarioId'])}</span>
      ),
    },
    {
      key: 'actualResult',
      header: 'Result',
      sortable: true,
      render: (row) => {
        const r = String(row['actualResult']) as InvariantResult
        return <Badge variant={INV_COLORS[r] ?? 'stone'}>{r}</Badge>
      },
    },
    {
      key: 'eventType',
      header: 'Event Type',
      render: (row) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
          {String(row['eventType'])}
        </span>
      ),
    },
    {
      key: 'timestamp',
      header: 'Timestamp',
      sortable: true,
      render: (row) => (
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {new Date(String(row['timestamp'])).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <button
          onClick={(e) => {
            e.stopPropagation()
            const ev = DEMO_EVIDENCE.find((x) => x.id === row['id'])
            if (ev !== undefined) {
              setSelectedEvidence(ev)
              setDrawerOpen(true)
            }
          }}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}
        >
          <ChevronRight size={13} />
        </button>
      ),
    },
  ]

  const data: EvidenceRow[] = filteredEvidence.map((e: Evidence) => ({
    id: e.id,
    scenarioId: e.scenarioId,
    actualResult: e.actualResult,
    eventType: e.eventType,
    timestamp: e.timestamp,
    runId: e.runId,
  }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
            Evidence Vault
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
            Captured evidence records from research runs
          </p>
        </div>
        <button
          onClick={() => { exportEvidence(filteredEvidence) }}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600,
            padding: '6px 12px', background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)', cursor: 'pointer',
          }}
        >
          <Download size={13} /> Export JSON
        </button>
      </div>

      {/* Filter chips */}
      <div style={{ display: 'flex', gap: 6 }}>
        {EV_FILTER_OPTIONS.map((opt) => {
          const count = opt.value === 'all'
            ? DEMO_EVIDENCE.length
            : DEMO_EVIDENCE.filter(e => e.actualResult === opt.value).length
          const active = evFilter === opt.value
          return (
            <button
              key={opt.value}
              onClick={() => { setEvFilter(opt.value) }}
              style={{
                padding: '5px 12px', borderRadius: 'var(--radius-pill)', fontSize: 12, fontWeight: 600,
                border: `1px solid ${active ? opt.color : 'var(--border-default)'}`,
                background: active ? `${opt.color}18` : 'var(--bg-surface)',
                color: active ? opt.color : 'var(--text-muted)',
                cursor: 'pointer', transition: 'all var(--transition-fast)',
              }}
            >
              {opt.label} <span style={{ opacity: 0.7 }}>({count})</span>
            </button>
          )
        })}
      </div>

      {DEMO_EVIDENCE.length === 0 ? (
        <EmptyState
          title="No evidence captured yet"
          description="Evidence is automatically captured during scenario runs"
          icon={<Shield size={32} />}
          action={<Button variant="primary" onClick={() => { navigate('/lab') }}>Run a Scenario</Button>}
        />
      ) : (
        <DataTable
          columns={columns}
          data={data}
          searchable
          searchKeys={['id', 'scenarioId', 'eventType']}
          rowKey={(row) => String(row['id'])}
          onRowClick={(row) => {
            const ev = DEMO_EVIDENCE.find((x) => x.id === row['id'])
            if (ev !== undefined) {
              setSelectedEvidence(ev)
              setDrawerOpen(true)
            }
          }}
          emptyMessage="No evidence matches your search"
        />
      )}

      {/* Drawer */}
      {drawerOpen && selectedEvidence !== null && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 500,
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <div
            style={{ flex: 1, background: 'rgba(25,25,24,0.5)' }}
            onClick={() => { setDrawerOpen(false) }}
          />
          <div
            style={{
              width: 420,
              background: 'var(--bg-secondary)',
              borderLeft: '1px solid var(--border-subtle)',
              overflowY: 'auto',
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              animation: 'slide-in-up 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-mono)', marginBottom: 4 }}>
                  {selectedEvidence.id}
                </div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
                  Evidence Detail
                </h2>
              </div>
              <button
                onClick={() => { setDrawerOpen(false) }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}
              >
                <X size={16} />
              </button>
            </div>

            {[
              { label: 'Run ID', value: selectedEvidence.runId, mono: true },
              { label: 'Scenario', value: selectedEvidence.scenarioId, mono: true },
              { label: 'Request', value: selectedEvidence.requestId, mono: true },
              { label: 'Event Type', value: selectedEvidence.eventType, mono: true },
              { label: 'Actual Result', value: selectedEvidence.actualResult },
              { label: 'Expected', value: selectedEvidence.expectedInvariant },
              { label: 'Fixture', value: selectedEvidence.fixtureVersion, mono: true },
              { label: 'Timestamp', value: new Date(selectedEvidence.timestamp).toISOString() },
            ].map(({ label, value, mono }) => (
              <div key={label}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{label}</div>
                <div style={{ fontSize: 13, color: mono === true ? 'var(--text-mono)' : 'var(--text-primary)', fontFamily: mono === true ? 'var(--font-mono)' : undefined, wordBreak: 'break-all' }}>
                  {value}
                </div>
              </div>
            ))}

            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Observed State</div>
              <pre style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-mono)', background: 'var(--bg-surface)', borderRadius: 8, padding: 12, margin: 0, overflow: 'auto' }}>
                {JSON.stringify(selectedEvidence.observedState, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
