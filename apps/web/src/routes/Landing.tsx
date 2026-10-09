import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Zap, Shield, GitCompare, Activity } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'

function RaceViz({ mode }: { mode: 'vulnerable' | 'hardened' }) {
  const [tick, setTick] = useState(0)
  const rafRef = useRef<number | null>(null)
  const startRef = useRef<number | null>(null)

  useEffect(() => {
    function frame(ts: number) {
      if (startRef.current === null) startRef.current = ts
      const elapsed = (ts - startRef.current) % 3000
      setTick(elapsed / 3000)
      rafRef.current = requestAnimationFrame(frame)
    }
    rafRef.current = requestAnimationFrame(frame)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const req1X = Math.min(tick * 1.2, 1)
  const req2X = Math.min(Math.max((tick - 0.05) * 1.2, 0), 1)
  const sharedX = 0.62

  const overlap = req1X >= sharedX - 0.03 && req2X <= sharedX + 0.1
  const conflictColor = mode === 'vulnerable' ? '#E45D4B' : '#81977C'

  return (
    <svg viewBox="0 0 500 180" style={{ width: '100%', maxWidth: 520 }}>
      {/* Background */}
      <rect width={500} height={180} rx={16} fill="rgba(36,35,33,0.95)" />
      <rect x={1} y={1} width={498} height={178} rx={15} fill="none" stroke="rgba(227,218,206,0.1)" />

      {/* Track 1 label */}
      <text x={20} y={55} fill="#9282AD" fontSize={10} fontFamily="var(--font-mono)" fontWeight={600}>REQ-A</text>
      <line x1={70} y1={50} x2={450} y2={50} stroke="rgba(146,130,173,0.2)" strokeWidth={1} strokeDasharray="4 3" />

      {/* Track 2 label */}
      <text x={20} y={105} fill="#D5A642" fontSize={10} fontFamily="var(--font-mono)" fontWeight={600}>REQ-B</text>
      <line x1={70} y1={100} x2={450} y2={100} stroke="rgba(213,166,66,0.2)" strokeWidth={1} strokeDasharray="4 3" />

      {/* Shared state box */}
      <rect
        x={sharedX * 380 + 70 - 22}
        y={28}
        width={44}
        height={90}
        rx={6}
        fill={overlap ? `${conflictColor}22` : 'rgba(89,68,81,0.25)'}
        stroke={overlap ? conflictColor : '#594451'}
        strokeWidth={1.5}
      />
      <text
        x={sharedX * 380 + 70}
        y={78}
        textAnchor="middle"
        fill={overlap ? conflictColor : '#a09a8e'}
        fontSize={8}
        fontFamily="var(--font-mono)"
        fontWeight={700}
      >
        SHARED
      </text>
      <text
        x={sharedX * 380 + 70}
        y={88}
        textAnchor="middle"
        fill={overlap ? conflictColor : '#a09a8e'}
        fontSize={8}
        fontFamily="var(--font-mono)"
        fontWeight={700}
      >
        STATE
      </text>

      {/* Request 1 arrow */}
      <g transform={`translate(${70 + req1X * 300}, 50)`}>
        <circle r={8} fill="#9282AD" />
        <polygon points="5,-4 13,0 5,4" fill="#9282AD" transform="translate(4,0)" />
      </g>

      {/* Request 2 arrow */}
      <g transform={`translate(${70 + req2X * 300}, 100)`}>
        <circle r={8} fill="#D5A642" />
        <polygon points="5,-4 13,0 5,4" fill="#D5A642" transform="translate(4,0)" />
      </g>

      {/* Conflict / lock indicator */}
      {overlap && (
        <text
          x={sharedX * 380 + 70}
          y={138}
          textAnchor="middle"
          fill={conflictColor}
          fontSize={9}
          fontFamily="var(--font-mono)"
          fontWeight={700}
        >
          {mode === 'vulnerable' ? '⚡ RACE!' : '🔒 LOCKED'}
        </text>
      )}

      {/* Mode label */}
      <rect x={12} y={155} width={mode === 'vulnerable' ? 78 : 70} height={16} rx={4}
        fill={mode === 'vulnerable' ? 'rgba(228,93,75,0.15)' : 'rgba(129,151,124,0.15)'}
      />
      <text x={16} y={166} fill={mode === 'vulnerable' ? '#E45D4B' : '#81977C'}
        fontSize={9} fontFamily="var(--font-mono)" fontWeight={700}
      >
        {mode === 'vulnerable' ? 'VULNERABLE' : 'HARDENED'}
      </text>
    </svg>
  )
}

export default function Landing() {
  const navigate = useNavigate()
  const [vizMode, setVizMode] = useState<'vulnerable' | 'hardened'>('vulnerable')

  const features = [
    {
      icon: Zap,
      color: 'var(--color-coral)',
      title: 'Race Condition Simulation',
      desc: 'Precisely orchestrated concurrent requests expose time-of-check-time-of-use gaps.',
    },
    {
      icon: Shield,
      color: 'var(--color-sage)',
      title: 'Hardened Mitigations',
      desc: 'Side-by-side comparison of vulnerable and hardened fixtures with invariant verification.',
    },
    {
      icon: GitCompare,
      color: 'var(--color-iris)',
      title: 'Evidence-Grade Output',
      desc: 'Every race window is tagged with reproducibility hashes and captured evidence.',
    },
    {
      icon: Activity,
      color: 'var(--color-marigold)',
      title: 'Temporal Analysis',
      desc: 'Microsecond-resolution timeline viewer with playback, event markers, and state diffs.',
    },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Nav bar */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          height: 60,
          background: 'rgba(36,35,33,0.9)',
          borderBottom: '1px solid var(--border-subtle)',
          backdropFilter: 'blur(8px)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
            <path d="M3 6 L11 2 L19 6 L19 11" stroke="#E45D4B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="11" cy="9" r="2.5" fill="#E45D4B"/>
          </svg>
          <span style={{ fontSize: 14, fontWeight: 800, letterSpacing: '0.08em', color: 'var(--color-ivory)' }}>
            RACEPOINT
          </span>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Badge variant="coral">Research Platform</Badge>
          <Button variant="primary" size="sm" onClick={() => { navigate('/overview') }}>
            Launch App <ArrowRight size={14} />
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: '80px 32px 60px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 64,
          alignItems: 'center',
        }}
      >
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Badge variant="marigold" style={{ marginBottom: 20 }}>v0.1.0 — Research Preview</Badge>
          <h1
            style={{
              fontSize: 52,
              fontWeight: 800,
              lineHeight: 1.08,
              color: 'var(--color-ivory)',
              marginBottom: 20,
              letterSpacing: '-0.02em',
            }}
          >
            Find the Gap.<br />
            <span style={{ color: 'var(--color-coral)' }}>Expose the Race.</span>
          </h1>
          <p
            style={{
              fontSize: 17,
              lineHeight: 1.7,
              color: 'var(--text-secondary)',
              marginBottom: 36,
              maxWidth: 460,
            }}
          >
            RACEPOINT is a security research platform for race conditions and TOCTOU vulnerabilities.
            Reproduce attacks, verify mitigations, and capture evidence — all in one place.
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <Button variant="primary" size="lg" onClick={() => { navigate('/overview') }}>
              Open Research Dashboard <ArrowRight size={16} />
            </Button>
            <Button variant="outline" size="lg" onClick={() => { navigate('/methodology') }}>
              Methodology
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
        >
          <RaceViz mode={vizMode} />
          <div
            style={{
              display: 'flex',
              gap: 8,
              justifyContent: 'center',
            }}
          >
            {(['vulnerable', 'hardened'] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setVizMode(m) }}
                style={{
                  padding: '6px 16px',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  border: 'none',
                  cursor: 'pointer',
                  background: vizMode === m
                    ? m === 'vulnerable' ? 'var(--color-coral)' : 'var(--color-sage)'
                    : 'var(--bg-elevated)',
                  color: vizMode === m ? 'var(--color-ivory)' : 'var(--text-muted)',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {m}
              </button>
            ))}
          </div>
          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
            Live simulation — two concurrent requests racing for shared state
          </p>
        </motion.div>
      </section>

      {/* Feature grid */}
      <section
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: '0 32px 80px',
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 20,
        }}
      >
        {features.map((f, i) => {
          const Icon = f.icon
          return (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 + i * 0.08 }}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '24px 24px',
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 'var(--radius-sm)',
                  background: `${f.color}18`,
                  border: `1px solid ${f.color}30`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 14,
                }}
              >
                <Icon size={18} style={{ color: f.color }} />
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                {f.title}
              </div>
              <div style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>{f.desc}</div>
            </motion.div>
          )
        })}
      </section>

      {/* Footer CTA */}
      <section
        style={{
          background: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border-subtle)',
          padding: '48px 32px',
          textAlign: 'center',
        }}
      >
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>
          Security research platform — for educational and authorized testing purposes only
        </p>
        <p style={{ fontSize: 12, color: 'var(--color-plum)', fontFamily: 'var(--font-mono)' }}>
          RACEPOINT v0.1.0 — Race Condition &amp; TOCTOU Research Platform
        </p>
      </section>
    </div>
  )
}
