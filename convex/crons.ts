import { cronJobs } from 'convex/server'
import { internal } from './_generated/api'

const crons = cronJobs()

// Runs every 5 minutes and checks appSettings for the configured send time —
// lets the send time be changed from Settings without redeploying a cron
// schedule. sendDailyMessage itself is idempotent (skips once a day's
// message is no longer 'scheduled'), so extra checks within the same
// 5-minute window are harmless.
crons.interval(
  'check daily send window',
  { minutes: 5 },
  internal.messages.checkAndSendDaily,
  {},
)

export default crons
