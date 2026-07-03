import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import { P } from '@/lib/tokens'
import { Card } from '@/components/ui/card'
import { Btn } from '@/components/ui/btn'
import { Tag } from '@/components/ui/tag'
import { Icon } from '@/lib/icons'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore } from '@/store/app-store'
import { renderMessage } from '../../../convex/lib/renderMessage'

const SAMPLE_DAY = {
  date: new Date().toISOString().slice(0, 10),
  title: 'From Zeal To Responsibility',
  scripture: 'Therefore, my beloved, as you have always obeyed, work out your own salvation with fear and trembling.',
  scriptureReference: 'Philippians 2:12-13 (ESV)',
  body: 'This is where your body text will appear.',
  prayerPoints: ['Spend time to pray and examine your walk with God.'],
}

export function TemplatesPage() {
  const navigate = useNavigate()
  const setToast = useAppStore((s: { setToast: (msg: string | null) => void }) => s.setToast)
  const [confirmDelete, setConfirmDelete] = useState<Id<'messageTemplates'> | null>(null)

  const templates = useQuery(api.templates.list)
  const setActiveMut = useMutation(api.templates.setActive)
  const removeMut = useMutation(api.templates.remove)

  const activate = (id: Id<'messageTemplates'>) => {
    setActiveMut({ id })
      .then(() => setToast('Active format updated'))
      .catch((err: unknown) => setToast('Error: ' + String(err)))
  }

  const deleteTemplate = (id: Id<'messageTemplates'>) => {
    removeMut({ id })
      .then(() => { setConfirmDelete(null); setToast('Template removed') })
      .catch((err: unknown) => setToast('Error: ' + String(err)))
  }

  return (
    <>
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} style={{ padding: '0 16px 16px' }} className="md:p-0">
      <div className="hidden md:flex" style={{ alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 600 }}>Format templates</div>
          <div style={{ fontSize: 12, color: P.inkSoft, marginTop: 2 }}>Pick the active one below or in Settings → Broadcast. It's applied instantly on the next upload, import, or re-format — no AI, no waiting.</div>
        </div>
        <Btn variant="primary" onClick={() => navigate('/templates/new')} style={{ flexShrink: 0 }}>
          <Icon name="plus" size={13} color="#FFF" /> New template
        </Btn>
      </div>

      <div className="md:hidden" style={{ fontSize: 12, color: P.inkSoft, marginBottom: 12 }}>
        Pick the active one below. Applied instantly — no AI, no waiting.
      </div>

      {templates === undefined && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(260px, 100%), 1fr))', gap: 12 }}>
          {Array.from({ length: 3 }, (_, i) => (
            <Card key={i} style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Skeleton width={34} height={34} style={{ borderRadius: 8 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Skeleton height={13} width="60%" />
                  <Skeleton height={10} width="35%" style={{ marginTop: 6 }} />
                </div>
              </div>
              <Skeleton height={78} style={{ borderRadius: 7 }} />
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <Skeleton width={70} height={26} style={{ borderRadius: 6 }} />
                <Skeleton width={28} height={28} style={{ borderRadius: 7 }} />
              </div>
            </Card>
          ))}
        </div>
      )}
      {templates !== undefined && templates.length === 0 && (
        <Card style={{ padding: 30, textAlign: 'center', fontSize: 13, color: P.inkSoft, background: P.bgSoft, border: `1px dashed ${P.line}` }}>
          No templates yet. Without one, uploads and imports use the default TOTATeens format.
        </Card>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(260px, 100%), 1fr))', gap: 12 }}>
        {(templates ?? []).map((t) => (
          <Card
            key={t._id}
            onClick={() => navigate(`/templates/${t._id}`)}
            style={{
              padding: 16, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 10,
              borderColor: t.isActive ? P.sage : P.line,
              boxShadow: t.isActive ? `0 0 0 1px ${P.sage}` : 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: t.isActive ? P.sageTint : P.surfaceAlt, color: t.isActive ? P.sage : P.inkSoft, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <Icon name="file" size={16} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</div>
                <div style={{ fontSize: 10.5, color: P.inkFaint, fontFamily: P.mono, marginTop: 1 }}>{new Date(t.createdAt).toLocaleDateString()}</div>
              </div>
              {t.isActive && <Tag bg={P.sageTint} color={P.sage}>ACTIVE</Tag>}
            </div>

            <div style={{
              fontSize: 11, color: P.inkSoft, fontFamily: P.mono, whiteSpace: 'pre-wrap',
              lineHeight: 1.5, background: P.bgSoft, borderRadius: 7, padding: '8px 10px',
              maxHeight: 90, overflow: 'hidden', position: 'relative',
            }}>
              {renderMessage(SAMPLE_DAY, t.config)}
              <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 30, background: `linear-gradient(to bottom, transparent, ${P.bgSoft})` }} />
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              {!t.isActive && (
                <Btn onClick={(e) => { e.stopPropagation(); activate(t._id) }} style={{ color: P.sage, fontSize: 11.5, padding: '6px 10px' }}>Set active</Btn>
              )}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setConfirmDelete(t._id) }}
                disabled={t.isActive}
                title={t.isActive ? 'Set a different template active before deleting this one' : 'Delete template'}
                style={{ width: 28, height: 28, borderRadius: 7, border: `1px solid ${P.line}`, background: P.surface, cursor: t.isActive ? 'not-allowed' : 'pointer', display: 'grid', placeItems: 'center', opacity: t.isActive ? 0.4 : 1, flexShrink: 0 }}
              >
                <Icon name="trash" size={12} color={P.inkFaint} />
              </button>
            </div>
          </Card>
        ))}
      </div>
    </motion.div>

      {confirmDelete && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(14,20,16,0.45)', zIndex: 9500, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          onClick={() => setConfirmDelete(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: P.surface, borderRadius: 12, padding: 22, width: 360, maxWidth: '90%', boxShadow: '0 24px 60px rgba(0,0,0,0.25)' }}
          >
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Remove this template?</div>
            <div style={{ fontSize: 13, color: P.inkSoft, marginBottom: 18 }}>This cannot be undone.</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Btn onClick={() => setConfirmDelete(null)} style={{ flex: 1, justifyContent: 'center' }}>Cancel</Btn>
              <Btn
                variant="primary"
                onClick={() => deleteTemplate(confirmDelete)}
                style={{ flex: 1, justifyContent: 'center', background: P.rose, borderColor: P.rose }}
              >
                Remove
              </Btn>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
