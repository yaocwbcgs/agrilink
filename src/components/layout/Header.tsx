import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  Bell,
  ChevronDown,
  Heart,
  LayoutGrid,
  LogOut,
  MapPin,
  Menu,
  Package,
  Search,
  Settings,
  ShoppingCart,
  User as UserIcon,
} from 'lucide-react'
import { Logo } from './Logo'
import { RegionPicker } from './RegionPicker'
import { GlobalSearchOverlay } from './GlobalSearch'
import { Drawer } from '../ui/Modal'
import { Button } from '../ui/Button'
import { useAuthStore } from '../../store/authStore'
import { useCartStore } from '../../store/cartStore'
import { useNotificationStore, useUnreadCount } from '../../store/userDataStore'
import { useUiStore, toast } from '../../store/uiStore'
import { cn, relTime } from '../../lib/utils'
import { USER_ROLE_LABEL } from '../../lib/constants'

export const NAV_ITEMS = [
  { to: '/', label: '首页', end: true },
  { to: '/disease', label: '病虫害识别' },
  { to: '/market', label: '产销对接' },
  { to: '/machinery', label: '农机服务' },
  { to: '/shop', label: '农资商城' },
  { to: '/prices', label: '价格行情' },
  { to: '/news', label: '农业资讯' },
]

function useClickOutside<T extends HTMLElement>(onClose: () => void) {
  const ref = useRef<T | null>(null)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])
  return ref
}

function UserMenu() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const [open, setOpen] = useState(false)
  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false))
  const navigate = useNavigate()

  if (!user) {
    return (
      <div className="hidden items-center gap-1.5 sm:flex">
        <Link
          to="/login"
          className="rounded-[10px] px-3 py-2 text-[13px] font-medium text-forest transition hover:bg-forest/[0.06]"
        >
          登录
        </Link>
        <Link
          to="/register"
          className="rounded-[10px] border border-forest bg-forest px-3.5 py-2 text-[13px] font-medium text-cream transition hover:bg-forest-950"
        >
          注册
        </Link>
      </div>
    )
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-full border border-line bg-white py-1 pl-1 pr-2 transition hover:border-moss/50"
        aria-label="用户菜单"
        aria-expanded={open}
      >
        <span
          className="flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-medium text-cream"
          style={{ background: user.avatarColor }}
        >
          {user.name.slice(0, 1)}
        </span>
        <ChevronDown size={13} className={cn('text-muted transition', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute right-0 top-[calc(100%+10px)] w-60 overflow-hidden rounded-xl border border-line bg-white shadow-lift animate-scale-in">
          <div className="border-b border-line/70 px-4 py-3.5">
            <p className="text-[14px] font-medium text-forest">{user.name}</p>
            <p className="mt-0.5 text-[11.5px] text-muted">
              {USER_ROLE_LABEL[user.role]} · {user.region.split(' ')[0]}
            </p>
          </div>
          <div className="p-1.5">
            {[
              { to: '/user', label: '个人中心', icon: LayoutGrid },
              { to: '/user/orders', label: '我的订单', icon: Package },
              { to: '/user/favorites', label: '我的收藏', icon: Heart },
              { to: '/user/settings', label: '账户设置', icon: Settings },
            ].map((item) => (
              <button
                key={item.to}
                onClick={() => {
                  setOpen(false)
                  navigate(item.to)
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] text-ink/80 transition hover:bg-sand/60 hover:text-forest"
              >
                <item.icon size={14} className="text-muted" />
                {item.label}
              </button>
            ))}
          </div>
          <div className="border-t border-line/70 p-1.5">
            <button
              onClick={() => {
                setOpen(false)
                logout()
                toast.info('已退出登录', '本地保存的购物车与收藏仍然保留')
                navigate('/')
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] text-[#A63E28] transition hover:bg-[#F8E4DF]"
            >
              <LogOut size={14} />
              退出登录
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function NotificationDrawer() {
  const [open, setOpen] = useState(false)
  const items = useNotificationStore((s) => s.items)
  const markAllRead = useNotificationStore((s) => s.markAllRead)
  const markRead = useNotificationStore((s) => s.markRead)
  const unread = useUnreadCount()
  const navigate = useNavigate()

  return (
    <>
      <button
        onClick={() => {
          setOpen(true)
          window.setTimeout(markAllRead, 1600)
        }}
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-forest transition hover:bg-forest/[0.06]"
        aria-label={`消息通知${unread ? `，${unread} 条未读` : ''}`}
      >
        <Bell size={18} strokeWidth={1.7} />
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-clay px-1 text-[9px] font-semibold text-[#43290C]">
            {unread}
          </span>
        )}
      </button>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="消息通知"
        footer={
          <div className="flex items-center justify-between">
            <span className="num text-[11.5px] text-muted">{items.length} 条消息</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                markAllRead()
                toast.success('已全部标记为已读')
              }}
            >
              全部已读
            </Button>
          </div>
        }
      >
        <div className="space-y-2">
          {items.length === 0 && <p className="py-10 text-center text-[13px] text-muted">暂无消息</p>}
          {items.map((n) => (
            <button
              key={n.id}
              onClick={() => {
                markRead(n.id)
                if (n.link) {
                  setOpen(false)
                  navigate(n.link)
                }
              }}
              className={cn(
                'flex w-full flex-col gap-1 rounded-xl border px-3.5 py-3 text-left transition',
                n.read ? 'border-line/70 bg-white' : 'border-moss/25 bg-[#F1F5EE]',
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-[13px] font-medium text-forest">{n.title}</p>
                {!n.read && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-clay" />}
              </div>
              <p className="text-[12px] leading-relaxed text-muted">{n.body}</p>
              <p className="font-mono text-[10px] uppercase tracking-wide text-muted/70">{relTime(n.createdAt)}</p>
            </button>
          ))}
        </div>
      </Drawer>
    </>
  )
}

function MobileMenu() {
  const open = useUiStore((s) => s.navOpen)
  const setOpen = useUiStore((s) => s.setNavOpen)
  const setRegionOpen = useUiStore((s) => s.setRegionOpen)
  const region = useUiStore((s) => s.region)
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()

  return (
    <Drawer open={open} onClose={() => setOpen(false)} title="导航菜单">
      <nav className="space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              cn(
                'flex items-center justify-between rounded-lg px-3 py-3 text-[14px] transition',
                isActive ? 'bg-forest text-cream' : 'text-ink/80 hover:bg-sand/60',
              )
            }
          >
            {item.label}
            <span className="font-mono text-[10px] opacity-50">→</span>
          </NavLink>
        ))}
      </nav>
      <div className="mt-5 space-y-2 border-t border-line/70 pt-5">
        <button
          onClick={() => {
            setOpen(false)
            setRegionOpen(true)
          }}
          className="flex w-full items-center gap-2 rounded-lg border border-line bg-white px-3 py-2.5 text-[13px] text-ink/80"
        >
          <MapPin size={14} className="text-muted" /> 当前地区：{region}
        </button>
        {user ? (
          <button
            onClick={() => {
              setOpen(false)
              navigate('/user')
            }}
            className="flex w-full items-center gap-2 rounded-lg border border-line bg-white px-3 py-2.5 text-[13px] text-ink/80"
          >
            <UserIcon size={14} className="text-muted" /> 进入个人中心
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" size="sm" onClick={() => { setOpen(false); navigate('/login') }}>
              登录
            </Button>
            <Button size="sm" onClick={() => { setOpen(false); navigate('/register') }}>
              注册
            </Button>
          </div>
        )}
      </div>
    </Drawer>
  )
}

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const cartCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.qty, 0))
  const region = useUiStore((s) => s.region)
  const setRegionOpen = useUiStore((s) => s.setRegionOpen)
  const setSearchOpen = useUiStore((s) => s.setSearchOpen)
  const setNavOpen = useUiStore((s) => s.setNavOpen)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setNavOpen(false)
  }, [location.pathname, setNavOpen])

  return (
    <>
      <div className="hidden bg-forest text-cream/70 md:block">
        <div className="shell flex h-8 items-center justify-between text-[11px] tracking-[0.04em]">
          <div className="flex items-center gap-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-cream/50">Demo Environment</span>
            <span className="h-3 w-px bg-cream/20" />
            <span>演示环境：数据为示例数据，AI 识别为模拟服务</span>
          </div>
          <div className="flex items-center gap-4">
            <span>服务热线 400-820-6688</span>
            <span className="h-3 w-px bg-cream/20" />
            <Link to="/news" className="transition hover:text-cream">
              帮助中心
            </Link>
          </div>
        </div>
      </div>

      <header
        className={cn(
          'sticky top-0 z-50 transition-all duration-500',
          scrolled
            ? 'border-b border-line/80 bg-cream/88 shadow-[0_1px_0_rgba(23,61,50,0.04)] backdrop-blur-xl'
            : 'border-b border-transparent bg-cream',
        )}
      >
        <div className="shell flex h-[64px] items-center justify-between gap-4 lg:h-[74px]">
          <Logo compact={scrolled} />

          <nav className="hidden items-center gap-0.5 lg:flex" aria-label="主导航">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'group relative whitespace-nowrap rounded-lg px-3 py-2 text-[13.5px] transition-colors duration-300',
                    isActive ? 'font-medium text-forest' : 'text-ink/65 hover:text-forest',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {item.label}
                    <span
                      className={cn(
                        'absolute inset-x-3 -bottom-0.5 h-[2px] origin-left rounded-full bg-clay transition-transform duration-300',
                        isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100',
                      )}
                    />
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-0.5 sm:gap-1">
            <button
              onClick={() => setRegionOpen(true)}
              className="mr-1 hidden items-center gap-1 rounded-full border border-line bg-white px-2.5 py-1.5 text-[12px] text-ink/75 transition hover:border-moss/50 hover:text-forest xl:flex"
            >
              <MapPin size={12} className="text-moss" />
              <span className="max-w-[76px] truncate">{region}</span>
              <ChevronDown size={11} className="text-muted" />
            </button>

            <button
              onClick={() => setSearchOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-forest transition hover:bg-forest/[0.06]"
              aria-label="全局搜索"
            >
              <Search size={18} strokeWidth={1.7} />
            </button>

            <Link
              to="/cart"
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-forest transition hover:bg-forest/[0.06]"
              aria-label="购物车"
            >
              <ShoppingCart size={18} strokeWidth={1.7} />
              {cartCount > 0 && (
                <span className="num absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-forest px-1 text-[9px] font-semibold text-cream">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            <NotificationDrawer />
            <UserMenu />

            <button
              onClick={() => setNavOpen(true)}
              className="ml-0.5 flex h-9 w-9 items-center justify-center rounded-full text-forest transition hover:bg-forest/[0.06] lg:hidden"
              aria-label="打开菜单"
            >
              <Menu size={20} strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </header>

      <GlobalSearchOverlay />
      <RegionPicker />
      <MobileMenu />
    </>
  )
}
