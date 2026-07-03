import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import { P } from '@/lib/tokens'
import { Card } from '@/components/ui/card'
import { Tag } from '@/components/ui/tag'
import { Dot } from '@/components/ui/dot'
import { Btn } from '@/components/ui/btn'
import { Icon } from '@/lib/icons'
import { ManualSendModal } from '@/components/manual-send-modal'
import { useAppStore } from '@/store/app-store'
import { useShallow } from 'zustand/react/shallow'
import { Skeleton } from '@/components/ui/skeleton'
import { calendarGrid, dowShortOfDate, monthName } from '@/lib/utils'
import type { DevotionalDay, DayStatus, WhatsAppGroup } from '@/store/app-store'

const DOW_DESKTOP = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const DOW_MOBILE = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

interface CalCellDesktopProps {
  day: number
  data: DevotionalDay
  selected: boolean
  idx: number
  calendarStyle: 'tiles' | 'dots'
  onClick: () => void
}

function CalCellDesktop({ day, data, selected, idx, calendarStyle, onClick }: CalCellDesktopProps) {
  const isToday = data.status === 'today'
  const isSent = data.status === 'sent'
  const isDots = calendarStyle === 'dots'
  const bg = selected ? P.surfaceAlt : isToday ? P.sunTint : !isDots && isSent ? P.sageTint : P.surface

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        minHeight: 76, padding: 8, cursor: 'pointer',
        borderRight: idx % 7 < 6 ? `1px solid ${P.lineSoft}` : 'none',
        borderBottom: `1px solid ${P.lineSoft}`,
        background: bg, fontFamily: P.sans, textAlign: 'left', border: 'none',
        outline: selected ? `2px solid ${P.sage}` : 'none', outlineOffset: -2,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: P.mono, fontSize: 13, fontWeight: isToday ? 700 : 500, color: isToday ? P.sun : P.ink }}>
          {String(day).padStart(2, '0')}
        </div>
        {isDots ? (
          <Dot color={isSent ? P.sage : isToday ? P.sun : P.inkFaint} size={6} />
        ) : (
          isSent && (
            <span style={{ width: 16, height: 16, borderRadius: 5, background: '#FFF', display: 'grid', placeItems: 'center', border: `1px solid ${P.sageTint}` }}>
              <Icon name="check" size={10} color={P.sage} />
            </span>
          )
        )}
        {data.edited && <span style={{ fontSize: 9, fontFamily: P.mono, color: P.sun, padding: '1px 4px', borderRadius: 3, background: P.sunTint }}>edit</span>}
      </div>
      <div style={{
        fontSize: 11, color: isSent && !isDots ? P.sageDeep : P.inkSoft, marginTop: 6, lineHeight: 1.3,
        overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
      }}>
        {data.title}
      </div>
    </button>
  )
}

interface CalCellMobileProps {
  day: number
  data: DevotionalDay
  selected: boolean
  idx: number
  calendarStyle: 'tiles' | 'dots'
  onClick: () => void
}

function CalCellMobile({ day, data, selected, idx, calendarStyle, onClick }: CalCellMobileProps) {
  const isToday = data.status === 'today'
  const isSent = data.status === 'sent'
  const isDots = calendarStyle === 'dots'

  if (isDots) {
    return (
      <button
        type="button"
        onClick={onClick}
        style={{
          aspectRatio: '1/1', padding: 4, cursor: 'pointer',
          borderRight: idx % 7 < 6 ? `1px solid ${P.lineSoft}` : 'none',
          borderBottom: `1px solid ${P.lineSoft}`, background: 'transparent', fontFamily: P.sans, border: 'none',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
        }}
      >
        <div style={{
          width: 26, height: 26, borderRadius: 99, display: 'grid', placeItems: 'center',
          background: selected ? P.sage : isToday ? P.sun : 'transparent',
          color: (selected || isToday) ? '#FFF' : P.ink,
          fontFamily: P.mono, fontSize: 12, fontWeight: isToday || selected ? 700 : 500,
        }}>
          {day}
        </div>
        <Dot color={isSent ? P.sage : 'transparent'} size={4} />
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        aspectRatio: '1/1', padding: 6, cursor: 'pointer',
        borderRight: idx % 7 < 6 ? `1px solid ${P.lineSoft}` : 'none',
        borderBottom: `1px solid ${P.lineSoft}`,
        background: selected ? P.surfaceAlt : isToday ? P.sunTint : isSent ? P.sageTint : P.surface,
        outline: selected ? `2px solid ${P.sage}` : 'none', outlineOffset: -2,
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        fontFamily: P.sans, border: 'none',
      }}
    >
      <div style={{ fontFamily: P.mono, fontSize: 12, fontWeight: isToday ? 700 : 500, textAlign: 'left', color: isToday ? P.sun : isSent ? P.sage : P.ink }}>
        {String(day).padStart(2, '0')}
      </div>
      {isSent && <Icon name="check" size={10} color={P.sage} />}
    </button>
  )
}

function convexMsgToDay(msg: {
  _id: string
  date: string
  title: string
  scripture: string
  scriptureReference: string
  body: string
  prayerPoints: string[]
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
    resolve: '',
    status,
  }
}

function shiftMonth(monthYear: string, delta: number): string {
  const [year, month] = monthYear.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1 + delta, 1))
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
}

function monthLabel(monthYear: string): string {
  const [year, month] = monthYear.split('-').map(Number)
  return `${monthName(month)} ${year}`
}

function currentMonthYear(): string {
  return new Date().toISOString().slice(0, 7)
}

export function CalendarPage() {
  const navigate = useNavigate()
  const { calendarStyle, setToast, viewMonth, setViewMonth } = useAppStore(
    useShallow((s) => ({ calendarStyle: s.calendarStyle, setToast: s.setToast, viewMonth: s.viewMonth, setViewMonth: s.setViewMonth }))
  )
  const [selectedDay, setSelectedDay] = useState(new Date().getDate())
  const [manualSendDay, setManualSendDay] = useState<number | null>(null)

  const convexMessages = useQuery(api.messageQueries.listByMonth, { monthYear: viewMonth })
  const convexGroups = useQuery(api.groups.listActive)
  const updateStatusMut = useMutation(api.messageQueries.updateStatus)
  const manualSendLogMut = useMutation(api.messageQueries.manualSend)

  const monthNav = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, padding: '0 16px' }} className="md:p-0">
      <button type="button" onClick={() => setViewMonth(shiftMonth(viewMonth, -1))} style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${P.line}`, background: P.surface, cursor: 'pointer', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
        <Icon name="chevronLeft" size={14} color={P.inkSoft} />
      </button>
      <div style={{ fontSize: 15, fontWeight: 600, minWidth: 140, textAlign: 'center' }}>{monthLabel(viewMonth)}</div>
      <button type="button" onClick={() => setViewMonth(shiftMonth(viewMonth, 1))} style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${P.line}`, background: P.surface, cursor: 'pointer', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
        <Icon name="chevronRight" size={14} color={P.inkSoft} />
      </button>
      {viewMonth !== currentMonthYear() && (
        <Btn onClick={() => setViewMonth(currentMonthYear())}>Today</Btn>
      )}
    </div>
  )

  if (convexMessages === undefined || convexGroups === undefined) {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        {monthNav}
        <div className="hidden md:block">
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 280px', gap: 14 }}>
            <Card style={{ padding: 14, minWidth: 0 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
                {Array.from({ length: 7 }, (_, i) => <Skeleton key={i} height={12} style={{ margin: '6px 2px' }} />)}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
                {Array.from({ length: 35 }, (_, i) => <Skeleton key={i} height={76} style={{ borderRadius: 0 }} />)}
              </div>
            </Card>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Card style={{ padding: 14 }}>
                <Skeleton height={10} width={80} />
                <Skeleton height={18} style={{ marginTop: 8 }} />
                <Skeleton height={12} style={{ marginTop: 6 }} />
                <Skeleton height={12} width="70%" style={{ marginTop: 4 }} />
              </Card>
              <Card style={{ padding: 14 }}>
                <Skeleton height={10} width={100} />
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 10 }}>
                    <Skeleton height={10} width={70} />
                    <Skeleton height={6} style={{ flex: 1 }} />
                    <Skeleton height={10} width={20} />
                  </div>
                ))}
              </Card>
            </div>
          </div>
        </div>
        <div className="md:hidden" style={{ padding: '0 16px 16px' }}>
          <Card style={{ overflow: 'hidden', padding: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
              {Array.from({ length: 35 }, (_, i) => <Skeleton key={i} height={40} style={{ borderRadius: 0 }} />)}
            </div>
          </Card>
          <Card style={{ padding: 14, marginTop: 14 }}>
            <Skeleton height={10} width={80} />
            <Skeleton height={18} style={{ marginTop: 8 }} />
            <Skeleton height={12} style={{ marginTop: 6 }} />
          </Card>
        </div>
      </motion.div>
    )
  }

  const convexDayMap = new Map(convexMessages.map((m) => [parseInt(m.date.slice(8, 10)), convexMsgToDay(m)]))
  const days: DevotionalDay[] = Array.from({ length: 31 }, (_, i) => {
    const d = i + 1
    return convexDayMap.get(d) ?? { d, title: '', verse: '', ref: '', body: [], prayer: [], resolve: '', status: 'upcoming' as DayStatus }
  })

  const groups: WhatsAppGroup[] = convexGroups.map((g) => ({
    id: g._id as string,
    name: g.name,
    active: g.isActive,
    groupId: g.whatsappId,
  }))
  const displayGroups = groups

  const grid = calendarGrid(viewMonth)
  const sel = days[selectedDay - 1]
  const activeGroups = displayGroups.filter((g) => g.active)

  const realDays = days.filter((d) => d.title !== '')
  const sentCount = realDays.filter((d) => d.status === 'sent').length
  const todayCount = realDays.filter((d) => d.status === 'today').length
  const upcomingCount = realDays.filter((d) => d.status === 'upcoming').length

  const handleConfirmSend = async () => {
    if (!manualSendDay) return
    const waServerUrl = import.meta.env.VITE_WA_SERVER_URL as string | undefined
    const convexActiveGroups = convexGroups?.filter((g) => g.isActive) ?? []
    const convexMsg = convexMessages?.find((m) => parseInt(m.date.slice(8, 10)) === manualSendDay) ?? null

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
      {monthNav}
      {/* Desktop */}
      <div className="hidden md:block">
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 280px', gap: 14 }}>
          <Card style={{ padding: 14, minWidth: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
              {DOW_DESKTOP.map(d => (
                <div key={d} style={{ padding: '6px 10px 8px', fontSize: 10, color: P.inkSoft, letterSpacing: 1, fontWeight: 600, fontFamily: P.mono, borderBottom: `1px solid ${P.lineSoft}` }}>{d}</div>
              ))}
              {grid.map((d, i) => d === null
                ? <div key={i} style={{ minHeight: 76, background: P.bgSoft, borderRight: i % 7 < 6 ? `1px solid ${P.lineSoft}` : 'none', borderBottom: `1px solid ${P.lineSoft}` }} />
                : <CalCellDesktop key={i} day={d} data={days[d - 1]} selected={selectedDay === d} idx={i} calendarStyle={calendarStyle} onClick={() => setSelectedDay(d)} />
              )}
            </div>
          </Card>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Card style={{ padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <Tag
                  bg={sel.status === 'today' ? P.sunTint : sel.status === 'sent' ? P.sageTint : P.surfaceAlt}
                  color={sel.status === 'today' ? P.sun : sel.status === 'sent' ? P.sage : P.inkSoft}
                >
                  {sel.status === 'today' ? `TODAY · ${String(sel.d).padStart(2, '0')}/${viewMonth.slice(5, 7)}` : `DAY ${sel.d}`}
                </Tag>
                <span style={{ fontFamily: P.mono, fontSize: 11, color: P.inkSoft }}>02:00 GMT</span>
              </div>
              {sel.title ? (
                <>
                  <div style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.25 }}>{sel.title}</div>
                  <div style={{ fontFamily: P.mono, fontSize: 11, color: P.inkSoft, marginTop: 4 }}>{sel.ref}</div>
                  <div style={{ fontSize: 12, color: P.inkSoft, marginTop: 8, lineHeight: 1.5, fontStyle: 'italic' }}>"{sel.verse}"</div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
                    <Btn onClick={() => navigate(`/messages/${sel.d}`)} style={{ flex: 1, justifyContent: 'center' }}>Preview</Btn>
                    {sel.status !== 'sent' && (
                      <Btn variant="primary" onClick={() => setManualSendDay(sel.d)} style={{ flex: 1, justifyContent: 'center' }}>Send now</Btn>
                    )}
                  </div>
                </>
              ) : (
                <div style={{ fontSize: 13, color: P.inkSoft, marginTop: 8 }}>No devotional for Day {sel.d}</div>
              )}
            </Card>

            <Card style={{ padding: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: P.inkSoft, letterSpacing: 1, marginBottom: 10 }}>DISTRIBUTION</div>
              {[
                { label: 'Sent', n: sentCount, color: P.sage },
                { label: 'Today', n: todayCount, color: P.sun },
                { label: 'Upcoming', n: upcomingCount, color: P.inkFaint },
              ].map(row => (
                <div key={row.label} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 30px', alignItems: 'center', gap: 8, padding: '5px 0' }}>
                  <div style={{ fontSize: 12 }}>{row.label}</div>
                  <div style={{ height: 6, background: P.surfaceAlt, borderRadius: 3 }}>
                    <div style={{ width: `${(row.n / 31) * 100}%`, height: '100%', background: row.color, borderRadius: 3 }} />
                  </div>
                  <div style={{ fontFamily: P.mono, fontSize: 11, color: P.inkSoft, textAlign: 'right' }}>{row.n}</div>
                </div>
              ))}
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden" style={{ padding: '0 16px 16px' }}>
        <Card style={{ overflow: 'hidden', padding: 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: `1px solid ${P.lineSoft}` }}>
            {DOW_MOBILE.map((d, i) => (
              <div key={i} style={{ padding: '8px 0', fontSize: 10, color: P.inkSoft, letterSpacing: 1, fontWeight: 600, fontFamily: P.mono, textAlign: 'center' }}>{d}</div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {grid.map((d, i) => d === null
              ? <div key={i} style={{ aspectRatio: '1/1', background: P.bgSoft, borderRight: i % 7 < 6 ? `1px solid ${P.lineSoft}` : 'none', borderBottom: `1px solid ${P.lineSoft}` }} />
              : <CalCellMobile key={i} day={d} data={days[d - 1]} selected={selectedDay === d} idx={i} calendarStyle={calendarStyle} onClick={() => setSelectedDay(d)} />
            )}
          </div>
        </Card>

        <Card style={{ padding: 14, marginTop: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <Tag
              bg={sel.status === 'today' ? P.sunTint : sel.status === 'sent' ? P.sageTint : P.surfaceAlt}
              color={sel.status === 'today' ? P.sun : sel.status === 'sent' ? P.sage : P.inkSoft}
            >
              {sel.status === 'today' ? `TODAY · DAY ${sel.d}` : `DAY ${sel.d} · ${sel.status.toUpperCase()}`}
            </Tag>
            <span style={{ fontSize: 10.5, color: P.inkSoft, fontFamily: P.mono }}>{dowShortOfDate(`${viewMonth}-${String(sel.d).padStart(2, '0')}`).toUpperCase()} · 02:00 GMT</span>
          </div>
          {sel.title ? (
            <>
              <div style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.25 }}>{sel.title}</div>
              <div style={{ fontSize: 11, color: P.inkSoft, fontFamily: P.mono, marginTop: 4 }}>{sel.ref}</div>
              <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
                <Btn onClick={() => navigate(`/messages/${sel.d}`)} style={{ flex: 1, justifyContent: 'center' }}>Preview</Btn>
                {sel.status !== 'sent' && (
                  <Btn variant="primary" onClick={() => setManualSendDay(sel.d)} style={{ flex: 1, justifyContent: 'center' }}>
                    <Icon name="send" size={12} color="#FFF" /> Send
                  </Btn>
                )}
              </div>
            </>
          ) : (
            <div style={{ fontSize: 13, color: P.inkSoft, marginTop: 8 }}>No devotional for Day {sel.d}</div>
          )}
        </Card>
      </div>

      <ManualSendModal
        open={!!manualSendDay && !!days[(manualSendDay ?? 1) - 1]?.title}
        day={days[(manualSendDay ?? 1) - 1]}
        groups={displayGroups}
        onConfirm={() => { void handleConfirmSend() }}
        onClose={() => setManualSendDay(null)}
      />
    </motion.div>
  )
}
