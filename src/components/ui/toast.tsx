import { P } from '@/lib/tokens'
import { Dot } from './dot'

interface ToastProps {
  message: string | null
}

export function Toast({ message }: ToastProps) {
  if (!message) return null
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        background: P.ink,
        color: '#FFF',
        padding: '10px 16px',
        borderRadius: 9,
        fontSize: 12,
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
        zIndex: 9999,
        fontFamily: P.sans,
        animation: 'toast-in 200ms ease-out',
        whiteSpace: 'nowrap',
      }}
    >
      <Dot color={P.sageHi} size={6} />
      {message}
    </div>
  )
}
