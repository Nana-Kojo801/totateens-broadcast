import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { usePaginatedQuery, useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { P } from '@/lib/tokens'
import { Card } from '@/components/ui/card'
import { Tag } from '@/components/ui/tag'
import { Icon } from '@/lib/icons'
import { Btn } from '@/components/ui/btn'
import { StatCard } from '@/pages/dashboard/components/dashboard-stats'
import { useAppStore } from '@/store/app-store'
import { useShallow } from 'zustand/react/shallow'
import { Skeleton } from '@/components/ui/skeleton'
import type { HistoryEntry } from '@/store/app-store'

export function HistoryPage() {
  const navigate = useNavigate()
  const { setToast, viewMonth } = useAppStore(
    useShallow((s) => ({ setToast: s.setToast, viewMonth: s.viewMonth }))
  )

  const { results, status: queryStatus, loadMore } = usePaginatedQuery(
    api.history.listPaginated,
    { monthYear: viewMonth },
    { initialNumItems: 20 },
  )

  const convexMessages = useQuery(api.messageQueries.listByMonth, { monthYear: viewMonth })

  const dayInfoMap = new Map(
    (convexMessages ?? []).map((m) => [parseInt(m.date.slice(8, 10)), { title: m.title, ref: m.scriptureReference }])
  )

  const history: HistoryEntry[] = results.map((h) => ({
    day: parseInt(h.messageDate.slice(8, 10)),
    sentAt: new Date(h.sentAt).toLocaleString(),
    groups: 1,
    delivered: h.status === 'success' ? 1 : 0,
    note: h.groupName,
  }))

  const canLoadMore = queryStatus === 'CanLoadMore'

  if (queryStatus === 'LoadingFirstPage') {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="hidden md:block">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 14 }}>
            {[0, 1].map((i) => (
              <Card key={i} style={{ padding: 14 }}>
                <Skeleton height={10} width="60%" />
                <Skeleton height={26} style={{ marginTop: 8 }} />
                <Skeleton height={10} width="80%" style={{ marginTop: 6 }} />
              </Card>
            ))}
          </div>
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '10px 16px', background: P.bgSoft, borderBottom: `1px solid ${P.line}` }}>
              <Skeleton height={10} width={280} />
            </div>
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} style={{ padding: '14px 16px', borderBottom: `1px solid ${P.lineSoft}`, display: 'flex', gap: 14, alignItems: 'center' }}>
                <Skeleton height={14} width={36} />
                <Skeleton height={14} style={{ flex: 1 }} />
                <Skeleton height={14} width={120} />
                <Skeleton height={20} width={56} style={{ borderRadius: 20 }} />
              </div>
            ))}
          </Card>
        </div>
        <div className="md:hidden" style={{ padding: '0 16px 16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 14 }}>
            <Card style={{ padding: 10 }}><Skeleton height={9} width={60} /><Skeleton height={18} style={{ marginTop: 6 }} /></Card>
            <Card style={{ padding: 10 }}><Skeleton height={9} width={60} /><Skeleton height={18} style={{ marginTop: 6 }} /></Card>
          </div>
          {[0, 1, 2, 3].map((i) => (
            <Card key={i} style={{ padding: 12, marginBottom: 6, display: 'flex', gap: 10, alignItems: 'center' }}>
              <Skeleton height={36} width={36} style={{ borderRadius: 8, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <Skeleton height={13} /><Skeleton height={10} width="60%" style={{ marginTop: 4 }} />
              </div>
              <Skeleton height={20} width={40} style={{ borderRadius: 20 }} />
            </Card>
          ))}
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      {/* Desktop */}
      <div className="hidden md:block">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 14 }}>
          <StatCard label="Total sent" value={String(history.length)} sub="this month" tone={P.ink} />
          <StatCard label="Delivery rate" value="99.1%" sub="excellent" tone={P.sage} />
        </div>

        <Card style={{ padding: 0, overflow: 'hidden', minWidth: 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '60px minmax(0,1fr) 160px 110px 50px', padding: '10px 16px', fontSize: 10, color: P.inkSoft, letterSpacing: 1, fontWeight: 600, background: P.bgSoft, borderBottom: `1px solid ${P.line}` }}>
            <div>DAY</div><div>TITLE · REF</div><div>SENT</div><div>DELIVERY</div><div />
          </div>
          {history.map((h, i) => {
            const d = dayInfoMap.get(h.day)
            return (
              <div key={i} onClick={() => navigate(`/messages/${h.day}`)} style={{ display: 'grid', gridTemplateColumns: '60px minmax(0,1fr) 160px 110px 50px', padding: '12px 16px', alignItems: 'center', borderBottom: `1px solid ${P.lineSoft}`, cursor: 'pointer', minWidth: 0 }}>
                <div style={{ fontFamily: P.mono, fontSize: 13 }}>{String(h.day).padStart(2, '0')}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d?.title}</div>
                  <div style={{ fontSize: 11, color: P.inkSoft, fontFamily: P.mono, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {d?.ref}{h.note ? ` · ${h.note}` : ''}
                  </div>
                </div>
                <div style={{ fontFamily: P.mono, fontSize: 11, color: P.inkSoft }}>{h.sentAt}</div>
                <div><Tag bg={P.sageTint} color={P.sage}>{h.delivered}/{h.groups} ✓</Tag></div>
                <div style={{ textAlign: 'right', color: P.inkFaint }}>
                  <Icon name="chevronRight" size={14} />
                </div>
              </div>
            )
          })}
        </Card>

        {canLoadMore && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
            <Btn onClick={() => loadMore(20)}>Load more</Btn>
          </div>
        )}
      </div>

      {/* Mobile */}
      <div className="md:hidden" style={{ padding: '0 16px 16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 14 }}>
          <Card style={{ padding: 10 }}>
            <div style={{ fontSize: 9, color: P.inkSoft, fontFamily: P.mono, letterSpacing: 1 }}>DELIVERY</div>
            <div style={{ fontFamily: P.mono, fontSize: 17, fontWeight: 600, color: P.sage, marginTop: 4 }}>99.1%</div>
          </Card>
          <Card style={{ padding: 10 }}>
            <div style={{ fontSize: 9, color: P.inkSoft, fontFamily: P.mono, letterSpacing: 1 }}>TOTAL SENT</div>
            <div style={{ fontFamily: P.mono, fontSize: 17, fontWeight: 600, marginTop: 4 }}>{history.length}</div>
          </Card>
        </div>

        {history.map((h, i) => {
          const d = dayInfoMap.get(h.day)
          return (
            <Card key={i} onClick={() => navigate(`/messages/${h.day}`)} style={{ padding: 12, marginBottom: 6, display: 'grid', gridTemplateColumns: '36px 1fr auto', gap: 10, alignItems: 'center', cursor: 'pointer' }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: P.sageTint, color: P.sage, display: 'grid', placeItems: 'center', fontFamily: P.mono, fontSize: 11, fontWeight: 700 }}>
                {String(h.day).padStart(2, '0')}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d?.title}</div>
                <div style={{ fontSize: 10.5, color: P.inkSoft, fontFamily: P.mono, marginTop: 2 }}>{h.sentAt.slice(-13)}</div>
              </div>
              <Tag bg={P.sageTint} color={P.sage}>{h.delivered}/{h.groups}</Tag>
            </Card>
          )
        })}

        {canLoadMore && (
          <Btn onClick={() => loadMore(20)} style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>Load more</Btn>
        )}
      </div>

      {/* Export button triggers toast — wired from AppShell header action */}
      <div style={{ display: 'none' }} onClick={() => setToast('Export coming soon')} />
    </motion.div>
  )
}
