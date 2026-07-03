export type FontStyle =
  | 'plain'
  | 'boldSans'
  | 'boldItalicSans'
  | 'boldMono'
  | 'italicSerif'
  | 'boldItalicSerif'
  | 'circled'

const UPPER_A = 65
const LOWER_A = 97
const DIGIT_0 = 48

// Mathematical Alphanumeric Symbols block bases (Unicode). Bases for
// boldItalicSans, boldMono, and boldItalicSerif were verified character-by-
// character against a real template example rather than assumed.
const BASES: Record<Exclude<FontStyle, 'plain' | 'circled'>, { upper: number; lower: number; digit: number | null }> = {
  boldSans: { upper: 0x1d5d4, lower: 0x1d5ee, digit: 0x1d7ec },
  boldItalicSans: { upper: 0x1d63c, lower: 0x1d656, digit: null },
  boldMono: { upper: 0x1d670, lower: 0x1d68a, digit: 0x1d7f6 },
  italicSerif: { upper: 0x1d434, lower: 0x1d44e, digit: null },
  boldItalicSerif: { upper: 0x1d468, lower: 0x1d482, digit: null },
}

// Plain italic serif has one historical hold-out: lowercase 'h' maps to the
// pre-existing Planck constant symbol instead of the contiguous math block.
const ITALIC_H = 'ℎ'

// "Negative circled Latin capital letter" block — uppercase only, no digits.
const CIRCLED_UPPER_BASE = 0x1f150

export function applyFontStyle(text: string, style: FontStyle): string {
  if (style === 'plain') return text

  if (style === 'circled') {
    return text
      .toUpperCase()
      .split('')
      .map((ch) => {
        const code = ch.charCodeAt(0)
        if (code >= UPPER_A && code < UPPER_A + 26) {
          return String.fromCodePoint(CIRCLED_UPPER_BASE + (code - UPPER_A))
        }
        return ch
      })
      .join('')
  }

  const base = BASES[style]
  return text
    .split('')
    .map((ch) => {
      const code = ch.charCodeAt(0)
      if (style === 'italicSerif' && ch === 'h') return ITALIC_H
      if (code >= UPPER_A && code < UPPER_A + 26) {
        return String.fromCodePoint(base.upper + (code - UPPER_A))
      }
      if (code >= LOWER_A && code < LOWER_A + 26) {
        return String.fromCodePoint(base.lower + (code - LOWER_A))
      }
      if (base.digit !== null && code >= DIGIT_0 && code < DIGIT_0 + 10) {
        return String.fromCodePoint(base.digit + (code - DIGIT_0))
      }
      return ch
    })
    .join('')
}

// Reverse lookup: codepoint -> { plain ascii char, style it belongs to }.
// Built once at module load from the same BASES table used to encode.
const REVERSE: Map<number, { ch: string; style: FontStyle }> = (() => {
  const map = new Map<number, { ch: string; style: FontStyle }>()
  for (const styleKey of Object.keys(BASES) as Array<keyof typeof BASES>) {
    const base = BASES[styleKey]
    for (let i = 0; i < 26; i++) {
      map.set(base.upper + i, { ch: String.fromCharCode(UPPER_A + i), style: styleKey })
      map.set(base.lower + i, { ch: String.fromCharCode(LOWER_A + i), style: styleKey })
    }
    if (base.digit !== null) {
      for (let i = 0; i < 10; i++) {
        map.set(base.digit + i, { ch: String.fromCharCode(DIGIT_0 + i), style: styleKey })
      }
    }
  }
  for (let i = 0; i < 26; i++) {
    map.set(CIRCLED_UPPER_BASE + i, { ch: String.fromCharCode(UPPER_A + i), style: 'circled' })
  }
  map.set(ITALIC_H.codePointAt(0)!, { ch: 'h', style: 'italicSerif' })
  return map
})()

// Reverses applyFontStyle: given text that may mix styled Unicode letters
// with plain punctuation/emoji, returns the plain-ASCII text plus whichever
// style accounted for the most letters (majority vote — punctuation/emoji
// don't count since they carry no style information).
export function stripFontStyle(text: string): { plain: string; style: FontStyle } {
  const counts: Partial<Record<FontStyle, number>> = {}
  let plain = ''
  for (const ch of text) {
    const code = ch.codePointAt(0)!
    const hit = REVERSE.get(code)
    if (hit) {
      plain += hit.ch
      counts[hit.style] = (counts[hit.style] ?? 0) + 1
    } else {
      plain += ch
    }
  }
  let style: FontStyle = 'plain'
  let best = 0
  for (const [s, n] of Object.entries(counts)) {
    if (n > best) { best = n; style = s as FontStyle }
  }
  return { plain, style }
}

function isLetterLike(ch: string): boolean {
  if (/[a-zA-Z0-9]/.test(ch)) return true
  return REVERSE.has(ch.codePointAt(0)!)
}

// Peels non-letter bookends (emoji, asterisks, spaces) off a line, then
// de-styles the remaining core. Used to recover a template's label text,
// prefix/suffix decoration, and font style from one line of a real example
// — e.g. "🙏𝙿𝚁𝙰𝚈𝙴𝚁🙏" -> { prefix: '🙏', label: 'PRAYER', suffix: '🙏', style: 'boldMono' }.
export function extractLabelParts(line: string): { prefix: string; label: string; suffix: string; style: FontStyle } {
  const chars = Array.from(line.trim())
  let start = 0
  while (start < chars.length && !isLetterLike(chars[start])) start++
  let end = chars.length - 1
  while (end >= start && !isLetterLike(chars[end])) end--

  const prefix = chars.slice(0, start).join('')
  const core = chars.slice(start, end + 1).join('')
  const suffix = chars.slice(end + 1).join('')
  const { plain, style } = stripFontStyle(core)
  return { prefix, label: plain, suffix, style }
}

export const FONT_STYLES: { value: FontStyle; label: string; sample: string }[] = [
  { value: 'plain', label: 'Plain', sample: applyFontStyle('Sample Aa1', 'plain') },
  { value: 'boldSans', label: 'Bold sans', sample: applyFontStyle('Sample Aa1', 'boldSans') },
  { value: 'boldItalicSans', label: 'Bold italic sans', sample: applyFontStyle('Sample Aa1', 'boldItalicSans') },
  { value: 'boldMono', label: 'Bold monospace', sample: applyFontStyle('Sample Aa1', 'boldMono') },
  { value: 'italicSerif', label: 'Italic serif', sample: applyFontStyle('Sample Aa1', 'italicSerif') },
  { value: 'boldItalicSerif', label: 'Bold italic serif', sample: applyFontStyle('Sample Aa1', 'boldItalicSerif') },
  { value: 'circled', label: 'Circled (caps only)', sample: applyFontStyle('SAMPLE', 'circled') },
]
