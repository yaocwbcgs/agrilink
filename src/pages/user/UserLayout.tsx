import { NavLink, Outlet, Link } from 'react-router-dom'
import {
  BadgeCheck,
  Bell,
  ClipboardList,
  Heart,
  LayoutGrid,
  MapPin,
  MessageSquare,
  Package,
  Settings,
  ShoppingBasket,
  Tractor,
  UserCog,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useListingStore } from '../../store/businessStore'
import { useBookingStore } from '../../store/businessStore'
import { useOrderStore } from '../../store/orderStore'
import { useFavoriteStore, useInquiryStore, useUnreadCount } from '../../store/userDataStore'
import { USER_ROLE_LABEL } from '../../lib/constants'
import { cn } from '../../lib/utils'

export const USER_NAV = [
  { to: '/user', label: '账户概览', icon: LayoutGrid, end: true },
  { to: '/user/listings', label: '我的供需信息', icon: ClipboardList },
  { to: '/user/bookings', label: '我的农机预约', icon: Tractor },
  { to: '/user/orders', label: '我的订单', icon: Package },
  { to: '/user/inquiries', label: '我的询价', icon: MessageSquare },
  { to: '/user/favorites', label: '我的收藏', icon: Heart },
  { to: '/user/addresses', label: '地址管理', icon: MapPin },
  { to: '/user/notifications', label: '消息通知', icon: Bell },
  { to: '/user/profile', label: '个人资料', icon: UserCog },
  { to: '/user/settings', label: '账户设置', icon: Settings },
]

export function UserLayout() {
  const user = useAuthStore((s) => s.user)
  const listings = useListingStore((s) => s.own)
  const bookings = useBookingStore((s) => s.bookings)
  const orders = useOrderStore((s) => s.orders)
  const favorites = useFavoriteStore((s) => s.items)
  const inquiries = useInquiryStore((s) => s.items)
  const unread = useUnreadCount()

  if (!user) {
    return (
      <div className="shell py-20">
        <div className="mx-auto max-w-md rounded-panel border border-line bg-white p-8 text-center shadow-card">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sand text-moss">
            <LayoutGrid size={22} />
          </span>
          <h1 className="mt-4 text-[20px] font-semibold text-forest">登录后查看个人中心</h1>
          <p className="mt-2 text-[12.5px] leading-relaxed text-muted">
            个人中心包含供需信息、农机预约、订单、收藏、询价与地址管理。演示环境可直接使用预填账号登录。
          </p>
          <div className="mt-5 flex justify-center gap-2">
            <Link
              to="/login?redirect=/user"
              className="rounded-[10px] border border-forest bg-forest px-4 py-2.5 text-[12.5px] font-medium text-cream"
            >
              去登录
            </Link>
            <Link
              to="/register"
              className="rounded-[10px] border border-line px-4 py-2.5 text-[12.5px] text-forest"
            >
              注册账号
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const counters: Record<string, number> = {
    '/user/listings': listings.length,
    '/user/bookings': bookings.length,
    '/user/orders': orders.length,
    '/user/inquiries': inquiries.length,
    '/user/favorites': favorites.length,
    '/user/notifications': unread,
  }

  const stats = [
    { label: '供需信息', value: listings.length, to: '/user/listings' },
    { label: '农机预约', value: bookings.length, to: '/user/bookings' },
    { label: '订单', value: orders.length, to: '/user/orders' },
    { label: '收藏', value: favorites.length, to: '/user/favorites' },
  ]

  return (
    <>
      <section className="relative overflow-hidden border-b border-line/70 bg-cream">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-grid opacity-50"
          style={{ maskImage: 'radial-gradient(80% 100% at 100% 0%, black, transparent 70%)' }}
        />
        <div className="shell relative py-8 lg:py-10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <span
                className="flex h-16 w-16 items-center justify-center rounded-2xl text-[22px] font-medium text-cream shadow-card"
                style={{ background: user.avatarColor }}
              >
                {user.name.slice(0, 1)}
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-[22px] font-semibold text-forest">{user.name}</h1>
                  {user.verified && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-[#C6DCCB] bg-[#E8F1E9] px-2 py-0.5 text-[10px] text-[#2C6450]">
                      <BadgeCheck size={10} /> {user.verifiedType}
                    </span>
                  )}
                  <span className="rounded-full border border-line bg-white px-2 py-0.5 text-[10px] text-muted">
                    {USER_ROLE_LABEL[user.role]}
                  </span>
                </div>
                <p className="mt-1.5 text-[12px] text-muted">
                  {user.region} · {user.phone.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2')}
                  {user.company ? ` · ${user.company}` : ''}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 sm:gap-3">
              {stats.map((s) => (
                <Link
                  key={s.label}
                  to={s.to}
                  className="rounded-xl border border-line bg-white px-3 py-2.5 text-center transition hover:border-moss/40 hover:shadow-sm"
                >
                  <p className="num text-[18px] font-semibold leading-none text-forest">{s.value}</p>
                  <p className="mt-1.5 text-[10.5px] text-muted">{s.label}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="shell py-6 lg:py-8">
        <div className="grid gap-5 lg:grid-cols-[232px_1fr]">
          <aside className="lg:sticky lg:top-[92px] lg:self-start">
            <div className="rounded-panel border border-line bg-white p-2">
              {USER_NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[12.5px] transition',
                      isActive ? 'bg-forest text-cream' : 'text-ink/70 hover:bg-sand/60 hover:text-forest',
                    )
                  }
                >
                  <item.icon size={14} />
                  <span className="flex-1">{item.label}</span>
                  {counters[item.to] > 0 && (
                    <span
                      className={cn(
                        'num rounded-full px-1.5 py-0.5 text-[9.5px]',
                        'bg-sand text-forest',
                      )}
                    >
                      {counters[item.to]}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>

            <div className="mt-3 rounded-panel border border-line bg-sand/40 p-4">
              <p className="flex items-center gap-1.5 text-[11.5px] font-medium text-forest">
                <ShoppingBasket size={12} /> 演示提示
              </p>
              <p className="mt-2 text-[10.5px] leading-relaxed text-muted">
                账号与业务数据保存在本地浏览器（localStorage），清除浏览器数据会一并清除。演示环境不连接真实支付与物流。
              </p>
              <p className="mt-2 num text-[10px] text-muted/70">注册时间 {user.joinedAt.slice(0, 10)}</p>
            </div>
          </aside>

          <div className="min-w-0">
            <Outlet />
          </div>
        </div>
      </section>
    </>
  )
}

export function UserPageHeader({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-[18px] font-semibold text-forest">{title}</h2>
        {description && <p className="mt-1 text-[11.5px] text-muted">{description}</p>}
      </div>
      {action}
    </div>
  )
}

export function UserEmpty({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-panel border border-dashed border-line bg-white/60 px-6 py-14 text-center">
      <p className="text-[14px] font-medium text-forest">{title}</p>
      <p className="mx-auto mt-2 max-w-sm text-[12px] leading-relaxed text-muted">{description}</p>
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  )
}
