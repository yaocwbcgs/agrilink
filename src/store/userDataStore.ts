import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppNotification, FavoriteRef, FavoriteType, Inquiry } from '../types'
import { uid } from '../lib/utils'

/* ----------------------------- 收藏 ----------------------------- */

interface FavoriteState {
  items: FavoriteRef[]
  toggle: (ref: Omit<FavoriteRef, 'addedAt'>) => boolean
  isFavorite: (type: FavoriteType, id: string) => boolean
  remove: (type: FavoriteType, id: string) => void
}

export const useFavoriteStore = create<FavoriteState>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (ref) => {
        const exists = get().items.some((i) => i.type === ref.type && i.id === ref.id)
        if (exists) {
          set((state) => ({
            items: state.items.filter((i) => !(i.type === ref.type && i.id === ref.id)),
          }))
          return false
        }
        set((state) => ({ items: [{ ...ref, addedAt: new Date().toISOString() }, ...state.items] }))
        return true
      },
      isFavorite: (type, id) => get().items.some((i) => i.type === type && i.id === id),
      remove: (type, id) =>
        set((state) => ({ items: state.items.filter((i) => !(i.type === type && i.id === id)) })),
    }),
    { name: 'agrilink:favorites', version: 1 },
  ),
)

/* ----------------------------- 询价 ----------------------------- */

interface InquiryState {
  items: Inquiry[]
  create: (input: {
    listingId: string
    listingTitle: string
    sellerName: string
    quantity: number
    unit: string
    offerPrice: number
    message: string
    contact: string
  }) => Inquiry
  markRead: (id: string) => void
  close: (id: string) => void
}

export const useInquiryStore = create<InquiryState>()(
  persist(
    (set) => ({
      items: [],
      create: (input) => {
        const inquiry: Inquiry = {
          ...input,
          id: uid('IQ'),
          createdAt: new Date().toISOString(),
          status: 'waiting',
        }
        set((state) => ({ items: [inquiry, ...state.items] }))
        window.setTimeout(() => {
          set((state) => ({
            items: state.items.map((i) =>
              i.id === inquiry.id
                ? {
                    ...i,
                    status: 'replied' as const,
                    reply: '您好，货已备好，可按您需要的规格装车。价格可再商谈，方便的话请留一个可回拨的电话。',
                  }
                : i,
            ),
          }))
        }, 6000)
        return inquiry
      },
      markRead: (id) =>
        set((state) => ({ items: state.items.map((i) => (i.id === id ? { ...i, status: 'replied' as const } : i)) })),
      close: (id) =>
        set((state) => ({ items: state.items.map((i) => (i.id === id ? { ...i, status: 'closed' as const } : i)) })),
    }),
    { name: 'agrilink:inquiries', version: 1 },
  ),
)

/* ----------------------------- 通知 ----------------------------- */

const seedNotifications = (): AppNotification[] => {
  const now = Date.now()
  return [
    {
      id: 'nt-1',
      title: '你的供应信息已通过审核',
      body: '「河南周口 优质强筋小麦」已在供应大厅展示，采购商可直接发起询价。',
      kind: 'trade',
      createdAt: new Date(now - 1000 * 60 * 26).toISOString(),
      read: false,
      link: '/user/listings',
    },
    {
      id: 'nt-2',
      title: '农机预约已被确认',
      body: '东方红 LX2404 将于预约日 08:00 前到达作业地块，机手会在前一日联系你。',
      kind: 'booking',
      createdAt: new Date(now - 1000 * 60 * 60 * 5).toISOString(),
      read: false,
      link: '/user/bookings',
    },
    {
      id: 'nt-3',
      title: '行情提醒：玉米价格连续 3 日上行',
      body: '玉米参考价较上周上涨 1.2%，建议关注售粮节奏与深加工开机情况。',
      kind: 'system',
      createdAt: new Date(now - 1000 * 60 * 60 * 26).toISOString(),
      read: true,
      link: '/prices',
    },
  ]
}

interface NotificationState {
  items: AppNotification[]
  push: (input: { title: string; body: string; kind: AppNotification['kind']; link?: string }) => void
  markAllRead: () => void
  markRead: (id: string) => void
  remove: (id: string) => void
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      items: seedNotifications(),
      push: (input) =>
        set((state) => ({
          items: [
            { ...input, id: uid('nt'), createdAt: new Date().toISOString(), read: false },
            ...state.items,
          ],
        })),
      markAllRead: () => set((state) => ({ items: state.items.map((n) => ({ ...n, read: true })) })),
      markRead: (id) =>
        set((state) => ({ items: state.items.map((n) => (n.id === id ? { ...n, read: true } : n)) })),
      remove: (id) => set((state) => ({ items: state.items.filter((n) => n.id !== id) })),
    }),
    { name: 'agrilink:notifications', version: 1 },
  ),
)

export const useUnreadCount = () => useNotificationStore((s) => s.items.filter((n) => !n.read).length)
