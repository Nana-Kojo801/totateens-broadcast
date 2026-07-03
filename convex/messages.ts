'use node'

import { internalAction } from './_generated/server'
import { internal } from './_generated/api'
import { v } from 'convex/values'
import type { Doc } from './_generated/dataModel'

// This file's action bodies get transitively type-checked under the
// frontend's browser-only tsconfig too (every page imports `api` from
// `_generated/api`, which references every convex module's types) — that
// config doesn't have Node's ambient types, so `process` needs a local shim.
declare const process: { env: Record<string, string | undefined> }

export const checkAndSendDaily = internalAction({
  args: {},
  handler: async (ctx): Promise<void> => {
    const settings = await ctx.runQuery(internal.appSettings.getInternal, {})
    const now = new Date()
    const nowMinutes = now.getUTCHours() * 60 + now.getUTCMinutes()
    const targetMinutes = settings.sendHour * 60 + settings.sendMinute

    // Fires from a 5-minute interval cron — only act on the single window
    // that contains the configured send time.
    if (nowMinutes < targetMinutes || nowMinutes >= targetMinutes + 5) return

    await ctx.runAction(internal.messages.sendDailyMessage, {})
  },
})

export const sendDailyMessage = internalAction({
  args: {},
  handler: async (ctx) => {
    const now = new Date()
    const date = now.toISOString().slice(0, 10)

    const message: Doc<'messages'> | null = await ctx.runQuery(
      internal.messageQueries.getByDateInternal,
      { date },
    )

    if (!message || message.status !== 'scheduled') {
      console.log(`No scheduled message for ${date}`)
      return
    }

    const groups: Doc<'groups'>[] = await ctx.runQuery(
      internal.groups.listActiveInternal,
      {},
    )

    if (groups.length === 0) {
      console.log('No active groups to send to')
      return
    }

    const serverUrl = process.env.WHATSAPP_SERVER_URL
    const apiKey = process.env.WHATSAPP_API_KEY

    if (!serverUrl || !apiKey) {
      console.error('Missing WHATSAPP_SERVER_URL or WHATSAPP_API_KEY env vars')
      return
    }

    let allSuccess = true
    let anySuccess = false

    for (const group of groups) {
      try {
        const res = await fetch(`${serverUrl}/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
          },
          body: JSON.stringify({
            groupId: group.whatsappId,
            message: message.formattedMessage,
          }),
        })
        const json = (await res.json()) as { success: boolean; error?: string }

        await ctx.runMutation(internal.messageQueries.logSend, {
          messageId: message._id,
          groupId: group._id,
          sentAt: Date.now(),
          status: json.success ? 'success' : 'failed',
          error: json.success ? undefined : (json.error ?? 'unknown error'),
        })

        if (json.success) {
          anySuccess = true
        } else {
          allSuccess = false
        }
      } catch (err) {
        allSuccess = false
        await ctx.runMutation(internal.messageQueries.logSend, {
          messageId: message._id,
          groupId: group._id,
          sentAt: Date.now(),
          status: 'failed',
          error: String(err),
        })
      }
    }

    const newStatus = allSuccess ? 'sent' : anySuccess ? 'sent' : 'failed'
    await ctx.runMutation(internal.messageQueries.updateStatusInternal, {
      id: message._id,
      status: newStatus,
    })

    console.log(`Daily send complete. Status: ${newStatus}`)
  },
})

export const sendManual = internalAction({
  args: {
    messageId: v.id('messages'),
    formattedMessage: v.string(),
    waServerUrl: v.string(),
    apiKey: v.string(),
  },
  handler: async (ctx, { messageId, formattedMessage, waServerUrl, apiKey }) => {
    const groups: Doc<'groups'>[] = await ctx.runQuery(
      internal.groups.listActiveInternal,
      {},
    )

    for (const group of groups) {
      try {
        const res = await fetch(`${waServerUrl}/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
          },
          body: JSON.stringify({
            groupId: group.whatsappId,
            message: formattedMessage,
          }),
        })
        const json = (await res.json()) as { success: boolean; error?: string }

        await ctx.runMutation(internal.messageQueries.logSend, {
          messageId,
          groupId: group._id,
          sentAt: Date.now(),
          status: json.success ? 'success' : 'failed',
          error: json.success ? undefined : (json.error ?? 'send failed'),
        })
      } catch (err) {
        await ctx.runMutation(internal.messageQueries.logSend, {
          messageId,
          groupId: group._id,
          sentAt: Date.now(),
          status: 'failed',
          error: String(err),
        })
      }
    }

    await ctx.runMutation(internal.messageQueries.updateStatusInternal, {
      id: messageId,
      status: 'sent',
    })
  },
})
