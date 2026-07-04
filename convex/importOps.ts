import { mutation } from './_generated/server'
import { v } from 'convex/values'
import { renderMessage } from './lib/renderMessage'
import { DEFAULT_TEMPLATE_CONFIG } from './lib/templateConfig'

export const startImport = mutation({
  args: {
    monthYear: v.string(),
    fileName: v.string(),
    days: v.array(
      v.object({
        date: v.string(),
        title: v.string(),
        subtitle: v.optional(v.string()),
        scripture: v.string(),
        scriptureReference: v.string(),
        body: v.string(),
        prayerPoints: v.array(v.string()),
        prayerLabel: v.optional(v.string()),
        vocabWord: v.optional(v.string()),
        vocabDefinition: v.optional(v.string()),
        quote: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, { monthYear, fileName, days }) => {
    const activeTemplate = await ctx.db
      .query('messageTemplates')
      .withIndex('by_isActive', (q) => q.eq('isActive', true))
      .unique()
    const config = activeTemplate?.config ?? DEFAULT_TEMPLATE_CONFIG

    const todayStr = new Date().toISOString().slice(0, 10)
    let stored = 0

    for (const day of days) {
      const status: 'scheduled' | 'missing' = day.date < todayStr ? 'missing' : 'scheduled'
      const doc = { ...day, formattedMessage: renderMessage(day, config), status, monthYear }

      const existing = await ctx.db
        .query('messages')
        .withIndex('by_date', (q) => q.eq('date', day.date))
        .unique()
      if (existing) {
        await ctx.db.patch(existing._id, doc)
      } else {
        await ctx.db.insert('messages', doc)
      }
      stored++
    }

    await ctx.db.insert('uploadHistory', {
      fileName,
      monthYear,
      uploadedAt: Date.now(),
      daysDetected: stored,
      status: 'complete',
    })

    return { imported: stored }
  },
})
