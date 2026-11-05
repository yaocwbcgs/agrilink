import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Database, LogOut, MessageSquare, Trash2 } from 'lucide-react'
import { UserPageHeader } from './UserLayout'
import { Button } from '../../components/ui/Button'
import { ConfirmDialog } from '../../components/ui/Modal'
import { useAuthStore } from '../../store/authStore'
import { useCartStore } from '../../store/cartStore'
import { useListingStore, useBookingStore } from '../../store/businessStore'
import { useOrderStore } from '../../store/orderStore'
import { useFavoriteStore, useInquiryStore } from '../../store/userDataStore'
import { toast } from '../../store/uiStore'
import { cn } from '../../lib/utils'

const KEYS = [
  { key: 'agrilink:auth', label: '账号与地址' },
  { key: 'agrilink:cart', label: '购物车' },
  { key: 'agrilink:orders', label: '订单' },
  { key: 'agrilink:listings', label: '我的供需信息' },
  { key: 'agrilink:bookings', label: '农机预约' },
  { key: 'agrilink:favorites', label: '收藏' },
  { key: 'agrilink:inquiries', label: '询价记录' },
  { key: 'agrilink:notifications', label: '消息通知' },
]

export default function UserSettings() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const [prefs, setPrefs] = useState({
    priceAlert: true,
    orderNotice: true,
    tradeNotice: true,
    weeklyDigest: false,
  })
  const [confirmReset, setConfirmReset] = useState(false)

  if (!user) return null

  const resetAll = () => {
    KEYS.forEach((k) => localStorage.removeItem(k.key))
    useCartStore.setState({ items: [] })
    useOrderStore.setState({ orders: [] })
    useListingStore.setState({ own: [] })
    useBookingStore.setState({ bookings: [] })
    useFavoriteStore.setState({ items: [] })
    useInquiryStore.setState({ items: [] })
    toast.success('演示数据已清空', '页面将刷新以恢复初始状态')
    window.setTimeout(() => {
      logout()
      window.location.assign('/')
    }, 900)
  }

  return (
    <div>
      <UserPageHeader title="账户设置" description="通知开关、数据与账号安全设置。" />

      <div className="space-y-3">
        <div className="rounded-panel border border-line bg-white p-5">
          <h3 className="flex items-center gap-1.5 text-[13.5px] font-semibold text-forest">
            <MessageSquare size={13} /> 通知偏好
          </h3>
          <p className="mt-1 text-[11px] text-muted">演示环境不会真实推送，仅保存偏好设置。</p>
          <div className="mt-4 space-y-3">
            {[
              { key: 'priceAlert' as const, label: '行情提醒', desc: '关注品种价格波动超过阈值时提醒' },
              { key: 'orderNotice' as const, label: '订单动态', desc: '订单支付、发货与收货状态变化' },
              { key: 'tradeNotice' as const, label: '交易消息', desc: '供需信息审核结果与询价回复' },
              { key: 'weeklyDigest' as const, label: '农情周报', desc: '每周行情与农技要点摘要' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between gap-4 border-b border-line/60 pb-3 last:border-0 last:pb-0">
                <div>
                  <p className="text-[12.5px] text-ink/85">{item.label}</p>
                  <p className="mt-0.5 text-[10.5px] text-muted">{item.desc}</p>
                </div>
                <button
                  role="switch"
                  aria-checked={prefs[item.key]}
                  onClick={() => {
                    setPrefs((p) => ({ ...p, [item.key]: !p[item.key] }))
                    toast.info(`${item.label}已${prefs[item.key] ? '关闭' : '开启'}`)
                  }}
                  className={cn(
                    'relative h-6 w-11 shrink-0 rounded-full transition-colors',
                    prefs[item.key] ? 'bg-moss' : 'bg-line',
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform',
                      prefs[item.key] ? 'translate-x-[22px]' : 'translate-x-0.5',
                    )}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-panel border border-line bg-white p-5">
          <h3 className="flex items-center gap-1.5 text-[13.5px] font-semibold text-forest">
            <Database size={13} /> 数据存储
          </h3>
          <p className="mt-1 text-[11px] leading-relaxed text-muted">
            所有业务数据保存在浏览器 localStorage 中，键名前缀为 <span className="font-mono">agrilink:</span>。清除浏览器数据或更换设备后将无法恢复。
          </p>
          <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
            {KEYS.map((k) => (
              <div key={k.key} className="flex items-center justify-between rounded-lg border border-line/70 px-3 py-2">
                <span className="text-[11px] text-ink/70">{k.label}</span>
                <span className="font-mono text-[9px] text-muted/70">{k.key.replace('agrilink:', '')}</span>
              </div>
            ))}
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="mt-3"
            onClick={() => setConfirmReset(true)}
            iconLeft={<Trash2 size={13} />}
          >
            清空全部演示数据
          </Button>
        </div>

        <div className="rounded-panel border border-line bg-white p-5">
          <h3 className="flex items-center gap-1.5 text-[13.5px] font-semibold text-forest">
            <AlertTriangle size={13} className="text-[#9A6420]" /> 账号安全
          </h3>
          <div className="mt-3 space-y-3">
            <div className="flex items-center justify-between gap-3 rounded-lg border border-line/70 px-3.5 py-3">
              <div>
                <p className="text-[12px] text-ink/85">登录手机号</p>
                <p className="num mt-0.5 text-[11px] text-muted">{user.phone.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2')}</p>
              </div>
              <span className="text-[10.5px] text-muted">演示环境不可修改</span>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-lg border border-line/70 px-3.5 py-3">
              <div>
                <p className="text-[12px] text-ink/85">退出登录</p>
                <p className="mt-0.5 text-[11px] text-muted">退出后购物车与收藏仍会保留在本机</p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  logout()
                  toast.info('已退出登录')
                  navigate('/')
                }}
                iconLeft={<LogOut size={12} />}
              >
                退出
              </Button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={resetAll}
        title="清空全部演示数据"
        description="将删除账号、地址、订单、购物车、收藏、发布记录与消息通知，并退出登录。此操作不可撤销。"
        confirmLabel="确认清空"
      />
    </div>
  )
}
