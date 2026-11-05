import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Address, User, UserRole } from '../types'
import { uid } from '../lib/utils'

const AVATAR_COLORS = ['#173D32', '#34745B', '#7A857D', '#B07A3C', '#4B6355', '#2F5D50']

const DEFAULT_ADDRESSES: Address[] = [
  {
    id: 'addr-01',
    name: '王建国',
    phone: '13800136621',
    region: '黑龙江省 绥化市 北林区',
    detail: '东富镇丰禾合作社院内 1 号库',
    isDefault: true,
  },
  {
    id: 'addr-02',
    name: '王建国',
    phone: '13800136621',
    region: '山东省 潍坊市 寿光市',
    detail: '田柳镇现代农业示范园 B 区 12 号棚',
    isDefault: false,
  },
]

interface AuthState {
  user: User | null
  addresses: Address[]
  lastRegion: string
  login: (payload: { phone: string; role: UserRole; name?: string }) => User
  register: (payload: {
    name: string
    phone: string
    role: UserRole
    region: string
    company?: string
  }) => User
  logout: () => void
  updateProfile: (patch: Partial<User>) => void
  verify: () => void
  setRegion: (region: string) => void
  addAddress: (address: Omit<Address, 'id' | 'isDefault'> & { isDefault?: boolean }) => void
  updateAddress: (id: string, patch: Partial<Address>) => void
  removeAddress: (id: string) => void
  setDefaultAddress: (id: string) => void
}

function makeUser(payload: {
  name: string
  phone: string
  role: UserRole
  region?: string
  company?: string
}): User {
  const seed = payload.phone.slice(-1)
  return {
    id: `u_${payload.phone}`,
    name: payload.name,
    phone: payload.phone,
    role: payload.role,
    region: payload.region ?? '黑龙江省 绥化市',
    company: payload.company,
    avatarColor: AVATAR_COLORS[Number(seed) % AVATAR_COLORS.length],
    verified: true,
    verifiedType: payload.role === 'farmer' ? '个人实名' : '企业认证',
    bio: '关注玉米、大豆种植与产后销售，希望与更多采购商建立长期合作。',
    joinedAt: new Date().toISOString(),
  }
}

export const DEMO_PHONE = '13800136621'

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      addresses: DEFAULT_ADDRESSES,
      lastRegion: '全国',

      login: ({ phone, role, name }) => {
        const user = makeUser({
          name: name || (role === 'buyer' ? '林伟成' : '王建国'),
          phone,
          role,
        })
        set({ user })
        return user
      },

      register: ({ name, phone, role, region, company }) => {
        const user = makeUser({ name, phone, role, region, company })
        set({ user, lastRegion: region || '全国' })
        return user
      },

      logout: () => set({ user: null }),

      updateProfile: (patch) => {
        const user = get().user
        if (!user) return
        set({ user: { ...user, ...patch } })
      },

      verify: () => {
        const user = get().user
        if (!user) return
        set({
          user: {
            ...user,
            verified: true,
            verifiedType: user.role === 'farmer' || user.role === 'buyer' ? '个人实名' : '企业认证',
          },
        })
      },

      setRegion: (region) => set({ lastRegion: region }),

      addAddress: (address) => {
        const id = uid('addr')
        const isDefault = address.isDefault ?? get().addresses.length === 0
        set((state) => ({
          addresses: [
            ...state.addresses.map((a) => (isDefault ? { ...a, isDefault: false } : a)),
            { ...address, id, isDefault },
          ],
        }))
      },

      updateAddress: (id, patch) => {
        set((state) => ({
          addresses: state.addresses.map((a) => {
            if (a.id === id) return { ...a, ...patch }
            if (patch.isDefault) return { ...a, isDefault: false }
            return a
          }),
        }))
      },

      removeAddress: (id) => {
        set((state) => {
          const rest = state.addresses.filter((a) => a.id !== id)
          if (rest.length && !rest.some((a) => a.isDefault)) rest[0] = { ...rest[0], isDefault: true }
          return { addresses: rest }
        })
      },

      setDefaultAddress: (id) => {
        set((state) => ({
          addresses: state.addresses.map((a) => ({ ...a, isDefault: a.id === id })),
        }))
      },
    }),
    { name: 'agrilink:auth', version: 2 },
  ),
)
