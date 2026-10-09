import { useState } from 'react'
import { Search, RefreshCw, Bell, Menu } from 'lucide-react'
import { ModeToggle } from './ModeToggle'
import { useAppStore } from '../../store/appStore'
import { StatusIndicator } from '../ui/StatusIndicator'

interface HeaderProps {
  onMenuClick: () => void
}

function RacepointLogo() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 6 L11 2 L19 6 L19 11" stroke="#E45D4B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 11 L11 15 L19 11" stroke="#E45D4B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
      <path d="M3 16 L11 20 L19 16" stroke="#E45D4B" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.3"/>
      <circle cx="11" cy="9" r="2.5" fill="#E45D4B"/>
    </svg>
  )
}

export function Header({ onMenuClick }: HeaderProps) {
  const [rotating, setRotating] = useState(false)
  const { setCommandPaletteOpen, isRefreshing, setIsRefreshing, setLastRefreshed } = useAppStore()
  const notifications = useAppStore((s) => s.notifications)

  function handleRefresh() {
    if (rotating || isRefreshing) return
    setRotating(true)
    setIsRefreshing(true)
    setTimeout(() => {
      setRotating(false)
      setIsRefreshing(false)
      setLastRefreshed(new Date())
    }, 1200)
  }

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 'var(--header-height)',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: 12,
        zIndex: 100,
      }}
    >
      <button
        onClick={onMenuClick}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          padding: 6,
          borderRadius: 'var(--radius-xs)',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Menu size={18} />
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: '0 0 auto' }}>
        <RacepointLogo />
        <span
          style={{
            fontSize: 15,
            fontWeight: 800,
            color: 'var(--color-ivory)',
            letterSpacing: '0.08em',
            fontFamily: 'var(--font-sans)',
          }}
        >
          RACEPOINT
        </span>
      </div>

      <div style={{ flex: 1 }} />

      <ModeToggle />

      <StatusIndicator status="sage" pulse label="LIVE" style={{ marginLeft: 4 }} />

      <button
        onClick={() => { setCommandPaletteOpen(true) }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-sm)',
          padding: '6px 10px',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          fontSize: 12,
          fontFamily: 'var(--font-sans)',
        }}
      >
        <Search size={13} />
        <span>Search</span>
        <kbd
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: 4,
            padding: '1px 5px',
            fontSize: 10,
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          ⌃K
        </kbd>
      </button>

      <button
        onClick={handleRefresh}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          padding: 6,
          borderRadius: 'var(--radius-xs)',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <RefreshCw
          size={16}
          style={{
            transition: 'transform var(--transition-slow)',
            transform: rotating ? 'rotate(360deg)' : 'rotate(0deg)',
            animation: rotating ? 'spin 0.8s linear' : undefined,
          }}
        />
      </button>

      <button
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          padding: 6,
          borderRadius: 'var(--radius-xs)',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        <Bell size={16} />
        {notifications.length > 0 && (
          <span
            style={{
              position: 'absolute',
              top: 4,
              right: 4,
              width: 7,
              height: 7,
              background: 'var(--color-coral)',
              borderRadius: '50%',
            }}
          />
        )}
      </button>
    </header>
  )
}
