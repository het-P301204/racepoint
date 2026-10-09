import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react'
import { useAppStore } from '../../store/appStore'

const ICONS = {
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
  info: Info,
}

const COLORS = {
  success: 'var(--color-sage)',
  warning: 'var(--color-marigold)',
  error: 'var(--color-coral)',
  info: 'var(--color-iris)',
}

function Toast({
  id,
  type,
  message,
}: {
  id: string
  type: 'success' | 'warning' | 'error' | 'info'
  message: string
}) {
  const removeNotification = useAppStore((s) => s.removeNotification)
  const Icon = ICONS[type]
  const color = COLORS[type]

  useEffect(() => {
    const timer = setTimeout(() => {
      removeNotification(id)
    }, 4000)
    return () => { clearTimeout(timer) }
  }, [id, removeNotification])

  return (
    <motion.div
      initial={{ opacity: 0, x: 48, scale: 0.94 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 48, scale: 0.94 }}
      transition={{ duration: 0.22 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        background: 'var(--bg-elevated)',
        border: `1px solid ${color}40`,
        borderLeft: `3px solid ${color}`,
        borderRadius: 'var(--radius-sm)',
        padding: '12px 14px',
        minWidth: 280,
        maxWidth: 380,
        boxShadow: 'var(--shadow-lg)',
      }}
    >
      <Icon size={16} style={{ color, flexShrink: 0 }} />
      <span style={{ flex: 1, fontSize: 14, color: 'var(--text-primary)' }}>{message}</span>
      <button
        onClick={() => { removeNotification(id) }}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-muted)',
          padding: 2,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <X size={14} />
      </button>
    </motion.div>
  )
}

export function ToastContainer() {
  const notifications = useAppStore((s) => s.notifications)

  return (
    <div
      style={{
        position: 'fixed',
        top: 72,
        right: 20,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <AnimatePresence mode="sync">
        {notifications.map((n) => (
          <Toast key={n.id} id={n.id} type={n.type} message={n.message} />
        ))}
      </AnimatePresence>
    </div>
  )
}
