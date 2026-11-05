import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PackageSearch, Search, ShoppingCart, SlidersHorizontal, X } from 'lucide-react'
import { PageHero } from '../components/ui/Layout'
import { Button } from '../components/ui/Button'
import { Field, Input, Select } from '../components/ui/Form'
import { Drawer } from '../components/ui/Modal'
import { Pagination } from '../components/ui/Pagination'
import { CardSkeleton, EmptyState, ErrorState } from '../components/ui/States'
import { Reveal } from '../components/ui/Reveal'
import { ProductCard } from '../components/shop/ProductCard'
import { ProductVisual } from '../components/ui/ProductVisual'
import { useAsync } from '../hooks/useAsync'
import { fetchProducts } from '../services/products'
import { PRODUCT_CATEGORY_LABEL, PRODUCT_CATEGORY_OPTIONS } from '../lib/constants'
import type { ProductCategory } from '../types'
import { useCartStore } from '../store/cartStore'
import { cn } from '../lib/utils'
import { PRODUCTS } from '../data/products'

const PAGE_SIZE = 8

const CATEGORY_GLYPH: Record<ProductCategory, 'seed' | 'fertilizer' | 'spray' | 'film' | 'equipment' | 'irrigation' | 'tool'> = {
  seed: 'seed',
  fertilizer: 'fertilizer',
  pesticide: 'spray',
  film: 'film',
  equipment: 'equipment',
  irrigation: 'irrigation',
  tool: 'tool',
}

export default function Shop() {
  const cart = useCartStore((s) => s.items)
  const [category, setCategory] = useState<ProductCategory | 'all'>('all')
  const [keyword, setKeyword] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [sort, setSort] = useState('sales')
  const [inStock, setInStock] = useState(false)
  const [page, setPage] = useState(1)
  const [filterOpen, setFilterOpen] = useState(false)

  const query = useMemo(
    () => ({
      category,
      keyword,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      sort: sort as 'latest' | 'price-asc' | 'price-desc' | 'sales',
      inStock,
      page,
      pageSize: PAGE_SIZE,
    }),
    [category, keyword, minPrice, maxPrice, sort, inStock, page],
  )

  const { data, loading, error, reload } = useAsync(() => fetchProducts(query), [query])
  const cartCount = cart.reduce((s, i) => s + i.qty, 0)

  const reset = () => {
    setCategory('all')
    setKeyword('')
    setMinPrice('')
    setMaxPrice('')
    setInStock(false)
    setPage(1)
  }

  const filters = (
    <div className="space-y-5">
      <Field label="商品分类">
        <div className="space-y-1">
          <button
            onClick={() => {
              setCategory('all')
              setPage(1)
            }}
            className={cn(
              'flex w-full items-center justify-between rounded-lg px-3 py-2 text-[12.5px] transition',
              category === 'all' ? 'bg-forest text-cream' : 'text-ink/70 hover:bg-sand/60',
            )}
          >
            全部商品
            <span className="num text-[10.5px] opacity-70">{PRODUCTS.length}</span>
          </button>
          {PRODUCT_CATEGORY_OPTIONS.map((c) => (
            <button
              key={c.value}
              onClick={() => {
                setCategory(c.value)
                setPage(1)
              }}
              className={cn(
                'flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-[12.5px] transition',
                category === c.value ? 'bg-forest text-cream' : 'text-ink/70 hover:bg-sand/60',
              )}
            >
              <span className="flex items-center gap-2">
                <span
                  className={cn(
                    'flex h-5 w-5 items-center justify-center overflow-hidden rounded',
                    category === c.value ? 'opacity-90' : 'opacity-100',
                  )}
                >
                  <ProductVisual glyph={CATEGORY_GLYPH[c.value]} size="xs" showLabel={false} className="h-5 w-5 rounded" />
                </span>
                {c.label}
              </span>
              <span className="num text-[10.5px] opacity-70">
                {PRODUCTS.filter((p) => p.category === c.value).length}
              </span>
            </button>
          ))}
        </div>
      </Field>

      <Field label="价格区间">
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

      <label className="flex cursor-pointer items-center gap-2 text-[12.5px] text-ink/75">
        <input
          type="checkbox"
          checked={inStock}
          onChange={(e) => {
            setInStock(e.target.checked)
            setPage(1)
          }}
          className="h-4 w-4 accent-[#173D32]"
        />
        仅看有货商品
      </label>

      <div className="flex gap-2">
        <Button variant="secondary" size="sm" block onClick={reset}>
          重置筛选
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
        eyebrow="Agri Supply Store · 农资商城"
        title="把规格、登记与库存写清楚的农资采购"
        description="种子种苗、化肥肥料、农药植保、农膜地膜、农业设备、灌溉设施与农业工具，7 大品类，支持购物车、地址管理与订单跟踪。"
        breadcrumb={[{ label: '农资商城' }]}
        action={
          <div className="flex flex-wrap gap-2">
            <Link
              to="/cart"
              className="inline-flex items-center gap-1.5 rounded-[10px] border border-line bg-white px-4 py-2.5 text-[12.5px] font-medium text-forest transition hover:border-moss/50"
            >
              <ShoppingCart size={14} /> 购物车
              {cartCount > 0 && (
                <span className="num flex h-4 min-w-4 items-center justify-center rounded-full bg-forest px-1 text-[9px] text-cream">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link
              to="/user/orders"
              className="inline-flex items-center gap-1.5 rounded-[10px] border border-forest bg-forest px-4 py-2.5 text-[12.5px] font-medium text-cream transition hover:bg-forest-950"
            >
              我的订单
            </Link>
          </div>
        }
        meta={
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[11.5px] text-muted">
            <span>{PRODUCTS.length} 款在售商品</span>
            <span>7 大品类</span>
            <span>持证供应商</span>
            <span>模拟下单流程</span>
          </div>
        }
      />

      <section className="shell py-8 lg:py-10">
        <div className="grid gap-6 lg:grid-cols-[248px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-[92px] rounded-panel border border-line bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-1.5 text-[13.5px] font-semibold text-forest">
                  <SlidersHorizontal size={13} /> 商品筛选
                </h3>
                <button onClick={reset} className="text-[11px] text-moss hover:text-forest">
                  清空
                </button>
              </div>
              {filters}
            </div>
          </aside>

          <div>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:max-w-sm">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  value={keyword}
                  onChange={(e) => {
                    setKeyword(e.target.value)
                    setPage(1)
                  }}
                  placeholder="搜索商品名称、供应商或规格"
                  className="field pl-9 pr-9"
                />
                {keyword && (
                  <button
                    onClick={() => setKeyword('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-forest"
                    aria-label="清空"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFilterOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-2 text-[12.5px] text-forest lg:hidden"
                >
                  <SlidersHorizontal size={13} /> 筛选
                </button>
                <Select value={sort} onChange={(e) => setSort(e.target.value)} className="h-9 w-[128px] py-0 text-[12.5px]">
                  <option value="sales">销量优先</option>
                  <option value="price-asc">价格从低到高</option>
                  <option value="price-desc">价格从高到低</option>
                  <option value="latest">最新上架</option>
                </Select>
              </div>
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-2 text-[11.5px] text-muted">
              <span>
                {loading ? '正在加载…' : `共 ${data?.total ?? 0} 款商品`}
                {category !== 'all' && <span className="ml-1 text-forest">· {PRODUCT_CATEGORY_LABEL[category]}</span>}
              </span>
              {keyword && <span className="text-forest">· 关键词「{keyword}」</span>}
            </div>

            {loading && (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <CardSkeleton key={i} rows={2} />
                ))}
              </div>
            )}

            {!loading && error && <ErrorState message={error} onRetry={reload} />}

            {!loading && !error && data && data.items.length === 0 && (
              <EmptyState
                title="没有找到相关商品"
                description="试试更换关键词或分类，也可以清除价格区间后重新筛选。"
                action={
                  <Button variant="secondary" size="sm" onClick={reset}>
                    清除筛选
                  </Button>
                }
                icon={<PackageSearch size={22} strokeWidth={1.6} />}
              />
            )}

            {!loading && !error && data && data.items.length > 0 && (
              <>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {data.items.map((p, i) => (
                    <Reveal key={p.id} delay={i * 40}>
                      <ProductCard product={p} />
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

            <div className="mt-6 rounded-panel border border-line bg-sand/30 p-5">
              <h3 className="text-[12.5px] font-semibold text-forest">采购提示</h3>
              <p className="mt-2 text-[11.5px] leading-relaxed text-muted">
                农药、肥料等商品请核对登记证号、适用作物与安全间隔期；种子需确认审定编号与适宜区域。
                本商城为演示环境，下单流程为模拟流程，不涉及真实支付与发货。
              </p>
            </div>
          </div>
        </div>
      </section>

      <Drawer open={filterOpen} onClose={() => setFilterOpen(false)} title="商品筛选" side="bottom">
        {filters}
      </Drawer>
    </>
  )
}
