import { P } from '@/lib/tokens'
import { Btn } from '@/components/ui/btn'
import type { DevotionalDay } from '@/store/app-store'

interface EditFieldProps {
  label: string
  value: string
  multiline?: boolean
  mono?: boolean
  onChange: (v: string) => void
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 11, color: P.inkSoft, fontWeight: 600, letterSpacing: 0.4, fontFamily: P.mono }}>{children}</div>
}

function EditField({ label, value, multiline, mono, onChange }: EditFieldProps) {
  const inputStyle: React.CSSProperties = {
    marginTop: 6, width: '100%', padding: '9px 12px', border: `1px solid ${P.line}`, borderRadius: 7,
    background: P.surface, fontSize: 13, fontFamily: mono ? P.mono : P.sans,
    boxSizing: 'border-box', outline: 'none', color: P.ink,
  }
  return (
    <div style={{ marginBottom: 10 }}>
      <FieldLabel>{label}</FieldLabel>
      {multiline ? (
        <textarea value={value} onChange={e => onChange(e.target.value)}
          style={{ ...inputStyle, lineHeight: 1.5, minHeight: 56, resize: 'vertical' }} />
      ) : (
        <input value={value} onChange={e => onChange(e.target.value)} style={inputStyle} />
      )}
    </div>
  )
}

interface Props {
  day: DevotionalDay
  onChange: (updated: DevotionalDay) => void
  onSave: () => void
  onCancel: () => void
  mobile?: boolean
}

export function MessageEditForm({ day, onChange, onSave, onCancel, mobile }: Props) {
  const setField = <K extends keyof DevotionalDay>(key: K, val: DevotionalDay[K]) =>
    onChange({ ...day, [key]: val })

  if (mobile) {
    return (
      <div style={{ padding: '0 16px 16px' }}>
        <EditField label="title" value={day.title} onChange={v => setField('title', v)} />
        <EditField label="verse" value={day.verse} multiline onChange={v => setField('verse', v)} />
        <EditField label="reference" value={day.ref} mono onChange={v => setField('ref', v)} />
        <div style={{ marginBottom: 10 }}>
          <FieldLabel>body</FieldLabel>
          <textarea
            value={day.body.join('\n\n')}
            onChange={e => setField('body', e.target.value.split(/\n\s*\n/))}
            style={{ marginTop: 6, width: '100%', padding: '10px 12px', border: `1px solid ${P.line}`, borderRadius: 7, background: P.surface, fontSize: 13, lineHeight: 1.55, minHeight: 140, fontFamily: P.sans, boxSizing: 'border-box', resize: 'vertical', outline: 'none', color: P.ink }}
          />
        </div>
        <FieldLabel>prayer points</FieldLabel>
        <div style={{ marginTop: 6, border: `1px solid ${P.line}`, borderRadius: 8, overflow: 'hidden', marginBottom: 10 }}>
          {day.prayer.map((pt, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '24px 1fr', gap: 8, padding: '9px 12px', borderBottom: i < day.prayer.length - 1 ? `1px solid ${P.lineSoft}` : 'none', alignItems: 'center' }}>
              <span style={{ fontFamily: P.mono, color: P.sage, fontWeight: 600, fontSize: 12 }}>0{i + 1}</span>
              <input
                value={pt}
                onChange={e => { const next = [...day.prayer]; next[i] = e.target.value; setField('prayer', next) }}
                style={{ border: 'none', outline: 'none', fontSize: 13, padding: 0, background: 'transparent', fontFamily: P.sans, color: P.ink, width: '100%' }}
              />
            </div>
          ))}
        </div>
        <EditField label="what's your resolve?" value={day.resolve} multiline onChange={v => setField('resolve', v)} />
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <Btn onClick={onCancel} style={{ flex: 1, justifyContent: 'center' }}>Cancel</Btn>
          <Btn variant="primary" onClick={onSave} style={{ flex: 1.3, justifyContent: 'center' }}>Save changes</Btn>
        </div>
      </div>
    )
  }

  return (
    <>
      <EditField label="title" value={day.title} onChange={v => setField('title', v)} />
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 10 }}>
        <EditField label="verse" value={day.verse} multiline onChange={v => setField('verse', v)} />
        <EditField label="reference" value={day.ref} mono onChange={v => setField('ref', v)} />
      </div>
      <div style={{ marginBottom: 10 }}>
        <FieldLabel>devotional body</FieldLabel>
        <textarea
          value={day.body.join('\n\n')}
          onChange={e => setField('body', e.target.value.split(/\n\s*\n/))}
          style={{ marginTop: 6, width: '100%', border: `1px solid ${P.line}`, borderRadius: 8, padding: 14, background: P.surface, fontSize: 13, lineHeight: 1.65, minHeight: 140, fontFamily: P.sans, boxSizing: 'border-box', resize: 'vertical', outline: 'none', color: P.ink }}
        />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div>
          <FieldLabel>prayer points</FieldLabel>
          <div style={{ marginTop: 6, border: `1px solid ${P.line}`, borderRadius: 8, overflow: 'hidden' }}>
            {day.prayer.map((pt, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '24px 1fr', gap: 8, padding: '8px 12px', borderBottom: i < day.prayer.length - 1 ? `1px solid ${P.lineSoft}` : 'none', alignItems: 'center' }}>
                <span style={{ fontFamily: P.mono, color: P.sage, fontWeight: 600, fontSize: 12 }}>0{i + 1}</span>
                <input
                  value={pt}
                  onChange={e => { const next = [...day.prayer]; next[i] = e.target.value; setField('prayer', next) }}
                  style={{ border: 'none', outline: 'none', fontSize: 13, padding: 0, background: 'transparent', fontFamily: P.sans, color: P.ink, width: '100%' }}
                />
              </div>
            ))}
          </div>
        </div>
        <div>
          <EditField label="what's your resolve?" value={day.resolve} multiline onChange={v => setField('resolve', v)} />
        </div>
      </div>
    </>
  )
}
