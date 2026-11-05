import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Info, TrendingDown, TrendingUp } from 'lucide-react'
import { Breadcrumb } from '../components/ui/Layout'
import { Badge, DemoTag } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Segmented } from '../components/ui/Tabs'
import { Pagination } from '../components/ui/Pagination'
import { SkeletonBlock, NotFoundState } from '../components/ui/States'
import { PriceChart } from '../components/charts/PriceChart'
import { useAsync } from '../hooks/useAsync'
import { fetchCommoditySeries } from '../services/prices'
import { COMMODITIES, COMMODITY_MAP, DATA_SOURCE_NOTE, getRegionPrices, getSeries } from '../data/commodities'
import type { PriceRange } from '../types'
import { cn, fmtNumber, pct, priceTone, signed } from '../lib/utils'

const RANGES: { value: PriceRange; label: string }[] = [
  { value: '1m', label: '近1月' },
  { value: '3m', label: '近3月' },
  { value: '6m', label: '近半年' },
  { value: '1y', label: '近1年' },
]

export default function PriceDetail() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const commodity = COMMODITY_MAP.get(id)
  const [range, setRange] = useState<PriceRange>('3m')
  const [page, setPage] = useState(1)

  const { data: series, loading } = useAsync(
    () => (commodity ? fetchCommoditySeries(commodity.id, range) : Promise.resolve([])),
    [id, range],
  )

  const regions = useMemo(() => (commodity ? getRegionPrices(commodity.id) : []), [commodity])
  const full = useMemo(() => (commodity ? getSeries(commodity.id, '1y') : []), [commodity])

  if (!commodity) {
    return (
      <div className="shell py-20">
        <NotFoundState onBack={() => navigate('/prices')} />
      </div>
    )
  }

  const pageSize = 10
  const rows = [...full].reverse().slice((page - 1) * pageSize, page * pageSize)
  const related = COMMODITIES.filter((c) => c.id !== commodity.id).slice(0, 4)

  return (
    <>
      <section className="border-b border-line/70 bg-cream">
        <div className="shell py-6">
          <Breadcrumb items={[{ label: '价格行情', to: '/prices' }, { label: commodity.name }]} />
        </div>
      </section>

      <section className="shell py-8 lg:py-10">
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="min-w-0 lg:col-span-8">
            <div className="overflow-hidden rounded-panel border border-line bg-white shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-4 px-5 py-5">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-[26px] font-semibold text-forest">{commodity.name}</h1>
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">{commodity.enName}</span>
                    <DemoTag />
                  </div>
                  <div className="mt-3 flex flex-wrap items-end gap-x-4 gap-y-1">
                    <p className="num flex items-baseline gap-1.5">
                      <span className="text-[34px] font-semibold leading-none text-forest">{fmtNumber(commodity.price)}</span>
                      <span className="text-[12px] text-muted">{commodity.unit}</span>
                    </p>
                    <span className={cn('num flex items-center gap-1 text-[14px] font-medium', priceTone(commodity.change))}>
                      {commodity.change >= 0 ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
                      {signed(commodity.change, 2)} ({pct(commodity.changePct)})
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <Badge tone="neutral">{commodity.contract}</Badge>
                    <Badge tone="sage">{commodity.category}</Badge>
                  </div>
                </div>
                <Segmented options={RANGES} value={range} onChange={setRange} />
              </div>

              <div className="px-2 pb-2">
                {loading || !series ? (
                  <div className="px-4 py-6">
                    <SkeletonBlock className="h-[300px] w-full" />
                  </div>
                ) : (
                  <PriceChart data={series} unit="元/吨" tone={commodity.change} height={330} />
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line/70 bg-sand/20 px-5 py-3 text-[10.5px] text-muted">
                <span className="flex items-start gap-1.5">
                  <Info size={11} className="mt-0.5 shrink-0" />
                  <span className="max-w-xl">{DATA_SOURCE_NOTE}</span>
                </span>
                <span className="num shrink-0">更新 {commodity.updatedAt}</span>
              </div>
            </div>

            <div className="mt-4 overflow-hidden rounded-panel border border-line bg-white">
              <div className="flex items-center justify-between border-b border-line/70 px-5 py-4">
                <h2 className="text-[14px] font-semibold text-forest">历史数据</h2>
                <span className="text-[10.5px] text-muted">近一年 · 单位 {commodity.unit}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left">
                  <thead>
                    <tr className="border-b border-line/60 text-[10.5px] uppercase tracking-[0.1em] text-muted">
                      <th className="px-5 py-2.5 font-normal">日期</th>
                      <th className="px-5 py-2.5 text-right font-normal">价格</th>
                      <th className="px-5 py-2.5 text-right font-normal">较前一日</th>
                      <th className="px-5 py-2.5 text-right font-normal">成交量</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/50">
                    {rows.map((row, i) => {
                      const older = full[full.length - 1 - ((page - 1) * pageSize + i) - 1]
                      const diff = older ? row.price - older.price : 0
                      return (
                        <tr key={row.date} className="text-[12px] hover:bg-sand/25">
                          <td className="num px-5 py-2.5 text-ink/75">{row.date}</td>
                          <td className="num px-5 py-2.5 text-right font-medium text-forest">{fmtNumber(row.price, 0)}</td>
                          <td className={cn('num px-5 py-2.5 text-right', priceTone(diff))}>
                            {older ? signed(diff, 2) : '—'}
                          </td>
                          <td className="num px-5 py-2.5 text-right text-ink/60">{fmtNumber(row.volume)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <div className="border-t border-line/60 px-5 py-3">
                <Pagination page={page} pageSize={pageSize} total={full.length} onChange={setPage} />
              </div>
            </div>
          </div>

          <aside className="min-w-0 space-y-4 lg:col-span-4">
            <div className="rounded-panel border border-line bg-white p-5">
              <h2 className="text-[13.5px] font-semibold text-forest">价格概览</h2>
              <dl className="mt-4 space-y-2.5 text-[12px]">
                {[
                  { k: '昨收', v: commodity.prevClose },
                  { k: '今开', v: commodity.open },
                  { k: '最高', v: commodity.high },
                  { k: '最低', v: commodity.low },
                ].map((r) => (
                  <div key={r.k} className="flex justify-between border-b border-line/50 pb-2 last:border-0">
                    <dt className="text-muted">{r.k}</dt>
                    <dd className="num text-ink/85">{fmtNumber(r.v, 0)}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-3 rounded-lg bg-sand/40 px-3 py-2.5 text-[11px]">
                <p className="flex items-center justify-between">
                  <span className="text-muted">主要市场</span>
                  <span className="text-forest">{commodity.market}</span>
                </p>
                <p className="mt-1.5 flex items-center justify-between">
                  <span className="text-muted">所属产区</span>
                  <span className="text-forest">{commodity.province}</span>
                </p>
              </div>
            </div>

            <div className="rounded-panel border border-line bg-white p-5">
              <h2 className="text-[13.5px] font-semibold text-forest">区域报价</h2>
              <div className="mt-3 space-y-2">
                {regions.map((r) => (
                  <div key={r.region} className="flex items-center justify-between rounded-lg border border-line/70 px-3 py-2 text-[11.5px]">
                    <span className="text-ink/75">{r.region}</span>
                    <span className="flex items-center gap-3">
                      <span className="num font-medium text-forest">{fmtNumber(r.price)}</span>
                      <span className={cn('num w-14 text-right', priceTone(r.changePct))}>{pct(r.changePct)}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-panel border border-line bg-white p-5">
              <h2 className="text-[13.5px] font-semibold text-forest">其他品种</h2>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {related.map((c) => (
                  <Link
                    key={c.id}
                    to={`/prices/${c.id}`}
                    className="rounded-lg border border-line px-3 py-2 transition hover:border-moss/40"
                  >
                    <p className="text-[12px] text-forest">{c.name}</p>
                    <p className={cn('num mt-0.5 text-[11px]', priceTone(c.change))}>{pct(c.changePct)}</p>
                  </Link>
                ))}
              </div>
            </div>

            <Button variant="secondary" block onClick={() => navigate('/prices')} iconLeft={<ArrowLeft size={14} />}>
              返回行情中心
            </Button>
          </aside>
        </div>
      </section>
    </>
  )
}
