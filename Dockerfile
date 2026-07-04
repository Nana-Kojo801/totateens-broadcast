FROM node:22-bookworm-slim

# Chromium runtime deps (fonts + dbus) — matches Puppeteer's own reference
# Dockerfile. Chrome itself installed further down via `--install-deps`,
# which also apt-installs its own runtime libs — so the apt package index
# is intentionally NOT cleaned up here (only after that step, at the end),
# otherwise that later apt-get has nothing to resolve packages against.
RUN apt-get update && apt-get install -y --no-install-recommends \
    fonts-liberation \
    fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-khmeros fonts-kacst fonts-freefont-ttf \
    dbus dbus-x11 \
    ca-certificates

RUN corepack enable && corepack prepare pnpm@10 --activate

WORKDIR /app

# Only what's needed to install deps + build the server — the frontend
# (src/, convex/) isn't part of this image; it deploys separately to Netlify.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY server ./server

RUN pnpm install --frozen-lockfile

# Installs Chrome for Puppeteer AND the exact system libraries it needs to
# run — auto-detected for the current OS, more reliable than a hand-picked
# apt package list that drifts as Chrome versions change.
RUN npx puppeteer browsers install chrome --install-deps \
    && rm -rf /var/lib/apt/lists/*

RUN pnpm run build:server

ENV NODE_ENV=production

CMD ["node", "server/dist/index.js"]
