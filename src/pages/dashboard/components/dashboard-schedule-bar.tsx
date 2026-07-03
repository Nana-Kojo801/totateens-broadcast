import { useNavigate } from 'react-router-dom'
import { P } from '@/lib/tokens'
import { Card } from '@/components/ui/card'
import { Dot } from '@/components/ui/dot'
import type { DevotionalDay } from '@/store/app-store'

interface Props {
  days: DevotionalDay[]
  sentCount: number
}

export function DashboardScheduleBar({ days }: Props) {
  const navigate = useNavigate()
  return (
    <Card style={{ padding: 16, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>May 2026 · schedule</div>
          <div style={{ fontSize: 12, color: P.inkSoft, marginTop: 2 }}>Click any day to preview</div>
        </div>
        <div style={{ display: 'flex', gap: 10, fontSize: 11, color: P.inkSoft }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Dot color={P.sage} /> Sent</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Dot color={P.sun} /> Today</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Dot color={P.inkFaint} /> Upcoming</span>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(31, 1fr)', gap: 2 }}>
        {days.map(d => {
          const color = d.status === 'sent' ? P.sage : d.status === 'today' ? P.sun : P.lineSoft
          return (
            <button
              key={d.d}
              type="button"
              onClick={() => navigate(`/messages/${d.d}`)}
              title={`Day ${d.d}: ${d.title}`}
              style={{ display: 'flex', flexDirection: 'column', gap: 4, border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', fontFamily: P.sans }}
            >
              <div style={{ height: 56, background: color, borderRadius: 3, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: 4, color: d.status === 'upcoming' ? P.inkFaint : '#FFF', fontSize: 10, fontFamily: P.mono, fontWeight: 600 }}>
                {d.d}
              </div>
            </button>
          )
        })}
      </div>
    </Card>
  )
}
