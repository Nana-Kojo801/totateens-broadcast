import { useNavigate } from 'react-router-dom'
import { P } from '@/lib/tokens'
import { Card } from '@/components/ui/card'
import { Tag } from '@/components/ui/tag'
import { Icon } from '@/lib/icons'
import type { DevotionalDay } from '@/store/app-store'

interface Props {
  days: DevotionalDay[]
  selectedDay: number
  onSelectDay: (d: number) => void
}

export function UploadDayGrid({ days, selectedDay, onSelectDay }: Props) {
  return (
    <Card style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '11px 14px', borderBottom: `1px solid ${P.lineSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>31 days extracted</div>
        <span style={{ fontSize: 11, color: P.inkSoft, fontFamily: P.mono }}>click to preview</span>
      </div>
      <div style={{ padding: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
          {days.map(d => (
            <button
              key={d.d}
              type="button"
              onClick={() => onSelectDay(d.d)}
              title={d.title}
              style={{
                padding: '8px 4px', borderRadius: 5, textAlign: 'center', fontFamily: P.mono,
                border: `1px solid ${d.d === selectedDay ? P.sage : P.lineSoft}`,
                background: d.d === selectedDay ? P.sageTint : P.surface,
                color: d.d === selectedDay ? P.sage : P.ink,
                cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 600 }}>{String(d.d).padStart(2, '0')}</div>
            </button>
          ))}
        </div>
      </div>
    </Card>
  )
}

export function UploadDayList({ days }: { days: DevotionalDay[] }) {
  const navigate = useNavigate()
  return (
    <Card style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '11px 14px', borderBottom: `1px solid ${P.lineSoft}`, fontSize: 13, fontWeight: 600 }}>Day list</div>
      {days.slice(0, 6).map((d, i) => (
        <div
          key={d.d}
          onClick={() => navigate(`/messages/${d.d}`)}
          style={{
            display: 'grid', gridTemplateColumns: '60px minmax(0,1fr) 80px', padding: '11px 14px', alignItems: 'center', gap: 10,
            borderBottom: i < 5 ? `1px solid ${P.lineSoft}` : 'none', cursor: 'pointer',
          }}
        >
          <div style={{ fontFamily: P.mono, fontSize: 13 }}>{String(d.d).padStart(2, '0')}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.title}</div>
            <div style={{ fontSize: 11, color: P.inkSoft, fontFamily: P.mono, marginTop: 2 }}>{d.ref}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <Tag
              bg={d.status === 'sent' ? P.sageTint : d.status === 'today' ? P.sunTint : P.surfaceAlt}
              color={d.status === 'sent' ? P.sage : d.status === 'today' ? P.sun : P.inkSoft}
            >
              {d.status}
            </Tag>
          </div>
        </div>
      ))}
      <div
        onClick={() => navigate('/messages/1')}
        style={{ padding: '11px 14px', textAlign: 'center', fontSize: 12, color: P.sage, fontWeight: 600, cursor: 'pointer' }}
      >
        View all 31 days →
      </div>
    </Card>
  )
}

export function UploadDayPreview({ day }: { day: DevotionalDay }) {
  return (
    <Card style={{ padding: 0, overflow: 'hidden', alignSelf: 'flex-start', minWidth: 0 }}>
      <div style={{ padding: '11px 14px', borderBottom: `1px solid ${P.lineSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>Preview · Day {day.d}</div>
        <Tag
          bg={day.status === 'today' ? P.sunTint : day.status === 'sent' ? P.sageTint : P.surfaceAlt}
          color={day.status === 'today' ? P.sun : day.status === 'sent' ? P.sage : P.inkSoft}
        >
          {day.status.toUpperCase()}
        </Tag>
      </div>
      <div style={{ padding: 18, fontSize: 13, lineHeight: 1.6, background: P.bgSoft }}>
        <div style={{ fontSize: 16, fontWeight: 600, padding: '0 4px', background: P.sunTint, borderRadius: 3, display: 'inline-block' }}>
          {day.title}
        </div>
        <div style={{ marginTop: 6, fontSize: 12, color: P.inkSoft }}>
          <span style={{ background: P.sageTint, color: P.sage, padding: '0 4px', borderRadius: 3, fontFamily: P.mono, fontSize: 11 }}>{day.ref}</span>
          {' — '}<em>"{day.verse}"</em>
        </div>
        {day.body.map((p, i) => (
          <p key={i} style={{ margin: '12px 0 0' }}>{p}</p>
        ))}
        <div style={{ fontWeight: 700, marginTop: 14 }}>{(day.prayerLabel || 'PRAYER POINTS').toUpperCase()}</div>
        <ol style={{ paddingLeft: 18, margin: 0 }}>
          {day.prayer.map((pt, i) => (
            <li key={i} style={{ marginTop: 4 }}>{pt}</li>
          ))}
        </ol>
        <div style={{ marginTop: 14, fontWeight: 700, fontStyle: 'italic' }}>{day.resolve}</div>
      </div>
    </Card>
  )
}

interface MobileDayGridProps {
  days: DevotionalDay[]
}

export function UploadMobileDayGrid({ days }: MobileDayGridProps) {
  const navigate = useNavigate()
  return (
    <>
      <div style={{ marginTop: 18, padding: 14, borderRadius: 11, background: P.surface, border: `1px solid ${P.line}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: P.inkSoft, letterSpacing: 1, fontFamily: P.mono }}>31 DAYS · MAY 2026</div>
          <Tag bg={P.surfaceAlt} color={P.inkSoft}>ready</Tag>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
          {days.map(d => (
            <button
              key={d.d}
              type="button"
              onClick={() => navigate(`/messages/${d.d}`)}
              style={{
                padding: '6px 2px', borderRadius: 4, textAlign: 'center', fontFamily: P.mono, cursor: 'pointer',
                border: `1px solid ${P.lineSoft}`, background: P.surface, color: P.ink,
              }}
            >
              <div style={{ fontSize: 10, fontWeight: 600 }}>{String(d.d).padStart(2, '0')}</div>
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 14, fontSize: 11, fontWeight: 600, color: P.inkSoft, letterSpacing: 1, fontFamily: P.mono, padding: '4px 6px 8px' }}>EXTRACTED DAYS</div>
      {days.slice(0, 6).map(d => (
        <Card
          key={d.d}
          onClick={() => navigate(`/messages/${d.d}`)}
          style={{ padding: 12, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
        >
          <div style={{ fontFamily: P.mono, fontSize: 12, color: P.inkSoft, width: 28 }}>{String(d.d).padStart(2, '0')}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.title}</div>
            <div style={{ fontSize: 10.5, color: P.inkSoft, fontFamily: P.mono, marginTop: 2 }}>{d.ref}</div>
          </div>
          <Icon name="chevronRight" size={14} color={P.inkFaint} />
        </Card>
      ))}
    </>
  )
}
