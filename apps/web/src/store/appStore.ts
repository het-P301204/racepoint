import { create } from 'zustand'

interface AppNotification {
  id: string
  type: 'success' | 'warning' | 'error' | 'info'
  message: string
  createdAt: number
}

interface AppState {
  mode: 'demo' | 'local-lab'
  commandPaletteOpen: boolean
  isRefreshing: boolean
  lastRefreshed: Date | null
  notifications: AppNotification[]
  activeRunId: string | null
  setMode: (mode: 'demo' | 'local-lab') => void
  setCommandPaletteOpen: (open: boolean) => void
  setIsRefreshing: (refreshing: boolean) => void
  setLastRefreshed: (date: Date) => void
  addNotification: (n: Omit<AppNotification, 'id' | 'createdAt'>) => void
  removeNotification: (id: string) => void
  setActiveRunId: (id: string | null) => void
}

export const useAppStore = create<AppState>((set) => ({
  mode: 'demo',
  commandPaletteOpen: false,
  isRefreshing: false,
  lastRefreshed: null,
  notifications: [],
  activeRunId: null,
  setMode: (mode) => set({ mode }),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  setIsRefreshing: (isRefreshing) => set({ isRefreshing }),
  setLastRefreshed: (lastRefreshed) => set({ lastRefreshed }),
  addNotification: (n) => set((s) => ({
    notifications: [
      ...s.notifications,
      { ...n, id: Math.random().toString(36).slice(2), createdAt: Date.now() },
    ],
  })),
  removeNotification: (id) => set((s) => ({
    notifications: s.notifications.filter((x) => x.id !== id),
  })),
  setActiveRunId: (activeRunId) => set({ activeRunId }),
}))
