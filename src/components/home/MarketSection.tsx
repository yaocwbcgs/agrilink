import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowUpRight, Info } from 'lucide-react'
import { COMMODITIES, DATA_SOURCE_NOTE, getSeries } from '../../data/commodities'
import type { PriceRange } from '../../types'
import { fmtNumber, pct, priceTone, signed } from '../../lib/utils'
import { PriceChart } from '../charts/PriceChart'
import { Sparkline } from '../charts/Sparkline'
import { Segmented } from '../ui/Tabs'
import { SectionHeader } from '../ui/Layout'
import { ArrowLink } from '../ui/Button'
import { DemoTag } from '../ui/Badge'
import { Reveal } from '../ui/Reveal'
import { cn } from '../../lib/utils'

const RANGES: { value: PriceRange; label: string }[] = [
  { value: '1m', label: '近1月' },
  { value: '3m', label: '近3月' },
  { value: '6m', label: '近半年' },
  { value: '1y', label: '近1年' },
]

export function MarketSection() {
  const [activeId, setActiveId] = useState(COMMODITIES[0].id)
  const [range, setRange] = useState<PriceRange>('3m')
  const navigate = useNavigate()
  const active = COMMODITIES.find((c) => c.id === activeId) ?? COMMODITIES[0]
  const series = getSeries(active.id, range)

  return (
    <section className="shell py-16 lg:py-24">
      <SectionHeader
        index="03 — 行情中心"
        title="大宗作物价格，一屏看清"
        description="覆盖粮食与油料主要品种，支持周期切换与区域价差对比。数据为演示示例，接入真实行情源后即可用于经营决策。"
        action={<ArrowLink to="/prices">全部行情与区域对比</ArrowLink>}
      />

      <div className="mt-10 grid gap-4 lg:grid-cols-5">
        {/* 行情表 */}
        <Reveal className="lg:col-span-3">
          <div className="overflow-hidden rounded-panel border border-line bg-white shadow-card">
            <div className="flex items-center justify-between border-b border-line/70 px-5 py-4">
              <div className="flex items-center gap-2">
                <h3 className="text-[14px] font-semibold text-forest">主流品种参考价</h3>
                <DemoTag />
              </div>
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">元 / 吨</span>
            </div>

            <div className="hidden grid-cols-[1.5fr_repeat(3,0.9fr)_1fr] gap-3 border-b border-line/60 px-5 py-2.5 text-[10px] uppercase tracking-[0.12em] text-muted md:grid">
              <span>品种</span>
              <span className="text-right">最新价</span>
              <span className="text-right">涨跌</span>
              <span className="text-right">幅度</span>
              <span className="text-right">24H 走势</span>
            </div>

            <div className="divide-y divide-line/50">
              {COMMODITIES.map((c) => {
                const isActive = c.id === activeId
                return (
                  <button
                    key={c.id}
                    onClick={() => setActiveId(c.id)}
                    onDoubleClick={() => navigate(`/prices/${c.id}`)}
                    className={cn(
                      'grid w-full grid-cols-[1.4fr_1fr_0.9fr] items-center gap-3 px-5 py-3 text-left transition-colors md:grid-cols-[1.5fr_repeat(3,0.9fr)_1fr]',
                      isActive ? 'bg-[#F1F5EE]' : 'hover:bg-sand/30',
                    )}
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      <span
                        className={cn(
                          'h-6 w-[3px] shrink-0 rounded-full transition-colors',
                          isActive ? 'bg-clay' : 'bg-transparent',
                        )}
                      />
                      <span className="min-w-0">
                        <span className="block truncate text-[13.5px] font-medium text-forest">{c.name}</span>
                        <span className="block font-mono text-[9px] uppercase tracking-[0.14em] text-muted/70">
                          {c.enName}
                        </span>
                      </span>
                    </span>
                    <span className="num text-right text-[14px] font-semibold text-forest">{fmtNumber(c.price)}</span>
                    <span className={cn('num hidden text-right text-[12px] md:block', priceTone(c.change))}>
                      {signed(c.change, 2)}
                    </span>
                    <span className={cn('num text-right text-[12px] font-medium', priceTone(c.change))}>
                      {pct(c.changePct)}
                    </span>
                    <span className="hidden justify-end md:flex">
                      <Sparkline
                        data={c.spark}
                        color={c.change >= 0 ? '#B4452F' : '#2C7A5B'}
                        width={72}
                        height={22}
                        fill={false}
                      />
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-line/70 bg-sand/25 px-5 py-3">
              <p className="flex items-start gap-1.5 text-[10.5px] leading-relaxed text-muted">
                <Info size={12} className="mt-0.5 shrink-0" />
                <span className="line-clamp-2">{DATA_SOURCE_NOTE}</span>
              </p>
              <button
                onClick={() => navigate(`/prices/${activeId}`)}
                className="hidden shrink-0 items-center gap-1 text-[11.5px] font-medium text-moss hover:text-forest sm:flex"
              >
                查看详情 <ArrowUpRight size={12} />
              </button>
            </div>
          </div>
        </Reveal>

        {/* 走势卡 */}
        <Reveal delay={120} className="lg:col-span-2">
          <div className="flex h-full flex-col overflow-hidden rounded-panel border border-line bg-white shadow-card">
            <div className="border-b border-line/70 px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-[15px] font-semibold text-forest">{active.name}</h3>
                    <span className="rounded border border-line px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide text-muted">
                      {active.contract}
                    </span>
                  </div>
                  <p className="mt-2 flex items-baseline gap-1.5">
                    <span className="num text-[26px] font-semibold text-forest">{fmtNumber(active.price)}</span>
                    <span className="text-[11px] text-muted">{active.unit}</span>
                  </p>
                  <p className={cn('num mt-1 text-[12px] font-medium', priceTone(active.change))}>
                    {signed(active.change, 2)} · {pct(active.changePct)}
                  </p>
                </div>
                <Segmented options={RANGES} value={range} onChange={setRange} size="sm" />
              </div>
            </div>
            <div className="min-h-[220px] flex-1 px-2 pb-2 pt-3">
              <PriceChart data={series} unit={active.unit.replace('元/', '')} tone={active.change} fill showVolume={false} />
            </div>
            <div className="flex items-center justify-between gap-2 border-t border-line/70 px-5 py-3 text-[10.5px] text-muted">
              <span className="truncate">{active.market}</span>
              <span className="num shrink-0">更新 {active.updatedAt.slice(5)}</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
