'use node'

import { action } from './_generated/server'
import { v } from 'convex/values'
import { extractLabelParts, stripFontStyle } from './lib/unicodeFonts'
import { DEFAULT_TEMPLATE_CONFIG } from './lib/templateConfig'

// See convex/messages.ts for why this local shim is needed.
declare const process: { env: Record<string, string | undefined> }
import type { TemplateConfig } from './lib/templateConfig'

export interface RoleMap {
  bannerLine: number | null
  ministryLine: number | null
  ministryBlockquote: boolean
  dateLine: number | null
  dateBlockquote: boolean
  titleLine: number | null
  subtitleLine: number | null
  separatorALine: number | null
  scriptureStartLine: number | null
  scriptureEndLine: number | null
  levelUpLabelLine: number | null
  separatorBLine: number | null
  prayerLabelLine: number | null
  prayerNumbering: boolean
  footerStartLine: number | null
}

function buildPrompt(numberedText: string): string {
  return `Below is an example WhatsApp devotional message, one line per row with its 0-based line number. It follows this structural pattern, in order: a decorative banner line, a ministry/brand name line, a date line, a blank line, a title, an optional subtitle in parentheses, an optional decorative separator line, the scripture verse (one or more lines), the scripture reference, the separator repeated, a blank line, a section heading like "LEVEL UP" introducing the teaching body, a blank line, the body text, an optional separator, a blank line, a "PRAYER" heading followed by prayer point(s) (possibly numbered "1. ..."), then a closing separator, then footer lines (links, website, social handles) to the end.

Identify which line number each structural role corresponds to. Some roles won't be present in every example — use null for those. Ministry and date lines sometimes start with "> " (a blockquote marker) — report that separately as a boolean, do not include it in the line role itself.

Return ONLY valid JSON, no prose, no markdown fences, matching exactly this shape:
{
  "bannerLine": number|null,
  "ministryLine": number|null,
  "ministryBlockquote": boolean,
  "dateLine": number|null,
  "dateBlockquote": boolean,
  "titleLine": number|null,
  "subtitleLine": number|null,
  "separatorALine": number|null,
  "scriptureStartLine": number|null,
  "scriptureEndLine": number|null,
  "levelUpLabelLine": number|null,
  "separatorBLine": number|null,
  "prayerLabelLine": number|null,
  "prayerNumbering": boolean,
  "footerStartLine": number|null
}

TEXT (line number: content):
${numberedText}`
}

async function callModel(prompt: string): Promise<RoleMap> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('Missing OPENAI_API_KEY')

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 45000)
  let r: Response
  try {
    r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a precise structural classifier. You ONLY output valid JSON objects. Never refuse, never explain, never add prose.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 1000,
        temperature: 0,
      }),
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timeout)
  }

  if (!r.ok) throw new Error(`HTTP ${r.status}`)

  const result = (await r.json()) as {
    choices: Array<{ message: { content: string } }>
    error?: { message: string }
  }
  if (result.error) throw new Error(result.error.message)

  const content = result.choices[0]?.message?.content ?? ''
  const cleaned = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
  const jsonStart = cleaned.indexOf('{')
  const jsonEnd = cleaned.lastIndexOf('}')
  if (jsonStart === -1 || jsonEnd <= jsonStart) throw new Error(`No JSON object in response: ${content.slice(0, 200)}`)

  return JSON.parse(cleaned.slice(jsonStart, jsonEnd + 1)) as RoleMap
}

function styleOfLines(lines: string[], start: number | null, end: number | null): TemplateConfig['ministryStyle'] {
  if (start === null) return 'plain'
  const span = lines.slice(start, (end ?? start) + 1).join(' ')
  return stripFontStyle(span).style
}

function stripBlockquote(line: string): string {
  return line.startsWith('> ') ? line.slice(2) : line
}

// Guards against the AI misreporting a line index (off-by-one is a known
// weakness on numbered-list tasks): only trust an index if it's in range
// and non-blank, otherwise treat the role as absent so we fall back to the
// default rather than silently corrupting a field with blank data.
function lineAt(rawLines: string[], idx: number | null): string | null {
  if (idx === null || idx < 0 || idx >= rawLines.length) return null
  const line = rawLines[idx]
  return line.trim().length > 0 ? line : null
}

export function assembleConfig(rawLines: string[], roles: RoleMap): TemplateConfig {
  const def = DEFAULT_TEMPLATE_CONFIG
  const cfg: TemplateConfig = { ...def }

  const banner = lineAt(rawLines, roles.bannerLine)
  if (banner) cfg.headerBanner = banner

  const ministry = lineAt(rawLines, roles.ministryLine)
  if (ministry) {
    const { plain, style } = stripFontStyle(stripBlockquote(ministry))
    cfg.ministryLine = plain
    cfg.ministryStyle = style
    cfg.ministryBlockquote = roles.ministryBlockquote
  }

  if (lineAt(rawLines, roles.dateLine)) {
    cfg.dateStyle = styleOfLines(rawLines, roles.dateLine, roles.dateLine)
    cfg.dateBlockquote = roles.dateBlockquote
  }

  if (lineAt(rawLines, roles.titleLine)) cfg.titleStyle = styleOfLines(rawLines, roles.titleLine, roles.titleLine)
  if (lineAt(rawLines, roles.subtitleLine)) cfg.subtitleStyle = styleOfLines(rawLines, roles.subtitleLine, roles.subtitleLine)

  const separatorA = lineAt(rawLines, roles.separatorALine)
  if (separatorA) cfg.separatorA = separatorA.trim()
  if (lineAt(rawLines, roles.scriptureStartLine)) cfg.scriptureStyle = styleOfLines(rawLines, roles.scriptureStartLine, roles.scriptureEndLine)

  const levelUp = lineAt(rawLines, roles.levelUpLabelLine)
  if (levelUp) {
    const parts = extractLabelParts(levelUp)
    if (parts.label) {
      cfg.levelUpLabel = parts.label
      cfg.levelUpStyle = parts.style
      cfg.levelUpPrefix = parts.prefix
      cfg.levelUpSuffix = parts.suffix
    }
  }

  const separatorB = lineAt(rawLines, roles.separatorBLine)
  if (separatorB) cfg.separatorB = separatorB.trim()

  const prayer = lineAt(rawLines, roles.prayerLabelLine)
  if (prayer) {
    const parts = extractLabelParts(prayer)
    if (parts.label) {
      cfg.prayerLabel = parts.label
      cfg.prayerStyle = parts.style
      cfg.prayerPrefix = parts.prefix
      cfg.prayerSuffix = parts.suffix
    }
  }
  cfg.prayerNumbering = roles.prayerNumbering

  if (roles.footerStartLine !== null && roles.footerStartLine >= 0 && roles.footerStartLine < rawLines.length) {
    const footer = rawLines.slice(roles.footerStartLine).map((l) => l.trim()).filter((l) => l.length > 0)
    if (footer.length > 0) cfg.footerLines = footer
  }

  return cfg
}

export const parseExample = action({
  args: { exampleText: v.string() },
  handler: async (_ctx, { exampleText }): Promise<TemplateConfig> => {
    const rawLines = exampleText.split('\n')
    const numberedText = rawLines.map((l, i) => `${i}: ${l}`).join('\n')
    const roles = await callModel(buildPrompt(numberedText))
    return assembleConfig(rawLines, roles)
  },
})
