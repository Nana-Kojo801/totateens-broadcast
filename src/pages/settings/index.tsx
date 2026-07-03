import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { P } from '@/lib/tokens'
import { Card } from '@/components/ui/card'
import { Icon } from '@/lib/icons'
import { Select } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Btn } from '@/components/ui/btn'
import { useAppStore } from '@/store/app-store'
import type { WaStatus } from '@/store/app-store'
import { useShallow } from 'zustand/react/shallow'
import { checkForUpdate } from '@/lib/update'
import { fetchWaStatus } from '@/lib/wa-status'
import { getVersion } from '@tauri-apps/api/app'

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 10, color: P.inkSoft, fontFamily: P.mono, letterSpacing: 1, padding: '14px 6px 6px', fontWeight: 600 }}>
      {children}
    </div>
  )
}

interface RowProps {
  label: string
  sub?: string
  value?: string
  onClick?: () => void
  danger?: boolean
}

function Row({ label, sub, value, onClick, danger }: RowProps) {
  return (
    <Card
      onClick={onClick}
      style={{ padding: '12px 14px', marginBottom: 6, display: 'flex', alignItems: 'center', cursor: onClick ? 'pointer' : 'default' }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: danger ? P.rose : P.ink }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: P.inkSoft, fontFamily: P.mono, marginTop: 2 }}>{sub}</div>}
      </div>
      {value !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: P.inkSoft, fontFamily: P.mono }}>
          {value} <Icon name="chevronRight" size={13} color={P.inkFaint} />
        </div>
      )}
    </Card>
  )
}

const WA_STATUS_LABEL: Record<WaStatus, string> = {
  loading: 'Checking…',
  connected: 'Connected',
  qr_pending: 'Waiting for scan',
  disconnected: 'Not connected',
  unreachable: "Can't reach WhatsApp server",
}
const WA_STATUS_COLOR: Record<WaStatus, string> = {
  loading: P.inkFaint,
  connected: P.sage,
  qr_pending: P.sun,
  disconnected: P.rose,
  unreachable: P.rose,
}

function WaStatusRow({ waStatus }: { waStatus: WaStatus }) {
  const setWaStatus = useAppStore((s) => s.setWaStatus)
  const setWaQr = useAppStore((s) => s.setWaQr)
  const [retrying, setRetrying] = useState(false)

  if (waStatus === 'loading') {
    return (
      <Card style={{ padding: '12px 14px', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
        <Skeleton width={8} height={8} style={{ borderRadius: 99, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <Skeleton height={13} width={110} />
        </div>
      </Card>
    )
  }

  const retry = async () => {
    setRetrying(true)
    const { status, qr } = await fetchWaStatus()
    setWaStatus(status)
    setWaQr(qr)
    setRetrying(false)
  }

  return (
    <Card style={{ padding: '12px 14px', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ width: 8, height: 8, borderRadius: 99, background: WA_STATUS_COLOR[waStatus], flexShrink: 0 }} />
      <div style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{WA_STATUS_LABEL[waStatus]}</div>
      {waStatus === 'unreachable' && (
        <Btn onClick={() => { void retry() }} disabled={retrying} style={{ flexShrink: 0 }}>
          {retrying ? 'Retrying…' : 'Retry'}
        </Btn>
      )}
    </Card>
  )
}

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, h) => ({ value: String(h), label: String(h).padStart(2, '0') }))
const MINUTE_OPTIONS = Array.from({ length: 12 }, (_, i) => i * 5).map((m) => ({ value: String(m), label: String(m).padStart(2, '0') }))

export function SettingsPage() {
  const navigate = useNavigate()
  const { calendarStyle, setToast, waStatus, setUpdateAvailable } = useAppStore(
    useShallow((s) => ({
      calendarStyle: s.calendarStyle,
      setToast: s.setToast,
      waStatus: s.waStatus,
      setUpdateAvailable: s.setUpdateAvailable,
    }))
  )
  const clearAllData = useMutation(api.uploadOps.clearAllData)
  const sendSettings = useQuery(api.appSettings.get)
  const updateSendSettings = useMutation(api.appSettings.update)
  const [confirmClear, setConfirmClear] = useState(false)
  const [editingTime, setEditingTime] = useState(false)
  const [draftHour, setDraftHour] = useState('2')
  const [draftMinute, setDraftMinute] = useState('0')
  const [appVersion, setAppVersion] = useState<string | null>(null)
  const [checkingUpdate, setCheckingUpdate] = useState(false)

  useEffect(() => {
    getVersion().then(setAppVersion).catch(() => undefined)
  }, [])

  const handleCheckUpdates = async () => {
    setCheckingUpdate(true)
    try {
      const update = await checkForUpdate()
      if (update) {
        setUpdateAvailable(update)
      } else {
        setToast("You're up to date")
      }
    } catch (err) {
      setToast('Could not check for updates: ' + String(err))
    } finally {
      setCheckingUpdate(false)
    }
  }

  const openTimeEditor = () => {
    setDraftHour(String(sendSettings?.sendHour ?? 2))
    setDraftMinute(String(sendSettings?.sendMinute ?? 0))
    setEditingTime(true)
  }

  const saveTime = async () => {
    try {
      await updateSendSettings({ sendHour: Number(draftHour), sendMinute: Number(draftMinute) })
      setEditingTime(false)
      setToast('Send time updated')
    } catch (err) {
      setToast('Error: ' + String(err))
    }
  }

  const sendTimeLabel = sendSettings
    ? `${String(sendSettings.sendHour).padStart(2, '0')}:${String(sendSettings.sendMinute).padStart(2, '0')} GMT`
    : '…'

  const handleClearAll = async () => {
    try {
      const result = await clearAllData({})
      setConfirmClear(false)
      setToast(`Cleared ${result?.deleted ?? 0} records`)
    } catch (err) {
      setToast('Clear failed: ' + String(err))
    }
  }

  const broadcastSection = (
    <>
      <SectionLabel>BROADCAST</SectionLabel>
      <Row label="Send time" sub="every day" value={sendTimeLabel} onClick={openTimeEditor} />

      <SectionLabel>WHATSAPP</SectionLabel>
      <WaStatusRow waStatus={waStatus} />
    </>
  )

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      {/* Desktop */}
      <div className="hidden md:block">
        {broadcastSection}

        <SectionLabel>APPEARANCE</SectionLabel>
        <Row label="Calendar style" value={calendarStyle} onClick={() => useAppStore.getState().setCalendarStyle(calendarStyle === 'tiles' ? 'dots' : 'tiles')} />

        <SectionLabel>DATA</SectionLabel>
        <Row label="Clear all data" sub="delete all messages, uploads & send history" danger onClick={() => setConfirmClear(true)} />

        <SectionLabel>ABOUT</SectionLabel>
        <Row
          label="Check for updates"
          sub={appVersion ? `version ${appVersion}` : undefined}
          value={checkingUpdate ? 'Checking…' : 'Check now'}
          onClick={checkingUpdate ? undefined : () => { void handleCheckUpdates() }}
        />
      </div>

      {/* Mobile */}
      <div className="md:hidden" style={{ padding: '0 16px 16px' }}>
        <div style={{ fontSize: 10, color: P.inkSoft, fontFamily: P.mono, letterSpacing: 1, padding: '4px 6px 6px' }}>RECORDS</div>
        <Card onClick={() => navigate('/history')} style={{ padding: '12px 14px', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: P.sageTint, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <Icon name="history" size={15} color={P.sage} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Send history</div>
          </div>
          <Icon name="chevronRight" size={14} color={P.inkFaint} />
        </Card>

        {broadcastSection}

        <SectionLabel>APPEARANCE</SectionLabel>
        <Row label="Calendar style" value={calendarStyle} onClick={() => useAppStore.getState().setCalendarStyle(calendarStyle === 'tiles' ? 'dots' : 'tiles')} />

        <SectionLabel>DATA</SectionLabel>
        <Row label="Clear all data" sub="delete all messages, uploads & send history" danger onClick={() => setConfirmClear(true)} />

        <SectionLabel>ABOUT</SectionLabel>
        <Row
          label="Check for updates"
          sub={appVersion ? `version ${appVersion}` : undefined}
          value={checkingUpdate ? 'Checking…' : 'Check now'}
          onClick={checkingUpdate ? undefined : () => { void handleCheckUpdates() }}
        />
      </div>

      <AnimatePresence>
        {editingTime && (() => {
            const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
            return (
              <motion.div
                onClick={() => setEditingTime(false)}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ position: 'fixed', inset: 0, background: 'rgba(14,20,16,0.45)', zIndex: 9000, display: 'flex', justifyContent: 'center', alignItems: isMobile ? 'flex-end' : 'center', backdropFilter: isMobile ? undefined : 'blur(2px)' }}
              >
                <motion.div
                  onClick={(e) => e.stopPropagation()}
                  initial={isMobile ? { y: '100%' } : { scale: 0.96, opacity: 0 }}
                  animate={isMobile ? { y: 0 } : { scale: 1, opacity: 1 }}
                  exit={isMobile ? { y: '100%' } : { scale: 0.96, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 36 }}
                  style={isMobile
                    ? { width: '100%', background: P.surface, borderRadius: '16px 16px 0 0', padding: '14px 20px 26px', boxShadow: '0 -8px 32px rgba(0,0,0,0.18)' }
                    : { width: 340, maxWidth: '90%', background: P.surface, borderRadius: 12, padding: 22, boxShadow: '0 24px 60px rgba(0,0,0,0.25)' }
                  }
                >
                  {isMobile && <div style={{ width: 38, height: 4, borderRadius: 99, background: P.line, margin: '0 auto 14px' }} />}
                  <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Daily send time</div>
                  <div style={{ fontSize: 12, color: P.inkSoft, marginBottom: 16 }}>Devotionals broadcast automatically at this time, every day (GMT/UTC).</div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, color: P.inkSoft, fontFamily: P.mono, marginBottom: 4 }}>hour</div>
                      <Select value={draftHour} onChange={setDraftHour} options={HOUR_OPTIONS} />
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 600, marginTop: 18 }}>:</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, color: P.inkSoft, fontFamily: P.mono, marginBottom: 4 }}>minute</div>
                      <Select value={draftMinute} onChange={setDraftMinute} options={MINUTE_OPTIONS} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
                    <button type="button" onClick={() => setEditingTime(false)} style={{ flex: 1, padding: '10px 0', borderRadius: 7, border: `1px solid ${P.line}`, background: P.surface, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                    <button type="button" onClick={() => { void saveTime() }} style={{ flex: 1, padding: '10px 0', borderRadius: 7, border: `1px solid ${P.sageDeep}`, background: P.sage, color: '#FFF', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Save</button>
                  </div>
                </motion.div>
              </motion.div>
            )
          })()}
      </AnimatePresence>

      {confirmClear && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(14,20,16,0.45)', zIndex: 9000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          onClick={() => setConfirmClear(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: P.surface, borderRadius: 12, padding: 22, width: 360, maxWidth: '90%', boxShadow: '0 24px 60px rgba(0,0,0,0.25)' }}
          >
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Clear all data?</div>
            <div style={{ fontSize: 13, color: P.inkSoft, marginBottom: 18, lineHeight: 1.5 }}>
              This will permanently delete all messages, upload history, and send history. Groups will not be affected. This cannot be undone.
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" onClick={() => setConfirmClear(false)} style={{ flex: 1, padding: '10px 0', borderRadius: 7, border: `1px solid ${P.line}`, background: P.surface, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button type="button" onClick={handleClearAll} style={{ flex: 1, padding: '10px 0', borderRadius: 7, border: `1px solid ${P.rose}`, background: P.rose, color: '#FFF', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Clear all</button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}
