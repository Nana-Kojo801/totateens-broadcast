import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { DashboardPage } from '@/pages/dashboard'
import { UploadPage } from '@/pages/upload'
import { MessagesPage } from '@/pages/messages'
import { CalendarPage } from '@/pages/calendar'
import { GroupsPage } from '@/pages/groups'
import { HistoryPage } from '@/pages/history'
import { SettingsPage } from '@/pages/settings'
import { TemplatesPage } from '@/pages/templates'
import { TemplateEditorPage } from '@/pages/template-editor'
import { MorePage } from '@/pages/more'
import { NotFoundPage } from '@/pages/not-found'
import { OfflinePage } from '@/pages/offline'
import { AppShell } from '@/components/app-shell'

export default function App() {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine)

  useEffect(() => {
    const goOnline = () => setIsOnline(true)
    const goOffline = () => setIsOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  // The window starts hidden (see tauri.conf.json) so the OS never shows a
  // blank white frame before our own UI has painted. Reveal it right after
  // the first real paint — double rAF guarantees the browser has actually
  // painted, not just that React committed. A fallback timeout shows the
  // window regardless in case something on the way to first paint hangs, so
  // a stuck load doesn't leave the app invisible forever. Lives here (not
  // AppShell) so it fires no matter which screen renders first, including
  // the offline screen. No-ops outside a real Tauri build (e.g. browser dev).
  useEffect(() => {
    let cancelled = false
    const reveal = () => {
      if (cancelled) return
      cancelled = true
      getCurrentWindow().show().catch(() => undefined)
    }
    const raf1 = requestAnimationFrame(() => requestAnimationFrame(reveal))
    const fallback = setTimeout(reveal, 3000)
    return () => {
      cancelled = true
      cancelAnimationFrame(raf1)
      clearTimeout(fallback)
    }
  }, [])

  if (!isOnline) {
    return <OfflinePage onRetry={() => setIsOnline(navigator.onLine)} />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="upload" element={<UploadPage />} />
          <Route path="messages/:day?" element={<MessagesPage />} />
          <Route path="groups" element={<GroupsPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="templates" element={<TemplatesPage />} />
          <Route path="templates/new" element={<TemplateEditorPage />} />
          <Route path="templates/:id" element={<TemplateEditorPage />} />
          <Route path="more" element={<MorePage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
