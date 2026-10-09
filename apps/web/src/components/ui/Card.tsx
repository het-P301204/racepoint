import type { ReactNode, CSSProperties } from 'react'

interface CardProps {
  children: ReactNode
  style?: CSSProperties
  className?: string
  onClick?: () => void
  hover?: boolean
  padding?: string | number
}

export function Card({ children, style, onClick, hover = false, padding = '20px' }: CardProps) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding,
        transition: hover ? 'border-color var(--transition-fast), background var(--transition-fast)' : undefined,
        cursor: onClick !== undefined ? 'pointer' : undefined,
        ...style,
      }}
      onMouseEnter={
        hover
          ? (e) => {
              ;(e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-default)'
              ;(e.currentTarget as HTMLDivElement).style.background = 'var(--bg-surface)'
            }
          : undefined
      }
      onMouseLeave={
        hover
          ? (e) => {
              ;(e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-subtle)'
              ;(e.currentTarget as HTMLDivElement).style.background = 'var(--bg-secondary)'
            }
          : undefined
      }
    >
      {children}
    </div>
  )
}

interface CardHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
}

export function CardHeader({ title, subtitle, action }: CardHeaderProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
      <div>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{title}</div>
        {subtitle !== undefined && (
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{subtitle}</div>
        )}
      </div>
      {action !== undefined && action}
    </div>
  )
}
