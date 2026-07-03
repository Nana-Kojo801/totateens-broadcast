// Pulse shell — theme tokens, icon library, desktop sidebar/topbar,
// mobile status bar / bottom nav, and primitive UI atoms.

(function () {
  const P = {
    bg: '#F7F7F4',
    bgSoft: '#FAFAF7',
    surface: '#FFFFFF',
    surfaceAlt: '#F1F1ED',
    ink: '#0E1410',
    inkSoft: '#5A6660',
    inkFaint: '#9CA5A0',
    line: '#E5E5E0',
    lineSoft: '#EFEFEA',
    sage: '#2F7D5C',
    sageHi: '#3C9871',
    sageTint: '#DEF2E7',
    sageDeep: '#1F5A41',
    sun: '#D88B26',
    sunTint: '#FBE9CC',
    rose: '#B23A48',
    roseTint: '#F7D9DD',
    sky: '#3D6FA8',
    skyTint: '#DCE6F2',
    sans: '"Geist", "Manrope", -apple-system, system-ui, sans-serif',
    mono: '"Geist Mono", "JetBrains Mono", ui-monospace, monospace',
  };

  // === Atoms ==================================================================
  const Card = ({ children, style, onClick, ...rest }) => (
    <div onClick={onClick} style={{
      background: P.surface, borderRadius: 10, border: `1px solid ${P.line}`,
      ...style,
    }} {...rest}>{children}</div>
  );

  const Tag = ({ children, color = P.ink, bg = P.surfaceAlt, style, ...rest }) => (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '2px 7px', borderRadius: 5, fontSize: 11, fontWeight: 500,
      fontFamily: P.mono, color, background: bg, letterSpacing: 0,
      whiteSpace: 'nowrap', ...style,
    }} {...rest}>{children}</span>
  );

  const Dot = ({ color, size = 6 }) => (
    <span style={{ width: size, height: size, borderRadius: 99, background: color, display: 'inline-block' }} />
  );

  const Btn = ({ variant = 'ghost', children, style, onClick, ...rest }) => {
    const base = {
      padding: '7px 11px', borderRadius: 7, fontSize: 12, fontWeight: 600, fontFamily: P.sans,
      cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
      transition: 'background .1s ease, transform .05s ease',
    };
    const variants = {
      primary: { ...base, border: `1px solid ${P.sageDeep}`, background: P.sage, color: '#FFF' },
      ghost:   { ...base, border: `1px solid ${P.line}`, background: P.surface, color: P.ink },
      subtle:  { ...base, border: '1px solid transparent', background: P.surfaceAlt, color: P.ink },
      danger:  { ...base, border: `1px solid #8E2A36`, background: P.rose, color: '#FFF' },
    };
    return <button type="button" onClick={onClick} style={{ ...variants[variant], ...style }} {...rest}>{children}</button>;
  };

  const Icon = ({ name, size = 16, color = 'currentColor' }) => {
    const props = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' };
    const I = {
      dashboard: <svg {...props}><rect x="3" y="3" width="8" height="10" rx="1.5"/><rect x="13" y="3" width="8" height="6" rx="1.5"/><rect x="13" y="11" width="8" height="10" rx="1.5"/><rect x="3" y="15" width="8" height="6" rx="1.5"/></svg>,
      calendar: <svg {...props}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>,
      upload: <svg {...props}><path d="M12 3v12"/><path d="M7 8l5-5 5 5"/><path d="M5 21h14"/></svg>,
      message: <svg {...props}><path d="M21 12a8 8 0 0 1-12.3 6.7L3 20l1.3-5.7A8 8 0 1 1 21 12z"/></svg>,
      groups: <svg {...props}><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 19c0-3 2.5-5 6-5s6 2 6 5"/><path d="M14 19c0-2 1.5-4 4-4s3.5 1.5 3.5 4"/></svg>,
      history: <svg {...props}><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/><path d="M12 8v5l3 2"/></svg>,
      settings: <svg {...props}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3 1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8 1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>,
      send: <svg {...props}><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>,
      check: <svg {...props}><path d="M5 12l5 5 9-11"/></svg>,
      x: <svg {...props}><path d="M6 6l12 12M18 6L6 18"/></svg>,
      plus: <svg {...props}><path d="M12 5v14M5 12h14"/></svg>,
      pencil: <svg {...props}><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>,
      trash: <svg {...props}><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>,
      bell: <svg {...props}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/></svg>,
      eye: <svg {...props}><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>,
      arrowRight: <svg {...props}><path d="M5 12h14M13 5l7 7-7 7"/></svg>,
      chevronRight: <svg {...props}><path d="M9 6l6 6-6 6"/></svg>,
      chevronLeft: <svg {...props}><path d="M15 18l-6-6 6-6"/></svg>,
      clock: <svg {...props}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>,
      file: <svg {...props}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>,
      flash: <svg {...props}><path d="M13 2L4 14h7l-1 8 9-12h-7z"/></svg>,
      more: <svg {...props}><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>,
      logout: <svg {...props}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/></svg>,
      home: <svg {...props}><path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/></svg>,
    };
    return I[name] || I.dashboard;
  };

  // === Desktop shell ==========================================================
  const NAV = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', kbd: 'D' },
    { id: 'calendar',  label: 'Calendar',  icon: 'calendar',  kbd: 'C' },
    { id: 'upload',    label: 'Source PDF',icon: 'upload',    kbd: 'U' },
    { id: 'messages',  label: 'Messages',  icon: 'message',   kbd: 'M' },
    { id: 'groups',    label: 'Groups',    icon: 'groups',    kbd: 'G' },
    { id: 'history',   label: 'History',   icon: 'history',   kbd: 'H' },
    { id: 'settings',  label: 'Settings',  icon: 'settings',  kbd: 'S' },
  ];

  function DesktopShell({ active, onNav, onSignOut, breadcrumbs, rightTopbar, children }) {
    return (
      <div style={{
        width: '100%', height: '100%', display: 'grid',
        gridTemplateColumns: '224px 1fr', background: P.bg,
        fontFamily: P.sans, color: P.ink, fontSize: 13, letterSpacing: -0.01,
      }}>
        {/* Sidebar */}
        <aside style={{ borderRight: `1px solid ${P.line}`, background: P.bgSoft, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px 14px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 7, background: P.sage, color: '#FFF',
              display: 'grid', placeItems: 'center', fontSize: 14, fontWeight: 700,
            }}>🎺</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 13, lineHeight: 1 }}>TOTA Broadcast</div>
              <div style={{ fontSize: 11, color: P.inkSoft, marginTop: 3 }}>Trumpets · v1.2.4</div>
            </div>
          </div>

          <nav style={{ padding: '4px 8px', flex: 1, overflow: 'auto' }}>
            <div style={{ fontSize: 10, color: P.inkFaint, letterSpacing: 1.4, padding: '4px 8px 6px', fontWeight: 600 }}>WORKSPACE</div>
            {NAV.map(n => {
              const on = active === n.id;
              return (
                <button key={n.id} type="button" onClick={() => onNav(n.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 9, padding: '6px 8px', borderRadius: 6, marginBottom: 1,
                  background: on ? P.surface : 'transparent', border: on ? `1px solid ${P.line}` : '1px solid transparent',
                  boxShadow: on ? '0 1px 2px rgba(14,20,16,0.05)' : 'none',
                  color: on ? P.ink : P.inkSoft, fontWeight: on ? 600 : 500, fontSize: 13,
                  width: '100%', cursor: 'pointer', fontFamily: P.sans, textAlign: 'left',
                }}>
                  <Icon name={n.icon} size={15} color={on ? P.sage : P.inkSoft}/>
                  <span style={{ flex: 1 }}>{n.label}</span>
                  <span style={{ fontFamily: P.mono, fontSize: 10, color: P.inkFaint, padding: '1px 5px', borderRadius: 4, background: on ? P.surfaceAlt : 'transparent', opacity: on ? 1 : 0 }}>{n.kbd}</span>
                </button>
              );
            })}

            <div style={{ fontSize: 10, color: P.inkFaint, letterSpacing: 1.4, padding: '14px 8px 6px', fontWeight: 600 }}>STATUS</div>
            <div style={{ padding: '10px 10px', borderRadius: 7, border: `1px solid ${P.line}`, background: P.surface }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: P.sage, fontWeight: 600 }}>
                <span style={{ width: 6, height: 6, borderRadius: 99, background: P.sage, boxShadow: `0 0 0 3px ${P.sageTint}` }}/>
                Scheduler · running
              </div>
              <div style={{ fontFamily: P.mono, fontSize: 11, color: P.inkSoft, marginTop: 6 }}>Next: 24/05 · 02:00</div>
              <div style={{ fontFamily: P.mono, fontSize: 10, color: P.inkFaint, marginTop: 2 }}>in 14h 23m</div>
            </div>
          </nav>

          {/* User */}
          <div style={{ borderTop: `1px solid ${P.line}`, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ width: 28, height: 28, borderRadius: 99, background: P.sage, color: '#FFF', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 700 }}>EJ</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600 }}>Pastor Elliot</div>
              <div style={{ fontSize: 10, color: P.inkSoft, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>elliot@trumpetsoftheages.org</div>
            </div>
            <button type="button" onClick={onSignOut} title="Sign out" style={{
              width: 26, height: 26, borderRadius: 6, border: 'none', background: 'transparent',
              color: P.inkSoft, cursor: 'pointer', display: 'grid', placeItems: 'center',
            }}><Icon name="logout" size={14} color={P.inkSoft}/></button>
          </div>
        </aside>

        {/* Main */}
        <main style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          <header style={{
            padding: '11px 22px', borderBottom: `1px solid ${P.line}`,
            display: 'flex', alignItems: 'center', gap: 12, background: P.bg, minHeight: 30,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: P.inkSoft, fontSize: 12, flex: 1, minWidth: 0 }}>
              {(breadcrumbs || []).map((b, i) => (
                <span key={i} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  color: i === breadcrumbs.length - 1 ? P.ink : P.inkSoft,
                  fontWeight: i === breadcrumbs.length - 1 ? 600 : 500,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {b}{i < breadcrumbs.length - 1 && <Icon name="chevronRight" size={11} color={P.inkFaint}/>}
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>{rightTopbar}</div>
          </header>
          <div style={{ flex: 1, overflow: 'auto', padding: 20, background: P.bg, minWidth: 0 }}>
            {children}
          </div>
        </main>
      </div>
    );
  }

  // === Mobile shell ===========================================================
  function StatusBar() {
    return (
      <div style={{
        height: 44, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 22px', fontSize: 14, fontWeight: 600, color: P.ink, flex: '0 0 auto', fontFamily: P.sans,
      }}>
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>9:41</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <svg width="16" height="11" viewBox="0 0 16 11"><path d="M1 6.5C3.5 4 6 2.5 8 2.5s4.5 1.5 7 4" stroke={P.ink} strokeWidth="1.2" fill="none" strokeLinecap="round"/><circle cx="8" cy="9" r="1.2" fill={P.ink}/></svg>
          <svg width="14" height="11" viewBox="0 0 14 11"><rect x="1" y="2" width="9" height="7" rx="1.5" stroke={P.ink} strokeWidth="1" fill="none"/><rect x="2.5" y="3.5" width="6" height="4" rx="0.5" fill={P.ink}/><rect x="11" y="4.5" width="2" height="2" fill={P.ink}/></svg>
        </span>
      </div>
    );
  }

  const MOBILE_NAV = [
    { id: 'dashboard', icon: 'dashboard', label: 'Home' },
    { id: 'calendar',  icon: 'calendar',  label: 'Days' },
    { id: 'upload',    icon: 'upload',    label: 'Source' },
    { id: 'groups',    icon: 'groups',    label: 'Groups' },
    { id: 'settings',  icon: 'settings',  label: 'More' },
  ];

  function BottomNav({ active, onNav }) {
    return (
      <div style={{
        flex: '0 0 auto', background: 'rgba(255,255,255,0.92)',
        borderTop: `1px solid ${P.line}`,
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        padding: '4px 8px 14px',
      }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
          alignItems: 'stretch',
        }}>
          {MOBILE_NAV.map(it => {
            const on = active === it.id;
            return (
              <button key={it.id} type="button" onClick={() => onNav(it.id)} style={{
                border: 'none', background: 'transparent', cursor: 'pointer', padding: 0,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                position: 'relative', fontFamily: P.sans, color: on ? P.sage : P.inkSoft,
              }}>
                {/* top indicator pill */}
                <span style={{
                  width: 24, height: 3, borderRadius: 99,
                  background: on ? P.sage : 'transparent',
                  marginTop: 0, marginBottom: 4,
                }}/>
                <Icon name={it.icon} size={21} color={on ? P.sage : P.inkSoft}/>
                <span style={{
                  fontSize: 10.5, letterSpacing: 0.2,
                  fontWeight: on ? 600 : 500,
                }}>{it.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  function MobileShell({ active, onNav, onSignOut, header, hideNav = false, children }) {
    return (
      <div style={{
        width: '100%', height: '100%', background: P.bg, color: P.ink,
        fontFamily: P.sans, display: 'flex', flexDirection: 'column', overflow: 'hidden',
        position: 'relative', fontSize: 13,
      }}>
        <StatusBar/>
        {header}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {children}
        </div>
        {!hideNav && <BottomNav active={active} onNav={onNav}/>}
      </div>
    );
  }

  function MobileTopBar({ title, sub, leftAction, rightAction, center }) {
    return (
      <div style={{ padding: '4px 16px 12px', display: 'flex', alignItems: 'center', gap: 12, flex: '0 0 auto' }}>
        {leftAction || <div style={{ width: 34 }}/>}
        <div style={{ flex: 1, textAlign: center ? 'center' : 'left' }}>
          {sub && <div style={{ fontSize: 10, color: P.inkSoft, fontFamily: P.mono, letterSpacing: 1 }}>{sub}</div>}
          <div style={{ fontSize: 18, fontWeight: 600, marginTop: 2 }}>{title}</div>
        </div>
        {rightAction || <div style={{ width: 34 }}/>}
      </div>
    );
  }

  // Small icon button (mobile) — circular surface w/ border
  function IconBtn({ icon, onClick, size = 34, color = P.ink, badge }) {
    return (
      <button type="button" onClick={onClick} style={{
        width: size, height: size, borderRadius: 8, border: `1px solid ${P.line}`, background: P.surface,
        display: 'grid', placeItems: 'center', cursor: 'pointer', position: 'relative',
      }}>
        <Icon name={icon} size={Math.round(size * 0.45)} color={color}/>
        {badge && <span style={{ position: 'absolute', top: 5, right: 5, width: 7, height: 7, borderRadius: 99, background: badge }}/>}
      </button>
    );
  }

  window.Pulse = {
    P, Card, Tag, Dot, Btn, Icon,
    DesktopShell, MobileShell, MobileTopBar, IconBtn, BottomNav, StatusBar,
    NAV, MOBILE_NAV,
  };
})();
