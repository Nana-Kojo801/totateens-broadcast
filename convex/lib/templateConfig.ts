import { v } from 'convex/values'
import type { Infer } from 'convex/values'

export const fontStyleValidator = v.union(
  v.literal('plain'),
  v.literal('boldSans'),
  v.literal('boldItalicSans'),
  v.literal('boldMono'),
  v.literal('italicSerif'),
  v.literal('boldItalicSerif'),
  v.literal('circled'),
)

export const templateConfigValidator = v.object({
  headerBanner: v.string(),
  ministryLine: v.string(),
  ministryBlockquote: v.boolean(),
  ministryStyle: fontStyleValidator,
  dateBlockquote: v.boolean(),
  dateStyle: fontStyleValidator,
  titleStyle: fontStyleValidator,
  subtitleStyle: fontStyleValidator,
  separatorA: v.string(),
  scriptureStyle: fontStyleValidator,
  levelUpLabel: v.string(),
  levelUpStyle: fontStyleValidator,
  levelUpPrefix: v.string(),
  levelUpSuffix: v.string(),
  separatorB: v.string(),
  prayerLabel: v.string(),
  prayerStyle: fontStyleValidator,
  prayerPrefix: v.string(),
  prayerSuffix: v.string(),
  prayerNumbering: v.boolean(),
  footerLines: v.array(v.string()),
})

export type TemplateConfig = Infer<typeof templateConfigValidator>

export const DEFAULT_TEMPLATE_CONFIG: TemplateConfig = {
  headerBanner: '🎺🎺🎺🎺🎺🎺🎺🎺🎺🎺🎺🎺🎺🎺🎺🎺🎺🎺🎺🎺🎺🎺🎺🎺🎺',
  ministryLine: '*TRUMPETS OF THE AGES DAILY DEVOTIONAL*',
  ministryBlockquote: false,
  ministryStyle: 'plain',
  dateBlockquote: false,
  dateStyle: 'plain',
  titleStyle: 'plain',
  subtitleStyle: 'plain',
  separatorA: '',
  scriptureStyle: 'plain',
  levelUpLabel: 'LEVEL UP',
  levelUpStyle: 'plain',
  levelUpPrefix: '*',
  levelUpSuffix: '*',
  separatorB: '',
  prayerLabel: 'Prayer Instruction:',
  prayerStyle: 'plain',
  prayerPrefix: '*',
  prayerSuffix: '*',
  prayerNumbering: true,
  footerLines: [
    "Visit www.totaonline.com for more edifying content🤗",
    'https://instagram.com/trumpets_of_the_ages?igshid=MzRlODBiNWFlZA==',
  ],
}
