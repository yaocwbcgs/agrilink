import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  BadgeCheck,
  CalendarClock,
  Heart,
  MapPin,
  MessageSquare,
  Phone,
  Scale,
  ShieldCheck,
  Truck,
  User,
} from 'lucide-react'
import { Breadcrumb } from '../components/ui/Layout'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Field, Input, Textarea } from '../components/ui/Form'
import { Modal } from '../components/ui/Modal'
import { SmartImage } from '../components/ui/SmartImage'
import { NotFoundState, CardSkeleton } from '../components/ui/States'
import { useAsync } from '../hooks/useAsync'
import { fetchListingById, fetchRelatedListings } from '../services/listings'
import { PRODUCE_CATEGORY_LABEL } from '../lib/constants'
import { useListingStore } from '../store/businessStore'
import { useFavoriteStore, useInquiryStore } from '../store/userDataStore'
import { useAuthStore } from '../store/authStore'
import { toast } from '../store/uiStore'
import { fmtDate, fmtNumber, isPhone, relTime } from '../lib/utils'

export default function ListingDetail() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const own = useListingStore((s) => s.own)
  const user = useAuthStore((s) => s.user)
  const isFav = useFavoriteStore((s) => s.items.some((f) => f.type === 'listing' && f.id === id))
  const toggleFav = useFavoriteStore((s) => s.toggle)
  const createInquiry = useInquiryStore((s) => s.create)

  const { data, loading, error, reload } = useAsync(() => fetchListingById(id, own), [id, own])
  const { data: related } = useAsync(
    () => (data ? fetchRelatedListings(data, own, 3) : Promise.resolve([])),
    [data?.id],
  )

  const [phoneShown, setPhoneShown] = useState(false)
  const [inquiryOpen, setInquiryOpen] = useState(false)
  const [form, setForm] = useState({ qty: '', price: '', message: '', contact: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const totalRef = useMemo(() => (data ? data.quantity * data.price : 0), [data])

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

  const submitInquiry = () => {
    const next: Record<string, string> = {}
    if (!form.qty || Number(form.qty) <= 0) next.qty = '请输入意向数量'
    if (!form.price || Number(form.price) <= 0) next.price = '请输入意向价格'
    if (!isPhone(form.contact)) next.contact = '请输入有效的手机号'
    if (form.message.trim().length < 5) next.message = '请至少填写 5 个字的说明'
    setErrors(next)
    if (Object.keys(next).length) return

    createInquiry({
      listingId: data.id,
      listingTitle: data.title,
      sellerName: data.company,
      quantity: Number(form.qty),
      unit: data.unit,
      offerPrice: Number(form.price),
      message: form.message,
      contact: form.contact,
    })
    setInquiryOpen(false)
    setForm({ qty: '', price: '', message: '', contact: '' })
    toast.success('询价已发送', '对方回复后会出现在「我的询价」中（演示环境自动生成回复）')
  }

  const guard = (action: () => void, label = '该操作') => {
    if (!user) {
      toast.info('请先登录', `登录后即可${label}`)
      navigate(`/login?redirect=/market/${data.id}`)
      return
    }
    action()
  }

  return (
    <>
      <section className="border-b border-line/70 bg-cream">
        <div className="shell py-5">
          <Breadcrumb
            items={[
              { label: '产销对接', to: '/market' },
              { label: data.type === 'supply' ? '供应大厅' : '采购大厅', to: `/market?tab=${data.type}` },
              { label: data.title.slice(0, 16) + '…' },
            ]}
          />
        </div>
      </section>

      <section className="shell py-8 lg:py-10">
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div className="overflow-hidden rounded-panel border border-line bg-white shadow-card">
              <div className="relative">
                <SmartImage src={data.image} alt={data.title} ratio="16 / 9" className="w-full" eager />
                <div className="absolute left-4 top-4 flex gap-2">
                  <span className="rounded-full bg-forest/90 px-2.5 py-1 text-[10.5px] text-cream backdrop-blur">
                    {PRODUCE_CATEGORY_LABEL[data.category]}
                  </span>
                  <span className="rounded-full border border-cream/30 bg-cream/20 px-2.5 py-1 text-[10.5px] text-cream backdrop-blur">
                    {data.type === 'supply' ? '供应' : '采购'}
                  </span>
                </div>
              </div>

              <div className="p-5 lg:p-6">
                <h1 className="text-[22px] font-semibold leading-snug text-forest lg:text-[26px]">{data.title}</h1>
                <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11.5px] text-muted">
                  <span className="flex items-center gap-1">
                    <MapPin size={12} /> {data.region}
                  </span>
                  <span className="num">发布于 {fmtDate(data.createdAt, true)}</span>
                  <span className="num">{data.views} 次浏览</span>
                  <span>{relTime(data.createdAt)}更新</span>
                </div>

                <div className="mt-5 grid gap-3 rounded-xl border border-line bg-sand/25 p-4 sm:grid-cols-3">
                  <div>
                    <p className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-muted">
                      {data.type === 'supply' ? '供应数量' : '采购数量'}
                    </p>
                    <p className="num mt-1 text-[17px] font-semibold text-forest">
                      {fmtNumber(data.quantity)}
                      <span className="ml-1 text-[11px] font-normal text-muted">{data.unit}</span>
                    </p>
                  </div>
                  <div>
                    <p className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-muted">
                      {data.type === 'supply' ? '参考单价' : '采购价区间'}
                    </p>
                    <p className="num mt-1 text-[17px] font-semibold text-forest">
                      ￥{fmtNumber(data.price)}
                      {data.priceMax ? `–${fmtNumber(data.priceMax)}` : ''}
                      <span className="ml-1 text-[11px] font-normal text-muted">/{data.unit}</span>
                    </p>
                  </div>
                  <div>
                    <p className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-muted">货值参考</p>
                    <p className="num mt-1 text-[17px] font-semibold text-forest">
                      ￥{fmtNumber(totalRef)}
                      <span className="ml-1 text-[11px] font-normal text-muted">按参考价估算</span>
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <h2 className="text-[14px] font-semibold text-forest">信息描述</h2>
                  <p className="mt-2 whitespace-pre-line text-[13px] leading-[1.9] text-ink/75">{data.description}</p>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-line p-4">
                    <h3 className="text-[13px] font-semibold text-forest">规格与质量</h3>
                    <dl className="mt-3 space-y-2 text-[12px]">
                      {[
                        { k: '质量等级', v: data.quality ?? '未填写' },
                        { k: '包装规格', v: data.spec ?? '未填写' },
                        { k: '发货时间', v: data.deliveryTime ?? '面议' },
                      ].map((row) => (
                        <div key={row.k} className="flex justify-between gap-4">
                          <dt className="shrink-0 text-muted">{row.k}</dt>
                          <dd className="text-right text-ink/80">{row.v}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                  <div className="rounded-xl border border-line p-4">
                    <h3 className="text-[13px] font-semibold text-forest">交易提示</h3>
                    <ul className="mt-3 space-y-2 text-[12px] text-ink/75">
                      {['建议先取样验质，再签订购销合同', '确认运费承担方与装卸责任', '大额交易优先使用平台见证或第三方监管'].map(
                        (t) => (
                          <li key={t} className="flex items-start gap-1.5">
                            <ShieldCheck size={12} className="mt-0.5 shrink-0 text-moss/70" />
                            {t}
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {related && related.length > 0 && (
              <div className="mt-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-[15px] font-semibold text-forest">同类{data.type === 'supply' ? '货源' : '需求'}</h2>
                  <Link to={`/market?tab=${data.type}`} className="text-[12px] text-moss hover:text-forest">
                    查看更多
                  </Link>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  {related.map((r) => (
                    <Link
                      key={r.id}
                      to={`/market/${r.id}`}
                      className="group overflow-hidden rounded-xl border border-line bg-white transition hover:border-moss/40 hover:shadow-card"
                    >
                      <SmartImage src={r.image} alt={r.title} ratio="16 / 10" className="w-full" />
                      <div className="p-3">
                        <p className="line-clamp-1 text-[12.5px] font-medium text-forest group-hover:text-moss">{r.title}</p>
                        <p className="num mt-1 text-[12px] text-moss">
                          ￥{fmtNumber(r.price)}/{r.unit}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 卖家卡 */}
          <aside className="lg:col-span-4">
            <div className="sticky top-[92px] space-y-3">
              <div className="rounded-panel border border-line bg-white p-5 shadow-card">
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-moss/10 text-[15px] font-medium text-moss">
                    {data.company.slice(0, 1)}
                  </span>
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-[13.5px] font-medium text-forest">{data.company}</p>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <Badge tone="green" icon={<BadgeCheck size={10} />}>
                        已认证
                      </Badge>
                      <Badge tone="neutral">{data.type === 'supply' ? '供货方' : '采购方'}</Badge>
                    </div>
                  </div>
                </div>

                <dl className="mt-4 space-y-2.5 border-t border-line/70 pt-4 text-[12px]">
                  <div className="flex items-center justify-between">
                    <dt className="flex items-center gap-1.5 text-muted">
                      <User size={12} /> 联系人
                    </dt>
                    <dd className="text-ink/80">{data.contactName}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="flex items-center gap-1.5 text-muted">
                      <Phone size={12} /> 联系电话
                    </dt>
                    <dd className="num text-ink/80">
                      {phoneShown ? data.contact : data.contact.replace(/\*{4}/, '****')}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="flex items-center gap-1.5 text-muted">
                      <MapPin size={12} /> 所在地区
                    </dt>
                    <dd className="text-right text-ink/80">{data.region}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="flex items-center gap-1.5 text-muted">
                      <CalendarClock size={12} /> 发布时间
                    </dt>
                    <dd className="num text-ink/80">{fmtDate(data.createdAt)}</dd>
                  </div>
                </dl>

                <div className="mt-5 space-y-2">
                  <Button
                    block
                    size="lg"
                    onClick={() => guard(() => setInquiryOpen(true), '发起询价')}
                    iconLeft={<MessageSquare size={15} />}
                  >
                    发起询价
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      block
                      onClick={() => {
                        setPhoneShown(true)
                        toast.success('已显示联系电话', '请说明来自耘链平台，便于对方核对')
                      }}
                      iconLeft={<Phone size={14} />}
                    >
                      查看电话
                    </Button>
                    <Button
                      variant="secondary"
                      className="w-11 shrink-0 px-0"
                      onClick={() => {
                        const added = toggleFav({
                          type: 'listing',
                          id: data.id,
                          title: data.title,
                          subtitle: data.company,
                          meta: `${data.quantity}${data.unit} · ${data.region}`,
                          image: data.image,
                        })
                        toast[added ? 'success' : 'info'](added ? '已加入收藏' : '已取消收藏')
                      }}
                      aria-label={isFav ? '取消收藏' : '收藏'}
                    >
                      <Heart size={15} fill={isFav ? 'currentColor' : 'none'} className={isFav ? 'text-[#B4452F]' : ''} />
                    </Button>
                  </div>
                </div>

                <p className="mt-3 text-center text-[10.5px] leading-relaxed text-muted">
                  平台不参与交易资金流转，请自行核实对方资质与货物质量。
                </p>
              </div>

              <div className="rounded-panel border border-line bg-sand/40 p-4">
                <p className="flex items-center gap-1.5 text-[12px] font-medium text-forest">
                  <Scale size={13} /> 参考信息
                </p>
                <ul className="mt-2 space-y-1.5 text-[11.5px] text-ink/70">
                  <li className="flex justify-between">
                    <span className="text-muted">单位数量</span>
                    <span className="num">{data.quantity} {data.unit}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted">信息状态</span>
                    <span>{data.status === 'active' ? '正常展示' : '已下架'}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted">浏览热度</span>
                    <span className="num">{data.views}</span>
                  </li>
                </ul>
              </div>

              <Link
                to="/market/match"
                className="flex items-center justify-between rounded-panel border border-forest/15 bg-forest px-4 py-3.5 text-cream transition hover:bg-forest-950"
              >
                <span>
                  <span className="block text-[12.5px] font-medium">查找更匹配的{data.type === 'supply' ? '货源' : '买家'}</span>
                  <span className="mt-0.5 block text-[10.5px] text-cream/55">按五个维度计算匹配度</span>
                </span>
                <ArrowLeft size={15} className="rotate-180" />
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <Modal
        open={inquiryOpen}
        onClose={() => setInquiryOpen(false)}
        title="发起询价"
        description={data.title}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setInquiryOpen(false)}>
              取消
            </Button>
            <Button size="sm" onClick={submitInquiry}>
              提交询价
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="rounded-lg border border-line bg-sand/30 px-3.5 py-2.5 text-[11.5px] text-muted">
            卖家：{data.company} · 参考价 ￥{fmtNumber(data.price)}/{data.unit}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="意向数量" required error={errors.qty} htmlFor="qty">
              <Input
                id="qty"
                value={form.qty}
                onChange={(e) => setForm({ ...form, qty: e.target.value.replace(/[^\d.]/g, '') })}
                placeholder={`单位：${data.unit}`}
                inputMode="decimal"
                error={!!errors.qty}
              />
            </Field>
            <Field label="意向单价" required error={errors.price} htmlFor="price">
              <Input
                id="price"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value.replace(/[^\d.]/g, '') })}
                placeholder="元"
                inputMode="decimal"
                error={!!errors.price}
              />
            </Field>
          </div>
          <Field label="联系电话" required error={errors.contact} htmlFor="contact">
            <Input
              id="contact"
              value={form.contact}
              onChange={(e) => setForm({ ...form, contact: e.target.value.replace(/[^\d]/g, '').slice(0, 11) })}
              placeholder="11 位手机号"
              inputMode="tel"
              error={!!errors.contact}
            />
          </Field>
          <Field label="补充说明" required error={errors.message} htmlFor="msg" counter={`${form.message.length}/200`}>
            <Textarea
              id="msg"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value.slice(0, 200) })}
              placeholder="例如：需要 30 吨，10 天内发运，能否提供质检报告？"
              error={!!errors.message}
            />
          </Field>
          <p className="flex items-start gap-1.5 text-[11px] text-muted">
            <Truck size={12} className="mt-0.5 shrink-0" />
            提交后可在「个人中心 - 我的询价」查看回复状态。演示环境将在 6 秒后生成模拟回复。
          </p>
        </div>
      </Modal>
    </>
  )
}
