import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  description?: string
  action?: ReactNode
  icon?: ReactNode
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 24px',
        gap: 12,
        textAlign: 'center',
      }}
    >
      {icon !== undefined && (
        <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{icon}</div>
      )}
      <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{title}</div>
      {description !== undefined && (
        <div style={{ fontSize: 14, color: 'var(--text-muted)', maxWidth: 360 }}>{description}</div>
      )}
      {action !== undefined && <div style={{ marginTop: 8 }}>{action}</div>}
    </div>
  )
}
