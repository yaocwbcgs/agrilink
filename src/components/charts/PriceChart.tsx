import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { SeriesPoint } from '../../data/commodities'
import { fmtNumber } from '../../lib/utils'

interface TooltipItem {
  value: number
  payload: SeriesPoint & { label: string }
}

function ChartTooltip({
  active,
  payload,
  unit,
}: {
  active?: boolean
  payload?: TooltipItem[]
  unit: string
}) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  return (
    <div className="rounded-xl border border-line bg-white px-3.5 py-2.5 shadow-lift">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">{point.label}</p>
      <p className="num mt-1 text-[16px] font-semibold text-forest">
        {fmtNumber(payload[0].value, 0)}
        <span className="ml-1 text-[11px] font-normal text-muted">{unit}</span>
      </p>
      {typeof point.volume === 'number' && (
        <p className="num mt-0.5 text-[11px] text-muted">成交量 {fmtNumber(point.volume)} 吨</p>
      )}
    </div>
  )
}

export function PriceChart({
  data,
  unit,
  tone,
  height = 320,
  showVolume = true,
  fill = false,
}: {
  data: SeriesPoint[]
  unit: string
  tone: number
  height?: number
  showVolume?: boolean
  /** 自适应父容器高度 */
  fill?: boolean
}) {
  const color = tone >= 0 ? '#B4452F' : '#2C7A5B'
  const values = data.map((d) => d.price)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const pad = (max - min) * 0.18 || max * 0.02
  const chartHeight = height

  return (
    <div style={fill ? undefined : { height: chartHeight }} className={fill ? 'h-full w-full' : 'w-full'}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="priceArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.18} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#E4E1D5" strokeDasharray="3 5" vertical={false} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: '#7A857D' }}
            minTickGap={28}
            dy={6}
          />
          <YAxis
            yAxisId="price"
            domain={[Math.floor(min - pad), Math.ceil(max + pad)]}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: '#7A857D' }}
            width={52}
            tickFormatter={(v: number) => fmtNumber(v)}
          />
          {showVolume && <YAxis yAxisId="vol" orientation="right" hide domain={[0, 'dataMax * 4']} />}
          <Tooltip
            content={<ChartTooltip unit={unit} />}
            cursor={{ stroke: '#83A88B', strokeWidth: 1, strokeDasharray: '4 4' }}
          />
          {showVolume && (
            <Bar yAxisId="vol" dataKey="volume" fill="#E8EADF" barSize={2.5} radius={[1, 1, 0, 0]} />
          )}
          <Area
            yAxisId="price"
            type="monotone"
            dataKey="price"
            stroke="none"
            fill="url(#priceArea)"
            isAnimationActive
            animationDuration={700}
          />
          <Line
            yAxisId="price"
            type="monotone"
            dataKey="price"
            stroke={color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: color, stroke: '#fff', strokeWidth: 2 }}
            animationDuration={800}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
