import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  BadgeCheck,
  Check,
  ChevronRight,
  Info,
  ShieldCheck,
  ShoppingCart,
  Truck,
  Warehouse,
} from 'lucide-react'
import { Breadcrumb } from '../components/ui/Layout'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { QuantityStepper } from '../components/ui/Form'
import { ProductVisual } from '../components/ui/ProductVisual'
import { Rating } from '../components/ui/Indicators'
import { Tabs } from '../components/ui/Tabs'
import { CardSkeleton, NotFoundState } from '../components/ui/States'
import { useAsync } from '../hooks/useAsync'
import { fetchProductById, fetchRelatedProducts } from '../services/products'
import { PRODUCT_CATEGORY_LABEL } from '../lib/constants'
import { useCartStore } from '../store/cartStore'
import { toast } from '../store/uiStore'
import { cn, fmtNumber } from '../lib/utils'
import { ProductCard } from '../components/shop/ProductCard'

const GALLERY_LABELS = ['正面', '规格标识', '包装示意']

export default function ProductDetail() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const add = useCartStore((s) => s.add)
  const { data, loading, error, reload } = useAsync(() => fetchProductById(id), [id])
  const { data: related } = useAsync(() => fetchRelatedProducts(id), [id])

  const [spec, setSpec] = useState('')
  const [qty, setQty] = useState(1)
  const [active, setActive] = useState(0)
  const [tab, setTab] = useState('detail')

  if (loading) {
    return (
      <div className="shell py-12">
        <CardSkeleton rows={5} />
      </div>
    )
  }
  if (error || !data) {
    return (
      <div className="shell py-20">
        <NotFoundState onBack={() => navigate(-1)} />
        {error && (
          <div className="mt-4 text-center">
            <Button variant="secondary" size="sm" onClick={reload}>
              重新加载
            </Button>
          </div>
        )}
      </div>
    )
  }

  const chosenSpec = spec || data.spec
  const stockState = data.stock > 200 ? '库存充足' : data.stock > 0 ? '库存紧张' : '暂时缺货'

  return (
    <>
      <section className="border-b border-line/70 bg-cream">
        <div className="shell py-5">
          <Breadcrumb
            items={[
              { label: '农资商城', to: '/shop' },
              { label: PRODUCT_CATEGORY_LABEL[data.category], to: `/shop?category=${data.category}` },
              { label: data.name },
            ]}
          />
        </div>
      </section>

      <section className="shell py-8 lg:py-10">
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <div className="overflow-hidden rounded-panel border border-line bg-white p-3 shadow-card">
              <ProductVisual
                glyph={data.glyph}
                size="lg"
                className="h-[340px] w-full rounded-xl sm:h-[420px]"
                index={`${String(active + 1).padStart(2, '0')} / 03`}
              />
              <div className="mt-3 grid grid-cols-3 gap-3">
                {GALLERY_LABELS.map((label, i) => (
                  <button
                    key={label}
                    onClick={() => setActive(i)}
                    className={cn(
                      'group overflow-hidden rounded-lg border text-left transition',
                      active === i ? 'border-forest' : 'border-line hover:border-moss/40',
                    )}
                  >
                    <ProductVisual
                      glyph={data.glyph}
                      size="sm"
                      className="h-[76px] w-full"
                      showLabel={false}
                      index={`0${i + 1}`}
                    />
                    <span className="flex items-center justify-between px-2 py-1.5 text-[10.5px] text-muted">
                      {label}
                      {active === i && <Check size={10} className="text-moss" />}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <p className="mt-2 flex items-center gap-1.5 text-[10.5px] text-muted">
              <Info size={11} /> 商品图为平台统一视觉示意，实际包装以到货为准
            </p>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-panel border border-line bg-white p-5 shadow-card lg:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="sage">{PRODUCT_CATEGORY_LABEL[data.category]}</Badge>
                {data.tags.slice(0, 2).map((t) => (
                  <Badge key={t} tone="neutral">
                    {t}
                  </Badge>
                ))}
              </div>

              <h1 className="mt-3 text-[24px] font-semibold leading-snug text-forest lg:text-[26px]">{data.name}</h1>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11.5px] text-muted">
                <Rating value={data.rating} showValue />
                <span className="num">已售 {fmtNumber(data.sales)}</span>
                <span className="num">库存 {fmtNumber(data.stock)}</span>
                <span>{stockState}</span>
              </div>

              <div className="mt-4 rounded-xl border border-line bg-sand/25 px-4 py-4">
                <p className="num flex items-baseline gap-1.5">
                  <span className="text-[15px] text-forest">￥</span>
                  <span className="text-[30px] font-semibold leading-none text-forest">{fmtNumber(data.price)}</span>
                  <span className="text-[12px] text-muted">/ {data.unit}</span>
                  {data.originalPrice && (
                    <span className="num ml-2 text-[12px] text-muted line-through">￥{fmtNumber(data.originalPrice)}</span>
                  )}
                </p>
                <p className="mt-1.5 text-[11.5px] text-muted">参考规格 {data.spec} · 价格不含运费</p>
              </div>

              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-[12.5px] font-medium text-forest">规格选择</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {data.specs.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSpec(s)}
                        className={cn(
                          'rounded-lg border px-3 py-2 text-[12px] transition',
                          chosenSpec === s
                            ? 'border-forest bg-forest/[0.05] text-forest'
                            : 'border-line text-ink/70 hover:border-moss/40',
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-[12.5px] font-medium text-forest">购买数量</p>
                  <QuantityStepper value={qty} onChange={setQty} max={Math.max(1, data.stock)} />
                </div>

                <div className="flex items-center justify-between rounded-lg bg-sand/40 px-3.5 py-2.5 text-[12px]">
                  <span className="text-muted">小计</span>
                  <span className="num text-[16px] font-semibold text-forest">￥{fmtNumber(data.price * qty)}</span>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="flex-1"
                    onClick={() => {
                      add(data.id, qty, chosenSpec)
                      toast.success('已加入购物车', `${data.name} · ${chosenSpec} × ${qty}`)
                    }}
                    iconLeft={<ShoppingCart size={15} />}
                    disabled={data.stock <= 0}
                  >
                    加入购物车
                  </Button>
                  <Button
                    size="lg"
                    className="flex-1"
                    disabled={data.stock <= 0}
                    onClick={() => navigate(`/checkout?mode=buy&id=${data.id}&spec=${encodeURIComponent(chosenSpec)}&qty=${qty}`)}
                  >
                    立即购买
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1">
                  {[
                    { icon: Truck, t: '48 小时内发货', d: '演示说明' },
                    { icon: ShieldCheck, t: '正品保障', d: '持证供应商' },
                    { icon: Warehouse, t: '规格齐全', d: '可开票' },
                  ].map((item) => (
                    <div key={item.t} className="rounded-lg border border-line/80 px-2.5 py-2 text-center">
                      <item.icon size={14} className="mx-auto text-moss" />
                      <p className="mt-1 text-[10.5px] font-medium text-forest">{item.t}</p>
                      <p className="mt-0.5 text-[9.5px] text-muted">{item.d}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 border-t border-line/70 pt-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-moss/10 text-[12px] font-medium text-moss">
                    {data.supplier.slice(0, 1)}
                  </span>
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 text-[12.5px] font-medium text-forest">
                      <span className="truncate">{data.supplier}</span>
                      <BadgeCheck size={13} className="shrink-0 text-moss" />
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted">{data.supplierType}</p>
                  </div>
                  <Link
                    to={`/shop?keyword=${encodeURIComponent(data.supplier.slice(0, 4))}`}
                    className="ml-auto flex shrink-0 items-center gap-0.5 text-[11px] text-moss hover:text-forest"
                  >
                    进店 <ChevronRight size={11} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-panel border border-line bg-white p-5 lg:p-6">
          <Tabs
            value={tab}
            onChange={setTab}
            items={[
              { value: 'detail', label: '商品介绍' },
              { value: 'params', label: '详细参数' },
              { value: 'scope', label: '适用范围' },
            ]}
          />
          <div className="pt-5">
            {tab === 'detail' && (
              <div className="max-w-3xl">
                <p className="text-[13px] leading-[2] text-ink/75">{data.intro}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {data.tags.map((t) => (
                    <span key={t} className="rounded-full border border-line bg-sand/40 px-2.5 py-1 text-[11px] text-ink/70">
                      {t}
                    </span>
                  ))}
                </div>
                {data.registration && (
                  <p className="mt-4 flex items-start gap-1.5 rounded-lg border border-clay/25 bg-clay/[0.06] px-3 py-2 text-[11.5px] text-[#7C5320]">
                    <ShieldCheck size={12} className="mt-0.5 shrink-0" />
                    {data.registration}；使用前请核对标签登记作物、剂量与安全间隔期。
                  </p>
                )}
              </div>
            )}
            {tab === 'params' && (
              <dl className="grid max-w-3xl gap-x-10 gap-y-0 sm:grid-cols-2">
                {data.params.map((p) => (
                  <div key={p.label} className="flex items-baseline justify-between gap-4 border-b border-line/60 py-2.5">
                    <dt className="text-[12px] text-muted">{p.label}</dt>
                    <dd className="text-right text-[12.5px] text-ink/85">{p.value}</dd>
                  </div>
                ))}
              </dl>
            )}
            {tab === 'scope' && (
              <ul className="max-w-3xl space-y-2">
                {data.scope.map((s) => (
                  <li key={s} className="flex items-start gap-2 text-[12.5px] leading-relaxed text-ink/75">
                    <Check size={13} className="mt-0.5 shrink-0 text-moss" />
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {related && related.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <h2 className="text-[16px] font-semibold text-forest">同品类商品</h2>
              <Link to="/shop" className="text-[12px] text-moss hover:text-forest">
                浏览更多
              </Link>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} visualHeight="h-[132px]" />
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  )
}
