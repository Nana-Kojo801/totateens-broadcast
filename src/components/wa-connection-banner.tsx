import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { P } from '@/lib/tokens'
import { Card } from '@/components/ui/card'
import { Btn } from '@/components/ui/btn'
import { Icon } from '@/lib/icons'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore } from '@/store/app-store'
import type { WaStatus } from '@/store/app-store'
import { fetchWaStatus } from '@/lib/wa-status'

export function WaConnectionBanner({ waStatus, waQr, size = 'lg' }: { waStatus: WaStatus; waQr: string | null; size?: 'sm' | 'lg' }) {
  const setWaStatus = useAppStore((s) => s.setWaStatus)
  const setWaQr = useAppStore((s) => s.setWaQr)
  const [retrying, setRetrying] = useState(false)
  const imgSize = size === 'lg' ? 96 : 80
  const qrSize = size === 'lg' ? 260 : 220
  const pad = size === 'lg' ? 16 : 14

  const retry = async () => {
    setRetrying(true)
    const { status, qr } = await fetchWaStatus()
    setWaStatus(status)
    setWaQr(qr)
    setRetrying(false)
  }

  if (waStatus === 'loading' || waStatus === 'disconnected') {
    return (
      <Card style={{ padding: pad, display: 'flex', gap: pad - 2, alignItems: 'center', marginBottom: 14 }}>
        <Skeleton width={imgSize} height={imgSize} style={{ borderRadius: 8, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <Skeleton height={size === 'lg' ? 14 : 13} width="50%" />
          <Skeleton height={12} width="80%" style={{ marginTop: 8 }} />
        </div>
      </Card>
    )
  }

  if (waStatus === 'unreachable') {
    return (
      <Card style={{ padding: pad, display: 'flex', gap: pad - 2, alignItems: 'center', marginBottom: 14, border: `1px solid ${P.rose}` }}>
        <div style={{ width: imgSize, height: imgSize, borderRadius: 8, background: P.roseTint, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
          <Icon name="x" size={size === 'lg' ? 26 : 22} color={P.rose} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: size === 'lg' ? 14 : 13, marginBottom: 3, color: P.rose }}>Can't reach the WhatsApp server</div>
          <div style={{ fontSize: size === 'lg' ? 12 : 11.5, color: P.inkSoft, lineHeight: 1.5 }}>The desktop app's local WhatsApp service isn't responding. It may still be starting up.</div>
        </div>
        <Btn onClick={() => { void retry() }} disabled={retrying} style={{ flexShrink: 0 }}>
          {retrying ? 'Retrying…' : 'Retry'}
        </Btn>
      </Card>
    )
  }

  return (
    <AnimatePresence>
      {waStatus === 'qr_pending' && waQr && (
        <motion.div key="qr" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }} style={{ marginBottom: 14 }}>
          <Card style={{ padding: pad + 6, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <img src={waQr} width={qrSize} height={qrSize} alt="WhatsApp QR" style={{ borderRadius: 10 }} />
            <div style={{ fontWeight: 600, fontSize: size === 'lg' ? 15 : 14, marginTop: 14 }}>Scan to connect WhatsApp</div>
            <div style={{ fontSize: size === 'lg' ? 12.5 : 12, color: P.inkSoft, lineHeight: 1.5, marginTop: 4 }}>Open WhatsApp → Settings → Linked Devices → Link a device</div>
          </Card>
        </motion.div>
      )}
      {waStatus === 'authenticated' && (
        <motion.div key="authenticated" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }} style={{ marginBottom: 14 }}>
          <Card style={{ padding: pad, display: 'flex', gap: pad - 2, alignItems: 'center' }}>
            <div style={{ width: imgSize, height: imgSize, borderRadius: 8, background: P.sageTint, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <Icon name="check" size={size === 'lg' ? 26 : 22} color={P.sage} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: size === 'lg' ? 14 : 13, marginBottom: size === 'lg' ? 4 : 3 }}>Scan received — finishing setup…</div>
              <div style={{ fontSize: size === 'lg' ? 12 : 11.5, color: P.inkSoft, lineHeight: 1.5 }}>This only takes a moment.</div>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
