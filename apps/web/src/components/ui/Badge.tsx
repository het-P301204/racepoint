import type { ReactNode, CSSProperties } from 'react'

type BadgeVariant = 'coral' | 'marigold' | 'sage' | 'iris' | 'plum' | 'stone'

interface BadgeProps {
  variant?: BadgeVariant
  children: ReactNode
  style?: CSSProperties
}

const COLOR_MAP: Record<BadgeVariant, { bg: string; color: string; border: string }> = {
  coral: { bg: 'var(--color-coral-dim)', color: 'var(--color-coral)', border: 'rgba(228,93,75,0.3)' },
  marigold: { bg: 'var(--color-marigold-dim)', color: 'var(--color-marigold)', border: 'rgba(213,166,66,0.3)' },
  sage: { bg: 'var(--color-sage-dim)', color: 'var(--color-sage)', border: 'rgba(129,151,124,0.3)' },
  iris: { bg: 'var(--color-iris-dim)', color: 'var(--color-iris)', border: 'rgba(146,130,173,0.3)' },
  plum: { bg: 'var(--color-plum-dim)', color: '#c4a8be', border: 'rgba(89,68,81,0.5)' },
  stone: { bg: 'rgba(227,218,206,0.08)', color: 'var(--color-stone)', border: 'rgba(227,218,206,0.2)' },
}

export function Badge({ variant = 'stone', children, style }: BadgeProps) {
  const c = COLOR_MAP[variant]
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 9px',
        borderRadius: 'var(--radius-pill)',
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.03em',
        textTransform: 'uppercase',
        background: c.bg,
        color: c.color,
        border: `1px solid ${c.border}`,
        ...style,
      }}
    >
      {children}
    </span>
  )
}
