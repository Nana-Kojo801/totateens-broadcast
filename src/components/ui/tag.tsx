import React from 'react'
import { P } from '@/lib/tokens'

interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: string
  bg?: string
  children?: React.ReactNode
}

export function Tag({ children, color = P.ink, bg = P.surfaceAlt, style, ...props }: TagProps) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '2px 7px',
        borderRadius: 5,
        fontSize: 11,
        fontWeight: 500,
        fontFamily: P.mono,
        color,
        background: bg,
        letterSpacing: 0,
        whiteSpace: 'nowrap',
        ...style,
      }}
      {...props}
    >
      {children}
    </span>
  )
}
