import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  LayoutDashboard,
  FlaskConical,
  BookOpen,
  Clock,
  Activity,
  Database,
  FolderOpen,
  Network,
  Layers,
  GitCompare,
  Shield,
  History,
  FileText,
  BookMarked,
  Wrench,
  MonitorCheck,
  Cpu,
  Search,
} from 'lucide-react'
import { useAppStore } from '../../store/appStore'

interface CommandItem {
  id: string
  label: string
  description?: string
  path: string
  icon: React.ElementType
  group: string
}

const COMMANDS: CommandItem[] = [
  { id: 'overview', label: 'Overview', description: 'Research dashboard', path: '/overview', icon: LayoutDashboard, group: 'Navigation' },
  { id: 'lab', label: 'Attack Lab', description: 'Run exploits', path: '/lab', icon: FlaskConical, group: 'Navigation' },
  { id: 'showcase', label: 'Showcase', description: 'Guided demo', path: '/showcase', icon: Cpu, group: 'Navigation' },
  { id: 'scenarios', label: 'Scenario Library', description: 'Browse all scenarios', path: '/scenarios', icon: BookOpen, group: 'Research' },
  { id: 'race-timeline', label: 'Race Timeline', description: 'Visualize race windows', path: '/race-timeline', icon: Clock, group: 'Research' },
  { id: 'state-inspector', label: 'State Inspector', description: 'Inspect state transitions', path: '/state-inspector', icon: Activity, group: 'Research' },
  { id: 'database', label: 'Database TOCTOU', description: 'Database attack surface', path: '/database', icon: Database, group: 'Research' },
  { id: 'filesystem', label: 'Filesystem TOCTOU', description: 'Filesystem attack surface', path: '/filesystem', icon: FolderOpen, group: 'Research' },
  { id: 'distributed', label: 'Distributed State', description: 'Distributed attack surface', path: '/distributed', icon: Network, group: 'Research' },
  { id: 'runs', label: 'Runs', description: 'All research runs', path: '/runs', icon: Layers, group: 'Data' },
  { id: 'comparisons', label: 'Comparisons', description: 'Vulnerable vs hardened', path: '/comparisons', icon: GitCompare, group: 'Data' },
  { id: 'evidence', label: 'Evidence', description: 'Evidence vault', path: '/evidence', icon: Shield, group: 'Data' },
  { id: 'history', label: 'History', description: 'Historical charts', path: '/history', icon: History, group: 'Data' },
  { id: 'notes', label: 'Research Notes', description: 'Notes & annotations', path: '/research-notes', icon: FileText, group: 'Knowledge' },
  { id: 'methodology', label: 'Methodology', description: 'Research methodology', path: '/methodology', icon: BookMarked, group: 'Knowledge' },
  { id: 'documentation', label: 'Documentation', description: 'Technical docs', path: '/documentation', icon: BookOpen, group: 'Knowledge' },
  { id: 'settings', label: 'Settings', description: 'Application settings', path: '/settings', icon: Wrench, group: 'System' },
  { id: 'system-status', label: 'System Status', description: 'Health check', path: '/system-status', icon: MonitorCheck, group: 'System' },
]

export function CommandPalette() {
  const open = useAppStore((s) => s.commandPaletteOpen)
  const setOpen = useAppStore((s) => s.setCommandPaletteOpen)
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(true)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => { window.removeEventListener('keydown', onKey) }
  }, [setOpen])

  useEffect(() => {
    if (!open) return
    setQuery('')
    setActiveIndex(0)
    const tid = setTimeout(() => { inputRef.current?.focus() }, 50)
    return () => { clearTimeout(tid) }
  }, [open])

  const filtered = COMMANDS.filter(
    (c) =>
      query.trim() === '' ||
      c.label.toLowerCase().includes(query.toLowerCase()) ||
      (c.description ?? '').toLowerCase().includes(query.toLowerCase()) ||
      c.group.toLowerCase().includes(query.toLowerCase()),
  )

  const groups = [...new Set(filtered.map((c) => c.group))]

  function navigate_to(path: string) {
    navigate(path)
    setOpen(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const item = filtered[activeIndex]
      if (item !== undefined) navigate_to(item.path)
    }
  }

  let globalIndex = 0

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={() => { setOpen(false) }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'var(--bg-overlay)',
            zIndex: 9000,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingTop: '15vh',
          }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: -8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => { e.stopPropagation() }}
            style={{
              width: 600,
              maxWidth: 'calc(100vw - 40px)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-lg)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '14px 16px',
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              <Search size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setActiveIndex(0)
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search commands, pages, scenarios..."
                style={{
                  flex: 1,
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--text-primary)',
                  fontSize: 15,
                  fontFamily: 'var(--font-sans)',
                }}
              />
              <kbd
                style={{
                  fontSize: 11,
                  color: 'var(--text-muted)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 5,
                  padding: '2px 6px',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                ESC
              </kbd>
            </div>

            <div
              ref={listRef}
              style={{
                maxHeight: '55vh',
                overflowY: 'auto',
                padding: '8px 0',
              }}
            >
              {filtered.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                  No results for "{query}"
                </div>
              ) : (
                groups.map((group) => {
                  const groupItems = filtered.filter((c) => c.group === group)
                  return (
                    <div key={group}>
                      <div
                        style={{
                          padding: '8px 16px 4px',
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          color: 'var(--text-muted)',
                        }}
                      >
                        {group}
                      </div>
                      {groupItems.map((item) => {
                        const idx = globalIndex++
                        const isActive = idx === activeIndex
                        const Icon = item.icon
                        return (
                          <button
                            key={item.id}
                            onClick={() => { navigate_to(item.path) }}
                            onMouseEnter={() => { setActiveIndex(idx) }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 12,
                              width: '100%',
                              padding: '9px 16px',
                              background: isActive ? 'var(--color-coral-dim)' : 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              textAlign: 'left',
                              transition: 'background var(--transition-fast)',
                            }}
                          >
                            <div
                              style={{
                                width: 30,
                                height: 30,
                                borderRadius: 'var(--radius-xs)',
                                background: isActive ? 'rgba(228,93,75,0.2)' : 'var(--bg-surface)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                              }}
                            >
                              <Icon size={15} style={{ color: isActive ? 'var(--color-coral)' : 'var(--text-muted)' }} />
                            </div>
                            <div>
                              <div style={{ fontSize: 14, fontWeight: 600, color: isActive ? 'var(--color-coral)' : 'var(--text-primary)' }}>
                                {item.label}
                              </div>
                              {item.description !== undefined && (
                                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>
                                  {item.description}
                                </div>
                              )}
                            </div>
                            {isActive && (
                              <div style={{ marginLeft: 'auto' }}>
                                <kbd
                                  style={{
                                    fontSize: 10,
                                    color: 'var(--color-coral)',
                                    background: 'var(--color-coral-dim)',
                                    border: '1px solid rgba(228,93,75,0.3)',
                                    borderRadius: 4,
                                    padding: '2px 6px',
                                    fontFamily: 'var(--font-mono)',
                                  }}
                                >
                                  ↵
                                </kbd>
                              </div>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )
                })
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
