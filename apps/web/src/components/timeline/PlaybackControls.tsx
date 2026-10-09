import { Play, Pause, SkipBack, SkipForward, Rewind, FastForward } from 'lucide-react'
import { useTimelineStore } from '../../store/timelineStore'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'

export function PlaybackControls({ maxTimeMs }: { maxTimeMs: number }) {
  const {
    playbackState,
    currentTimeMs,
    playbackSpeed,
    viewMode,
    setPlaybackState,
    setCurrentTimeMs,
    setPlaybackSpeed,
    setViewMode,
  } = useTimelineStore()

  const isPlaying = playbackState === 'playing'

  function togglePlay() {
    if (isPlaying) {
      setPlaybackState('paused')
    } else {
      if (currentTimeMs >= maxTimeMs) {
        setCurrentTimeMs(0)
      }
      setPlaybackState('playing')
    }
  }

  function handleSkipBack() {
    setCurrentTimeMs(0)
    setPlaybackState('idle')
  }

  function handleSkipForward() {
    setCurrentTimeMs(maxTimeMs)
    setPlaybackState('completed')
  }

  function handleStepBack() {
    setCurrentTimeMs(Math.max(0, currentTimeMs - maxTimeMs * 0.05))
  }

  function handleStepForward() {
    setCurrentTimeMs(Math.min(maxTimeMs, currentTimeMs + maxTimeMs * 0.05))
  }

  const speeds: Array<0.5 | 1 | 2 | 4> = [0.5, 1, 2, 4]

  const pct = maxTimeMs > 0 ? (currentTimeMs / maxTimeMs) * 100 : 0

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        padding: '14px 16px',
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-subtle)',
        borderRadius: '0 0 var(--radius-md) var(--radius-md)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', minWidth: 48 }}>
          {currentTimeMs.toFixed(0)}ms
        </span>
        <div
          style={{
            flex: 1,
            height: 6,
            background: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-pill)',
            cursor: 'pointer',
            position: 'relative',
          }}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            if (rect.width === 0) return
            const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
            setCurrentTimeMs(ratio * maxTimeMs)
          }}
        >
          <div
            style={{
              width: `${pct}%`,
              height: '100%',
              background: 'var(--color-coral)',
              borderRadius: 'var(--radius-pill)',
              transition: 'width 0.05s linear',
            }}
          />
        </div>
        <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', minWidth: 48, textAlign: 'right' }}>
          {maxTimeMs.toFixed(0)}ms
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={handleSkipBack} style={iconBtnStyle}>
          <SkipBack size={14} />
        </button>
        <button onClick={handleStepBack} style={iconBtnStyle}>
          <Rewind size={14} />
        </button>
        <button
          onClick={togglePlay}
          style={{
            ...iconBtnStyle,
            background: 'var(--color-coral)',
            color: 'var(--color-ivory)',
            width: 36,
            height: 36,
            borderRadius: '50%',
          }}
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} />}
        </button>
        <button onClick={handleStepForward} style={iconBtnStyle}>
          <FastForward size={14} />
        </button>
        <button onClick={handleSkipForward} style={iconBtnStyle}>
          <SkipForward size={14} />
        </button>

        <div style={{ flex: 1 }} />

        <div style={{ display: 'flex', gap: 4 }}>
          {speeds.map((s) => (
            <button
              key={s}
              onClick={() => { setPlaybackSpeed(s) }}
              style={{
                background: playbackSpeed === s ? 'var(--color-marigold-dim)' : 'var(--bg-elevated)',
                border: `1px solid ${playbackSpeed === s ? 'rgba(213,166,66,0.3)' : 'var(--border-default)'}`,
                color: playbackSpeed === s ? 'var(--color-marigold)' : 'var(--text-muted)',
                borderRadius: 6,
                padding: '3px 8px',
                fontSize: 11,
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {s}x
            </button>
          ))}
        </div>

        <div
          style={{
            display: 'flex',
            background: 'var(--bg-primary)',
            borderRadius: 'var(--radius-pill)',
            padding: 2,
            border: '1px solid var(--border-subtle)',
            gap: 2,
          }}
        >
          {(['vulnerable', 'hardened'] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setViewMode(m) }}
              style={{
                padding: '3px 10px',
                borderRadius: 'var(--radius-pill)',
                fontSize: 11,
                fontWeight: 600,
                fontFamily: 'var(--font-sans)',
                letterSpacing: '0.02em',
                border: 'none',
                cursor: 'pointer',
                background: viewMode === m
                  ? m === 'vulnerable' ? 'var(--color-coral)' : 'var(--color-sage)'
                  : 'transparent',
                color: viewMode === m ? 'var(--color-ivory)' : 'var(--text-muted)',
                transition: 'all var(--transition-fast)',
              }}
            >
              {m === 'vulnerable' ? 'Vulnerable' : 'Hardened'}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

const iconBtnStyle: React.CSSProperties = {
  width: 30,
  height: 30,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border-default)',
  borderRadius: 8,
  color: 'var(--text-muted)',
  cursor: 'pointer',
}
