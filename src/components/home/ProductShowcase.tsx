import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'
import { PRODUCTS } from '../../data/products'
import { PRODUCT_CATEGORY_OPTIONS } from '../../lib/constants'
import type { ProductCategory } from '../../types'
import { SectionHeader } from '../ui/Layout'
import { ArrowLink } from '../ui/Button'
import { Reveal } from '../ui/Reveal'
import { ProductCard } from '../shop/ProductCard'
import { cn } from '../../lib/utils'

const CURATED = ['pd-01', 'pd-05', 'pd-14', 'pd-17']

export function ProductShowcase() {
  const [category, setCategory] = useState<ProductCategory | 'all'>('all')

  const items = useMemo(() => {
    if (category === 'all') return CURATED.map((id) => PRODUCTS.find((p) => p.id === id)!).filter(Boolean)
    return PRODUCTS.filter((p) => p.category === category).slice(0, 4)
  }, [category])

  return (
    <section className="border-y border-line/70 bg-white/60 py-16 lg:py-24">
      <div className="shell">
        <SectionHeader
          index="06 — 农资精选"
          title="投入品采购，规格与资质都写清楚"
          description="种子、化肥、农药、农膜、设备、灌溉与工具，按品类筛选，商品参数、登记信息与供应商一并展示。"
          action={<ArrowLink to="/shop">进入农资商城</ArrowLink>}
        />

        <div className="mt-8 flex flex-wrap gap-2">
          <button onClick={() => setCategory('all')} className={cn('chip', category === 'all' && 'chip-active')}>
            全部商品
          </button>
          {PRODUCT_CATEGORY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setCategory(opt.value)}
              className={cn('chip', category === opt.value && 'chip-active')}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((p, i) => (
            <Reveal key={p.id} delay={i * 60}>
              <ProductCard product={p} visualHeight="h-[158px]" />
            </Reveal>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-panel border border-line bg-sand/30 px-5 py-4">
          <div className="flex items-center gap-2.5 text-[12.5px] text-ink/70">
            <ShoppingCart size={15} className="text-moss" />
            支持购物车合并结算、收货地址管理与订单状态跟踪（演示环境为模拟下单流程）
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-forest transition hover:text-moss"
          >
            浏览全部 {PRODUCTS.length} 款商品 →
          </Link>
        </div>
      </div>
    </section>
  )
}
