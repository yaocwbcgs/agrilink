import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle2, Info, MapPin, Plus, ShieldAlert, Truck } from 'lucide-react'
import { Breadcrumb } from '../components/ui/Layout'
import { Button } from '../components/ui/Button'
import { Field, Input, Textarea } from '../components/ui/Form'
import { Modal } from '../components/ui/Modal'
import { ProductVisual } from '../components/ui/ProductVisual'
import { EmptyState } from '../components/ui/States'
import { PRODUCT_MAP } from '../data/products'
import { useAuthStore } from '../store/authStore'
import { useCartStore, cartKey } from '../store/cartStore'
import { useOrderStore } from '../store/orderStore'
import { toast } from '../store/uiStore'
import { cn, fmtNumber, isPhone } from '../lib/utils'
import type { OrderItem } from '../types'

export default function Checkout() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const mode = params.get('mode')
  const user = useAuthStore((s) => s.user)
  const addresses = useAuthStore((s) => s.addresses)
  const addAddress = useAuthStore((s) => s.addAddress)
  const cartItems = useCartStore((s) => s.items)
  const removeByKeys = useCartStore((s) => s.removeByKeys)
  const createOrder = useOrderStore((s) => s.create)

  const buyNow = useMemo(() => {
    if (mode !== 'buy') return null
    const id = params.get('id') ?? ''
    const product = PRODUCT_MAP.get(id)
    if (!product) return null
    return {
      product,
      spec: params.get('spec') ?? product.spec,
      qty: Math.max(1, Number(params.get('qty') ?? 1)),
    }
  }, [mode, params])

  const lines = useMemo(() => {
    if (buyNow) {
      return [
        {
          key: cartKey(buyNow.product.id, buyNow.spec),
          product: buyNow.product,
          spec: buyNow.spec,
          qty: buyNow.qty,
        },
      ]
    }
    let keys: string[] = []
    try {
      const raw = sessionStorage.getItem('agrilink:checkout-keys')
      keys = raw ? (JSON.parse(raw) as string[]) : []
    } catch {
      keys = []
    }
    const source = keys.length ? cartItems.filter((i) => keys.includes(cartKey(i.productId, i.spec))) : cartItems
    return source
      .map((i) => ({
        key: cartKey(i.productId, i.spec),
        product: PRODUCT_MAP.get(i.productId)!,
        spec: i.spec,
        qty: i.qty,
      }))
      .filter((l) => l.product)
  }, [buyNow, cartItems])

  const [addressId, setAddressId] = useState(addresses.find((a) => a.isDefault)?.id ?? addresses[0]?.id ?? '')
  const [remark, setRemark] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', region: '', detail: '', isDefault: false })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState<{ id: string; total: number } | null>(null)

  const amount = lines.reduce((sum, l) => sum + l.product.price * l.qty, 0)
  const freight = amount === 0 || amount >= 500 ? 0 : 18
  const total = amount + freight
  const address = addresses.find((a) => a.id === addressId)

  if (lines.length === 0 && !success) {
    return (
      <div className="shell py-20">
        <EmptyState
          title="没有待结算的商品"
          description="请先在购物车中选择商品，或从商品详情页直接购买。"
          action={
            <Link to="/shop" className="rounded-lg bg-forest px-4 py-2 text-[12.5px] text-cream">
              去农资商城
            </Link>
          }
        />
      </div>
    )
  }

  const saveAddress = () => {
    const next: Record<string, string> = {}
    if (form.name.trim().length < 2) next.name = '请填写收货人姓名'
    if (!isPhone(form.phone)) next.phone = '请输入有效手机号'
    if (form.region.trim().length < 4) next.region = '请填写所在地区'
    if (form.detail.trim().length < 5) next.detail = '请填写详细地址'
    setErrors(next)
    if (Object.keys(next).length) return
    addAddress({
      name: form.name,
      phone: form.phone,
      region: form.region,
      detail: form.detail,
      isDefault: form.isDefault || addresses.length === 0,
    })
    setAddOpen(false)
    setForm({ name: '', phone: '', region: '', detail: '', isDefault: false })
    toast.success('收货地址已保存')
  }

  const submit = () => {
    if (!user) {
      toast.info('请先登录', '登录后才能提交订单')
      navigate('/login?redirect=/checkout')
      return
    }
    if (!address) {
      toast.error('请选择收货地址', '没有地址时可点击「新增地址」')
      return
    }
    const orderItems: OrderItem[] = lines.map((l) => ({
      productId: l.product.id,
      name: l.product.name,
      glyph: l.product.glyph,
      price: l.product.price,
      qty: l.qty,
      spec: l.spec,
      unit: l.product.unit,
    }))
    const order = createOrder({ items: orderItems, total, freight, address, remark: remark || undefined })
    if (!buyNow) {
      removeByKeys(lines.map((l) => l.key))
      sessionStorage.removeItem('agrilink:checkout-keys')
    }
    setSuccess({ id: order.id, total })
  }

  return (
    <>
      <section className="border-b border-line/70 bg-cream">
        <div className="shell py-6">
          <Breadcrumb items={[{ label: '农资商城', to: '/shop' }, { label: '购物车', to: '/cart' }, { label: '确认订单' }]} />
          <h1 className="mt-4 text-display-sm font-semibold text-forest">确认订单</h1>
        </div>
      </section>

      <section className="shell py-8 lg:py-10">
        <div className="grid gap-5 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-8">
            <div className="rounded-panel border border-line bg-white p-5">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-[14px] font-semibold text-forest">
                  <MapPin size={14} className="text-moss" /> 收货地址
                </h2>
                <button
                  onClick={() => setAddOpen(true)}
                  className="inline-flex items-center gap-1 text-[12px] text-moss hover:text-forest"
                >
                  <Plus size={12} /> 新增地址
                </button>
              </div>

              {addresses.length === 0 ? (
                <div className="mt-4 rounded-lg border border-dashed border-line bg-sand/20 px-4 py-6 text-center">
                  <p className="text-[12.5px] text-muted">还没有收货地址，添加后才能提交订单</p>
                  <Button size="sm" className="mt-3" onClick={() => setAddOpen(true)}>
                    新增地址
                  </Button>
                </div>
              ) : (
                <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                  {addresses.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => setAddressId(a.id)}
                      className={cn(
                        'rounded-xl border p-3.5 text-left transition',
                        addressId === a.id ? 'border-forest bg-forest/[0.04]' : 'border-line hover:border-moss/40',
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[13px] font-medium text-forest">
                          {a.name}
                          <span className="num ml-2 text-[11.5px] font-normal text-muted">{a.phone}</span>
                        </p>
                        {a.isDefault && <span className="rounded bg-moss/10 px-1.5 py-0.5 text-[9.5px] text-moss">默认</span>}
                      </div>
                      <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted">
                        {a.region} {a.detail}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="overflow-hidden rounded-panel border border-line bg-white">
              <div className="flex items-center justify-between border-b border-line/70 px-5 py-4">
                <h2 className="flex items-center gap-2 text-[14px] font-semibold text-forest">
                  <Truck size={14} className="text-moss" /> 商品清单
                </h2>
                <span className="text-[11.5px] text-muted">{lines.length} 种商品</span>
              </div>
              <div className="divide-y divide-line/60">
                {lines.map((l) => (
                  <div key={l.key} className="flex items-center gap-3 px-5 py-4">
                    <ProductVisual glyph={l.product.glyph} size="md" className="h-16 w-16 shrink-0 rounded-lg" />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-[13px] font-medium text-forest">{l.product.name}</p>
                      <p className="mt-0.5 text-[11px] text-muted">
                        {l.spec} · ￥{fmtNumber(l.product.price)}/{l.product.unit}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="num text-[13px] text-ink/80">× {l.qty}</p>
                      <p className="num mt-0.5 text-[13px] font-medium text-forest">￥{fmtNumber(l.product.price * l.qty)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-panel border border-line bg-white p-5">
              <h2 className="text-[14px] font-semibold text-forest">订单备注</h2>
              <Textarea
                value={remark}
                onChange={(e) => setRemark(e.target.value.slice(0, 200))}
                placeholder="如：需要开票、指定物流、到货前电话联系等"
                className="mt-3"
              />
            </div>
          </div>

          <aside className="lg:col-span-4">
            <div className="sticky top-[92px] space-y-3">
              <div className="rounded-panel border border-line bg-white p-5 shadow-card">
                <h2 className="text-[14px] font-semibold text-forest">金额明细</h2>
                <dl className="mt-4 space-y-2.5 text-[12.5px]">
                  <div className="flex justify-between">
                    <dt className="text-muted">商品总额</dt>
                    <dd className="num text-ink/80">￥{fmtNumber(amount)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted">运费</dt>
                    <dd className="num text-ink/80">{freight === 0 ? '免运费' : `￥${fmtNumber(freight)}`}</dd>
                  </div>
                  <div className="flex items-baseline justify-between border-t border-line/70 pt-3">
                    <dt className="text-muted">应付合计</dt>
                    <dd className="num text-[24px] font-semibold text-forest">￥{fmtNumber(total)}</dd>
                  </div>
                </dl>

                <Button block size="lg" className="mt-5" onClick={submit}>
                  提交订单
                </Button>

                <div className="mt-4 flex items-start gap-2 rounded-lg border border-clay/25 bg-clay/[0.06] px-3 py-2.5">
                  <ShieldAlert size={13} className="mt-0.5 shrink-0 text-[#9A6420]" />
                  <p className="text-[10.5px] leading-relaxed text-[#7C5320]">
                    平台尚未接入支付：提交后生成「待付款」订单，不会产生真实扣款。可在订单列表使用「模拟支付」体验后续状态流转。
                  </p>
                </div>
              </div>

              <div className="rounded-panel border border-line bg-white p-4 text-[11px] text-muted">
                <p className="flex items-center gap-1.5 font-medium text-forest">
                  <Info size={12} /> 下单说明
                </p>
                <ul className="mt-2 space-y-1.5">
                  <li>· 演示环境不发货、不产生物流单号</li>
                  <li>· 订单与地址保存在本地浏览器</li>
                  <li>· 农药等商品请核对登记标签后使用</li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="新增收货地址"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setAddOpen(false)}>
              取消
            </Button>
            <Button size="sm" onClick={saveAddress}>
              保存地址
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="收货人" required error={errors.name} htmlFor="rn">
              <Input
                id="rn"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="姓名"
                error={!!errors.name}
              />
            </Field>
            <Field label="手机号" required error={errors.phone} htmlFor="rp">
              <Input
                id="rp"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/[^\d]/g, '').slice(0, 11) })}
                placeholder="11 位手机号"
                inputMode="tel"
                error={!!errors.phone}
              />
            </Field>
          </div>
          <Field label="所在地区" required error={errors.region} htmlFor="rr" hint="省 / 市 / 区县">
            <Input
              id="rr"
              value={form.region}
              onChange={(e) => setForm({ ...form, region: e.target.value })}
              placeholder="如：山东省 潍坊市 寿光市"
              error={!!errors.region}
            />
          </Field>
          <Field label="详细地址" required error={errors.detail} htmlFor="rd">
            <Input
              id="rd"
              value={form.detail}
              onChange={(e) => setForm({ ...form, detail: e.target.value })}
              placeholder="乡镇 / 村 / 门牌 / 仓库"
              error={!!errors.detail}
            />
          </Field>
          <label className="flex items-center gap-2 text-[12.5px] text-ink/75">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
              className="h-4 w-4 accent-[#173D32]"
            />
            设为默认地址
          </label>
        </div>
      </Modal>

      <Modal
        open={!!success}
        onClose={() => setSuccess(null)}
        title="订单已创建（模拟下单）"
        size="sm"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => navigate('/shop')}>
              继续采购
            </Button>
            <Button size="sm" onClick={() => navigate('/user/orders')}>
              查看我的订单
            </Button>
          </>
        }
      >
        <div className="text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#E8F1E9] text-[#2C6450]">
            <CheckCircle2 size={26} />
          </span>
          <p className="mt-4 text-[15px] font-medium text-forest">订单号 {success?.id}</p>
          <p className="num mt-1 text-[13px] text-muted">应付 ￥{fmtNumber(success?.total ?? 0)}</p>
          <p className="mt-4 rounded-lg bg-sand/50 px-3 py-2.5 text-[11px] leading-relaxed text-muted">
            本平台尚未接入真实支付，订单状态为「待付款」。你可以在订单列表中点击「模拟支付」，体验发货与收货的状态流转。
          </p>
        </div>
      </Modal>
    </>
  )
}
