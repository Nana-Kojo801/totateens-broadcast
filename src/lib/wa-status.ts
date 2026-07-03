import type { WaStatus } from '@/store/app-store'

export async function fetchWaStatus(): Promise<{ status: WaStatus; qr: string | null }> {
  const waServerUrl = import.meta.env.VITE_WA_SERVER_URL as string | undefined
  if (!waServerUrl) return { status: 'unreachable', qr: null }
  try {
    const res = await fetch(`${waServerUrl}/status`)
    if (!res.ok) return { status: 'unreachable', qr: null }
    const data = (await res.json()) as { status: string; qr: string | null }
    return { status: data.status as WaStatus, qr: data.qr }
  } catch {
    return { status: 'unreachable', qr: null }
  }
}
