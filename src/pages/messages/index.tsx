import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import { P } from '@/lib/tokens'
import { Card } from '@/components/ui/card'
import { Tag } from '@/components/ui/tag'
import { Btn } from '@/components/ui/btn'
import { Icon } from '@/lib/icons'
import { WhatsAppBubble } from '@/components/whatsapp-bubble'
import { ManualSendModal } from '@/components/manual-send-modal'
import { MessageEditForm } from './components/message-edit-form'
import { useAppStore } from '@/store/app-store'
import { useShallow } from 'zustand/react/shallow'
import { Skeleton } from '@/components/ui/skeleton'
import { dowShortOfDate, ordinal, monthName } from '@/lib/utils'
import { renderMessage } from '../../../convex/lib/renderMessage'
import { DEFAULT_TEMPLATE_CONFIG } from '../../../convex/lib/templateConfig'
import type { DevotionalDay, DayStatus } from '@/store/app-store'
import { SEND_TIME_LABEL } from '@/lib/broadcast-time'

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

export function MessagesPage() {
  const { day: dayParam } = useParams<{ day?: string }>()
  const navigate = useNavigate()
  const { setToast, viewMonth } = useAppStore(
    useShallow((s) => ({ setToast: s.setToast, viewMonth: s.viewMonth }))
  )
  const [isEdit, setIsEdit] = useState(false)
  const [pendingEdit, setPendingEdit] = useState<DevotionalDay | null>(null)
  const [manualSendDay, setManualSendDay] = useState<number | null>(null)

  const dayNum = dayParam ? parseInt(dayParam) : new Date().getDate()
  const date = `${viewMonth}-${String(dayNum).padStart(2, '0')}`

  const convexMsg = useQuery(api.messageQueries.getByDate, { date })
  const convexGroups = useQuery(api.groups.listActive)
  const activeTemplate = useQuery(api.templates.getActive)
  const updateMessageMut = useMutation(api.messageQueries.updateMessage)
  const manualSendLogMut = useMutation(api.messageQueries.manualSend)
  const updateStatusMut = useMutation(api.messageQueries.updateStatus)

  const goDay = (d: number) => {
    if (d < 1 || d > 31) return
    setPendingEdit(null)
    setIsEdit(false)
    navigate(`/messages/${d}`)
  }

  const displayGroups = (convexGroups ?? []).map((g) => ({
    id: g._id as string,
    name: g.name,
    active: g.isActive,
    groupId: g.whatsappId,
  }))

  if (convexMsg === undefined || convexGroups === undefined) {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="hidden md:block">
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 340px', gap: 14 }}>
            <Card style={{ padding: 18, minWidth: 0 }}>
              <Skeleton height={12} width={220} />
              <Skeleton height={26} width="65%" style={{ marginTop: 14 }} />
              <Skeleton height={11} width={130} style={{ marginTop: 8 }} />
              <Skeleton height={13} style={{ marginTop: 10 }} />
              <Skeleton height={13} style={{ marginTop: 6 }} />
              <Skeleton height={13} width="85%" style={{ marginTop: 6 }} />
              <Skeleton height={11} width={110} style={{ marginTop: 18 }} />
              <Skeleton height={13} style={{ marginTop: 8 }} />
              <Skeleton height={13} style={{ marginTop: 6 }} />
            </Card>
            <div>
              <Skeleton height={11} width={140} style={{ marginBottom: 10 }} />
              <Card style={{ padding: 14 }}><Skeleton height={200} style={{ borderRadius: 8 }} /></Card>
            </div>
          </div>
        </div>
        <div className="md:hidden">
          <div style={{ padding: '0 14px' }}><Skeleton height={240} style={{ borderRadius: 12 }} /></div>
          <div style={{ display: 'flex', gap: 8, padding: '14px 16px 0' }}>
            <Skeleton height={22} width={80} style={{ borderRadius: 20 }} />
            <Skeleton height={22} width={70} style={{ borderRadius: 20 }} />
          </div>
        </div>
      </motion.div>
    )
  }

  // No message for this day
  if (!convexMsg) {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Card style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>No devotional for Day {dayNum}</div>
          <div style={{ fontSize: 13, color: P.inkSoft, marginBottom: 18 }}>Upload a PDF first, or choose another day.</div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <Btn onClick={() => goDay(dayNum - 1)} disabled={dayNum <= 1}><Icon name="chevronLeft" size={12} /> Previous</Btn>
            <Btn onClick={() => navigate('/upload')}><Icon name="upload" size={12} /> Upload PDF</Btn>
            <Btn onClick={() => goDay(dayNum + 1)} disabled={dayNum >= 31}>Next <Icon name="chevronRight" size={12} /></Btn>
          </div>
        </Card>
      </motion.div>
    )
  }

  // From here: convexMsg is non-null, day is valid
  const day: DevotionalDay = convexMsgToDay(convexMsg)

  const cancelEdit = () => { setPendingEdit(null); setIsEdit(false) }

  const startEdit = () => {
    setPendingEdit({ ...day, body: [...day.body], prayer: [...day.prayer] })
    setIsEdit(true)
  }

  const saveEdit = async () => {
    if (!pendingEdit) return
    const newFormatted = renderMessage({
      date: convexMsg.date,
      title: pendingEdit.title,
      scripture: pendingEdit.verse,
      scriptureReference: pendingEdit.ref,
      body: pendingEdit.body.join('\n\n'),
      prayerPoints: pendingEdit.prayer,
    }, activeTemplate?.config ?? DEFAULT_TEMPLATE_CONFIG)
    await updateMessageMut({
      id: convexMsg._id as Id<'messages'>,
      title: pendingEdit.title,
      scripture: pendingEdit.verse,
      scriptureReference: pendingEdit.ref,
      body: pendingEdit.body.join('\n\n'),
      prayerPoints: pendingEdit.prayer,
      formattedMessage: newFormatted,
    })
    setIsEdit(false)
    setPendingEdit(null)
    setToast('Changes saved')
  }

  const handleConfirmSend = async () => {
    if (!manualSendDay) return
    const waServerUrl = import.meta.env.VITE_WA_SERVER_URL as string | undefined
    const convexActiveGroups = convexGroups.filter((g) => g.isActive)

    if (waServerUrl && convexActiveGroups.length > 0) {
      const errors: string[] = []
      for (const group of convexActiveGroups) {
        try {
          const res = await fetch(`${waServerUrl}/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ groupId: group.whatsappId, message: convexMsg.formattedMessage }),
          })
          const json = (await res.json()) as { success: boolean; error?: string }
          if (!json.success) errors.push(`${group.name}: ${json.error ?? 'send failed'}`)
          await manualSendLogMut({
            messageId: convexMsg._id as Id<'messages'>,
            groupId: group._id as Id<'groups'>,
            status: json.success ? 'success' : 'failed',
            error: json.success ? undefined : (json.error ?? 'send failed'),
          })
        } catch (err) {
          errors.push(`${group.name}: ${String(err)}`)
          await manualSendLogMut({
            messageId: convexMsg._id as Id<'messages'>,
            groupId: group._id as Id<'groups'>,
            status: 'failed',
            error: String(err),
          })
        }
      }
      await updateStatusMut({ id: convexMsg._id as Id<'messages'>, status: 'sent' })
      setManualSendDay(null)
      setToast(errors.length > 0 ? `Send failed: ${errors[0]}` : 'Broadcast sent to active groups')
      return
    }

    setManualSendDay(null)
    setToast('Broadcast sent to active groups')
  }

  const editDay = pendingEdit ?? day
  const previewText = isEdit
    ? renderMessage({
        date: convexMsg.date,
        title: editDay.title,
        scripture: editDay.verse,
        scriptureReference: editDay.ref,
        body: editDay.body.join('\n\n'),
        prayerPoints: editDay.prayer,
      }, activeTemplate?.config ?? DEFAULT_TEMPLATE_CONFIG)
    : convexMsg.formattedMessage

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      {/* Desktop */}
      <div className="hidden md:block">
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 340px', gap: 14, minWidth: 0 }}>
          <Card style={{ padding: 18, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
              <button type="button" onClick={() => goDay(dayNum - 1)} disabled={dayNum <= 1} style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${P.line}`, background: P.surface, cursor: dayNum <= 1 ? 'default' : 'pointer', display: 'grid', placeItems: 'center', opacity: dayNum <= 1 ? 0.35 : 1, flexShrink: 0 }}>
                <Icon name="chevronLeft" size={13} color={P.inkSoft} />
              </button>
              <button type="button" onClick={() => goDay(dayNum + 1)} disabled={dayNum >= 31} style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${P.line}`, background: P.surface, cursor: dayNum >= 31 ? 'default' : 'pointer', display: 'grid', placeItems: 'center', opacity: dayNum >= 31 ? 0.35 : 1, flexShrink: 0 }}>
                <Icon name="chevronRight" size={13} color={P.inkSoft} />
              </button>
              <Tag
                bg={day.status === 'today' ? P.sunTint : day.status === 'sent' ? P.sageTint : P.surfaceAlt}
                color={day.status === 'today' ? P.sun : day.status === 'sent' ? P.sage : P.inkSoft}
              >
                DAY {day.d} · {day.status.toUpperCase()}
              </Tag>
              <Tag bg={P.surfaceAlt} color={P.inkSoft}>{dowShortOfDate(convexMsg.date).toUpperCase()} · {ordinal(day.d).toUpperCase()} {monthName(Number(convexMsg.date.slice(5, 7))).toUpperCase()} {convexMsg.date.slice(0, 4)}</Tag>
              <Tag bg={P.surfaceAlt} color={P.inkSoft}>{SEND_TIME_LABEL}</Tag>
              <div style={{ flex: 1 }} />
              {!isEdit ? (
                <Btn onClick={startEdit}><Icon name="pencil" size={12} /> Edit message</Btn>
              ) : (
                <>
                  <Btn onClick={cancelEdit}>Cancel</Btn>
                  <Btn variant="primary" onClick={() => { void saveEdit() }}>Save changes</Btn>
                </>
              )}
              {!isEdit && (
                <Btn variant="primary" onClick={() => setManualSendDay(day.d)} style={{ background: P.ink, borderColor: P.ink }}>
                  <Icon name="send" size={12} color="#FFF" /> {day.status === 'sent' ? 'Resend' : 'Send now'}
                </Btn>
              )}
            </div>

            {isEdit ? (
              <MessageEditForm day={editDay} onChange={setPendingEdit} onSave={() => { void saveEdit() }} onCancel={cancelEdit} />
            ) : (
              <div style={{ fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{previewText}</div>
            )}
          </Card>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: P.inkSoft, letterSpacing: 1 }}>WHATSAPP PREVIEW</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: P.sage }}>
                <span style={{ width: 6, height: 6, borderRadius: 99, background: P.sage, boxShadow: `0 0 0 3px ${P.sageTint}` }} /> live
              </div>
            </div>
            <WhatsAppBubble text={previewText} size="sm" />
          </div>
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden">
        {isEdit ? (
          <MessageEditForm day={editDay} onChange={setPendingEdit} onSave={() => { void saveEdit() }} onCancel={cancelEdit} mobile />
        ) : (
          <>
            <div style={{ display: 'flex', gap: 8, padding: '12px 16px' }}>
              <Btn onClick={startEdit} style={{ flex: 1, justifyContent: 'center' }}>
                <Icon name="pencil" size={13} /> Edit
              </Btn>
              <Btn variant="primary" onClick={() => setManualSendDay(day.d)} style={{ flex: 1.4, justifyContent: 'center' }}>
                <Icon name="send" size={13} color="#FFF" /> {day.status === 'sent' ? 'Resend' : `Send to ${displayGroups.length} groups`}
              </Btn>
            </div>
            <div style={{ display: 'flex', gap: 8, padding: '0 16px 12px' }}>
              <button type="button" onClick={() => goDay(dayNum - 1)} disabled={dayNum <= 1} style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: `1px solid ${P.line}`, background: P.surface, cursor: dayNum <= 1 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: P.inkSoft, opacity: dayNum <= 1 ? 0.35 : 1, fontFamily: P.sans }}>
                <Icon name="chevronLeft" size={13} color={P.inkSoft} /> Day {dayNum - 1}
              </button>
              <button type="button" onClick={() => goDay(dayNum + 1)} disabled={dayNum >= 31} style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: `1px solid ${P.line}`, background: P.surface, cursor: dayNum >= 31 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: P.inkSoft, opacity: dayNum >= 31 ? 0.35 : 1, fontFamily: P.sans }}>
                Day {dayNum + 1} <Icon name="chevronRight" size={13} color={P.inkSoft} />
              </button>
            </div>
            <div style={{ padding: '0 16px 12px', fontSize: 11, color: P.inkSoft, textAlign: 'center', fontFamily: P.mono }}>
              {day.status === 'sent'
                ? 'sent · see history'
                : `scheduled · auto-broadcast ${SEND_TIME_LABEL}`}
            </div>
            <div style={{ padding: '0 14px' }}>
              <WhatsAppBubble text={previewText} size="sm" />
            </div>
            <div style={{ display: 'flex', gap: 8, padding: '14px 16px 28px' }}>
              <Tag bg={P.surfaceAlt} color={P.inkSoft}>{day.body.reduce((s, p) => s + p.length, 0)} chars</Tag>
              <Tag bg={day.edited ? P.sunTint : P.sageTint} color={day.edited ? P.sun : P.sage}>
                {day.edited ? 'edited' : 'unchanged'}
              </Tag>
              <Tag bg={P.sageTint} color={P.sage}>auto-format ON</Tag>
            </div>
          </>
        )}
      </div>

      <ManualSendModal
        open={!!manualSendDay}
        day={day}
        groups={displayGroups}
        onConfirm={() => { void handleConfirmSend() }}
        onClose={() => setManualSendDay(null)}
      />
    </motion.div>
  )
}
