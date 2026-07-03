import { P } from '@/lib/tokens'

interface SwitchProps {
  on: boolean
  onToggle: () => void
}

export function Switch({ on, onToggle }: SwitchProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      role="switch"
      aria-checked={on}
      style={{
        width: 36,
        height: 22,
        borderRadius: 99,
        border: 'none',
        cursor: 'pointer',
        background: on ? P.sage : P.line,
        position: 'relative',
        transition: 'background .15s',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 2,
          left: on ? 16 : 2,
          width: 18,
          height: 18,
          borderRadius: 99,
          background: '#FFF',
          boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
          transition: 'left .15s',
        }}
      />
    </button>
  )
}
