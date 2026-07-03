import { useRef, useState, useEffect } from 'react'
import pdfjsWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { P } from '@/lib/tokens'
import { Card } from '@/components/ui/card'
import { Tag } from '@/components/ui/tag'
import { Btn } from '@/components/ui/btn'
import { Icon } from '@/lib/icons'
import { useAppStore } from '@/store/app-store'
import { useShallow } from 'zustand/react/shallow'
import { Skeleton } from '@/components/ui/skeleton'
import { UploadDropzone } from './components/upload-dropzone'
import { UploadDayGrid, UploadDayList, UploadDayPreview, UploadMobileDayGrid } from './components/upload-preview'
import type { PdfFile } from '@/store/app-store'
import type { DevotionalDay, DayStatus } from '@/store/app-store'

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

export function UploadPage() {
  const { setToast, viewMonth, setViewMonth } = useAppStore(
    useShallow((s) => ({ setToast: s.setToast, viewMonth: s.viewMonth, setViewMonth: s.setViewMonth }))
  )
  const fileInputRef = useRef<HTMLInputElement>(null)
  const jsonInputRef = useRef<HTMLInputElement>(null)
  const [pdfFile, setPdfFile] = useState<PdfFile | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadStage, setUploadStage] = useState<'extracting' | 'uploading' | 'queued' | null>(null)
  const [importingJson, setImportingJson] = useState(false)
  const [selectedDay, setSelectedDay] = useState(new Date().getDate())

  const generateUploadUrl = useMutation(api.uploadOps.generateUploadUrl)
  const storeFileAndParse = useMutation(api.uploadOps.storeFileAndParse)
  const resetStuckUpload = useMutation(api.uploadOps.resetStuckUpload)
  const startImport = useMutation(api.importOps.startImport)
  const startReformat = useMutation(api.reformatOps.startReformat)
  const latestUpload = useQuery(api.uploadOps.getLatestUpload, { monthYear: viewMonth })
  const convexMessages = useQuery(api.messageQueries.listByMonth, { monthYear: viewMonth })
  const [parsingSeconds, setParsingSeconds] = useState(0)
  const uploadedInSessionRef = useRef(false)
  const [cachedUploadArgs, setCachedUploadArgs] = useState<{ storageId: string; fileName: string; rawText: string } | null>(null)

  const failed = latestUpload?.status === 'failed'
  const isProcessing = !failed && (latestUpload?.status === 'processing' || uploading)

  useEffect(() => {
    if (failed && uploadedInSessionRef.current) {
      uploadedInSessionRef.current = false
      setPdfFile(null)
      setUploadStage(null)
      setToast('PDF parsing failed — please try again')
    }
  }, [failed])

  useEffect(() => {
    if (!isProcessing) { setParsingSeconds(0); return }
    const t = setInterval(() => setParsingSeconds((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [isProcessing])

  if (convexMessages === undefined || latestUpload === undefined) {
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

  const days: DevotionalDay[] =
    convexMessages.length > 0
      ? convexMessages.map(convexMsgToDay)
      : []

  const isComplete = latestUpload?.status === 'complete'
  const parsing = uploading || (!failed && !isComplete && (latestUpload?.status === 'processing' || (pdfFile !== null && days.length === 0)))

  const handleReformat = async () => {
    try {
      const result = await startReformat({ monthYear: viewMonth })
      setToast(`Reformatted ${result.reformatted} days with the active template`)
    } catch (err) {
      setToast('Re-format failed: ' + String(err))
    }
  }

  const handleCancelParse = async () => {
    await resetStuckUpload({ monthYear: viewMonth })
    setPdfFile(null)
    setUploadStage(null)
    setParsingSeconds(0)
    setToast('Parsing cancelled — try uploading again')
  }

  const handleRetry = async () => {
    if (!cachedUploadArgs) return
    uploadedInSessionRef.current = true
    setUploading(true)
    setUploadStage('queued')
    try {
      await storeFileAndParse({
        storageId: cachedUploadArgs.storageId as Parameters<typeof storeFileAndParse>[0]['storageId'],
        fileName: cachedUploadArgs.fileName,
        monthYear: viewMonth,
        rawText: cachedUploadArgs.rawText,
      })
      setUploading(false)
      setUploadStage(null)
    } catch (err) {
      setUploading(false)
      setUploadStage(null)
      setToast('Retry failed: ' + String(err))
    }
  }

  const previewDay = days[selectedDay - 1] ?? days[0]

  const onFilePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    e.target.value = ''
    setUploading(true)
    setUploadStage('extracting')
    setPdfFile(null)
    uploadedInSessionRef.current = true

    try {
      const arrayBuffer = await f.arrayBuffer()
      const pdfjsLib = await import('pdfjs-dist')
      pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl
      const pdfDoc = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise
      console.log(`PDF pages: ${pdfDoc.numPages}`)
      let rawText = ''
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i)
        const content = await page.getTextContent()
        let pageText = ''
        for (const item of content.items) {
          if (!('str' in item)) continue
          const t = item as { str: string; hasEOL?: boolean }
          pageText += t.str
          if (t.hasEOL) pageText += '\n'
          else if (t.str.length > 0 && !t.str.endsWith(' ')) pageText += ' '
        }
        rawText += pageText + '\n\n'
      }
      console.log(`Extracted ${rawText.length} chars from ${pdfDoc.numPages} pages`)
      console.log('FULL EXTRACTED TEXT:', rawText)

      setUploadStage('uploading')
      const uploadUrl = await generateUploadUrl()

      const uploadRes = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': f.type || 'application/pdf' },
        body: f,
      })

      if (!uploadRes.ok) throw new Error('Upload failed')
      const { storageId } = (await uploadRes.json()) as { storageId: string }
      setCachedUploadArgs({ storageId, fileName: f.name, rawText: rawText.slice(0, 200000) })

      setUploadStage('queued')
      await storeFileAndParse({
        storageId: storageId as Parameters<typeof storeFileAndParse>[0]['storageId'],
        fileName: f.name,
        monthYear: viewMonth,
        rawText: rawText.slice(0, 200000),
      })

      const sizeMb = Math.round((f.size / 1024 / 1024) * 10) / 10 || 0.1
      setPdfFile({ name: f.name, size: sizeMb, uploadedAt: 'just now' })
      setUploading(false)
      setUploadStage(null)
      setToast('PDF uploaded · AI is extracting content…')
    } catch (err) {
      setUploading(false)
      setUploadStage(null)
      setToast('Upload failed: ' + String(err))
    }
  }

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
          vocabWord?: string
          vocabDefinition?: string
          quote?: string
        }>
      }

      if (typeof parsed.monthYear !== 'string' || !Array.isArray(parsed.days) || parsed.days.length === 0) {
        throw new Error('Expected { monthYear: string, days: [...] }')
      }
      for (const d of parsed.days) {
        if (!d.date || !d.title || !d.body || !Array.isArray(d.prayerPoints)) {
          throw new Error(`Day ${d.date ?? '?'} is missing required fields`)
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
          vocabWord: d.vocabWord,
          vocabDefinition: d.vocabDefinition,
          quote: d.quote,
        })),
      })

      setImportingJson(false)
      setViewMonth(parsed.monthYear)
      setToast(`Imported ${result.imported} days from ${f.name}`)
    } catch (err) {
      setImportingJson(false)
      setToast('Import failed: ' + String(err))
    }
  }

  const removePdf = () => {
    setPdfFile(null)
    setToast('PDF removed')
  }

  const isLoaded = ((pdfFile !== null && !failed) || (convexMessages !== undefined && convexMessages.length > 0)) && days.length > 0

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      {/* Desktop */}
      <div className="hidden md:block">
        <AnimatePresence mode="wait">
          {parsing ? (
            <motion.div key="parsing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Card style={{ padding: 60, textAlign: 'center', background: P.bgSoft }}>
                <div style={{ width: 56, height: 56, borderRadius: 14, background: P.sageTint, display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
                  <Icon name="flash" size={26} color={P.sage} />
                </div>
                <div style={{ fontSize: 18, fontWeight: 600 }}>
                  {uploadStage === 'extracting' ? 'Reading PDF…' : uploadStage === 'uploading' ? 'Uploading…' : 'AI parsing…'}
                </div>
                <div style={{ fontSize: 13, color: P.inkSoft, marginTop: 8 }}>
                  {uploadStage === 'extracting' ? 'Extracting text from your PDF.' : uploadStage === 'uploading' ? 'Sending file to cloud storage.' : 'AI is extracting days of content. This takes 30–60 seconds.'}
                </div>
                <div style={{ marginTop: 16, display: 'flex', gap: 8, justifyContent: 'center', fontSize: 11, fontFamily: P.mono, color: P.inkSoft }}>
                  {(['extracting', 'uploading', 'queued'] as const).map((s) => {
                    const done = uploadStage === null || (uploadStage === 'uploading' && s === 'extracting') || (uploadStage === 'queued' && (s === 'extracting' || s === 'uploading')) || (!uploadStage && latestUpload?.status === 'processing')
                    const active = uploadStage === s || (s === 'queued' && !uploadStage && latestUpload?.status === 'processing')
                    return (
                      <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 4, opacity: active || done ? 1 : 0.35 }}>
                        <div style={{ width: 6, height: 6, borderRadius: 99, background: done ? P.sage : active ? P.sage : P.inkFaint, animation: active ? `pulse 1.2s ease-in-out infinite` : 'none' }} />
                        {s === 'extracting' ? 'Extract' : s === 'uploading' ? 'Upload' : 'AI parse'}
                      </div>
                    )
                  })}
                </div>
                {parsingSeconds >= 90 && (
                  <div style={{ marginTop: 16 }}>
                    <Btn onClick={handleCancelParse} style={{ margin: '0 auto', display: 'flex' }}>Taking too long? Cancel &amp; retry</Btn>
                  </div>
                )}
              </Card>
            </motion.div>
          ) : isLoaded ? (
            <motion.div key="loaded" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.1fr) minmax(0,1fr)', gap: 14 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
                  {pdfFile && (
                    <Card style={{ padding: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 38, height: 48, borderRadius: 5, background: P.rose, color: '#FFF', display: 'grid', placeItems: 'center', fontFamily: P.mono, fontSize: 10, fontWeight: 700 }}>PDF</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pdfFile.name}</div>
                          <div style={{ fontSize: 11, color: P.inkSoft, fontFamily: P.mono, marginTop: 3 }}>{pdfFile.size}MB · uploaded {pdfFile.uploadedAt}</div>
                        </div>
                        <Btn onClick={handleReformat} disabled={parsing} title="Re-run AI formatting with the currently active template"><Icon name="flash" size={12} /> Re-format</Btn>
                        <Btn onClick={() => fileInputRef.current?.click()} style={{ borderStyle: 'dashed', color: P.sage }}>Replace</Btn>
                        <Btn onClick={removePdf}><Icon name="trash" size={12} /> Remove</Btn>
                      </div>
                    </Card>
                  )}
                  {!pdfFile && (
                    <Card style={{ padding: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 38, height: 48, borderRadius: 5, background: P.sageTint, color: P.sage, display: 'grid', placeItems: 'center', fontFamily: P.mono, fontSize: 10, fontWeight: 700 }}>PDF</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>Devotional loaded from database</div>
                          <div style={{ fontSize: 11, color: P.inkSoft, fontFamily: P.mono, marginTop: 3 }}>{days.length} days · {viewMonth}</div>
                        </div>
                        <Btn onClick={handleReformat} disabled={parsing} title="Re-run AI formatting with the currently active template"><Icon name="flash" size={12} /> Re-format</Btn>
                        <Btn onClick={() => fileInputRef.current?.click()} style={{ borderStyle: 'dashed', color: P.sage }}>Upload new</Btn>
                      </div>
                    </Card>
                  )}

                  <UploadDayGrid days={days} selectedDay={selectedDay} onSelectDay={setSelectedDay} />
                  <UploadDayList days={days} />
                </div>

                <UploadDayPreview day={previewDay} />
              </div>
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {failed && cachedUploadArgs && (
                <Card style={{ padding: '12px 14px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: '#FEE2E2', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    <Icon name="x" size={15} color={P.rose} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: P.rose }}>Parsing failed</div>
                    <div style={{ fontSize: 11, color: P.inkSoft, fontFamily: P.mono, marginTop: 2 }}>{cachedUploadArgs.fileName}</div>
                  </div>
                  <Btn onClick={handleRetry} style={{ color: P.sage }}>Retry</Btn>
                </Card>
              )}
              <UploadDropzone onPick={() => fileInputRef.current?.click()} onPickJson={() => jsonInputRef.current?.click()} jsonImporting={importingJson} viewport="desktop" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile */}
      <div className="md:hidden" style={{ padding: '0 16px 16px' }}>
        <AnimatePresence mode="wait">
          {parsing ? (
            <motion.div key="parsing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Card style={{ padding: 40, textAlign: 'center', background: P.bgSoft }}>
                <div style={{ width: 44, height: 44, borderRadius: 11, background: P.sageTint, display: 'grid', placeItems: 'center', margin: '0 auto 12px' }}>
                  <Icon name="flash" size={20} color={P.sage} />
                </div>
                <div style={{ fontSize: 15, fontWeight: 600 }}>
                  {uploadStage === 'extracting' ? 'Reading PDF…' : uploadStage === 'uploading' ? 'Uploading…' : 'AI parsing…'}
                </div>
                <div style={{ fontSize: 12, color: P.inkSoft, marginTop: 6, lineHeight: 1.5 }}>
                  {uploadStage === 'extracting' ? 'Extracting text from PDF.' : uploadStage === 'uploading' ? 'Uploading to cloud.' : 'AI extracting days. 30–60 seconds.'}
                </div>
                <div style={{ marginTop: 14, display: 'flex', gap: 10, justifyContent: 'center', fontSize: 10, fontFamily: P.mono, color: P.inkSoft }}>
                  {(['extracting', 'uploading', 'queued'] as const).map((s) => {
                    const active = uploadStage === s || (s === 'queued' && !uploadStage && latestUpload?.status === 'processing')
                    return (
                      <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <div style={{ width: 5, height: 5, borderRadius: 99, background: P.sage, animation: active ? `pulse 1.2s ease-in-out infinite` : 'none', opacity: active ? 1 : 0.3 }} />
                        {s === 'extracting' ? '1' : s === 'uploading' ? '2' : '3'}
                      </div>
                    )
                  })}
                </div>
              </Card>
            </motion.div>
          ) : isLoaded ? (
            <motion.div key="loaded" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {pdfFile ? (
                <Card style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 46, borderRadius: 5, background: P.rose, color: '#FFF', display: 'grid', placeItems: 'center', fontFamily: P.mono, fontSize: 10, fontWeight: 700 }}>PDF</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pdfFile.name}</div>
                    <div style={{ fontSize: 10.5, color: P.inkSoft, fontFamily: P.mono, marginTop: 3 }}>{pdfFile.size}MB · {pdfFile.uploadedAt}</div>
                  </div>
                  <Tag bg={P.sageTint} color={P.sage}>OK</Tag>
                </Card>
              ) : (
                <Card style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 46, borderRadius: 5, background: P.sageTint, color: P.sage, display: 'grid', placeItems: 'center', fontFamily: P.mono, fontSize: 10, fontWeight: 700 }}>DB</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600 }}>{days.length} days loaded</div>
                    <div style={{ fontSize: 10.5, color: P.inkSoft, fontFamily: P.mono, marginTop: 3 }}>{viewMonth}</div>
                  </div>
                  <Tag bg={P.sageTint} color={P.sage}>OK</Tag>
                </Card>
              )}

              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <Btn onClick={handleReformat} disabled={parsing} style={{ flex: 1, justifyContent: 'center' }} title="Re-run AI formatting with the currently active template"><Icon name="flash" size={12} /> Re-format</Btn>
                <Btn onClick={() => fileInputRef.current?.click()} style={{ flex: 1, justifyContent: 'center', borderStyle: 'dashed', color: P.sage }}>{pdfFile ? 'Replace PDF' : 'Upload new'}</Btn>
                {pdfFile && <Btn onClick={removePdf} style={{ flex: 1, justifyContent: 'center' }}><Icon name="trash" size={12} /> Remove</Btn>}
              </div>

              <UploadMobileDayGrid days={days} />
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {failed && cachedUploadArgs && (
                <Card style={{ padding: '12px 14px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 7, background: '#FEE2E2', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    <Icon name="x" size={13} color={P.rose} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: P.rose }}>Parsing failed</div>
                    <div style={{ fontSize: 10.5, color: P.inkSoft, fontFamily: P.mono, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cachedUploadArgs.fileName}</div>
                  </div>
                  <Btn onClick={handleRetry} style={{ color: P.sage }}>Retry</Btn>
                </Card>
              )}
              <UploadDropzone onPick={() => fileInputRef.current?.click()} onPickJson={() => jsonInputRef.current?.click()} jsonImporting={importingJson} viewport="mobile" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <input ref={fileInputRef} type="file" accept="application/pdf" onChange={onFilePick} style={{ display: 'none' }} />
      <input ref={jsonInputRef} type="file" accept="application/json" onChange={onJsonPick} style={{ display: 'none' }} />
    </motion.div>
  )
}
