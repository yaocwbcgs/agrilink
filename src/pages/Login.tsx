import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Phone, ShieldCheck, Sparkles } from 'lucide-react'
import { LogoMark } from '../components/layout/Logo'
import { Button } from '../components/ui/Button'
import { Field, Input } from '../components/ui/Form'
import { IMG } from '../data/images'
import { useAuthStore } from '../store/authStore'
import { toast } from '../store/uiStore'
import { isPhone } from '../lib/utils'
import { USER_ROLE_LABEL } from '../lib/constants'
import type { UserRole } from '../types'

const ROLES: UserRole[] = ['farmer', 'coop', 'enterprise', 'buyer']

export default function Login() {
  const [params] = useSearchParams()
  const redirect = params.get('redirect') || '/user'
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)

  const [phone, setPhone] = useState('13800136621')
  const [code, setCode] = useState('')
  const [role, setRole] = useState<UserRole>('farmer')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    if (countdown <= 0) return
    const timer = window.setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [countdown])

  const sendCode = () => {
    if (!isPhone(phone)) {
      setErrors({ phone: '请输入有效的手机号' })
      return
    }
    setCountdown(60)
    toast.success('验证码已发送', '演示环境验证码：888888（不会真实发送短信）')
  }

  const submit = () => {
    const next: Record<string, string> = {}
    if (!isPhone(phone)) next.phone = '请输入有效的手机号'
    if (!/^\d{6}$/.test(code)) next.code = '请输入 6 位验证码'
    setErrors(next)
    if (Object.keys(next).length) return
    if (code !== '888888' && code !== '123456') {
      setErrors({ code: '验证码不正确，演示环境请使用 888888' })
      return
    }
    const user = login({ phone, role })
    toast.success('登录成功', `欢迎回来，${user.name}`)
    navigate(redirect, { replace: true })
  }

  return (
    <div className="grid min-h-[calc(100vh-104px)] lg:grid-cols-2">
      {/* 品牌侧 */}
      <div className="relative hidden overflow-hidden bg-forest lg:block">
        <img src={IMG.heroField} alt="麦田日出" className="absolute inset-0 h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-950 via-forest-950/80 to-forest-950/50" />
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
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-cream/40">Since 2026</p>
            <h2 className="mt-4 max-w-md text-[30px] font-semibold leading-tight text-cream">
              让每一块地
              <br />
              都有数据可依
            </h2>
            <p className="mt-4 max-w-sm text-[13px] leading-relaxed text-cream/55">
              从识别一片叶子的病斑，到把一车粮食卖给真正需要的人。平台把生产端的判断与交易端的连接放在同一处。
            </p>

            <div className="mt-8 grid max-w-md grid-cols-3 gap-3">
              {[
                { v: '128,600', l: '服务农户' },
                { v: '3,842', l: '入驻企业' },
                { v: '26,480', l: '供需信息' },
              ].map((s) => (
                <div key={s.l} className="rounded-xl border border-cream/12 bg-cream/[0.05] px-3 py-3">
                  <p className="num text-[16px] font-semibold text-cream">{s.v}</p>
                  <p className="mt-0.5 text-[10px] text-cream/45">{s.l}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.14em] text-cream/30">Demo data</p>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-cream/40">
            <ShieldCheck size={13} /> 演示环境：数据保存在本地浏览器，不上传服务器
          </div>
        </div>
      </div>

      {/* 表单侧 */}
      <div className="flex items-center justify-center px-5 py-12 sm:px-8">
        <div className="w-full max-w-[400px]">
          <div className="lg:hidden">
            <LogoMark size={36} />
          </div>
          <p className="eyebrow mt-6 lg:mt-0">Sign in</p>
          <h1 className="mt-2 text-[26px] font-semibold text-forest">登录耘链</h1>
          <p className="mt-2 text-[12.5px] text-muted">
            使用手机号验证码登录。演示环境可使用预填手机号与验证码 888888。
          </p>

          <div className="mt-7 space-y-4">
            <Field label="手机号" required error={errors.phone} htmlFor="phone">
              <div className="relative">
                <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value.replace(/[^\d]/g, '').slice(0, 11))
                    setErrors({})
                  }}
                  placeholder="11 位手机号"
                  inputMode="tel"
                  className="pl-9"
                  error={!!errors.phone}
                />
              </div>
            </Field>

            <Field label="验证码" required error={errors.code} htmlFor="code">
              <div className="flex gap-2">
                <Input
                  id="code"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.replace(/[^\d]/g, '').slice(0, 6))
                    setErrors({})
                  }}
                  placeholder="6 位数字"
                  inputMode="numeric"
                  error={!!errors.code}
                />
                <Button
                  variant="secondary"
                  className="w-[112px] shrink-0 px-0 text-[12px]"
                  onClick={sendCode}
                  disabled={countdown > 0}
                  type="button"
                >
                  {countdown > 0 ? `${countdown}s 后重发` : '获取验证码'}
                </Button>
              </div>
            </Field>

            <Field label="演示身份" hint="不同身份在个人中心看到的业务入口不同">
              <div className="grid grid-cols-2 gap-2">
                {ROLES.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={
                      role === r
                        ? 'rounded-lg border border-forest bg-forest px-3 py-2 text-[12px] text-cream'
                        : 'rounded-lg border border-line bg-white px-3 py-2 text-[12px] text-ink/70 hover:border-moss/40'
                    }
                  >
                    {USER_ROLE_LABEL[r]}
                  </button>
                ))}
              </div>
            </Field>

            <Button block size="lg" onClick={submit} iconRight={<ArrowRight size={15} />}>
              登录 / 注册
            </Button>

            <div className="flex items-center justify-between text-[11.5px]">
              <Link to="/register" className="text-moss hover:text-forest">
                没有账号？创建新账号
              </Link>
              <button
                onClick={() => {
                  setPhone('13800136621')
                  setCode('888888')
                  toast.info('已填入演示账号', '点击登录即可进入')
                }}
                className="flex items-center gap-1 text-muted hover:text-forest"
              >
                <Sparkles size={11} /> 一键填入演示账号
              </button>
            </div>

            <div className="rounded-xl border border-line bg-sand/40 p-4">
              <p className="flex items-center gap-1.5 text-[11.5px] font-medium text-forest">
                <CheckCircle2 size={12} className="text-moss" /> 登录后可使用的功能
              </p>
              <ul className="mt-2 grid grid-cols-2 gap-1.5 text-[10.5px] text-muted">
                <li>· 发布与管理供需信息</li>
                <li>· 预约农机作业</li>
                <li>· 购物车与订单跟踪</li>
                <li>· 收藏与询价记录</li>
              </ul>
            </div>
          </div>

          <p className="mt-6 text-center text-[10.5px] leading-relaxed text-muted">
            登录即表示同意《用户协议》与《隐私政策》（演示文本）。
            <br />
            本环境不采集真实个人信息，不做短信发送。
          </p>
        </div>
      </div>
    </div>
  )
}
