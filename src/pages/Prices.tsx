import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, BarChart3, Info, MapPin, TrendingDown, TrendingUp } from 'lucide-react'
import { PageHero } from '../components/ui/Layout'
import { DemoTag, Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Field, Select } from '../components/ui/Form'
import { Segmented } from '../components/ui/Tabs'
import { PriceChart } from '../components/charts/PriceChart'
import { useAsync } from '../hooks/useAsync'
import { fetchCommoditySeries } from '../services/prices'
import { COMMODITIES, DATA_SOURCE_NOTE, MARKETS, getRegionPrices } from '../data/commodities'
import { REGIONS, REGION_CITIES } from '../lib/constants'
import type { PriceRange } from '../types'
import { ErrorState, SkeletonBlock } from '../components/ui/States'
import { cn, fmtNumber, pct, priceTone, signed } from '../lib/utils'
import { Sparkline } from '../components/charts/Sparkline'

const RANGES: { value: PriceRange; label: string }[] = [
  { value: '1m', label: '近1月' },
  { value: '3m', label: '近3月' },
  { value: '6m', label: '近半年' },
  { value: '1y', label: '近1年' },
]

export default function Prices() {
  const [activeId, setActiveId] = useState(COMMODITIES[0].id)
  const [range, setRange] = useState<PriceRange>('3m')
  const [province, setProvince] = useState('全国')
  const [city, setCity] = useState('全部')
  const [marketId, setMarketId] = useState('all')

  const active = COMMODITIES.find((c) => c.id === activeId) ?? COMMODITIES[0]
  const { data: series, loading, error, reload } = useAsync(
    () => fetchCommoditySeries(active.id, range),
    [active.id, range],
  )
  const regions = useMemo(() => getRegionPrices(active.id), [active.id])
  const cities = province === '全国' ? [] : REGION_CITIES[province] ?? []

  const ranking = useMemo(() => [...COMMODITIES].sort((a, b) => b.changePct - a.changePct), [])

  return (
    <>
      <PageHero
        eyebrow="Market Intelligence · 价格行情"
        title="大宗农产品价格中心"
        description="覆盖玉米、小麦、水稻、大豆、棉花、花生、油菜籽与白糖，支持日/周/月线切换、区域价格对比与市场排行。数据为演示示例，接入交易所或授权行情源后即可用于经营参考。"
        breadcrumb={[{ label: '价格行情' }]}
        action={
          <div className="flex flex-col items-start gap-2 lg:items-end">
            <DemoTag />
            <p className="max-w-xs text-[10.5px] leading-relaxed text-muted lg:text-right">
              数据来源：平台按固定种子生成 · 单位：元/吨
              <br />
              更新时间：交易日内 15:00
            </p>
          </div>
        }
      />

      <section className="shell py-8 lg:py-10">
        {/* 品种导航 */}
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-8">
          {COMMODITIES.map((c) => {
            const isActive = c.id === activeId
            return (
              <button
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className={cn(
                  'group rounded-xl border px-3.5 py-3 text-left transition-all duration-300',
                  isActive
                    ? 'border-forest bg-forest text-cream shadow-card'
                    : 'border-line bg-white hover:-translate-y-0.5 hover:border-moss/40 hover:shadow-card',
                )}
              >
                <div className="flex items-center justify-between">
                  <span className={cn('text-[12.5px] font-medium', isActive ? 'text-cream' : 'text-forest')}>{c.name}</span>
                  <span
                    className={cn(
                      'font-mono text-[8.5px] uppercase tracking-[0.1em]',
                      isActive ? 'text-cream/40' : 'text-muted/60',
                    )}
                  >
                    {c.enName}
                  </span>
                </div>
                <p className={cn('num mt-1.5 text-[15px] font-semibold', isActive ? 'text-cream' : 'text-forest')}>
                  {fmtNumber(c.price)}
                </p>
                <p
                  className={cn(
                    'num mt-0.5 text-[10.5px]',
                    isActive ? 'text-cream/60' : priceTone(c.change),
                  )}
                >
                  {pct(c.changePct)}
                </p>
              </button>
            )
          })}
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-12">
          {/* 主图 */}
          <div className="min-w-0 lg:col-span-8">
            <div className="overflow-hidden rounded-panel border border-line bg-white shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line/70 px-5 py-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-[18px] font-semibold text-forest">{active.name}</h2>
                    <Badge tone="neutral">{active.category}</Badge>
                    <Badge tone="sage">{active.contract}</Badge>
                  </div>
                  <div className="mt-2.5 flex flex-wrap items-end gap-x-4 gap-y-1">
                    <p className="num flex items-baseline gap-1.5">
                      <span className="text-[30px] font-semibold leading-none text-forest">{fmtNumber(active.price)}</span>
                      <span className="text-[11.5px] text-muted">{active.unit}</span>
                    </p>
                    <span className={cn('num flex items-center gap-1 text-[13px] font-medium', priceTone(active.change))}>
                      {active.change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      {signed(active.change, 2)} · {pct(active.changePct)}
                    </span>
                  </div>
                </div>
                <Segmented options={RANGES} value={range} onChange={setRange} />
              </div>

              <div className="px-2 pb-3 pt-4">
                {error ? (
                  <ErrorState message={error} onRetry={reload} />
                ) : loading || !series ? (
                  <div className="space-y-3 px-4 py-6">
                    <SkeletonBlock className="h-[260px] w-full" />
                  </div>
                ) : (
                  <PriceChart data={series} unit="元/吨" tone={active.change} height={320} />
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line/70 bg-sand/20 px-5 py-3 text-[10.5px] text-muted">
                <span className="flex items-start gap-1.5">
                  <Info size={11} className="mt-0.5 shrink-0" />
                  <span className="line-clamp-2 max-w-2xl">{DATA_SOURCE_NOTE}</span>
                </span>
                <span className="num shrink-0">更新 {active.updatedAt}</span>
              </div>
            </div>

            {/* 历史表格 */}
            <div className="mt-4 overflow-hidden rounded-panel border border-line bg-white">
              <div className="flex items-center justify-between border-b border-line/70 px-5 py-4">
                <h3 className="text-[14px] font-semibold text-forest">历史价格数据</h3>
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                  最近 {Math.min(12, series?.length ?? 0)} 个交易日
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-left">
                  <thead>
                    <tr className="border-b border-line/60 text-[10.5px] uppercase tracking-[0.1em] text-muted">
                      <th className="px-5 py-2.5 font-normal">日期</th>
                      <th className="px-5 py-2.5 text-right font-normal">开盘</th>
                      <th className="px-5 py-2.5 text-right font-normal">收盘</th>
                      <th className="px-5 py-2.5 text-right font-normal">涨跌</th>
                      <th className="px-5 py-2.5 text-right font-normal">成交量（吨）</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/50">
                    {(series ?? [])
                      .slice(-12)
                      .reverse()
                      .map((row, i, arr) => {
                        const prev = arr[i + 1]
                        const diff = prev ? row.price - prev.price : 0
                        return (
                          <tr key={row.date} className="text-[12px] transition hover:bg-sand/25">
                            <td className="num px-5 py-2.5 text-ink/75">{row.date}</td>
                            <td className="num px-5 py-2.5 text-right text-ink/60">{fmtNumber(row.price - diff, 0)}</td>
                            <td className="num px-5 py-2.5 text-right font-medium text-forest">{fmtNumber(row.price, 0)}</td>
                            <td className={cn('num px-5 py-2.5 text-right', priceTone(diff))}>
                              {prev ? signed(diff, 2) : '—'}
                            </td>
                            <td className="num px-5 py-2.5 text-right text-ink/60">{fmtNumber(row.volume)}</td>
                          </tr>
                        )
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 侧栏 */}
          <div className="min-w-0 space-y-4 lg:col-span-4">
            <div className="rounded-panel border border-line bg-white p-5">
              <h3 className="text-[13.5px] font-semibold text-forest">今日关键价位</h3>
              <dl className="mt-4 grid grid-cols-2 gap-3">
                {[
                  { label: '最新价', value: active.price, tone: 'text-forest' },
                  { label: '昨收', value: active.prevClose, tone: 'text-ink/75' },
                  { label: '今日最高', value: active.high, tone: 'text-[#B4452F]' },
                  { label: '今日最低', value: active.low, tone: 'text-[#2C7A5B]' },
                ].map((item) => (
                  <div key={item.label} className="rounded-lg border border-line/80 bg-sand/20 px-3 py-2.5">
                    <dt className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted">{item.label}</dt>
                    <dd className={cn('num mt-1 text-[15px] font-semibold', item.tone)}>{fmtNumber(item.value, 0)}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-3 flex items-center justify-between rounded-lg bg-forest/[0.04] px-3 py-2 text-[11px]">
                <span className="text-muted">主要交易市场</span>
                <span className="text-forest">{active.market}</span>
              </div>
              <Link
                to={`/prices/${active.id}`}
                className="mt-3 flex items-center justify-center gap-1.5 rounded-[10px] border border-forest bg-forest py-2.5 text-[12.5px] font-medium text-cream transition hover:bg-forest-950"
              >
                查看品种详情 <ArrowUpRight size={13} />
              </Link>
            </div>

            <div className="rounded-panel border border-line bg-white p-5">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-1.5 text-[13.5px] font-semibold text-forest">
                  <BarChart3 size={13} /> 市场价格排行
                </h3>
                <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted">涨幅</span>
              </div>
              <div className="mt-3 space-y-1">
                {ranking.slice(0, 5).map((c, i) => (
                  <button
                    key={c.id}
                    onClick={() => setActiveId(c.id)}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition hover:bg-sand/40"
                  >
                    <span className="num w-4 font-mono text-[10px] text-muted/60">{i + 1}</span>
                    <span className="w-12 text-[12px] text-ink/80">{c.name}</span>
                    <Sparkline data={c.spark} color={c.change >= 0 ? '#B4452F' : '#2C7A5B'} width={60} height={18} fill={false} />
                    <span className={cn('num ml-auto text-[11.5px] font-medium', priceTone(c.changePct))}>
                      {pct(c.changePct)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-panel border border-line bg-white p-5">
              <h3 className="text-[13.5px] font-semibold text-forest">行情筛选</h3>
              <div className="mt-3 space-y-3">
                <Field label="省份">
                  <Select
                    value={province}
                    onChange={(e) => {
                      setProvince(e.target.value)
                      setCity('全部')
                    }}
                  >
                    {REGIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="城市">
                  <Select value={city} onChange={(e) => setCity(e.target.value)} disabled={province === '全国'}>
                    <option value="全部">{province === '全国' ? '请先选择省份' : '全部城市'}</option>
                    {cities.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="交易市场">
                  <Select value={marketId} onChange={(e) => setMarketId(e.target.value)}>
                    <option value="all">全部市场</option>
                    {MARKETS.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </Select>
                </Field>
                <p className="flex items-start gap-1.5 text-[10.5px] leading-relaxed text-muted">
                  <MapPin size={11} className="mt-0.5 shrink-0" />
                  区域筛选用于查看下方区域价差；图表展示的是所选品种的主市场参考价。
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 区域价格对比 */}
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-panel border border-line bg-white p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-[14px] font-semibold text-forest">区域价格对比</h3>
              <span className="text-[10.5px] text-muted">单位：元/吨 · 演示数据</span>
            </div>
            <div className="mt-4 space-y-3">
              {regions.map((r) => {
                const max = Math.max(...regions.map((x) => x.price))
                const min = Math.min(...regions.map((x) => x.price))
                const width = 30 + ((r.price - min) / (max - min || 1)) * 70
                const isHi = r.price === max
                return (
                  <div key={r.region}>
                    <div className="flex items-center justify-between text-[11.5px]">
                      <span className="flex items-center gap-1.5 text-ink/75">
                        <span className="h-1.5 w-1.5 rounded-full bg-sage" />
                        {r.region}
                        {isHi && <span className="rounded bg-clay/15 px-1 py-0.5 text-[9px] text-[#94601F]">最高</span>}
                      </span>
                      <span className="flex items-center gap-3">
                        <span className="num font-medium text-forest">{fmtNumber(r.price)}</span>
                        <span className={cn('num w-14 text-right', priceTone(r.changePct))}>{pct(r.changePct)}</span>
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-sand">
                      <div
                        className={cn('h-full rounded-full', isHi ? 'bg-forest' : 'bg-moss/60')}
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
            <p className="mt-4 text-[10.5px] leading-relaxed text-muted">
              区域价差主要反映运费与当地供需，跨区调运前需核算物流成本与损耗。
            </p>
          </div>

          <div className="rounded-panel border border-line bg-white p-5">
            <h3 className="text-[14px] font-semibold text-forest">价格波动分析</h3>
            <div className="mt-3 space-y-3">
              {[
                {
                  t: '区间波动率',
                  v: `${(((Math.max(...(series?.map((s) => s.price) ?? [1])) - Math.min(...(series?.map((s) => s.price) ?? [1]))) / active.price) * 100).toFixed(2)}%`,
                  d: '按所选时间范围计算最高与最低价差',
                },
                {
                  t: '方向判断',
                  v: active.changePct >= 0 ? '重心上移' : '重心下移',
                  d: '近 20 个交易日均价相对前 20 日均价',
                },
                {
                  t: '关注要点',
                  v: active.category === '粮食' ? '售粮进度与深加工开机' : '进口成本与替代品价差',
                  d: '影响短期价格的主要变量',
                },
              ].map((row) => (
                <div key={row.t} className="rounded-lg border border-line/80 bg-sand/20 px-3.5 py-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11.5px] text-muted">{row.t}</span>
                    <span className="text-[12.5px] font-medium text-forest">{row.v}</span>
                  </div>
                  <p className="mt-1 text-[10.5px] text-muted/80">{row.d}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-clay/25 bg-clay/[0.06] px-3 py-2.5">
              <Info size={12} className="mt-0.5 shrink-0 text-[#9A6420]" />
              <p className="text-[10.5px] leading-relaxed text-[#7C5320]">
                以上分析基于演示数据自动生成，仅用于展示产品能力，不构成任何交易或投资建议。
              </p>
            </div>
            <Button variant="secondary" size="sm" block className="mt-3" onClick={reload}>
              刷新行情数据
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
