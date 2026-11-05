import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Address, Order, OrderItem, OrderStatus } from '../types'
import { uid } from '../lib/utils'

interface CreateOrderInput {
  items: OrderItem[]
  total: number
  freight: number
  address: Address
  remark?: string
}

interface OrderState {
  orders: Order[]
  create: (input: CreateOrderInput) => Order
  updateStatus: (id: string, status: OrderStatus) => void
  cancel: (id: string) => void
  confirmReceipt: (id: string) => void
  remove: (id: string) => void
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set) => ({
      orders: [],
      create: (input) => {
        const now = new Date()
        const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
          now.getDate(),
        ).padStart(2, '0')}`
        const order: Order = {
          id: `AG${stamp}${String(Math.floor(Math.random() * 9000) + 1000)}`,
          items: input.items,
          total: input.total,
          freight: input.freight,
          address: input.address,
          status: 'pending',
          createdAt: now.toISOString(),
          remark: input.remark,
          simulated: true,
        }
        set((state) => ({ orders: [order, ...state.orders] }))
        return order
      },
      updateStatus: (id, status) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === id
              ? {
                  ...o,
                  status,
                  paidAt: status === 'paid' ? new Date().toISOString() : o.paidAt,
                }
              : o,
          ),
        })),
      cancel: (id) =>
        set((state) => ({
          orders: state.orders.map((o) => (o.id === id ? { ...o, status: 'cancelled' as const } : o)),
        })),
      confirmReceipt: (id) =>
        set((state) => ({
          orders: state.orders.map((o) => (o.id === id ? { ...o, status: 'completed' as const } : o)),
        })),
      remove: (id) => set((state) => ({ orders: state.orders.filter((o) => o.id !== id) })),
    }),
    { name: 'agrilink:orders', version: 1 },
  ),
)

/** 演示用：模拟支付与履约推进（不涉及任何真实资金流转） */
export function simulateOrderFlow(orderId: string) {
  const store = useOrderStore.getState()
  const order = store.orders.find((o) => o.id === orderId)
  if (!order) return
  store.updateStatus(orderId, 'paid')
  window.setTimeout(() => useOrderStore.getState().updateStatus(orderId, 'shipped'), 4200)
}

export function newOrderId() {
  return uid('AG')
}
