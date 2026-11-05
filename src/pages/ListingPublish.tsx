import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  CloudUpload,
  Info,
  Package,
  ShoppingBasket,
  Trash2,
} from 'lucide-react'
import { Breadcrumb } from '../components/ui/Layout'
import { Button } from '../components/ui/Button'
import { Checkbox, Field, Input, Select, Textarea } from '../components/ui/Form'
import { useListingStore } from '../store/businessStore'
import { useAuthStore } from '../store/authStore'
import { toast } from '../store/uiStore'
import {
  PRODUCE_CATEGORY_LABEL,
  PRODUCE_CATEGORY_OPTIONS,
  REGION_CITIES,
  REGIONS,
} from '../lib/constants'
import type { ListingType, ProduceCategory } from '../types'
import { PRODUCE_IMAGES } from '../data/images'
import { cn, readFileAsDataURL, validateImage } from '../lib/utils'

const UNIT_OPTIONS = ['吨', '公斤', '箱', '件', '头', '只']

interface FormState {
  type: ListingType
  title: string
  category: ProduceCategory
  quantity: string
  unit: string
  price: string
  priceMax: string
  province: string
  city: string
  quality: string
  delivery: string
  contactName: string
  contact: string
  description: string
  agree: boolean
}

const EMPTY: FormState = {
  type: 'supply',
  title: '',
  category: 'grain',
  quantity: '',
  unit: '吨',
  price: '',
  priceMax: '',
  province: '黑龙江省',
  city: '绥化市',
  quality: '',
  delivery: '',
  contactName: '',
  contact: '',
  description: '',
  agree: true,
}

export default function ListingPublish() {
  const [params] = useSearchParams()
  const editingId = params.get('edit')
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const add = useListingStore((s) => s.add)
  const update = useListingStore((s) => s.update)
  const own = useListingStore((s) => s.own)
  const setStatus = useListingStore((s) => s.setStatus)

  const [form, setForm] = useState<FormState>(EMPTY)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [image, setImage] = useState<string>('')
  const [imageError, setImageError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const cities = useMemo(() => REGION_CITIES[form.province] ?? [], [form.province])

  useEffect(() => {
    if (!editingId) return
    const target = own.find((l) => l.id === editingId)
    if (!target) return
    const [province = '黑龙江省', city = '绥化市'] = target.region.split(' ')
    setForm({
      type: target.type,
      title: target.title,
      category: target.category,
      quantity: String(target.quantity),
      unit: target.unit,
      price: String(target.price),
      priceMax: target.priceMax ? String(target.priceMax) : '',
      province,
      city,
      quality: target.quality ?? '',
      delivery: target.deliveryTime ?? '',
      contactName: target.contactName,
      contact: target.contact.replace(/\*/g, ''),
      description: target.description,
      agree: true,
    })
    setImage(target.image)
  }, [editingId, own])

  useEffect(() => {
    if (user && !form.contact) {
      setForm((f) => ({
        ...f,
        contactName: f.contactName || user.name,
        contact: f.contact || user.phone,
        province: user.region.split(' ')[0] || f.province,
      }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => ({ ...e, [key]: '' }))
  }

  const handleImage = async (file: File) => {
    const invalid = validateImage(file)
    if (invalid) {
      setImageError(invalid)
      toast.error('图片不符合要求', invalid)
      return
    }
    setImageError('')
    const url = await readFileAsDataURL(file)
    setImage(url)
  }

  const submit = () => {
    if (!user) {
      toast.info('请先登录', '登录后才能发布供需信息')
      navigate('/login?redirect=/market/publish')
      return
    }
    const next: Record<string, string> = {}
    if (form.title.trim().length < 4) next.title = '标题至少 4 个字，建议包含产地与品种'
    if (!form.quantity || Number(form.quantity) <= 0) next.quantity = '请输入有效数量'
    if (!form.price || Number(form.price) <= 0) next.price = '请输入有效价格'
    if (form.type === 'demand' && form.priceMax && Number(form.priceMax) < Number(form.price)) {
      next.priceMax = '价格上限不能低于下限'
    }
    if (form.description.trim().length < 10) next.description = '详细描述至少 10 个字'
    if (form.contactName.trim().length < 2) next.contactName = '请填写联系人姓名'
    if (!/^1[3-9]\d{9}$/.test(form.contact)) next.contact = '请输入有效的 11 位手机号'
    if (!form.agree) next.agree = '请确认信息真实性承诺'
    setErrors(next)
    if (Object.keys(next).length) {
      toast.error('请检查表单', '有 ' + Object.keys(next).length + ' 项需要修正')
      return
    }

    setSubmitting(true)
    const payload = {
      type: form.type,
      title: form.title.trim(),
      category: form.category,
      quantity: Number(form.quantity),
      unit: form.unit,
      price: Number(form.price),
      priceMax: form.priceMax ? Number(form.priceMax) : undefined,
      region: `${form.province} ${form.city}`.trim(),
      quality: form.quality || undefined,
      deliveryTime: form.delivery || undefined,
      company: user.company || `${user.name}（${user.verifiedType ?? '个人' }）`,
      contact: form.contact.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2'),
      contactName: form.contactName,
      description: form.description.trim(),
      image: image || PRODUCE_IMAGES[form.category === 'fruit' ? 3 : form.category === 'vegetable' ? 4 : 0],
      spec: form.unit === '吨' ? '散装 / 可协商' : '标准包装',
    }

    window.setTimeout(() => {
      if (editingId) {
        update(editingId, { ...payload, status: 'pending' })
        setStatus(editingId, 'pending')
        toast.success('已提交修改', '修改后的信息需重新审核')
      } else {
        const created = add(payload)
        toast.success('发布成功', '信息已提交审核，演示环境将在 3 秒后自动通过')
        window.setTimeout(() => {
          useListingStore.getState().setStatus(created.id, 'active')
        }, 3000)
      }
      setSubmitting(false)
      navigate('/user/listings')
    }, 700)
  }

  return (
    <>
      <section className="border-b border-line/70 bg-cream">
        <div className="shell py-6">
          <Breadcrumb items={[{ label: '产销对接', to: '/market' }, { label: editingId ? '编辑信息' : '发布信息' }]} />
          <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow">Publish · 信息发布</p>
              <h1 className="mt-2 text-display-sm font-semibold text-forest">
                {editingId ? '编辑供需信息' : '发布一条供需信息'}
              </h1>
              <p className="mt-2 max-w-xl text-[12.5px] leading-relaxed text-muted">
                信息越完整，越容易被匹配。标题建议包含「产地 + 品种 + 关键指标」，质检数据写在描述里可显著提高询价率。
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-[11.5px] text-muted">
              <Info size={13} className="text-moss" />
              提交后进入审核，通过后在大厅展示
            </div>
          </div>
        </div>
      </section>

      <section className="shell py-8 lg:py-10">
        <div className="grid gap-5 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div className="space-y-4">
              {/* 类型 */}
              <div className="rounded-panel border border-line bg-white p-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-[14px] font-semibold text-forest">信息类型</h2>
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">Step 01</span>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {[
                    { value: 'supply' as ListingType, label: '我要供应', desc: '我有货源，寻找采购商', icon: Package },
                    { value: 'demand' as ListingType, label: '我要采购', desc: '我有需求，寻找供应商', icon: ShoppingBasket },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => set('type', opt.value)}
                      className={cn(
                        'flex items-start gap-3 rounded-xl border p-4 text-left transition',
                        form.type === opt.value
                          ? 'border-forest bg-forest/[0.04]'
                          : 'border-line hover:border-moss/40',
                      )}
                    >
                      <span
                        className={cn(
                          'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                          form.type === opt.value ? 'bg-forest text-cream' : 'bg-sand text-moss',
                        )}
                      >
                        <opt.icon size={16} />
                      </span>
                      <span>
                        <span className="block text-[13.5px] font-medium text-forest">{opt.label}</span>
                        <span className="mt-0.5 block text-[11.5px] text-muted">{opt.desc}</span>
                      </span>
                      {form.type === opt.value && <CheckCircle2 size={16} className="ml-auto mt-1 shrink-0 text-moss" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* 基本信息 */}
              <div className="rounded-panel border border-line bg-white p-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-[14px] font-semibold text-forest">产品与数量</h2>
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">Step 02</span>
                </div>

                <div className="mt-4 space-y-4">
                  <Field
                    label="信息标题"
                    required
                    error={errors.title}
                    htmlFor="title"
                    counter={`${form.title.length}/50`}
                    hint="例：黑龙江绥化 2026 年新季玉米 容重 710g/L 可烘干"
                  >
                    <Input
                      id="title"
                      value={form.title}
                      onChange={(e) => set('title', e.target.value.slice(0, 50))}
                      placeholder="产地 + 品种 + 关键指标"
                      error={!!errors.title}
                    />
                  </Field>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="产品分类" required htmlFor="category">
                      <Select
                        id="category"
                        value={form.category}
                        onChange={(e) => set('category', e.target.value as ProduceCategory)}
                      >
                        {PRODUCE_CATEGORY_OPTIONS.map((c) => (
                          <option key={c.value} value={c.value}>
                            {c.label}
                          </option>
                        ))}
                      </Select>
                    </Field>
                    <Field label="质量等级 / 关键指标" htmlFor="quality" hint="如容重、水分、糖度、规格">
                      <Input
                        id="quality"
                        value={form.quality}
                        onChange={(e) => set('quality', e.target.value)}
                        placeholder="如：水分 14%，容重 710g/L"
                      />
                    </Field>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <Field label={form.type === 'supply' ? '供应数量' : '采购数量'} required error={errors.quantity} htmlFor="qty">
                      <Input
                        id="qty"
                        value={form.quantity}
                        onChange={(e) => set('quantity', e.target.value.replace(/[^\d.]/g, ''))}
                        placeholder="0.00"
                        inputMode="decimal"
                        error={!!errors.quantity}
                      />
                    </Field>
                    <Field label="计量单位" htmlFor="unit">
                      <Select id="unit" value={form.unit} onChange={(e) => set('unit', e.target.value)}>
                        {UNIT_OPTIONS.map((u) => (
                          <option key={u} value={u}>
                            {u}
                          </option>
                        ))}
                      </Select>
                    </Field>
                    <Field label={form.type === 'supply' ? '参考单价（元）' : '预算单价（元）'} required error={errors.price} htmlFor="price">
                      <Input
                        id="price"
                        value={form.price}
                        onChange={(e) => set('price', e.target.value.replace(/[^\d.]/g, ''))}
                        placeholder="0.00"
                        inputMode="decimal"
                        error={!!errors.price}
                      />
                    </Field>
                  </div>

                  {form.type === 'demand' && (
                    <Field label="可接受价格上限（元）" error={errors.priceMax} htmlFor="priceMax" hint="留空表示价格可议">
                      <Input
                        id="priceMax"
                        value={form.priceMax}
                        onChange={(e) => set('priceMax', e.target.value.replace(/[^\d.]/g, ''))}
                        placeholder="0.00"
                        inputMode="decimal"
                        error={!!errors.priceMax}
                      />
                    </Field>
                  )}

                  <div className="grid gap-4 sm:grid-cols-3">
                    <Field label="省份" required htmlFor="province">
                      <Select
                        id="province"
                        value={form.province}
                        onChange={(e) => {
                          set('province', e.target.value)
                          const first = REGION_CITIES[e.target.value]?.[0]
                          if (first) set('city', first)
                        }}
                      >
                        {REGIONS.filter((r) => r !== '全国').map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </Select>
                    </Field>
                    <Field label="城市" required htmlFor="city">
                      <Select id="city" value={form.city} onChange={(e) => set('city', e.target.value)}>
                        {(cities.length ? cities : [form.city]).map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </Select>
                    </Field>
                    <Field label="发货 / 交付时间" htmlFor="delivery">
                      <Input
                        id="delivery"
                        value={form.delivery}
                        onChange={(e) => set('delivery', e.target.value)}
                        placeholder="如：7 天内可发运"
                      />
                    </Field>
                  </div>

                  <Field
                    label="详细描述"
                    required
                    error={errors.description}
                    htmlFor="desc"
                    counter={`${form.description.length}/600`}
                    hint="说明产地、加工方式、质检情况、包装、装运方式与合作期望"
                  >
                    <Textarea
                      id="desc"
                      value={form.description}
                      onChange={(e) => set('description', e.target.value.slice(0, 600))}
                      placeholder="例：合作社自有种植基地 1.2 万亩，本季玉米已烘干入库，可提供质检报告。支持整车皮发运，可到库看货。"
                      className="min-h-[120px]"
                      error={!!errors.description}
                    />
                  </Field>
                </div>
              </div>

              {/* 图片与联系 */}
              <div className="rounded-panel border border-line bg-white p-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-[14px] font-semibold text-forest">图片与联系方式</h2>
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">Step 03</span>
                </div>

                <div className="mt-4 grid gap-5 sm:grid-cols-[200px_1fr]">
                  <div>
                    {image ? (
                      <div className="relative overflow-hidden rounded-xl border border-line">
                        <img src={image} alt="产品图预览" className="h-[140px] w-full object-cover" />
                        <button
                          onClick={() => setImage('')}
                          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-[#A63E28]"
                          aria-label="删除图片"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ) : (
                      <label className="flex h-[140px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-line bg-sand/20 text-center transition hover:border-moss/50">
                        <CloudUpload size={20} className="text-moss" />
                        <span className="mt-2 text-[11.5px] text-ink/70">上传产品图</span>
                        <span className="mt-0.5 text-[10px] text-muted">JPG / PNG / WEBP ≤ 8MB</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="sr-only"
                          onChange={(e) => {
                            const f = e.target.files?.[0]
                            if (f) void handleImage(f)
                          }}
                        />
                      </label>
                    )}
                    {imageError && <p className="mt-1.5 text-[11.5px] text-[#A63E28]">{imageError}</p>}
                    <p className="mt-2 flex items-start gap-1 text-[10.5px] leading-relaxed text-muted">
                      <Camera size={11} className="mt-0.5 shrink-0" />
                      建议上传实拍图，避免使用网络图片
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="联系人" required error={errors.contactName} htmlFor="cname">
                        <Input
                          id="cname"
                          value={form.contactName}
                          onChange={(e) => set('contactName', e.target.value)}
                          placeholder="真实姓名"
                          error={!!errors.contactName}
                        />
                      </Field>
                      <Field label="联系电话" required error={errors.contact} htmlFor="cphone" hint="仅向登录用户展示，默认脱敏">
                        <Input
                          id="cphone"
                          value={form.contact}
                          onChange={(e) => set('contact', e.target.value.replace(/[^\d]/g, '').slice(0, 11))}
                          placeholder="11 位手机号"
                          inputMode="tel"
                          error={!!errors.contact}
                        />
                      </Field>
                    </div>
                    <Checkbox
                      checked={form.agree}
                      onChange={(v) => set('agree', v)}
                      label="我承诺所发布信息真实有效，并同意平台对信息进行审核与展示"
                      description={errors.agree ? errors.agree : '虚假信息将被下架并影响账号信用'}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 rounded-panel border border-line bg-white p-5">
                <Button size="lg" onClick={submit} loading={submitting} className="min-w-[160px]">
                  {editingId ? '保存修改' : '提交发布'}
                </Button>
                <Button variant="ghost" size="lg" onClick={() => navigate(-1)}>
                  取消
                </Button>
                <span className="text-[11.5px] text-muted">发布即表示同意《平台信息发布规范》（演示）</span>
              </div>
            </div>
          </div>

          <aside className="space-y-4 lg:col-span-4">
            <div className="rounded-panel border border-line bg-white p-5">
              <h3 className="text-[13.5px] font-semibold text-forest">发布预览</h3>
              <div className="mt-3 overflow-hidden rounded-xl border border-line">
                <div className="relative h-28">
                  <img
                    src={image || PRODUCE_IMAGES[0]}
                    alt="预览"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-forest-950/70 to-transparent" />
                  <span className="absolute left-2 top-2 rounded bg-forest/85 px-1.5 py-0.5 text-[9.5px] text-cream">
                    {PRODUCE_CATEGORY_LABEL[form.category]}
                  </span>
                </div>
                <div className="p-3">
                  <p className="line-clamp-2 min-h-[34px] text-[12.5px] font-medium text-forest">
                    {form.title || '标题将显示在这里'}
                  </p>
                  <p className="num mt-1.5 text-[14px] font-semibold text-forest">
                    {form.type === 'supply' ? '￥' : '预算 ￥'}
                    {form.price || '0'}
                    {form.priceMax ? `–${form.priceMax}` : ''}
                    <span className="ml-0.5 text-[10px] font-normal text-muted">/{form.unit}</span>
                  </p>
                  <p className="mt-1 text-[10.5px] text-muted">
                    {form.province} {form.city} · {form.quantity || '0'} {form.unit}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-panel border border-line bg-sand/40 p-5">
              <h3 className="flex items-center gap-1.5 text-[13px] font-semibold text-forest">
                <AlertTriangle size={13} className="text-[#9A6420]" /> 提高成交率的写法
              </h3>
              <ul className="mt-3 space-y-2 text-[11.5px] leading-relaxed text-ink/70">
                <li>· 标题写清产地、品种与关键指标，不要只写「大量出售」</li>
                <li>· 描述中注明质检方式与可否看货，减少对方顾虑</li>
                <li>· 明确装运方式（散装 / 袋装 / 集装箱）与运费承担</li>
                <li>· 采购需求写清用途与验收标准，便于供应商判断</li>
              </ul>
            </div>

            <div className="rounded-panel border border-line bg-white p-5">
              <h3 className="text-[13px] font-semibold text-forest">审核说明</h3>
              <p className="mt-2 text-[11.5px] leading-relaxed text-muted">
                平台将核对标题、联系方式与价格合理性。演示环境中提交后 3 秒自动通过审核，可在「个人中心 - 我的供需信息」中编辑、下架或删除。
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  )
}
