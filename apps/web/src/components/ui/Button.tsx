import { forwardRef, type ButtonHTMLAttributes, type CSSProperties } from 'react'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'secondary', size = 'md', loading, children, disabled, style, ...props }, ref) => {
    const base: CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      fontFamily: 'var(--font-sans)',
      fontWeight: 600,
      cursor: disabled ?? loading ? 'not-allowed' : 'pointer',
      opacity: disabled ?? loading ? 0.5 : 1,
      border: 'none',
      transition: 'all var(--transition-fast)',
      borderRadius: 'var(--radius-sm)',
      whiteSpace: 'nowrap',
      outline: 'none',
    }

    const sizes: Record<string, CSSProperties> = {
      sm: { padding: '6px 12px', fontSize: 13 },
      md: { padding: '9px 16px', fontSize: 14 },
      lg: { padding: '12px 22px', fontSize: 15 },
    }

    const variants: Record<string, CSSProperties> = {
      primary: { background: 'var(--color-coral)', color: 'var(--color-ivory)' },
      secondary: {
        background: 'var(--bg-elevated)',
        color: 'var(--text-primary)',
        border: '1px solid var(--border-default)',
      },
      ghost: { background: 'transparent', color: 'var(--text-secondary)' },
      danger: {
        background: 'rgba(228,93,75,0.15)',
        color: 'var(--color-coral)',
        border: '1px solid rgba(228,93,75,0.3)',
      },
      outline: {
        background: 'transparent',
        color: 'var(--text-primary)',
        border: '1px solid var(--border-strong)',
      },
    }

    return (
      <button
        ref={ref}
        disabled={disabled ?? loading}
        style={{ ...base, ...sizes[size], ...variants[variant], ...style }}
        {...props}
      >
        {loading === true && (
          <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} />
        )}
        {children}
      </button>
    )
  },
)
Button.displayName = 'Button'
