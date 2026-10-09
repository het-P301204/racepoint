import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { CommandPalette } from './components/command/CommandPalette'
import { Suspense, lazy, Component, type ReactNode, type ErrorInfo } from 'react'

interface ErrorBoundaryState { hasError: boolean; message: string }
class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { hasError: false, message: '' }
  static getDerivedStateFromError(e: Error): ErrorBoundaryState {
    return { hasError: true, message: e.message }
  }
  override componentDidCatch(_e: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', info.componentStack)
  }
  override render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 12 }}>
          <div style={{ fontSize: 14, color: 'var(--color-coral)', fontWeight: 600 }}>Something went wrong</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{this.state.message}</div>
          <button
            onClick={() => { this.setState({ hasError: false, message: '' }) }}
            style={{ fontSize: 12, padding: '6px 14px', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 6, color: 'var(--text-primary)', cursor: 'pointer' }}
          >
            Retry
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

function NotFound() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 8 }}>
      <div style={{ fontSize: 48, fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-coral)' }}>404</div>
      <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>Page not found</div>
    </div>
  )
}

const Landing = lazy(() => import('./routes/Landing'))
const Overview = lazy(() => import('./routes/Overview'))
const Lab = lazy(() => import('./routes/Lab'))
const Scenarios = lazy(() => import('./routes/Scenarios'))
const ScenarioDetail = lazy(() => import('./routes/ScenarioDetail'))
const RaceTimeline = lazy(() => import('./routes/RaceTimeline'))
const StateInspector = lazy(() => import('./routes/StateInspector'))
const Database = lazy(() => import('./routes/Database'))
const Filesystem = lazy(() => import('./routes/Filesystem'))
const Distributed = lazy(() => import('./routes/Distributed'))
const Runs = lazy(() => import('./routes/Runs'))
const RunDetail = lazy(() => import('./routes/RunDetail'))
const Comparisons = lazy(() => import('./routes/Comparisons'))
const Evidence = lazy(() => import('./routes/Evidence'))
const History = lazy(() => import('./routes/History'))
const ResearchNotes = lazy(() => import('./routes/ResearchNotes'))
const Methodology = lazy(() => import('./routes/Methodology'))
const Documentation = lazy(() => import('./routes/Documentation'))
const Settings = lazy(() => import('./routes/Settings'))
const SystemStatus = lazy(() => import('./routes/SystemStatus'))
const Showcase = lazy(() => import('./routes/Showcase'))

function PageFallback() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{
        width: 32,
        height: 32,
        border: '2px solid var(--color-coral)',
        borderTopColor: 'transparent',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <CommandPalette />
      <Routes>
        <Route path="/" element={<ErrorBoundary><Suspense fallback={<PageFallback />}><Landing /></Suspense></ErrorBoundary>} />
        <Route element={<AppShell />}>
          <Route path="/overview" element={<ErrorBoundary><Suspense fallback={<PageFallback />}><Overview /></Suspense></ErrorBoundary>} />
          <Route path="/lab" element={<ErrorBoundary><Suspense fallback={<PageFallback />}><Lab /></Suspense></ErrorBoundary>} />
          <Route path="/scenarios" element={<ErrorBoundary><Suspense fallback={<PageFallback />}><Scenarios /></Suspense></ErrorBoundary>} />
          <Route path="/scenarios/:id" element={<ErrorBoundary><Suspense fallback={<PageFallback />}><ScenarioDetail /></Suspense></ErrorBoundary>} />
          <Route path="/race-timeline" element={<ErrorBoundary><Suspense fallback={<PageFallback />}><RaceTimeline /></Suspense></ErrorBoundary>} />
          <Route path="/state-inspector" element={<ErrorBoundary><Suspense fallback={<PageFallback />}><StateInspector /></Suspense></ErrorBoundary>} />
          <Route path="/database" element={<ErrorBoundary><Suspense fallback={<PageFallback />}><Database /></Suspense></ErrorBoundary>} />
          <Route path="/filesystem" element={<ErrorBoundary><Suspense fallback={<PageFallback />}><Filesystem /></Suspense></ErrorBoundary>} />
          <Route path="/distributed" element={<ErrorBoundary><Suspense fallback={<PageFallback />}><Distributed /></Suspense></ErrorBoundary>} />
          <Route path="/runs" element={<ErrorBoundary><Suspense fallback={<PageFallback />}><Runs /></Suspense></ErrorBoundary>} />
          <Route path="/runs/:id" element={<ErrorBoundary><Suspense fallback={<PageFallback />}><RunDetail /></Suspense></ErrorBoundary>} />
          <Route path="/comparisons" element={<ErrorBoundary><Suspense fallback={<PageFallback />}><Comparisons /></Suspense></ErrorBoundary>} />
          <Route path="/evidence" element={<ErrorBoundary><Suspense fallback={<PageFallback />}><Evidence /></Suspense></ErrorBoundary>} />
          <Route path="/history" element={<ErrorBoundary><Suspense fallback={<PageFallback />}><History /></Suspense></ErrorBoundary>} />
          <Route path="/research-notes" element={<ErrorBoundary><Suspense fallback={<PageFallback />}><ResearchNotes /></Suspense></ErrorBoundary>} />
          <Route path="/methodology" element={<ErrorBoundary><Suspense fallback={<PageFallback />}><Methodology /></Suspense></ErrorBoundary>} />
          <Route path="/documentation" element={<ErrorBoundary><Suspense fallback={<PageFallback />}><Documentation /></Suspense></ErrorBoundary>} />
          <Route path="/settings" element={<ErrorBoundary><Suspense fallback={<PageFallback />}><Settings /></Suspense></ErrorBoundary>} />
          <Route path="/system-status" element={<ErrorBoundary><Suspense fallback={<PageFallback />}><SystemStatus /></Suspense></ErrorBoundary>} />
          <Route path="/showcase" element={<ErrorBoundary><Suspense fallback={<PageFallback />}><Showcase /></Suspense></ErrorBoundary>} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
