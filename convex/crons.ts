import { cronJobs } from 'convex/server'
import { internal } from './_generated/api'

const crons = cronJobs()

// Fixed at midnight UTC — not user-configurable (see src/lib/broadcast-time.ts
// for the matching frontend display constant).
crons.cron(
  'daily send',
  '0 0 * * *',
  internal.messages.sendDailyMessage,
  {},
)

export default crons
