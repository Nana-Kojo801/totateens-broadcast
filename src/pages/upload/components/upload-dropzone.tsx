import { P } from '@/lib/tokens'
import { Card } from '@/components/ui/card'
import { Btn } from '@/components/ui/btn'
import { Icon } from '@/lib/icons'
import { SEND_TIME_LABEL } from '@/lib/broadcast-time'

interface Props {
  onPick: () => void
  onPickJson: () => void
  jsonImporting?: boolean
  viewport?: 'desktop' | 'mobile'
}

export function UploadDropzone({ onPick, onPickJson, jsonImporting = false, viewport = 'desktop' }: Props) {
  const pad = viewport === 'mobile' ? 40 : 80
  return (
    <Card style={{ padding: pad, textAlign: 'center', border: `2px dashed ${P.line}`, borderRadius: 12, background: P.bgSoft }}>
      <div style={{ width: 56, height: 56, borderRadius: 14, background: P.sage, color: '#FFF', display: 'grid', placeItems: 'center', margin: '0 auto 14px' }}>
        <Icon name="upload" size={26} color="#FFF" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 600 }}>Upload this month's devotional PDF</div>
      <div style={{ fontSize: 13, color: P.inkSoft, marginTop: 8, maxWidth: 360, margin: '8px auto 0', lineHeight: 1.55 }}>
        One PDF per month. We'll read through it and prepare 31 daily messages — you preview, edit, and we broadcast at {SEND_TIME_LABEL}.
      </div>
      <Btn variant="primary" onClick={onPick} style={{ marginTop: 22, padding: '11px 18px', fontSize: 13 }}>
        <Icon name="upload" size={13} color="#FFF" /> Choose PDF file
      </Btn>
      <div style={{ fontSize: 11, color: P.inkFaint, marginTop: 10, fontFamily: P.mono }}>.pdf · up to 25 MB</div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, maxWidth: 240, margin: '20px auto 0' }}>
        <div style={{ flex: 1, height: 1, background: P.line }} />
        <div style={{ fontSize: 11, color: P.inkFaint, fontFamily: P.mono }}>or</div>
        <div style={{ flex: 1, height: 1, background: P.line }} />
      </div>

      <Btn onClick={onPickJson} disabled={jsonImporting} style={{ marginTop: 14, padding: '9px 16px', fontSize: 12.5, color: P.sage }}>
        {jsonImporting ? 'Importing…' : 'Import already-parsed JSON'}
      </Btn>
      <div style={{ fontSize: 11, color: P.inkFaint, marginTop: 8, fontFamily: P.mono }}>.json · skips AI parsing</div>
    </Card>
  )
}
