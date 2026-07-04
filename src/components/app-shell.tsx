import { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { P } from '@/lib/tokens'
import { Icon } from '@/lib/icons'
import { Toast } from '@/components/ui/toast'
import { useAppStore } from '@/store/app-store'
import type { WaStatus } from '@/store/app-store'
import { fetchWaStatus } from '@/lib/wa-status'
import { checkForUpdate, installUpdate } from '@/lib/update'

const DESKTOP_NAV = [
  { path: '/',          label: 'Dashboard', icon: 'dashboard' as const, kbd: 'D' },
  { path: '/calendar',  label: 'Calendar',  icon: 'calendar' as const,  kbd: 'C' },
  { path: '/upload',    label: 'Source PDF',icon: 'upload' as const,    kbd: 'U' },
  { path: '/messages',  label: 'Messages',  icon: 'message' as const,   kbd: 'M' },
  { path: '/groups',    label: 'Groups',    icon: 'groups' as const,    kbd: 'G' },
  { path: '/history',   label: 'History',   icon: 'history' as const,   kbd: 'H' },
  { path: '/templates', label: 'Templates', icon: 'file' as const,      kbd: 'T' },
  { path: '/settings',  label: 'Settings',  icon: 'settings' as const,  kbd: 'S' },
]

const MOBILE_NAV = [
  { path: '/',         icon: 'dashboard' as const, label: 'Home',   matches: ['/'] },
  { path: '/calendar', icon: 'calendar' as const,  label: 'Days',   matches: ['/calendar'] },
  { path: '/upload',   icon: 'upload' as const,    label: 'Source', matches: ['/upload'] },
  { path: '/groups',   icon: 'groups' as const,    label: 'Groups', matches: ['/groups'] },
  { path: '/more',     icon: 'more' as const,       label: 'More',   matches: ['/more', '/messages', '/history', '/templates', '/settings'] },
]

const PAGE_TITLES: { match: (p: string) => boolean; title: string }[] = [
  { match: (p) => p === '/', title: 'Dashboard' },
  { match: (p) => p.startsWith('/calendar'), title: 'Calendar' },
  { match: (p) => p.startsWith('/upload'), title: 'Source PDF' },
  { match: (p) => p.startsWith('/messages'), title: 'Messages' },
  { match: (p) => p.startsWith('/groups'), title: 'Groups' },
  { match: (p) => p.startsWith('/history'), title: 'History' },
  { match: (p) => p.startsWith('/templates'), title: 'Templates' },
  { match: (p) => p.startsWith('/settings'), title: 'Settings' },
  { match: (p) => p.startsWith('/more'), title: 'More' },
]

function pageTitle(pathname: string): string {
  return PAGE_TITLES.find((e) => e.match(pathname))?.title ?? 'TOTA Broadcast'
}

// Pages reachable only via the "More" tab — mobile header shows a back
// button on these that returns to /more. `/templates/new` and
// `/templates/:id` are excluded — they already have their own back button
// that returns to the templates list, not to /more.
const MORE_SUBPAGES = ['/messages', '/history', '/settings']
function isMoreSubpage(pathname: string): boolean {
  if (pathname === '/templates') return true
  return MORE_SUBPAGES.some((p) => pathname.startsWith(p))
}

export function AppShell() {
  const toast = useAppStore((s) => s.toast)
  const setToast = useAppStore((s) => s.setToast)
  const setWaStatus = useAppStore((s) => s.setWaStatus)
  const setWaQr = useAppStore((s) => s.setWaQr)
  const updateAvailable = useAppStore((s) => s.updateAvailable)
  const setUpdateAvailable = useAppStore((s) => s.setUpdateAvailable)
  const [installingUpdate, setInstallingUpdate] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const active = location.pathname

  const isActive = (path: string) => {
    if (path === '/') return active === '/'
    return active.startsWith(path)
  }

  const waStatusRef = useRef<WaStatus>('loading')
  const waQrRef = useRef<string | null>(null)

  // Polled here (not per-page) so the connection status stays current no
  // matter which page is open — Dashboard and Settings both just read
  // `waStatus`/`waQr` from the store instead of each running their own poll.
  useEffect(() => {
    const poll = async () => {
      const { status, qr } = await fetchWaStatus()
      if (status !== waStatusRef.current) { waStatusRef.current = status; setWaStatus(status) }
      const oldQrExisted = waQrRef.current !== null
      const newQrExists = qr !== null
      waQrRef.current = qr
      if (oldQrExisted !== newQrExists) setWaQr(qr)
    }
    void poll()
    const id = setInterval(() => void poll(), 5000)
    return () => clearInterval(id)
  }, [setWaStatus, setWaQr])

  // One-time check on launch. Silently no-ops outside a real Tauri build
  // (e.g. plain `pnpm dev:client` in a browser) since the updater plugin
  // isn't available there.
  useEffect(() => {
    checkForUpdate()
      .then((update) => { if (update) setUpdateAvailable(update) })
      .catch(() => undefined)
  }, [setUpdateAvailable])

  const handleInstallUpdate = async () => {
    if (!updateAvailable) return
    setInstallingUpdate(true)
    try {
      await installUpdate(updateAvailable)
    } catch (err) {
      setInstallingUpdate(false)
      setToast('Update failed: ' + String(err))
    }
  }

  return (
    <>
      {/* Desktop layout */}
      <div
        className="hidden md:grid"
        style={{
          width: '100vw', height: '100vh',
          gridTemplateColumns: '224px 1fr',
          background: P.bg, fontFamily: P.sans, color: P.ink,
          fontSize: 13, letterSpacing: -0.01,
        }}
      >
        {/* Sidebar */}
        <aside style={{ borderRight: `1px solid ${P.line}`, background: P.bgSoft, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
          {/* Brand */}
          <div style={{ padding: '16px 14px 14px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <img src="/totateens_icon_rounded.png" alt="TOTATeens" style={{ width: 28, height: 28, borderRadius: 9, objectFit: 'cover', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 13, lineHeight: 1 }}>TOTA Broadcast</div>
              <div style={{ fontSize: 11, color: P.inkSoft, marginTop: 3 }}>Trumpets · v1.0</div>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ padding: '4px 8px', flex: 1, overflow: 'auto' }}>
            <div style={{ fontSize: 10, color: P.inkFaint, letterSpacing: 1.4, padding: '4px 8px 6px', fontWeight: 600 }}>WORKSPACE</div>
            {DESKTOP_NAV.map((n) => {
              const on = isActive(n.path)
              return (
                <button
                  key={n.path}
                  type="button"
                  onClick={() => navigate(n.path)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 9, padding: '6px 8px', borderRadius: 6, marginBottom: 1,
                    background: on ? P.surface : 'transparent',
                    border: on ? `1px solid ${P.line}` : '1px solid transparent',
                    boxShadow: on ? '0 1px 2px rgba(14,20,16,0.05)' : 'none',
                    color: on ? P.ink : P.inkSoft, fontWeight: on ? 600 : 500, fontSize: 13,
                    width: '100%', cursor: 'pointer', fontFamily: P.sans, textAlign: 'left',
                  }}
                >
                  <Icon name={n.icon} size={15} color={on ? P.sage : P.inkSoft} />
                  <span style={{ flex: 1 }}>{n.label}</span>
                  <span style={{ fontFamily: P.mono, fontSize: 10, color: P.inkFaint, padding: '1px 5px', borderRadius: 4, background: on ? P.surfaceAlt : 'transparent', opacity: on ? 1 : 0 }}>{n.kbd}</span>
                </button>
              )
            })}

          </nav>
        </aside>

        {/* Main */}
        <main style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          <div style={{ flex: 1, overflow: 'auto', padding: 20, background: P.bg, minWidth: 0 }}>
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile layout */}
      <div
        className="flex md:hidden"
        style={{ width: '100vw', height: '100vh', flexDirection: 'column', background: P.bg, color: P.ink, fontFamily: P.sans, overflow: 'hidden', fontSize: 13 }}
      >
        {/* Status bar */}
        <div style={{ height: 44, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 22px', fontSize: 14, fontWeight: 600, color: P.ink, flexShrink: 0 }}>
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>9:41</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <svg width="16" height="11" viewBox="0 0 16 11">
              <path d="M1 6.5C3.5 4 6 2.5 8 2.5s4.5 1.5 7 4" stroke={P.ink} strokeWidth="1.2" fill="none" strokeLinecap="round" />
              <circle cx="8" cy="9" r="1.2" fill={P.ink} />
            </svg>
            <svg width="14" height="11" viewBox="0 0 14 11">
              <rect x="1" y="2" width="9" height="7" rx="1.5" stroke={P.ink} strokeWidth="1" fill="none" />
              <rect x="2.5" y="3.5" width="6" height="4" rx="0.5" fill={P.ink} />
              <rect x="11" y="4.5" width="2" height="2" fill={P.ink} />
            </svg>
          </span>
        </div>

        {/* Header + page content — one scroll region, so the header scrolls
            away with the page instead of staying pinned. */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{ padding: '10px 16px 12px', borderBottom: `1px solid ${P.lineSoft}`, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            {isMoreSubpage(active) && (
              <button
                type="button"
                onClick={() => navigate('/more')}
                style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${P.line}`, background: P.surface, cursor: 'pointer', display: 'grid', placeItems: 'center', flexShrink: 0, marginLeft: -4 }}
              >
                <Icon name="chevronLeft" size={15} color={P.inkSoft} />
              </button>
            )}
            <div style={{ fontSize: 18, fontWeight: 700 }}>{pageTitle(active)}</div>
          </div>

          <Outlet />
        </div>

        {/* Bottom nav */}
        <div
          style={{
            flexShrink: 0,
            background: 'rgba(255,255,255,0.92)',
            borderTop: `1px solid ${P.line}`,
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            padding: '4px 8px 14px',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', alignItems: 'stretch' }}>
            {MOBILE_NAV.map((it) => {
              const on = it.matches.some((m) => (m === '/' ? active === '/' : active.startsWith(m)))
              return (
                <button
                  key={it.path}
                  type="button"
                  onClick={() => navigate(it.path)}
                  style={{
                    border: 'none', background: 'transparent', cursor: 'pointer', padding: 0,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    fontFamily: P.sans, color: on ? P.sage : P.inkSoft,
                  }}
                >
                  <span style={{ width: 24, height: 3, borderRadius: 99, background: on ? P.sage : 'transparent', marginBottom: 4 }} />
                  <Icon name={it.icon} size={21} color={on ? P.sage : P.inkSoft} />
                  <span style={{ fontSize: 10.5, letterSpacing: 0.2, fontWeight: on ? 600 : 500 }}>{it.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {updateAvailable && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(14,20,16,0.45)', zIndex: 9500, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: P.surface, borderRadius: 12, padding: 22, width: 360, maxWidth: '90%', boxShadow: '0 24px 60px rgba(0,0,0,0.25)' }}>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Update available</div>
            <div style={{ fontSize: 13, color: P.inkSoft, marginBottom: 18, lineHeight: 1.5 }}>
              Version {updateAvailable.version} is ready to install. The app will restart automatically.
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                onClick={() => setUpdateAvailable(null)}
                disabled={installingUpdate}
                style={{ flex: 1, padding: '10px 0', borderRadius: 7, border: `1px solid ${P.line}`, background: P.surface, fontSize: 13, fontWeight: 600, cursor: installingUpdate ? 'default' : 'pointer', opacity: installingUpdate ? 0.5 : 1 }}
              >
                Later
              </button>
              <button
                type="button"
                onClick={() => { void handleInstallUpdate() }}
                disabled={installingUpdate}
                style={{ flex: 1, padding: '10px 0', borderRadius: 7, border: `1px solid ${P.sageDeep}`, background: P.sage, color: '#FFF', fontSize: 13, fontWeight: 600, cursor: installingUpdate ? 'default' : 'pointer', opacity: installingUpdate ? 0.7 : 1 }}
              >
                {installingUpdate ? 'Installing…' : 'Update & restart'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast message={toast} />
    </>
  )
}
