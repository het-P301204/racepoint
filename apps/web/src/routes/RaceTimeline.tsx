import { useEffect, useRef } from 'react'
import { Clock, Info, ChevronRight } from 'lucide-react'
import { Card, CardHeader } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { TimelineCanvas } from '../components/timeline/TimelineCanvas'
import { PlaybackControls } from '../components/timeline/PlaybackControls'
import { useTimelineStore } from '../store/timelineStore'
import { DEMO_RUNS } from '../data'
import type { ResearchRun, InvariantResult, RequestEvent } from '@racepoint/shared'

const INV_COLORS: Record<InvariantResult, 'coral' | 'sage' | 'marigold' | 'stone'> = {
  violated: 'coral',
  preserved: 'sage',
  inconclusive: 'marigold',
  'not-evaluated': 'stone',
}

function EventDetail({ eventId, run }: { eventId: string | null; run: ResearchRun | null }) {
  if (eventId === null || run === null) return null
  const event = run.events.find((e: RequestEvent) => e.id === eventId)
  if (event === undefined) return null

  return (
    <Card style={{ border: '1px solid var(--border-default)' }}>
      <CardHeader title="Event Detail" subtitle={event.type} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Row label="ID" value={event.id} mono />
        <Row label="Request" value={event.requestId} mono />
        <Row label="Monotonic" value={`${event.monotonicMs.toFixed(2)}ms`} mono />
        <Row label="Timestamp" value={new Date(event.timestamp).toLocaleTimeString()} />
        {event.observedValue !== undefined && (
          <Row label="Observed" value={JSON.stringify(event.observedValue)} mono />
        )}
        {event.committedValue !== undefined && (
          <Row label="Committed" value={JSON.stringify(event.committedValue)} mono />
        )}
        {event.workerId !== undefined && (
          <Row label="Worker" value={event.workerId} mono />
        )}
      </div>
    </Card>
  )
}

function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
      <span style={{ fontSize: 11, color: 'var(--text-muted)', minWidth: 80, flexShrink: 0, paddingTop: 1 }}>{label}</span>
      <span style={{ fontSize: 12, color: mono ? 'var(--text-mono)' : 'var(--text-primary)', fontFamily: mono ? 'var(--font-mono)' : undefined, wordBreak: 'break-all' }}>
        {value}
      </span>
    </div>
  )
}

function EventLog({ run, selectedEventId, onSelect }: { run: ResearchRun; selectedEventId: string | null; onSelect: (id: string) => void }) {
  const EVENT_TYPE_COLOR: Record<string, string> = {
    STATE_READ: 'var(--color-iris)',
    STATE_WRITE_ATTEMPTED: 'var(--color-coral)',
    STATE_WRITE_COMMITTED: 'var(--color-sage)',
    STATE_WRITE_REJECTED: 'var(--color-coral)',
    LOCK_REQUESTED: 'var(--color-marigold)',
    LOCK_ACQUIRED: 'var(--color-marigold)',
    LOCK_RELEASED: 'var(--color-sage)',
    INVARIANT_CHECKED: 'var(--color-iris)',
    RUN_COMPLETED: 'var(--color-sage)',
    RUN_FAILED: 'var(--color-coral)',
  }

  return (
    <div style={{ maxHeight: 280, overflowY: 'auto' }}>
      {run.events.map((ev: RequestEvent) => (
        <div
          key={ev.id}
          onClick={() => { onSelect(ev.id) }}
          style={{
            display: 'flex',
            gap: 10,
            padding: '7px 8px',
            borderRadius: 6,
            cursor: 'pointer',
            background: selectedEventId === ev.id ? 'var(--color-coral-dim)' : 'transparent',
            transition: 'background var(--transition-fast)',
          }}
          onMouseEnter={(e) => {
            if (selectedEventId !== ev.id) {
              (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-surface)'
            }
          }}
          onMouseLeave={(e) => {
            if (selectedEventId !== ev.id) {
              (e.currentTarget as HTMLDivElement).style.background = 'transparent'
            }
          }}
        >
          <span style={{
            fontSize: 10,
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)',
            minWidth: 52,
            paddingTop: 2,
          }}>
            {ev.monotonicMs.toFixed(1)}ms
          </span>
          <span style={{
            fontSize: 10,
            fontFamily: 'var(--font-mono)',
            color: EVENT_TYPE_COLOR[ev.type] ?? 'var(--text-muted)',
            minWidth: 160,
            paddingTop: 2,
          }}>
            {ev.type}
          </span>
          <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {ev.requestId.slice(0, 8)}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function RaceTimeline() {
  const {
    selectedRun,
    playbackState,
    currentTimeMs,
    playbackSpeed,
    selectedEventId,
    setSelectedRun,
    setPlaybackState,
    setCurrentTimeMs,
    setSelectedEventId,
  } = useTimelineStore()

  const rafRef = useRef<number | null>(null)
  const lastTsRef = useRef<number | null>(null)
  const currentTimeMsRef = useRef<number>(0)

  const runs = DEMO_RUNS

  // Playback loop
  useEffect(() => {
    if (playbackState !== 'playing' || selectedRun === null) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
      lastTsRef.current = null
      return
    }

    const maxTime = selectedRun.events.reduce((m, e: RequestEvent) => Math.max(m, e.monotonicMs), 100)
    // Snapshot current time from store (non-reactive) so seek-to-position works before the loop starts
    currentTimeMsRef.current = useTimelineStore.getState().currentTimeMs

    function frame(ts: number) {
      if (lastTsRef.current === null) {
        lastTsRef.current = ts
      }
      const dt = ts - lastTsRef.current
      lastTsRef.current = ts

      const next = currentTimeMsRef.current + dt * playbackSpeed
      if (next >= maxTime) {
        currentTimeMsRef.current = maxTime
        setCurrentTimeMs(maxTime)
        setPlaybackState('completed')
        return
      }
      currentTimeMsRef.current = next
      setCurrentTimeMs(next)
      rafRef.current = requestAnimationFrame(frame)
    }

    rafRef.current = requestAnimationFrame(frame)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [playbackState, selectedRun, playbackSpeed, setCurrentTimeMs, setPlaybackState])

  const maxTimeMs = selectedRun !== null
    ? selectedRun.events.reduce((m, e: RequestEvent) => Math.max(m, e.monotonicMs), 100)
    : 100

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
            Race Timeline
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
            Microsecond-resolution visualization of concurrent request events and race windows
          </p>
        </div>
      </div>

      {/* Run selector */}
      {runs.length > 0 ? (
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {runs.map((run: ResearchRun) => (
            <button
              key={run.id}
              onClick={() => { setSelectedRun(run) }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: '10px 14px',
                background: selectedRun?.id === run.id ? 'var(--color-coral-dim)' : 'var(--bg-secondary)',
                border: `1px solid ${selectedRun?.id === run.id ? 'rgba(228,93,75,0.3)' : 'var(--border-subtle)'}`,
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                minWidth: 160,
              }}
            >
              <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: selectedRun?.id === run.id ? 'var(--color-coral)' : 'var(--text-mono)' }}>
                {run.id}
              </span>
              <Badge variant={INV_COLORS[run.invariantResult]} style={{ marginTop: 4 }}>
                {run.invariantResult}
              </Badge>
            </button>
          ))}
        </div>
      ) : (
        <Card style={{ borderStyle: 'dashed' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0' }}>
            <Info size={16} style={{ color: 'var(--color-marigold)', flexShrink: 0 }} />
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              No runs loaded. Demo data will populate this view when the data agent completes.
              Navigate to the <strong style={{ color: 'var(--color-coral)' }}>Attack Lab</strong> to run a scenario.
            </p>
          </div>
        </Card>
      )}

      {/* Main canvas */}
      <Card padding={0} style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 16px 0' }}>
          {selectedRun !== null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-mono)' }}>
                {selectedRun.id}
              </span>
              <Badge variant={INV_COLORS[selectedRun.invariantResult]}>
                {selectedRun.invariantResult}
              </Badge>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {selectedRun.events.length} events · {selectedRun.raceWindows.length} race windows
              </span>
            </div>
          )}
        </div>
        <div style={{ padding: '0 16px' }}>
          <TimelineCanvas
            run={selectedRun}
            currentTimeMs={currentTimeMs}
            selectedEventId={selectedEventId}
            onEventClick={setSelectedEventId}
          />
        </div>
        <PlaybackControls maxTimeMs={maxTimeMs} />
      </Card>

      {selectedRun !== null && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Event log */}
          <Card>
            <CardHeader title="Event Log" subtitle={`${selectedRun.events.length} events`} />
            <EventLog
              run={selectedRun}
              selectedEventId={selectedEventId}
              onSelect={setSelectedEventId}
            />
          </Card>

          {/* Event detail + race windows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <EventDetail eventId={selectedEventId} run={selectedRun} />
            <Card>
              <CardHeader title="Race Windows" subtitle={`${selectedRun.raceWindows.length} detected`} />
              {selectedRun.raceWindows.length === 0 ? (
                <div style={{ fontSize: 13, color: 'var(--text-muted)', padding: '8px 0' }}>
                  No race windows detected in this run.
                </div>
              ) : (
                selectedRun.raceWindows.map((rw) => (
                  <div
                    key={rw.id}
                    style={{
                      padding: '10px 12px',
                      background: 'var(--bg-surface)',
                      borderRadius: 8,
                      marginBottom: 8,
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-mono)' }}>
                        {rw.id}
                      </span>
                      <Badge variant={rw.conclusion === 'confirmed' ? 'coral' : rw.conclusion === 'plausible' ? 'marigold' : 'stone'}>
                        {rw.conclusion}
                      </Badge>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {rw.startMonotonicMs.toFixed(1)}ms → {rw.endMonotonicMs.toFixed(1)}ms
                      &nbsp;({(rw.endMonotonicMs - rw.startMonotonicMs).toFixed(2)}ms window)
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                      Requests: {rw.participatingRequests.join(', ')}
                    </div>
                  </div>
                ))
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
