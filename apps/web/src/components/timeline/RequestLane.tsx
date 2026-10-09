import type { RequestEvent } from '@racepoint/shared'
import { EventMarker } from './EventMarker'

interface RequestLaneProps {
  requestId: string
  laneIndex: number
  events: RequestEvent[]
  laneHeight: number
  headerHeight: number
  laneWidth: number
  maxTimeMs: number
  selectedEventId: string | null
  onEventClick: (eventId: string) => void
  labelWidth: number
}

const LANE_COLORS = [
  '#E45D4B',
  '#9282AD',
  '#D5A642',
  '#81977C',
  '#594451',
]

export function RequestLane({
  requestId,
  laneIndex,
  events,
  laneHeight,
  headerHeight,
  laneWidth,
  maxTimeMs,
  selectedEventId,
  onEventClick,
  labelWidth,
}: RequestLaneProps) {
  const y = headerHeight + laneIndex * laneHeight
  const midY = y + laneHeight / 2
  const trackWidth = laneWidth - labelWidth - 24
  const isSystem = requestId === 'system'
  const laneColor = isSystem ? '#594451' : (LANE_COLORS[laneIndex % LANE_COLORS.length] ?? '#a09a8e')

  function msToX(ms: number): number {
    return labelWidth + 12 + (ms / maxTimeMs) * trackWidth
  }

  return (
    <g>
      <rect
        x={0}
        y={y}
        width={laneWidth}
        height={laneHeight}
        fill={laneIndex % 2 === 0 ? 'rgba(42,40,38,0.5)' : 'rgba(36,35,33,0.3)'}
      />
      <line
        x1={labelWidth}
        y1={y + laneHeight - 1}
        x2={laneWidth}
        y2={y + laneHeight - 1}
        stroke="rgba(227,218,206,0.05)"
        strokeWidth={1}
      />

      <text
        x={8}
        y={midY + 1}
        fill={laneColor}
        fontSize={10}
        fontFamily="var(--font-mono)"
        fontWeight={600}
        dominantBaseline="middle"
      >
        {isSystem ? 'SYS' : requestId.slice(0, 8)}
      </text>

      <line
        x1={labelWidth + 4}
        y1={midY}
        x2={laneWidth - 8}
        y2={midY}
        stroke={laneColor}
        strokeWidth={1}
        strokeOpacity={0.25}
        strokeDasharray="4 4"
      />

      {events.map((ev) => (
        <EventMarker
          key={ev.id}
          type={ev.type}
          x={msToX(ev.monotonicMs)}
          y={midY}
          selected={selectedEventId === ev.id}
          onClick={() => { onEventClick(ev.id) }}
        />
      ))}
    </g>
  )
}
