import React from 'react'
import { P } from '@/lib/tokens'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

export function Card({ children, style, onClick, ...props }: CardProps) {
  return (
    <div
      onClick={onClick}
      style={{
        background: P.surface,
        borderRadius: 10,
        border: `1px solid ${P.line}`,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  )
}
