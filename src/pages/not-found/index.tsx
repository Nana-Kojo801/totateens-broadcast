import { useNavigate } from 'react-router-dom'
import { P } from '@/lib/tokens'
import { Btn } from '@/components/ui/btn'

export function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div style={{ width: '100vw', height: '100vh', display: 'grid', placeItems: 'center', background: P.bg, fontFamily: P.sans, color: P.ink }}>
      <div style={{ textAlign: 'center', maxWidth: 320 }}>
        <div style={{ fontSize: 44, fontWeight: 700, fontFamily: P.mono, color: P.inkFaint }}>404</div>
        <div style={{ fontSize: 15, fontWeight: 600, marginTop: 8 }}>Page not found</div>
        <div style={{ fontSize: 13, color: P.inkSoft, marginTop: 6, lineHeight: 1.5 }}>This page doesn't exist, or you don't have access to it.</div>
        <Btn variant="primary" onClick={() => navigate('/')} style={{ marginTop: 20, margin: '20px auto 0', justifyContent: 'center' }}>Back to dashboard</Btn>
      </div>
    </div>
  )
}
