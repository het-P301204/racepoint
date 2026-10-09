import { create } from 'zustand'
import type { ResearchRun } from '@racepoint/shared'

interface TimelineState {
  selectedRun: ResearchRun | null
  playbackState: 'idle' | 'playing' | 'paused' | 'completed'
  currentTimeMs: number
  playbackSpeed: 0.5 | 1 | 2 | 4
  viewMode: 'vulnerable' | 'hardened'
  selectedEventId: string | null
  setSelectedRun: (run: ResearchRun | null) => void
  setPlaybackState: (s: 'idle' | 'playing' | 'paused' | 'completed') => void
  setCurrentTimeMs: (ms: number) => void
  setPlaybackSpeed: (s: 0.5 | 1 | 2 | 4) => void
  setViewMode: (m: 'vulnerable' | 'hardened') => void
  setSelectedEventId: (id: string | null) => void
}

export const useTimelineStore = create<TimelineState>((set) => ({
  selectedRun: null,
  playbackState: 'idle',
  currentTimeMs: 0,
  playbackSpeed: 1,
  viewMode: 'vulnerable',
  selectedEventId: null,
  setSelectedRun: (selectedRun) => set({ selectedRun, currentTimeMs: 0, playbackState: 'idle' }),
  setPlaybackState: (playbackState) => set({ playbackState }),
  setCurrentTimeMs: (currentTimeMs) => set({ currentTimeMs }),
  setPlaybackSpeed: (playbackSpeed) => set({ playbackSpeed }),
  setViewMode: (viewMode) => set({ viewMode }),
  setSelectedEventId: (selectedEventId) => set({ selectedEventId }),
}))
