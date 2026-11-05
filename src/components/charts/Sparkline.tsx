import { useId } from 'react'
import { cn } from '../../lib/utils'

export function Sparkline({
  data,
  className,
  width = 120,
  height = 34,
  color = '#34745B',
  fill = true,
  strokeWidth = 1.4,
}: {
  data: number[]
  className?: string
  width?: number
  height?: number
  color?: string
  fill?: boolean
  strokeWidth?: number
}) {
  const id = useId().replace(/:/g, '')
  if (data.length < 2) return <div className={cn('h-8 w-24', className)} />

  const min = Math.min(...data)
  const max = Math.max(...data)
  const span = max - min || 1
  const stepX = width / (data.length - 1)
  const points = data.map((v, i) => {
    const x = i * stepX
    const y = height - 3 - ((v - min) / span) * (height - 8)
    return [x, y] as const
  })
  const path = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`).join(' ')
  const area = `${path} L${width},${height} L0,${height} Z`

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={cn('overflow-visible', className)} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`sp-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && <path d={area} fill={`url(#sp-${id})`} />}
      <path d={path} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={points[points.length - 1][0]} cy={points[points.length - 1][1]} r="2" fill={color} />
    </svg>
  )
}
