import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, ShoppingCart, Trash2 } from 'lucide-react'
import { Breadcrumb } from '../components/ui/Layout'
import { Button } from '../components/ui/Button'
import { QuantityStepper } from '../components/ui/Form'
import { ProductVisual } from '../components/ui/ProductVisual'
import { EmptyState } from '../components/ui/States'
import { ConfirmDialog } from '../components/ui/Modal'
import { PRODUCT_MAP } from '../data/products'
import { useCartStore, cartKey } from '../store/cartStore'
import { toast } from '../store/uiStore'
import { cn, fmtNumber } from '../lib/utils'
import { PRODUCT_CATEGORY_LABEL } from '../lib/constants'

export default function Cart() {
  const items = useCartStore((s) => s.items)
  const setQty = useCartStore((s) => s.setQty)
  const remove = useCartStore((s) => s.remove)
  const clear = useCartStore((s) => s.clear)
  const navigate = useNavigate()

  const [selected, setSelected] = useState<string[]>(() => items.map((i) => cartKey(i.productId, i.spec)))
  const [confirmClear, setConfirmClear] = useState(false)
  const [removeTarget, setRemoveTarget] = useState<{ productId: string; spec: string; name: string } | null>(null)

  const rows = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        key: cartKey(item.productId, item.spec),
        product: PRODUCT_MAP.get(item.productId),
      })),
    [items],
  )

  const validRows = rows.filter((r) => r.product)
  const selectedRows = validRows.filter((r) => selected.includes(r.key))
  const amount = selectedRows.reduce((sum, r) => sum + (r.product?.price ?? 0) * r.qty, 0)
  const freight = amount === 0 || amount >= 500 ? 0 : 18
  const count = selectedRows.reduce((sum, r) => sum + r.qty, 0)

  const allSelected = validRows.length > 0 && selected.length === validRows.length
  const toggleAll = () => setSelected(allSelected ? [] : validRows.map((r) => r.key))
  const toggleOne = (key: string) =>
    setSelected((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]))

  return (
    <>
      <section className="border-b border-line/70 bg-cream">
        <div className="shell py-6">
          <Breadcrumb items={[{ label: '农资商城', to: '/shop' }, { label: '购物车' }]} />
          <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="eyebrow">Cart · 购物车</p>
              <h1 className="mt-2 text-display-sm font-semibold text-forest">购物车</h1>
            </div>
            <p className="text-[12px] text-muted">
              共 {validRows.length} 种商品 · 已选 {count} 件
            </p>
          </div>
        </div>
      </section>

      <section className="shell py-8 lg:py-10">
        {validRows.length === 0 ? (
          <EmptyState
            title="购物车还是空的"
            description="去农资商城看看种子、肥料、农药与设备，加入购物车后可合并结算。"
            icon={<ShoppingCart size={22} strokeWidth={1.6} />}
            action={
              <Link
                to="/shop"
                className="inline-flex items-center gap-1.5 rounded-[10px] border border-forest bg-forest px-4 py-2.5 text-[12.5px] font-medium text-cream transition hover:bg-forest-950"
              >
                去选购商品 <ArrowRight size={13} />
              </Link>
            }
          />
        ) : (
          <div className="grid gap-5 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <div className="overflow-hidden rounded-panel border border-line bg-white">
                <div className="flex items-center justify-between border-b border-line/70 px-5 py-3.5">
                  <label className="flex cursor-pointer items-center gap-2.5 text-[12.5px] text-ink/75">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      className="h-4 w-4 accent-[#173D32]"
                    />
                    全选
                  </label>
                  <button
                    onClick={() => setConfirmClear(true)}
                    className="text-[11.5px] text-muted transition hover:text-[#A63E28]"
                  >
                    清空购物车
                  </button>
                </div>

                <div className="divide-y divide-line/60">
                  {validRows.map((row) => {
                    const p = row.product!
                    return (
                      <div key={row.key} className="flex gap-3 p-4 sm:gap-4 sm:p-5">
                        <input
                          type="checkbox"
                          checked={selected.includes(row.key)}
                          onChange={() => toggleOne(row.key)}
                          className="mt-6 h-4 w-4 shrink-0 accent-[#173D32]"
                          aria-label={`选择 ${p.name}`}
                        />
                        <Link to={`/shop/${p.id}`} className="shrink-0">
                          <ProductVisual glyph={p.glyph} size="md" className="h-[76px] w-[76px] rounded-lg sm:h-[88px] sm:w-[88px]" />
                        </Link>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <Link to={`/shop/${p.id}`}>
                                <h3 className="line-clamp-1 text-[13.5px] font-medium text-forest hover:text-moss">{p.name}</h3>
                              </Link>
                              <p className="mt-0.5 text-[11px] text-muted">
                                {PRODUCT_CATEGORY_LABEL[p.category]} · {row.spec}
                              </p>
                              <p className="mt-1 line-clamp-1 text-[10.5px] text-muted/80">{p.supplier}</p>
                            </div>
                            <button
                              onClick={() => setRemoveTarget({ productId: p.id, spec: row.spec, name: p.name })}
                              className="shrink-0 rounded p-1 text-muted/50 transition hover:text-[#A63E28]"
                              aria-label="删除商品"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>

                          <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <QuantityStepper
                                value={row.qty}
                                onChange={(v) => setQty(p.id, row.spec, v)}
                                max={Math.max(1, p.stock)}
                                size="sm"
                              />
                              <span className="num text-[11.5px] text-muted">￥{fmtNumber(p.price)}/{p.unit}</span>
                            </div>
                            <p className="num text-[16px] font-semibold text-forest">
                              ￥{fmtNumber(p.price * row.qty)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-panel border border-line bg-white px-5 py-4">
                <Link to="/shop" className="text-[12.5px] text-moss transition hover:text-forest">
                  ← 继续选购
                </Link>
                <p className="text-[11.5px] text-muted">满 ￥500 免运费（演示规则）</p>
              </div>
            </div>

            <aside className="lg:col-span-4">
              <div className="sticky top-[92px] rounded-panel border border-line bg-white p-5 shadow-card">
                <h2 className="text-[14px] font-semibold text-forest">结算明细</h2>
                <dl className="mt-4 space-y-2.5 text-[12.5px]">
                  <div className="flex justify-between">
                    <dt className="text-muted">商品件数</dt>
                    <dd className="num text-ink/80">{count} 件</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted">商品总额</dt>
                    <dd className="num text-ink/80">￥{fmtNumber(amount)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted">运费</dt>
                    <dd className="num text-ink/80">{freight === 0 ? '免运费' : `￥${fmtNumber(freight)}`}</dd>
                  </div>
                  <div className="flex items-baseline justify-between border-t border-line/70 pt-3">
                    <dt className="text-[12.5px] text-muted">应付合计</dt>
                    <dd className="num text-[24px] font-semibold text-forest">￥{fmtNumber(amount + freight)}</dd>
                  </div>
                </dl>

                <Button
                  block
                  size="lg"
                  className="mt-5"
                  disabled={selectedRows.length === 0}
                  onClick={() => {
                    if (selectedRows.length === 0) return
                    sessionStorage.setItem('agrilink:checkout-keys', JSON.stringify(selected))
                    navigate('/checkout')
                  }}
                >
                  去结算（{count}）
                </Button>
                <p className="mt-3 text-center text-[10.5px] leading-relaxed text-muted">
                  演示环境：下单为模拟流程，不涉及真实支付
                </p>

                <div className="mt-4 space-y-1.5 border-t border-line/70 pt-3 text-[10.5px] text-muted">
                  <p className={cn('flex items-center gap-1.5')}>
                    <span className="h-1 w-1 rounded-full bg-sage" /> 支持修改数量与规格
                  </p>
                  <p className="flex items-center gap-1.5">
                    <span className="h-1 w-1 rounded-full bg-sage" /> 购物车数据保存在本机浏览器
                  </p>
                </div>
              </div>
            </aside>
          </div>
        )}
      </section>

      <ConfirmDialog
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        onConfirm={() => {
          clear()
          setSelected([])
          toast.info('购物车已清空')
        }}
        title="清空购物车"
        description="将移除购物车中的全部商品，此操作无法撤销。"
        confirmLabel="清空"
      />

      <ConfirmDialog
        open={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        onConfirm={() => {
          if (!removeTarget) return
          remove(removeTarget.productId, removeTarget.spec)
          setSelected((prev) => prev.filter((k) => k !== cartKey(removeTarget.productId, removeTarget.spec)))
          toast.success('已移除商品', removeTarget.name)
        }}
        title="移除该商品"
        description={removeTarget ? `${removeTarget.name}（${removeTarget.spec}）将从购物车中移除。` : ''}
        confirmLabel="移除"
      />
    </>
  )
}
