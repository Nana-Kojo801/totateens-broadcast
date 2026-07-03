import { BrowserRouter, Routes, Route } from 'react-router-dom'
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
import { AppShell } from '@/components/app-shell'

export default function App() {
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
