import type { EventType } from '@racepoint/shared'

interface EventMarkerProps {
  type: EventType
  x: number
  y: number
  selected: boolean
  onClick: () => void
}

const EVENT_COLORS: Record<EventType, string> = {
  RUN_STARTED: '#81977C',
  REQUEST_DISPATCHED: '#D5A642',
  REQUEST_RECEIVED: '#D5A642',
  STATE_READ: '#9282AD',
  CHECK_COMPLETED: '#9282AD',
  LOCK_REQUESTED: '#E45D4B',
  LOCK_ACQUIRED: '#E45D4B',
  LOCK_RELEASED: '#81977C',
  TRANSACTION_STARTED: '#D5A642',
  TRANSACTION_COMMITTED: '#81977C',
  TRANSACTION_ROLLED_BACK: '#E45D4B',
  STATE_WRITE_ATTEMPTED: '#E45D4B',
  STATE_WRITE_COMMITTED: '#81977C',
  STATE_WRITE_REJECTED: '#E45D4B',
  RESPONSE_SENT: '#D5A642',
  INVARIANT_CHECKED: '#9282AD',
  RUN_COMPLETED: '#81977C',
  RUN_FAILED: '#E45D4B',
}

const EVENT_SHAPES: Partial<Record<EventType, 'circle' | 'diamond' | 'rect'>> = {
  STATE_READ: 'diamond',
  STATE_WRITE_ATTEMPTED: 'diamond',
  STATE_WRITE_COMMITTED: 'diamond',
  STATE_WRITE_REJECTED: 'diamond',
  LOCK_REQUESTED: 'rect',
  LOCK_ACQUIRED: 'rect',
  LOCK_RELEASED: 'rect',
}

export function EventMarker({ type, x, y, selected, onClick }: EventMarkerProps) {
  const color = EVENT_COLORS[type] ?? '#a09a8e'
  const shape = EVENT_SHAPES[type] ?? 'circle'
  const size = selected ? 8 : 6

  return (
    <g
      onClick={(e) => { e.stopPropagation(); onClick() }}
      style={{ cursor: 'pointer' }}
    >
      {selected && (
        <circle cx={x} cy={y} r={size + 4} fill={color} opacity={0.2} />
      )}
      {shape === 'circle' && (
        <circle
          cx={x}
          cy={y}
          r={size}
          fill={color}
          stroke={selected ? '#F5F0E7' : 'rgba(25,25,24,0.6)'}
          strokeWidth={selected ? 1.5 : 1}
        />
      )}
      {shape === 'diamond' && (
        <polygon
          points={`${x},${y - size} ${x + size},${y} ${x},${y + size} ${x - size},${y}`}
          fill={color}
          stroke={selected ? '#F5F0E7' : 'rgba(25,25,24,0.6)'}
          strokeWidth={selected ? 1.5 : 1}
        />
      )}
      {shape === 'rect' && (
        <rect
          x={x - size * 0.8}
          y={y - size * 0.8}
          width={size * 1.6}
          height={size * 1.6}
          fill={color}
          stroke={selected ? '#F5F0E7' : 'rgba(25,25,24,0.6)'}
          strokeWidth={selected ? 1.5 : 1}
        />
      )}
    </g>
  )
}
