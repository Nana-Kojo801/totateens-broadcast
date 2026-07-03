import { query } from './_generated/server'
import { v } from 'convex/values'
import { paginationOptsValidator } from 'convex/server'

export const listPaginated = query({
  args: {
    paginationOpts: paginationOptsValidator,
    monthYear: v.optional(v.string()),
    status: v.optional(v.union(v.literal('success'), v.literal('failed'))),
  },
  handler: async (ctx, { paginationOpts, monthYear: _monthYear, status: _status }) => {
    const page = await ctx.db
      .query('sendHistory')
      .withIndex('by_sentAt')
      .order('desc')
      .paginate(paginationOpts)

    const enriched = await Promise.all(
      page.page.map(async (h) => {
        const message = await ctx.db.get(h.messageId)
        const group = await ctx.db.get(h.groupId)
        return {
          ...h,
          messageTitle: message?.title ?? 'Unknown',
          messageDate: message?.date ?? '',
          groupName: group?.name ?? 'Unknown',
        }
      }),
    )

    return { ...page, page: enriched }
  },
})

export const listRecent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const rows = await ctx.db
      .query('sendHistory')
      .withIndex('by_sentAt')
      .order('desc')
      .take(limit ?? 5)

    return await Promise.all(
      rows.map(async (h) => {
        const message = await ctx.db.get(h.messageId)
        const group = await ctx.db.get(h.groupId)
        return {
          ...h,
          messageTitle: message?.title ?? 'Unknown',
          messageDate: message?.date ?? '',
          groupName: group?.name ?? 'Unknown',
        }
      }),
    )
  },
})
