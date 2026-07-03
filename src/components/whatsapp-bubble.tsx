interface WhatsAppBubbleProps {
  text: string
  size?: 'sm' | 'md'
  wallpaper?: 'classic' | 'plain'
  timestamp?: string
  read?: boolean
}

const wallpaperSvg = encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'><g fill='none' stroke='rgba(0,0,0,0.04)' stroke-width='1'><path d='M10 30 Q 25 10 40 30 T 70 30'/><path d='M60 80 Q 75 60 90 80 T 120 80'/><circle cx='90' cy='25' r='6'/><circle cx='25' cy='95' r='4'/><path d='M30 60 l 6 6 l -6 6 l -6 -6 z'/></g></svg>`,
)

export function WhatsAppBubble({ text, size = 'md', wallpaper = 'classic', timestamp = '02:00', read = true }: WhatsAppBubbleProps) {
  const scale = size === 'sm' ? 0.78 : 1
  const wpBg = wallpaper === 'classic' ? '#E5DDD5' : '#ECE5DD'

  return (
    <div
      style={{
        background: wpBg,
        backgroundImage: `url("data:image/svg+xml;utf8,${wallpaperSvg}")`,
        backgroundRepeat: 'repeat',
        padding: 16 * scale,
        borderRadius: 8,
        fontFamily: '-apple-system, "Segoe UI", system-ui, sans-serif',
        color: '#111B21',
        lineHeight: 1.45,
      }}
    >
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: `${8 * scale}px ${8 * scale}px ${8 * scale}px 2px`,
          padding: `${10 * scale}px ${12 * scale}px ${6 * scale}px`,
          maxWidth: '100%',
          boxShadow: '0 1px 0.5px rgba(0,0,0,0.13)',
          position: 'relative',
          fontSize: 14 * scale,
        }}
      >
        <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{text}</div>

        <div style={{ marginTop: 4 * scale, textAlign: 'right', fontSize: 11 * scale, color: '#667781', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2 }}>
          {timestamp}
          <svg width={16 * scale} height={11 * scale} viewBox="0 0 16 11" style={{ marginLeft: 2 }}>
            <path d="M11.071.653a.457.457 0 0 0-.304-.102.493.493 0 0 0-.381.178l-6.19 7.636-2.405-2.272a.463.463 0 0 0-.336-.147.436.436 0 0 0-.324.13l-.74.74a.45.45 0 0 0 0 .648l3.479 3.479a.456.456 0 0 0 .664-.018l7.272-9.272a.45.45 0 0 0 .087-.32.45.45 0 0 0-.182-.32z" fill={read ? '#53BDEB' : '#8696A0'} />
            <path d="M15.917.347a.45.45 0 0 0-.18-.082.435.435 0 0 0-.34.13L9 7.347 7.835 6.182a.45.45 0 0 0-.665.018l-.741.741a.45.45 0 0 0 0 .647l1.834 1.834a.456.456 0 0 0 .664-.018l7.272-9.272a.45.45 0 0 0-.082-.6z" fill={read ? '#53BDEB' : '#8696A0'} transform="translate(-3 0)" />
          </svg>
        </div>
      </div>
    </div>
  )
}

export function WhatsAppBubbleCompact({ text }: { text: string }) {
  const scale = 0.85
  return (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: `${10 * scale}px ${10 * scale}px ${10 * scale}px 2px`,
        padding: `${10 * scale}px ${12 * scale}px ${8 * scale}px`,
        boxShadow: '0 1px 0.5px rgba(0,0,0,0.13)',
        fontFamily: '-apple-system, "Segoe UI", system-ui, sans-serif',
        color: '#111B21',
        fontSize: 13 * scale,
        lineHeight: 1.4,
        position: 'relative',
        maxHeight: 200 * scale,
        overflow: 'hidden',
      }}
    >
      <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{text}</div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 60 * scale, background: 'linear-gradient(to bottom, rgba(255,255,255,0), #FFFFFF)', pointerEvents: 'none' }} />
    </div>
  )
}
