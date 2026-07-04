import { useNavigate } from 'react-router-dom'
import { P } from '@/lib/tokens'
import { Card } from '@/components/ui/card'
import { Tag } from '@/components/ui/tag'
import { Skeleton } from '@/components/ui/skeleton'
import type { DevotionalDay, HistoryEntry } from '@/store/app-store'

interface Props {
  history: HistoryEntry[]
  days: DevotionalDay[]
  loading?: boolean
}

export function DashboardRecent({ history, days, loading = false }: Props) {
  const navigate = useNavigate()
  return (
    <Card style={{ padding: 0, overflow: 'hidden', minWidth: 0 }}>
      <div style={{ padding: '12px 16px', borderBottom: `1px solid ${P.lineSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>Recent broadcasts</div>
        <button type="button" onClick={() => navigate('/history')} style={{ fontSize: 12, color: P.sage, fontWeight: 600, background: 'transparent', border: 'none', cursor: 'pointer' }}>View all →</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '60px minmax(0,1fr) 130px 90px', padding: '7px 16px', fontSize: 10, color: P.inkSoft, letterSpacing: 1, fontWeight: 600, borderBottom: `1px solid ${P.lineSoft}`, background: P.bgSoft }}>
        <div>DAY</div><div>TITLE</div><div>SENT</div><div style={{ textAlign: 'right' }}>DELIVERY</div>
      </div>

      {loading && Array.from({ length: 4 }, (_, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '60px minmax(0,1fr) 130px 90px', padding: '10px 16px', alignItems: 'center', gap: 10, borderBottom: i < 3 ? `1px solid ${P.lineSoft}` : 'none' }}>
          <Skeleton height={13} width={20} />
          <div style={{ minWidth: 0 }}><Skeleton height={13} width="70%" /><Skeleton height={11} width="40%" style={{ marginTop: 5 }} /></div>
          <Skeleton height={11} width={90} />
          <Skeleton height={20} width={60} style={{ borderRadius: 20, marginLeft: 'auto' }} />
        </div>
      ))}

      {!loading && history.slice(0, 6).map((h, i) => {
        const d = days[h.day - 1]
        return (
          <div
            key={i}
            onClick={() => navigate(`/messages/${h.day}`)}
            style={{ display: 'grid', gridTemplateColumns: '60px minmax(0,1fr) 130px 90px', padding: '10px 16px', alignItems: 'center', borderBottom: i < 5 ? `1px solid ${P.lineSoft}` : 'none', cursor: 'pointer' }}
          >
            <div style={{ fontFamily: P.mono, fontSize: 13 }}>{String(h.day).padStart(2, '0')}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d?.title}</div>
              <div style={{ fontSize: 11, color: P.inkSoft, fontFamily: P.mono, marginTop: 2 }}>{d?.ref}</div>
            </div>
            <div style={{ fontFamily: P.mono, fontSize: 11, color: P.inkSoft }}>{h.sentAt.slice(-13)}</div>
            <div style={{ textAlign: 'right' }}>
              <Tag bg={P.sageTint} color={P.sage}>{h.delivered}/{h.groups} ✓</Tag>
            </div>
          </div>
        )
      })}
    </Card>
  )
}
