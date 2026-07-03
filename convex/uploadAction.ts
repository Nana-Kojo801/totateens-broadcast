'use node'

import { internalAction } from './_generated/server'
import { internal } from './_generated/api'
import { v } from 'convex/values'
import { renderMessage } from './lib/renderMessage'

// See convex/messages.ts for why this local shim is needed.
declare const process: { env: Record<string, string | undefined> }
import { DEFAULT_TEMPLATE_CONFIG } from './lib/templateConfig'

interface ExtractedDay {
  date: string
  title: string
  scripture: string
  scriptureReference: string
  body: string
  prayerPoints: string[]
}


const MODELS = [
  'gpt-4o-mini',
]

function buildPrompt(text: string, monthYear: string, chunkLabel?: string): string {
  return `Extract daily devotional entries from the following text excerpt${chunkLabel ? ` (${chunkLabel})` : ''} from a "TRUMPETS OF THE AGES DAILY DEVOTIONAL" PDF for the month of ${monthYear}.

Extract ALL entries present in this text. Do not stop early.

DOCUMENT STRUCTURE — each daily entry follows this exact pattern:
1. DATE LINE — day-of-week + ordinal date + month + year in ALL CAPS (e.g. "THURSDAY, 1ST MAY 2025"). This marks the START of each new entry.
2. TITLE — devotional title in ALL CAPS immediately after the date line (may span 1-2 lines).
3. SCRIPTURE VERSE — the Bible verse text (may span multiple lines).
4. SCRIPTURE REFERENCE — book, chapter:verse and version (e.g. "Daniel 4:10-12 BSB").
5. BODY — several paragraphs of teaching text. Ends when "Prayer Point" heading appears.
6. PRAYER POINTS — numbered list beginning with "Prayer Point(s):" or "Prayer Instruction:" heading, followed by numbered items.

PARSING RULES:
- The PDF may repeat boilerplate page headers ("TRUMPETS OF THE AGES DAILY DEVOTIONAL", "www.totaonline.com", page numbers) — IGNORE these entirely.
- Each entry ends when the next DATE LINE begins.
- The line "~*Pastor Elliot*" or similar attribution after the scripture reference belongs to NO field — skip it.
- Prayer points: include only the text of each numbered item, NOT the "Prayer Point(s):" heading itself.
- If a day's body text spans multiple paragraphs, join them with newline characters.
- For the date field, use format YYYY-MM-DD. Derive the year and month from "${monthYear}" and the day number from the date line.

Return ONLY a valid JSON array. No explanation, no markdown, no code fences, no trailing text. Each element must have EXACTLY these keys:
"date" (YYYY-MM-DD string), "title" (string), "scripture" (verse text only, no reference), "scriptureReference" (e.g. "Daniel 4:10-12 BSB"), "body" (full body paragraphs), "prayerPoints" (string array, no numbering)

CRITICAL: If this text contains ANY devotional entries, your response MUST be a non-empty JSON array. Returning [] is only acceptable if the text is completely empty or contains zero devotional entries. If a field value is unclear, use your best guess — do NOT skip the entry or return empty array. Include the COMPLETE untruncated body text for every entry — do not shorten, summarize, or cut off any field.

TEXT TO EXTRACT FROM:
${text}`
}

function chunkByDayBoundaries(text: string, daysPerChunk: number): string[] {
  const re = /\b(MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY),\s+\d{1,2}(?:ST|ND|RD|TH)\b/g
  const positions: number[] = []
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) positions.push(m.index)
  console.log(`chunkByDayBoundaries: found ${positions.length} day markers`)
  if (positions.length <= daysPerChunk) return [text]
  const chunks: string[] = []
  for (let i = 0; i < positions.length; i += daysPerChunk) {
    const start = i === 0 ? 0 : positions[i]
    const end = i + daysPerChunk < positions.length ? positions[i + daysPerChunk] : text.length
    chunks.push(text.slice(start, end))
  }
  return chunks
}

async function callModelWithPrompt(prompt: string): Promise<ExtractedDay[]> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('Missing OPENAI_API_KEY')

  let lastErr = ''
  for (const model of MODELS) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 90000)
    let r: Response
    try {
      r = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: 'You are a precise JSON extraction assistant. You ONLY output valid JSON arrays. Never refuse, never explain, never add prose. Output JSON or nothing.' },
            { role: 'user', content: prompt },
          ],
          max_tokens: 16000,
          temperature: 0,
        }),
        signal: controller.signal,
      })
      clearTimeout(timeout)
    } catch (e) {
      clearTimeout(timeout)
      lastErr = String(e)
      console.warn(`${model} fetch failed: ${lastErr} — trying next`)
      continue
    }

    if (!r.ok) {
      lastErr = `${model} HTTP ${r.status}`
      console.warn(lastErr + ' — trying next')
      continue
    }

    const result = (await r.json()) as {
      choices: Array<{ message: { content: string } }>
      error?: { message: string }
    }

    if (result.error) {
      lastErr = `${model} API error: ${result.error.message}`
      console.warn(lastErr + ' — trying next')
      continue
    }

    const content = result.choices[0]?.message?.content ?? ''
    console.log(`${model} response: ${content.length} chars; FULL:`, content.slice(0, 2000))

    const cleaned = content
      .replace(/<think>[\s\S]*?<\/think>/gi, '')
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim()

    if (cleaned.replace(/\s/g, '') === '[]') {
      console.log(`${model} returned [] for this chunk — no entries found`)
      return []
    }

    const jsonStart = cleaned.indexOf('[{')
    const jsonEnd = cleaned.lastIndexOf('}]')

    if (jsonStart === -1 || jsonEnd <= jsonStart) {
      lastErr = `${model} no JSON array in response: ${content.slice(0, 200)}`
      console.warn(lastErr + ' — trying next')
      continue
    }

    const jsonStr = cleaned.slice(jsonStart, jsonEnd + 2)

    try {
      const parsed = JSON.parse(jsonStr) as ExtractedDay[]
      console.log(`${model}: parsed ${parsed.length} days from chunk`)
      return parsed
    } catch (e) {
      lastErr = `${model} JSON parse failed: ${String(e)}; preview: ${jsonStr.slice(0, 200)}`
      console.warn(lastErr + ' — trying next')
      continue
    }
  }

  throw new Error(`All models failed. Last error: ${lastErr}`)
}

async function callOpenRouter(text: string, monthYear: string): Promise<ExtractedDay[]> {
  const chunks = chunkByDayBoundaries(text, 5)
  console.log(`Processing ${chunks.length} chunk(s) for month ${monthYear}; chunk sizes:`, chunks.map(c => c.length))

  const allDays: ExtractedDay[] = []
  for (let i = 0; i < chunks.length; i++) {
    console.log(`Chunk ${i + 1}/${chunks.length}: ${chunks[i].length} chars`)
    const label = chunks.length > 1 ? `chunk ${i + 1} of ${chunks.length}` : undefined
    const days = await callModelWithPrompt(buildPrompt(chunks[i], monthYear, label))
    allDays.push(...days)
  }

  const seen = new Set<string>()
  const deduped = allDays.filter(d => {
    if (!d.date || seen.has(d.date)) return false
    seen.add(d.date)
    return true
  })
  console.log(`Total days after merge+dedup: ${deduped.length}`)
  return deduped
}

export const parsePdf = internalAction({
  args: {
    rawText: v.string(),
    uploadHistoryId: v.id('uploadHistory'),
    monthYear: v.string(),
  },
  handler: async (ctx, { rawText, uploadHistoryId, monthYear }) => {
    const midpoint = Math.floor(rawText.length / 2)
    console.log(`rawText length: ${rawText.length}`)
    console.log(`rawText first 500:`, rawText.slice(0, 500))
    console.log(`rawText mid 500 (pos ${midpoint}):`, rawText.slice(midpoint, midpoint + 500))
    console.log(`rawText last 300:`, rawText.slice(-300))
    try {
      const days = await callOpenRouter(rawText, monthYear)
      if (days.length === 0) throw new Error('No daily entries extracted from PDF — all chunks returned empty')

      const activeTemplate = await ctx.runQuery(internal.templates.getActiveInternal, {})
      const config = activeTemplate?.config ?? DEFAULT_TEMPLATE_CONFIG

      let stored = 0
      const todayStr = new Date().toISOString().slice(0, 10)

      for (const day of days) {
        try {
          if (!day.title?.trim() || !day.body?.trim() || !day.date) {
            console.warn('Skipping day — missing fields:', JSON.stringify({ date: day.date, titleLen: day.title?.length, bodyLen: day.body?.length }))
            continue
          }

          const status: 'scheduled' | 'sent' | 'failed' | 'missing' =
            day.date < todayStr ? 'missing' : 'scheduled'

          const formattedMessage = renderMessage(day, config)

          await ctx.runMutation(internal.messageQueries.insertMessageInternal, {
            date: day.date,
            title: day.title,
            scripture: day.scripture,
            scriptureReference: day.scriptureReference,
            body: day.body,
            prayerPoints: day.prayerPoints,
            formattedMessage,
            status,
            monthYear,
          })
          stored++
        } catch (err) {
          console.error(`Failed to store day ${day.date}:`, err)
        }
      }

      await ctx.runMutation(internal.uploadOps.markComplete, {
        id: uploadHistoryId,
        daysDetected: stored,
      })
    } catch (err) {
      console.error('PDF parsing failed:', err)
      await ctx.runMutation(internal.uploadOps.markFailed, {
        id: uploadHistoryId,
      })
    }
  },
})
