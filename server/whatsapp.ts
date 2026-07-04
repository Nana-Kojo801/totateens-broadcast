import wwebjs from 'whatsapp-web.js'
const { Client, LocalAuth } = wwebjs
import qrcode from 'qrcode'

type Status = 'connected' | 'qr_pending' | 'disconnected'

let currentStatus: Status = 'disconnected'
let currentQr: string | null = null
let disconnectTimer: ReturnType<typeof setTimeout> | null = null

export const client = new Client({
  authStrategy: new LocalAuth({ dataPath: process.env.WA_DATA_DIR ?? '.wwebjs_auth' }),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  },
})

client.on('qr', async (qr: string) => {
  // Cancel any pending disconnect — QR means we're still in auth flow
  if (disconnectTimer) { clearTimeout(disconnectTimer); disconnectTimer = null }
  currentStatus = 'qr_pending'
  currentQr = await qrcode.toDataURL(qr)
  console.log('QR code ready — scan with WhatsApp')
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

export function reinitWhatsApp(): void {
  console.log('Reinitializing WhatsApp client…')
  currentStatus = 'disconnected'
  currentQr = null
  client.destroy().catch(() => undefined).finally(() => {
    client.initialize().catch((err: unknown) => {
      console.error('WhatsApp reinit error:', err)
    })
  })
}

export async function shutdownWhatsApp(): Promise<void> {
  console.log('Shutting down WhatsApp client…')
  await client.destroy().catch(() => undefined)
}
