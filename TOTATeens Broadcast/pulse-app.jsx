// Pulse App — interactive prototype with all screens + working navigation,
// modals, edit flow, manual send, sign-in/out, and add-group.

(function () {
  const T = window.TOTA;
  const { Pulse } = window;
  const { P, Card, Tag, Dot, Btn, Icon, DesktopShell, MobileShell, MobileTopBar, IconBtn, BottomNav } = Pulse;
  const { DAYS: SEED_DAYS, GROUPS: SEED_GROUPS, HISTORY: SEED_HISTORY, MONTH_LABEL, TODAY, dowShort, calendarGrid, formatMessage, ordinal } = T;

  const { useState, useEffect, useRef, useMemo } = React;

  // === Toast helper ===========================================================
  function ToastHost({ toast }) {
    if (!toast) return null;
    return (
      <div style={{
        position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
        background: P.ink, color: '#FFF', padding: '10px 16px', borderRadius: 9,
        fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8,
        boxShadow: '0 8px 24px rgba(0,0,0,0.18)', zIndex: 50, fontFamily: P.sans,
        animation: 'pulse-toast-in 200ms ease-out',
      }}>
        <span style={{ width: 6, height: 6, borderRadius: 99, background: P.sageHi, boxShadow: `0 0 0 3px rgba(60,152,113,0.25)` }}/>
        {toast}
      </div>
    );
  }

  // === Header icon (mobile) ===================================================
  // Renders a small sage-tinted icon as the left action of the mobile top bar,
  // matching the bottom-nav glyph for the current screen.
  function HeaderIcon({ name }) {
    return (
      <div style={{
        width: 34, height: 34, borderRadius: 8, background: P.sageTint, color: P.sage,
        display: 'grid', placeItems: 'center', flexShrink: 0,
      }}>
        <Icon name={name} size={16} color={P.sage}/>
      </div>
    );
  }

  // === Modal shell ============================================================
  function ModalBackdrop({ onClose, children, viewport }) {
    if (viewport === 'mobile') {
      // Bottom sheet
      return (
        <div onClick={onClose} style={{
          position: 'absolute', inset: 0, background: 'rgba(14,20,16,0.55)', zIndex: 40,
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            width: '100%', background: P.surface, borderRadius: '16px 16px 0 0',
            padding: '14px 20px 22px', maxHeight: '90%', overflowY: 'auto',
            boxShadow: '0 -8px 32px rgba(0,0,0,0.18)',
          }}>
            <div style={{ width: 38, height: 4, borderRadius: 99, background: P.line, margin: '0 auto 14px' }}/>
            {children}
          </div>
        </div>
      );
    }
    // Centered modal (desktop)
    return (
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0, background: 'rgba(14,20,16,0.45)', zIndex: 40,
        display: 'grid', placeItems: 'center', backdropFilter: 'blur(2px)',
      }}>
        <div onClick={(e) => e.stopPropagation()} style={{
          width: 480, maxWidth: '90%', background: P.surface, borderRadius: 12,
          padding: 22, boxShadow: '0 24px 60px rgba(0,0,0,0.25)', maxHeight: '85%', overflowY: 'auto',
        }}>{children}</div>
      </div>
    );
  }

  // === Auth screen ============================================================
  function AuthScreen({ onSignIn, viewport }) {
    const [loading, setLoading] = useState(false);
    const handleSignIn = () => {
      setLoading(true);
      setTimeout(() => { setLoading(false); onSignIn(); }, 800);
    };

    const features = [
      { icon: 'upload',  title: 'Upload once a month',
        desc: 'Drop in the PDF — 31 days extracted in seconds.' },
      { icon: 'clock',   title: 'Auto-broadcast at 02:00 GMT',
        desc: 'Every day, every group, no reminders needed.' },
      { icon: 'eye',     title: 'Preview, edit, override',
        desc: 'See exactly what lands in WhatsApp. Tweak anytime.' },
    ];

    if (viewport === 'mobile') {
      return (
        <div style={{
          width: '100%', height: '100%', background: P.bg, color: P.ink,
          fontFamily: P.sans, display: 'flex', flexDirection: 'column',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* subtle dot pattern */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `radial-gradient(circle at 1px 1px, ${P.line} 1px, transparent 0)`,
            backgroundSize: '24px 24px', opacity: 0.5,
          }}/>

          <div style={{
            flex: 1, position: 'relative', padding: '18px 22px 16px',
            display: 'flex', flexDirection: 'column', minHeight: 0,
          }}>
            {/* Brand lockup */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 9, background: P.sage, color: '#FFF',
                display: 'grid', placeItems: 'center', fontSize: 18,
                boxShadow: 'inset 0 -2px 0 rgba(0,0,0,0.18)',
              }}>🎺</div>
              <div>
                <div style={{ fontSize: 10, color: P.inkSoft, fontFamily: P.mono, letterSpacing: 1.4, fontWeight: 600 }}>TRUMPETS OF THE AGES</div>
                <div style={{ fontSize: 13, fontWeight: 600, marginTop: 1 }}>TOTATeens Broadcast</div>
              </div>
            </div>

            {/* Headline */}
            <h1 style={{
              fontSize: 28, fontWeight: 600, lineHeight: 1.12, margin: '22px 0 0',
              letterSpacing: -0.5, color: P.ink,
            }}>
              A month of devotionals,<br/>
              on <span style={{ color: P.sage }}>cruise control.</span>
            </h1>
            <p style={{ fontSize: 13.5, color: P.inkSoft, lineHeight: 1.55, margin: '12px 0 0' }}>
              The day’s devotional, to every WhatsApp group, every morning at 02:00 GMT. Upload once — the whole month takes care of itself.
            </p>

            {/* Feature rows */}
            <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {features.map((f, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '30px 1fr', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: 8, background: P.sageTint, color: P.sage,
                    display: 'grid', placeItems: 'center', flexShrink: 0,
                  }}>
                    <Icon name={f.icon} size={15} color={P.sage}/>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: P.ink }}>{f.title}</div>
                    <div style={{ fontSize: 12, color: P.inkSoft, marginTop: 2, lineHeight: 1.5 }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ flex: 1 }}/>

            {/* Primary CTA */}
            <button type="button" onClick={handleSignIn} disabled={loading} style={{
              width: '100%', padding: '14px 16px', borderRadius: 11,
              background: P.sage, color: '#FFF', border: `1px solid ${P.sageDeep}`, cursor: loading ? 'wait' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              fontSize: 14.5, fontWeight: 600, fontFamily: P.sans,
              boxShadow: '0 8px 20px -8px rgba(47,125,92,0.55)',
              opacity: loading ? 0.85 : 1,
            }}>
              <span style={{
                width: 22, height: 22, borderRadius: 99, background: '#FFF',
                display: 'grid', placeItems: 'center', flexShrink: 0,
              }}><GoogleG/></span>
              {loading ? 'Signing in…' : 'Continue with Google'}
            </button>

            <div style={{ marginTop: 10, fontSize: 12, color: P.inkSoft, textAlign: 'center', lineHeight: 1.5 }}>
              Coordinators only. <a style={{ color: P.sage, fontWeight: 600 }}>Request invitation →</a>
            </div>
          </div>
        </div>
      );
    }

    // Desktop
    return (
      <div style={{
        width: '100%', height: '100%', background: P.bg, color: P.ink,
        fontFamily: P.sans, display: 'flex', flexDirection: 'column',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `radial-gradient(circle at 1px 1px, ${P.line} 1px, transparent 0)`,
          backgroundSize: '24px 24px', opacity: 0.5,
        }}/>

        <div style={{
          flex: 1, position: 'relative',
          display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0, 400px)',
          gap: 56, padding: '0 72px', alignItems: 'center',
        }}>
          {/* Hero */}
          <div style={{ maxWidth: 540 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              <div style={{
                width: 42, height: 42, borderRadius: 11, background: P.sage, color: '#FFF',
                display: 'grid', placeItems: 'center', fontSize: 21,
                boxShadow: `inset 0 -2px 0 rgba(0,0,0,0.18)`,
              }}>🎺</div>
              <div>
                <div style={{ fontSize: 11, color: P.inkSoft, fontFamily: P.mono, letterSpacing: 1.4, fontWeight: 600 }}>TRUMPETS OF THE AGES</div>
                <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>TOTATeens Broadcast</div>
              </div>
            </div>

            <h1 style={{
              fontSize: 42, fontWeight: 600, lineHeight: 1.1, margin: '22px 0 0',
              letterSpacing: -0.6, color: P.ink,
            }}>
              A month of devotionals,<br/>
              on <span style={{ color: P.sage }}>cruise control.</span>
            </h1>
            <p style={{
              fontSize: 15, color: P.inkSoft, lineHeight: 1.55,
              margin: '14px 0 0', maxWidth: 460,
            }}>
              The day’s devotional, to every WhatsApp group, every morning at 02:00 GMT. Upload once — the whole month takes care of itself.
            </p>

            <div style={{ marginTop: 26, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {features.map((f, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '32px 1fr', gap: 13, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, background: P.sageTint, color: P.sage,
                    display: 'grid', placeItems: 'center', flexShrink: 0,
                  }}>
                    <Icon name={f.icon} size={16} color={P.sage}/>
                  </div>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: P.ink }}>{f.title}</div>
                    <div style={{ fontSize: 12.5, color: P.inkSoft, marginTop: 2, lineHeight: 1.5 }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sign-in card */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{
              width: 360, background: P.surface, borderRadius: 14, border: `1px solid ${P.line}`,
              padding: 28, boxShadow: '0 24px 60px -20px rgba(14,20,16,0.18)',
            }}>
              <div style={{ fontSize: 11, color: P.inkSoft, fontFamily: P.mono, letterSpacing: 1.4, fontWeight: 600 }}>
                COORDINATORS · SIGN IN
              </div>
              <div style={{ fontSize: 18, fontWeight: 600, marginTop: 5, lineHeight: 1.25 }}>
                Continue with your ministry Google account.
              </div>

              <button type="button" onClick={handleSignIn} disabled={loading} style={{
                width: '100%', marginTop: 18, padding: '12px 14px', borderRadius: 9,
                background: P.surface, border: `1px solid ${P.line}`, cursor: loading ? 'wait' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 11,
                fontSize: 14, fontWeight: 600, color: P.ink, fontFamily: P.sans,
              }}>
                <GoogleG/>
                {loading ? 'Signing in…' : 'Continue with Google'}
              </button>

              <div style={{
                marginTop: 14, padding: 11, borderRadius: 8, background: P.bgSoft, border: `1px solid ${P.lineSoft}`,
                display: 'flex', gap: 10, alignItems: 'flex-start',
              }}>
                <Icon name="flash" size={13} color={P.sage}/>
                <div style={{ fontSize: 11.5, color: P.inkSoft, lineHeight: 1.5 }}>
                  Access is granted by the lead pastor.{' '}
                  <a style={{ color: P.sage, fontWeight: 600, cursor: 'pointer' }}>Request invitation</a>.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{
          padding: '10px 22px', borderTop: `1px solid ${P.lineSoft}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontSize: 11, color: P.inkFaint, fontFamily: P.mono, letterSpacing: 0.4, background: P.bgSoft,
          position: 'relative', flexShrink: 0,
        }}>
          <span>trumpets of the ages · daily devotional broadcast</span>
          <span>v1.2.4 · last deploy 22 May 2026</span>
        </div>
      </div>
    );
  }

  function GoogleG() {
    return (
      <svg width="18" height="18" viewBox="0 0 18 18">
        <path d="M17.64 9.2a8.8 8.8 0 0 0-.14-1.59H9v3.02h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.4z" fill="#4285F4"/>
        <path d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.81.54-1.84.87-3.05.87-2.34 0-4.32-1.58-5.03-3.71H.96v2.33A9 9 0 0 0 9 18z" fill="#34A853"/>
        <path d="M3.97 10.72A5.41 5.41 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.05l3.01-2.33z" fill="#FBBC05"/>
        <path d="M9 3.58c1.32 0 2.5.46 3.44 1.35l2.58-2.58A9 9 0 0 0 9 0 9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" fill="#EA4335"/>
      </svg>
    );
  }

  // === Dashboard ==============================================================
  function DashboardScreen({ state, actions, viewport }) {
    const { days } = state;
    const today = days[TODAY - 1];
    const tomorrow = days[TODAY];
    const sentCount = days.filter(d => d.status === 'sent').length;
    const msg = formatMessage(today);

    if (viewport === 'mobile') {
      return (
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 16px' }}>
          {/* Hero next-broadcast */}
          <div style={{
            background: P.ink, color: '#FFF', borderRadius: 14, padding: 16, position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 10.5, letterSpacing: 1, fontWeight: 600, color: '#9CB3A3' }}>
              <Dot color={P.sageHi}/> NEXT BROADCAST · 02:00 GMT
            </div>
            <div style={{ fontFamily: P.mono, fontSize: 34, fontWeight: 600, lineHeight: 1, marginTop: 6 }}>14h 23m</div>
            <div style={{ fontSize: 12, color: '#C8D4CD', marginTop: 7 }}>Tonight · Day 24 · {days[23].title}</div>
            <div style={{ display: 'flex', gap: 6, marginTop: 14 }}>
              <button onClick={() => actions.openMessage(24, 'preview')} style={{
                flex: 1, padding: 10, borderRadius: 8, background: 'rgba(255,255,255,0.1)', border: `1px solid rgba(255,255,255,0.15)`,
                color: '#FFF', fontWeight: 600, fontSize: 12, cursor: 'pointer',
              }}>Preview</button>
              <button onClick={() => actions.openManualSend(23)} style={{
                flex: 1.4, padding: 10, borderRadius: 8, background: P.sage, border: `1px solid ${P.sageDeep}`,
                color: '#FFF', fontWeight: 700, fontSize: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer',
              }}><Icon name="send" size={12} color="#FFF"/> Send Day 23 now</button>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
            <Card style={{ padding: 12 }}>
              <div style={{ fontSize: 10, color: P.inkSoft, letterSpacing: 1, fontWeight: 600 }}>PROGRESS</div>
              <div style={{ fontFamily: P.mono, fontSize: 22, fontWeight: 600, marginTop: 4 }}>{sentCount}/31</div>
              <div style={{ height: 4, background: P.surfaceAlt, borderRadius: 99, marginTop: 8, overflow: 'hidden' }}>
                <div style={{ width: `${(sentCount/31)*100}%`, height: '100%', background: P.sage }}/>
              </div>
            </Card>
            <Card style={{ padding: 12 }}>
              <div style={{ fontSize: 10, color: P.inkSoft, letterSpacing: 1, fontWeight: 600 }}>DELIVERY</div>
              <div style={{ fontFamily: P.mono, fontSize: 22, fontWeight: 600, marginTop: 4, color: P.sage }}>99.1%</div>
              <div style={{ fontSize: 10, color: P.inkSoft, marginTop: 6 }}>30-day rolling</div>
            </Card>
          </div>

          {/* Month bar */}
          <Card style={{ padding: 14, marginTop: 12, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 600 }}>May schedule</div>
              <button type="button" onClick={() => actions.nav('calendar')} style={{ fontSize: 11, color: P.sage, fontWeight: 600, background: 'transparent', border: 'none', cursor: 'pointer' }}>view all →</button>
            </div>
            <div style={{ display: 'flex', gap: 2, width: '100%' }}>
              {days.map(d => (
                <button key={d.d} type="button" onClick={() => actions.openMessage(d.d, 'preview')} title={`Day ${d.d}: ${d.title}`} style={{
                  flex: '1 1 0', minWidth: 0, height: 28, borderRadius: 2, border: 'none', cursor: 'pointer', padding: 0,
                  background: d.status === 'sent' ? P.sage : d.status === 'today' ? P.sun : P.lineSoft,
                }}/>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, fontSize: 10.5, color: P.inkSoft, marginTop: 8, flexWrap: 'wrap', fontFamily: P.mono }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Dot color={P.sage}/> sent {sentCount}</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Dot color={P.sun}/> today 1</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Dot color={P.inkFaint}/> upcoming {days.filter(d=>d.status==='upcoming').length}</span>
            </div>
          </Card>

          {/* Recent */}
          <div style={{ marginTop: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: P.inkSoft, letterSpacing: 1, fontFamily: P.mono }}>RECENT</div>
              <button type="button" onClick={() => actions.nav('history')} style={{ fontSize: 12, color: P.sage, fontWeight: 600, background: 'transparent', border: 'none', cursor: 'pointer' }}>all →</button>
            </div>
            {state.history.slice(0, 4).map((h, i) => (
              <Card key={i} onClick={() => actions.openMessage(h.day, 'preview')} style={{
                padding: 12, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
              }}>
                <div style={{ fontFamily: P.mono, fontSize: 13, color: P.inkSoft, width: 30 }}>{String(h.day).padStart(2,'0')}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{days[h.day-1].title}</div>
                  <div style={{ fontSize: 10.5, color: P.inkSoft, fontFamily: P.mono, marginTop: 2 }}>{h.sentAt.slice(-13)}</div>
                </div>
                <Tag bg={P.sageTint} color={P.sage}>{h.delivered}/{h.groups}</Tag>
              </Card>
            ))}
          </div>
        </div>
      );
    }

    // Desktop
    return (
      <React.Fragment>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 14 }}>
          <StatCard label="Next broadcast" value="14h 23m" sub="Sun · 24 May · 02:00 GMT" tone={P.sage}/>
          <StatCard label="Month progress" value={`${sentCount}/31`} sub={`${Math.round(sentCount/31*100)}% complete`} tone={P.ink}/>
          <StatCard label="Delivery rate" value="99.1%" sub="rolling 30 days" tone={P.sage}/>
          <StatCard label="Recipients" value={String(state.groups.filter(g=>g.active).reduce((s,g)=>s+g.members,0))} sub={`across ${state.groups.filter(g=>g.active).length} active groups`} tone={P.ink}/>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: 14, minWidth: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
            <Card style={{ padding: 16, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>May 2026 · schedule</div>
                  <div style={{ fontSize: 12, color: P.inkSoft, marginTop: 2 }}>Click any day to preview</div>
                </div>
                <div style={{ display: 'flex', gap: 10, fontSize: 11, color: P.inkSoft }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Dot color={P.sage}/> Sent</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Dot color={P.sun}/> Today</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Dot color={P.inkFaint}/> Upcoming</span>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(31, 1fr)', gap: 2 }}>
                {days.map(d => {
                  const color = d.status === 'sent' ? P.sage : d.status === 'today' ? P.sun : P.lineSoft;
                  return (
                    <button key={d.d} type="button" onClick={() => actions.openMessage(d.d, 'preview')} title={`Day ${d.d}: ${d.title}`} style={{
                      display: 'flex', flexDirection: 'column', gap: 4, border: 'none', background: 'transparent',
                      padding: 0, cursor: 'pointer', fontFamily: P.sans,
                    }}>
                      <div style={{
                        height: 56, background: color, borderRadius: 3,
                        display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: 4,
                        color: d.status === 'upcoming' ? P.inkFaint : '#FFF',
                        fontSize: 10, fontFamily: P.mono, fontWeight: 600,
                      }}>{d.d}</div>
                      <div style={{ fontSize: 9, color: P.inkFaint, textAlign: 'center', fontFamily: P.mono }}>{dowShort(d.d).slice(0,1)}</div>
                    </button>
                  );
                })}
              </div>
            </Card>

            <Card style={{ padding: 0, overflow: 'hidden', minWidth: 0 }}>
              <div style={{ padding: '12px 16px', borderBottom: `1px solid ${P.lineSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>Recent broadcasts</div>
                <button type="button" onClick={() => actions.nav('history')} style={{ fontSize: 12, color: P.sage, fontWeight: 600, background: 'transparent', border: 'none', cursor: 'pointer' }}>View all →</button>
              </div>
              <div style={{
                display: 'grid', gridTemplateColumns: '60px minmax(0,1fr) 130px 70px 90px', padding: '7px 16px',
                fontSize: 10, color: P.inkSoft, letterSpacing: 1, fontWeight: 600,
                borderBottom: `1px solid ${P.lineSoft}`, background: P.bgSoft,
              }}>
                <div>DAY</div><div>TITLE</div><div>SENT</div><div>MODE</div><div style={{ textAlign: 'right' }}>DELIVERY</div>
              </div>
              {state.history.slice(0, 6).map((h, i) => {
                const d = days[h.day - 1];
                return (
                  <div key={i} onClick={() => actions.openMessage(h.day, 'preview')} style={{
                    display: 'grid', gridTemplateColumns: '60px minmax(0,1fr) 130px 70px 90px', padding: '10px 16px',
                    alignItems: 'center', borderBottom: i < 5 ? `1px solid ${P.lineSoft}` : 'none', cursor: 'pointer',
                  }}>
                    <div style={{ fontFamily: P.mono, fontSize: 13 }}>{String(h.day).padStart(2, '0')}</div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.title}</div>
                      <div style={{ fontSize: 11, color: P.inkSoft, fontFamily: P.mono, marginTop: 2 }}>{d.ref}</div>
                    </div>
                    <div style={{ fontFamily: P.mono, fontSize: 11, color: P.inkSoft }}>{h.sentAt.slice(-13)}</div>
                    <div><Tag bg={h.mode === 'manual' ? P.sunTint : P.sageTint} color={h.mode === 'manual' ? P.sun : P.sage}>{h.mode}</Tag></div>
                    <div style={{ textAlign: 'right' }}>
                      <Tag bg={P.sageTint} color={P.sage}>{h.delivered}/{h.groups} ✓</Tag>
                    </div>
                  </div>
                );
              })}
            </Card>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
            <Card style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ background: P.ink, color: '#FFF', padding: '13px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 10.5, letterSpacing: 1, fontWeight: 600, color: '#9CB3A3' }}>
                  <Dot color={P.sageHi}/> NEXT BROADCAST
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
                  <div style={{ fontFamily: P.mono, fontSize: 28, fontWeight: 600, lineHeight: 1 }}>02:00</div>
                  <div style={{ fontSize: 11, color: '#9CB3A3' }}>GMT · in 14h 23m</div>
                </div>
                <div style={{ fontSize: 12, color: '#C8D4CD', marginTop: 6 }}>Day 24 · {days[23].title}</div>
              </div>
              <div style={{ padding: 12 }}>
                <div style={{ fontSize: 10.5, color: P.inkSoft, fontWeight: 600, letterSpacing: 1 }}>RECIPIENTS</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0,1fr))', gap: 5, marginTop: 7 }}>
                  {state.groups.filter(g => g.active).map(g => (
                    <div key={g.id} style={{ padding: '6px 4px', borderRadius: 6, background: P.bgSoft, border: `1px solid ${P.lineSoft}`, textAlign: 'center', minWidth: 0 }}>
                      <div style={{ fontSize: 9, color: P.inkFaint, letterSpacing: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {g.name.split('·')[1] ? g.name.split('·')[1].trim().split(' ')[0].slice(0,3).toUpperCase() : 'TT'}
                      </div>
                      <div style={{ fontFamily: P.mono, fontSize: 12, fontWeight: 600, marginTop: 1 }}>{g.members}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
                  <Btn onClick={() => actions.openMessage(24, 'preview')} style={{ flex: 1, justifyContent: 'center' }}><Icon name="eye" size={12}/> Preview</Btn>
                  <Btn variant="primary" onClick={() => actions.openMessage(24, 'edit')} style={{ flex: 1, justifyContent: 'center' }}>Edit Day 24</Btn>
                </div>
              </div>
            </Card>

            <Card style={{ padding: 14, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Today’s message</div>
                <Tag bg={P.sunTint} color={P.sun}>DAY 23</Tag>
              </div>
              <WhatsAppBubbleCompact msg={msg}/>
              <Btn onClick={() => actions.openMessage(23, 'preview')} style={{ width: '100%', justifyContent: 'center', marginTop: 10 }}>
                Open full preview <Icon name="arrowRight" size={12}/>
              </Btn>
            </Card>
          </div>
        </div>
      </React.Fragment>
    );
  }

  function StatCard({ label, value, sub, tone }) {
    return (
      <Card style={{ padding: 12, minWidth: 0 }}>
        <div style={{ fontSize: 10, color: P.inkSoft, letterSpacing: 1, fontWeight: 600 }}>{label.toUpperCase()}</div>
        <div style={{ fontFamily: P.mono, fontSize: 24, fontWeight: 600, color: tone || P.ink, marginTop: 5, lineHeight: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</div>
        <div style={{ fontSize: 11, color: P.inkSoft, marginTop: 5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub}</div>
      </Card>
    );
  }

  // === Calendar ===============================================================
  function CalendarScreen({ state, actions, viewport, calendarStyle = 'tiles' }) {
    const grid = calendarGrid();
    const { days, selectedDay } = state;
    const sel = days[selectedDay - 1];

    if (viewport === 'mobile') {
      return (
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 16px' }}>
          <Card style={{ overflow: 'hidden', padding: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: `1px solid ${P.lineSoft}` }}>
              {['S','M','T','W','T','F','S'].map((d, i) => (
                <div key={i} style={{ padding: '8px 0', fontSize: 10, color: P.inkSoft, letterSpacing: 1, fontWeight: 600, fontFamily: P.mono, textAlign: 'center' }}>{d}</div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
              {grid.map((d, i) => {
                if (d === null) return <div key={i} style={{ aspectRatio: '1/1', background: P.bgSoft, borderRight: i % 7 < 6 ? `1px solid ${P.lineSoft}` : 'none', borderBottom: `1px solid ${P.lineSoft}` }}/>;
                return <MobileCalCell key={i} day={d} data={days[d-1]} selected={selectedDay === d} i={i} onClick={() => actions.selectDay(d)} calendarStyle={calendarStyle}/>;
              })}
            </div>
          </Card>

          {/* Selected day card */}
          <Card style={{ padding: 14, marginTop: 14, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <Tag bg={sel.status === 'today' ? P.sunTint : sel.status === 'sent' ? P.sageTint : P.surfaceAlt} color={sel.status === 'today' ? P.sun : sel.status === 'sent' ? P.sage : P.inkSoft}>
                {sel.status === 'today' ? `TODAY · DAY ${sel.d}` : `DAY ${sel.d} · ${sel.status.toUpperCase()}`}
              </Tag>
              <span style={{ fontSize: 10.5, color: P.inkSoft, fontFamily: P.mono }}>{dowShort(sel.d).toUpperCase()} · 02:00 GMT</span>
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.25 }}>{sel.title}</div>
            <div style={{ fontSize: 11, color: P.inkSoft, fontFamily: P.mono, marginTop: 4 }}>{sel.ref}</div>
            <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
              <Btn onClick={() => actions.openMessage(sel.d, 'preview')} style={{ flex: 1, justifyContent: 'center' }}>Preview</Btn>
              {sel.status !== 'sent' && (
                <Btn variant="primary" onClick={() => actions.openManualSend(sel.d)} style={{ flex: 1, justifyContent: 'center' }}>
                  <Icon name="send" size={12} color="#FFF"/> Send
                </Btn>
              )}
            </div>
          </Card>
        </div>
      );
    }

    // Desktop
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 280px', gap: 14 }}>
        <Card style={{ padding: 14, minWidth: 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {['SUN','MON','TUE','WED','THU','FRI','SAT'].map(d => (
              <div key={d} style={{
                padding: '6px 10px 8px', fontSize: 10, color: P.inkSoft, letterSpacing: 1, fontWeight: 600,
                fontFamily: P.mono, borderBottom: `1px solid ${P.lineSoft}`,
              }}>{d}</div>
            ))}
            {grid.map((d, i) => {
              if (d === null) return <div key={i} style={{ minHeight: 76, background: P.bgSoft, borderRight: i % 7 < 6 ? `1px solid ${P.lineSoft}` : 'none', borderBottom: `1px solid ${P.lineSoft}` }}/>;
              return <DesktopCalCell key={i} day={d} data={days[d-1]} selected={selectedDay === d} i={i} onClick={() => actions.selectDay(d)} calendarStyle={calendarStyle}/>;
            })}
          </div>
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Card style={{ padding: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <Tag bg={sel.status === 'today' ? P.sunTint : sel.status === 'sent' ? P.sageTint : P.surfaceAlt} color={sel.status === 'today' ? P.sun : sel.status === 'sent' ? P.sage : P.inkSoft}>
                {sel.status === 'today' ? `TODAY · ${String(sel.d).padStart(2,'0')}/05` : `DAY ${sel.d}`}
              </Tag>
              <span style={{ fontFamily: P.mono, fontSize: 11, color: P.inkSoft }}>02:00 GMT</span>
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.25 }}>{sel.title}</div>
            <div style={{ fontFamily: P.mono, fontSize: 11, color: P.inkSoft, marginTop: 4 }}>{sel.ref}</div>
            <div style={{ fontSize: 12, color: P.inkSoft, marginTop: 8, lineHeight: 1.5, fontStyle: 'italic' }}>
              “{sel.verse}”
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
              <Btn onClick={() => actions.openMessage(sel.d, 'preview')} style={{ flex: 1, justifyContent: 'center' }}>Preview</Btn>
              {sel.status !== 'sent' && (
                <Btn variant="primary" onClick={() => actions.openManualSend(sel.d)} style={{ flex: 1, justifyContent: 'center' }}>Send now</Btn>
              )}
            </div>
          </Card>

          <Card style={{ padding: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: P.inkSoft, letterSpacing: 1, marginBottom: 10 }}>DISTRIBUTION</div>
            {[
              { label: 'Sent', n: days.filter(d=>d.status==='sent').length, color: P.sage },
              { label: 'Today', n: days.filter(d=>d.status==='today').length, color: P.sun },
              { label: 'Upcoming', n: days.filter(d=>d.status==='upcoming').length, color: P.inkFaint },
            ].map(row => (
              <div key={row.label} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 30px', alignItems: 'center', gap: 8, padding: '5px 0' }}>
                <div style={{ fontSize: 12 }}>{row.label}</div>
                <div style={{ height: 6, background: P.surfaceAlt, borderRadius: 3 }}>
                  <div style={{ width: `${(row.n / 31) * 100}%`, height: '100%', background: row.color, borderRadius: 3 }}/>
                </div>
                <div style={{ fontFamily: P.mono, fontSize: 11, color: P.inkSoft, textAlign: 'right' }}>{row.n}</div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    );
  }

  function DesktopCalCell({ day, data, selected, i, onClick, calendarStyle }) {
    const isToday = data.status === 'today';
    const isSent = data.status === 'sent';
    const isDots = calendarStyle === 'dots';

    const bg = selected ? P.surfaceAlt
      : isToday ? P.sunTint
      : (!isDots && isSent) ? P.sageTint
      : P.surface;

    return (
      <button type="button" onClick={onClick} style={{
        minHeight: 76, padding: 8, position: 'relative', cursor: 'pointer',
        borderRight: i % 7 < 6 ? `1px solid ${P.lineSoft}` : 'none',
        borderBottom: `1px solid ${P.lineSoft}`,
        background: bg, fontFamily: P.sans, textAlign: 'left',
        outline: selected ? `2px solid ${P.sage}` : 'none', outlineOffset: -2,
        border: 'none',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{
            fontFamily: P.mono, fontSize: 13, fontWeight: isToday ? 700 : 500,
            color: isToday ? P.sun : P.ink,
          }}>{String(day).padStart(2, '0')}</div>
          {isDots ? (
            <Dot color={isSent ? P.sage : isToday ? P.sun : P.inkFaint}/>
          ) : (
            isSent && (
              <span style={{ width: 16, height: 16, borderRadius: 5, background: '#FFF', color: P.sage, display: 'grid', placeItems: 'center', border: `1px solid ${P.sageTint}` }}>
                <Icon name="check" size={10} color={P.sage}/>
              </span>
            )
          )}
          {data.edited && <span style={{ fontSize: 9, fontFamily: P.mono, color: P.sun, padding: '1px 4px', borderRadius: 3, background: P.sunTint }}>edit</span>}
        </div>
        <div style={{
          fontSize: 11, color: isSent && !isDots ? P.sageDeep : P.inkSoft, marginTop: 6, lineHeight: 1.3,
          overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        }}>{data.title}</div>
      </button>
    );
  }

  function MobileCalCell({ day, data, selected, i, onClick, calendarStyle }) {
    const isToday = data.status === 'today';
    const isSent = data.status === 'sent';
    const isDots = calendarStyle === 'dots';

    if (isDots) {
      return (
        <button type="button" onClick={onClick} style={{
          aspectRatio: '1/1', padding: 4, position: 'relative', cursor: 'pointer',
          borderRight: i % 7 < 6 ? `1px solid ${P.lineSoft}` : 'none',
          borderBottom: `1px solid ${P.lineSoft}`, background: 'transparent', fontFamily: P.sans, border: 'none',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
        }}>
          <div style={{
            width: 26, height: 26, borderRadius: 99, display: 'grid', placeItems: 'center',
            background: selected ? P.sage : isToday ? P.sun : 'transparent',
            color: (selected || isToday) ? '#FFF' : P.ink,
            fontFamily: P.mono, fontSize: 12, fontWeight: (isToday || selected) ? 700 : 500,
          }}>{day}</div>
          <Dot color={isSent ? P.sage : isToday ? 'transparent' : 'transparent'} size={4}/>
        </button>
      );
    }

    return (
      <button type="button" onClick={onClick} style={{
        aspectRatio: '1/1', padding: 6, cursor: 'pointer',
        borderRight: i % 7 < 6 ? `1px solid ${P.lineSoft}` : 'none',
        borderBottom: `1px solid ${P.lineSoft}`,
        background: selected ? P.surfaceAlt : isToday ? P.sunTint : isSent ? P.sageTint : P.surface,
        outline: selected ? `2px solid ${P.sage}` : 'none', outlineOffset: -2,
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        fontFamily: P.sans, border: 'none',
      }}>
        <div style={{
          fontFamily: P.mono, fontSize: 12, fontWeight: isToday ? 700 : 500, textAlign: 'left',
          color: isToday ? P.sun : isSent ? P.sage : P.ink,
        }}>{String(day).padStart(2,'0')}</div>
        {isSent && <Icon name="check" size={10} color={P.sage}/>}
      </button>
    );
  }

  // === Upload =================================================================
  function UploadScreen({ state, actions, viewport }) {
    const fileInputRef = useRef(null);
    const { pdfFile, days } = state;

    const onFilePick = (e) => {
      const f = e.target.files && e.target.files[0];
      if (f) actions.uploadPdf(f.name, Math.round(f.size/1024/1024 * 10)/10);
      e.target.value = '';
    };

    if (viewport === 'mobile') {
      return (
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 16px' }}>
          {pdfFile ? (
            <React.Fragment>
              <Card style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 46, borderRadius: 5, background: P.rose, color: '#FFF', display: 'grid', placeItems: 'center', fontFamily: P.mono, fontSize: 10, fontWeight: 700 }}>PDF</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pdfFile.name}</div>
                  <div style={{ fontSize: 10.5, color: P.inkSoft, fontFamily: P.mono, marginTop: 3 }}>{pdfFile.size}MB · 64p · {pdfFile.uploadedAt}</div>
                </div>
                <Tag bg={P.sageTint} color={P.sage}>OK</Tag>
              </Card>

              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <Btn onClick={() => fileInputRef.current?.click()} style={{ flex: 1, justifyContent: 'center', borderStyle: 'dashed', color: P.sage }}>Replace PDF</Btn>
                <Btn onClick={() => actions.removePdf()} style={{ flex: 1, justifyContent: 'center' }}><Icon name="trash" size={12}/> Remove</Btn>
              </div>

              <div style={{ marginTop: 18, padding: 14, borderRadius: 11, background: P.surface, border: `1px solid ${P.line}` }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: P.inkSoft, letterSpacing: 1, fontFamily: P.mono }}>31 DAYS · MAY 2026</div>
                  <Tag bg={P.surfaceAlt} color={P.inkSoft}>ready</Tag>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
                  {days.map(d => (
                    <button key={d.d} type="button" onClick={() => actions.openMessage(d.d, 'preview')} style={{
                      padding: '6px 2px', borderRadius: 4, textAlign: 'center', fontFamily: P.mono, cursor: 'pointer',
                      border: `1px solid ${P.lineSoft}`, background: P.surface, color: P.ink,
                    }}>
                      <div style={{ fontSize: 10, fontWeight: 600 }}>{String(d.d).padStart(2,'0')}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 14, fontSize: 11, fontWeight: 600, color: P.inkSoft, letterSpacing: 1, fontFamily: P.mono, padding: '4px 6px 8px' }}>EXTRACTED DAYS</div>
              {days.slice(0, 6).map(d => (
                <Card key={d.d} onClick={() => actions.openMessage(d.d, 'preview')} style={{
                  padding: 12, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
                }}>
                  <div style={{ fontFamily: P.mono, fontSize: 12, color: P.inkSoft, width: 28 }}>{String(d.d).padStart(2,'0')}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.title}</div>
                    <div style={{ fontSize: 10.5, color: P.inkSoft, fontFamily: P.mono, marginTop: 2 }}>{d.ref}</div>
                  </div>
                  <Icon name="chevronRight" size={14} color={P.inkFaint}/>
                </Card>
              ))}
            </React.Fragment>
          ) : (
            <UploadDropzone onPick={() => fileInputRef.current?.click()} viewport="mobile"/>
          )}
          <input ref={fileInputRef} type="file" accept="application/pdf" onChange={onFilePick} style={{ display: 'none' }}/>
        </div>
      );
    }

    // Desktop
    return (
      <React.Fragment>
        {pdfFile ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.1fr) minmax(0,1fr)', gap: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
              <Card style={{ padding: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 38, height: 48, borderRadius: 5, background: P.rose, color: '#FFF', display: 'grid', placeItems: 'center', fontFamily: P.mono, fontSize: 10, fontWeight: 700 }}>PDF</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{pdfFile.name}</div>
                    <div style={{ fontSize: 11, color: P.inkSoft, fontFamily: P.mono, marginTop: 3 }}>{pdfFile.size}MB · 64p · uploaded {pdfFile.uploadedAt}</div>
                  </div>
                  <Btn onClick={() => fileInputRef.current?.click()} style={{ borderStyle: 'dashed', color: P.sage }}>Replace</Btn>
                  <Btn onClick={() => actions.removePdf()}><Icon name="trash" size={12}/> Remove</Btn>
                </div>
              </Card>

              <Card style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '11px 14px', borderBottom: `1px solid ${P.lineSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>31 days extracted</div>
                  <span style={{ fontSize: 11, color: P.inkSoft, fontFamily: P.mono }}>click to preview</span>
                </div>
                <div style={{ padding: 14 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
                    {days.map(d => (
                      <button key={d.d} type="button" onClick={() => actions.openMessage(d.d, 'preview')} title={d.title} style={{
                        padding: '8px 4px', borderRadius: 5, textAlign: 'center', fontFamily: P.mono,
                        border: `1px solid ${P.lineSoft}`, background: P.surface, color: P.ink, cursor: 'pointer',
                      }}>
                        <div style={{ fontSize: 11, fontWeight: 600 }}>{String(d.d).padStart(2,'0')}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </Card>

              <Card style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '11px 14px', borderBottom: `1px solid ${P.lineSoft}`, fontSize: 13, fontWeight: 600 }}>Day list</div>
                {days.slice(0, 6).map((d, i) => (
                  <div key={d.d} onClick={() => actions.openMessage(d.d, 'preview')} style={{
                    display: 'grid', gridTemplateColumns: '60px minmax(0,1fr) 80px', padding: '11px 14px', alignItems: 'center', gap: 10,
                    borderBottom: i < 5 ? `1px solid ${P.lineSoft}` : 'none', cursor: 'pointer',
                  }}>
                    <div style={{ fontFamily: P.mono, fontSize: 13 }}>{String(d.d).padStart(2,'0')}</div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.title}</div>
                      <div style={{ fontSize: 11, color: P.inkSoft, fontFamily: P.mono, marginTop: 2 }}>{d.ref}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <Tag bg={d.status === 'sent' ? P.sageTint : d.status === 'today' ? P.sunTint : P.surfaceAlt} color={d.status === 'sent' ? P.sage : d.status === 'today' ? P.sun : P.inkSoft}>{d.status}</Tag>
                    </div>
                  </div>
                ))}
                <div style={{ padding: '11px 14px', textAlign: 'center', fontSize: 12, color: P.sage, fontWeight: 600, cursor: 'pointer' }}>
                  View all 31 days →
                </div>
              </Card>
            </div>

            <Card style={{ padding: 0, overflow: 'hidden', alignSelf: 'flex-start', minWidth: 0 }}>
              <div style={{ padding: '11px 14px', borderBottom: `1px solid ${P.lineSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Preview · Day 23</div>
                <Tag bg={P.sunTint} color={P.sun}>TODAY</Tag>
              </div>
              <div style={{ padding: 18, fontSize: 13, lineHeight: 1.6, background: P.bgSoft }}>
                <div style={{ fontSize: 16, fontWeight: 600, padding: '0 4px', background: P.sunTint, borderRadius: 3, display: 'inline-block' }}>
                  {days[22].title}
                </div>
                <div style={{ marginTop: 6, fontSize: 12, color: P.inkSoft }}>
                  <span style={{ background: P.sageTint, color: P.sage, padding: '0 4px', borderRadius: 3, fontFamily: P.mono, fontSize: 11 }}>{days[22].ref}</span> — <em>“{days[22].verse}”</em>
                </div>
                {days[22].body.map((p, i) => (<p key={i} style={{ margin: '12px 0 0' }}>{p}</p>))}
                <div style={{ fontWeight: 700, marginTop: 14 }}>PRAYER POINTS</div>
                <ol style={{ paddingLeft: 18, margin: 0 }}>
                  {days[22].prayer.map((p, i) => <li key={i} style={{ marginTop: 4 }}>{p}</li>)}
                </ol>
              </div>
            </Card>
          </div>
        ) : (
          <UploadDropzone onPick={() => fileInputRef.current?.click()} viewport="desktop"/>
        )}
        <input ref={fileInputRef} type="file" accept="application/pdf" onChange={onFilePick} style={{ display: 'none' }}/>
      </React.Fragment>
    );
  }

  function UploadDropzone({ onPick, viewport }) {
    const pad = viewport === 'mobile' ? 40 : 80;
    return (
      <Card style={{
        padding: pad, textAlign: 'center', border: `2px dashed ${P.line}`, borderRadius: 12,
        background: P.bgSoft,
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 14, background: P.sage, color: '#FFF',
          display: 'grid', placeItems: 'center', margin: '0 auto 14px',
        }}>
          <Icon name="upload" size={26} color="#FFF"/>
        </div>
        <div style={{ fontSize: 18, fontWeight: 600 }}>Upload this month’s devotional PDF</div>
        <div style={{ fontSize: 13, color: P.inkSoft, marginTop: 8, maxWidth: 360, margin: '8px auto 0', lineHeight: 1.55 }}>
          One PDF per month. We’ll read through it and prepare 31 daily messages — you preview, edit, and we broadcast at 02:00 GMT.
        </div>
        <Btn variant="primary" onClick={onPick} style={{ marginTop: 22, padding: '11px 18px', fontSize: 13 }}>
          <Icon name="upload" size={13} color="#FFF"/> Choose PDF file
        </Btn>
        <div style={{ fontSize: 11, color: P.inkFaint, marginTop: 10, fontFamily: P.mono }}>
          .pdf · up to 25 MB
        </div>
      </Card>
    );
  }

  // === Messages (preview + edit) ==============================================
  function MessageScreen({ state, actions, viewport }) {
    const { selectedDay, messageMode, days } = state;
    const day = days[selectedDay - 1];
    const msg = formatMessage(day);
    const isEdit = messageMode === 'edit';

    if (viewport === 'mobile') {
      return (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {isEdit ? (
            <MobileEditor day={day} actions={actions}/>
          ) : (
            <React.Fragment>
              <div style={{ padding: '0 14px' }}>
                <WhatsAppBubble msg={msg} size="sm"/>
              </div>
              <div style={{ display: 'flex', gap: 8, padding: '14px 16px 0' }}>
                <Tag bg={P.surfaceAlt} color={P.inkSoft}>{msg.body.reduce((s,p) => s + p.length, 0)} chars</Tag>
                <Tag bg={day.edited ? P.sunTint : P.sageTint} color={day.edited ? P.sun : P.sage}>
                  {day.edited ? 'edited' : 'unchanged'}
                </Tag>
                <Tag bg={P.sageTint} color={P.sage}>auto-format ON</Tag>
              </div>
              <div style={{ display: 'flex', gap: 8, padding: '12px 16px' }}>
                <Btn onClick={() => actions.setMessageMode('edit')} style={{ flex: 1, justifyContent: 'center' }}>
                  <Icon name="pencil" size={13}/> Edit
                </Btn>
                {day.status !== 'sent' && (
                  <Btn variant="primary" onClick={() => actions.openManualSend(day.d)} style={{ flex: 1.4, justifyContent: 'center' }}>
                    <Icon name="send" size={13} color="#FFF"/> Send to {state.groups.filter(g=>g.active).length} groups
                  </Btn>
                )}
              </div>
              <div style={{ padding: '0 16px 32px', fontSize: 11, color: P.inkSoft, textAlign: 'center', fontFamily: P.mono }}>
                {day.status === 'sent' ? 'sent · ' + (state.history.find(h => h.day === day.d)?.sentAt || '') : `scheduled · auto-broadcast 02:00 GMT`}
              </div>
            </React.Fragment>
          )}
        </div>
      );
    }

    // Desktop
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 340px', gap: 14, minWidth: 0 }}>
        <Card style={{ padding: 18, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
            <Tag bg={day.status === 'today' ? P.sunTint : day.status === 'sent' ? P.sageTint : P.surfaceAlt}
                 color={day.status === 'today' ? P.sun : day.status === 'sent' ? P.sage : P.inkSoft}>
              DAY {day.d} · {day.status.toUpperCase()}
            </Tag>
            <Tag bg={P.surfaceAlt} color={P.inkSoft}>{dowShort(day.d).toUpperCase()} · {ordinal(day.d).toUpperCase()} MAY 2026</Tag>
            <Tag bg={P.surfaceAlt} color={P.inkSoft}>02:00 GMT</Tag>
            <div style={{ flex: 1 }}/>
            {!isEdit ? (
              <Btn variant="primary" onClick={() => actions.setMessageMode('edit')}><Icon name="pencil" size={12}/> Edit message</Btn>
            ) : (
              <React.Fragment>
                <Btn onClick={() => actions.cancelEdit()}>Cancel</Btn>
                <Btn variant="primary" onClick={() => actions.saveEdit()}>Save changes</Btn>
              </React.Fragment>
            )}
            {day.status !== 'sent' && !isEdit && (
              <Btn variant="primary" onClick={() => actions.openManualSend(day.d)} style={{ background: P.ink, borderColor: P.ink }}><Icon name="send" size={12} color="#FFF"/> Send now</Btn>
            )}
          </div>

          <DesktopEditOrPreview day={day} isEdit={isEdit} actions={actions}/>
        </Card>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: P.inkSoft, letterSpacing: 1 }}>WHATSAPP PREVIEW</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: P.sage }}>
              <span style={{ width: 6, height: 6, borderRadius: 99, background: P.sage, boxShadow: `0 0 0 3px ${P.sageTint}` }}/> live
            </div>
          </div>
          <WhatsAppBubble msg={msg} size="sm"/>
        </div>
      </div>
    );
  }

  function DesktopEditOrPreview({ day, isEdit, actions }) {
    if (!isEdit) {
      return (
        <div style={{ fontSize: 14, lineHeight: 1.7 }}>
          <div style={{ fontSize: 22, fontWeight: 600, lineHeight: 1.2 }}>{day.title}</div>
          <div style={{ fontFamily: P.mono, fontSize: 12, color: P.inkSoft, marginTop: 6 }}>{day.ref}</div>
          <div style={{ marginTop: 8, fontStyle: 'italic', color: P.inkSoft }}>“{day.verse}”</div>
          <div style={{ marginTop: 4, color: P.inkSoft, fontSize: 13 }}>~Pastor Elliot</div>
          {day.body.map((p, i) => <p key={i} style={{ margin: '14px 0 0' }}>{p}</p>)}
          <div style={{ fontWeight: 700, marginTop: 16 }}>PRAYER POINTS</div>
          <ol style={{ paddingLeft: 20, margin: 0 }}>
            {day.prayer.map((p, i) => <li key={i} style={{ marginTop: 4 }}>{p}</li>)}
          </ol>
          <div style={{ fontWeight: 700, fontStyle: 'italic', marginTop: 16 }}>WHAT’S YOUR RESOLVE?</div>
          <div style={{ fontStyle: 'italic', marginTop: 2 }}>{day.resolve}</div>
        </div>
      );
    }
    return (
      <React.Fragment>
        <EditField label="title" value={day.title} onChange={(v) => actions.updateDayField('title', v)}/>
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 10 }}>
          <EditField label="verse" value={day.verse} multiline onChange={(v) => actions.updateDayField('verse', v)}/>
          <EditField label="reference" value={day.ref} mono onChange={(v) => actions.updateDayField('ref', v)}/>
        </div>
        <div style={{ marginTop: 4 }}>
          <FieldLabel>devotional body</FieldLabel>
          <textarea
            value={day.body.join('\n\n')}
            onChange={(e) => actions.updateDayField('body', e.target.value.split(/\n\s*\n/))}
            style={{
              marginTop: 6, width: '100%', border: `1px solid ${P.line}`, borderRadius: 8, padding: 14,
              background: P.surface, fontSize: 13, lineHeight: 1.65, minHeight: 140, fontFamily: P.sans,
              boxSizing: 'border-box', resize: 'vertical', outline: 'none', color: P.ink,
            }}
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14 }}>
          <div>
            <FieldLabel>prayer points</FieldLabel>
            <div style={{ marginTop: 6, border: `1px solid ${P.line}`, borderRadius: 8, overflow: 'hidden' }}>
              {day.prayer.map((p, i) => (
                <div key={i} style={{
                  display: 'grid', gridTemplateColumns: '24px 1fr', gap: 8, padding: '8px 12px',
                  borderBottom: i < day.prayer.length - 1 ? `1px solid ${P.lineSoft}` : 'none', alignItems: 'center',
                }}>
                  <span style={{ fontFamily: P.mono, color: P.sage, fontWeight: 600, fontSize: 12 }}>0{i+1}</span>
                  <input
                    value={p}
                    onChange={(e) => {
                      const next = [...day.prayer]; next[i] = e.target.value;
                      actions.updateDayField('prayer', next);
                    }}
                    style={{ border: 'none', outline: 'none', fontSize: 13, padding: 0, background: 'transparent', fontFamily: P.sans, color: P.ink, width: '100%' }}
                  />
                </div>
              ))}
            </div>
          </div>
          <div>
            <EditField label="what’s your resolve?" value={day.resolve} multiline onChange={(v) => actions.updateDayField('resolve', v)}/>
            <div style={{
              marginTop: 10, padding: 12, borderRadius: 7, background: P.sageTint, border: `1px solid #C7E4D4`,
              display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 12, color: P.sageDeep,
            }}>
              <Icon name="flash" size={14} color={P.sage}/>
              <span style={{ lineHeight: 1.55 }}>The trumpet header, ministry banner, date line, and footer are added at send time.</span>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }

  function FieldLabel({ children }) {
    return <div style={{ fontSize: 11, color: P.inkSoft, fontWeight: 600, letterSpacing: 0.4, fontFamily: P.mono }}>{children}</div>;
  }

  function EditField({ label, value, multiline, mono, onChange }) {
    return (
      <div style={{ marginBottom: 10 }}>
        <FieldLabel>{label}</FieldLabel>
        {multiline ? (
          <textarea value={value} onChange={(e) => onChange(e.target.value)} style={{
            marginTop: 6, width: '100%', padding: '9px 12px', border: `1px solid ${P.line}`, borderRadius: 7,
            background: P.surface, fontSize: 13, lineHeight: 1.5, minHeight: 56, fontFamily: mono ? P.mono : P.sans,
            boxSizing: 'border-box', resize: 'vertical', outline: 'none', color: P.ink,
          }}/>
        ) : (
          <input value={value} onChange={(e) => onChange(e.target.value)} style={{
            marginTop: 6, width: '100%', padding: '9px 12px', border: `1px solid ${P.line}`, borderRadius: 7,
            background: P.surface, fontSize: 13, fontFamily: mono ? P.mono : P.sans,
            boxSizing: 'border-box', outline: 'none', color: P.ink,
          }}/>
        )}
      </div>
    );
  }

  function MobileEditor({ day, actions }) {
    return (
      <div style={{ padding: '0 16px 16px' }}>
        <EditField label="title" value={day.title} onChange={(v) => actions.updateDayField('title', v)}/>
        <EditField label="verse" value={day.verse} multiline onChange={(v) => actions.updateDayField('verse', v)}/>
        <EditField label="reference" value={day.ref} mono onChange={(v) => actions.updateDayField('ref', v)}/>
        <div>
          <FieldLabel>body</FieldLabel>
          <textarea
            value={day.body.join('\n\n')}
            onChange={(e) => actions.updateDayField('body', e.target.value.split(/\n\s*\n/))}
            style={{
              marginTop: 6, width: '100%', padding: '10px 12px', border: `1px solid ${P.line}`, borderRadius: 7,
              background: P.surface, fontSize: 13, lineHeight: 1.55, minHeight: 140, fontFamily: P.sans,
              boxSizing: 'border-box', resize: 'vertical', outline: 'none', color: P.ink,
            }}
          />
        </div>
        <FieldLabel>prayer points</FieldLabel>
        <div style={{ marginTop: 6, border: `1px solid ${P.line}`, borderRadius: 8, overflow: 'hidden', marginBottom: 10 }}>
          {day.prayer.map((p, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '24px 1fr', gap: 8, padding: '9px 12px', borderBottom: i < day.prayer.length - 1 ? `1px solid ${P.lineSoft}` : 'none', alignItems: 'center' }}>
              <span style={{ fontFamily: P.mono, color: P.sage, fontWeight: 600, fontSize: 12 }}>0{i+1}</span>
              <input
                value={p}
                onChange={(e) => { const next = [...day.prayer]; next[i] = e.target.value; actions.updateDayField('prayer', next); }}
                style={{ border: 'none', outline: 'none', fontSize: 13, padding: 0, background: 'transparent', fontFamily: P.sans, color: P.ink, width: '100%' }}
              />
            </div>
          ))}
        </div>
        <EditField label="what’s your resolve?" value={day.resolve} multiline onChange={(v) => actions.updateDayField('resolve', v)}/>
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <Btn onClick={() => actions.cancelEdit()} style={{ flex: 1, justifyContent: 'center' }}>Cancel</Btn>
          <Btn variant="primary" onClick={() => actions.saveEdit()} style={{ flex: 1.3, justifyContent: 'center' }}>Save changes</Btn>
        </div>
      </div>
    );
  }

  // === Groups =================================================================
  function GroupsScreen({ state, actions, viewport }) {
    const { groups } = state;
    const total = groups.filter(g => g.active).reduce((s, g) => s + g.members, 0);

    if (viewport === 'mobile') {
      return (
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 16px' }}>
          <Card style={{ padding: 12, marginBottom: 14 }}>
            <div style={{ fontSize: 10, color: P.inkSoft, fontFamily: P.mono, letterSpacing: 1, marginBottom: 8 }}>DISTRIBUTION</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <div style={{ fontFamily: P.mono, fontSize: 22, fontWeight: 600 }}>{total}</div>
              <div style={{ fontSize: 11, color: P.inkSoft }}>active recipients</div>
            </div>
            <div style={{ height: 8, borderRadius: 4, display: 'flex', overflow: 'hidden', background: P.surfaceAlt, marginTop: 8 }}>
              {groups.filter(g => g.active).map((g, i) => (
                <div key={g.id} style={{ flex: g.members, background: [P.sage, P.sageHi, P.sun, P.sky, P.rose][i % 5] }}/>
              ))}
            </div>
          </Card>

          {groups.map(g => (
            <Card key={g.id} style={{
              padding: 12, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 11,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 8,
                background: g.active ? P.sageTint : P.surfaceAlt, color: g.active ? P.sage : P.inkSoft,
                display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 12, fontFamily: P.mono,
              }}>{g.name.split('·')[1] ? g.name.split('·')[1].trim().slice(0,2).toUpperCase() : 'TT'}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{g.name}</div>
                <div style={{ fontSize: 10.5, color: P.inkSoft, fontFamily: P.mono, marginTop: 3 }}>
                  {g.members} · {g.active ? 'active' : 'paused'}
                </div>
              </div>
              <Switch on={g.active} onToggle={() => actions.toggleGroup(g.id)}/>
            </Card>
          ))}

          <Btn variant="primary" onClick={() => actions.openAddGroup()} style={{ width: '100%', justifyContent: 'center', marginTop: 8, padding: 12 }}>
            <Icon name="plus" size={14} color="#FFF"/> Add a group
          </Btn>
        </div>
      );
    }

    // Desktop
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 300px', gap: 14, minWidth: 0 }}>
        <Card style={{ padding: 0, overflow: 'hidden', minWidth: 0 }}>
          <div style={{
            display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 100px 100px 90px',
            padding: '10px 16px', fontSize: 10, color: P.inkSoft, letterSpacing: 1, fontWeight: 600,
            background: P.bgSoft, borderBottom: `1px solid ${P.line}`,
          }}>
            <div>GROUP</div><div>MEMBERS</div><div>NEXT</div><div style={{ textAlign: 'right' }}>STATUS</div>
          </div>
          {groups.map(g => (
            <div key={g.id} style={{
              display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 100px 100px 90px',
              padding: '13px 16px', alignItems: 'center', borderBottom: `1px solid ${P.lineSoft}`, minWidth: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 6,
                  background: g.active ? P.sageTint : P.surfaceAlt, color: g.active ? P.sage : P.inkSoft,
                  display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 11, fontFamily: P.mono, flexShrink: 0,
                }}>{g.name.split('·')[1] ? g.name.split('·')[1].trim().slice(0,2).toUpperCase() : 'TT'}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{g.name}</div>
                  <div style={{ fontSize: 11, color: P.inkSoft, fontFamily: P.mono, marginTop: 2 }}>
                    wa://group/{g.id}
                  </div>
                </div>
              </div>
              <div style={{ fontFamily: P.mono, fontSize: 13 }}>{g.members}</div>
              <div style={{ fontFamily: P.mono, fontSize: 11, color: P.inkSoft }}>{g.active ? '24/05 02:00' : '—'}</div>
              <div style={{ textAlign: 'right' }}>
                <Switch on={g.active} onToggle={() => actions.toggleGroup(g.id)}/>
              </div>
            </div>
          ))}
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Card style={{ padding: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: P.inkSoft, letterSpacing: 1, marginBottom: 6 }}>TOTAL DISTRIBUTION</div>
            <div style={{ fontFamily: P.mono, fontSize: 28, fontWeight: 600 }}>{total}</div>
            <div style={{ fontSize: 11, color: P.inkSoft, marginTop: 2 }}>recipients · {groups.filter(g => g.active).length} active</div>
            <div style={{ height: 8, borderRadius: 4, marginTop: 14, display: 'flex', overflow: 'hidden', background: P.surfaceAlt }}>
              {groups.filter(g => g.active).map((g, i) => (
                <div key={g.id} style={{ flex: g.members, background: [P.sage, P.sageHi, P.sun, P.sky, P.rose][i % 5] }}/>
              ))}
            </div>
          </Card>

          <Btn variant="primary" onClick={() => actions.openAddGroup()} style={{ justifyContent: 'center', padding: 11 }}>
            <Icon name="plus" size={13} color="#FFF"/> Add a group
          </Btn>
        </div>
      </div>
    );
  }

  function Switch({ on, onToggle }) {
    return (
      <button type="button" onClick={onToggle} style={{
        width: 36, height: 22, borderRadius: 99, border: 'none', cursor: 'pointer',
        background: on ? P.sage : P.line, position: 'relative', transition: 'background .15s',
      }}>
        <span style={{
          position: 'absolute', top: 2, left: on ? 16 : 2, width: 18, height: 18,
          borderRadius: 99, background: '#FFF', boxShadow: '0 1px 2px rgba(0,0,0,0.15)', transition: 'left .15s',
        }}/>
      </button>
    );
  }

  // === History ================================================================
  function HistoryScreen({ state, actions, viewport }) {
    const { history, days } = state;

    if (viewport === 'mobile') {
      return (
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 14 }}>
            <Card style={{ padding: 10 }}>
              <div style={{ fontSize: 9, color: P.inkSoft, fontFamily: P.mono, letterSpacing: 1 }}>DELIVERY</div>
              <div style={{ fontFamily: P.mono, fontSize: 17, fontWeight: 600, color: P.sage, marginTop: 4 }}>99.1%</div>
            </Card>
            <Card style={{ padding: 10 }}>
              <div style={{ fontSize: 9, color: P.inkSoft, fontFamily: P.mono, letterSpacing: 1 }}>MANUAL</div>
              <div style={{ fontFamily: P.mono, fontSize: 17, fontWeight: 600, marginTop: 4 }}>{history.filter(h => h.mode === 'manual').length}</div>
            </Card>
          </div>

          {history.map((h, i) => {
            const d = days[h.day - 1];
            return (
              <Card key={i} onClick={() => actions.openMessage(h.day, 'preview')} style={{
                padding: 12, marginBottom: 6, display: 'grid', gridTemplateColumns: '36px 1fr auto', gap: 10, alignItems: 'center', cursor: 'pointer',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: P.sageTint, color: P.sage,
                  display: 'grid', placeItems: 'center', fontFamily: P.mono, fontSize: 11, fontWeight: 700,
                }}>{String(h.day).padStart(2,'0')}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.title}</div>
                  <div style={{ fontSize: 10.5, color: P.inkSoft, fontFamily: P.mono, marginTop: 2 }}>{h.sentAt.slice(-13)} · {h.mode}</div>
                </div>
                <Tag bg={P.sageTint} color={P.sage}>{h.delivered}/{h.groups}</Tag>
              </Card>
            );
          })}
        </div>
      );
    }

    // Desktop
    return (
      <React.Fragment>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 14 }}>
          <StatCard label="Total sent" value={String(history.filter(h => h.mode === 'auto').length + history.filter(h => h.mode === 'manual').length)} sub="this month" tone={P.ink}/>
          <StatCard label="Delivery rate" value="99.1%" sub="excellent" tone={P.sage}/>
          <StatCard label="Manual sends" value={String(history.filter(h => h.mode === 'manual').length)} sub="this month" tone={P.sun}/>
        </div>

        <Card style={{ padding: 0, overflow: 'hidden', minWidth: 0 }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '60px minmax(0,1fr) 160px 90px 110px 50px',
            padding: '10px 16px', fontSize: 10, color: P.inkSoft, letterSpacing: 1, fontWeight: 600,
            background: P.bgSoft, borderBottom: `1px solid ${P.line}`,
          }}>
            <div>DAY</div><div>TITLE · REF</div><div>SENT</div><div>MODE</div><div>DELIVERY</div><div/>
          </div>
          {history.map((h, i) => {
            const d = days[h.day - 1];
            return (
              <div key={i} onClick={() => actions.openMessage(h.day, 'preview')} style={{
                display: 'grid', gridTemplateColumns: '60px minmax(0,1fr) 160px 90px 110px 50px',
                padding: '12px 16px', alignItems: 'center', borderBottom: `1px solid ${P.lineSoft}`, cursor: 'pointer', minWidth: 0,
              }}>
                <div style={{ fontFamily: P.mono, fontSize: 13 }}>{String(h.day).padStart(2,'0')}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.title}</div>
                  <div style={{ fontSize: 11, color: P.inkSoft, fontFamily: P.mono, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {d.ref}{h.note ? ` · ${h.note}` : ''}
                  </div>
                </div>
                <div style={{ fontFamily: P.mono, fontSize: 11, color: P.inkSoft }}>{h.sentAt}</div>
                <div><Tag bg={h.mode === 'manual' ? P.sunTint : P.sageTint} color={h.mode === 'manual' ? P.sun : P.sage}>{h.mode}</Tag></div>
                <div><Tag bg={P.sageTint} color={P.sage}>{h.delivered}/{h.groups} ✓</Tag></div>
                <div style={{ textAlign: 'right', color: P.inkFaint }}>
                  <Icon name="chevronRight" size={14}/>
                </div>
              </div>
            );
          })}
        </Card>
      </React.Fragment>
    );
  }

  // === Settings ===============================================================
  function SettingsScreen({ state, actions, viewport, dark }) {
    const Row = ({ label, sub, switchOn, value, onToggle, onClick, danger }) => (
      <Card onClick={onClick} style={{
        padding: '12px 14px', marginBottom: 6, display: 'flex', alignItems: 'center',
        cursor: onClick ? 'pointer' : 'default',
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: danger ? P.rose : P.ink }}>{label}</div>
          {sub && <div style={{ fontSize: 11, color: P.inkSoft, fontFamily: P.mono, marginTop: 2 }}>{sub}</div>}
        </div>
        {switchOn !== undefined ? (
          <Switch on={switchOn} onToggle={onToggle}/>
        ) : value !== undefined ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: P.inkSoft, fontFamily: P.mono }}>
            {value} <Icon name="chevronRight" size={13} color={P.inkFaint}/>
          </div>
        ) : null}
      </Card>
    );

    const pad = viewport === 'mobile' ? '0 16px 16px' : 0;
    return (
      <div style={{ padding: pad, maxWidth: 640 }}>
        {viewport === 'mobile' && (
          <React.Fragment>
            <div style={{ fontSize: 10, color: P.inkSoft, fontFamily: P.mono, letterSpacing: 1, padding: '4px 6px 6px' }}>RECORDS</div>
            <Card onClick={() => actions.nav('history')} style={{
              padding: '12px 14px', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
            }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: P.sageTint, color: P.sage, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <Icon name="history" size={15} color={P.sage}/>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>Send history</div>
                <div style={{ fontSize: 11, color: P.inkSoft, fontFamily: P.mono, marginTop: 2 }}>{state.history.length} broadcasts · 99.1% delivered</div>
              </div>
              <Icon name="chevronRight" size={14} color={P.inkFaint}/>
            </Card>
          </React.Fragment>
        )}

        <div style={{ fontSize: 10, color: P.inkSoft, fontFamily: P.mono, letterSpacing: 1, padding: '14px 6px 6px' }}>BROADCAST</div>
        <Row label="Send time" value="02:00 GMT" sub="every day"/>
        <Row label="Auto-format messages" sub="trumpet header, footer, date line" switchOn={state.settings.autoFormat} onToggle={() => actions.toggleSetting('autoFormat')}/>
        <Row label="Retry on failure" sub="up to 3 attempts" switchOn={state.settings.retry} onToggle={() => actions.toggleSetting('retry')}/>

        <div style={{ fontSize: 10, color: P.inkSoft, fontFamily: P.mono, letterSpacing: 1, padding: '14px 6px 6px' }}>APPEARANCE</div>
        <Row label="Calendar style" value={state.calendarStyle} onClick={() => actions.cycleCalendarStyle()}/>

        <div style={{ fontSize: 10, color: P.inkSoft, fontFamily: P.mono, letterSpacing: 1, padding: '14px 6px 6px' }}>ACCOUNT</div>
        <Row label="Pastor Elliot" sub="elliot@trumpetsoftheages.org" value="edit"/>
        <Row label="Coordinators" value="3"/>
        <Row label="Sign out" danger onClick={() => actions.signOut()}/>
      </div>
    );
  }

  // === Manual send modal ======================================================
  function ManualSendModal({ state, actions, viewport }) {
    const day = state.days[state.manualSendDay - 1];
    const activeGroups = state.groups.filter(g => g.active);
    const [sending, setSending] = useState(false);

    const onConfirm = () => {
      setSending(true);
      setTimeout(() => {
        actions.confirmManualSend();
        setSending(false);
      }, 700);
    };

    return (
      <ModalBackdrop onClose={() => actions.closeModal()} viewport={viewport}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: P.sageTint, color: P.sage, display: 'grid', placeItems: 'center' }}>
            <Icon name="send" size={20} color={P.sage}/>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 600 }}>Send Day {day.d} now?</div>
            <div style={{ fontSize: 11, color: P.inkSoft, fontFamily: P.mono, marginTop: 2 }}>broadcast to {activeGroups.length} active groups</div>
          </div>
          <button type="button" onClick={() => actions.closeModal()} style={{
            width: 28, height: 28, borderRadius: 7, border: `1px solid ${P.line}`, background: P.surface,
            cursor: 'pointer', display: 'grid', placeItems: 'center',
          }}><Icon name="x" size={14}/></button>
        </div>

        <div style={{ padding: 12, borderRadius: 8, background: P.bgSoft, border: `1px solid ${P.lineSoft}`, marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: P.inkSoft, fontFamily: P.mono, letterSpacing: 1, marginBottom: 6 }}>MESSAGE</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{day.title}</div>
          <div style={{ fontSize: 11, color: P.inkSoft, fontFamily: P.mono, marginTop: 3 }}>{day.ref}</div>
        </div>

        <div style={{ borderRadius: 8, background: P.bgSoft, border: `1px solid ${P.lineSoft}`, overflow: 'hidden', marginBottom: 12 }}>
          <div style={{ padding: '8px 12px', fontSize: 11, color: P.inkSoft, fontFamily: P.mono, letterSpacing: 1, fontWeight: 600, borderBottom: `1px solid ${P.lineSoft}`, background: P.surface }}>
            RECIPIENTS · {activeGroups.reduce((s, g) => s + g.members, 0)} people
          </div>
          {activeGroups.map((g, i) => (
            <div key={g.id} style={{
              display: 'grid', gridTemplateColumns: '1fr 50px 24px', alignItems: 'center', gap: 8,
              padding: '9px 12px', borderBottom: i < activeGroups.length - 1 ? `1px solid ${P.lineSoft}` : 'none',
            }}>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 600 }}>{g.name}</div>
                <div style={{ fontSize: 10, color: P.inkSoft, fontFamily: P.mono, marginTop: 2 }}>{g.members} recipients</div>
              </div>
              <Tag bg={P.surface} color={P.inkSoft}>{g.members}</Tag>
              <div style={{ width: 18, height: 18, borderRadius: 4, background: P.sage, display: 'grid', placeItems: 'center' }}>
                <Icon name="check" size={12} color="#FFF"/>
              </div>
            </div>
          ))}
        </div>

        <div style={{
          padding: 10, borderRadius: 8, background: P.sunTint, border: `1px solid rgba(216,139,38,0.3)`,
          display: 'flex', gap: 8, fontSize: 11, color: P.inkSoft, marginBottom: 14, alignItems: 'flex-start',
        }}>
          <span>⚠</span>
          <span>{day.status === 'today' ? 'Tonight\u2019s scheduled auto-broadcast will be skipped to avoid duplicates.' : 'Scheduled auto-broadcast for this day will be skipped to avoid duplicates.'}</span>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <Btn onClick={() => actions.closeModal()} style={{ flex: 1, justifyContent: 'center', padding: 11 }}>Cancel</Btn>
          <Btn variant="primary" onClick={onConfirm} disabled={sending} style={{ flex: 1.4, justifyContent: 'center', padding: 11, opacity: sending ? 0.7 : 1 }}>
            {sending ? 'Sending…' : (<><Icon name="send" size={13} color="#FFF"/> Confirm send</>)}
          </Btn>
        </div>
      </ModalBackdrop>
    );
  }

  // === Add group modal ========================================================
  function AddGroupModal({ actions, viewport }) {
    const [name, setName] = useState('');
    const [mode, setMode] = useState('link'); // 'link' | 'id'
    const [link, setLink] = useState('');
    const [groupId, setGroupId] = useState('');
    const [adding, setAdding] = useState(false);

    const credential = mode === 'link' ? link : groupId;
    const canAdd = name.trim().length > 0 && credential.trim().length > 0;
    const onAdd = () => {
      if (!canAdd) return;
      setAdding(true);
      setTimeout(() => { actions.confirmAddGroup(name.trim(), credential.trim(), mode); setAdding(false); }, 500);
    };

    return (
      <ModalBackdrop onClose={() => actions.closeModal()} viewport={viewport}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: P.sageTint, color: P.sage, display: 'grid', placeItems: 'center' }}>
            <Icon name="groups" size={20} color={P.sage}/>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 600 }}>Add a WhatsApp group</div>
          </div>
          <button type="button" onClick={() => actions.closeModal()} style={{
            width: 28, height: 28, borderRadius: 7, border: `1px solid ${P.line}`, background: P.surface,
            cursor: 'pointer', display: 'grid', placeItems: 'center',
          }}><Icon name="x" size={14}/></button>
        </div>

        <div style={{ marginBottom: 12 }}>
          <FieldLabel>display name</FieldLabel>
          <input autoFocus placeholder="e.g. TOTA · Ibadan Cell" value={name} onChange={(e) => setName(e.target.value)} style={{
            marginTop: 6, width: '100%', padding: '10px 12px', border: `1px solid ${P.line}`, borderRadius: 7,
            background: P.surface, fontSize: 13, fontFamily: P.sans, boxSizing: 'border-box', outline: 'none', color: P.ink,
          }}/>
        </div>

        {/* Link mode toggle */}
        <FieldLabel>link by</FieldLabel>
        <div style={{
          marginTop: 6, padding: 3, borderRadius: 8, background: P.surfaceAlt, display: 'grid',
          gridTemplateColumns: '1fr 1fr', gap: 3, marginBottom: 10,
        }}>
          {[
            { id: 'link', label: 'Invite link' },
            { id: 'id',   label: 'Group ID' },
          ].map(opt => {
            const on = mode === opt.id;
            return (
              <button key={opt.id} type="button" onClick={() => setMode(opt.id)} style={{
                padding: '7px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
                background: on ? P.surface : 'transparent',
                color: on ? P.ink : P.inkSoft,
                fontWeight: on ? 600 : 500, fontSize: 12.5, fontFamily: P.sans,
                boxShadow: on ? '0 1px 2px rgba(14,20,16,0.08)' : 'none',
              }}>{opt.label}</button>
            );
          })}
        </div>

        {mode === 'link' ? (
          <div style={{ marginBottom: 14 }}>
            <input placeholder="https://chat.whatsapp.com/…" value={link} onChange={(e) => setLink(e.target.value)} style={{
              width: '100%', padding: '10px 12px', border: `1px solid ${P.line}`, borderRadius: 7,
              background: P.surface, fontSize: 13, fontFamily: P.mono, boxSizing: 'border-box', outline: 'none', color: P.ink,
            }}/>
            <div style={{ fontSize: 10.5, color: P.inkFaint, marginTop: 6, fontFamily: P.mono }}>
              tap the group → invite via link → copy link
            </div>
          </div>
        ) : (
          <div style={{ marginBottom: 14 }}>
            <input placeholder="1234567890@g.us" value={groupId} onChange={(e) => setGroupId(e.target.value)} style={{
              width: '100%', padding: '10px 12px', border: `1px solid ${P.line}`, borderRadius: 7,
              background: P.surface, fontSize: 13, fontFamily: P.mono, boxSizing: 'border-box', outline: 'none', color: P.ink,
            }}/>
            <div style={{ fontSize: 10.5, color: P.inkFaint, marginTop: 6, fontFamily: P.mono }}>
              the WhatsApp Business API group ID (ends with @g.us)
            </div>
          </div>
        )}

        <div style={{
          padding: 10, borderRadius: 8, background: P.sageTint, border: `1px solid #C7E4D4`,
          display: 'flex', gap: 8, fontSize: 11, color: P.sageDeep, marginBottom: 14, alignItems: 'flex-start', lineHeight: 1.55,
        }}>
          <Icon name="flash" size={14} color={P.sage}/>
          <span>{mode === 'link'
            ? 'The bot will request to join. An admin in that group must approve.'
            : 'The bot must already be a member of the group with this ID.'}</span>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <Btn onClick={() => actions.closeModal()} style={{ flex: 1, justifyContent: 'center', padding: 11 }}>Cancel</Btn>
          <Btn variant="primary" onClick={onAdd} disabled={!canAdd || adding} style={{ flex: 1.4, justifyContent: 'center', padding: 11, opacity: (!canAdd || adding) ? 0.5 : 1 }}>
            {adding ? 'Adding…' : 'Add group'}
          </Btn>
        </div>
      </ModalBackdrop>
    );
  }

  // === Top-level app ==========================================================
  function PulseApp({ viewport = 'desktop', calendarStyle = 'tiles' }) {
    const [state, setState] = useState(() => ({
      signedIn: false,
      screen: 'dashboard',
      selectedDay: TODAY,
      messageMode: 'preview',
      modal: null,
      manualSendDay: null,
      pdfFile: { name: 'TOTA_Devotional_May2026.pdf', size: 2.4, uploadedAt: '29 Apr 09:12' },
      days: SEED_DAYS.map(d => ({ ...d, prayer: [...d.prayer], body: [...d.body] })),
      groups: SEED_GROUPS.map(g => ({ ...g })),
      history: SEED_HISTORY.map(h => ({ ...h })),
      pendingEdit: null,
      toast: null,
      settings: { autoFormat: true, retry: true },
      calendarStyle: calendarStyle,
    }));

    // Stay in sync with external tweak
    useEffect(() => {
      setState(s => s.calendarStyle === calendarStyle ? s : { ...s, calendarStyle });
    }, [calendarStyle]);

    const setToast = (msg) => {
      setState(s => ({ ...s, toast: msg }));
      setTimeout(() => setState(s => s.toast === msg ? { ...s, toast: null } : s), 2400);
    };

    const actions = useMemo(() => ({
      signIn: () => setState(s => ({ ...s, signedIn: true, screen: 'dashboard' })),
      signOut: () => setState(s => ({ ...s, signedIn: false, modal: null })),
      nav: (id) => setState(s => ({ ...s, screen: id, modal: null, messageMode: 'preview' })),
      selectDay: (d) => setState(s => ({ ...s, selectedDay: d })),
      openMessage: (d, mode = 'preview') => setState(s => ({ ...s, screen: 'messages', selectedDay: d, messageMode: mode, modal: null })),
      setMessageMode: (mode) => setState(s => ({
        ...s, messageMode: mode,
        pendingEdit: mode === 'edit' ? { ...s.days[s.selectedDay - 1], prayer: [...s.days[s.selectedDay - 1].prayer], body: [...s.days[s.selectedDay - 1].body] } : null,
      })),
      cancelEdit: () => setState(s => {
        if (!s.pendingEdit) return { ...s, messageMode: 'preview' };
        const days = s.days.map((d, i) => i === s.selectedDay - 1 ? s.pendingEdit : d);
        return { ...s, days, messageMode: 'preview', pendingEdit: null };
      }),
      saveEdit: () => {
        setState(s => {
          const days = s.days.map((d, i) => i === s.selectedDay - 1 ? { ...d, edited: true } : d);
          return { ...s, days, messageMode: 'preview', pendingEdit: null };
        });
        setToast('Message saved');
      },
      updateDayField: (field, value) => setState(s => {
        const days = s.days.map((d, i) => i === s.selectedDay - 1 ? { ...d, [field]: value } : d);
        return { ...s, days };
      }),
      openManualSend: (d) => setState(s => ({ ...s, modal: 'manualSend', manualSendDay: d })),
      closeModal: () => setState(s => ({ ...s, modal: null, manualSendDay: null })),
      confirmManualSend: () => {
        setState(s => {
          const day = s.days[s.manualSendDay - 1];
          const groupsActive = s.groups.filter(g => g.active);
          const now = new Date();
          const sentAt = `${day && dowShort(day.d)} ${day.d} May, 09:${String(Math.floor(Math.random()*40+10)).padStart(2,'0')}`;
          const history = [
            { day: s.manualSendDay, sentAt, groups: groupsActive.length, delivered: groupsActive.length, mode: 'manual', note: day.edited ? 'Sent after edit' : undefined },
            ...s.history,
          ];
          const days = s.days.map(d => d.d === s.manualSendDay && d.status !== 'sent' ? { ...d, status: 'sent' } : d);
          return { ...s, history, days, modal: null, manualSendDay: null };
        });
        setToast('Broadcast sent to active groups');
      },
      toggleGroup: (id) => setState(s => ({
        ...s, groups: s.groups.map(g => g.id === id ? { ...g, active: !g.active } : g),
      })),
      openAddGroup: () => setState(s => ({ ...s, modal: 'addGroup' })),
      confirmAddGroup: (name, credential, mode = 'link') => {
        setState(s => ({
          ...s, modal: null,
          groups: [...s.groups, {
            id: 'g' + (s.groups.length + 1),
            name, members: 0, active: true,
            link: mode === 'link' ? credential : undefined,
            groupId: mode === 'id' ? credential : undefined,
          }],
        }));
        setToast(mode === 'link' ? 'Group added · waiting for admin approval' : 'Group added · will start broadcasting tonight');
      },
      toggleSetting: (key) => setState(s => ({ ...s, settings: { ...s.settings, [key]: !s.settings[key] } })),
      cycleCalendarStyle: () => setState(s => ({ ...s, calendarStyle: s.calendarStyle === 'tiles' ? 'dots' : 'tiles' })),
      uploadPdf: (name, size) => {
        setState(s => ({ ...s, pdfFile: { name, size: size || 2.4, uploadedAt: 'just now' } }));
        setToast('PDF uploaded · 31 days ready');
      },
      removePdf: () => setState(s => ({ ...s, pdfFile: null })),
    }), []);

    // Not signed in
    if (!state.signedIn) {
      return (
        <React.Fragment>
          <AuthScreen onSignIn={actions.signIn} viewport={viewport}/>
          <ToastHost toast={state.toast}/>
        </React.Fragment>
      );
    }

    // Build screen
    const screenProps = { state, actions, viewport, calendarStyle: state.calendarStyle };
    const screenMap = {
      dashboard: <DashboardScreen {...screenProps}/>,
      calendar:  <CalendarScreen {...screenProps}/>,
      upload:    <UploadScreen {...screenProps}/>,
      messages:  <MessageScreen {...screenProps}/>,
      groups:    <GroupsScreen {...screenProps}/>,
      history:   <HistoryScreen {...screenProps}/>,
      settings:  <SettingsScreen {...screenProps}/>,
    };

    const titleMap = {
      dashboard: ['Broadcast', 'Dashboard'],
      calendar: ['Broadcast', 'Calendar', 'May 2026'],
      upload: ['Broadcast', 'Source PDF'],
      messages: ['Broadcast', 'Messages', `Day ${state.selectedDay} · ${state.days[state.selectedDay-1].title}`],
      groups: ['Broadcast', 'Groups'],
      history: ['Broadcast', 'History'],
      settings: ['Broadcast', 'Settings'],
    };

    const rightTopbarMap = {
      dashboard: (
        <React.Fragment>
          <Tag bg={P.sageTint} color={P.sage}><Dot color={P.sage}/> ALL OK</Tag>
          <Btn variant="primary" onClick={() => actions.openManualSend(TODAY)}><Icon name="send" size={12} color="#FFF"/> Send today</Btn>
        </React.Fragment>
      ),
      calendar: null,
      upload: state.pdfFile && <Tag bg={P.sageTint} color={P.sage}>31 / 31 DAYS</Tag>,
      messages: null,
      groups: <Btn variant="primary" onClick={() => actions.openAddGroup()}><Icon name="plus" size={12} color="#FFF"/> Add group</Btn>,
      history: <Btn onClick={() => setToast('Export coming soon')}>Export</Btn>,
      settings: null,
    };

    if (viewport === 'desktop') {
      return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <DesktopShell
            active={state.screen}
            onNav={actions.nav}
            onSignOut={actions.signOut}
            breadcrumbs={titleMap[state.screen]}
            rightTopbar={rightTopbarMap[state.screen]}
          >
            {screenMap[state.screen]}
          </DesktopShell>
          {state.modal === 'manualSend' && <ManualSendModal state={state} actions={actions} viewport={viewport}/>}
          {state.modal === 'addGroup' && <AddGroupModal actions={actions} viewport={viewport}/>}
          <ToastHost toast={state.toast}/>
        </div>
      );
    }

    // Mobile
    const headerMap = {
      dashboard: <MobileTopBar sub="SAT · 23/05/2026" title="Broadcast" leftAction={<HeaderIcon name="dashboard"/>}/>,
      calendar: <MobileTopBar sub={MONTH_LABEL.toUpperCase()} title="Schedule" leftAction={<HeaderIcon name="calendar"/>}/>,
      upload: <MobileTopBar sub="SOURCE PDF" title="May 2026" leftAction={<HeaderIcon name="upload"/>}/>,
      messages: <MobileTopBar sub={`DAY ${state.selectedDay} · ${state.days[state.selectedDay-1].status.toUpperCase()}`}
                  title={state.days[state.selectedDay-1].title}
                  leftAction={<IconBtn icon="chevronLeft" onClick={() => actions.nav('dashboard')}/>}
                  center/>,
      groups: <MobileTopBar sub={`${state.groups.filter(g=>g.active).length} ACTIVE · WHATSAPP`} title="Groups"
                leftAction={<HeaderIcon name="groups"/>}
                rightAction={
                  <button type="button" onClick={() => actions.openAddGroup()} style={{
                    width: 34, height: 34, borderRadius: 8, background: P.sage, color: '#FFF',
                    border: `1px solid ${P.sageDeep}`, display: 'grid', placeItems: 'center', cursor: 'pointer',
                  }}><Icon name="plus" size={15} color="#FFF"/></button>
                }/>,
      history: <MobileTopBar sub={`${state.history.length} BROADCASTS · MAY`} title="History"
                  leftAction={<IconBtn icon="chevronLeft" onClick={() => actions.nav('settings')}/>}/>,
      settings: <MobileTopBar sub="ACCOUNT · ELLIOT" title="Settings" leftAction={<HeaderIcon name="settings"/>}/>,
    };

    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <MobileShell
          active={state.screen === 'messages' || state.screen === 'upload' || state.screen === 'history' ? state.screen : state.screen}
          onNav={actions.nav}
          header={headerMap[state.screen]}
        >
          {screenMap[state.screen]}
        </MobileShell>
        {state.modal === 'manualSend' && <ManualSendModal state={state} actions={actions} viewport={viewport}/>}
        {state.modal === 'addGroup' && <AddGroupModal actions={actions} viewport={viewport}/>}
        <ToastHost toast={state.toast}/>
      </div>
    );
  }

  window.PulseApp = PulseApp;
})();
