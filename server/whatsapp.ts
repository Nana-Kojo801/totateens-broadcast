import wwebjs from 'whatsapp-web.js'
const { Client, LocalAuth } = wwebjs
import qrcode from 'qrcode'
import fs from 'fs'
import path from 'path'

type Status = 'connected' | 'qr_pending' | 'disconnected' | 'authenticated'

let currentStatus: Status = 'disconnected'
let currentQr: string | null = null
let disconnectTimer: ReturnType<typeof setTimeout> | null = null

const dataPath = process.env.WA_DATA_DIR ?? '.wwebjs_auth'

// Chrome writes SingletonLock/SingletonCookie/SingletonSocket into the
// profile dir while running and removes them on a clean exit. If the app
// was force-quit, crashed, or killed by the OS instead of going through our
// graceful shutdown, these survive — and on the next launch Puppeteer's
// Chrome sits waiting to acquire a lock that's never coming free. Since we
// only ever run one Chrome instance against this profile, it's always safe
// to clear stale locks before starting: if Chrome were actually still
// running, initialize() would just fail fast rather than hang forever like
// it does now.
function clearStaleSessionLocks(): void {
  const sessionDir = path.join(dataPath, 'session')
  for (const name of ['SingletonLock', 'SingletonCookie', 'SingletonSocket']) {
    fs.rm(path.join(sessionDir, name), { force: true }, () => undefined)
  }
}

export const client = new Client({
  authStrategy: new LocalAuth({ dataPath }),
  // Without this, a hung Chrome launch (e.g. a lock file we failed to
  // clear, or Chrome itself wedged) leaves the app stuck on "loading"
  // forever with no error and no retry — this bounds that wait so our
  // existing initWhatsApp() retry logic actually gets a chance to kick in.
  authTimeoutMs: 60_000,
  qrMaxRetries: 5,
  // Without this, whatsapp-web.js fetches WhatsApp Web's current version
  // metadata from a remote endpoint on every single launch before it can do
  // anything else — a network round-trip that's the single biggest
  // contributor to "takes forever to show connected/show the QR" on app
  // open. Caching it locally after the first successful fetch skips that
  // round-trip on every subsequent launch.
  webVersionCache: { type: 'local' },
  puppeteer: {
    headless: true,
    // Use the system-installed Chrome instead of downloading/bundling
    // Chromium — keeps the packaged sidecar binary small since this app
    // only ever runs on one known machine that already has Chrome.
    channel: 'chrome',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      // Trim Chrome's own cold-start overhead — none of this affects
      // WhatsApp Web functionality, it just skips work irrelevant to a
      // single-purpose headless automation profile.
      '--disable-extensions',
      '--disable-default-apps',
      '--disable-background-networking',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--disable-sync',
      '--no-first-run',
      '--metrics-recording-only',
      '--mute-audio',
    ],
  },
})

client.on('qr', async (qr: string) => {
  // Cancel any pending disconnect — QR means we're still in auth flow
  if (disconnectTimer) { clearTimeout(disconnectTimer); disconnectTimer = null }
  currentStatus = 'qr_pending'
  currentQr = await qrcode.toDataURL(qr)
  console.log('QR code ready — scan with WhatsApp')
})

client.on('authenticated', () => {
  // Fires right after a successful QR scan, before 'ready'. Clear the QR
  // immediately so the frontend doesn't keep showing a stale, already-used
  // code while whatsapp-web.js finishes its handshake.
  if (disconnectTimer) { clearTimeout(disconnectTimer); disconnectTimer = null }
  currentStatus = 'authenticated'
  currentQr = null
  console.log('WhatsApp authenticated — finishing setup…')
})

client.on('ready', () => {
  if (disconnectTimer) { clearTimeout(disconnectTimer); disconnectTimer = null }
  currentStatus = 'connected'
  currentQr = null
  console.log('WhatsApp client ready')
})

client.on('disconnected', () => {
  // Debounce: brief disconnects during auth handshake should not flip status immediately.
  // Wait 4 s — if a 'ready' or 'qr' event arrives first, cancel this.
  if (disconnectTimer) clearTimeout(disconnectTimer)
  disconnectTimer = setTimeout(() => {
    disconnectTimer = null
    currentStatus = 'disconnected'
    currentQr = null
    console.log('WhatsApp client disconnected')
  }, 4000)
})

client.on('auth_failure', () => {
  if (disconnectTimer) { clearTimeout(disconnectTimer); disconnectTimer = null }
  currentStatus = 'disconnected'
  currentQr = null
  console.error('WhatsApp auth failure')
})

export function getStatus(): { status: Status; qr: string | null } {
  return { status: currentStatus, qr: currentQr }
}

export function initWhatsApp(attempt = 1): void {
  clearStaleSessionLocks()
  client.initialize().catch((err: unknown) => {
    console.error(`WhatsApp init error (attempt ${attempt}):`, err)
    currentStatus = 'disconnected'
    // The initial page injection is occasionally racy right after Chrome
    // launches ("Execution context was destroyed") — a clean retry usually
    // succeeds. Give up after a few tries so a real failure doesn't loop
    // forever.
    if (attempt < 3) {
      client.destroy().catch(() => undefined).finally(() => {
        setTimeout(() => initWhatsApp(attempt + 1), 2000)
      })
    }
  })
}

export function logoutWhatsApp(): void {
  console.log('Logging out WhatsApp — a new QR code will be required')
  currentStatus = 'disconnected'
  currentQr = null
  client.logout().catch(() => undefined).finally(() => {
    clearStaleSessionLocks()
    client.initialize().catch((err: unknown) => {
      console.error('WhatsApp post-logout init error:', err)
    })
  })
}

export function reinitWhatsApp(): void {
  console.log('Reinitializing WhatsApp client…')
  currentStatus = 'disconnected'
  currentQr = null
  client.destroy().catch(() => undefined).finally(() => {
    clearStaleSessionLocks()
    client.initialize().catch((err: unknown) => {
      console.error('WhatsApp reinit error:', err)
    })
  })
}

export async function shutdownWhatsApp(): Promise<void> {
  console.log('Shutting down WhatsApp client…')
  await client.destroy().catch(() => undefined)
}
