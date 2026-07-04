import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'
import { templateConfigValidator } from './lib/templateConfig'

export default defineSchema({
  messages: defineTable({
    date: v.string(),
    title: v.string(),
    subtitle: v.optional(v.string()),
    scripture: v.string(),
    scriptureReference: v.string(),
    body: v.string(),
    prayerPoints: v.array(v.string()),
    // Overrides the template's default section heading (e.g. "MUST DO",
    // "Proclamation") for this specific day — the content underneath is
    // still whatever's in `prayerPoints`. Falls back to the active
    // template's `prayerLabel` when not set.
    prayerLabel: v.optional(v.string()),
    vocabWord: v.optional(v.string()),
    vocabDefinition: v.optional(v.string()),
    quote: v.optional(v.string()),
    formattedMessage: v.string(),
    status: v.union(
      v.literal('scheduled'),
      v.literal('sent'),
      v.literal('failed'),
      v.literal('missing'),
    ),
    monthYear: v.string(),
  })
    .index('by_date', ['date'])
    .index('by_monthYear', ['monthYear'])
    .index('by_monthYear_and_status', ['monthYear', 'status']),

  groups: defineTable({
    name: v.string(),
    whatsappId: v.string(),
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index('by_createdAt', ['createdAt'])
    .index('by_isActive', ['isActive']),

  sendHistory: defineTable({
    messageId: v.id('messages'),
    groupId: v.id('groups'),
    sentAt: v.number(),
    status: v.union(v.literal('success'), v.literal('failed')),
    error: v.optional(v.string()),
  })
    .index('by_sentAt', ['sentAt'])
    .index('by_messageId', ['messageId'])
    .index('by_groupId', ['groupId']),

  uploadHistory: defineTable({
    fileName: v.string(),
    monthYear: v.string(),
    uploadedAt: v.number(),
    daysDetected: v.number(),
    status: v.union(
      v.literal('processing'),
      v.literal('complete'),
      v.literal('failed'),
    ),
    storageId: v.optional(v.id('_storage')),
    // Legacy fields from a removed AI-progress-tracking path; kept optional
    // so pre-existing rows stay schema-valid. No code writes these anymore.
    totalDays: v.optional(v.number()),
    processedDays: v.optional(v.number()),
    stage: v.optional(v.union(v.literal('extracting'), v.literal('formatting'))),
  })
    .index('by_uploadedAt', ['uploadedAt'])
    .index('by_monthYear', ['monthYear']),

  messageTemplates: defineTable({
    name: v.string(),
    config: templateConfigValidator,
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index('by_isActive', ['isActive'])
    .index('by_createdAt', ['createdAt']),
})
