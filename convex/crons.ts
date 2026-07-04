import { cronJobs } from 'convex/server'

// No automatic sending — the client sends each day's message manually via
// the "Send now" button. Nothing to schedule here.
const crons = cronJobs()

export default crons
