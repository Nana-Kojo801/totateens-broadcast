import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { P } from '@/lib/tokens'
import { Card } from '@/components/ui/card'
import { Icon } from '@/lib/icons'
import { Skeleton } from '@/components/ui/skeleton'
import { Btn } from '@/components/ui/btn'
import { useAppStore } from '@/store/app-store'
import type { WaStatus } from '@/store/app-store'
import { useShallow } from 'zustand/react/shallow'
import { fetchWaStatus } from '@/lib/wa-status'
import { SEND_TIME_LABEL } from '@/lib/broadcast-time'
import { checkForUpdate } from '@/lib/update'
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
          {value} {onClick && <Icon name="chevronRight" size={13} color={P.inkFaint} />}
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
  const [confirmClear, setConfirmClear] = useState(false)
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
      <Row label="Send time" sub="every day, fixed" value={SEND_TIME_LABEL} />

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
