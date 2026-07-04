import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { P } from '@/lib/tokens'
import { Card } from '@/components/ui/card'
import { Btn } from '@/components/ui/btn'
import { Icon } from '@/lib/icons'
import { Tag } from '@/components/ui/tag'
import { useAppStore } from '@/store/app-store'
import { useShallow } from 'zustand/react/shallow'
import { Skeleton } from '@/components/ui/skeleton'
import { monthName } from '@/lib/utils'
import { UploadDropzone } from './components/upload-dropzone'
import { UploadDayGrid, UploadDayList, UploadDayPreview, UploadMobileDayGrid } from './components/upload-preview'
import type { DevotionalDay, DayStatus } from '@/store/app-store'

function monthYearLabel(monthYear: string): string {
  return `${monthName(Number(monthYear.slice(5, 7)))} ${monthYear.slice(0, 4)}`
}

interface ImportedMonth {
  monthYear: string
  fileName: string
  daysDetected: number
  uploadedAt: number
  status: string
}

function ImportsListView({ uploads, loading, currentMonthYear, viewMonth, onSelect, onClose }: {
  uploads: ImportedMonth[]
  loading: boolean
  currentMonthYear: string
  viewMonth: string
  onSelect: (monthYear: string) => void
  onClose: () => void
}) {
  return (
    <div style={{ padding: '0 16px 16px' }} className="md:p-0">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <button type="button" onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${P.line}`, background: P.surface, cursor: 'pointer', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
          <Icon name="chevronLeft" size={14} color={P.inkSoft} />
        </button>
        <div style={{ fontSize: 15, fontWeight: 600 }}>All imports</div>
      </div>

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {Array.from({ length: 3 }, (_, i) => (
            <Card key={i} style={{ padding: 14 }}><Skeleton height={13} width="40%" /><Skeleton height={11} width="60%" style={{ marginTop: 8 }} /></Card>
          ))}
        </div>
      )}

      {!loading && uploads.length === 0 && (
        <Card style={{ padding: 30, textAlign: 'center', fontSize: 13, color: P.inkSoft, background: P.bgSoft, border: `1px dashed ${P.line}` }}>
          No imports yet.
        </Card>
      )}

      {!loading && uploads.map((u) => (
        <Card
          key={u.monthYear}
          onClick={() => onSelect(u.monthYear)}
          style={{
            padding: 14, marginBottom: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12,
            borderColor: u.monthYear === viewMonth ? P.sage : P.line,
            boxShadow: u.monthYear === viewMonth ? `0 0 0 1px ${P.sage}` : 'none',
          }}
        >
          <div style={{ width: 38, height: 48, borderRadius: 5, background: P.sageTint, color: P.sage, display: 'grid', placeItems: 'center', fontFamily: P.mono, fontSize: 10, fontWeight: 700, flexShrink: 0 }}>JSON</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600 }}>{monthYearLabel(u.monthYear)}</div>
              {u.monthYear === currentMonthYear && <Tag bg={P.sunTint} color={P.sun}>CURRENT</Tag>}
              {u.status !== 'complete' && <Tag bg={P.roseTint} color={P.rose}>{u.status.toUpperCase()}</Tag>}
            </div>
            <div style={{ fontSize: 11, color: P.inkSoft, fontFamily: P.mono, marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {u.daysDetected} days · {u.fileName} · {new Date(u.uploadedAt).toLocaleDateString()}
            </div>
          </div>
          <Icon name="chevronRight" size={14} color={P.inkFaint} />
        </Card>
      ))}
    </div>
  )
}

const KNOWN_DAY_FIELDS = new Set([
  'date', 'title', 'subtitle', 'scripture', 'scriptureReference', 'body', 'prayerPoints', 'prayerLabel', 'otherSections',
])

function convexMsgToDay(msg: {
  _id: string
  date: string
  title: string
  scripture: string
  scriptureReference: string
  body: string
  prayerPoints: string[]
  prayerLabel?: string
  otherSections?: { label: string; content: string }[]
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
    otherSections: msg.otherSections,
    resolve: '',
    status,
  }
}

export function UploadPage() {
  const { setToast, viewMonth, setViewMonth } = useAppStore(
    useShallow((s) => ({ setToast: s.setToast, viewMonth: s.viewMonth, setViewMonth: s.setViewMonth }))
  )
  const jsonInputRef = useRef<HTMLInputElement>(null)
  const [importingJson, setImportingJson] = useState(false)
  const [selectedDay, setSelectedDay] = useState(new Date().getDate())
  const [showAllImports, setShowAllImports] = useState(false)

  const startImport = useMutation(api.importOps.startImport)
  const startReformat = useMutation(api.reformatOps.startReformat)
  const uploads = useQuery(api.uploadOps.listUploads)
  const convexMessages = useQuery(api.messageQueries.listByMonth, { monthYear: viewMonth })

  if (convexMessages === undefined) {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="hidden md:block">
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.1fr) minmax(0,1fr)', gap: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
              <Card style={{ padding: 14 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <Skeleton height={48} width={38} style={{ borderRadius: 5 }} />
                  <div style={{ flex: 1 }}><Skeleton height={13} /><Skeleton height={11} width="60%" style={{ marginTop: 6 }} /></div>
                </div>
              </Card>
              <Card style={{ padding: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
                  {Array.from({ length: 31 }, (_, i) => <Skeleton key={i} height={44} style={{ borderRadius: 6 }} />)}
                </div>
              </Card>
            </div>
            <Card style={{ padding: 14 }}>
              <Skeleton height={12} width={100} />
              <Skeleton height={22} style={{ marginTop: 12 }} />
              <Skeleton height={12} width={120} style={{ marginTop: 8 }} />
              <Skeleton height={13} style={{ marginTop: 14 }} />
              <Skeleton height={13} style={{ marginTop: 6 }} />
              <Skeleton height={13} width="80%" style={{ marginTop: 6 }} />
            </Card>
          </div>
        </div>
        <div className="md:hidden" style={{ padding: '0 16px 16px' }}>
          <Card style={{ padding: 14, display: 'flex', gap: 12, alignItems: 'center' }}>
            <Skeleton height={46} width={36} style={{ borderRadius: 5 }} />
            <div style={{ flex: 1 }}><Skeleton height={12} /><Skeleton height={10} width="50%" style={{ marginTop: 6 }} /></div>
          </Card>
          <Card style={{ padding: 10, marginTop: 10 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
              {Array.from({ length: 28 }, (_, i) => <Skeleton key={i} height={36} style={{ borderRadius: 5 }} />)}
            </div>
          </Card>
        </div>
      </motion.div>
    )
  }

  const days: DevotionalDay[] = convexMessages.map(convexMsgToDay)
  const isLoaded = days.length > 0

  const handleReformat = async () => {
    try {
      const result = await startReformat({ monthYear: viewMonth })
      setToast(`Reformatted ${result.reformatted} days with the active template`)
    } catch (err) {
      setToast('Re-format failed: ' + String(err))
    }
  }

  const previewDay = days[selectedDay - 1] ?? days[0]

  // `listUploads` is already ordered most-recent-first, so keeping the
  // first occurrence per month gives the latest import for that month —
  // re-imports of the same month collapse into one row instead of showing
  // duplicates.
  const importedMonths: ImportedMonth[] = []
  const seenMonths = new Set<string>()
  for (const u of uploads ?? []) {
    if (seenMonths.has(u.monthYear)) continue
    seenMonths.add(u.monthYear)
    importedMonths.push({ monthYear: u.monthYear, fileName: u.fileName, daysDetected: u.daysDetected, uploadedAt: u.uploadedAt, status: u.status })
  }
  const realCurrentMonthYear = new Date().toISOString().slice(0, 7)

  const onJsonPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    e.target.value = ''
    setImportingJson(true)

    try {
      const text = await f.text()
      const parsed = JSON.parse(text) as {
        monthYear?: string
        days?: Array<{
          date: string
          title: string
          subtitle?: string
          scripture: string
          scriptureReference: string
          body: string
          prayerPoints: string[]
          prayerLabel?: string
          otherSections?: Array<{ label: string; content: string }>
        }>
      }

      if (typeof parsed.monthYear !== 'string' || !Array.isArray(parsed.days) || parsed.days.length === 0) {
        throw new Error('Expected { monthYear: string, days: [...] }')
      }
      const unknownFields = new Set<string>()
      for (const d of parsed.days) {
        if (!d.date || !d.title || !d.body || !Array.isArray(d.prayerPoints)) {
          throw new Error(`Day ${d.date ?? '?'} is missing required fields`)
        }
        for (const key of Object.keys(d)) {
          if (!KNOWN_DAY_FIELDS.has(key)) unknownFields.add(key)
        }
      }

      const result = await startImport({
        monthYear: parsed.monthYear,
        fileName: f.name,
        days: parsed.days.map((d) => ({
          date: d.date,
          title: d.title,
          subtitle: d.subtitle,
          scripture: d.scripture,
          scriptureReference: d.scriptureReference,
          body: d.body,
          prayerPoints: d.prayerPoints,
          prayerLabel: d.prayerLabel,
          otherSections: d.otherSections,
        })),
      })

      setImportingJson(false)
      setViewMonth(parsed.monthYear)
      const ignoredNote = unknownFields.size > 0 ? ` (ignored unsupported field${unknownFields.size > 1 ? 's' : ''}: ${[...unknownFields].join(', ')})` : ''
      setToast(`Imported ${result.imported} days from ${f.name}${ignoredNote}`)
    } catch (err) {
      setImportingJson(false)
      setToast('Import failed: ' + String(err))
    }
  }

  if (showAllImports) {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <ImportsListView
          uploads={importedMonths}
          loading={uploads === undefined}
          currentMonthYear={realCurrentMonthYear}
          viewMonth={viewMonth}
          onSelect={(monthYear) => { setViewMonth(monthYear); setShowAllImports(false) }}
          onClose={() => setShowAllImports(false)}
        />
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      {/* Desktop */}
      <div className="hidden md:block">
        <AnimatePresence mode="wait">
          {isLoaded ? (
            <motion.div key="loaded" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.1fr) minmax(0,1fr)', gap: 14 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
                  <Card style={{ padding: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 38, height: 48, borderRadius: 5, background: P.sageTint, color: P.sage, display: 'grid', placeItems: 'center', fontFamily: P.mono, fontSize: 10, fontWeight: 700 }}>JSON</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>Devotionals loaded</div>
                        <div style={{ fontSize: 11, color: P.inkSoft, fontFamily: P.mono, marginTop: 3 }}>{days.length} days · {viewMonth}</div>
                      </div>
                      <Btn onClick={() => setShowAllImports(true)} title="Browse every imported month"><Icon name="history" size={12} /> All imports</Btn>
                      <Btn onClick={handleReformat} title="Re-run formatting with the currently active template"><Icon name="flash" size={12} /> Re-format</Btn>
                      <Btn onClick={() => jsonInputRef.current?.click()} disabled={importingJson} style={{ borderStyle: 'dashed', color: P.sage }}>
                        {importingJson ? 'Importing…' : 'Import new'}
                      </Btn>
                    </div>
                  </Card>

                  <UploadDayGrid days={days} selectedDay={selectedDay} onSelectDay={setSelectedDay} />
                  <UploadDayList days={days} />
                </div>

                <UploadDayPreview day={previewDay} />
              </div>
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <UploadDropzone onPickJson={() => jsonInputRef.current?.click()} jsonImporting={importingJson} viewport="desktop" />
              {importedMonths.length > 0 && (
                <div style={{ textAlign: 'center', marginTop: 12 }}>
                  <button type="button" onClick={() => setShowAllImports(true)} style={{ fontSize: 12, color: P.sage, fontWeight: 600, background: 'transparent', border: 'none', cursor: 'pointer' }}>
                    View {importedMonths.length} previously imported month{importedMonths.length > 1 ? 's' : ''} →
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile */}
      <div className="md:hidden" style={{ padding: '0 16px 16px' }}>
        <AnimatePresence mode="wait">
          {isLoaded ? (
            <motion.div key="loaded" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Card style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 46, borderRadius: 5, background: P.sageTint, color: P.sage, display: 'grid', placeItems: 'center', fontFamily: P.mono, fontSize: 10, fontWeight: 700 }}>JSON</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600 }}>{days.length} days loaded</div>
                  <div style={{ fontSize: 10.5, color: P.inkSoft, fontFamily: P.mono, marginTop: 3 }}>{viewMonth}</div>
                </div>
                <button type="button" onClick={() => setShowAllImports(true)} title="Browse every imported month" style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${P.line}`, background: P.surface, cursor: 'pointer', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <Icon name="history" size={14} color={P.inkSoft} />
                </button>
              </Card>

              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <Btn onClick={handleReformat} style={{ flex: 1, justifyContent: 'center' }} title="Re-run formatting with the currently active template"><Icon name="flash" size={12} /> Re-format</Btn>
                <Btn onClick={() => jsonInputRef.current?.click()} disabled={importingJson} style={{ flex: 1, justifyContent: 'center', borderStyle: 'dashed', color: P.sage }}>
                  {importingJson ? 'Importing…' : 'Import new'}
                </Btn>
              </div>

              <UploadMobileDayGrid days={days} />
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <UploadDropzone onPickJson={() => jsonInputRef.current?.click()} jsonImporting={importingJson} viewport="mobile" />
              {importedMonths.length > 0 && (
                <div style={{ textAlign: 'center', marginTop: 12 }}>
                  <button type="button" onClick={() => setShowAllImports(true)} style={{ fontSize: 12, color: P.sage, fontWeight: 600, background: 'transparent', border: 'none', cursor: 'pointer' }}>
                    View {importedMonths.length} previously imported month{importedMonths.length > 1 ? 's' : ''} →
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <input ref={jsonInputRef} type="file" accept="application/json" onChange={onJsonPick} style={{ display: 'none' }} />
    </motion.div>
  )
}
