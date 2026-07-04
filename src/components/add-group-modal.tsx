import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { P } from '@/lib/tokens'
import { Btn } from '@/components/ui/btn'
import { Icon } from '@/lib/icons'

interface Props {
  onConfirm: (name: string, credential: string, mode: 'link' | 'id') => void
  onClose: () => void
}

interface WrapperProps extends Props {
  open: boolean
}

function ModalContent({ onConfirm, onClose }: Props) {
  const [name, setName] = useState('')
  const [mode, setMode] = useState<'link' | 'id'>('link')
  const [link, setLink] = useState('')
  const [groupId, setGroupId] = useState('')
  const [adding, setAdding] = useState(false)

  const credential = mode === 'link' ? link : groupId
  const canAdd = name.trim().length > 0 && credential.trim().length > 0

  const onAdd = () => {
    if (!canAdd) return
    setAdding(true)
    setTimeout(() => { onConfirm(name.trim(), credential.trim(), mode); setAdding(false) }, 500)
  }

  const fieldStyle: React.CSSProperties = {
    marginTop: 6, width: '100%', padding: '10px 12px', border: `1px solid ${P.line}`, borderRadius: 7,
    background: P.surface, fontSize: 13, fontFamily: P.sans, boxSizing: 'border-box', outline: 'none', color: P.ink,
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 14 }}>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: P.sageTint, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
          <Icon name="groups" size={20} color={P.sage} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 600 }}>Add a WhatsApp group</div>
        </div>
        <button type="button" onClick={onClose} style={{ width: 28, height: 28, borderRadius: 7, border: `1px solid ${P.line}`, background: P.surface, cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
          <Icon name="x" size={14} />
        </button>
      </div>

      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: P.inkSoft, fontWeight: 600, letterSpacing: 0.4, fontFamily: P.mono }}>display name</div>
        <input autoFocus placeholder="e.g. TOTA · Ibadan Cell" value={name} onChange={e => setName(e.target.value)} style={fieldStyle} />
      </div>

      <div style={{ fontSize: 11, color: P.inkSoft, fontWeight: 600, letterSpacing: 0.4, fontFamily: P.mono }}>link by</div>
      <div style={{ marginTop: 6, padding: 3, borderRadius: 8, background: P.surfaceAlt, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, marginBottom: 10 }}>
        {(['link', 'id'] as const).map(opt => (
          <button key={opt} type="button" onClick={() => setMode(opt)} style={{
            padding: '7px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
            background: mode === opt ? P.surface : 'transparent',
            color: mode === opt ? P.ink : P.inkSoft,
            fontWeight: mode === opt ? 600 : 500, fontSize: 12.5, fontFamily: P.sans,
            boxShadow: mode === opt ? '0 1px 2px rgba(14,20,16,0.08)' : 'none',
          }}>
            {opt === 'link' ? 'Invite link' : 'Group ID'}
          </button>
        ))}
      </div>

      {mode === 'link' ? (
        <div style={{ marginBottom: 14 }}>
          <input placeholder="https://chat.whatsapp.com/…" value={link} onChange={e => setLink(e.target.value)} style={{ ...fieldStyle, fontFamily: P.mono }} />
          <div style={{ fontSize: 10.5, color: P.inkFaint, marginTop: 6, fontFamily: P.mono }}>tap the group → invite via link → copy link</div>
        </div>
      ) : (
        <div style={{ marginBottom: 14 }}>
          <input placeholder="1234567890@g.us" value={groupId} onChange={e => setGroupId(e.target.value)} style={{ ...fieldStyle, fontFamily: P.mono }} />
          <div style={{ fontSize: 10.5, color: P.inkFaint, marginTop: 6, fontFamily: P.mono }}>the WhatsApp Business API group ID (ends with @g.us)</div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        <Btn onClick={onClose} style={{ flex: 1, justifyContent: 'center', padding: 11 }}>Cancel</Btn>
        <Btn variant="primary" onClick={onAdd} disabled={!canAdd || adding} style={{ flex: 1.4, justifyContent: 'center', padding: 11, opacity: !canAdd || adding ? 0.5 : 1 }}>
          {adding ? 'Adding…' : 'Add group'}
        </Btn>
      </div>
    </div>
  )
}

export function AddGroupModal({ open, ...props }: WrapperProps) {
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
              : { width: 440, maxWidth: '90%', background: P.surface, borderRadius: 12, padding: 22, boxShadow: '0 24px 60px rgba(0,0,0,0.25)' }
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
