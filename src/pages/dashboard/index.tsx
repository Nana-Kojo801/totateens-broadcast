import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery, useMutation } from 'convex/react'
import { useShallow } from 'zustand/react/shallow'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import { P } from '@/lib/tokens'
import { Card } from '@/components/ui/card'
import { Tag } from '@/components/ui/tag'
import { Dot } from '@/components/ui/dot'
import { Btn } from '@/components/ui/btn'
import { Icon } from '@/lib/icons'
import { WhatsAppBubbleCompact } from '@/components/whatsapp-bubble'
import { ManualSendModal } from '@/components/manual-send-modal'
import { WaConnectionBanner } from '@/components/wa-connection-banner'
import { useAppStore } from '@/store/app-store'
import { Skeleton } from '@/components/ui/skeleton'
import { StatCard } from './components/dashboard-stats'
import { DashboardScheduleBar } from './components/dashboard-schedule-bar'
import { DashboardRecent } from './components/dashboard-recent'
import type { DevotionalDay, DayStatus, HistoryEntry, WhatsAppGroup } from '@/store/app-store'

function convexMsgToDay(msg: {
  _id: string
  date: string
  title: string
  scripture: string
  scriptureReference: string
  body: string
  prayerPoints: string[]
  prayerLabel?: string
  status: string
}): DevotionalDay {
  const d = parseInt(msg.date.slice(8, 10))
  const today = new Date().toISOString().slice(0, 10)
  let status: DayStatus = 'upcoming'
  if (msg.status === 'sent') status = 'sent'
  else if (msg.date === today) status = 'today'
  else if (msg.status === 'missing' || msg.date < today) status = 'missing'
  return {
    d,
    title: msg.title,
    verse: msg.scripture,
    ref: msg.scriptureReference,
    body: msg.body.split('\n\n').filter((p) => p.trim().length > 0),
    prayer: msg.prayerPoints,
    prayerLabel: msg.prayerLabel,
    resolve: '',
    status,
  }
}

export function DashboardPage() {
  const navigate = useNavigate()
  const { setToast, setViewMonth, waStatus, waQr } = useAppStore(
    useShallow((s) => ({
      setToast: s.setToast,
      setViewMonth: s.setViewMonth,
      waStatus: s.waStatus,
      waQr: s.waQr,
    })),
  )
  const [manualSendDay, setManualSendDay] = useState<number | null>(null)

  // Dashboard always reflects the real current month — deliberately not the
  // shared `viewMonth` store value, which the Calendar page uses to browse
  // other months. Otherwise browsing to e.g. August in Calendar would make
  // "today" here show mismatched August data.
  const todayMonthYear = new Date().toISOString().slice(0, 7)
  const convexMessages = useQuery(api.messageQueries.listByMonth, { monthYear: todayMonthYear })
  const convexGroups = useQuery(api.groups.listActive)
  const convexStats = useQuery(api.messageQueries.getDashboardStats, { monthYear: todayMonthYear })
  const convexRecent = useQuery(api.history.listRecent, { limit: 5 })
  const updateStatusMut = useMutation(api.messageQueries.updateStatus)
  const manualSendLogMut = useMutation(api.messageQueries.manualSend)

  if (convexMessages === undefined || convexGroups === undefined) {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="hidden md:block">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 14 }}>
            {[0, 1, 2].map((i) => (
              <Card key={i} style={{ padding: 14 }}>
                <Skeleton height={10} width="60%" />
                <Skeleton height={26} style={{ marginTop: 8 }} />
                <Skeleton height={10} width="80%" style={{ marginTop: 6 }} />
              </Card>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px', gap: 14 }}>
            <Card style={{ padding: 16, minWidth: 0 }}>
              <Skeleton height={12} width={140} />
              <div style={{ display: 'flex', gap: 2, marginTop: 14 }}>
                {Array.from({ length: 31 }, (_, i) => <Skeleton key={i} height={56} style={{ flex: 1, borderRadius: 3 }} />)}
              </div>
            </Card>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Card style={{ padding: 14 }}>
                <Skeleton height={12} width={80} />
                <Skeleton height={18} style={{ marginTop: 8 }} />
                <Skeleton height={12} style={{ marginTop: 6 }} />
                <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                  <Skeleton height={32} style={{ flex: 1, borderRadius: 6 }} />
                  <Skeleton height={32} style={{ flex: 1, borderRadius: 6 }} />
                </div>
              </Card>
            </div>
          </div>
        </div>
        <div className="md:hidden" style={{ padding: '0 16px 16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <Card style={{ padding: 12 }}><Skeleton height={10} width={60} /><Skeleton height={22} style={{ marginTop: 6 }} /></Card>
            <Card style={{ padding: 12 }}><Skeleton height={10} width={60} /><Skeleton height={22} style={{ marginTop: 6 }} /></Card>
          </div>
        </div>
      </motion.div>
    )
  }

  // Empty state — no PDF uploaded yet
  if (convexMessages.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <WaConnectionBanner waStatus={waStatus} waQr={waQr} size="lg" />
        <Card style={{ padding: 60, textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🎺</div>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>No devotional loaded</div>
          <div style={{ fontSize: 13, color: P.inkSoft, marginBottom: 20 }}>Upload the monthly PDF to start broadcasting.</div>
          <Btn variant="primary" onClick={() => navigate('/upload')} style={{ justifyContent: 'center', margin: '0 auto' }}>
            <Icon name="upload" size={13} color="#FFF" /> Go to Upload
          </Btn>
        </Card>
      </motion.div>
    )
  }

  const rawDays = convexMessages.map(convexMsgToDay)
  const days: DevotionalDay[] = Array.from({ length: 31 }, (_, i) => {
    const dayNum = i + 1
    return rawDays.find((d) => d.d === dayNum) ?? { d: dayNum, title: '', verse: '', ref: '', body: [], prayer: [], resolve: '', status: 'upcoming' as DayStatus }
  })

  const groups: WhatsAppGroup[] = convexGroups.map((g) => ({
    id: g._id as string,
    name: g.name,
    active: g.isActive,
    groupId: g.whatsappId,
  }))

  const history: HistoryEntry[] = (convexRecent ?? []).map((h) => ({
    day: parseInt(h.messageDate.slice(8, 10)),
    sentAt: new Date(h.sentAt).toLocaleString(),
    groups: 1,
    delivered: h.status === 'success' ? 1 : 0,
  }))
  const recentLoading = convexRecent === undefined

  const todayNum = new Date().getDate()
  const today = days[todayNum - 1]
  const sentCount = convexStats?.sent ?? rawDays.filter((d) => d.status === 'sent').length
  const activeGroups = groups.filter((g) => g.active)
  const todayFormatted = convexMessages.find((m) => m.date === new Date().toISOString().slice(0, 10))?.formattedMessage ?? ''

  const goToMessage = (day: number) => {
    setViewMonth(todayMonthYear)
    navigate(`/messages/${day}`)
  }

  const handleConfirmSend = async () => {
    if (!manualSendDay) return
    const waServerUrl = import.meta.env.VITE_WA_SERVER_URL as string | undefined
    const convexActiveGroups = convexGroups.filter((g) => g.isActive)
    const convexMsg = convexMessages.find((m) => parseInt(m.date.slice(8, 10)) === manualSendDay) ?? null

    if (waServerUrl && convexActiveGroups.length > 0 && convexMsg) {
      for (const group of convexActiveGroups) {
        try {
          const res = await fetch(`${waServerUrl}/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ groupId: group.whatsappId, message: convexMsg.formattedMessage }),
          })
          const json = (await res.json()) as { success: boolean; error?: string }
          await manualSendLogMut({
            messageId: convexMsg._id as Id<'messages'>,
            groupId: group._id as Id<'groups'>,
            status: json.success ? 'success' : 'failed',
            error: json.success ? undefined : (json.error ?? 'send failed'),
          })
        } catch (err) {
          await manualSendLogMut({
            messageId: convexMsg._id as Id<'messages'>,
            groupId: group._id as Id<'groups'>,
            status: 'failed',
            error: String(err),
          })
        }
      }
      await updateStatusMut({ id: convexMsg._id as Id<'messages'>, status: 'sent' })
    }

    setManualSendDay(null)
    setToast('Broadcast sent to active groups')
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <WaConnectionBanner waStatus={waStatus} waQr={waQr} size="sm" />

      {/* Desktop */}
      <div className="hidden md:block">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 14 }}>
          <StatCard label="Month progress" value={`${sentCount}/31`} sub={`${Math.round((sentCount / 31) * 100)}% complete`} tone={P.ink} />
          <StatCard label="Delivery rate" value="99.1%" sub="rolling 30 days" tone={P.sage} />
          <StatCard label="Active groups" value={String(activeGroups.length)} sub={`of ${groups.length} total`} tone={P.ink} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px', gap: 14, minWidth: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
            <DashboardScheduleBar days={days} sentCount={sentCount} />
            {(recentLoading || history.length > 0) && <DashboardRecent history={history} days={days} loading={recentLoading} />}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
            {today?.title && (
              <Card style={{ padding: 14, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>Today's message</div>
                  <Tag bg={P.sunTint} color={P.sun}>DAY {todayNum}</Tag>
                </div>
                <WhatsAppBubbleCompact text={todayFormatted} />
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <Btn onClick={() => goToMessage(todayNum)} style={{ flex: 1, justifyContent: 'center' }}>
                    Open full preview <Icon name="arrowRight" size={12} />
                  </Btn>
                  <Btn variant="primary" onClick={() => setManualSendDay(todayNum)} style={{ flex: 1, justifyContent: 'center' }}>
                    <Icon name="send" size={12} color="#FFF" /> {today.status === 'sent' ? 'Resend' : 'Send now'}
                  </Btn>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden" style={{ padding: '0 16px 16px' }}>
        {today?.title && (
          <Btn variant="primary" onClick={() => setManualSendDay(todayNum)} style={{ width: '100%', justifyContent: 'center', marginBottom: 10 }}>
            <Icon name="send" size={13} color="#FFF" /> {today.status === 'sent' ? `Resend Day ${todayNum}` : `Send Day ${todayNum} now`}
          </Btn>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <Card style={{ padding: 12 }}>
            <div style={{ fontSize: 10, color: P.inkSoft, letterSpacing: 1, fontWeight: 600 }}>PROGRESS</div>
            <div style={{ fontFamily: P.mono, fontSize: 22, fontWeight: 600, marginTop: 4 }}>{sentCount}/31</div>
            <div style={{ height: 4, background: P.surfaceAlt, borderRadius: 99, marginTop: 8, overflow: 'hidden' }}>
              <div style={{ width: `${(sentCount / 31) * 100}%`, height: '100%', background: P.sage }} />
            </div>
          </Card>
          <Card style={{ padding: 12 }}>
            <div style={{ fontSize: 10, color: P.inkSoft, letterSpacing: 1, fontWeight: 600 }}>DELIVERY</div>
            <div style={{ fontFamily: P.mono, fontSize: 22, fontWeight: 600, marginTop: 4, color: P.sage }}>99.1%</div>
            <div style={{ fontSize: 10, color: P.inkSoft, marginTop: 6 }}>30-day rolling</div>
          </Card>
        </div>

        <Card style={{ padding: 14, marginTop: 12, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 600 }}>May schedule</div>
            <button onClick={() => navigate('/calendar')} style={{ fontSize: 11, color: P.sage, fontWeight: 600, background: 'transparent', border: 'none', cursor: 'pointer' }}>view all →</button>
          </div>
          <div style={{ display: 'flex', gap: 2, width: '100%' }}>
            {days.map(d => (
              <button key={d.d} type="button" onClick={() => goToMessage(d.d)} title={`Day ${d.d}`} style={{ flex: '1 1 0', minWidth: 0, height: 28, borderRadius: 2, border: 'none', cursor: 'pointer', padding: 0, background: d.status === 'sent' ? P.sage : d.status === 'today' ? P.sun : P.lineSoft }} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, fontSize: 10.5, color: P.inkSoft, marginTop: 8, flexWrap: 'wrap', fontFamily: P.mono }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Dot color={P.sage} /> sent {sentCount}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Dot color={P.sun} /> today 1</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Dot color={P.inkFaint} /> upcoming {days.filter(d => d.status === 'upcoming').length}</span>
          </div>
        </Card>

        {(recentLoading || history.length > 0) && (
          <div style={{ marginTop: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: P.inkSoft, letterSpacing: 1, fontFamily: P.mono }}>RECENT</div>
              <button onClick={() => navigate('/history')} style={{ fontSize: 12, color: P.sage, fontWeight: 600, background: 'transparent', border: 'none', cursor: 'pointer' }}>all →</button>
            </div>
            {recentLoading
              ? Array.from({ length: 3 }, (_, i) => (
                <Card key={i} style={{ padding: 12, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Skeleton height={13} width={30} />
                  <div style={{ flex: 1, minWidth: 0 }}><Skeleton height={13} width="60%" /><Skeleton height={10} width="35%" style={{ marginTop: 4 }} /></div>
                  <Skeleton height={20} width={40} style={{ borderRadius: 20 }} />
                </Card>
              ))
              : history.slice(0, 4).map((h, i) => (
                <Card key={i} onClick={() => goToMessage(h.day)} style={{ padding: 12, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <div style={{ fontFamily: P.mono, fontSize: 13, color: P.inkSoft, width: 30 }}>{String(h.day).padStart(2, '0')}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{days[h.day - 1]?.title}</div>
                    <div style={{ fontSize: 10.5, color: P.inkSoft, fontFamily: P.mono, marginTop: 2 }}>{h.sentAt.slice(-13)}</div>
                  </div>
                  <Tag bg={P.sageTint} color={P.sage}>{h.delivered}/{h.groups}</Tag>
                </Card>
              ))}
          </div>
        )}
      </div>

      <ManualSendModal
        open={!!manualSendDay}
        day={days[(manualSendDay ?? 1) - 1]}
        groups={groups}
        onConfirm={() => { void handleConfirmSend() }}
        onClose={() => setManualSendDay(null)}
      />
    </motion.div>
  )
}
