import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { P } from '@/lib/tokens'
import { Card } from '@/components/ui/card'
import { Icon } from '@/lib/icons'
import type { IconName } from '@/lib/icons'

const LINKS: { path: string; label: string; sub: string; icon: IconName }[] = [
  { path: '/messages', label: 'Messages', sub: 'Preview, edit, and send individual days', icon: 'message' },
  { path: '/history', label: 'History', sub: 'Past broadcasts and delivery status', icon: 'history' },
  { path: '/templates', label: 'Templates', sub: 'Message format and styling', icon: 'file' },
  { path: '/settings', label: 'Settings', sub: 'Send time, appearance, account', icon: 'settings' },
]

export function MorePage() {
  const navigate = useNavigate()

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} style={{ padding: '0 16px 16px' }}>
      {LINKS.map((l) => (
        <Card
          key={l.path}
          onClick={() => navigate(l.path)}
          style={{ padding: '12px 14px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
        >
          <div style={{ width: 34, height: 34, borderRadius: 8, background: P.sageTint, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <Icon name={l.icon} size={16} color={P.sage} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600 }}>{l.label}</div>
            <div style={{ fontSize: 11, color: P.inkSoft, marginTop: 2 }}>{l.sub}</div>
          </div>
          <Icon name="chevronRight" size={14} color={P.inkFaint} />
        </Card>
      ))}
    </motion.div>
  )
}
