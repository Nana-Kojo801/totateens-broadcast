import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { P } from '@/lib/tokens'
import { Btn } from '@/components/ui/btn'
import { Icon } from '@/lib/icons'
import type { DevotionalDay, WhatsAppGroup } from '@/store/app-store'

interface Props {
  day: DevotionalDay
  groups: WhatsAppGroup[]
  onConfirm: () => void
  onClose: () => void
  viewport?: 'desktop' | 'mobile'
}

interface WrapperProps extends Props {
  open: boolean
}

function ModalContent({ day, groups, onConfirm, onClose }: Props) {
  const [sending, setSending] = useState(false)
  const active = groups.filter(g => g.active)

  const handleConfirm = () => {
    setSending(true)
    setTimeout(() => { onConfirm(); setSending(false) }, 700)
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 14 }}>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: P.sageTint, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
          <Icon name="send" size={20} color={P.sage} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 600 }}>{day.status === 'sent' ? `Resend Day ${day.d}?` : `Send Day ${day.d} now?`}</div>
          <div style={{ fontSize: 11, color: P.inkSoft, fontFamily: P.mono, marginTop: 2 }}>broadcast to {active.length} active groups</div>
        </div>
        <button type="button" onClick={onClose} style={{ width: 28, height: 28, borderRadius: 7, border: `1px solid ${P.line}`, background: P.surface, cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
          <Icon name="x" size={14} />
        </button>
      </div>

      <div style={{ padding: 12, borderRadius: 8, background: P.bgSoft, border: `1px solid ${P.lineSoft}`, marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: P.inkSoft, fontFamily: P.mono, letterSpacing: 1, marginBottom: 6 }}>MESSAGE</div>
        <div style={{ fontSize: 14, fontWeight: 600 }}>{day.title}</div>
        <div style={{ fontSize: 11, color: P.inkSoft, fontFamily: P.mono, marginTop: 3 }}>{day.ref}</div>
      </div>

      <div style={{ borderRadius: 8, background: P.bgSoft, border: `1px solid ${P.lineSoft}`, overflow: 'hidden', marginBottom: 12 }}>
        <div style={{ padding: '8px 12px', fontSize: 11, color: P.inkSoft, fontFamily: P.mono, letterSpacing: 1, fontWeight: 600, borderBottom: `1px solid ${P.lineSoft}`, background: P.surface }}>
          GROUPS · {active.length} selected
        </div>
        {active.map((g, i) => (
          <div key={g.id} style={{ display: 'grid', gridTemplateColumns: '1fr 24px', alignItems: 'center', gap: 8, padding: '9px 12px', borderBottom: i < active.length - 1 ? `1px solid ${P.lineSoft}` : 'none' }}>
            <div style={{ fontSize: 12.5, fontWeight: 600 }}>{g.name}</div>
            <div style={{ width: 18, height: 18, borderRadius: 4, background: P.sage, display: 'grid', placeItems: 'center' }}>
              <Icon name="check" size={12} color="#FFF" />
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: 10, borderRadius: 8, background: P.sunTint, border: `1px solid rgba(216,139,38,0.3)`, display: 'flex', gap: 8, fontSize: 11, color: P.inkSoft, marginBottom: 14, alignItems: 'flex-start' }}>
        <span>⚠</span>
        <span>
          {day.status === 'sent'
            ? 'This message already went out once — sending again will deliver it a second time to selected groups.'
            : day.status === 'today'
              ? 'Tonight\'s scheduled auto-broadcast will be skipped to avoid duplicates.'
              : 'Scheduled auto-broadcast for this day will be skipped to avoid duplicates.'}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <Btn onClick={onClose} style={{ flex: 1, justifyContent: 'center', padding: 11 }}>Cancel</Btn>
        <Btn variant="primary" onClick={handleConfirm} disabled={sending} style={{ flex: 1.4, justifyContent: 'center', padding: 11 }}>
          {sending ? 'Sending…' : <><Icon name="send" size={13} color="#FFF" /> Confirm send</>}
        </Btn>
      </div>
    </div>
  )
}

export function ManualSendModal({ open, ...props }: WrapperProps) {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          onClick={props.onClose}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(14,20,16,0.45)', zIndex: 9000, display: 'flex', justifyContent: 'center', alignItems: isMobile ? 'flex-end' : 'center', backdropFilter: isMobile ? undefined : 'blur(2px)' }}
        >
          <motion.div
            onClick={e => e.stopPropagation()}
            initial={isMobile ? { y: '100%' } : { scale: 0.96, opacity: 0 }}
            animate={isMobile ? { y: 0 } : { scale: 1, opacity: 1 }}
            exit={isMobile ? { y: '100%' } : { scale: 0.96, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 36 }}
            style={isMobile
              ? { width: '100%', background: P.surface, borderRadius: '16px 16px 0 0', padding: '14px 20px 22px', maxHeight: '90%', overflowY: 'auto', boxShadow: '0 -8px 32px rgba(0,0,0,0.18)' }
              : { width: 480, maxWidth: '90%', background: P.surface, borderRadius: 12, padding: 22, boxShadow: '0 24px 60px rgba(0,0,0,0.25)', maxHeight: '85%', overflowY: 'auto' }
            }
          >
            {isMobile && <div style={{ width: 38, height: 4, borderRadius: 99, background: P.line, margin: '0 auto 14px' }} />}
            <ModalContent {...props} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
