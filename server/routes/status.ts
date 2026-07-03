import type { Request, Response, Router } from 'express'
import { Router as createRouter } from 'express'
import { getStatus } from '../whatsapp'

const router: Router = createRouter()

router.get('/', (_req: Request, res: Response): void => {
  const { status, qr } = getStatus()
  res.json({ status, qr })
})

export default router
