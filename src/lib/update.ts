import { check } from '@tauri-apps/plugin-updater'
import { relaunch } from '@tauri-apps/plugin-process'
import type { Update } from '@tauri-apps/plugin-updater'

// The GitHub repo is private, so both the manifest check and the actual
// installer download need auth against GitHub's release-asset URLs — a PAT
// scoped to read-only on just this repo, baked in at build time via a
// GitHub Actions secret (never committed — see release.yml).
const authHeaders: HeadersInit | undefined = import.meta.env.VITE_GITHUB_UPDATE_TOKEN
  ? { Authorization: `Bearer ${import.meta.env.VITE_GITHUB_UPDATE_TOKEN as string}` }
  : undefined

export async function checkForUpdate(): Promise<Update | null> {
  const update = await check({ headers: authHeaders })
  return update?.available ? update : null
}

export async function installUpdate(update: Update): Promise<void> {
  await update.downloadAndInstall(undefined, { headers: authHeaders })
  await relaunch()
}
