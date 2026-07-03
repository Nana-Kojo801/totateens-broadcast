import { mutation, query, internalMutation } from './_generated/server'
import { v } from 'convex/values'
import { internal } from './_generated/api'
import type { Id } from './_generated/dataModel'

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl()
  },
})

export const storeFileAndParse = mutation({
  args: {
    storageId: v.id('_storage'),
    fileName: v.string(),
    monthYear: v.string(),
    rawText: v.string(),
  },
  handler: async (ctx, args): Promise<Id<'uploadHistory'>> => {
    const uploadId = await ctx.db.insert('uploadHistory', {
      fileName: args.fileName,
      monthYear: args.monthYear,
      uploadedAt: Date.now(),
      daysDetected: 0,
      status: 'processing',
      storageId: args.storageId,
    })

    await ctx.scheduler.runAfter(0, internal.uploadAction.parsePdf, {
      rawText: args.rawText,
      uploadHistoryId: uploadId,
      monthYear: args.monthYear,
    })

    return uploadId
  },
})

export const markComplete = internalMutation({
  args: { id: v.id('uploadHistory'), daysDetected: v.number() },
  handler: async (ctx, { id, daysDetected }) => {
    await ctx.db.patch(id, { status: 'complete', daysDetected })
  },
})

export const markFailed = internalMutation({
  args: { id: v.id('uploadHistory') },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, { status: 'failed' })
  },
})

export const resetStuckUpload = mutation({
  args: { monthYear: v.string() },
  handler: async (ctx, { monthYear }) => {
    const stuck = await ctx.db
      .query('uploadHistory')
      .withIndex('by_monthYear', (q) => q.eq('monthYear', monthYear))
      .filter((q) => q.eq(q.field('status'), 'processing'))
      .collect()
    for (const u of stuck) {
      await ctx.db.patch(u._id, { status: 'failed' })
    }
  },
})

export const clearAllData = mutation({
  args: {},
  handler: async (ctx) => {
    const [messages, uploads, history] = await Promise.all([
      ctx.db.query('messages').collect(),
      ctx.db.query('uploadHistory').collect(),
      ctx.db.query('sendHistory').collect(),
    ])
    await Promise.all([
      ...messages.map((d) => ctx.db.delete(d._id)),
      ...uploads.map((d) => ctx.db.delete(d._id)),
      ...history.map((d) => ctx.db.delete(d._id)),
      ...uploads.filter((u) => u.storageId).map((u) => ctx.storage.delete(u.storageId!)),
    ])
    return { deleted: messages.length + uploads.length + history.length }
  },
})

export const listUploads = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('uploadHistory')
      .withIndex('by_uploadedAt')
      .order('desc')
      .take(20)
  },
})

export const getLatestUpload = query({
  args: { monthYear: v.string() },
  handler: async (ctx, { monthYear }) => {
    return await ctx.db
      .query('uploadHistory')
      .withIndex('by_monthYear', (q) => q.eq('monthYear', monthYear))
      .order('desc')
      .first()
  },
})
