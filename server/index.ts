import express from 'express'
import cors from 'cors'
import { initWhatsApp, shutdownWhatsApp } from './whatsapp'
import sendRouter from './routes/send'
import statusRouter from './routes/status'

const app = express()
const PORT = process.env.PORT ?? process.env.WA_SERVER_PORT ?? 3001

// This server only ever runs as a local sidecar talking to our own desktop
// app on the same machine — never exposed to the network — so a strict
// origin allowlist buys no real security, just breaks things when Tauri's
// packaged-app origin (https://tauri.localhost) differs from the dev
// server's (http://localhost:5173). Reflecting any origin is safe here.
app.use(cors({ origin: true }))
app.use(express.json())

app.use('/send', sendRouter)
app.use('/status', statusRouter)

app.listen(PORT, () => {
  console.log(`WhatsApp server running on port ${PORT}`)
  initWhatsApp()
})

// The Tauri sidecar host writes "shutdown" to this process's stdin when the
// app window closes, giving whatsapp-web.js a chance to close its Chrome
// session cleanly (a hard process kill leaves Chrome orphaned on Windows).
// SIGTERM/SIGINT handled too, in case the process ever gets stopped some
// other way.
const gracefulShutdown = () => {
  shutdownWhatsApp().finally(() => process.exit(0))
}
process.stdin.on('data', (data: Buffer) => {
  if (data.toString().trim() === 'shutdown') gracefulShutdown()
})
process.stdin.resume()
process.on('SIGTERM', gracefulShutdown)
process.on('SIGINT', gracefulShutdown)
