import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Check, MapPin, Scale, Sparkles, Target, Wand2 } from 'lucide-react'
import { PageHero } from '../components/ui/Layout'
import { Button } from '../components/ui/Button'
import { Field, Input, Select } from '../components/ui/Form'
import { EmptyState, ErrorState, ListRowSkeleton } from '../components/ui/States'
import { SmartImage } from '../components/ui/SmartImage'
import { Segmented } from '../components/ui/Tabs'
import { useAsync } from '../hooks/useAsync'
import { fetchMatches, type MatchCriteria } from '../services/listings'
import { PRODUCE_CATEGORY_LABEL, PRODUCE_CATEGORY_OPTIONS, REGIONS } from '../lib/constants'
import type { ListingType, ProduceCategory } from '../types'
import { useListingStore } from '../store/businessStore'
import { cn, fmtNumber } from '../lib/utils'

const DEFAULT: MatchCriteria = {
  targetType: 'supply',
  keyword: '玉米',
  category: 'grain',
  quantity: 2000,
  unit: '吨',
  priceMin: 2200,
  priceMax: 2450,
  region: '全国',
  deliveryDays: 15,
}

export default function MarketMatch() {
  const own = useListingStore((s) => s.own)
  const [form, setForm] = useState<MatchCriteria>(DEFAULT)
  const [applied, setApplied] = useState<MatchCriteria>(DEFAULT)

  const { data, loading, error, reload } = useAsync(() => fetchMatches(applied, own), [applied, own])

  const set = <K extends keyof MatchCriteria>(key: K, value: MatchCriteria[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  return (
    <>
      <PageHero
        eyebrow="Smart Matching · 智能供需匹配"
        title="不是把所有信息堆给你，而是先算一遍匹配度"
        description="填写品种、数量、价格、区域与交期，系统按五个维度为每一条候选信息打分，并说明为什么匹配——你可以据此判断先联系谁。"
        breadcrumb={[{ label: '产销对接', to: '/market' }, { label: '智能匹配' }]}
        action={
          <Link
            to="/market/publish"
            className="inline-flex items-center gap-1.5 rounded-[10px] border border-line bg-white px-4 py-2.5 text-[12.5px] font-medium text-forest transition hover:border-moss/50"
          >
            发布我的供需信息
          </Link>
        }
      />

      <section className="shell py-8 lg:py-10">
        <div className="grid gap-5 lg:grid-cols-12">
          <aside className="lg:col-span-4">
            <div className="sticky top-[92px] rounded-panel border border-line bg-white p-5 shadow-card">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-moss/10 text-moss">
                  <Wand2 size={15} />
                </span>
                <div>
                  <h2 className="text-[14px] font-semibold text-forest">匹配条件</h2>
                  <p className="text-[10.5px] text-muted">条件越具体，匹配越准确</p>
                </div>
              </div>

              <div className="mt-4 space-y-4">
                <Field label="我要找" required>
                  <Segmented
                    value={form.targetType}
                    onChange={(v) => set('targetType', v as ListingType)}
                    options={[
                      { value: 'supply', label: '货源（我是采购方）' },
                      { value: 'demand', label: '买家（我是供货方）' },
                    ]}
                  />
                </Field>

                <Field label="品种关键词" htmlFor="kw">
                  <Input
                    id="kw"
                    value={form.keyword}
                    onChange={(e) => set('keyword', e.target.value)}
                    placeholder="如：玉米、强筋小麦"
                  />
                </Field>

                <Field label="品类" htmlFor="cat">
                  <Select
                    id="cat"
                    value={form.category}
                    onChange={(e) => set('category', e.target.value as ProduceCategory | 'all')}
                  >
                    <option value="all">不限品类</option>
                    {PRODUCE_CATEGORY_OPTIONS.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </Select>
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="需求数量" htmlFor="qty">
                    <Input
                      id="qty"
                      value={form.quantity || ''}
                      onChange={(e) => set('quantity', Number(e.target.value.replace(/[^\d.]/g, '')))}
                      inputMode="decimal"
                      placeholder="0"
                    />
                  </Field>
                  <Field label="单位" htmlFor="unit">
                    <Select id="unit" value={form.unit} onChange={(e) => set('unit', e.target.value)}>
                      {['吨', '公斤', '箱', '件'].map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </Select>
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="价格下限" htmlFor="pmin">
                    <Input
                      id="pmin"
                      value={form.priceMin || ''}
                      onChange={(e) => set('priceMin', Number(e.target.value.replace(/[^\d.]/g, '')))}
                      inputMode="decimal"
                      placeholder="元"
                    />
                  </Field>
                  <Field label="价格上限" htmlFor="pmax">
                    <Input
                      id="pmax"
                      value={form.priceMax || ''}
                      onChange={(e) => set('priceMax', Number(e.target.value.replace(/[^\d.]/g, '')))}
                      inputMode="decimal"
                      placeholder="元"
                    />
                  </Field>
                </div>

                <Field label="所在地区" htmlFor="region">
                  <Select id="region" value={form.region} onChange={(e) => set('region', e.target.value)}>
                    {REGIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field label="期望交期（天）" htmlFor="days" hint="用于评估对方发货时间是否可满足">
                  <Input
                    id="days"
                    value={form.deliveryDays || ''}
                    onChange={(e) => set('deliveryDays', Number(e.target.value.replace(/[^\d]/g, '')))}
                    inputMode="numeric"
                    placeholder="15"
                  />
                </Field>

                <Button block size="lg" onClick={() => setApplied({ ...form })} iconLeft={<Sparkles size={15} />}>
                  开始匹配
                </Button>
                <button
                  onClick={() => {
                    setForm(DEFAULT)
                    setApplied(DEFAULT)
                  }}
                  className="w-full text-center text-[11.5px] text-muted transition hover:text-forest"
                >
                  恢复示例条件
                </button>
              </div>
            </div>
          </aside>

          <div className="lg:col-span-8">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-panel border border-line bg-white px-5 py-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-forest text-cream">
                  <Target size={15} />
                </span>
                <div>
                  <p className="text-[13px] font-medium text-forest">
                    为「{applied.keyword || '不限品种'}」匹配{applied.targetType === 'supply' ? '货源' : '买家'}
                  </p>
                  <p className="text-[11px] text-muted">
                    {applied.region} · {applied.quantity || 0} {applied.unit} · ￥{applied.priceMin || 0}–{applied.priceMax || '不限'}
                  </p>
                </div>
              </div>
              <p className="num text-[11.5px] text-muted">
                找到 <span className="text-[15px] font-semibold text-forest">{data?.length ?? 0}</span> 条候选
              </p>
            </div>

            <div className="mt-4 space-y-3">
              {loading &&
                [0, 1, 2].map((i) => <ListRowSkeleton key={i} />)}

              {!loading && error && <ErrorState message={error} onRetry={reload} />}

              {!loading && !error && data && data.length === 0 && (
                <EmptyState
                  title="暂时没有匹配到合适的信息"
                  description="可以放宽价格区间或扩大地区范围，也可以发布一条需求，让供货方主动联系你。"
                  action={
                    <Link to="/market/publish" className="rounded-lg bg-forest px-4 py-2 text-[12.5px] text-cream">
                      发布需求
                    </Link>
                  }
                />
              )}

              {!loading &&
                !error &&
                data?.map((m, index) => {
                  const tone = m.score >= 85 ? 'high' : m.score >= 70 ? 'mid' : 'low'
                  return (
                    <article
                      key={m.listing.id}
                      className="group flex flex-col gap-4 rounded-panel border border-line bg-white p-4 transition hover:border-moss/40 hover:shadow-card sm:flex-row"
                    >
                      <Link
                        to={`/market/${m.listing.id}`}
                        className="relative h-[132px] w-full shrink-0 overflow-hidden rounded-xl sm:h-[118px] sm:w-[168px]"
                      >
                        <SmartImage src={m.listing.image} alt={m.listing.title} className="h-full w-full" />
                        <span className="absolute left-2 top-2 rounded bg-forest/85 px-1.5 py-0.5 text-[9.5px] text-cream">
                          {index === 0 ? '最佳匹配' : `候选 ${index + 1}`}
                        </span>
                      </Link>

                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <Link to={`/market/${m.listing.id}`}>
                              <h3 className="line-clamp-1 text-[14.5px] font-medium text-forest group-hover:text-moss">
                                {m.listing.title}
                              </h3>
                            </Link>
                            <p className="mt-0.5 line-clamp-1 text-[11px] text-muted">{m.listing.company}</p>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <div className="text-right">
                              <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted">匹配度</p>
                              <p
                                className={cn(
                                  'num text-[20px] font-semibold leading-none',
                                  tone === 'high' ? 'text-[#2C6450]' : tone === 'mid' ? 'text-[#9A6420]' : 'text-muted',
                                )}
                              >
                                {m.score}
                              </p>
                            </div>
                            <svg width="40" height="40" viewBox="0 0 40 40">
                              <circle cx="20" cy="20" r="16" fill="none" stroke="#EDEADF" strokeWidth="4" />
                              <circle
                                cx="20"
                                cy="20"
                                r="16"
                                fill="none"
                                stroke={tone === 'high' ? '#34745B' : tone === 'mid' ? '#E69A4A' : '#B7BDB2'}
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeDasharray={`${(m.score / 100) * 2 * Math.PI * 16} ${2 * Math.PI * 16}`}
                                transform="rotate(-90 20 20)"
                              />
                            </svg>
                          </div>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted">
                          <span className="flex items-center gap-1">
                            <Scale size={11} className="opacity-60" /> {m.listing.quantity} {m.listing.unit}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin size={11} className="opacity-60" /> {m.listing.region}
                          </span>
                          <span className="num font-medium text-moss">
                            ￥{fmtNumber(m.listing.price)}
                            {m.listing.priceMax ? `–${fmtNumber(m.listing.priceMax)}` : ''}/{m.listing.unit}
                          </span>
                        </div>

                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                          {m.reasons.slice(0, 3).map((r) => (
                            <span
                              key={r}
                              className="inline-flex items-center gap-1 rounded border border-line/80 bg-sand/40 px-1.5 py-0.5 text-[10.5px] text-ink/65"
                            >
                              <Check size={9} className="text-moss" />
                              {r}
                            </span>
                          ))}
                        </div>

                        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
                          <span className="text-[10.5px] text-muted">{PRODUCE_CATEGORY_LABEL[m.listing.category]} · {m.listing.deliveryTime}</span>
                          <Link
                            to={`/market/${m.listing.id}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-forest bg-forest px-3 py-1.5 text-[11.5px] font-medium text-cream transition hover:bg-forest-950"
                          >
                            查看并询价 <ArrowRight size={11} />
                          </Link>
                        </div>
                      </div>
                    </article>
                  )
                })}
            </div>

            <div className="mt-4 rounded-panel border border-line bg-sand/30 p-5">
              <h3 className="text-[12.5px] font-semibold text-forest">匹配算法说明</h3>
              <p className="mt-2 text-[11.5px] leading-relaxed text-muted">
                评分由品种关联度（35）、区域物流（20）、价格交叠（20）、数量满足度（15）与交期适配（10）加权得出，满分 99。
                匹配度用于排序参考，不代表对方一定可供货；实际成交仍需线下验质与合同确认。
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
