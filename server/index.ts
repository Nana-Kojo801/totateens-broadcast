import express from 'express'
import cors from 'cors'
import { initWhatsApp, shutdownWhatsApp } from './whatsapp'
import sendRouter from './routes/send'
import statusRouter from './routes/status'

const app = express()
const PORT = process.env.WA_SERVER_PORT ?? 3001

app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173' }))
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
process.stdin.on('data', (data: Buffer) => {
  if (data.toString().trim() === 'shutdown') {
    shutdownWhatsApp().finally(() => process.exit(0))
  }
})
process.stdin.resume()
