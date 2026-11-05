import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Mail, MapPin, Phone } from 'lucide-react'
import { LogoMark } from './Logo'
import { BRAND } from '../../lib/constants'
import { toast } from '../../store/uiStore'
import { isEmail } from '../../lib/utils'

const COLUMNS = [
  {
    title: '平台服务',
    links: [
      { label: '病虫害智能识别', to: '/disease' },
      { label: '农产品产销对接', to: '/market' },
      { label: '农机共享服务', to: '/machinery' },
      { label: '农资采购商城', to: '/shop' },
      { label: '大宗作物行情', to: '/prices' },
    ],
  },
  {
    title: '知识与工具',
    links: [
      { label: '农业资讯', to: '/news' },
      { label: '病虫害知识库', to: '/disease/library' },
      { label: '智能供需匹配', to: '/market/match' },
      { label: '发布供需信息', to: '/market/publish' },
      { label: '全局搜索', to: '/search' },
    ],
  },
  {
    title: '用户中心',
    links: [
      { label: '个人资料', to: '/user' },
      { label: '我的订单', to: '/user/orders' },
      { label: '我的收藏', to: '/user/favorites' },
      { label: '地址管理', to: '/user/addresses' },
      { label: '消息通知', to: '/user/notifications' },
    ],
  },
]

export function Footer() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const subscribe = () => {
    if (!isEmail(email)) {
      setError('请输入有效的邮箱地址')
      return
    }
    setError('')
    setEmail('')
    toast.success('订阅成功', '每周行情与农技要点将发送至你的邮箱（演示环境不会真实发送）')
  }

  return (
    <footer className="relative mt-24 overflow-hidden bg-forest text-cream">
      <div className="grain pointer-events-none absolute inset-0" aria-hidden />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-16 select-none font-mono text-[180px] leading-none tracking-tighter text-cream/[0.035] sm:text-[260px]"
      >
        AGRI
      </div>

      <div className="shell relative py-14 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
          <div className="max-w-md">
            <div className="flex items-center gap-3">
              <LogoMark size={40} />
              <div>
                <p className="text-[17px] font-semibold tracking-[0.04em] text-cream">耘链农业</p>
                <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.32em] text-cream/45">Agri Link</p>
              </div>
            </div>
            <p className="mt-5 text-[13px] leading-relaxed text-cream/60">
              面向农户、合作社、农业企业与采购商的一站式数字农业服务平台。把技术、装备、农资与订单，稳定地送到每一块地。
            </p>

            <div className="mt-7">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cream/45">订阅农情周报</p>
              <div className="mt-2.5 flex max-w-sm items-center gap-2">
                <div className="relative flex-1">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-cream/35" />
                  <input
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setError('')
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && subscribe()}
                    placeholder="your@email.com"
                    className="h-10 w-full rounded-[10px] border border-cream/20 bg-cream/[0.06] pl-9 pr-3 text-[13px] text-cream placeholder:text-cream/30 focus:border-cream/40 focus:outline-none"
                    aria-label="订阅邮箱"
                  />
                </div>
                <button
                  onClick={subscribe}
                  className="h-10 shrink-0 rounded-[10px] bg-clay px-4 text-[13px] font-medium text-[#43290C] transition hover:bg-[#DE8F3C]"
                >
                  订阅
                </button>
              </div>
              {error && <p className="mt-1.5 text-[11.5px] text-[#F0B49F]">{error}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cream/40">{col.title}</p>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.to + link.label}>
                      <Link
                        to={link.to}
                        className="group inline-flex items-center gap-1 text-[12.5px] text-cream/65 transition hover:text-cream"
                      >
                        {link.label}
                        <ArrowUpRight
                          size={11}
                          className="opacity-0 transition group-hover:opacity-70"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 grid gap-4 border-t border-cream/12 pt-7 sm:grid-cols-3">
          {[
            { icon: Phone, label: '服务热线', value: BRAND.phone },
            { icon: Mail, label: '商务合作', value: BRAND.email },
            { icon: MapPin, label: '平台地址', value: BRAND.address },
          ].map((item) => (
            <div key={item.label} className="flex items-start gap-2.5">
              <item.icon size={14} className="mt-0.5 shrink-0 text-cream/40" />
              <div>
                <p className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-cream/35">{item.label}</p>
                <p className="mt-1 text-[12.5px] text-cream/70">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-cream/12 pt-6 text-[11px] text-cream/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 耘链农业 AGRI LINK · {BRAND.icp}</p>
          <p className="max-w-xl leading-relaxed">
            本站为产品演示环境：行情、识别与统计数据均为示例，不构成真实交易、诊疗或投资建议。
          </p>
        </div>
      </div>
    </footer>
  )
}
