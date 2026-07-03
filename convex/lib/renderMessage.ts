import { applyFontStyle } from './unicodeFonts'
import type { TemplateConfig } from './templateConfig'

const DAYS = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
const MONTHS = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
]

function ordinalSuffix(n: number): string {
  const s = ['TH', 'ST', 'ND', 'RD']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

export function formatDateLabel(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  const dow = DAYS[date.getUTCDay()]
  const mon = MONTHS[month - 1]
  return `${dow}, ${ordinalSuffix(day)} ${mon} ${year}`
}

export interface RenderableDay {
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
}

export function renderMessage(day: RenderableDay, cfg: TemplateConfig): string {
  const lines: string[] = []

  lines.push(cfg.headerBanner)
  lines.push(`${cfg.ministryBlockquote ? '> ' : ''}${applyFontStyle(cfg.ministryLine, cfg.ministryStyle)}`)
  lines.push(`${cfg.dateBlockquote ? '> ' : ''}${applyFontStyle(formatDateLabel(day.date), cfg.dateStyle)}`)
  lines.push('')
  lines.push(applyFontStyle(day.title.toUpperCase(), cfg.titleStyle))
  if (day.subtitle?.trim()) {
    lines.push(applyFontStyle(day.subtitle, cfg.subtitleStyle))
  }
  if (cfg.separatorA) lines.push(cfg.separatorA)
  lines.push(applyFontStyle(day.scripture, cfg.scriptureStyle))
  lines.push(applyFontStyle(day.scriptureReference, cfg.scriptureStyle))
  if (cfg.separatorA) lines.push(cfg.separatorA)
  lines.push('')

  lines.push(`${cfg.levelUpPrefix}${applyFontStyle(cfg.levelUpLabel, cfg.levelUpStyle)}${cfg.levelUpSuffix}`)
  lines.push('')
  lines.push(day.body)
  if (cfg.separatorB) { lines.push(''); lines.push(cfg.separatorB) }
  lines.push('')

  lines.push(`${cfg.prayerPrefix}${applyFontStyle(cfg.prayerLabel, cfg.prayerStyle)}${cfg.prayerSuffix}`)
  if (cfg.prayerNumbering) {
    for (const [i, pt] of day.prayerPoints.entries()) lines.push(`*${i + 1}. ${pt}*`)
  } else {
    lines.push(day.prayerPoints.join('\n\n'))
  }

  if (cfg.includeVocab && day.vocabWord?.trim()) {
    if (cfg.separatorB) lines.push(cfg.separatorB)
    lines.push('')
    lines.push(`${cfg.vocabPrefix}${applyFontStyle(cfg.vocabLabel, cfg.vocabStyle)}${cfg.vocabSuffix}`)
    lines.push(`${day.vocabWord}: ${day.vocabDefinition ?? ''}`)
  }

  if (cfg.includeQuote && day.quote?.trim()) {
    lines.push('')
    lines.push(`${cfg.quotePrefix}${applyFontStyle(cfg.quoteLabel, cfg.quoteStyle)}${cfg.quoteSuffix}`)
    lines.push(day.quote)
  }

  if (cfg.separatorB) lines.push(cfg.separatorB)
  lines.push('')
  lines.push(...cfg.footerLines)

  return lines.join('\n')
}
