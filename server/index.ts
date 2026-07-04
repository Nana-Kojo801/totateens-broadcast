import express from 'express'
import cors from 'cors'
import { initWhatsApp, shutdownWhatsApp } from './whatsapp'
import sendRouter from './routes/send'
import statusRouter from './routes/status'

const app = express()
// Most hosting platforms assign the port via `PORT` and require binding to
// it — fall back to our own WA_SERVER_PORT (useful when running two of our
// own services on one box) and then a plain local default.
const PORT = process.env.PORT ?? process.env.WA_SERVER_PORT ?? 3001

app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173' }))
app.use(express.json())

app.use('/send', sendRouter)
app.use('/status', statusRouter)

app.listen(PORT, () => {
  console.log(`WhatsApp server running on port ${PORT}`)
  initWhatsApp()
})

// Let whatsapp-web.js close its Chrome session cleanly on a normal stop/
// restart (most hosts — Docker, systemd, Render, Railway — send SIGTERM),
// instead of a hard kill leaving Chrome orphaned.
const gracefulShutdown = () => {
  shutdownWhatsApp().finally(() => process.exit(0))
}
process.on('SIGTERM', gracefulShutdown)
process.on('SIGINT', gracefulShutdown)
