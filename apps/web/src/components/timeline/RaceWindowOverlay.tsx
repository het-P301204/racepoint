import type { RaceWindow } from '@racepoint/shared'

interface RaceWindowOverlayProps {
  raceWindow: RaceWindow
  x: number
  width: number
  totalHeight: number
  headerHeight: number
}

export function RaceWindowOverlay({
  raceWindow,
  x,
  width,
  totalHeight,
  headerHeight,
}: RaceWindowOverlayProps) {
  const color = raceWindow.conclusion === 'confirmed'
    ? '#E45D4B'
    : raceWindow.conclusion === 'plausible'
    ? '#D5A642'
    : '#9282AD'

  const opacity = raceWindow.conclusion === 'confirmed' ? 0.18 : 0.1

  return (
    <g>
      <rect
        x={x}
        y={headerHeight}
        width={Math.max(width, 2)}
        height={totalHeight - headerHeight}
        fill={color}
        fillOpacity={opacity}
        rx={4}
      />
      <rect
        x={x}
        y={headerHeight}
        width={2}
        height={totalHeight - headerHeight}
        fill={color}
        fillOpacity={0.8}
      />
      <rect
        x={x + Math.max(width, 2) - 2}
        y={headerHeight}
        width={2}
        height={totalHeight - headerHeight}
        fill={color}
        fillOpacity={0.8}
      />
      <text
        x={x + Math.max(width, 2) / 2}
        y={headerHeight + 12}
        textAnchor="middle"
        fill={color}
        fontSize={9}
        fontFamily="var(--font-mono)"
        fontWeight={600}
        opacity={0.9}
      >
        RACE WINDOW
      </text>
    </g>
  )
}
