import { query, mutation, internalQuery } from './_generated/server'
import { v } from 'convex/values'
import { templateConfigValidator, DEFAULT_TEMPLATE_CONFIG } from './lib/templateConfig'

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('messageTemplates').withIndex('by_createdAt').order('desc').take(50)
  },
})

export const getById = query({
  args: { id: v.id('messageTemplates') },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id)
  },
})

export const getActive = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('messageTemplates')
      .withIndex('by_isActive', (q) => q.eq('isActive', true))
      .unique()
  },
})

export const getActiveInternal = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('messageTemplates')
      .withIndex('by_isActive', (q) => q.eq('isActive', true))
      .unique()
  },
})

export const create = mutation({
  args: { name: v.string(), config: templateConfigValidator },
  handler: async (ctx, { name, config }) => {
    return await ctx.db.insert('messageTemplates', {
      name,
      config,
      isActive: false,
      createdAt: Date.now(),
    })
  },
})

export const update = mutation({
  args: { id: v.id('messageTemplates'), name: v.string(), config: templateConfigValidator },
  handler: async (ctx, { id, name, config }) => {
    await ctx.db.patch(id, { name, config })
  },
})

export const setActive = mutation({
  args: { id: v.id('messageTemplates') },
  handler: async (ctx, { id }) => {
    const current = await ctx.db
      .query('messageTemplates')
      .withIndex('by_isActive', (q) => q.eq('isActive', true))
      .collect()
    for (const t of current) {
      if (t._id !== id) await ctx.db.patch(t._id, { isActive: false })
    }
    await ctx.db.patch(id, { isActive: true })
  },
})

export const seedDefault = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query('messageTemplates').withIndex('by_createdAt').collect()
    if (existing.some((t) => t.name === 'Default')) return
    const hasActive = existing.some((t) => t.isActive)
    await ctx.db.insert('messageTemplates', {
      name: 'Default',
      config: DEFAULT_TEMPLATE_CONFIG,
      isActive: !hasActive,
      createdAt: Date.now(),
    })
  },
})

export const remove = mutation({
  args: { id: v.id('messageTemplates') },
  handler: async (ctx, { id }) => {
    // Deleting the active template is allowed — every renderer falls back to
    // DEFAULT_TEMPLATE_CONFIG when no template is active, so there's no
    // broken state to guard against. The frontend warns the user about this
    // before they confirm.
    await ctx.db.delete(id)
  },
})
