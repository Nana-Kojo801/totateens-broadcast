import { P } from '@/lib/tokens'

export function Skeleton({
  width = '100%',
  height = 14,
  style,
}: {
  width?: string | number
  height?: string | number
  style?: React.CSSProperties
}) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 4,
        background: P.surfaceAlt,
        animation: 'skeleton-pulse 1.4s ease-in-out infinite',
        flexShrink: 0,
        ...style,
      }}
    />
  )
}
