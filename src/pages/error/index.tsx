import { useState } from 'react'
import { P } from '@/lib/tokens'
import { Btn } from '@/components/ui/btn'
import { Icon } from '@/lib/icons'

export function ErrorScreen({ error, onReload }: { error: Error; onReload: () => void }) {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'grid', placeItems: 'center', background: P.bg, fontFamily: P.sans, color: P.ink }}>
      <div style={{ textAlign: 'center', maxWidth: 380, padding: '0 20px' }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: P.roseTint, display: 'grid', placeItems: 'center', margin: '0 auto' }}>
          <Icon name="x" size={22} color={P.rose} />
        </div>
        <div style={{ fontSize: 17, fontWeight: 600, marginTop: 16 }}>Something went wrong</div>
        <div style={{ fontSize: 13, color: P.inkSoft, marginTop: 8, lineHeight: 1.55 }}>
          The app hit an unexpected error and couldn't continue. Reloading usually fixes it.
        </div>
        <Btn variant="primary" onClick={onReload} style={{ marginTop: 22, margin: '22px auto 0', justifyContent: 'center' }}>Reload app</Btn>

        <button
          type="button"
          onClick={() => setShowDetails((s) => !s)}
          style={{ marginTop: 16, background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 11.5, color: P.inkFaint, fontFamily: P.mono, textDecoration: 'underline' }}
        >
          {showDetails ? 'Hide' : 'Show'} technical details
        </button>
        {showDetails && (
          <div style={{ marginTop: 10, padding: 12, borderRadius: 8, background: P.bgSoft, border: `1px solid ${P.lineSoft}`, textAlign: 'left', fontSize: 11, color: P.inkSoft, fontFamily: P.mono, lineHeight: 1.5, maxHeight: 160, overflowY: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {error.message}
            {error.stack ? `\n\n${error.stack}` : ''}
          </div>
        )}
      </div>
    </div>
  )
}
