import type { Request, Response, Router } from 'express'
import { Router as createRouter } from 'express'
import { logoutWhatsApp } from '../whatsapp'

const router: Router = createRouter()

router.post('/', (_req: Request, res: Response): void => {
  logoutWhatsApp()
  res.json({ success: true })
})

export default router
