import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem } from '../types'

interface CartState {
  items: CartItem[]
  add: (productId: string, qty: number, spec: string) => void
  remove: (productId: string, spec: string) => void
  setQty: (productId: string, spec: string, qty: number) => void
  clear: () => void
  removeByKeys: (keys: string[]) => void
}

const keyOf = (productId: string, spec: string) => `${productId}|${spec}`

export const cartKey = keyOf

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (productId, qty, spec) =>
        set((state) => {
          const target = state.items.find((i) => keyOf(i.productId, i.spec) === keyOf(productId, spec))
          if (target) {
            return {
              items: state.items.map((i) =>
                keyOf(i.productId, i.spec) === keyOf(productId, spec) ? { ...i, qty: i.qty + qty } : i,
              ),
            }
          }
          return { items: [...state.items, { productId, qty, spec }] }
        }),
      remove: (productId, spec) =>
        set((state) => ({
          items: state.items.filter((i) => keyOf(i.productId, i.spec) !== keyOf(productId, spec)),
        })),
      setQty: (productId, spec, qty) =>
        set((state) => ({
          items: state.items
            .map((i) =>
              keyOf(i.productId, i.spec) === keyOf(productId, spec) ? { ...i, qty: Math.max(1, qty) } : i,
            )
            .filter((i) => i.qty > 0),
        })),
      clear: () => set({ items: [] }),
      removeByKeys: (keys) =>
        set((state) => ({
          items: state.items.filter((i) => !keys.includes(keyOf(i.productId, i.spec))),
        })),
    }),
    { name: 'agrilink:cart', version: 1 },
  ),
)
