import { mutation } from './_generated/server'
import { v } from 'convex/values'
import { renderMessage } from './lib/renderMessage'
import { DEFAULT_TEMPLATE_CONFIG } from './lib/templateConfig'

export const startReformat = mutation({
  args: { monthYear: v.string() },
  handler: async (ctx, { monthYear }) => {
    const messages = await ctx.db
      .query('messages')
      .withIndex('by_monthYear', (q) => q.eq('monthYear', monthYear))
      .take(31)
    if (messages.length === 0) {
      throw new Error(`No messages found for ${monthYear} to reformat`)
    }

    const activeTemplate = await ctx.db
      .query('messageTemplates')
      .withIndex('by_isActive', (q) => q.eq('isActive', true))
      .unique()
    const config = activeTemplate?.config ?? DEFAULT_TEMPLATE_CONFIG

    for (const m of messages) {
      const formattedMessage = renderMessage(m, config)
      await ctx.db.patch(m._id, { formattedMessage })
    }

    return { reformatted: messages.length }
  },
})
