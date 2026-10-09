import { useState } from 'react'
import { Save, RotateCcw } from 'lucide-react'
import { Card, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { useAppStore } from '../store/appStore'
import { useToast } from '../hooks/useToast'

export default function Settings() {
  const mode = useAppStore((s) => s.mode)
  const setMode = useAppStore((s) => s.setMode)
  const toast = useToast()

  const [apiEndpoint, setApiEndpoint] = useState('http://localhost:8000')
  const [saved, setSaved] = useState(false)

  function handleSave() {
    setSaved(true)
    toast.success('Settings saved')
    setTimeout(() => { setSaved(false) }, 2000)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
          Settings
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
          Application configuration and preferences
        </p>
      </div>

      {/* Mode */}
      <Card>
        <CardHeader title="Execution Mode" subtitle="Controls how scenario data is loaded" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {(['demo', 'local-lab'] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m) }}
              style={{
                padding: '16px',
                borderRadius: 'var(--radius-sm)',
                border: `2px solid ${mode === m ? 'var(--color-coral)' : 'var(--border-subtle)'}`,
                background: mode === m ? 'var(--color-coral-dim)' : 'var(--bg-surface)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all var(--transition-fast)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: mode === m ? 'var(--color-coral)' : 'var(--text-primary)' }}>
                  {m === 'demo' ? 'Demo Mode' : 'Local Lab'}
                </span>
                {mode === m && <Badge variant="coral">Active</Badge>}
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                {m === 'demo'
                  ? 'Uses pre-recorded demo data. No lab server required.'
                  : 'Connects to local lab server. Run real scenarios.'}
              </p>
            </button>
          ))}
        </div>
      </Card>

      {/* API endpoint */}
      {mode === 'local-lab' && (
        <Card>
          <CardHeader title="Lab API Endpoint" subtitle="URL of the running lab server" />
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              value={apiEndpoint}
              onChange={(e) => { setApiEndpoint(e.target.value) }}
              style={{
                flex: 1,
                padding: '9px 13px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                fontSize: 13,
                fontFamily: 'var(--font-mono)',
                outline: 'none',
              }}
            />
            <Button variant="secondary" size="md" onClick={() => { setApiEndpoint('http://localhost:8000') }}>
              <RotateCcw size={13} /> Reset
            </Button>
          </div>
        </Card>
      )}

      {/* Display preferences */}
      <Card>
        <CardHeader title="Display" subtitle="Visual preferences" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { label: 'Color scheme', value: 'Dark (Graphite)', fixed: true },
            { label: 'Timeline default speed', value: '1x', fixed: false },
            { label: 'Animation', value: 'Enabled', fixed: false },
          ].map((p) => (
            <div key={p.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{p.label}</div>
                {p.fixed && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Cannot be changed</div>}
              </div>
              <span style={{ fontSize: 13, color: p.fixed ? 'var(--text-muted)' : 'var(--text-secondary)', fontFamily: p.fixed ? 'var(--font-mono)' : undefined }}>
                {p.value}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* About */}
      <Card>
        <CardHeader title="About" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { label: 'Application', value: 'RACEPOINT' },
            { label: 'Version', value: '0.1.0' },
            { label: 'Build', value: '2026-10-09' },
            { label: 'License', value: 'Research Only' },
          ].map((p) => (
            <div key={p.label} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{p.label}</span>
              <span style={{ fontSize: 13, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{p.value}</span>
            </div>
          ))}
        </div>
      </Card>

      <div style={{ display: 'flex', gap: 10 }}>
        <Button variant="primary" onClick={handleSave} loading={false}>
          <Save size={14} /> Save Settings
        </Button>
      </div>
    </div>
  )
}
