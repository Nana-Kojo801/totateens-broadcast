import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useAction } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import { P } from '@/lib/tokens'
import { Card } from '@/components/ui/card'
import { Btn } from '@/components/ui/btn'
import { Switch } from '@/components/ui/switch'
import { Select } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Icon } from '@/lib/icons'
import { useAppStore } from '@/store/app-store'
import { FONT_STYLES } from '../../../convex/lib/unicodeFonts'
import type { FontStyle } from '../../../convex/lib/unicodeFonts'
import { renderMessage } from '../../../convex/lib/renderMessage'
import { DEFAULT_TEMPLATE_CONFIG } from '../../../convex/lib/templateConfig'
import type { TemplateConfig } from '../../../convex/lib/templateConfig'

const SAMPLE_DAY = {
  date: new Date().toISOString().slice(0, 10),
  title: 'From Zeal To Responsibility',
  subtitle: '(We press on by being responsible)',
  scripture: 'Therefore, my beloved, as you have always obeyed, work out your own salvation with fear and trembling.',
  scriptureReference: 'Philippians 2:12-13 (ESV)',
  body: 'This is where your body text will appear. It can span several paragraphs — write your teaching here.\n\nA second paragraph shows how spacing looks in the rendered message.',
  prayerPoints: ['Spend time to pray and examine your walk with God.'],
  vocabWord: 'Retrogress',
  vocabDefinition: 'to move backwards on something or on a path',
  quote: 'True maturity is when you realise that responsibility is the final destination of zeal.',
}

const fieldStyle: React.CSSProperties = {
  marginTop: 5, width: '100%', padding: '9px 11px', border: `1px solid ${P.line}`, borderRadius: 7,
  background: P.surface, fontSize: 13, fontFamily: P.sans, boxSizing: 'border-box', outline: 'none', color: P.ink,
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 11, color: P.inkSoft, fontWeight: 600, letterSpacing: 0.3, fontFamily: P.mono }}>{children}</div>
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <FieldLabel>{label}</FieldLabel>
      {children}
    </div>
  )
}

function FontStyleSelect({ value, onChange }: { value: FontStyle; onChange: (v: FontStyle) => void }) {
  return (
    <Select
      value={value}
      onChange={(v) => onChange(v as FontStyle)}
      options={FONT_STYLES.map((f) => ({ value: f.value, label: `${f.label} — ${f.sample}` }))}
      style={{ marginTop: 5 }}
    />
  )
}

function GroupCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card style={{ padding: 16, marginBottom: 12 }}>
      <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 12 }}>{title}</div>
      {children}
    </Card>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 10 }}>{children}</div>
}

export function TemplateEditorPage() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const setToast = useAppStore((s: { setToast: (msg: string | null) => void }) => s.setToast)
  const isEdit = !!id

  const existing = useQuery(api.templates.getById, isEdit ? { id: id as Id<'messageTemplates'> } : 'skip')
  const createMut = useMutation(api.templates.create)
  const updateMut = useMutation(api.templates.update)
  const setActiveMut = useMutation(api.templates.setActive)
  const removeMut = useMutation(api.templates.remove)
  const parseExampleAction = useAction(api.templateParse.parseExample)

  const [name, setName] = useState('')
  const [config, setConfig] = useState<TemplateConfig>(DEFAULT_TEMPLATE_CONFIG)
  const [hydrated, setHydrated] = useState(!isEdit)
  const [showImport, setShowImport] = useState(false)
  const [showMobilePreview, setShowMobilePreview] = useState(false)
  const [importText, setImportText] = useState('')
  const [importing, setImporting] = useState(false)

  if (isEdit && existing !== undefined && !hydrated) {
    if (existing) {
      setName(existing.name)
      setConfig(existing.config)
    }
    setHydrated(true)
  }

  const set = <K extends keyof TemplateConfig>(key: K, value: TemplateConfig[K]) => {
    setConfig((c) => ({ ...c, [key]: value }))
  }

  const canSave = name.trim().length > 0

  const handleImport = async () => {
    if (!importText.trim()) return
    setImporting(true)
    try {
      const parsed = await parseExampleAction({ exampleText: importText })
      setConfig(parsed)
      setShowImport(false)
      setImportText('')
      setToast('Fields filled in from your example — review them below')
    } catch (err) {
      setToast('Import failed: ' + String(err))
    } finally {
      setImporting(false)
    }
  }

  const handleSave = async () => {
    if (!canSave) return
    try {
      if (isEdit && id) {
        await updateMut({ id: id as Id<'messageTemplates'>, name: name.trim(), config })
        setToast('Template updated')
      } else {
        await createMut({ name: name.trim(), config })
        setToast('Template saved')
      }
      navigate('/templates')
    } catch (err) {
      setToast('Error: ' + String(err))
    }
  }

  const handleSetActive = async () => {
    if (!id) return
    await setActiveMut({ id: id as Id<'messageTemplates'> })
    setToast('Active format updated')
  }

  const handleDelete = async () => {
    if (!id) return
    try {
      await removeMut({ id: id as Id<'messageTemplates'> })
      setToast('Template removed')
      navigate('/templates')
    } catch (err) {
      setToast('Error: ' + String(err))
    }
  }

  if (isEdit && existing === undefined) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '0 16px 16px' }} className="md:p-0">
        <div className="hidden md:flex" style={{ alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <Skeleton width={32} height={32} style={{ borderRadius: 8 }} />
          <div style={{ flex: 1 }}>
            <Skeleton height={15} width={180} />
            <Skeleton height={11} width={260} style={{ marginTop: 6 }} />
          </div>
          <Skeleton width={90} height={32} style={{ borderRadius: 7 }} />
          <Skeleton width={120} height={32} style={{ borderRadius: 7 }} />
        </div>

        <div className="md:hidden" style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <Skeleton width={32} height={32} style={{ borderRadius: 8 }} />
            <div style={{ flex: 1 }}>
              <Skeleton height={15} width={160} />
              <Skeleton height={11} width={200} style={{ marginTop: 6 }} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <Skeleton height={32} style={{ borderRadius: 7 }} />
            <Skeleton height={32} style={{ borderRadius: 7 }} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]" style={{ gap: 14 }}>
          <div style={{ minWidth: 0 }}>
            {[90, 190, 100, 140].map((h, i) => (
              <Card key={i} style={{ padding: 16, marginBottom: 12 }}>
                <Skeleton height={12.5} width={120} style={{ marginBottom: 12 }} />
                <Skeleton height={h} style={{ borderRadius: 7 }} />
              </Card>
            ))}
          </div>

          <div className="hidden md:block">
            <Skeleton height={11} width={100} style={{ marginBottom: 8 }} />
            <Card style={{ padding: 14, background: '#E5DDD5' }}>
              <Skeleton height={260} style={{ borderRadius: 8 }} />
            </Card>
          </div>
        </div>
      </motion.div>
    )
  }

  const preview = renderMessage(SAMPLE_DAY, config)

  return (
    <>
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} style={{ padding: '0 16px 16px' }} className="md:p-0">
      {/* Desktop header */}
      <div className="hidden md:flex" style={{ alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <button type="button" onClick={() => navigate('/templates')} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${P.line}`, background: P.surface, cursor: 'pointer', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
          <Icon name="chevronLeft" size={15} />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 600 }}>{isEdit ? 'Edit format template' : 'New format template'}</div>
          <div style={{ fontSize: 12, color: P.inkSoft, marginTop: 2 }}>Every field is instant, deterministic text — no AI, no waiting.</div>
        </div>
        {isEdit && existing && !existing.isActive && (
          <Btn onClick={handleSetActive} style={{ color: P.sage }}><Icon name="check" size={12} color={P.sage} /> Set active</Btn>
        )}
        {isEdit && existing?.isActive && (
          <div style={{ padding: '7px 11px', borderRadius: 7, background: P.sageTint, color: P.sage, fontSize: 12, fontWeight: 600 }}>Active</div>
        )}
        {isEdit && (
          <Btn onClick={handleDelete} disabled={existing?.isActive} title={existing?.isActive ? 'Set a different template active before deleting this one' : 'Delete'} style={{ opacity: existing?.isActive ? 0.4 : 1 }}>
            <Icon name="trash" size={12} color={P.rose} />
          </Btn>
        )}
        <Btn onClick={() => setShowImport((s) => !s)}><Icon name="flash" size={12} color={P.sage} /> Import from example</Btn>
        <Btn variant="primary" onClick={handleSave} disabled={!canSave}>{isEdit ? 'Save changes' : 'Save template'}</Btn>
      </div>

      {/* Mobile header */}
      <div className="md:hidden" style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <button type="button" onClick={() => navigate('/templates')} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${P.line}`, background: P.surface, cursor: 'pointer', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <Icon name="chevronLeft" size={15} />
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 600 }}>{isEdit ? 'Edit format template' : 'New format template'}</div>
            <div style={{ fontSize: 11.5, color: P.inkSoft, marginTop: 2 }}>Instant, deterministic — no AI, no waiting.</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <Btn onClick={() => setShowMobilePreview(true)} style={{ justifyContent: 'center', color: P.sage }}><Icon name="eye" size={12} color={P.sage} /> Preview</Btn>
          {isEdit && existing && !existing.isActive && (
            <Btn onClick={handleSetActive} style={{ justifyContent: 'center', color: P.sage }}><Icon name="check" size={12} color={P.sage} /> Set active</Btn>
          )}
          {isEdit && existing?.isActive && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '7px 11px', borderRadius: 7, background: P.sageTint, color: P.sage, fontSize: 12, fontWeight: 600 }}>Active</div>
          )}
          <Btn onClick={() => setShowImport((s) => !s)} style={{ justifyContent: 'center' }}><Icon name="flash" size={12} color={P.sage} /> Import from example</Btn>
          {isEdit && (
            <Btn onClick={handleDelete} disabled={existing?.isActive} title={existing?.isActive ? 'Set a different template active before deleting this one' : 'Delete'} style={{ justifyContent: 'center', opacity: existing?.isActive ? 0.4 : 1 }}>
              <Icon name="trash" size={12} color={P.rose} /> Delete
            </Btn>
          )}
        </div>

        <Btn variant="primary" onClick={handleSave} disabled={!canSave} style={{ width: '100%', justifyContent: 'center', marginTop: 10 }}>
          {isEdit ? 'Save changes' : 'Save template'}
        </Btn>
      </div>

      {showImport && (
        <Card style={{ padding: 16, marginBottom: 14 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 4 }}>Import from example</div>
          <div style={{ fontSize: 11.5, color: P.inkSoft, marginBottom: 10, lineHeight: 1.5 }}>
            Paste one full example message exactly as it should look on WhatsApp. AI identifies the structure (banner, labels, sections) once; the exact Unicode font style for each part is then detected deterministically from your text — not guessed. Every field stays editable below afterward.
          </div>
          <textarea
            placeholder="Paste your example message here…"
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            rows={10}
            style={{ ...fieldStyle, fontFamily: P.mono, resize: 'vertical', lineHeight: 1.5 }}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <Btn onClick={() => setShowImport(false)} style={{ flex: 1, justifyContent: 'center' }}>Cancel</Btn>
            <Btn variant="primary" onClick={handleImport} disabled={!importText.trim() || importing} style={{ flex: 1.4, justifyContent: 'center', opacity: !importText.trim() || importing ? 0.5 : 1 }}>
              {importing ? 'Reading example…' : 'Auto-fill fields'}
            </Btn>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]" style={{ gap: 14 }}>
        <div style={{ minWidth: 0 }}>
          <GroupCard title="Name">
            <input autoFocus placeholder="e.g. July Trumpets" value={name} onChange={(e) => setName(e.target.value)} style={fieldStyle} />
          </GroupCard>

          <GroupCard title="Header">
            <Field label="banner line"><input value={config.headerBanner} onChange={(e) => set('headerBanner', e.target.value)} style={{ ...fieldStyle, fontFamily: P.mono }} /></Field>
            <Field label="ministry / brand line"><input value={config.ministryLine} onChange={(e) => set('ministryLine', e.target.value)} style={fieldStyle} /></Field>
            <Row>
              <Field label="ministry line style"><FontStyleSelect value={config.ministryStyle} onChange={(v) => set('ministryStyle', v)} /></Field>
              <Field label="date line style"><FontStyleSelect value={config.dateStyle} onChange={(v) => set('dateStyle', v)} /></Field>
            </Row>
            <Row>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                <Switch on={config.ministryBlockquote} onToggle={() => set('ministryBlockquote', !config.ministryBlockquote)} />
                <span style={{ fontSize: 12 }}>Blockquote "&gt;" on ministry line</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                <Switch on={config.dateBlockquote} onToggle={() => set('dateBlockquote', !config.dateBlockquote)} />
                <span style={{ fontSize: 12 }}>Blockquote "&gt;" on date line</span>
              </div>
            </Row>
            <Row>
              <Field label="title style"><FontStyleSelect value={config.titleStyle} onChange={(v) => set('titleStyle', v)} /></Field>
              <Field label="subtitle style"><FontStyleSelect value={config.subtitleStyle} onChange={(v) => set('subtitleStyle', v)} /></Field>
            </Row>
          </GroupCard>

          <GroupCard title="Scripture">
            <Field label="separator line (before/after scripture, blank to skip)"><input value={config.separatorA} onChange={(e) => set('separatorA', e.target.value)} style={{ ...fieldStyle, fontFamily: P.mono }} /></Field>
            <Field label="scripture + reference style"><FontStyleSelect value={config.scriptureStyle} onChange={(v) => set('scriptureStyle', v)} /></Field>
          </GroupCard>

          <GroupCard title="Level up / teaching heading">
            <Field label="label text"><input value={config.levelUpLabel} onChange={(e) => set('levelUpLabel', e.target.value)} style={fieldStyle} /></Field>
            <Row>
              <Field label="prefix"><input value={config.levelUpPrefix} onChange={(e) => set('levelUpPrefix', e.target.value)} style={{ ...fieldStyle, fontFamily: P.mono }} /></Field>
              <Field label="suffix"><input value={config.levelUpSuffix} onChange={(e) => set('levelUpSuffix', e.target.value)} style={{ ...fieldStyle, fontFamily: P.mono }} /></Field>
            </Row>
            <Field label="style"><FontStyleSelect value={config.levelUpStyle} onChange={(v) => set('levelUpStyle', v)} /></Field>
          </GroupCard>

          <GroupCard title="Section separator">
            <Field label="separator line (between body/prayer/vocab/quote/footer, blank to skip)"><input value={config.separatorB} onChange={(e) => set('separatorB', e.target.value)} style={{ ...fieldStyle, fontFamily: P.mono }} /></Field>
          </GroupCard>

          <GroupCard title="Prayer">
            <Field label="default label text (a day can override the whole heading, emoji included, in its own edit form)"><input value={config.prayerLabel} onChange={(e) => set('prayerLabel', e.target.value)} style={fieldStyle} /></Field>
            <Row>
              <Field label="prefix"><input value={config.prayerPrefix} onChange={(e) => set('prayerPrefix', e.target.value)} style={{ ...fieldStyle, fontFamily: P.mono }} /></Field>
              <Field label="suffix"><input value={config.prayerSuffix} onChange={(e) => set('prayerSuffix', e.target.value)} style={{ ...fieldStyle, fontFamily: P.mono }} /></Field>
            </Row>
            <Field label="style"><FontStyleSelect value={config.prayerStyle} onChange={(v) => set('prayerStyle', v)} /></Field>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
              <Switch on={config.prayerNumbering} onToggle={() => set('prayerNumbering', !config.prayerNumbering)} />
              <span style={{ fontSize: 12 }}>Number each prayer point ("1. ...")</span>
            </div>
          </GroupCard>

          <GroupCard title="Vocabulary hunt">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <Switch on={config.includeVocab} onToggle={() => set('includeVocab', !config.includeVocab)} />
              <span style={{ fontSize: 12 }}>Include a vocabulary word section (needs vocabWord/vocabDefinition on the day)</span>
            </div>
            {config.includeVocab && (
              <>
                <Field label="label text"><input value={config.vocabLabel} onChange={(e) => set('vocabLabel', e.target.value)} style={fieldStyle} /></Field>
                <Row>
                  <Field label="prefix"><input value={config.vocabPrefix} onChange={(e) => set('vocabPrefix', e.target.value)} style={{ ...fieldStyle, fontFamily: P.mono }} /></Field>
                  <Field label="suffix"><input value={config.vocabSuffix} onChange={(e) => set('vocabSuffix', e.target.value)} style={{ ...fieldStyle, fontFamily: P.mono }} /></Field>
                </Row>
                <Field label="style"><FontStyleSelect value={config.vocabStyle} onChange={(v) => set('vocabStyle', v)} /></Field>
              </>
            )}
          </GroupCard>

          <GroupCard title="Quote">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <Switch on={config.includeQuote} onToggle={() => set('includeQuote', !config.includeQuote)} />
              <span style={{ fontSize: 12 }}>Include a quote section (needs quote on the day)</span>
            </div>
            {config.includeQuote && (
              <>
                <Field label="label text"><input value={config.quoteLabel} onChange={(e) => set('quoteLabel', e.target.value)} style={fieldStyle} /></Field>
                <Row>
                  <Field label="prefix"><input value={config.quotePrefix} onChange={(e) => set('quotePrefix', e.target.value)} style={{ ...fieldStyle, fontFamily: P.mono }} /></Field>
                  <Field label="suffix"><input value={config.quoteSuffix} onChange={(e) => set('quoteSuffix', e.target.value)} style={{ ...fieldStyle, fontFamily: P.mono }} /></Field>
                </Row>
                <Field label="style"><FontStyleSelect value={config.quoteStyle} onChange={(v) => set('quoteStyle', v)} /></Field>
              </>
            )}
          </GroupCard>

          <GroupCard title="Footer">
            {config.footerLines.map((line, i) => (
              <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                <input
                  value={line}
                  onChange={(e) => {
                    const next = [...config.footerLines]
                    next[i] = e.target.value
                    set('footerLines', next)
                  }}
                  style={{ ...fieldStyle, marginTop: 0, flex: 1 }}
                />
                <button
                  type="button"
                  onClick={() => set('footerLines', config.footerLines.filter((_, j) => j !== i))}
                  style={{ width: 32, height: 32, borderRadius: 7, border: `1px solid ${P.line}`, background: P.surface, cursor: 'pointer', display: 'grid', placeItems: 'center', flexShrink: 0 }}
                >
                  <Icon name="trash" size={12} color={P.inkFaint} />
                </button>
              </div>
            ))}
            <Btn onClick={() => set('footerLines', [...config.footerLines, ''])} style={{ marginTop: 4 }}>
              <Icon name="plus" size={11} /> Add line
            </Btn>
          </GroupCard>
        </div>

        <div className="hidden md:block md:sticky" style={{ top: 0, alignSelf: 'start' }}>
          <div style={{ fontSize: 11, color: P.inkSoft, fontWeight: 600, letterSpacing: 0.5, marginBottom: 8, fontFamily: P.mono }}>LIVE PREVIEW</div>
          <Card style={{ padding: 14, background: '#E5DDD5', maxHeight: 'calc(100vh - 140px)', overflowY: 'auto' }}>
            <div style={{ background: '#FFFFFF', borderRadius: '8px 8px 8px 2px', padding: '12px 14px', boxShadow: '0 1px 0.5px rgba(0,0,0,0.13)', fontSize: 13, lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: '-apple-system, "Segoe UI", system-ui, sans-serif' }}>
              {preview}
            </div>
          </Card>
        </div>
      </div>
    </motion.div>

      {/* Mobile preview — full-width slide-over from the right */}
      <AnimatePresence>
        {showMobilePreview && (
          <motion.div
            className="md:hidden"
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 38 }}
            style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', background: P.bg, zIndex: 9500, display: 'flex', flexDirection: 'column' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderBottom: `1px solid ${P.lineSoft}`, flexShrink: 0 }}>
              <button type="button" onClick={() => setShowMobilePreview(false)} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${P.line}`, background: P.surface, cursor: 'pointer', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <Icon name="x" size={15} />
              </button>
              <div style={{ fontSize: 15, fontWeight: 600 }}>Live preview</div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 14, background: '#E5DDD5' }}>
              <div style={{ background: '#FFFFFF', borderRadius: '8px 8px 8px 2px', padding: '12px 14px', boxShadow: '0 1px 0.5px rgba(0,0,0,0.13)', fontSize: 13, lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: '-apple-system, "Segoe UI", system-ui, sans-serif' }}>
                {preview}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
