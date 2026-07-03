import { query, mutation, internalQuery } from './_generated/server'
import { v } from 'convex/values'

export const DEFAULT_SEND_HOUR = 2
export const DEFAULT_SEND_MINUTE = 0

export const get = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db.query('appSettings').first()
    return {
      sendHour: settings?.sendHour ?? DEFAULT_SEND_HOUR,
      sendMinute: settings?.sendMinute ?? DEFAULT_SEND_MINUTE,
    }
  },
})

export const getInternal = internalQuery({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db.query('appSettings').first()
    return {
      sendHour: settings?.sendHour ?? DEFAULT_SEND_HOUR,
      sendMinute: settings?.sendMinute ?? DEFAULT_SEND_MINUTE,
    }
  },
})

export const update = mutation({
  args: { sendHour: v.number(), sendMinute: v.number() },
  handler: async (ctx, { sendHour, sendMinute }) => {
    const existing = await ctx.db.query('appSettings').first()
    if (existing) {
      await ctx.db.patch(existing._id, { sendHour, sendMinute })
    } else {
      await ctx.db.insert('appSettings', { sendHour, sendMinute })
    }
  },
})
