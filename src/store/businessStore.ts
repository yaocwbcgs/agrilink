import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Booking, BookingStatus, Listing, ListingStatus } from '../types'
import { uid } from '../lib/utils'

interface ListingState {
  own: Listing[]
  add: (listing: Omit<Listing, 'id' | 'createdAt' | 'views' | 'status' | 'ownerId'>) => Listing
  update: (id: string, patch: Partial<Listing>) => void
  remove: (id: string) => void
  setStatus: (id: string, status: ListingStatus) => void
  bumpViews: (id: string) => void
}

export const useListingStore = create<ListingState>()(
  persist(
    (set) => ({
      own: [],
      add: (input) => {
        const listing: Listing = {
          ...input,
          id: uid('ls'),
          createdAt: new Date().toISOString(),
          views: 0,
          status: 'pending',
          ownerId: 'me',
        }
        set((state) => ({ own: [listing, ...state.own] }))
        return listing
      },
      update: (id, patch) =>
        set((state) => ({
          own: state.own.map((l) => (l.id === id ? { ...l, ...patch } : l)),
        })),
      remove: (id) => set((state) => ({ own: state.own.filter((l) => l.id !== id) })),
      setStatus: (id, status) =>
        set((state) => ({ own: state.own.map((l) => (l.id === id ? { ...l, status } : l)) })),
      bumpViews: (id) =>
        set((state) => ({
          own: state.own.map((l) => (l.id === id ? { ...l, views: l.views + 1 } : l)),
        })),
    }),
    { name: 'agrilink:listings', version: 1 },
  ),
)

interface BookingState {
  bookings: Booking[]
  create: (input: Omit<Booking, 'id' | 'createdAt' | 'status'>) => Booking
  setStatus: (id: string, status: BookingStatus) => void
  review: (id: string, rating: number, text: string) => void
  remove: (id: string) => void
}

export const useBookingStore = create<BookingState>()(
  persist(
    (set) => ({
      bookings: [],
      create: (input) => {
        const booking: Booking = {
          ...input,
          id: uid('BK'),
          createdAt: new Date().toISOString(),
          status: 'pending',
        }
        set((state) => ({ bookings: [booking, ...state.bookings] }))
        window.setTimeout(() => {
          useBookingStore.setState((state) => ({
            bookings: state.bookings.map((b) =>
              b.id === booking.id && b.status === 'pending' ? { ...b, status: 'confirmed' } : b,
            ),
          }))
        }, 5000)
        return booking
      },
      setStatus: (id, status) =>
        set((state) => ({
          bookings: state.bookings.map((b) => (b.id === id ? { ...b, status } : b)),
        })),
      review: (id, rating, text) =>
        set((state) => ({
          bookings: state.bookings.map((b) =>
            b.id === id ? { ...b, rating, review: text, status: 'completed' as const } : b,
          ),
        })),
      remove: (id) => set((state) => ({ bookings: state.bookings.filter((b) => b.id !== id) })),
    }),
    { name: 'agrilink:bookings', version: 1 },
  ),
)
