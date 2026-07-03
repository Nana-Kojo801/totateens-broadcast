import type { Request, Response, Router } from 'express'
import { Router as createRouter } from 'express'
import { client, getStatus, reinitWhatsApp } from '../whatsapp'

const router: Router = createRouter()

router.post('/', async (req: Request, res: Response): Promise<void> => {
  const apiKey = process.env.WHATSAPP_API_KEY
  if (apiKey && req.headers['x-api-key'] !== apiKey) {
    res.status(401).json({ success: false, error: 'Unauthorized' })
    return
  }

  const { groupId, message } = req.body as { groupId?: string; message?: string }

  if (!groupId || !message) {
    res.status(400).json({ success: false, error: 'groupId and message are required' })
    return
  }

  const { status } = getStatus()
  if (status !== 'connected') {
    res.status(503).json({ success: false, error: `WhatsApp not connected (status: ${status})` })
    return
  }

  try {
    await client.sendMessage(groupId, message)
    res.json({ success: true })
  } catch (err) {
    const message2 = err instanceof Error ? err.message : String(err)
    if (message2.includes('detached Frame') || message2.includes('Session closed') || message2.includes('Target closed')) {
      reinitWhatsApp()
    }
    res.status(500).json({ success: false, error: message2 })
  }
})

export default router
