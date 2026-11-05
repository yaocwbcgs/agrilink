import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Clock,
  Heart,
  MapPin,
  Phone,
  ShieldCheck,
  Star,
  Tractor,
  Wrench,
} from 'lucide-react'
import { Breadcrumb } from '../components/ui/Layout'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Field, Input, Select, Textarea } from '../components/ui/Form'
import { Modal } from '../components/ui/Modal'
import { Rating, MetaItem } from '../components/ui/Indicators'
import { SmartImage } from '../components/ui/SmartImage'
import { CardSkeleton, NotFoundState } from '../components/ui/States'
import { useAsync } from '../hooks/useAsync'
import { fetchMachineryById, fetchMachineryReviews, fetchSimilarMachinery } from '../services/machinery'
import { MACHINERY_LABEL, TRADE_MODE_LABEL } from '../lib/constants'
import { useBookingStore } from '../store/businessStore'
import { useFavoriteStore } from '../store/userDataStore'
import { useAuthStore } from '../store/authStore'
import { toast } from '../store/uiStore'
import { cn, fmtDate, fmtNumber, isPhone } from '../lib/utils'
import { MachineryCard } from '../components/machinery/MachineryCard'

export default function MachineryDetail() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const createBooking = useBookingStore((s) => s.create)
  const isFav = useFavoriteStore((s) => s.items.some((f) => f.type === 'machinery' && f.id === id))
  const toggleFav = useFavoriteStore((s) => s.toggle)

  const { data, loading, error, reload } = useAsync(() => fetchMachineryById(id), [id])
  const { data: reviews } = useAsync(() => fetchMachineryReviews(id), [id])
  const { data: similar } = useAsync(() => fetchSimilarMachinery(id), [id])

  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ workType: '', area: '', location: '', date: '', phone: '', remark: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

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

  const isSale = data.modes.includes('sale') && data.priceUnit.includes('台')
  const estimate = isSale ? data.salePrice ?? data.price : Number(form.area || 0) * data.price

  const submit = () => {
    if (!user) {
      toast.info('请先登录', '登录后即可预约农机作业')
      navigate(`/login?redirect=/machinery/${data.id}`)
      return
    }
    const next: Record<string, string> = {}
    if (!form.workType) next.workType = '请选择作业类型'
    if (!form.area || Number(form.area) <= 0) next.area = '请输入作业面积'
    if (form.location.trim().length < 4) next.location = '请填写详细作业地点'
    if (!form.date) next.date = '请选择预约日期'
    if (!isPhone(form.phone)) next.phone = '请输入有效的手机号'
    setErrors(next)
    if (Object.keys(next).length) return

    createBooking({
      machineryId: data.id,
      machineryName: data.name,
      cover: data.cover,
      workType: form.workType,
      area: Number(form.area),
      location: form.location,
      date: form.date,
      phone: form.phone,
      remark: form.remark,
      amount: estimate,
    })
    setOpen(false)
    setForm({ workType: '', area: '', location: '', date: '', phone: '', remark: '' })
    toast.success('预约已提交', '订单已生成，可在「个人中心 - 我的农机预约」查看进度')
  }

  return (
    <>
      <section className="border-b border-line/70 bg-cream">
        <div className="shell py-5">
          <Breadcrumb
            items={[
              { label: '农机服务', to: '/machinery' },
              { label: MACHINERY_LABEL[data.category], to: `/machinery?category=${data.category}` },
              { label: data.name },
            ]}
          />
        </div>
      </section>

      <section className="shell py-8 lg:py-10">
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="overflow-hidden rounded-panel border border-line bg-white shadow-card">
              <div className="relative">
                <SmartImage src={data.cover} alt={data.name} ratio="16 / 10" className="w-full" eager />
                <div className="pointer-events-none absolute inset-0 bg-forest-950/45" />
                <div className="absolute inset-0 flex flex-col justify-between p-5">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-cream/25 bg-cream/15 px-2.5 py-1 text-[10.5px] text-cream backdrop-blur">
                      <Tractor size={12} /> {MACHINERY_LABEL[data.category]}
                    </span>
                    <span className="rounded-full border border-cream/25 bg-cream/15 px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.14em] text-cream/85 backdrop-blur">
                      {data.brand} · {data.model}
                    </span>
                  </div>
                  <div className="rounded-xl border border-cream/15 bg-forest-950/35 p-3.5 backdrop-blur-sm">
                    <p className="text-[15px] font-semibold text-cream">{data.name}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-cream/65">
                      <span>{data.power}</span>
                      <span>·</span>
                      <span>{data.year} 年</span>
                      <span>·</span>
                      <span>{data.ownerType}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 divide-x divide-line/70 border-t border-line/70 sm:grid-cols-4">
                {[
                  { label: '作业评分', value: data.rating.toFixed(1), icon: <Star size={12} /> },
                  { label: '完成订单', value: `${data.orders}`, icon: <CheckCircle2 size={12} /> },
                  { label: '评价数', value: `${data.reviewCount}`, icon: <Wrench size={12} /> },
                  { label: '机器状态', value: data.available ? '可预约' : '档期已满', icon: <Clock size={12} /> },
                ].map((item) => (
                  <div key={item.label} className="px-4 py-3">
                    <p className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.12em] text-muted">
                      {item.icon}
                      {item.label}
                    </p>
                    <p className="num mt-1 text-[14px] font-medium text-forest">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 rounded-panel border border-line bg-white p-5">
              <h2 className="text-[15px] font-semibold text-forest">设备参数</h2>
              <dl className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                {data.specs.map((s) => (
                  <div key={s.label} className="flex items-baseline justify-between gap-4 border-b border-line/60 pb-2.5">
                    <dt className="text-[12px] text-muted">{s.label}</dt>
                    <dd className="text-right text-[12.5px] text-ink/85">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="mt-4 rounded-panel border border-line bg-white p-5">
              <h2 className="text-[15px] font-semibold text-forest">服务说明</h2>
              <p className="mt-2.5 text-[12.5px] leading-[1.9] text-ink/75">{data.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {data.services.map((s) => (
                  <span key={s} className="rounded-full border border-moss/25 bg-moss/[0.06] px-2.5 py-1 text-[11.5px] text-moss">
                    {s}
                  </span>
                ))}
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-line bg-sand/25 p-4">
                  <p className="flex items-center gap-1.5 text-[12px] font-medium text-forest">
                    <CalendarDays size={13} /> 可服务时间
                  </p>
                  <p className="num mt-2 text-[12px] text-ink/75">
                    {fmtDate(data.availableFrom)} — {fmtDate(data.availableTo)}
                  </p>
                  <p className="mt-1 text-[10.5px] text-muted">跨区作业需提前 3 天确认转场安排</p>
                </div>
                <div className="rounded-xl border border-line bg-sand/25 p-4">
                  <p className="flex items-center gap-1.5 text-[12px] font-medium text-forest">
                    <ShieldCheck size={13} /> 服务保障
                  </p>
                  <ul className="mt-2 space-y-1 text-[11.5px] text-ink/75">
                    <li>· 机手持证上岗，含基础保险</li>
                    <li>· 作业质量不达标可申请返工</li>
                    <li>· 平台介入协调纠纷（演示说明）</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-panel border border-line bg-white p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-[15px] font-semibold text-forest">作业评价</h2>
                <div className="flex items-center gap-2">
                  <Rating value={data.rating} count={data.reviewCount} />
                </div>
              </div>
              <div className="mt-4 space-y-4">
                {(!reviews || reviews.length === 0) && (
                  <p className="py-6 text-center text-[12.5px] text-muted">暂无评价，完成作业后可留下第一条反馈。</p>
                )}
                {reviews?.map((r) => (
                  <div key={r.id} className="border-b border-line/60 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sand text-[11px] text-forest">
                          {r.user.slice(0, 1)}
                        </span>
                        <span className="text-[12.5px] text-ink/80">{r.user}</span>
                        <Rating value={r.rating} size={11} showValue={false} />
                      </div>
                      <span className="num text-[10.5px] text-muted">{r.date}</span>
                    </div>
                    <p className="mt-2 text-[12px] leading-relaxed text-ink/70">{r.text}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {r.tags.map((t) => (
                        <span key={t} className="rounded border border-line bg-sand/40 px-1.5 py-0.5 text-[10px] text-muted">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 预约卡 */}
          <aside className="lg:col-span-5">
            <div className="sticky top-[92px] space-y-3">
              <div className="rounded-panel border border-line bg-white p-5 shadow-card">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-muted">参考价格</p>
                    <p className="num mt-1.5 flex items-baseline gap-1">
                      <span className="text-[26px] font-semibold text-forest">￥{fmtNumber(data.price)}</span>
                      <span className="text-[11px] text-muted">/{data.priceUnit.replace('元/', '')}</span>
                    </p>
                    {data.modes.length > 1 && (
                      <p className="mt-1 text-[11px] text-muted">支持 {data.modes.map((m) => TRADE_MODE_LABEL[m]).join(' / ')}</p>
                    )}
                  </div>
                  <span
                    className={cn(
                      'rounded-full border px-2.5 py-1 text-[10.5px]',
                      data.available
                        ? 'border-[#C6DCCB] bg-[#E8F1E9] text-[#2C6450]'
                        : 'border-[#EED6B2] bg-[#FBF0DF] text-[#9A6420]',
                    )}
                  >
                    {data.available ? '可预约' : '档期已满'}
                  </span>
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-line/70 pt-4">
                  <MetaItem label="服务区域" value={data.region} />
                  <MetaItem label="机主类型" value={data.ownerType} />
                  <MetaItem label="品牌型号" value={`${data.brand} ${data.model}`} />
                  <MetaItem label="出厂年份" value={`${data.year}`} />
                </dl>

                <div className="mt-5 space-y-2">
                  <Button
                    block
                    size="lg"
                    disabled={!data.available}
                    onClick={() => {
                      if (!user) {
                        toast.info('请先登录', '登录后即可预约')
                        navigate(`/login?redirect=/machinery/${data.id}`)
                        return
                      }
                      setOpen(true)
                    }}
                    iconLeft={<CalendarDays size={15} />}
                  >
                    {data.available ? '在线预约作业' : '当前档期已满'}
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      block
                      iconLeft={<Phone size={14} />}
                      onClick={() => toast.info('联系电话', `${data.owner}：138****${data.id.slice(-4)}（演示）`)}
                    >
                      联系机主
                    </Button>
                    <Button
                      variant="secondary"
                      className="w-11 shrink-0 px-0"
                      onClick={() => {
                        const added = toggleFav({
                          type: 'machinery',
                          id: data.id,
                          title: data.name,
                          subtitle: data.owner,
                          meta: `${data.region} · ￥${fmtNumber(data.price)}${data.priceUnit.replace('元', '')}`,
                          image: data.cover,
                        })
                        toast[added ? 'success' : 'info'](added ? '已加入收藏' : '已取消收藏')
                      }}
                      aria-label={isFav ? '取消收藏' : '收藏'}
                    >
                      <Heart size={15} fill={isFav ? 'currentColor' : 'none'} className={isFav ? 'text-[#B4452F]' : ''} />
                    </Button>
                  </div>
                </div>

                <p className="mt-3 text-center text-[10.5px] text-muted">
                  提交预约后生成作业订单，可在个人中心跟踪状态
                </p>
              </div>

              <div className="rounded-panel border border-line bg-white p-5">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-moss/10 text-[14px] font-medium text-moss">
                    {data.owner.slice(0, 1)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium text-forest">{data.owner}</p>
                    <div className="mt-1 flex items-center gap-1.5">
                      {data.verified && (
                        <Badge tone="green" icon={<BadgeCheck size={10} />}>
                          实名认证
                        </Badge>
                      )}
                      <span className="text-[10.5px] text-muted">{data.ownerType}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-sand/40 px-3 py-2 text-[11px] text-ink/70">
                  <MapPin size={11} className="shrink-0 text-moss" />
                  {data.region}
                </div>
              </div>

              {similar && similar.length > 0 && (
                <div className="rounded-panel border border-line bg-white p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[12.5px] font-semibold text-forest">看了还看</h3>
                    <Link to="/machinery" className="text-[11px] text-moss hover:text-forest">
                      全部
                    </Link>
                  </div>
                  <div className="mt-3 space-y-2">
                    {similar.slice(0, 2).map((m) => (
                      <MachineryCard key={m.id} machine={m} variant="compact" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </section>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="预约农机作业"
        description={`${data.name} · ${data.owner}`}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button size="sm" onClick={submit}>
              提交预约
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="rounded-lg border border-line bg-sand/30 px-3.5 py-2.5 text-[11.5px] text-muted">
            可服务期：{fmtDate(data.availableFrom)} — {fmtDate(data.availableTo)} · 参考价 ￥{fmtNumber(data.price)}/
            {data.priceUnit.replace('元/', '')}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="作业类型" required error={errors.workType} htmlFor="wt">
              <Select
                id="wt"
                value={form.workType}
                onChange={(e) => setForm({ ...form, workType: e.target.value })}
                error={!!errors.workType}
              >
                <option value="">请选择</option>
                {data.services.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="作业面积（亩）" required error={errors.area} htmlFor="area">
              <Input
                id="area"
                value={form.area}
                onChange={(e) => setForm({ ...form, area: e.target.value.replace(/[^\d.]/g, '') })}
                placeholder="如 200"
                inputMode="decimal"
                error={!!errors.area}
              />
            </Field>
          </div>
          <Field label="作业地点" required error={errors.location} htmlFor="loc">
            <Input
              id="loc"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="省 / 市 / 县 / 乡镇 / 地块名称"
              error={!!errors.location}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="预约日期" required error={errors.date} htmlFor="date">
              <Input
                id="date"
                type="date"
                value={form.date}
                min={data.availableFrom}
                max={data.availableTo}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                error={!!errors.date}
              />
            </Field>
            <Field label="联系电话" required error={errors.phone} htmlFor="phone">
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/[^\d]/g, '').slice(0, 11) })}
                placeholder="11 位手机号"
                inputMode="tel"
                error={!!errors.phone}
              />
            </Field>
          </div>
          <Field label="补充说明" htmlFor="remark" hint="地块条件、作物状态、时间要求等">
            <Textarea
              id="remark"
              value={form.remark}
              onChange={(e) => setForm({ ...form, remark: e.target.value.slice(0, 200) })}
              placeholder="如：地块 3 块共 220 亩，其中一块低洼易积水，希望上午作业"
              className="min-h-[84px]"
            />
          </Field>
          <div className="flex items-center justify-between rounded-lg border border-moss/20 bg-moss/[0.05] px-4 py-3">
            <span className="text-[12px] text-ink/70">预估费用</span>
            <span className="num text-[17px] font-semibold text-forest">
              ￥{fmtNumber(Math.round(estimate || 0))}
              <span className="ml-1 text-[10px] font-normal text-muted">按 {form.area || 0} 亩估算</span>
            </span>
          </div>
          <p className="flex items-start gap-1.5 text-[11px] text-muted">
            <CheckCircle2 size={12} className="mt-0.5 shrink-0" />
            提交后订单状态为「待确认」，机主确认后进入「已确认」，作业完成可评价。演示环境不产生真实费用。
          </p>
        </div>
      </Modal>
    </>
  )
}
