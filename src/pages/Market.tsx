import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  ArrowRight,
  Heart,
  MapPin,
  Package,
  Plus,
  RotateCcw,
  Scale,
  SlidersHorizontal,
  Sparkles,
  Truck,
} from 'lucide-react'
import { PageHero } from '../components/ui/Layout'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Field, Input, Select } from '../components/ui/Form'
import { Tabs } from '../components/ui/Tabs'
import { Drawer } from '../components/ui/Modal'
import { Pagination } from '../components/ui/Pagination'
import { EmptyState, ErrorState, ListRowSkeleton } from '../components/ui/States'
import { SmartImage } from '../components/ui/SmartImage'
import { useAsync } from '../hooks/useAsync'
import { fetchListings } from '../services/listings'
import type { ListingType, ProduceCategory } from '../types'
import { PRODUCE_CATEGORY_LABEL, PRODUCE_CATEGORY_OPTIONS, REGIONS, SORT_OPTIONS } from '../lib/constants'
import { useListingStore } from '../store/businessStore'
import { SEED_LISTINGS } from '../data/listings'
import { useFavoriteStore } from '../store/userDataStore'
import { useUiStore, toast } from '../store/uiStore'
import { cn, fmtNumber, relTime } from '../lib/utils'

const PAGE_SIZE = 6

export default function Market() {
  const [params, setParams] = useSearchParams()
  const uiRegion = useUiStore((s) => s.region)
  const ownListings = useListingStore((s) => s.own)
  const favorites = useFavoriteStore((s) => s.items)
  const toggle = useFavoriteStore((s) => s.toggle)

  const [tab, setTab] = useState<ListingType>((params.get('tab') as ListingType) || 'supply')
  const [category, setCategory] = useState<ProduceCategory | 'all'>('all')
  const [region, setRegion] = useState(uiRegion)
  const [keyword, setKeyword] = useState(params.get('q') ?? '')
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [sort, setSort] = useState('latest')
  const [page, setPage] = useState(1)
  const [filterOpen, setFilterOpen] = useState(false)

  useEffect(() => {
    const next = (params.get('tab') as ListingType) || 'supply'
    setTab(next)
  }, [params])

  const query = useMemo(
    () => ({
      type: tab,
      category,
      region,
      keyword,
      minPrice: priceMin ? Number(priceMin) : undefined,
      maxPrice: priceMax ? Number(priceMax) : undefined,
      sort: sort as 'latest' | 'price-asc' | 'price-desc' | 'hot',
      page,
      pageSize: PAGE_SIZE,
    }),
    [tab, category, region, keyword, priceMin, priceMax, sort, page],
  )

  const { data, loading, error, reload } = useAsync(() => fetchListings(query, ownListings), [query, ownListings])

  const activeCount = (category !== 'all' ? 1 : 0) + (region !== '全国' ? 1 : 0) + (priceMin ? 1 : 0) + (priceMax ? 1 : 0) + (keyword ? 1 : 0)

  const resetFilters = () => {
    setCategory('all')
    setRegion('全国')
    setKeyword('')
    setPriceMin('')
    setPriceMax('')
    setPage(1)
  }

  const filterBody = (
    <div className="space-y-5">
      <Field label="产品分类">
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => {
              setCategory('all')
              setPage(1)
            }}
            className={cn('chip', category === 'all' && 'chip-active')}
          >
            全部分类
          </button>
          {PRODUCE_CATEGORY_OPTIONS.map((c) => (
            <button
              key={c.value}
              onClick={() => {
                setCategory(c.value)
                setPage(1)
              }}
              className={cn('chip', category === c.value && 'chip-active')}
            >
              {c.label}
            </button>
          ))}
        </div>
      </Field>

      <Field label="所在地区">
        <Select
          value={region}
          onChange={(e) => {
            setRegion(e.target.value)
            setPage(1)
          }}
        >
          {REGIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="价格区间" hint="单位：元 / 展示单位（吨、公斤等）">
        <div className="flex items-center gap-2">
          <Input
            value={priceMin}
            onChange={(e) => {
              setPriceMin(e.target.value.replace(/[^\d.]/g, ''))
              setPage(1)
            }}
            placeholder="最低"
            inputMode="decimal"
          />
          <span className="text-muted">—</span>
          <Input
            value={priceMax}
            onChange={(e) => {
              setPriceMax(e.target.value.replace(/[^\d.]/g, ''))
              setPage(1)
            }}
            placeholder="最高"
            inputMode="decimal"
          />
        </div>
      </Field>

      <Field label="关键词">
        <Input
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value)
            setPage(1)
          }}
          placeholder="如「玉米」「容重」"
        />
      </Field>

      <div className="flex gap-2 pt-1">
        <Button variant="secondary" size="sm" block onClick={resetFilters} iconLeft={<RotateCcw size={13} />}>
          重置
        </Button>
        <Button size="sm" block className="lg:hidden" onClick={() => setFilterOpen(false)}>
          查看结果
        </Button>
      </div>
    </div>
  )

  return (
    <>
      <PageHero
        eyebrow="Trade Matching · 产销对接"
        title="产地货源与销区需求，直接对接"
        description="供应大厅与采购大厅双向发布，支持按品种、分类、地区与价格筛选；智能匹配根据品种、数量、区域、价格与交期给出匹配度与原因。"
        breadcrumb={[{ label: '产销对接' }]}
        action={
          <div className="flex flex-wrap gap-2">
            <Link
              to="/market/match"
              className="inline-flex items-center gap-1.5 rounded-[10px] border border-line bg-white px-4 py-2.5 text-[12.5px] font-medium text-forest transition hover:border-moss/50"
            >
              <Sparkles size={14} /> 智能匹配
            </Link>
            <Link
              to="/market/publish"
              className="inline-flex items-center gap-1.5 rounded-[10px] border border-forest bg-forest px-4 py-2.5 text-[12.5px] font-medium text-cream transition hover:bg-forest-950"
            >
              <Plus size={14} /> 发布信息
            </Link>
          </div>
        }
        meta={
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[11.5px] text-muted">
            <span className="flex items-center gap-1.5">
              <Package size={12} /> 供应 {SEED_LISTINGS.filter((l) => l.type === 'supply').length + ownListings.filter((l) => l.type === 'supply' && l.status === 'active').length} 条
            </span>
            <span className="flex items-center gap-1.5">
              <Truck size={12} /> 采购 {SEED_LISTINGS.filter((l) => l.type === 'demand').length + ownListings.filter((l) => l.type === 'demand' && l.status === 'active').length} 条
            </span>
            <span>覆盖 20+ 省份</span>
          </div>
        }
      />

      <section className="shell py-8 lg:py-10">
        <div className="flex flex-col gap-4 border-b border-line/70 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <Tabs
            variant="boxed"
            value={tab}
            onChange={(v) => {
              setTab(v as ListingType)
              setPage(1)
              setParams({ tab: v })
            }}
            items={[
              { value: 'supply', label: '供应大厅' },
              { value: 'demand', label: '采购大厅' },
            ]}
          />
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-2 text-[12.5px] text-forest lg:hidden"
            >
              <SlidersHorizontal size={13} /> 筛选
              {activeCount > 0 && (
                <span className="num flex h-4 min-w-4 items-center justify-center rounded-full bg-forest px-1 text-[9px] text-cream">
                  {activeCount}
                </span>
              )}
            </button>
            <span className="hidden text-[12px] text-muted sm:inline">排序</span>
            <Select value={sort} onChange={(e) => setSort(e.target.value)} className="h-9 w-[132px] py-0 text-[12.5px]">
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[248px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-[92px] rounded-panel border border-line bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-1.5 text-[13.5px] font-semibold text-forest">
                  <SlidersHorizontal size={13} /> 条件筛选
                </h3>
                {activeCount > 0 && (
                  <button onClick={resetFilters} className="text-[11px] text-moss hover:text-forest">
                    清空
                  </button>
                )}
              </div>
              {filterBody}
            </div>
          </aside>

          <div>
            {loading && (
              <div className="space-y-3">
                {[0, 1, 2, 3].map((i) => (
                  <ListRowSkeleton key={i} />
                ))}
              </div>
            )}

            {!loading && error && <ErrorState message={error} onRetry={reload} />}

            {!loading && !error && data && data.items.length === 0 && (
              <EmptyState
                title={`没有符合条件的${tab === 'supply' ? '供应' : '采购'}信息`}
                description="可以放宽价格区间、切换省份，或直接发布一条需求等待匹配。"
                action={
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={resetFilters}>
                      清除筛选
                    </Button>
                    <Link
                      to="/market/publish"
                      className="inline-flex items-center gap-1 rounded-lg bg-forest px-3.5 py-2 text-[12.5px] text-cream"
                    >
                      发布信息
                    </Link>
                  </div>
                }
              />
            )}

            {!loading && !error && data && data.items.length > 0 && (
              <>
                <div className="space-y-3">
                  {data.items.map((item) => {
                    const fav = favorites.some((f) => f.type === 'listing' && f.id === item.id)
                    return (
                      <article
                        key={item.id}
                        className="group relative flex flex-col gap-4 rounded-panel border border-line bg-white p-4 transition-all duration-300 hover:border-moss/40 hover:shadow-card sm:flex-row"
                      >
                        <Link
                          to={`/market/${item.id}`}
                          className="relative h-[148px] w-full shrink-0 overflow-hidden rounded-xl sm:h-[124px] sm:w-[184px]"
                        >
                          <SmartImage
                            src={item.image}
                            alt={item.title}
                            className="h-full w-full"
                            imgClassName="transition-transform duration-700 group-hover:scale-105"
                          />
                          <span className="absolute left-2 top-2 rounded bg-forest/85 px-1.5 py-0.5 text-[9.5px] text-cream backdrop-blur">
                            {PRODUCE_CATEGORY_LABEL[item.category]}
                          </span>
                        </Link>

                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <Link to={`/market/${item.id}`}>
                                <h3 className="line-clamp-1 text-[15px] font-medium text-forest transition group-hover:text-moss">
                                  {item.title}
                                </h3>
                              </Link>
                              <p className="mt-1 line-clamp-1 text-[11.5px] text-muted">{item.company}</p>
                            </div>
                            <button
                              onClick={() => {
                                const added = toggle({
                                  type: 'listing',
                                  id: item.id,
                                  title: item.title,
                                  subtitle: item.company,
                                  meta: `${item.quantity}${item.unit} · ${item.region}`,
                                  image: item.image,
                                })
                                toast[added ? 'success' : 'info'](added ? '已加入收藏' : '已取消收藏')
                              }}
                              className={cn(
                                'shrink-0 rounded-full p-1.5 transition',
                                fav ? 'text-[#B4452F]' : 'text-muted/40 hover:text-[#B4452F]',
                              )}
                              aria-label={fav ? '取消收藏' : '收藏'}
                            >
                              <Heart size={15} fill={fav ? 'currentColor' : 'none'} />
                            </button>
                          </div>

                          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted">
                            <span className="flex items-center gap-1">
                              <Scale size={11} className="opacity-60" /> {item.quantity} {item.unit}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin size={11} className="opacity-60" /> {item.region}
                            </span>
                            <span className="flex items-center gap-1">
                              <Truck size={11} className="opacity-60" /> {item.deliveryTime}
                            </span>
                            <span className="num">{relTime(item.createdAt)}</span>
                          </div>

                          <p className="mt-2 line-clamp-1 text-[11.5px] text-ink/60">{item.quality}</p>

                          <div className="mt-auto flex flex-wrap items-end justify-between gap-2 pt-3">
                            <div>
                              <p className="num text-[18px] font-semibold text-forest">
                                {item.type === 'supply' ? '￥' : '预算 ￥'}
                                {fmtNumber(item.price)}
                                {item.priceMax ? `–${fmtNumber(item.priceMax)}` : ''}
                                <span className="ml-1 text-[10.5px] font-normal text-muted">/{item.unit}</span>
                              </p>
                              <p className="mt-0.5 text-[10.5px] text-muted">{item.contactName} · {item.contact}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge tone={item.type === 'supply' ? 'green' : 'amber'}>
                                {item.type === 'supply' ? '可供' : '求购'}
                              </Badge>
                              <Link
                                to={`/market/${item.id}`}
                                className="inline-flex items-center gap-1 rounded-lg border border-forest bg-forest px-3 py-1.5 text-[11.5px] font-medium text-cream transition hover:bg-forest-950"
                              >
                                查看详情 <ArrowRight size={12} />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </article>
                    )
                  })}
                </div>

                <Pagination
                  className="mt-6"
                  page={data.page}
                  pageSize={data.pageSize}
                  total={data.total}
                  onChange={(p) => {
                    setPage(p)
                    window.scrollTo({ top: 300, behavior: 'smooth' })
                  }}
                />
              </>
            )}
          </div>
        </div>
      </section>

      <Drawer open={filterOpen} onClose={() => setFilterOpen(false)} title="筛选条件" side="bottom">
        {filterBody}
      </Drawer>
    </>
  )
}
