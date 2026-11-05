import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, RotateCcw, SlidersHorizontal, Tractor } from 'lucide-react'
import { PageHero } from '../components/ui/Layout'
import { Button } from '../components/ui/Button'
import { Checkbox, Field, Input, Select } from '../components/ui/Form'
import { Segmented } from '../components/ui/Tabs'
import { Drawer } from '../components/ui/Modal'
import { Pagination } from '../components/ui/Pagination'
import { CardSkeleton, EmptyState, ErrorState } from '../components/ui/States'
import { Reveal } from '../components/ui/Reveal'
import { MachineryCard } from '../components/machinery/MachineryCard'
import { useAsync } from '../hooks/useAsync'
import { fetchMachinery } from '../services/machinery'
import { MACHINERY_LABEL, MACHINERY_OPTIONS, REGIONS } from '../lib/constants'
import type { MachineryCategory, TradeMode } from '../types'
import { useUiStore } from '../store/uiStore'
import { cn } from '../lib/utils'

const PAGE_SIZE = 6

export default function Machinery() {
  const uiRegion = useUiStore((s) => s.region)
  const [category, setCategory] = useState<MachineryCategory | 'all'>('all')
  const [region, setRegion] = useState(uiRegion)
  const [mode, setMode] = useState<TradeMode | 'all'>('all')
  const [onlyAvailable, setOnlyAvailable] = useState(false)
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [sort, setSort] = useState('latest')
  const [page, setPage] = useState(1)
  const [filterOpen, setFilterOpen] = useState(false)

  const query = useMemo(
    () => ({
      category,
      region,
      mode,
      onlyAvailable,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      sort: sort as 'latest' | 'price-asc' | 'price-desc' | 'rating',
      page,
      pageSize: PAGE_SIZE,
    }),
    [category, region, mode, onlyAvailable, minPrice, maxPrice, sort, page],
  )

  const { data, loading, error, reload } = useAsync(() => fetchMachinery(query), [query])

  const reset = () => {
    setCategory('all')
    setRegion('全国')
    setMode('all')
    setOnlyAvailable(false)
    setMinPrice('')
    setMaxPrice('')
    setPage(1)
  }

  const filters = (
    <div className="space-y-5">
      <Field label="农机类型">
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => {
              setCategory('all')
              setPage(1)
            }}
            className={cn('chip', category === 'all' && 'chip-active')}
          >
            全部
          </button>
          {MACHINERY_OPTIONS.map((c) => (
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

      <Field label="服务区域">
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

      <Field label="合作方式">
        <Segmented
          value={mode}
          onChange={(v) => {
            setMode(v as TradeMode | 'all')
            setPage(1)
          }}
          options={[
            { value: 'all', label: '全部' },
            { value: 'rent', label: '出租' },
            { value: 'sale', label: '出售' },
            { value: 'service', label: '作业' },
          ]}
        />
      </Field>

      <Field label="价格区间" hint="按展示单位计价（元/亩、元/台等）">
        <div className="flex items-center gap-2">
          <Input
            value={minPrice}
            onChange={(e) => {
              setMinPrice(e.target.value.replace(/[^\d.]/g, ''))
              setPage(1)
            }}
            placeholder="最低"
            inputMode="decimal"
          />
          <span className="text-muted">—</span>
          <Input
            value={maxPrice}
            onChange={(e) => {
              setMaxPrice(e.target.value.replace(/[^\d.]/g, ''))
              setPage(1)
            }}
            placeholder="最高"
            inputMode="decimal"
          />
        </div>
      </Field>

      <Checkbox
        checked={onlyAvailable}
        onChange={(v) => {
          setOnlyAvailable(v)
          setPage(1)
        }}
        label="只看当前可预约"
        description="隐藏档期已满的农机与作业队"
      />

      <div className="flex gap-2">
        <Button variant="secondary" size="sm" block onClick={reset} iconLeft={<RotateCcw size={13} />}>
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
        eyebrow="Machinery Sharing · 农机服务"
        title="按亩约农机，档期与价格写在明处"
        description="拖拉机、联合收割机、播种机、植保无人机、旋耕机、插秧机与烘干设备，按类型、区域、价格与可服务时间筛选，在线预约后生成作业订单。"
        breadcrumb={[{ label: '农机服务' }]}
        action={
          <div className="flex flex-wrap gap-2">
            <Link
              to="/machinery?publish=1"
              className="inline-flex items-center gap-1.5 rounded-[10px] border border-line bg-white px-4 py-2.5 text-[12.5px] font-medium text-forest transition hover:border-moss/50"
            >
              <Plus size={14} /> 发布农机服务
            </Link>
            <Link
              to="/user/bookings"
              className="inline-flex items-center gap-1.5 rounded-[10px] border border-forest bg-forest px-4 py-2.5 text-[12.5px] font-medium text-cream transition hover:bg-forest-950"
            >
              我的预约
            </Link>
          </div>
        }
        meta={
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[11.5px] text-muted">
            <span>在库资源 12 台/套</span>
            <span>覆盖 8 类作业机具</span>
            <span>平均响应 2 小时</span>
          </div>
        }
      />

      <section className="shell py-8 lg:py-10">
        <div className="grid gap-6 lg:grid-cols-[248px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-[92px] rounded-panel border border-line bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-1.5 text-[13.5px] font-semibold text-forest">
                  <SlidersHorizontal size={13} /> 筛选条件
                </h3>
                <button onClick={reset} className="text-[11px] text-moss hover:text-forest">
                  清空
                </button>
              </div>
              {filters}
            </div>
          </aside>

          <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFilterOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-2 text-[12.5px] text-forest lg:hidden"
                >
                  <SlidersHorizontal size={13} /> 筛选
                </button>
                <p className="text-[12.5px] text-muted">
                  {loading ? '正在加载…' : `共 ${data?.total ?? 0} 条农机资源`}
                  {category !== 'all' && <span className="ml-1 text-forest">· {MACHINERY_LABEL[category]}</span>}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden text-[12px] text-muted sm:inline">排序</span>
                <Select value={sort} onChange={(e) => setSort(e.target.value)} className="h-9 w-[124px] py-0 text-[12.5px]">
                  <option value="latest">综合推荐</option>
                  <option value="price-asc">价格从低到高</option>
                  <option value="price-desc">价格从高到低</option>
                  <option value="rating">评分优先</option>
                </Select>
              </div>
            </div>

            {loading && (
              <div className="grid gap-4 sm:grid-cols-2">
                {[0, 1, 2, 3].map((i) => (
                  <CardSkeleton key={i} rows={2} />
                ))}
              </div>
            )}

            {!loading && error && <ErrorState message={error} onRetry={reload} />}

            {!loading && !error && data && data.items.length === 0 && (
              <EmptyState
                title="没有符合条件的农机资源"
                description="尝试扩大服务区域，或取消价格限制与「仅看可预约」筛选。"
                action={
                  <Button variant="secondary" size="sm" onClick={reset}>
                    清除筛选
                  </Button>
                }
                icon={<Tractor size={22} strokeWidth={1.6} />}
              />
            )}

            {!loading && !error && data && data.items.length > 0 && (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  {data.items.map((m, i) => (
                    <Reveal key={m.id} delay={i * 50}>
                      <MachineryCard machine={m} />
                    </Reveal>
                  ))}
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
        {filters}
      </Drawer>
    </>
  )
}
