import { Outlet, useLocation } from 'react-router-dom'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ToastContainer } from '../ui/Toast'

export function AppShell() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const location = useLocation()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header onMenuClick={() => { setSidebarCollapsed((c) => !c) }} />
      <div style={{ display: 'flex', flex: 1, marginTop: 'var(--header-height)' }}>
        <Sidebar collapsed={sidebarCollapsed} />
        <main
          style={{
            flex: 1,
            marginLeft: sidebarCollapsed ? 76 : 'var(--sidebar-width)',
            transition: 'margin-left var(--transition-base)',
            padding: '28px 32px',
            minHeight: 'calc(100vh - var(--header-height))',
            maxWidth: 'calc(100% - (sidebarCollapsed ? 76px : var(--sidebar-width)))',
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <ToastContainer />
    </div>
  )
}
