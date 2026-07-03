// Shared WhatsApp-style chat bubble preview.
// Renders the canonical TOTA message format.
// Props: { msg, size: 'sm'|'md', wallpaper: 'classic'|'plain' }

function WhatsAppBubble({ msg, size = 'md', wallpaper = 'classic', timestamp = '02:00', read = true }) {
  const scale = size === 'sm' ? 0.78 : 1;
  const wpBg = wallpaper === 'classic' ? '#E5DDD5' : '#ECE5DD';

  // Doodle pattern (subtle leaves / shapes) for the WhatsApp wallpaper look
  const wallpaperSvg = encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'>
       <g fill='none' stroke='rgba(0,0,0,0.04)' stroke-width='1'>
         <path d='M10 30 Q 25 10 40 30 T 70 30'/>
         <path d='M60 80 Q 75 60 90 80 T 120 80'/>
         <circle cx='90' cy='25' r='6'/>
         <circle cx='25' cy='95' r='4'/>
         <path d='M30 60 l 6 6 l -6 6 l -6 -6 z'/>
       </g>
     </svg>`
  );

  return (
    <div style={{
      background: wpBg,
      backgroundImage: `url("data:image/svg+xml;utf8,${wallpaperSvg}")`,
      backgroundRepeat: 'repeat',
      padding: 16 * scale,
      borderRadius: 8,
      fontFamily: '-apple-system, "Segoe UI", system-ui, sans-serif',
      color: '#111B21',
      lineHeight: 1.45,
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: `${8*scale}px ${8*scale}px ${8*scale}px 2px`,
        padding: `${10*scale}px ${12*scale}px ${6*scale}px ${12*scale}px`,
        maxWidth: '100%',
        boxShadow: '0 1px 0.5px rgba(0,0,0,0.13)',
        position: 'relative',
        fontSize: 14 * scale,
      }}>
        {/* Trumpet header */}
        <div style={{ fontSize: 16 * scale, letterSpacing: 1 }}>{msg.header}</div>

        {/* Ministry name */}
        <div style={{ fontWeight: 700, marginTop: 6 * scale, fontSize: 14 * scale }}>
          {msg.ministry}
        </div>

        {/* Date */}
        <div style={{ fontStyle: 'italic', marginTop: 2 * scale, color: '#3B4A54' }}>
          {msg.date}
        </div>

        {/* Title */}
        <div style={{ fontWeight: 700, fontStyle: 'italic', marginTop: 10 * scale, fontSize: 15 * scale }}>
          {msg.title}
        </div>

        {/* Verse + ref */}
        <div style={{ marginTop: 8 * scale }}>
          <span style={{ fontStyle: 'italic' }}>“{msg.verse}”</span>
          <span style={{ fontWeight: 600 }}> — {msg.ref}</span>
        </div>

        {/* Author */}
        <div style={{ marginTop: 6 * scale, color: '#3B4A54' }}>{msg.author}</div>

        {/* Body */}
        {msg.body.map((p, i) => (
          <p key={i} style={{ margin: `${10*scale}px 0 0 0` }}>{p}</p>
        ))}

        {/* Prayer */}
        <div style={{ marginTop: 12 * scale }}>
          <div style={{ fontWeight: 700 }}>PRAYER POINTS</div>
          <ol style={{ margin: `${4*scale}px 0 0 ${18*scale}px`, padding: 0 }}>
            {msg.prayer.map((pt, i) => (
              <li key={i} style={{ margin: `${4*scale}px 0`, fontWeight: 600 }}>{pt}</li>
            ))}
          </ol>
        </div>

        {/* Resolve */}
        <div style={{ marginTop: 12 * scale, fontWeight: 700, fontStyle: 'italic' }}>
          {msg.resolve}
        </div>
        <div style={{ fontStyle: 'italic', marginTop: 2 * scale }}>
          {msg.resolveLine}
        </div>

        {/* Footer */}
        <div style={{ marginTop: 12 * scale, fontSize: 12 * scale, color: '#3B4A54' }}>
          <div>🌐 <span style={{ color: '#027EB5' }}>{msg.footer.site}</span></div>
          <div>📷 <span style={{ color: '#027EB5' }}>{msg.footer.ig}</span></div>
        </div>

        {/* timestamp + ticks */}
        <div style={{
          marginTop: 4 * scale, textAlign: 'right', fontSize: 11 * scale, color: '#667781',
          display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2,
        }}>
          {timestamp}
          <svg width={16*scale} height={11*scale} viewBox="0 0 16 11" style={{ marginLeft: 2 }}>
            <path d="M11.071.653a.457.457 0 0 0-.304-.102.493.493 0 0 0-.381.178l-6.19 7.636-2.405-2.272a.463.463 0 0 0-.336-.147.436.436 0 0 0-.324.13l-.74.74a.45.45 0 0 0 0 .648l3.479 3.479a.456.456 0 0 0 .664-.018l7.272-9.272a.45.45 0 0 0 .087-.32.45.45 0 0 0-.182-.32z" fill={read ? '#53BDEB' : '#8696A0'}/>
            <path d="M15.917.347a.45.45 0 0 0-.18-.082.435.435 0 0 0-.34.13L9 7.347 7.835 6.182a.45.45 0 0 0-.665.018l-.741.741a.45.45 0 0 0 0 .647l1.834 1.834a.456.456 0 0 0 .664-.018l7.272-9.272a.45.45 0 0 0-.082-.6z" fill={read ? '#53BDEB' : '#8696A0'} transform="translate(-3 0)"/>
          </svg>
        </div>
      </div>
    </div>
  );
}

// Compact version: shows just the first few lines + a fade. Used in dashboards/lists.
function WhatsAppBubbleCompact({ msg, size = 'sm' }) {
  const scale = size === 'sm' ? 0.85 : 1;
  return (
    <div style={{
      background: '#FFFFFF',
      borderRadius: `${10*scale}px ${10*scale}px ${10*scale}px 2px`,
      padding: `${10*scale}px ${12*scale}px ${8*scale}px ${12*scale}px`,
      boxShadow: '0 1px 0.5px rgba(0,0,0,0.13)',
      fontFamily: '-apple-system, "Segoe UI", system-ui, sans-serif',
      color: '#111B21',
      fontSize: 13 * scale,
      lineHeight: 1.4,
      position: 'relative',
      maxHeight: 200 * scale,
      overflow: 'hidden',
    }}>
      <div style={{ fontSize: 15 * scale }}>{msg.header}</div>
      <div style={{ fontWeight: 700, marginTop: 4 * scale }}>{msg.ministry}</div>
      <div style={{ fontStyle: 'italic', marginTop: 2 * scale, color: '#3B4A54', fontSize: 12 * scale }}>{msg.date}</div>
      <div style={{ fontWeight: 700, fontStyle: 'italic', marginTop: 8 * scale }}>{msg.title}</div>
      <div style={{ marginTop: 6 * scale }}>
        <span style={{ fontStyle: 'italic' }}>“{msg.verse}”</span>
        <span style={{ fontWeight: 600 }}> — {msg.ref}</span>
      </div>
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, height: 60 * scale,
        background: 'linear-gradient(to bottom, rgba(255,255,255,0), #FFFFFF)',
        pointerEvents: 'none',
      }}/>
    </div>
  );
}

window.WhatsAppBubble = WhatsAppBubble;
window.WhatsAppBubbleCompact = WhatsAppBubbleCompact;
