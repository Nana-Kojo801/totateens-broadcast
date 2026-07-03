import { useNavigate } from 'react-router-dom'
import { P } from '@/lib/tokens'
import { Card } from '@/components/ui/card'
import { Tag } from '@/components/ui/tag'
import type { DevotionalDay, HistoryEntry } from '@/store/app-store'

interface Props {
  history: HistoryEntry[]
  days: DevotionalDay[]
}

export function DashboardRecent({ history, days }: Props) {
  const navigate = useNavigate()
  return (
    <Card style={{ padding: 0, overflow: 'hidden', minWidth: 0 }}>
      <div style={{ padding: '12px 16px', borderBottom: `1px solid ${P.lineSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>Recent broadcasts</div>
        <button type="button" onClick={() => navigate('/history')} style={{ fontSize: 12, color: P.sage, fontWeight: 600, background: 'transparent', border: 'none', cursor: 'pointer' }}>View all →</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '60px minmax(0,1fr) 130px 70px 90px', padding: '7px 16px', fontSize: 10, color: P.inkSoft, letterSpacing: 1, fontWeight: 600, borderBottom: `1px solid ${P.lineSoft}`, background: P.bgSoft }}>
        <div>DAY</div><div>TITLE</div><div>SENT</div><div>MODE</div><div style={{ textAlign: 'right' }}>DELIVERY</div>
      </div>

      {history.slice(0, 6).map((h, i) => {
        const d = days[h.day - 1]
        return (
          <div
            key={i}
            onClick={() => navigate(`/messages/${h.day}`)}
            style={{ display: 'grid', gridTemplateColumns: '60px minmax(0,1fr) 130px 70px 90px', padding: '10px 16px', alignItems: 'center', borderBottom: i < 5 ? `1px solid ${P.lineSoft}` : 'none', cursor: 'pointer' }}
          >
            <div style={{ fontFamily: P.mono, fontSize: 13 }}>{String(h.day).padStart(2, '0')}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d?.title}</div>
              <div style={{ fontSize: 11, color: P.inkSoft, fontFamily: P.mono, marginTop: 2 }}>{d?.ref}</div>
            </div>
            <div style={{ fontFamily: P.mono, fontSize: 11, color: P.inkSoft }}>{h.sentAt.slice(-13)}</div>
            <div><Tag bg={h.mode === 'manual' ? P.sunTint : P.sageTint} color={h.mode === 'manual' ? P.sun : P.sage}>{h.mode}</Tag></div>
            <div style={{ textAlign: 'right' }}>
              <Tag bg={P.sageTint} color={P.sage}>{h.delivered}/{h.groups} ✓</Tag>
            </div>
          </div>
        )
      })}
    </Card>
  )
}
