import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Update } from '@tauri-apps/plugin-updater'

export type DayStatus = 'sent' | 'today' | 'upcoming' | 'missing'

export interface DevotionalDay {
  _id?: string
  d: number
  title: string
  verse: string
  ref: string
  body: string[]
  prayer: string[]
  // Overrides the "Prayer Points" heading for this day (e.g. "MUST DO",
  // "Proclamation"). Falls back to the active template's default when unset.
  prayerLabel?: string
  resolve: string
  status: DayStatus
  edited?: boolean
}

export interface WhatsAppGroup {
  _id?: string
  id: string
  name: string
  active: boolean
  groupId?: string
}

export interface HistoryEntry {
  _id?: string
  day: number
  sentAt: string
  groups: number
  delivered: number
  note?: string
  warn?: string
}

export interface PdfFile {
  name: string
  size: number
  uploadedAt: string
}

// 'unreachable' means the poll to the sidecar server itself failed (CORS,
// network, server not running) — distinct from 'disconnected', which means
// the server responded fine but WhatsApp itself isn't linked yet.
// 'authenticated' is the brief window after a QR scan where whatsapp-web.js
// is finishing its handshake but isn't fully 'connected' yet — shown so the
// old QR image doesn't just sit there looking unresponsive.
export type WaStatus = 'connected' | 'qr_pending' | 'disconnected' | 'loading' | 'unreachable' | 'authenticated'
export type UploadProgress = 'idle' | 'uploading' | 'parsing' | 'done' | 'error'

interface AppState {
  toast: string | null
  calendarStyle: 'tiles' | 'dots'
  selectedDay: number
  messageMode: 'preview' | 'edit'
  pendingEdit: DevotionalDay | null

  // WhatsApp connection state
  waStatus: WaStatus
  waQr: string | null

  // App auto-update state
  updateAvailable: Update | null

  // Month view state
  viewMonth: string

  // Upload state
  uploadProgress: UploadProgress
  uploadError: string | null

  setToast: (msg: string | null) => void
  setCalendarStyle: (style: 'tiles' | 'dots') => void
  setSelectedDay: (day: number) => void
  setMessageMode: (mode: 'preview' | 'edit') => void
  setPendingEdit: (day: DevotionalDay | null) => void

  setWaStatus: (status: WaStatus) => void
  setWaQr: (qr: string | null) => void

  setUpdateAvailable: (update: Update | null) => void

  setViewMonth: (month: string) => void

  setUploadProgress: (progress: UploadProgress) => void
  setUploadError: (error: string | null) => void
}

function currentMonthYear(): string {
  return new Date().toISOString().slice(0, 7)
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      toast: null,
      calendarStyle: 'tiles',
      selectedDay: 23,
      messageMode: 'preview',
      pendingEdit: null,

      waStatus: 'loading',
      waQr: null,

      updateAvailable: null,

      viewMonth: currentMonthYear(),

      uploadProgress: 'idle',
      uploadError: null,

      setToast: (msg) => {
        set({ toast: msg })
        if (msg) setTimeout(() => set((s) => (s.toast === msg ? { toast: null } : s)), 2400)
      },
      setCalendarStyle: (style) => set({ calendarStyle: style }),
      setSelectedDay: (day) => set({ selectedDay: day }),
      setMessageMode: (mode) => set({ messageMode: mode }),
      setPendingEdit: (day) => set({ pendingEdit: day }),

      setWaStatus: (status) => set({ waStatus: status }),
      setWaQr: (qr) => set({ waQr: qr }),

      setUpdateAvailable: (update) => set({ updateAvailable: update }),

      setViewMonth: (month) => set({ viewMonth: month }),

      setUploadProgress: (progress) => set({ uploadProgress: progress }),
      setUploadError: (error) => set({ uploadError: error }),
    }),
    {
      name: 'totateens-app-store',
      partialize: (s) => ({ viewMonth: s.viewMonth, calendarStyle: s.calendarStyle }),
    },
  ),
)
