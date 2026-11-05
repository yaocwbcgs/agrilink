import { Link } from 'react-router-dom'
import { Cog, Flame, MapPin, Plane, Star, Tractor, Wheat } from 'lucide-react'
import type { Machinery, MachineryCategory } from '../../types'
import { MACHINERY_LABEL, TRADE_MODE_LABEL } from '../../lib/constants'
import { SmartImage } from '../ui/SmartImage'
import { cn, fmtNumber } from '../../lib/utils'

export const MACHINE_ICON: Record<MachineryCategory, typeof Tractor> = {
  tractor: Tractor,
  harvester: Wheat,
  seeder: Wheat,
  drone: Plane,
  rotary: Cog,
  transplanter: Wheat,
  dryer: Flame,
  other: Cog,
}

export function MachineryCard({
  machine,
  className,
  variant = 'grid',
}: {
  machine: Machinery
  className?: string
  variant?: 'grid' | 'compact'
}) {
  const modeLabel = machine.modes.map((m) => TRADE_MODE_LABEL[m]).join(' / ')

  if (variant === 'compact') {
    return (
      <Link
        to={`/machinery/${machine.id}`}
        className={cn(
          'group flex gap-3.5 rounded-xl border border-line bg-white p-3 transition hover:border-moss/40 hover:shadow-card',
          className,
        )}
      >
        <div className="relative h-[76px] w-[92px] shrink-0 overflow-hidden rounded-lg">
          <SmartImage src={machine.cover} alt={machine.name} className="h-full w-full" />
          <div className="absolute inset-0 bg-forest-950/45" />
          <span className="absolute inset-0 flex items-center justify-center">
            <MachineGlyph category={machine.category} size={22} className="text-cream/90" />
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium text-forest group-hover:text-moss">{machine.name}</p>
          <p className="mt-1 truncate text-[11px] text-muted">
            {machine.region} · {MACHINERY_LABEL[machine.category]}
          </p>
          <p className="num mt-1.5 text-[13px] font-semibold text-forest">
            ￥{fmtNumber(machine.price)}
            <span className="ml-0.5 text-[10px] font-normal text-muted">/{machine.priceUnit.replace('元/', '')}</span>
          </p>
        </div>
      </Link>
    )
  }

  return (
    <Link
      to={`/machinery/${machine.id}`}
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-panel border border-line bg-white transition-all duration-500 hover:-translate-y-0.5 hover:border-moss/40 hover:shadow-lift',
        className,
      )}
    >
      <div className="relative">
        <SmartImage
          src={machine.cover}
          alt={machine.name}
          ratio="16 / 10"
          className="w-full"
          imgClassName="saturate-[0.92] transition-transform duration-[1100ms] group-hover:scale-[1.06]"
        />
        {/* 双色调：让场景照片作为作业语境，机器类型由图形承担语义 */}
        <div className="pointer-events-none absolute inset-0 bg-forest-950/35 mix-blend-multiply" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-forest-950/88 via-forest-950/10 to-forest-950/18" />

        <div className="absolute left-3 top-3 flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full border border-cream/25 bg-forest-950/40 px-2 py-0.5 text-[10px] text-cream/90 backdrop-blur">
            <MachineGlyph category={machine.category} size={10} />
            {MACHINERY_LABEL[machine.category]}
          </span>
          {machine.verified && (
            <span className="rounded-full border border-cream/25 bg-cream/15 px-2 py-0.5 text-[10px] text-cream/90 backdrop-blur">
              已认证
            </span>
          )}
        </div>

        <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-cream/95 px-2 py-1 text-[10px] font-medium text-forest">
          <Star size={9} fill="currentColor" className="text-clay" />
          {machine.rating.toFixed(1)}
        </div>

        <div className="absolute inset-x-4 bottom-3 flex items-end justify-between gap-2">
          <div>
            <p className="num text-[18px] font-semibold leading-none text-cream">
              ￥{fmtNumber(machine.price)}
              <span className="ml-1 text-[10px] font-normal text-cream/65">
                /{machine.priceUnit.replace('元/', '')}
              </span>
            </p>
            <p className="mt-1.5 flex items-center gap-1 text-[10.5px] text-cream/60">
              <span className={cn('h-1.5 w-1.5 rounded-full', machine.available ? 'bg-[#9FD4B4]' : 'bg-clay')} />
              {machine.available ? '可预约' : '档期已满'}
            </p>
          </div>
          <span className="rounded-md border border-cream/20 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-cream/60">
            {modeLabel}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-1 text-[14px] font-medium text-forest transition group-hover:text-moss">
          {machine.name}
        </h3>
        <p className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.14em] text-muted/70">
          {machine.brand} · {machine.model} · {machine.power}
        </p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-3 text-[11.5px]">
          <span className="flex min-w-0 items-center gap-1 text-muted">
            <MapPin size={11} className="shrink-0 opacity-60" />
            <span className="truncate">{machine.region}</span>
          </span>
          <span className="num shrink-0 text-muted">{machine.orders} 单</span>
        </div>
      </div>
    </Link>
  )
}

export function MachineGlyph({
  category,
  size = 14,
  className,
}: {
  category: MachineryCategory
  size?: number
  className?: string
}) {
  const Icon = MACHINE_ICON[category]
  return <Icon size={size} className={className} strokeWidth={1.6} />
}
