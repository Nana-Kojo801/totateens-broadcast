import { query, mutation, internalQuery, internalMutation } from './_generated/server'
import { v } from 'convex/values'

export const listByMonth = query({
  args: { monthYear: v.string() },
  handler: async (ctx, { monthYear }) => {
    return await ctx.db
      .query('messages')
      .withIndex('by_monthYear', (q) => q.eq('monthYear', monthYear))
      .take(31)
  },
})

export const listByMonthInternal = internalQuery({
  args: { monthYear: v.string() },
  handler: async (ctx, { monthYear }) => {
    return await ctx.db
      .query('messages')
      .withIndex('by_monthYear', (q) => q.eq('monthYear', monthYear))
      .take(31)
  },
})

export const patchFormattedMessageInternal = internalMutation({
  args: { id: v.id('messages'), formattedMessage: v.string() },
  handler: async (ctx, { id, formattedMessage }) => {
    await ctx.db.patch(id, { formattedMessage })
  },
})

export const getByDate = query({
  args: { date: v.string() },
  handler: async (ctx, { date }) => {
    return await ctx.db
      .query('messages')
      .withIndex('by_date', (q) => q.eq('date', date))
      .unique()
  },
})

export const getByDateInternal = internalQuery({
  args: { date: v.string() },
  handler: async (ctx, { date }) => {
    return await ctx.db
      .query('messages')
      .withIndex('by_date', (q) => q.eq('date', date))
      .unique()
  },
})

export const getDashboardStats = query({
  args: { monthYear: v.string() },
  handler: async (ctx, { monthYear }) => {
    const messages = await ctx.db
      .query('messages')
      .withIndex('by_monthYear', (q) => q.eq('monthYear', monthYear))
      .take(31)
    const sent = messages.filter((m) => m.status === 'sent').length
    const nextScheduled = messages.find((m) => m.status === 'scheduled')
    return {
      total: messages.length,
      sent,
      remaining: messages.length - sent,
      nextMessage: nextScheduled ?? null,
    }
  },
})

export const updateMessage = mutation({
  args: {
    id: v.id('messages'),
    title: v.optional(v.string()),
    scripture: v.optional(v.string()),
    scriptureReference: v.optional(v.string()),
    body: v.optional(v.string()),
    prayerPoints: v.optional(v.array(v.string())),
    formattedMessage: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...updates }) => {
    await ctx.db.patch(id, updates)
  },
})

export const updateStatus = mutation({
  args: {
    id: v.id('messages'),
    status: v.union(
      v.literal('scheduled'),
      v.literal('sent'),
      v.literal('failed'),
      v.literal('missing'),
    ),
  },
  handler: async (ctx, { id, status }) => {
    await ctx.db.patch(id, { status })
  },
})

export const updateStatusInternal = internalMutation({
  args: {
    id: v.id('messages'),
    status: v.union(
      v.literal('scheduled'),
      v.literal('sent'),
      v.literal('failed'),
      v.literal('missing'),
    ),
  },
  handler: async (ctx, { id, status }) => {
    await ctx.db.patch(id, { status })
  },
})

export const insertMessage = mutation({
  args: {
    date: v.string(),
    title: v.string(),
    scripture: v.string(),
    scriptureReference: v.string(),
    body: v.string(),
    prayerPoints: v.array(v.string()),
    formattedMessage: v.string(),
    status: v.union(
      v.literal('scheduled'),
      v.literal('sent'),
      v.literal('failed'),
      v.literal('missing'),
    ),
    monthYear: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('messages')
      .withIndex('by_date', (q) => q.eq('date', args.date))
      .unique()
    if (existing) {
      await ctx.db.patch(existing._id, args)
      return existing._id
    }
    return await ctx.db.insert('messages', args)
  },
})

export const insertMessageInternal = internalMutation({
  args: {
    date: v.string(),
    title: v.string(),
    scripture: v.string(),
    scriptureReference: v.string(),
    body: v.string(),
    prayerPoints: v.array(v.string()),
    formattedMessage: v.string(),
    status: v.union(
      v.literal('scheduled'),
      v.literal('sent'),
      v.literal('failed'),
      v.literal('missing'),
    ),
    monthYear: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('messages')
      .withIndex('by_date', (q) => q.eq('date', args.date))
      .unique()
    if (existing) {
      await ctx.db.patch(existing._id, args)
      return existing._id
    }
    return await ctx.db.insert('messages', args)
  },
})

export const manualSend = mutation({
  args: {
    messageId: v.id('messages'),
    groupId: v.id('groups'),
    status: v.union(v.literal('success'), v.literal('failed')),
    error: v.optional(v.string()),
  },
  handler: async (ctx, { messageId, groupId, status, error }) => {
    // Failed manual sends aren't recorded — a "try again" that didn't go
    // through isn't broadcast history.
    if (status === 'failed') return
    await ctx.db.insert('sendHistory', {
      messageId,
      groupId,
      sentAt: Date.now(),
      status,
      error,
    })
  },
})
