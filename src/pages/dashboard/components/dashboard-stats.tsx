import { P } from '@/lib/tokens'
import { Card } from '@/components/ui/card'

interface StatCardProps {
  label: string
  value: string
  sub: string
  tone?: string
}

export function StatCard({ label, value, sub, tone }: StatCardProps) {
  return (
    <Card style={{ padding: 12, minWidth: 0 }}>
      <div style={{ fontSize: 10, color: P.inkSoft, letterSpacing: 1, fontWeight: 600 }}>{label.toUpperCase()}</div>
      <div style={{ fontFamily: P.mono, fontSize: 24, fontWeight: 600, color: tone || P.ink, marginTop: 5, lineHeight: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</div>
      <div style={{ fontSize: 11, color: P.inkSoft, marginTop: 5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub}</div>
    </Card>
  )
}
