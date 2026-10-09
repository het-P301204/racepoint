import { useState, type ReactNode } from 'react'

interface TooltipProps {
  content: string
  children: ReactNode
  placement?: 'top' | 'bottom' | 'left' | 'right'
}

export function Tooltip({ content, children, placement = 'top' }: TooltipProps) {
  const [visible, setVisible] = useState(false)

  const placementStyles = {
    top: { bottom: '110%', left: '50%', transform: 'translateX(-50%)' },
    bottom: { top: '110%', left: '50%', transform: 'translateX(-50%)' },
    left: { right: '110%', top: '50%', transform: 'translateY(-50%)' },
    right: { left: '110%', top: '50%', transform: 'translateY(-50%)' },
  }

  return (
    <span
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => { setVisible(true) }}
      onMouseLeave={() => { setVisible(false) }}
    >
      {children}
      {visible && (
        <span
          style={{
            position: 'absolute',
            ...placementStyles[placement],
            background: 'var(--bg-elevated)',
            color: 'var(--text-primary)',
            padding: '5px 9px',
            borderRadius: 'var(--radius-xs)',
            fontSize: 12,
            fontWeight: 500,
            whiteSpace: 'nowrap',
            border: '1px solid var(--border-default)',
            boxShadow: 'var(--shadow-md)',
            zIndex: 1000,
            pointerEvents: 'none',
            animation: 'fade-in 0.12s ease',
          }}
        >
          {content}
        </span>
      )}
    </span>
  )
}
