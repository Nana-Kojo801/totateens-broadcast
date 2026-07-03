import { createRoot } from 'react-dom/client'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import './index.css'
import App from './App'
import { ErrorBoundary } from '@/components/error-boundary'
import { ErrorScreen } from '@/pages/error'

const root = createRoot(document.getElementById('root')!)

// Client construction runs before React mounts, so a failure here (e.g. a
// bad Convex URL — the exact cause of an earlier white-screen bug) would
// happen outside the tree the ErrorBoundary covers. Caught separately here
// so it still lands on the same error screen instead of a blank page.
try {
  const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL ?? '')
  root.render(
    <ErrorBoundary>
      <ConvexProvider client={convex}>
        <App />
      </ConvexProvider>
    </ErrorBoundary>,
  )
} catch (err) {
  root.render(<ErrorScreen error={err instanceof Error ? err : new Error(String(err))} onReload={() => window.location.reload()} />)
}
