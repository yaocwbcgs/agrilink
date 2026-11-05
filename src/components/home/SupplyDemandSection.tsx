import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, MapPin, Scale, Sparkles, ArrowRight, Plus } from 'lucide-react'
import { SEED_LISTINGS } from '../../data/listings'
import type { ListingType } from '../../types'
import { SmartImage } from '../ui/SmartImage'
import { SectionHeader } from '../ui/Layout'
import { ArrowLink, Button } from '../ui/Button'
import { Tabs } from '../ui/Tabs'
import { Badge } from '../ui/Badge'
import { Reveal } from '../ui/Reveal'
import { useFavoriteStore } from '../../store/userDataStore'
import { toast } from '../../store/uiStore'
import { cn, fmtNumber, relTime } from '../../lib/utils'
import { PRODUCE_CATEGORY_LABEL } from '../../lib/constants'

export function SupplyDemandSection() {
  const [type, setType] = useState<ListingType>('supply')
  const navigate = useNavigate()
  const favorites = useFavoriteStore((s) => s.items)
  const toggle = useFavoriteStore((s) => s.toggle)

  const items = useMemo(
    () =>
      SEED_LISTINGS.filter((l) => l.type === type && l.status === 'active')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 4),
    [type],
  )

  return (
    <section className="border-y border-line/70 bg-sand/30 py-16 lg:py-24">
      <div className="shell">
        <SectionHeader
          index="04 — 产销对接"
          title="供应与采购，在这里直接碰面"
          description="产地货源与销区需求同时在线，按品种、数量、区域与交期自动计算匹配度，减少中间环节的信息损耗。"
          action={<ArrowLink to="/market">进入产销大厅</ArrowLink>}
        />

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <Tabs
            variant="boxed"
            value={type}
            onChange={(v) => setType(v as ListingType)}
            items={[
              { value: 'supply', label: '供应大厅', count: SEED_LISTINGS.filter((l) => l.type === 'supply').length },
              { value: 'demand', label: '采购大厅', count: SEED_LISTINGS.filter((l) => l.type === 'demand').length },
            ]}
          />
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              iconLeft={<Sparkles size={14} />}
              onClick={() => navigate('/market/match')}
            >
              智能供需匹配
            </Button>
            <Button size="sm" iconLeft={<Plus size={14} />} onClick={() => navigate('/market/publish')}>
              发布信息
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="space-y-3 lg:col-span-2">
            {items.map((item, i) => {
              const fav = favorites.some((f) => f.type === 'listing' && f.id === item.id)
              return (
                <Reveal key={item.id} delay={i * 70}>
                  <article className="group relative flex gap-4 rounded-panel border border-line bg-white p-3 transition-all duration-500 hover:border-moss/40 hover:shadow-card sm:p-4">
                    <Link to={`/market/${item.id}`} className="relative h-[86px] w-[104px] shrink-0 overflow-hidden rounded-xl sm:h-[104px] sm:w-[132px]">
                      <SmartImage
                        src={item.image}
                        alt={item.title}
                        className="h-full w-full"
                        imgClassName="transition-transform duration-700 group-hover:scale-105"
                      />
                      <span className="absolute left-1.5 top-1.5 rounded bg-forest/85 px-1.5 py-0.5 text-[9px] font-medium text-cream backdrop-blur">
                        {PRODUCE_CATEGORY_LABEL[item.category]}
                      </span>
                    </Link>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <Link to={`/market/${item.id}`} className="min-w-0">
                          <h3 className="line-clamp-1 text-[14px] font-medium text-forest transition group-hover:text-moss sm:text-[15px]">
                            {item.title}
                          </h3>
                        </Link>
                        <button
                          onClick={() => {
                            const added = toggle({
                              type: 'listing',
                              id: item.id,
                              title: item.title,
                              subtitle: `${item.company}`,
                              meta: `${item.quantity}${item.unit} · ${item.region}`,
                              image: item.image,
                            })
                            toast[added ? 'success' : 'info'](added ? '已加入收藏' : '已取消收藏', item.title.slice(0, 22))
                          }}
                          className={cn(
                            'shrink-0 rounded-full p-1 transition',
                            fav ? 'text-[#B4452F]' : 'text-muted/50 hover:text-[#B4452F]',
                          )}
                          aria-label={fav ? '取消收藏' : '收藏'}
                        >
                          <Heart size={15} fill={fav ? 'currentColor' : 'none'} />
                        </button>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px] text-muted">
                        <span className="flex items-center gap-1">
                          <Scale size={11} className="opacity-60" />
                          {item.quantity} {item.unit}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin size={11} className="opacity-60" />
                          {item.region}
                        </span>
                        <span className="num">{relTime(item.createdAt)}</span>
                      </div>

                      <div className="mt-3 flex flex-wrap items-end justify-between gap-2">
                        <div>
                          <p className="num text-[16px] font-semibold text-forest">
                            {item.type === 'supply' ? '￥' : '预算 ￥'}
                            {fmtNumber(item.price)}
                            {item.priceMax ? `–${fmtNumber(item.priceMax)}` : ''}
                            <span className="ml-1 text-[10.5px] font-normal text-muted">
                              /{item.unit}
                            </span>
                          </p>
                          <p className="mt-0.5 text-[10.5px] text-muted">{item.quality ?? item.deliveryTime}</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Badge tone={item.type === 'supply' ? 'green' : 'amber'}>
                            {item.type === 'supply' ? '可供' : '求购'}
                          </Badge>
                          <Link
                            to={`/market/${item.id}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-forest bg-forest px-2.5 py-1.5 text-[11.5px] font-medium text-cream transition hover:bg-forest-950"
                          >
                            询价
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                </Reveal>
              )
            })}
            <div className="pt-1">
              <Link
                to={`/market?tab=${type}`}
                className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-white/50 py-3 text-[12.5px] text-muted transition hover:border-moss/40 hover:text-forest"
              >
                查看{type === 'supply' ? '供应' : '采购'}大厅全部信息
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          {/* 匹配引导卡 */}
          <Reveal delay={200}>
            <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-panel bg-forest p-6 text-cream">
              <div className="grain pointer-events-none absolute inset-0 opacity-60" aria-hidden />
              <div
                aria-hidden
                className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full border border-cream/10"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -right-4 top-6 h-28 w-28 rounded-full border border-cream/[0.07]"
              />
              <div className="relative">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-cream/20 px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.16em] text-cream/60">
                  <Sparkles size={11} /> Smart Matching
                </span>
                <h3 className="mt-5 text-[22px] font-semibold leading-snug text-cream">
                  让合适的人
                  <br />
                  先看到你的货
                </h3>
                <p className="mt-3 text-[12.5px] leading-relaxed text-cream/55">
                  填写品种、数量、区域与交期，系统按五个维度给出匹配度与匹配原因，而不是把信息堆在列表里。
                </p>
                <ul className="mt-5 space-y-2">
                  {['品种与品类关联度', '区域物流成本', '价格区间交叠', '数量与交期适配'].map((t) => (
                    <li key={t} className="flex items-center gap-2 text-[11.5px] text-cream/60">
                      <span className="h-1 w-1 rounded-full bg-clay" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative mt-6 rounded-xl border border-cream/12 bg-cream/[0.05] p-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-cream/40">匹配示例</span>
                  <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-cream/30">Score</span>
                </div>
                <div className="mt-2.5 space-y-2">
                  {[
                    { name: '周口 · 优质强筋小麦', score: 92 },
                    { name: '通辽 · 干粮玉米', score: 86 },
                    { name: '寿光 · 硬粉番茄', score: 78 },
                  ].map((row) => (
                    <div key={row.name} className="flex items-center justify-between gap-3">
                      <span className="truncate text-[11.5px] text-cream/70">{row.name}</span>
                      <span className="flex items-center gap-2">
                        <span className="h-1 w-14 overflow-hidden rounded-full bg-cream/12">
                          <span className="block h-full rounded-full bg-clay" style={{ width: `${row.score}%` }} />
                        </span>
                        <span className="num w-6 text-right text-[11px] text-clay">{row.score}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative mt-5 space-y-2">
                <Button
                  variant="accent"
                  size="md"
                  block
                  onClick={() => navigate('/market/match')}
                  iconRight={<ArrowRight size={15} />}
                >
                  开始智能匹配
                </Button>
                <Link
                  to="/market/publish"
                  className="flex items-center justify-center gap-1.5 rounded-[10px] border border-cream/25 py-2.5 text-[12.5px] text-cream/80 transition hover:bg-cream/10"
                >
                  <Plus size={13} /> 发布一条供需信息
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
