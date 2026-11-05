import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BellRing,
  CalendarClock,
  ClipboardList,
  Heart,
  Package,
  Plus,
  ScanLine,
  Sparkles,
  Tractor,
  TrendingUp,
} from 'lucide-react'
import { UserPageHeader } from './UserLayout'
import { Badge } from '../../components/ui/Badge'
import { useAuthStore } from '../../store/authStore'
import { useBookingStore, useListingStore } from '../../store/businessStore'
import { useOrderStore } from '../../store/orderStore'
import { useFavoriteStore, useNotificationStore, useInquiryStore } from '../../store/userDataStore'
import { BOOKING_STATUS_LABEL, LISTING_STATUS_LABEL, ORDER_STATUS_LABEL } from '../../lib/constants'
import { cn, fmtDate, fmtNumber } from '../../lib/utils'
import { ProductVisual } from '../../components/ui/ProductVisual'

export default function UserOverview() {
  const user = useAuthStore((s) => s.user)
  const listings = useListingStore((s) => s.own)
  const bookings = useBookingStore((s) => s.bookings)
  const orders = useOrderStore((s) => s.orders)
  const favorites = useFavoriteStore((s) => s.items)
  const inquiries = useInquiryStore((s) => s.items)
  const notifications = useNotificationStore((s) => s.items)

  const pendingOrders = orders.filter((o) => o.status === 'pending').length
  const pendingBookings = bookings.filter((b) => b.status === 'pending' || b.status === 'confirmed').length
  const pendingListings = listings.filter((l) => l.status === 'pending').length
  const unread = notifications.filter((n) => !n.read).length
  const repliedInquiries = inquiries.filter((i) => i.status === 'replied').length

  const todos = [
    { label: '待付款订单', value: pendingOrders, to: '/user/orders', icon: Package },
    { label: '进行中预约', value: pendingBookings, to: '/user/bookings', icon: Tractor },
    { label: '审核中信息', value: pendingListings, to: '/user/listings', icon: ClipboardList },
    { label: '未读消息', value: unread, to: '/user/notifications', icon: BellRing },
  ]

  const quickLinks = [
    { label: '发布供需信息', to: '/market/publish', icon: Plus },
    { label: '病虫害识别', to: '/disease', icon: ScanLine },
    { label: '查看行情', to: '/prices', icon: TrendingUp },
    { label: '继续选购', to: '/shop', icon: Package },
  ]

  return (
    <div>
      <UserPageHeader
        title={`你好，${user?.name ?? ''}`}
        description="这里是你的业务工作台：待办、最近动态与快捷入口都在这一页。"
        action={
          <Link
            to="/market/publish"
            className="inline-flex items-center gap-1.5 rounded-[10px] border border-forest bg-forest px-3.5 py-2 text-[12px] font-medium text-cream transition hover:bg-forest-950"
          >
            <Plus size={13} /> 发布信息
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {todos.map((t) => (
          <Link
            key={t.label}
            to={t.to}
            className="group rounded-panel border border-line bg-white p-4 transition hover:-translate-y-0.5 hover:border-moss/40 hover:shadow-card"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-moss/[0.08] text-moss">
                <t.icon size={15} />
              </span>
              <ArrowRight size={13} className="text-muted/40 transition group-hover:translate-x-0.5 group-hover:text-moss" />
            </div>
            <p className="num mt-3 text-[24px] font-semibold leading-none text-forest">{t.value}</p>
            <p className="mt-1.5 text-[11.5px] text-muted">{t.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-4 grid items-start gap-4 lg:grid-cols-2">
        {/* 最近订单 */}
        <div className="rounded-panel border border-line bg-white">
          <div className="flex items-center justify-between border-b border-line/70 px-5 py-3.5">
            <h3 className="text-[13.5px] font-semibold text-forest">最近订单</h3>
            <Link to="/user/orders" className="text-[11px] text-moss hover:text-forest">
              全部
            </Link>
          </div>
          <div className="p-4">
            {orders.length === 0 ? (
              <p className="py-6 text-center text-[12px] text-muted">
                还没有订单，
                <Link to="/shop" className="text-moss underline">
                  去农资商城看看
                </Link>
              </p>
            ) : (
              <div className="space-y-2.5">
                {orders.slice(0, 3).map((o) => (
                  <Link
                    key={o.id}
                    to="/user/orders"
                    className="flex items-center gap-3 rounded-lg border border-line/70 p-2.5 transition hover:border-moss/40"
                  >
                    <ProductVisual glyph={o.items[0].glyph} size="sm" className="h-10 w-10 rounded-md" showLabel={false} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12px] font-medium text-forest">{o.items[0].name}</p>
                      <p className="num mt-0.5 text-[10.5px] text-muted">
                        {o.id} · {fmtDate(o.createdAt)}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="num text-[12.5px] font-medium text-forest">￥{fmtNumber(o.total)}</p>
                      <p className="mt-0.5 text-[10px] text-muted">{ORDER_STATUS_LABEL[o.status]}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 最近预约 */}
        <div className="rounded-panel border border-line bg-white">
          <div className="flex items-center justify-between border-b border-line/70 px-5 py-3.5">
            <h3 className="text-[13.5px] font-semibold text-forest">最近农机预约</h3>
            <Link to="/user/bookings" className="text-[11px] text-moss hover:text-forest">
              全部
            </Link>
          </div>
          <div className="p-4">
            {bookings.length === 0 ? (
              <p className="py-6 text-center text-[12px] text-muted">
                还没有预约，
                <Link to="/machinery" className="text-moss underline">
                  去找农机
                </Link>
              </p>
            ) : (
              <div className="space-y-2.5">
                {bookings.slice(0, 3).map((b) => (
                  <Link
                    key={b.id}
                    to="/user/bookings"
                    className="flex items-center gap-3 rounded-lg border border-line/70 p-2.5 transition hover:border-moss/40"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-sand text-moss">
                      <Tractor size={16} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12px] font-medium text-forest">{b.machineryName}</p>
                      <p className="num mt-0.5 text-[10.5px] text-muted">
                        {b.date} · {b.area} 亩
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="num text-[12.5px] font-medium text-forest">￥{fmtNumber(b.amount)}</p>
                      <p className="mt-0.5 text-[10px] text-muted">{BOOKING_STATUS_LABEL[b.status]}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 我的发布 */}
        <div className="rounded-panel border border-line bg-white">
          <div className="flex items-center justify-between border-b border-line/70 px-5 py-3.5">
            <h3 className="text-[13.5px] font-semibold text-forest">我发布的信息</h3>
            <Link to="/user/listings" className="text-[11px] text-moss hover:text-forest">
              管理
            </Link>
          </div>
          <div className="p-4">
            {listings.length === 0 ? (
              <p className="py-6 text-center text-[12px] text-muted">
                还没有发布，
                <Link to="/market/publish" className="text-moss underline">
                  发布第一条
                </Link>
              </p>
            ) : (
              <div className="space-y-2.5">
                {listings.slice(0, 3).map((l) => (
                  <Link key={l.id} to="/user/listings" className="flex items-center justify-between gap-3 rounded-lg border border-line/70 p-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-[12px] font-medium text-forest">{l.title}</p>
                      <p className="num mt-0.5 text-[10.5px] text-muted">
                        {l.quantity} {l.unit} · ￥{fmtNumber(l.price)}
                      </p>
                    </div>
                    <Badge tone={l.status === 'active' ? 'green' : l.status === 'pending' ? 'amber' : 'neutral'}>
                      {LISTING_STATUS_LABEL[l.status]}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 快捷入口 + 账户状态 */}
        <div className="rounded-panel border border-line bg-white p-5">
          <h3 className="text-[13.5px] font-semibold text-forest">快捷入口</h3>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {quickLinks.map((q) => (
              <Link
                key={q.to}
                to={q.to}
                className="flex items-center gap-2 rounded-lg border border-line px-3 py-2.5 text-[11.5px] text-ink/75 transition hover:border-moss/40 hover:text-forest"
              >
                <q.icon size={13} className="text-moss" />
                {q.label}
              </Link>
            ))}
          </div>

          <div className="mt-4 space-y-2 border-t border-line/70 pt-4">
            <div className="flex items-center justify-between text-[11.5px]">
              <span className="flex items-center gap-1.5 text-muted">
                <Sparkles size={12} /> 实名认证
              </span>
              <span className={cn('font-medium', user?.verified ? 'text-[#2C6450]' : 'text-[#9A6420]')}>
                {user?.verified ? user.verifiedType : '未认证'}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11.5px]">
              <span className="flex items-center gap-1.5 text-muted">
                <Heart size={12} /> 收藏内容
              </span>
              <span className="num text-ink/80">{favorites.length} 条</span>
            </div>
            <div className="flex items-center justify-between text-[11.5px]">
              <span className="flex items-center gap-1.5 text-muted">
                <CalendarClock size={12} /> 已回复询价
              </span>
              <span className="num text-ink/80">{repliedInquiries} 条</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
