import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import type { Product } from '../../types'
import { PRODUCT_CATEGORY_LABEL } from '../../lib/constants'
import { ProductVisual } from '../ui/ProductVisual'
import { useCartStore } from '../../store/cartStore'
import { toast } from '../../store/uiStore'
import { cn, fmtNumber } from '../../lib/utils'

export function ProductCard({
  product,
  className,
  visualHeight = 'h-[152px]',
  showSales = true,
}: {
  product: Product
  className?: string
  visualHeight?: string
  showSales?: boolean
}) {
  const add = useCartStore((s) => s.add)

  return (
    <article
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-panel border border-line bg-white transition-all duration-500 hover:-translate-y-0.5 hover:border-moss/40 hover:shadow-card',
        className,
      )}
    >
      <Link to={`/shop/${product.id}`} className="relative block overflow-hidden">
        <ProductVisual
          glyph={product.glyph}
          size="lg"
          className={cn('w-full transition-transform duration-700 group-hover:scale-[1.02]', visualHeight)}
        />
        {product.originalPrice && (
          <span className="absolute right-2.5 top-2.5 rounded bg-[#B4452F] px-1.5 py-0.5 text-[9.5px] font-medium text-white shadow-sm">
            惠
          </span>
        )}
        {product.stock <= 100 && product.stock > 0 && (
          <span className="absolute left-2.5 top-2.5 rounded bg-white/85 px-1.5 py-0.5 text-[9.5px] text-[#9A6420] backdrop-blur">
            库存紧张
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted/70">
            {PRODUCT_CATEGORY_LABEL[product.category]}
          </span>
          {showSales && <span className="num text-[10px] text-muted">已售 {fmtNumber(product.sales)}</span>}
        </div>

        <Link to={`/shop/${product.id}`} className="mt-1.5">
          <h3 className="line-clamp-2 min-h-[38px] text-[13.5px] font-medium leading-snug text-forest transition group-hover:text-moss">
            {product.name}
          </h3>
        </Link>

        <p className="mt-1 line-clamp-1 text-[11px] text-muted">{product.spec}</p>

        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <p className="num text-[16px] font-semibold text-forest">
            <span className="text-[11px] font-normal">￥</span>
            {fmtNumber(product.price)}
            <span className="ml-0.5 text-[10px] font-normal text-muted">/{product.unit}</span>
          </p>
          <button
            onClick={() => {
              add(product.id, 1, product.spec)
              toast.success('已加入购物车', `${product.name} · ${product.spec}`)
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-forest transition hover:border-forest hover:bg-forest hover:text-cream"
            aria-label={`将${product.name}加入购物车`}
          >
            <Plus size={14} />
          </button>
        </div>
      </div>
    </article>
  )
}
