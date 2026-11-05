import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, Building2, CheckCircle2, Phone, ShieldCheck, User } from 'lucide-react'
import { LogoMark } from '../components/layout/Logo'
import { Button } from '../components/ui/Button'
import { Checkbox, Field, Input, Select } from '../components/ui/Form'
import { IMG } from '../data/images'
import { useAuthStore } from '../store/authStore'
import { toast } from '../store/uiStore'
import { isPhone } from '../lib/utils'
import { REGIONS, USER_ROLE_LABEL } from '../lib/constants'
import type { UserRole } from '../types'
import { cn } from '../lib/utils'

const ROLE_CARDS: { value: UserRole; desc: string; icon: typeof User }[] = [
  { value: 'farmer', desc: '种植户、家庭农场', icon: User },
  { value: 'coop', desc: '合作社、村集体', icon: User },
  { value: 'enterprise', desc: '农业企业、加工厂', icon: Building2 },
  { value: 'supplier', desc: '农资经销与生产', icon: Building2 },
  { value: 'machinery', desc: '农机服务与机手', icon: Building2 },
  { value: 'buyer', desc: '采购商、渠道商', icon: Building2 },
]

export default function Register() {
  const [params] = useSearchParams()
  const redirect = params.get('redirect') || '/user'
  const navigate = useNavigate()
  const register = useAuthStore((s) => s.register)

  const [form, setForm] = useState({
    name: '',
    phone: '',
    code: '',
    role: 'farmer' as UserRole,
    region: '黑龙江省',
    company: '',
    agree: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    if (countdown <= 0) return
    const timer = window.setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [countdown])

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => ({ ...e, [key]: '' }))
  }

  const submit = () => {
    const next: Record<string, string> = {}
    if (form.name.trim().length < 2) next.name = '请填写真实姓名或企业名称'
    if (!isPhone(form.phone)) next.phone = '请输入有效的手机号'
    if (!/^\d{6}$/.test(form.code)) next.code = '请输入 6 位验证码'
    if (!form.agree) next.agree = '请阅读并同意用户协议'
    setErrors(next)
    if (Object.keys(next).length) return
    if (form.code !== '888888' && form.code !== '123456') {
      setErrors({ code: '验证码不正确，演示环境请使用 888888' })
      return
    }
    const user = register({
      name: form.name.trim(),
      phone: form.phone,
      role: form.role,
      region: form.region,
      company: form.company || undefined,
    })
    toast.success('注册成功', `欢迎加入耘链，${user.name}`)
    navigate(redirect, { replace: true })
  }

  return (
    <div className="grid min-h-[calc(100vh-104px)] lg:grid-cols-[1fr_1.1fr]">
      <div className="relative hidden overflow-hidden bg-forest lg:block">
        <img src={IMG.plantingHands} alt="育苗移栽" className="absolute inset-0 h-full w-full object-cover opacity-35" />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-950 via-forest-950/85 to-forest-950/55" />
        <div className="grain absolute inset-0" />
        <div className="relative flex h-full flex-col justify-between p-10 xl:p-14">
          <div className="flex items-center gap-3">
            <LogoMark size={40} />
            <div>
              <p className="text-[16px] font-semibold tracking-[0.04em] text-cream">耘链农业</p>
              <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.3em] text-cream/45">Agri Link</p>
            </div>
          </div>

          <div>
            <h2 className="max-w-sm text-[28px] font-semibold leading-snug text-cream">
              注册后，你的每一次发布
              <br />
              都会留下可追踪的记录
            </h2>
            <ul className="mt-6 space-y-3">
              {[
                '供需信息在线管理，支持编辑、上下架与审核状态查看',
                '农机预约生成订单，作业完成后可评价',
                '购物车、收藏与地址在本机持久保存',
                '按身份展示对应的业务入口',
              ].map((t) => (
                <li key={t} className="flex items-start gap-2 text-[12px] leading-relaxed text-cream/60">
                  <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-sage" />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-cream/40">
            <ShieldCheck size={13} /> 演示环境：不采集真实身份信息，不做实名核验
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center px-5 py-12 sm:px-8">
        <div className="w-full max-w-[460px]">
          <div className="lg:hidden">
            <LogoMark size={36} />
          </div>
          <p className="eyebrow mt-6 lg:mt-0">Create account</p>
          <h1 className="mt-2 text-[26px] font-semibold text-forest">创建耘链账号</h1>
          <p className="mt-2 text-[12.5px] text-muted">填写基本信息即可体验完整业务流，演示验证码 888888。</p>

          <div className="mt-7 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="姓名 / 企业名称" required error={errors.name} htmlFor="name">
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  placeholder="如：王建国"
                  error={!!errors.name}
                />
              </Field>
              <Field label="手机号" required error={errors.phone} htmlFor="rphone">
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <Input
                    id="rphone"
                    value={form.phone}
                    onChange={(e) => set('phone', e.target.value.replace(/[^\d]/g, '').slice(0, 11))}
                    placeholder="11 位手机号"
                    inputMode="tel"
                    className="pl-9"
                    error={!!errors.phone}
                  />
                </div>
              </Field>
            </div>

            <Field label="验证码" required error={errors.code} htmlFor="rcode">
              <div className="flex gap-2">
                <Input
                  id="rcode"
                  value={form.code}
                  onChange={(e) => set('code', e.target.value.replace(/[^\d]/g, '').slice(0, 6))}
                  placeholder="6 位数字"
                  inputMode="numeric"
                  error={!!errors.code}
                />
                <Button
                  variant="secondary"
                  className="w-[112px] shrink-0 px-0 text-[12px]"
                  type="button"
                  disabled={countdown > 0}
                  onClick={() => {
                    if (!isPhone(form.phone)) {
                      setErrors({ phone: '请输入有效的手机号' })
                      return
                    }
                    setCountdown(60)
                    toast.success('验证码已发送', '演示环境验证码：888888')
                  }}
                >
                  {countdown > 0 ? `${countdown}s 后重发` : '获取验证码'}
                </Button>
              </div>
            </Field>

            <Field label="我的身份" required hint="身份决定个人中心的业务入口，可后续在设置中调整">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {ROLE_CARDS.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => set('role', r.value)}
                    className={cn(
                      'rounded-lg border px-2.5 py-2 text-left transition',
                      form.role === r.value
                        ? 'border-forest bg-forest text-cream'
                        : 'border-line bg-white hover:border-moss/40',
                    )}
                  >
                    <p className={cn('text-[11.5px] font-medium', form.role === r.value ? 'text-cream' : 'text-forest')}>
                      {USER_ROLE_LABEL[r.value]}
                    </p>
                    <p className={cn('mt-0.5 text-[9.5px]', form.role === r.value ? 'text-cream/55' : 'text-muted')}>
                      {r.desc}
                    </p>
                  </button>
                ))}
              </div>
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="所在地区" required htmlFor="region">
                <Select id="region" value={form.region} onChange={(e) => set('region', e.target.value)}>
                  {REGIONS.filter((r) => r !== '全国').map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="企业 / 合作社名称" htmlFor="company" hint="选填">
                <Input
                  id="company"
                  value={form.company}
                  onChange={(e) => set('company', e.target.value)}
                  placeholder="如：丰禾种植专业合作社"
                />
              </Field>
            </div>

            <div>
              <Checkbox
                checked={form.agree}
                onChange={(v) => set('agree', v)}
                label="我已阅读并同意《用户协议》与《隐私政策》（演示文本）"
                description={errors.agree}
              />
            </div>

            <Button block size="lg" onClick={submit} iconRight={<ArrowRight size={15} />}>
              创建账号
            </Button>

            <p className="text-center text-[11.5px] text-muted">
              已有账号？{' '}
              <Link to="/login" className="text-moss hover:text-forest">
                直接登录
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
