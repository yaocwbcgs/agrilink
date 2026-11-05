import { Star } from 'lucide-react'
import { cn, pct as fmtPct, priceTone, signed } from '../../lib/utils'
import { RISK_CHIP, RISK_LABEL } from '../../lib/constants'
import type { RiskLevel } from '../../types'
import { Badge } from './Badge'

export function Rating({
  value,
  count,
  size = 13,
  showValue = true,
  className,
}: {
  value: number
  count?: number
  size?: number
  showValue?: boolean
  className?: string
}) {
  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      <span className="flex items-center gap-[1.5px]">
        {[0, 1, 2, 3, 4].map((i) => {
          const fill = Math.max(0, Math.min(1, value - i))
          return (
            <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
              <Star size={size} className="absolute inset-0 text-line" strokeWidth={1.4} />
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <Star size={size} className="text-clay" fill="currentColor" strokeWidth={0} />
              </span>
            </span>
          )
        })}
      </span>
      {showValue && <span className="num text-[12px] font-medium text-ink/80">{value.toFixed(1)}</span>}
      {typeof count === 'number' && <span className="num text-[11px] text-muted">({count})</span>}
    </span>
  )
}

export function PriceChange({
  change,
  changePct,
  size = 'md',
  showAmount = true,
  className,
}: {
  change: number
  changePct: number
  size?: 'sm' | 'md' | 'lg'
  showAmount?: boolean
  className?: string
}) {
  const tone = priceTone(change)
  const textSize = { sm: 'text-[11.5px]', md: 'text-[13px]', lg: 'text-[15px]' }[size]
  return (
    <span className={cn('num inline-flex items-baseline gap-2 font-medium', tone, textSize, className)}>
      {showAmount && <span>{signed(change, Math.abs(change) < 10 ? 2 : 0)}</span>}
      <span>{fmtPct(changePct)}</span>
    </span>
  )
}

export function RiskBadge({ level, className }: { level: RiskLevel; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-[3px] text-[11px] font-medium',
        RISK_CHIP[level],
        className,
      )}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: level === 'high' ? '#A63E28' : level === 'medium' ? '#9A6420' : '#2C6450' }}
      />
      {RISK_LABEL[level]}风险
    </span>
  )
}

export function MetaItem({
  label,
  value,
  className,
  valueClassName,
}: {
  label: string
  value: React.ReactNode
  className?: string
  valueClassName?: string
}) {
  return (
    <div className={cn('min-w-0', className)}>
      <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">{label}</dt>
      <dd className={cn('mt-1 truncate text-[13px] text-ink', valueClassName)}>{value}</dd>
    </div>
  )
}

export function VerifiedMark({ label = '已认证' }: { label?: string }) {
  return (
    <Badge tone="green" className="gap-1">
      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden>
        <path d="M6 1.2l1.4 1 1.7-.2.6 1.6 1.5.9-.6 1.6.6 1.6-1.5.9-.6 1.6-1.7-.2L6 10.8 4.6 9.8l-1.7.2-.6-1.6L.8 7.5l.6-1.6-.6-1.6 1.5-.9.6-1.6 1.7.2L6 1.2z" fill="currentColor" opacity="0.18" />
        <path d="M3.8 6.1L5.3 7.6 8.3 4.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {label}
    </Badge>
  )
}
