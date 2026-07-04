import { check } from '@tauri-apps/plugin-updater'
import { relaunch } from '@tauri-apps/plugin-process'
import { invoke } from '@tauri-apps/api/core'
import type { Update } from '@tauri-apps/plugin-updater'

export async function checkForUpdate(): Promise<Update | null> {
  const update = await check()
  return update?.available ? update : null
}

export async function installUpdate(update: Update): Promise<void> {
  // The sidecar must release its exe file before the installer can
  // overwrite it, otherwise Windows throws a file-in-use popup mid-install.
  await invoke('shutdown_sidecar')
  await update.downloadAndInstall()
  await relaunch()
}
