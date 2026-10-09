import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, RotateCcw, ChevronRight } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { useNavigate } from 'react-router-dom'

interface ShowcasePhase {
  id: string
  title: string
  description: string
  duration: number  // seconds
  content: React.ReactNode
}

function RaceSim({
  running,
  mode,
  progress,
}: {
  running: boolean
  mode: 'vulnerable' | 'hardened'
  progress: number  // 0-1
}) {
  const req1X = Math.min(progress * 1.3, 1)
  const req2X = Math.min(Math.max((progress - 0.04) * 1.3, 0), 1)
  const sharedX = 0.62
  const overlap = req1X >= sharedX - 0.04 && req2X <= sharedX + 0.12 && progress > 0.3
  const conflictColor = mode === 'vulnerable' ? '#E45D4B' : '#81977C'

  return (
    <svg viewBox="0 0 500 200" style={{ width: '100%', maxWidth: 480 }}>
      <rect width={500} height={200} rx={16} fill="rgba(36,35,33,0.95)" />
      <rect x={1} y={1} width={498} height={198} rx={15} fill="none" stroke="rgba(227,218,206,0.1)" />

      <text x={20} y={60} fill="#9282AD" fontSize={11} fontFamily="var(--font-mono)" fontWeight={600}>REQ-A</text>
      <line x1={80} y1={55} x2={450} y2={55} stroke="rgba(146,130,173,0.2)" strokeWidth={1} strokeDasharray="4 3" />

      <text x={20} y={110} fill="#D5A642" fontSize={11} fontFamily="var(--font-mono)" fontWeight={600}>REQ-B</text>
      <line x1={80} y1={105} x2={450} y2={105} stroke="rgba(213,166,66,0.2)" strokeWidth={1} strokeDasharray="4 3" />

      {/* Shared state box */}
      <rect
        x={sharedX * 370 + 80 - 24}
        y={30}
        width={48}
        height={95}
        rx={6}
        fill={overlap ? `${conflictColor}22` : 'rgba(89,68,81,0.25)'}
        stroke={overlap ? conflictColor : '#594451'}
        strokeWidth={1.5}
      />
      <text x={sharedX * 370 + 80} y={75} textAnchor="middle" fill={overlap ? conflictColor : '#a09a8e'} fontSize={9} fontFamily="var(--font-mono)" fontWeight={700}>
        SHARED
      </text>
      <text x={sharedX * 370 + 80} y={87} textAnchor="middle" fill={overlap ? conflictColor : '#a09a8e'} fontSize={9} fontFamily="var(--font-mono)" fontWeight={700}>
        STATE
      </text>

      {/* Req A */}
      <g transform={`translate(${80 + req1X * 310}, 55)`}>
        <circle r={9} fill="#9282AD" />
        <polygon points="6,-4 14,0 6,4" fill="#9282AD" transform="translate(5,0)" />
      </g>

      {/* Req B */}
      {progress > 0.03 && (
        <g transform={`translate(${80 + req2X * 310}, 105)`}>
          <circle r={9} fill="#D5A642" />
          <polygon points="6,-4 14,0 6,4" fill="#D5A642" transform="translate(5,0)" />
        </g>
      )}

      {/* Lock indicator for hardened */}
      {mode === 'hardened' && overlap && (
        <text x={sharedX * 370 + 80} y={148} textAnchor="middle" fill="#81977C" fontSize={11} fontFamily="var(--font-mono)" fontWeight={700}>
          🔒 LOCKED
        </text>
      )}
      {mode === 'vulnerable' && overlap && (
        <text x={sharedX * 370 + 80} y={148} textAnchor="middle" fill="#E45D4B" fontSize={11} fontFamily="var(--font-mono)" fontWeight={700}>
          ⚡ RACE!
        </text>
      )}

      {/* Mode badge */}
      <rect x={12} y={170} width={mode === 'vulnerable' ? 82 : 74} height={18} rx={4}
        fill={mode === 'vulnerable' ? 'rgba(228,93,75,0.15)' : 'rgba(129,151,124,0.15)'}
      />
      <text x={16} y={183} fill={mode === 'vulnerable' ? '#E45D4B' : '#81977C'}
        fontSize={10} fontFamily="var(--font-mono)" fontWeight={700}
      >
        {mode === 'vulnerable' ? 'VULNERABLE' : 'HARDENED'}
      </text>

      {/* SYNTHETIC SHOWCASE watermark */}
      <text x={490} y={195} textAnchor="end" fill="rgba(160,154,142,0.3)" fontSize={8} fontFamily="var(--font-mono)">
        SYNTHETIC SHOWCASE
      </text>
    </svg>
  )
}

export default function Showcase() {
  const navigate = useNavigate()
  const [playing, setPlaying] = useState(false)
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [phaseProgress, setPhaseProgress] = useState(0)  // 0-1 within phase
  const [completed, setCompleted] = useState(false)
  const rafRef = useRef<number | null>(null)
  const lastRef = useRef<number | null>(null)

  const phases: ShowcasePhase[] = [
    {
      id: 'intro',
      title: 'The Race Condition Problem',
      description: 'Two concurrent requests read the same shared state and both believe they can proceed — but only one should.',
      duration: 12,
      content: (
        <RaceSim running={playing} mode="vulnerable" progress={phaseProgress} />
      ),
    },
    {
      id: 'timeline',
      title: 'Race Window Detection',
      description: 'RACEPOINT identifies the exact interval where both requests access shared state simultaneously — the race window.',
      duration: 10,
      content: (
        <svg viewBox="0 0 500 160" style={{ width: '100%', maxWidth: 480 }}>
          <rect width={500} height={160} rx={12} fill="rgba(36,35,33,0.95)" />
          {/* Timeline header */}
          <rect x={0} y={0} width={500} height={28} rx={12} fill="rgba(25,25,24,0.8)" />
          {Array.from({ length: 6 }, (_, i) => (
            <g key={i}>
              <line x1={60 + i * 72} y1={20} x2={60 + i * 72} y2={150} stroke="rgba(227,218,206,0.07)" strokeWidth={1} />
              <text x={60 + i * 72} y={16} textAnchor="middle" fill="#a09a8e" fontSize={9} fontFamily="var(--font-mono)">
                {i * 20}ms
              </text>
            </g>
          ))}
          {/* Lane A */}
          <text x={8} y={65} fill="#9282AD" fontSize={10} fontFamily="var(--font-mono)" fontWeight={600}>REQ-A</text>
          <line x1={55} y1={60} x2={450} y2={60} stroke="rgba(146,130,173,0.25)" strokeWidth={1} strokeDasharray="3 3" />
          {/* Lane B */}
          <text x={8} y={105} fill="#D5A642" fontSize={10} fontFamily="var(--font-mono)" fontWeight={600}>REQ-B</text>
          <line x1={55} y1={100} x2={450} y2={100} stroke="rgba(213,166,66,0.25)" strokeWidth={1} strokeDasharray="3 3" />
          {/* Race window */}
          <rect x={155} y={28} width={120} height={122} rx={4} fill="rgba(228,93,75,0.14)" stroke="#E45D4B" strokeWidth={1.5} strokeDasharray="5 3" />
          <text x={215} y={42} textAnchor="middle" fill="#E45D4B" fontSize={8} fontFamily="var(--font-mono)" fontWeight={700}>RACE WINDOW</text>
          {/* Event markers */}
          {[[65, 60, '#9282AD'], [110, 60, '#9282AD'], [165, 60, '#E45D4B'], [245, 60, '#E45D4B'], [290, 60, '#81977C']].map(([x, y, c], i) => (
            <circle key={i} cx={x as number} cy={y as number} r={6} fill={c as string} opacity={phaseProgress > (i * 0.15) ? 1 : 0.15} />
          ))}
          {[[85, 100, '#D5A642'], [150, 100, '#D5A642'], [175, 100, '#E45D4B'], [260, 100, '#E45D4B'], [310, 100, '#81977C']].map(([x, y, c], i) => (
            <circle key={i} cx={x as number} cy={y as number} r={6} fill={c as string} opacity={phaseProgress > (i * 0.15 + 0.05) ? 1 : 0.15} />
          ))}
          {/* Cursor */}
          <line x1={60 + phaseProgress * 390} y1={28} x2={60 + phaseProgress * 390} y2={150} stroke="#E45D4B" strokeWidth={1.5} strokeDasharray="3 2" />
          <text x={490} y={155} textAnchor="end" fill="rgba(160,154,142,0.3)" fontSize={8} fontFamily="var(--font-mono)">SYNTHETIC SHOWCASE</text>
        </svg>
      ),
    },
    {
      id: 'hardened',
      title: 'Applying the Mitigation',
      description: 'With an atomic update + locking constraint, the race window is closed. The invariant is preserved.',
      duration: 10,
      content: (
        <RaceSim running={playing} mode="hardened" progress={phaseProgress} />
      ),
    },
    {
      id: 'evidence',
      title: 'Evidence & Reproducibility',
      description: 'Every finding is captured as evidence with a reproducibility hash, state diff, and race window record.',
      duration: 8,
      content: (
        <div style={{ background: 'rgba(36,35,33,0.95)', borderRadius: 12, padding: '16px 20px', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-mono)', maxWidth: 480, width: '100%' }}>
          <div style={{ color: '#a09a8e', marginBottom: 8, fontSize: 10 }}>// EVIDENCE RECORD</div>
          {[
            { k: 'id', v: '"EV-00821"' },
            { k: 'runId', v: '"RUN-2026-0041"' },
            { k: 'actualResult', v: '"violated"', color: '#E45D4B' },
            { k: 'raceWindowId', v: '"RW-0001"' },
            { k: 'reproHash', v: '"a3f2...c91e"' },
          ].map(({ k, v, color }, i) => (
            <motion.div
              key={k}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: phaseProgress > i * 0.15 ? 1 : 0, x: phaseProgress > i * 0.15 ? 0 : -8 }}
              style={{ padding: '3px 0', borderBottom: '1px solid rgba(227,218,206,0.05)' }}
            >
              <span style={{ color: '#9282AD' }}>{k}</span>
              <span style={{ color: '#a09a8e' }}>: </span>
              <span style={{ color: color ?? '#D5A642' }}>{v}</span>
            </motion.div>
          ))}
          <div style={{ marginTop: 8, color: 'rgba(160,154,142,0.3)', fontSize: 8 }}>SYNTHETIC SHOWCASE</div>
        </div>
      ),
    },
  ]

  useEffect(() => {
    if (!playing) {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      lastRef.current = null
      return
    }

    const phase = phases[phaseIndex]
    if (phase === undefined) return

    function frame(ts: number) {
      if (lastRef.current === null) lastRef.current = ts
      const dt = (ts - lastRef.current) / 1000
      lastRef.current = ts

      setPhaseProgress((prev) => {
        const next = prev + dt / (phase?.duration ?? 10)
        if (next >= 1) {
          // Move to next phase
          if (phaseIndex < phases.length - 1) {
            setPhaseIndex((i) => i + 1)
            return 0
          } else {
            setPlaying(false)
            setCompleted(true)
            return 1
          }
        }
        return next
      })

      rafRef.current = requestAnimationFrame(frame)
    }

    rafRef.current = requestAnimationFrame(frame)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, phaseIndex])

  function reset() {
    setPlaying(false)
    setPhaseIndex(0)
    setPhaseProgress(0)
    setCompleted(false)
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
  }

  const currentPhase = phases[phaseIndex]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <Badge variant="marigold">SYNTHETIC SHOWCASE</Badge>
            <Badge variant="stone">60s guided demo</Badge>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
            Showcase
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
            Automated guided demonstration of race condition detection and mitigation
          </p>
        </div>
      </div>

      {/* Phase progress */}
      <div style={{ display: 'flex', gap: 8 }}>
        {phases.map((p, i) => (
          <button
            key={p.id}
            onClick={() => { setPhaseIndex(i); setPhaseProgress(0) }}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              background: i === phaseIndex ? 'var(--color-coral-dim)' : i < phaseIndex ? 'var(--color-sage-dim)' : 'var(--bg-secondary)',
              border: `1px solid ${i === phaseIndex ? 'rgba(228,93,75,0.3)' : i < phaseIndex ? 'rgba(129,151,124,0.2)' : 'var(--border-subtle)'}`,
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <div style={{ fontSize: 10, fontWeight: 700, color: i === phaseIndex ? 'var(--color-coral)' : i < phaseIndex ? 'var(--color-sage)' : 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: 3 }}>
              {String(i + 1).padStart(2, '0')}
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: i === phaseIndex ? 'var(--text-primary)' : 'var(--text-muted)' }}>
              {p.title}
            </div>
          </button>
        ))}
      </div>

      {/* Main stage */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <Card style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <AnimatePresence mode="wait">
            {currentPhase !== undefined && (
              <motion.div
                key={currentPhase.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
              >
                <Badge variant="iris">Phase {phaseIndex + 1} of {phases.length}</Badge>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>
                  {currentPhase.title}
                </h2>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7 }}>
                  {currentPhase.description}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Progress bar */}
          <div style={{ height: 4, background: 'var(--bg-surface)', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${((phaseIndex + phaseProgress) / phases.length) * 100}%`,
                background: 'var(--color-coral)',
                borderRadius: 'var(--radius-pill)',
                transition: 'width 0.1s linear',
              }}
            />
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', gap: 8 }}>
            <Button
              variant={playing ? 'secondary' : 'primary'}
              onClick={() => { setPlaying((p) => !p) }}
              style={{ flex: 1, justifyContent: 'center' }}
            >
              {playing ? <><Pause size={14} /> Pause</> : <><Play size={14} /> {completed ? 'Replay' : 'Play'}</>}
            </Button>
            <Button variant="ghost" onClick={reset}>
              <RotateCcw size={14} />
            </Button>
          </div>

          {completed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
            >
              <p style={{ fontSize: 13, color: 'var(--color-sage)', fontWeight: 600 }}>
                Showcase complete! Explore the platform:
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <Button variant="secondary" size="sm" onClick={() => { navigate('/race-timeline') }}>
                  Race Timeline <ChevronRight size={12} />
                </Button>
                <Button variant="secondary" size="sm" onClick={() => { navigate('/lab') }}>
                  Attack Lab <ChevronRight size={12} />
                </Button>
              </div>
            </motion.div>
          )}
        </Card>

        {/* Visualization */}
        <Card style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPhase?.id ?? 'empty'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ width: '100%' }}
            >
              {currentPhase?.content}
            </motion.div>
          </AnimatePresence>
        </Card>
      </div>

      {/* Phase list */}
      <Card padding="16px">
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
          All Phases
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
          {phases.map((p, i) => (
            <div
              key={p.id}
              style={{
                display: 'flex',
                gap: 10,
                padding: '10px 12px',
                background: i === phaseIndex ? 'var(--color-coral-dim)' : 'var(--bg-surface)',
                borderRadius: 8,
                border: `1px solid ${i === phaseIndex ? 'rgba(228,93,75,0.2)' : 'var(--border-subtle)'}`,
              }}
            >
              <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-mono)', minWidth: 20 }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: i === phaseIndex ? 'var(--color-coral)' : 'var(--text-primary)', marginBottom: 2 }}>
                  {p.title}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.duration}s</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
