import { useState } from 'react'
import { BadgeCheck, Save, ShieldCheck } from 'lucide-react'
import { UserPageHeader } from './UserLayout'
import { Button } from '../../components/ui/Button'
import { Field, Input, Select, Textarea } from '../../components/ui/Form'
import { useAuthStore } from '../../store/authStore'
import { toast } from '../../store/uiStore'
import { REGIONS, USER_ROLE_LABEL } from '../../lib/constants'
import { isPhone, fmtDate } from '../../lib/utils'
import type { UserRole } from '../../types'

const ROLES: UserRole[] = ['farmer', 'coop', 'enterprise', 'supplier', 'machinery', 'buyer']

export default function UserProfile() {
  const user = useAuthStore((s) => s.user)
  const updateProfile = useAuthStore((s) => s.updateProfile)
  const verify = useAuthStore((s) => s.verify)

  const [form, setForm] = useState({
    name: user?.name ?? '',
    phone: user?.phone ?? '',
    region: user?.region ?? '黑龙江省',
    company: user?.company ?? '',
    role: user?.role ?? 'farmer',
    bio: user?.bio ?? '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  if (!user) return null

  const save = () => {
    const next: Record<string, string> = {}
    if (form.name.trim().length < 2) next.name = '名称至少 2 个字'
    if (!isPhone(form.phone)) next.phone = '请输入有效手机号'
    if (form.bio.length > 120) next.bio = '简介不超过 120 字'
    setErrors(next)
    if (Object.keys(next).length) return
    updateProfile({
      name: form.name.trim(),
      phone: form.phone,
      region: form.region,
      company: form.company || undefined,
      role: form.role,
      bio: form.bio,
    })
    toast.success('资料已保存')
  }

  return (
    <div>
      <UserPageHeader title="个人资料" description="资料会展示在供需信息与询价记录中，建议保持真实有效。" />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-panel border border-line bg-white p-5 lg:col-span-2">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="姓名 / 企业名称" required error={errors.name} htmlFor="n">
                <Input id="n" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={!!errors.name} />
              </Field>
              <Field label="手机号" required error={errors.phone} htmlFor="p">
                <Input
                  id="p"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/[^\d]/g, '').slice(0, 11) })}
                  error={!!errors.phone}
                  inputMode="tel"
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="所在地区" htmlFor="r">
                <Select id="r" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })}>
                  {REGIONS.filter((r) => r !== '全国').map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="身份" htmlFor="role">
                <Select id="role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}>
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {USER_ROLE_LABEL[r]}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            <Field label="企业 / 合作社名称" htmlFor="c" hint="选填，填写后会在信息中展示">
              <Input id="c" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="如：丰禾种植专业合作社" />
            </Field>

            <Field label="简介" htmlFor="b" counter={`${form.bio.length}/120`} hint="介绍你的种植结构、主要品类或采购需求">
              <Textarea
                id="b"
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value.slice(0, 120) })}
                placeholder="例：种植玉米 1200 亩、大豆 400 亩，长期供应优质干粮。"
              />
            </Field>

            <div className="flex items-center gap-3 pt-1">
              <Button onClick={save} iconLeft={<Save size={14} />}>
                保存修改
              </Button>
              <span className="text-[10.5px] text-muted">修改后立即生效，仅保存在本机</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-panel border border-line bg-white p-5">
            <p className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-muted">Account</p>
            <div className="mt-3 flex items-center gap-3">
              <span
                className="flex h-12 w-12 items-center justify-center rounded-xl text-[18px] font-medium text-cream"
                style={{ background: user.avatarColor }}
              >
                {user.name.slice(0, 1)}
              </span>
              <div>
                <p className="text-[13.5px] font-medium text-forest">{user.name}</p>
                <p className="mt-0.5 text-[10.5px] text-muted">{USER_ROLE_LABEL[user.role]}</p>
              </div>
            </div>
            <dl className="mt-4 space-y-2 border-t border-line/70 pt-3 text-[11.5px]">
              <div className="flex justify-between">
                <dt className="text-muted">注册时间</dt>
                <dd className="num text-ink/80">{fmtDate(user.joinedAt)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">账号 ID</dt>
                <dd className="num text-ink/80">{user.id.slice(0, 12)}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-panel border border-line bg-white p-5">
            <p className="flex items-center gap-1.5 text-[12.5px] font-medium text-forest">
              <ShieldCheck size={13} /> 实名认证
            </p>
            {user.verified ? (
              <>
                <p className="mt-2 flex items-center gap-1.5 text-[11.5px] text-[#2C6450]">
                  <BadgeCheck size={13} /> {user.verifiedType}
                </p>
                <p className="mt-2 text-[10.5px] leading-relaxed text-muted">
                  认证信息仅用于平台内的信任标识展示。演示环境不采集证件信息。
                </p>
              </>
            ) : (
              <>
                <p className="mt-2 text-[11.5px] text-muted">完成认证后，发布的信息会显示认证标识，询价转化率更高。</p>
                <Button
                  size="sm"
                  className="mt-3"
                  block
                  onClick={() => {
                    verify()
                    toast.success('认证已完成（演示）', '已获得实名认证标识')
                  }}
                >
                  模拟完成认证
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
