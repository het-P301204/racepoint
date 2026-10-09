import { useAppStore } from '../../store/appStore'

export function ModeToggle() {
  const mode = useAppStore((s) => s.mode)
  const setMode = useAppStore((s) => s.setMode)

  return (
    <div
      style={{
        display: 'flex',
        background: 'var(--bg-primary)',
        borderRadius: 'var(--radius-pill)',
        padding: 3,
        border: '1px solid var(--border-subtle)',
        gap: 2,
      }}
    >
      {(['demo', 'local-lab'] as const).map((m) => (
        <button
          key={m}
          onClick={() => { setMode(m) }}
          style={{
            padding: '4px 12px',
            borderRadius: 'var(--radius-pill)',
            fontSize: 12,
            fontWeight: 600,
            fontFamily: 'var(--font-sans)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            border: 'none',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
            background: mode === m ? 'var(--color-coral)' : 'transparent',
            color: mode === m ? 'var(--color-ivory)' : 'var(--text-muted)',
          }}
        >
          {m === 'demo' ? 'Demo' : 'Local Lab'}
        </button>
      ))}
    </div>
  )
}
