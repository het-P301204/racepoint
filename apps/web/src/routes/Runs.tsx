import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layers, ExternalLink, Download } from 'lucide-react'
import { DataTable } from '../components/ui/DataTable'
import { Badge } from '../components/ui/Badge'
import { EmptyState } from '../components/ui/EmptyState'
import { Button } from '../components/ui/Button'
import { DEMO_RUNS } from '../data'
import type { ResearchRun, InvariantResult, RunStatus } from '@racepoint/shared'
import type { Column } from '../components/ui/DataTable'

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

type RunRow = Record<string, unknown>
type ResultFilter = 'all' | 'violated' | 'preserved' | 'inconclusive' | 'failed'

const FILTER_OPTIONS: { label: string; value: ResultFilter; color: string }[] = [
  { label: 'All', value: 'all', color: 'var(--text-muted)' },
  { label: 'Violated', value: 'violated', color: 'var(--color-coral)' },
  { label: 'Preserved', value: 'preserved', color: 'var(--color-sage)' },
  { label: 'Inconclusive', value: 'inconclusive', color: 'var(--color-marigold)' },
  { label: 'Failed', value: 'failed', color: 'var(--color-iris)' },
]

function exportJSON(runs: ResearchRun[]) {
  const blob = new Blob([JSON.stringify(runs, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `racepoint-runs-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export default function Runs() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<ResultFilter>('all')

  const columns: Column<RunRow>[] = [
    {
      key: 'id',
      header: 'Run ID',
      sortable: true,
      render: (row) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-mono)' }}>
          {String(row['id'])}
        </span>
      ),
    },
    {
      key: 'scenarioId',
      header: 'Scenario',
      sortable: true,
      render: (row) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)' }}>
          {String(row['scenarioId'])}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (row) => {
        const s = String(row['status']) as RunStatus
        return <Badge variant={STATUS_COLORS[s] ?? 'stone'}>{s}</Badge>
      },
    },
    {
      key: 'invariantResult',
      header: 'Invariant',
      sortable: true,
      render: (row) => {
        const r = String(row['invariantResult']) as InvariantResult
        return <Badge variant={INV_COLORS[r] ?? 'stone'}>{r}</Badge>
      },
    },
    {
      key: 'executionMode',
      header: 'Mode',
      render: (row) => (
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{String(row['executionMode'])}</span>
      ),
    },
    {
      key: 'raceWindows',
      header: 'Race Windows',
      render: (row) => {
        const rw = row['raceWindows'] as unknown[]
        const count = Array.isArray(rw) ? rw.length : 0
        return (
          <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: count > 0 ? 'var(--color-coral)' : 'var(--text-muted)' }}>
            {count}
          </span>
        )
      },
    },
    {
      key: 'startedAt',
      header: 'Started',
      sortable: true,
      render: (row) => (
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {new Date(String(row['startedAt'])).toLocaleString()}
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
            navigate(`/runs/${String(row['id'])}`)
          }}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: 4,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <ExternalLink size={13} />
        </button>
      ),
    },
  ]

  const filteredRuns = DEMO_RUNS.filter((r) => {
    if (filter === 'all') return true
    if (filter === 'failed') return r.status === 'failed'
    return r.invariantResult === filter
  })

  const data = filteredRuns.map((r: ResearchRun): RunRow => ({
    id: r.id,
    scenarioId: r.scenarioId,
    status: r.status,
    invariantResult: r.invariantResult,
    executionMode: r.executionMode,
    raceWindows: r.raceWindows,
    startedAt: r.startedAt,
  }))

  const counts = {
    violated: DEMO_RUNS.filter(r => r.invariantResult === 'violated').length,
    preserved: DEMO_RUNS.filter(r => r.invariantResult === 'preserved').length,
    inconclusive: DEMO_RUNS.filter(r => r.invariantResult === 'inconclusive').length,
    failed: DEMO_RUNS.filter(r => r.status === 'failed').length,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
            Research Runs
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
            All recorded scenario executions and their results
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="ghost" size="sm" onClick={() => { exportJSON(filteredRuns) }}>
            <Download size={13} /> Export JSON
          </Button>
          <Button variant="secondary" size="sm" onClick={() => { navigate('/lab') }}>
            New Run
          </Button>
        </div>
      </div>

      {/* Filter chips */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {FILTER_OPTIONS.map((opt) => {
          const count = opt.value === 'all' ? DEMO_RUNS.length : (counts[opt.value as keyof typeof counts] ?? 0)
          const active = filter === opt.value
          return (
            <button
              key={opt.value}
              onClick={() => { setFilter(opt.value) }}
              style={{
                padding: '5px 12px',
                borderRadius: 'var(--radius-pill)',
                fontSize: 12,
                fontWeight: 600,
                border: `1px solid ${active ? opt.color : 'var(--border-default)'}`,
                background: active ? `${opt.color}18` : 'var(--bg-surface)',
                color: active ? opt.color : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              {opt.label} <span style={{ opacity: 0.7 }}>({count})</span>
            </button>
          )
        })}
      </div>

      {data.length === 0 ? (
        <EmptyState
          title="No runs yet"
          description="Execute a scenario in the Attack Lab to see runs here"
          icon={<Layers size={32} />}
          action={
            <Button variant="primary" onClick={() => { navigate('/lab') }}>
              Open Attack Lab
            </Button>
          }
        />
      ) : (
        <DataTable
          columns={columns}
          data={data}
          searchable
          searchKeys={['id', 'scenarioId', 'status', 'invariantResult']}
          rowKey={(row) => String(row['id'])}
          onRowClick={(row) => { navigate(`/runs/${String(row['id'])}`) }}
          emptyMessage="No runs match your search"
        />
      )}
    </div>
  )
}
