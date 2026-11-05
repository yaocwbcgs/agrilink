import { create } from 'zustand'
import type { ToastMessage } from '../types'
import { uid } from '../lib/utils'

interface UiState {
  toasts: ToastMessage[]
  toast: (input: Omit<ToastMessage, 'id'>) => void
  dismiss: (id: string) => void
  region: string
  setRegion: (region: string) => void
  regionOpen: boolean
  setRegionOpen: (open: boolean) => void
  searchOpen: boolean
  setSearchOpen: (open: boolean) => void
  navOpen: boolean
  setNavOpen: (open: boolean) => void
}

export const useUiStore = create<UiState>((set) => ({
  toasts: [],
  toast: (input) => {
    const id = uid('toast')
    set((state) => ({ toasts: [...state.toasts, { ...input, id }].slice(-4) }))
    window.setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
    }, 3600)
  },
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
  region: '全国',
  setRegion: (region) => set({ region }),
  regionOpen: false,
  setRegionOpen: (regionOpen) => set({ regionOpen }),
  searchOpen: false,
  setSearchOpen: (searchOpen) => set({ searchOpen }),
  navOpen: false,
  setNavOpen: (navOpen) => set({ navOpen }),
}))

export const toast = {
  success: (title: string, description?: string) =>
    useUiStore.getState().toast({ title, description, variant: 'success' }),
  error: (title: string, description?: string) =>
    useUiStore.getState().toast({ title, description, variant: 'error' }),
  info: (title: string, description?: string) =>
    useUiStore.getState().toast({ title, description, variant: 'info' }),
}
