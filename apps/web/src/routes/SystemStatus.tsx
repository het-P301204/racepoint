import { useState, useEffect, useCallback } from 'react'
import { MonitorCheck, Wifi, WifiOff, Database, Activity, Clock } from 'lucide-react'
import { Card, CardHeader } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { StatusIndicator } from '../components/ui/StatusIndicator'
import { Button } from '../components/ui/Button'
import { useAppStore } from '../store/appStore'
import type { SystemStatus } from '@racepoint/shared'

export default function SystemStatus_() {
  const mode = useAppStore((s) => s.mode)
  const [status, setStatus] = useState<SystemStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)

  const checkStatus = useCallback(async (signal?: AbortSignal) => {
    if (mode === 'demo') {
      setStatus({ labReady: false, dbConnected: false, activeRuns: 0, lastChecked: new Date().toISOString() })
      setLastChecked(new Date())
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/status', signal !== undefined ? { signal } : undefined)
      if (!res.ok) throw new Error('unreachable')
      const data = await res.json() as SystemStatus
      setStatus(data)
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      setStatus({ labReady: false, dbConnected: false, activeRuns: 0, lastChecked: new Date().toISOString() })
    } finally {
      setLoading(false)
      setLastChecked(new Date())
    }
  }, [mode])

  useEffect(() => {
    const controller = new AbortController()
    void checkStatus(controller.signal)
    return () => { controller.abort() }
  }, [checkStatus])

  const items = [
    {
      label: 'Lab Server',
      ok: status?.labReady ?? false,
      icon: Activity,
      desc: mode === 'demo' ? 'Demo mode — no lab server required' : (status?.labReady ? 'Running on localhost:8000' : 'Not reachable'),
    },
    {
      label: 'Database',
      ok: status?.dbConnected ?? false,
      icon: Database,
      desc: status?.dbConnected ? 'Connected' : 'Not connected',
    },
    {
      label: 'Active Runs',
      ok: true,
      icon: Clock,
      desc: String(status?.activeRuns ?? 0),
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
            System Status
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
            Lab server and infrastructure health
          </p>
        </div>
        <Button variant="secondary" size="sm" loading={loading} onClick={() => { void checkStatus(undefined) }}>
          Refresh
        </Button>
      </div>

      {mode === 'demo' && (
        <div
          style={{
            padding: '12px 16px',
            background: 'var(--color-marigold-dim)',
            border: '1px solid rgba(213,166,66,0.25)',
            borderRadius: 'var(--radius-sm)',
            fontSize: 13,
            color: 'var(--color-marigold)',
          }}
        >
          Demo mode — switch to Local Lab to connect to a real lab server.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {items.map((item) => {
          const Icon = item.icon
          return (
            <Card key={item.label} style={{ borderLeft: `2px solid ${item.ok ? 'var(--color-sage)' : 'var(--color-coral)'}` }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 'var(--radius-sm)',
                    background: item.ok ? 'var(--color-sage-dim)' : 'var(--color-coral-dim)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={16} style={{ color: item.ok ? 'var(--color-sage)' : 'var(--color-coral)' }} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{item.label}</span>
                    <StatusIndicator status={item.ok ? 'sage' : 'coral'} pulse={item.ok} />
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.desc}</div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Overall health */}
      <Card>
        <CardHeader title="Overall Health" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: mode === 'demo' ? 'var(--color-marigold-dim)' : (status?.labReady ? 'var(--color-sage-dim)' : 'var(--color-coral-dim)'),
              border: `2px solid ${mode === 'demo' ? 'var(--color-marigold)' : (status?.labReady ? 'var(--color-sage)' : 'var(--color-coral)')}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {mode === 'demo' ? (
              <WifiOff size={24} style={{ color: 'var(--color-marigold)' }} />
            ) : (
              <Wifi size={24} style={{ color: status?.labReady ? 'var(--color-sage)' : 'var(--color-coral)' }} />
            )}
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
              {mode === 'demo' ? 'Demo Mode' : (status?.labReady ? 'All Systems Operational' : 'Lab Not Reachable')}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {lastChecked !== null
                ? `Last checked: ${lastChecked.toLocaleTimeString()}`
                : 'Not yet checked'}
            </div>
          </div>
        </div>
      </Card>

      {/* Version info */}
      <Card>
        <CardHeader title="Component Versions" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[
            { name: 'Frontend', version: '0.1.0', tech: 'React 18 + Vite' },
            { name: 'Backend', version: '0.1.0', tech: 'FastAPI' },
            { name: 'Shared Types', version: '0.1.0', tech: 'TypeScript' },
          ].map((v) => (
            <div key={v.name} style={{ padding: 12, background: 'var(--bg-surface)', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>{v.name}</div>
              <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-mono)', marginBottom: 3 }}>v{v.version}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{v.tech}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
