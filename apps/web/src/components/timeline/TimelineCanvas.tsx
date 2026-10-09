import { useRef, useEffect } from 'react'
import type { ResearchRun } from '@racepoint/shared'
import { RequestLane } from './RequestLane'
import { RaceWindowOverlay } from './RaceWindowOverlay'
import { EmptyState } from '../ui/EmptyState'
import { Clock } from 'lucide-react'

interface TimelineCanvasProps {
  run: ResearchRun | null
  currentTimeMs: number
  selectedEventId: string | null
  onEventClick: (eventId: string) => void
}

const LABEL_WIDTH = 72
const LANE_HEIGHT = 60
const HEADER_HEIGHT = 32

export function TimelineCanvas({
  run,
  currentTimeMs,
  selectedEventId,
  onEventClick,
}: TimelineCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  if (run === null) {
    return (
      <EmptyState
        title="No run selected"
        description="Select a research run to view its timeline"
        icon={<Clock size={32} />}
      />
    )
  }

  const events = run.events
  if (events.length === 0) {
    return (
      <EmptyState
        title="No events in this run"
        description="Run has no recorded events"
        icon={<Clock size={32} />}
      />
    )
  }

  const maxTimeMs = events.reduce((m, e) => Math.max(m, e.monotonicMs), 100)
  const allRequestIds = [...new Set(events.map((e) => e.requestId))]
  const requestIds = allRequestIds.filter((id) => id !== 'system')
  const hasSystem = allRequestIds.includes('system')
  const lanes = [...requestIds, ...(hasSystem ? ['system'] : [])]

  const totalHeight = lanes.length * LANE_HEIGHT + HEADER_HEIGHT + 24

  function msToX(ms: number, width: number): number {
    const trackWidth = width - LABEL_WIDTH - 24
    return LABEL_WIDTH + 12 + (ms / maxTimeMs) * trackWidth
  }

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        overflowX: 'auto',
        background: 'var(--bg-surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      <svg
        width="100%"
        height={totalHeight}
        style={{ display: 'block', minWidth: 640 }}
        viewBox={`0 0 1000 ${totalHeight}`}
        preserveAspectRatio="none"
      >
        {/* Header ticks */}
        <rect x={0} y={0} width={1000} height={HEADER_HEIGHT} fill="rgba(25,25,24,0.6)" />
        {Array.from({ length: 11 }, (_, i) => {
          const x = LABEL_WIDTH + 12 + (i / 10) * (1000 - LABEL_WIDTH - 24)
          const ms = (i / 10) * maxTimeMs
          return (
            <g key={i}>
              <line x1={x} y1={HEADER_HEIGHT - 6} x2={x} y2={totalHeight} stroke="rgba(227,218,206,0.06)" strokeWidth={1} />
              <text
                x={x}
                y={14}
                textAnchor="middle"
                fill="#a09a8e"
                fontSize={9}
                fontFamily="var(--font-mono)"
              >
                {ms.toFixed(0)}
              </text>
            </g>
          )
        })}

        {/* Lanes */}
        {lanes.map((reqId, i) => {
          const laneEvents = events.filter((e) => e.requestId === reqId)
          return (
            <RequestLane
              key={reqId}
              requestId={reqId}
              laneIndex={i}
              events={laneEvents}
              laneHeight={LANE_HEIGHT}
              headerHeight={HEADER_HEIGHT}
              laneWidth={1000}
              maxTimeMs={maxTimeMs}
              selectedEventId={selectedEventId}
              onEventClick={onEventClick}
              labelWidth={LABEL_WIDTH}
            />
          )
        })}

        {/* Race windows */}
        {run.raceWindows.map((rw) => {
          const x = msToX(rw.startMonotonicMs, 1000)
          const endX = msToX(rw.endMonotonicMs, 1000)
          return (
            <RaceWindowOverlay
              key={rw.id}
              raceWindow={rw}
              x={x}
              width={endX - x}
              totalHeight={totalHeight}
              headerHeight={HEADER_HEIGHT}
            />
          )
        })}

        {/* Playback cursor */}
        {maxTimeMs > 0 && (
          <line
            x1={msToX(currentTimeMs, 1000)}
            y1={HEADER_HEIGHT}
            x2={msToX(currentTimeMs, 1000)}
            y2={totalHeight}
            stroke="#E45D4B"
            strokeWidth={1.5}
            strokeDasharray="3 2"
            opacity={0.9}
          />
        )}
      </svg>
    </div>
  )
}
