import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Package, Receipt, Truck } from 'lucide-react'
import { UserEmpty, UserPageHeader } from './UserLayout'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Tabs } from '../../components/ui/Tabs'
import { Modal } from '../../components/ui/Modal'
import { ConfirmDialog } from '../../components/ui/Modal'
import { ProductVisual } from '../../components/ui/ProductVisual'
import { useOrderStore, simulateOrderFlow } from '../../store/orderStore'
import { toast } from '../../store/uiStore'
import { ORDER_STATUS_LABEL } from '../../lib/constants'
import { cn, fmtDate, fmtNumber } from '../../lib/utils'
import type { Order, OrderStatus } from '../../types'

const TONE: Record<OrderStatus, 'green' | 'amber' | 'neutral' | 'red' | 'sage'> = {
  pending: 'amber',
  paid: 'sage',
  shipped: 'green',
  completed: 'neutral',
  cancelled: 'red',
}

const FILTERS: { value: OrderStatus | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: '待付款' },
  { value: 'paid', label: '待发货' },
  { value: 'shipped', label: '待收货' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' },
]

export default function UserOrders() {
  const orders = useOrderStore((s) => s.orders)
  const cancel = useOrderStore((s) => s.cancel)
  const confirmReceipt = useOrderStore((s) => s.confirmReceipt)
  const remove = useOrderStore((s) => s.remove)
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all')
  const [detail, setDetail] = useState<Order | null>(null)
  const [removeTarget, setRemoveTarget] = useState<string | null>(null)

  const items = filter === 'all' ? orders : orders.filter((o) => o.status === filter)

  return (
    <div>
      <UserPageHeader
        title="我的订单"
        description="订单在本地生成与流转，演示环境不接入真实支付与物流。"
        action={
          <Link to="/shop" className="text-[12px] text-moss hover:text-forest">
            继续采购 →
          </Link>
        }
      />

      <Tabs
        value={filter}
        onChange={(v) => setFilter(v as OrderStatus | 'all')}
        items={FILTERS.map((f) => ({
          value: f.value,
          label: f.label,
          count: f.value === 'all' ? orders.length : orders.filter((o) => o.status === f.value).length,
        }))}
      />

      <div className="mt-4 space-y-3">
        {items.length === 0 && (
          <UserEmpty
            title={orders.length === 0 ? '还没有订单' : '该状态下没有订单'}
            description="在农资商城选择商品并提交订单后，会在这里跟踪状态。"
            action={
              <Link to="/shop" className="rounded-lg bg-forest px-4 py-2 text-[12px] text-cream">
                去选购
              </Link>
            }
          />
        )}

        {items.map((o) => (
          <article key={o.id} className="overflow-hidden rounded-panel border border-line bg-white">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line/60 bg-sand/20 px-4 py-2.5">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10.5px] text-muted">
                <span className="num">订单号 {o.id}</span>
                <span className="num">{fmtDate(o.createdAt, true)}</span>
                <span className="rounded border border-clay/30 bg-clay/[0.08] px-1.5 py-0.5 text-[9px] text-[#94601F]">
                  模拟订单
                </span>
              </div>
              <Badge tone={TONE[o.status]}>{ORDER_STATUS_LABEL[o.status]}</Badge>
            </div>

            <div className="divide-y divide-line/50">
              {o.items.map((it) => (
                <div key={`${it.productId}-${it.spec}`} className="flex items-center gap-3 px-4 py-3">
                  <ProductVisual glyph={it.glyph} size="sm" className="h-14 w-14 shrink-0 rounded-lg" />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-[12.5px] font-medium text-forest">{it.name}</p>
                    <p className="mt-0.5 text-[10.5px] text-muted">
                      {it.spec} · ￥{fmtNumber(it.price)}/{it.unit}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="num text-[12px] text-muted">× {it.qty}</p>
                    <p className="num text-[12.5px] font-medium text-forest">￥{fmtNumber(it.price * it.qty)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line/60 px-4 py-3">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10.5px] text-muted">
                <span className="flex items-center gap-1">
                  <MapPin size={10} /> {o.address.region} {o.address.detail}
                </span>
                <span className="flex items-center gap-1">
                  <Truck size={10} /> {o.freight === 0 ? '免运费' : `运费 ￥${o.freight}`}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="num mr-1 text-[11.5px] text-muted">
                  合计 <span className="text-[16px] font-semibold text-forest">￥{fmtNumber(o.total)}</span>
                </p>
                <button
                  onClick={() => setDetail(o)}
                  className="rounded-lg border border-line px-2.5 py-1.5 text-[11px] text-forest transition hover:border-moss/50"
                >
                  订单详情
                </button>
                {o.status === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        cancel(o.id)
                        toast.info('订单已取消')
                      }}
                      className="rounded-lg border border-line px-2.5 py-1.5 text-[11px] text-muted transition hover:text-[#A63E28]"
                    >
                      取消订单
                    </button>
                    <button
                      onClick={() => {
                        simulateOrderFlow(o.id)
                        toast.success('模拟支付完成', '演示环境不会产生真实扣款，订单已进入待发货')
                      }}
                      className="rounded-lg border border-forest bg-forest px-3 py-1.5 text-[11px] text-cream"
                    >
                      模拟支付
                    </button>
                  </>
                )}
                {o.status === 'shipped' && (
                  <button
                    onClick={() => {
                      confirmReceipt(o.id)
                      toast.success('已确认收货', '订单已完成')
                    }}
                    className="rounded-lg border border-forest bg-forest px-3 py-1.5 text-[11px] text-cream"
                  >
                    确认收货
                  </button>
                )}
                {(o.status === 'completed' || o.status === 'cancelled') && (
                  <button
                    onClick={() => setRemoveTarget(o.id)}
                    className="rounded-lg border border-line px-2.5 py-1.5 text-[11px] text-muted transition hover:text-[#A63E28]"
                  >
                    删除记录
                  </button>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        title="订单详情"
        size="md"
        footer={
          <Button variant="secondary" size="sm" onClick={() => setDetail(null)}>
            关闭
          </Button>
        }
      >
        {detail && (
          <div className="space-y-4">
            <div className="rounded-lg border border-line bg-sand/25 px-3.5 py-3 text-[11.5px]">
              <p className="flex justify-between">
                <span className="text-muted">订单号</span>
                <span className="num text-forest">{detail.id}</span>
              </p>
              <p className="mt-1.5 flex justify-between">
                <span className="text-muted">下单时间</span>
                <span className="num text-forest">{fmtDate(detail.createdAt, true)}</span>
              </p>
              <p className="mt-1.5 flex justify-between">
                <span className="text-muted">订单状态</span>
                <span className="text-forest">{ORDER_STATUS_LABEL[detail.status]}</span>
              </p>
              {detail.paidAt && (
                <p className="mt-1.5 flex justify-between">
                  <span className="text-muted">模拟支付时间</span>
                  <span className="num text-forest">{fmtDate(detail.paidAt, true)}</span>
                </p>
              )}
            </div>

            <div>
              <p className="flex items-center gap-1.5 text-[12px] font-medium text-forest">
                <Receipt size={12} /> 商品清单
              </p>
              <div className="mt-2 space-y-2">
                {detail.items.map((it) => (
                  <div key={`${it.productId}-${it.spec}`} className="flex items-center justify-between gap-3 text-[11.5px]">
                    <span className="min-w-0 truncate text-ink/75">
                      {it.name} <span className="text-muted">× {it.qty}</span>
                    </span>
                    <span className="num shrink-0 text-forest">￥{fmtNumber(it.price * it.qty)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="flex items-center gap-1.5 text-[12px] font-medium text-forest">
                <Package size={12} /> 收货信息
              </p>
              <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink/75">
                {detail.address.name} {detail.address.phone}
                <br />
                {detail.address.region} {detail.address.detail}
              </p>
            </div>

            {detail.remark && (
              <div>
                <p className="text-[12px] font-medium text-forest">订单备注</p>
                <p className="mt-1 text-[11.5px] text-ink/70">{detail.remark}</p>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-line/70 pt-3">
              <span className="text-[11.5px] text-muted">商品 ￥{fmtNumber(detail.total - detail.freight)} + 运费 ￥{fmtNumber(detail.freight)}</span>
              <span className={cn('num text-[16px] font-semibold text-forest')}>￥{fmtNumber(detail.total)}</span>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        onConfirm={() => {
          if (!removeTarget) return
          remove(removeTarget)
          toast.success('订单记录已删除')
        }}
        title="删除订单记录"
        description="删除后该订单将从列表中移除，无法恢复。"
      />
    </div>
  )
}
