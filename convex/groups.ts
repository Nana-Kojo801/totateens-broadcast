import { query, mutation, internalQuery } from './_generated/server'
import { v } from 'convex/values'

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('groups')
      .withIndex('by_createdAt')
      .order('desc')
      .take(100)
  },
})

export const listActive = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('groups')
      .withIndex('by_isActive', (q) => q.eq('isActive', true))
      .take(100)
  },
})

export const listActiveInternal = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('groups')
      .withIndex('by_isActive', (q) => q.eq('isActive', true))
      .take(100)
  },
})

export const add = mutation({
  args: {
    name: v.string(),
    whatsappId: v.string(),
    mode: v.union(v.literal('link'), v.literal('id')),
  },
  handler: async (ctx, { name, whatsappId, mode }) => {
    if (mode === 'id' && !whatsappId.endsWith('@g.us')) {
      throw new Error('Group ID must end in @g.us')
    }
    return await ctx.db.insert('groups', {
      name,
      whatsappId,
      isActive: true,
      createdAt: Date.now(),
    })
  },
})

export const toggleActive = mutation({
  args: { id: v.id('groups') },
  handler: async (ctx, { id }) => {
    const group = await ctx.db.get(id)
    if (!group) throw new Error('Group not found')
    await ctx.db.patch(id, { isActive: !group.isActive })
  },
})

export const remove = mutation({
  args: { id: v.id('groups') },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id)
  },
})
