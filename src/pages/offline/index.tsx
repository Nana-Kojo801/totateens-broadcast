import { P } from '@/lib/tokens'
import { Btn } from '@/components/ui/btn'

function WifiOffIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M2 8.5c2.6-2.2 6-3.5 10-3.5s7.4 1.3 10 3.5" stroke={P.rose} strokeWidth="1.6" strokeLinecap="round" opacity="0.35" />
      <path d="M5.5 12.3c1.9-1.5 4.2-2.3 6.5-2.3s4.6 0.8 6.5 2.3" stroke={P.rose} strokeWidth="1.6" strokeLinecap="round" opacity="0.55" />
      <path d="M9 16c0.9-0.7 1.9-1 3-1s2.1 0.3 3 1" stroke={P.rose} strokeWidth="1.6" strokeLinecap="round" opacity="0.75" />
      <circle cx="12" cy="19.5" r="1.3" fill={P.rose} />
      <path d="M3 3l18 18" stroke={P.rose} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export function OfflinePage({ onRetry }: { onRetry: () => void }) {
  return (
    <div style={{ width: '100vw', height: '100vh', display: 'grid', placeItems: 'center', background: P.bg, fontFamily: P.sans, color: P.ink }}>
      <div style={{ textAlign: 'center', maxWidth: 340 }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: P.roseTint, display: 'grid', placeItems: 'center', margin: '0 auto' }}>
          <WifiOffIcon />
        </div>
        <div style={{ fontSize: 17, fontWeight: 600, marginTop: 16 }}>You're offline</div>
        <div style={{ fontSize: 13, color: P.inkSoft, marginTop: 8, lineHeight: 1.55 }}>
          This app needs an internet connection to load your devotionals and groups. Check your connection and try again.
        </div>
        <Btn variant="primary" onClick={onRetry} style={{ marginTop: 22, margin: '22px auto 0', justifyContent: 'center' }}>Try again</Btn>
      </div>
    </div>
  )
}
