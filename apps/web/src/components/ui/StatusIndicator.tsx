import type { CSSProperties } from 'react'

type StatusColor = 'coral' | 'marigold' | 'sage' | 'iris' | 'plum' | 'stone'

interface StatusIndicatorProps {
  status: StatusColor
  label?: string
  pulse?: boolean
  size?: number
  style?: CSSProperties
}

const STATUS_COLORS: Record<StatusColor, string> = {
  coral: 'var(--color-coral)',
  marigold: 'var(--color-marigold)',
  sage: 'var(--color-sage)',
  iris: 'var(--color-iris)',
  plum: '#c4a8be',
  stone: 'var(--color-stone)',
}

export function StatusIndicator({
  status,
  label,
  pulse = false,
  size = 8,
  style,
}: StatusIndicatorProps) {
  const color = STATUS_COLORS[status]
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        ...style,
      }}
    >
      <span
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: color,
          flexShrink: 0,
          animation: pulse ? 'pulse-coral 1.4s ease-in-out infinite' : undefined,
        }}
      />
      {label !== undefined && (
        <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
          {label}
        </span>
      )}
    </span>
  )
}
