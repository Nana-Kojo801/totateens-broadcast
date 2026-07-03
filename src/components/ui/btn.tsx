import React from 'react'
import { P } from '@/lib/tokens'

type BtnVariant = 'primary' | 'ghost' | 'subtle' | 'danger'

interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant
  children?: React.ReactNode
}

const base: React.CSSProperties = {
  padding: '7px 11px',
  borderRadius: 7,
  fontSize: 12,
  fontWeight: 600,
  fontFamily: P.sans,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  transition: 'background .1s ease, opacity .1s ease',
  outline: 'none',
}

const variants: Record<BtnVariant, React.CSSProperties> = {
  primary: { ...base, border: `1px solid ${P.sageDeep}`, background: P.sage, color: '#FFF' },
  ghost:   { ...base, border: `1px solid ${P.line}`, background: P.surface, color: P.ink },
  subtle:  { ...base, border: '1px solid transparent', background: P.surfaceAlt, color: P.ink },
  danger:  { ...base, border: `1px solid #8E2A36`, background: P.rose, color: '#FFF' },
}

export function Btn({ variant = 'ghost', children, style, disabled, ...props }: BtnProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      style={{ ...variants[variant], ...(disabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}), ...style }}
      {...props}
    >
      {children}
    </button>
  )
}
