import { check } from '@tauri-apps/plugin-updater'
import { relaunch } from '@tauri-apps/plugin-process'
import type { Update } from '@tauri-apps/plugin-updater'

export async function checkForUpdate(): Promise<Update | null> {
  const update = await check()
  return update?.available ? update : null
}

export async function installUpdate(update: Update): Promise<void> {
  await update.downloadAndInstall()
  await relaunch()
}
