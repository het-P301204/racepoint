import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  FlaskConical,
  BookOpen,
  Clock,
  Database,
  FolderOpen,
  Network,
  Activity,
  GitCompare,
  Shield,
  History,
  FileText,
  BookMarked,
  Wrench,
  MonitorCheck,
  Layers,
  ChevronDown,
  ChevronRight,
  Cpu,
} from 'lucide-react'
import { useState } from 'react'

interface NavItem {
  label: string
  path: string
  icon: React.ElementType
}

interface NavSection {
  title: string
  items: NavItem[]
  collapsible?: boolean
}

const NAV: NavSection[] = [
  {
    title: 'Research',
    items: [
      { label: 'Overview', path: '/overview', icon: LayoutDashboard },
      { label: 'Attack Lab', path: '/lab', icon: FlaskConical },
      { label: 'Showcase', path: '/showcase', icon: Cpu },
    ],
  },
  {
    title: 'Scenarios',
    items: [
      { label: 'Scenario Library', path: '/scenarios', icon: BookOpen },
      { label: 'Race Timeline', path: '/race-timeline', icon: Clock },
      { label: 'State Inspector', path: '/state-inspector', icon: Activity },
    ],
  },
  {
    title: 'Attack Surfaces',
    collapsible: true,
    items: [
      { label: 'Database TOCTOU', path: '/database', icon: Database },
      { label: 'Filesystem TOCTOU', path: '/filesystem', icon: FolderOpen },
      { label: 'Distributed State', path: '/distributed', icon: Network },
    ],
  },
  {
    title: 'Analysis',
    items: [
      { label: 'Runs', path: '/runs', icon: Layers },
      { label: 'Comparisons', path: '/comparisons', icon: GitCompare },
      { label: 'Evidence', path: '/evidence', icon: Shield },
      { label: 'History', path: '/history', icon: History },
    ],
  },
  {
    title: 'Knowledge',
    items: [
      { label: 'Research Notes', path: '/research-notes', icon: FileText },
      { label: 'Methodology', path: '/methodology', icon: BookMarked },
      { label: 'Documentation', path: '/documentation', icon: BookOpen },
    ],
  },
  {
    title: 'System',
    items: [
      { label: 'Settings', path: '/settings', icon: Wrench },
      { label: 'System Status', path: '/system-status', icon: MonitorCheck },
    ],
  },
]

interface SidebarProps {
  collapsed: boolean
}

export function Sidebar({ collapsed }: SidebarProps) {
  const location = useLocation()
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({})

  function toggleSection(title: string) {
    setCollapsedSections((prev) => ({ ...prev, [title]: !prev[title] }))
  }

  return (
    <aside
      style={{
        position: 'fixed',
        top: 'var(--header-height)',
        left: 0,
        bottom: 0,
        width: collapsed ? 64 : 'var(--sidebar-width)',
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-subtle)',
        overflowY: 'auto',
        overflowX: 'hidden',
        transition: 'width var(--transition-base)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        padding: '12px 0',
      }}
    >
      {NAV.map((section) => {
        const isCollapsed = section.collapsible === true && collapsedSections[section.title] === true
        return (
          <div key={section.title} style={{ marginBottom: 8 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: collapsed ? '6px 20px' : '6px 16px',
                cursor: section.collapsible === true ? 'pointer' : 'default',
              }}
              onClick={section.collapsible === true ? () => { toggleSection(section.title) } : undefined}
            >
              {!collapsed && (
                <>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: 'var(--text-muted)',
                    }}
                  >
                    {section.title}
                  </span>
                  {section.collapsible === true && (
                    isCollapsed
                      ? <ChevronRight size={12} style={{ color: 'var(--text-muted)' }} />
                      : <ChevronDown size={12} style={{ color: 'var(--text-muted)' }} />
                  )}
                </>
              )}
            </div>

            {!isCollapsed &&
              section.items.map((item) => {
                const active = location.pathname === item.path
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 9,
                      padding: collapsed ? '8px 0' : '8px 16px',
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      margin: '1px 6px',
                      borderRadius: 'var(--radius-sm)',
                      textDecoration: 'none',
                      background: active ? 'var(--color-coral-dim)' : 'transparent',
                      color: active ? 'var(--color-coral)' : 'var(--text-muted)',
                      fontWeight: active ? 600 : 500,
                      fontSize: 13,
                      transition: 'all var(--transition-fast)',
                      borderLeft: active && !collapsed ? '2px solid var(--color-coral)' : '2px solid transparent',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        ;(e.currentTarget as HTMLAnchorElement).style.background = 'var(--bg-surface)'
                        ;(e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-primary)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        ;(e.currentTarget as HTMLAnchorElement).style.background = 'transparent'
                        ;(e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-muted)'
                      }
                    }}
                  >
                    <Icon size={15} style={{ flexShrink: 0 }} />
                    {!collapsed && <span>{item.label}</span>}
                  </NavLink>
                )
              })}
          </div>
        )
      })}
    </aside>
  )
}
