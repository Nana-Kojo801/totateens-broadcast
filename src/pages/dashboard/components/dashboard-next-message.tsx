import { useNavigate } from 'react-router-dom'
import { P } from '@/lib/tokens'
import { Card } from '@/components/ui/card'
import { Btn } from '@/components/ui/btn'
import { Dot } from '@/components/ui/dot'
import { Icon } from '@/lib/icons'
import { useAppStore } from '@/store/app-store'
import type { DevotionalDay, WhatsAppGroup } from '@/store/app-store'

interface Props {
  nextDay: DevotionalDay
  groups: WhatsAppGroup[]
  onManualSend: (day: number) => void
}

export function DashboardNextMessage({ nextDay, groups, onManualSend }: Props) {
  const navigate = useNavigate()
  const active = groups.filter(g => g.active)

  return (
    <Card style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ background: P.ink, color: '#FFF', padding: '13px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 10.5, letterSpacing: 1, fontWeight: 600, color: '#9CB3A3' }}>
          <Dot color={P.sageHi} size={6} /> NEXT BROADCAST
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
          <div style={{ fontFamily: P.mono, fontSize: 28, fontWeight: 600, lineHeight: 1 }}>02:00</div>
          <div style={{ fontSize: 11, color: '#9CB3A3' }}>GMT · in 14h 23m</div>
        </div>
        <div style={{ fontSize: 12, color: '#C8D4CD', marginTop: 6 }}>Day {nextDay.d} · {nextDay.title}</div>
      </div>

      <div style={{ padding: 12 }}>
        <div style={{ fontSize: 10.5, color: P.inkSoft, fontWeight: 600, letterSpacing: 1 }}>GROUPS · {active.length} ACTIVE</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0,1fr))', gap: 5, marginTop: 7 }}>
          {active.map(g => (
            <div key={g.id} style={{ padding: '6px 4px', borderRadius: 6, background: P.bgSoft, border: `1px solid ${P.lineSoft}`, textAlign: 'center', minWidth: 0 }}>
              <div style={{ fontSize: 9, color: P.inkFaint, letterSpacing: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {g.name.split('·')[1] ? g.name.split('·')[1].trim().split(' ')[0].slice(0, 3).toUpperCase() : 'TT'}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
          <Btn onClick={() => { useAppStore.getState().setViewMonth(new Date().toISOString().slice(0, 7)); navigate(`/messages/${nextDay.d}`) }} style={{ flex: 1, justifyContent: 'center' }}>
            <Icon name="eye" size={12} /> Preview
          </Btn>
          <Btn variant="primary" onClick={() => onManualSend(nextDay.d)} style={{ flex: 1, justifyContent: 'center' }}>
            Edit Day {nextDay.d}
          </Btn>
        </div>
      </div>
    </Card>
  )
}
