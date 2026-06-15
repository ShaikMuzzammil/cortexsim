# CortexSim — Deployment Guide

A complete, end-to-end walkthrough for getting CortexSim onto GitHub and into production on Vercel (and a few alternatives). No prior Vercel experience needed.

---

## Contents

1. [Repository layout](#1-repository-layout)
2. [Local dev (sanity check first)](#2-local-dev-sanity-check-first)
3. [Push to GitHub](#3-push-to-github)
4. [.gitignore — what's excluded and why](#4-gitignore--whats-excluded-and-why)
5. [Environment variables](#5-environment-variables)
6. [Deploy to Vercel](#6-deploy-to-vercel)
7. [Build settings on Vercel](#7-build-settings-on-vercel)
8. [Post-deploy: first admin signup](#8-post-deploy-first-admin-signup)
9. [Custom domain](#9-custom-domain)
10. [Persistent storage (IMPORTANT for production)](#10-persistent-storage-important-for-production)
11. [Webhooks in production](#11-webhooks-in-production)
12. [Alternative hosts (Render, Fly, Railway, self-host)](#12-alternative-hosts)
13. [Troubleshooting](#13-troubleshooting)
14. [Hardening checklist](#14-hardening-checklist)

---

## 1. Repository layout

```
cortexsim/
├─ src/
│  ├─ app/                  # Next.js 14 App Router
│  │  ├─ page.tsx           # Public landing page
│  │  ├─ auth/              # /auth/login, /auth/signup
│  │  ├─ app/               # Authenticated workspace (dashboard, projects, …)
│  │  ├─ share/[token]/     # Public read-only shared project view
│  │  ├─ simulator/         # The SNN Studio
│  │  ├─ api/               # 20+ REST endpoints
│  │  └─ globals.css
│  ├─ components/
│  │  ├─ app/               # AppShell, AuthProvider, Markdown
│  │  ├─ landing/           # Hero, Pricing, FAQ, Navbar, …
│  │  ├─ studio/            # SNN studio UI
│  │  └─ ui/
│  ├─ lib/
│  │  ├─ client/api.ts      # browser fetch helper
│  │  ├─ server/            # file-backed store, auth, audit, webhooks, SSE
│  │  ├─ studio/            # studio activities + engine bus
│  │  └─ engine/snn.ts      # the SNN simulator
│  └─ types/                # shared TS types
├─ public/                  # static assets
├─ .env.example             # template – copy to .env.local
├─ .gitignore
├─ vercel.json              # Vercel build + headers config
├─ next.config.mjs
├─ tailwind.config.ts
├─ tsconfig.json             (path alias: @/* -> src/*)
├─ postcss.config.mjs
├─ package.json
└─ README.md
```

**Root directory for Vercel:** the repo root (`/`). Don't set a sub-path.

---

## 2. Local dev (sanity check first)

```bash
unzip cortexsim.zip
cd cortexsim

npm install
cp .env.example .env.local
# Edit .env.local and set CORTEXSIM_SECRET to a real value:
#   echo "CORTEXSIM_SECRET=$(openssl rand -hex 48)" >> .env.local

npm run dev
```

Open:

- <http://localhost:3000> — landing page
- <http://localhost:3000/auth/signup> — create the first admin account
- <http://localhost:3000/app> — workspace

If `npm run dev` works locally, the deploy will work on Vercel.

---

## 3. Push to GitHub

First time setup (skip if you already have the empty `cortexsim` repo on GitHub):

1. Create a new empty repo at <https://github.com/new>
   - Name: `cortexsim` (or anything you like)
   - Visibility: your choice
   - **Do not** initialize with README, .gitignore, or license — we'll push our own

Then from your local CortexSim folder:

```bash
cd cortexsim

# Initialize git (skip if already done)
git init -b main

# Configure the remote (replace with your repo URL)
git remote add origin https://github.com/YOUR-USER/cortexsim.git

# Stage + commit everything (the .gitignore below keeps .env, node_modules, etc out)
git add .
git commit -m "feat: CortexSim full-stack workspace + studio"

# Push
git push -u origin main
```

If you get `error: remote origin already exists`, run:

```bash
git remote set-url origin https://github.com/YOUR-USER/cortexsim.git
git push -u origin main
```

### Subsequent pushes

```bash
git add .
git commit -m "feat: …"
git push
```

Every push to `main` will trigger an automatic Vercel production deploy once the project is linked (see §6).

---

## 4. .gitignore — what's excluded and why

The shipped `.gitignore`:

```
# dependencies
/node_modules
/.pnp
.pnp.js

# next.js
/.next/
/out/

# production
/build
/dist

# misc
.DS_Store
*.pem
*.log

# debug
npm-debug.log*
yarn-debug.log*
pnpm-debug.log*
yarn-error.log*

# local env files
.env*.local
.env
!.env.example

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

# cortexsim file-backed workspace data (DEV ONLY)
.cortexsim-db/
*.cortexsim-db

# editors
.idea/
.vscode/
*.swp
*.swo

# misc OS files
Thumbs.db
```

Why each block matters:

- **`/node_modules`** — these are reinstalled by Vercel; never commit them.
- **`/.next/`** — Next.js build cache. Vercel rebuilds, so committing it wastes space.
- **`.env`, `.env*.local`** — your secrets. `!.env.example` keeps the template tracked so collaborators know what to set.
- **`.vercel`** — created when you run `vercel link`. Keep local-only.
- **`.cortexsim-db/`** — the local JSON workspace (users, projects, runs). **Never commit user data.**
- **`next-env.d.ts`** — auto-generated by Next.js on `dev`/`build`.

---

## 5. Environment variables

Copy `.env.example` -> `.env.local` for dev, and add the same keys in Vercel for Production + Preview.

| Variable | Required | Purpose |
|---|---|---|
| `CORTEXSIM_SECRET` | **Yes** (production) | Signs session cookies + API tokens. Generate with `openssl rand -hex 48`. Rotating it logs everyone out. |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Public origin used for share-link absolute URLs. e.g. `https://cortexsim.your-domain.com` |
| `CORTEXSIM_DATA_DIR` | Optional | Where the file-backed JSON store lives. Default `.cortexsim-db`. On Vercel set to `/tmp/cortexsim-db` (ephemeral) or migrate to a managed DB. |
| `CORTEXSIM_ADMIN_EMAIL` | Optional | Documentation hint. The first signup is auto-admin regardless. |
| `MONGODB_URI` / `DATABASE_URL` | Optional | Placeholders for future managed-DB swap. |
| `OPENAI_API_KEY` | Optional | Reserved for future Studio AI features. |
| `RESEND_API_KEY` / `EMAIL_FROM` | Optional | Reserved for password reset / invites. |
| `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` | Optional | Error reporting. |

### How to set them on Vercel

1. Open your project at <https://vercel.com/dashboard>
2. **Settings -> Environment Variables**
3. For each variable above:
   - **Key**: e.g. `CORTEXSIM_SECRET`
   - **Value**: paste the value
   - **Environments**: tick **Production**, **Preview**, and **Development**
4. Click **Save**.
5. Trigger a redeploy (Settings -> Deployments -> latest -> **Redeploy**) — env changes don't apply to running deployments.

### How to set them locally

```bash
cp .env.example .env.local
open .env.local   # or your editor
```

Never commit `.env.local`. It's already in `.gitignore`.

---

## 6. Deploy to Vercel

Two paths — pick one.

### Path A — Vercel dashboard (recommended, no CLI)

1. Sign in at <https://vercel.com/login> with GitHub.
2. Click **Add New… -> Project**.
3. **Import Git Repository -> select `cortexsim`**.
4. **Configure Project** screen:
   - **Framework Preset:** `Next.js` (auto-detected)
   - **Root Directory:** `./` (the repo root — **leave default**)
   - **Build Command:** `next build` (auto)
   - **Output Directory:** `.next` (auto)
   - **Install Command:** `npm install` (auto)
   - **Node.js Version:** 20.x (Vercel default; works fine)
5. Expand **Environment Variables** and add at minimum:
   - `CORTEXSIM_SECRET` = output of `openssl rand -hex 48`
   - `NEXT_PUBLIC_SITE_URL` = `https://your-project.vercel.app` (you can update later)
   - `CORTEXSIM_DATA_DIR` = `/tmp/cortexsim-db`  *(see §10 about persistence)*
6. Click **Deploy**. First build takes ~2 minutes.
7. When it succeeds, click **Visit** -> you're live.

Future pushes to `main` auto-deploy production; pushes to any other branch get a preview URL.

### Path B — Vercel CLI

```bash
npm i -g vercel
cd cortexsim
vercel login
vercel link            # link this folder to a new or existing Vercel project
vercel env add CORTEXSIM_SECRET production    # paste secret when prompted
vercel env add NEXT_PUBLIC_SITE_URL production
vercel --prod          # ship a production deploy
```

---

## 7. Build settings on Vercel

The shipped `vercel.json` already encodes the build + security headers:

```json
{
  "framework": "nextjs",
  "buildCommand": "next build",
  "installCommand": "npm install",
  "outputDirectory": ".next",
  "regions": ["iad1"]
}
```

- **Region:** `iad1` (US East). Change to `sfo1`, `fra1`, `sin1`, `bom1`, etc. closer to your users. `bom1` is Mumbai.
- **Headers:** `vercel.json` also adds `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, and `Cache-Control: no-store` for `/api/*`.

If the Vercel UI tries to override these, leave the dashboard fields blank and let `vercel.json` win.

### `next.config.mjs`

The shipped config disables TypeScript and ESLint *build* failures so a working app deploys even if you have a stray warning. Tighten this for stricter CI:

```js
export default {
  typescript: { ignoreBuildErrors: false },
  eslint:     { ignoreDuringBuilds: false },
}
```

---

## 8. Post-deploy: first admin signup

1. Open `https://your-deploy.vercel.app/auth/signup`
2. Enter email + name + a password ≥ 6 chars.
3. The first account is auto-promoted to **admin**.
4. You're redirected to `/app` — the dashboard.

Go to **Settings -> API tokens** to generate a token if you want to call the REST API from notebooks/scripts:

```bash
curl https://your-deploy.vercel.app/api/projects \
  -H "Authorization: Bearer cx_…"
```

---

## 9. Custom domain

1. **Settings -> Domains -> Add** in the Vercel dashboard.
2. Enter `cortexsim.your-domain.com` (or apex).
3. Vercel shows DNS records — add them in your DNS provider:
   - **CNAME** for subdomains: `cortexsim` -> `cname.vercel-dns.com`
   - **A** for apex: `76.76.21.21`
4. Wait for DNS propagation (usually < 5 min).
5. **Update `NEXT_PUBLIC_SITE_URL`** to the new domain and redeploy.

---

## 10. Persistent storage (IMPORTANT for production)

CortexSim's default store is a JSON file in `.cortexsim-db/`. On **serverless** platforms (Vercel, Netlify) the filesystem is **read-only except `/tmp`**, and `/tmp` is **ephemeral per invocation** — your data will not survive between deployments and may be lost between cold starts.

### Options ordered by effort

1. **Vercel preview / personal use:** set `CORTEXSIM_DATA_DIR=/tmp/cortexsim-db`. Data is ephemeral but the app works for demos.
2. **Vercel Blob / S3:** wrap `src/lib/server/store.ts` `readJSON`/`writeJSON` with a Blob client. Cheap and simple.
3. **Managed Mongo (Atlas) or Postgres (Neon, Supabase):** rewrite `store.ts` to use the driver. The package.json already includes `mongodb` so this is a small change.
4. **Self-host on a VM/Render/Fly:** keep the file-backed store; the filesystem is persistent.

For anything beyond a demo, **option 3** is recommended.

---

## 11. Webhooks in production

Webhooks are delivered via outbound `fetch` from the API routes. Make sure:

- Your destination URL is **publicly reachable HTTPS**.
- You verify the signature server-side:

```js
const sig = req.headers["x-cortexsim-signature"]; // "sha256=..."
const expected = "sha256=" + crypto.createHmac("sha256", WEBHOOK_SECRET).update(rawBody).digest("hex");
if (sig !== expected) return res.status(401).end();
```

- The `WEBHOOK_SECRET` is shown **once** when the webhook is created (Settings -> Webhooks). Store it in your downstream service's env.

---

## 12. Alternative hosts

### Render.com

1. New -> **Web Service** -> connect GitHub repo.
2. Build Command: `npm install && npm run build`
3. Start Command: `npm run start`
4. Add environment variables (same list as §5).
5. Render's filesystem is persistent — keep `CORTEXSIM_DATA_DIR=.cortexsim-db`.

### Fly.io

```bash
fly launch --name cortexsim
fly secrets set CORTEXSIM_SECRET=$(openssl rand -hex 48)
fly volumes create cortexsim_data --size 1
# mount volume at /app/.cortexsim-db in fly.toml
fly deploy
```

### Railway

Same as Render — `npm run build` / `npm run start`. Add the volume add-on for persistent storage.

### Self-host (Docker)

Minimal Dockerfile:

```Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm","run","start"]
```

```bash
docker build -t cortexsim .
docker run -d -p 3000:3000 \
  -e CORTEXSIM_SECRET=$(openssl rand -hex 48) \
  -v cortexsim_data:/app/.cortexsim-db \
  cortexsim
```

---

## 13. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Vercel build fails with `Module not found: …` | Path alias broken | Confirm `tsconfig.json` has `"paths": { "@/*": ["./src/*"] }`. |
| Build fails on `next/headers` | Tried to import in a client component | Use `"use client"` only where needed; `cookies()` is server-only. |
| Signup works but every reload signs me out | `CORTEXSIM_SECRET` is missing or different across instances | Set `CORTEXSIM_SECRET` in Vercel and redeploy. |
| 500 on `/api/*` calls | `.cortexsim-db` not writable | Set `CORTEXSIM_DATA_DIR=/tmp/cortexsim-db`. |
| Data disappears after a few hours on Vercel | Serverless filesystem is ephemeral | Migrate to Vercel Blob / managed DB (see §10). |
| Webhook deliveries show `lastStatus: 0` | DNS/firewall blocks outbound or URL is HTTP | Use a public HTTPS URL and check destination logs. |
| SSE never receives events | Some proxies buffer SSE | Make sure no CDN sits between client and `/api/events`; Vercel handles SSE natively. |
| Cmd+K opens but no results | API session not set | Sign in via `/auth/login` first. |

---

## 14. Hardening checklist

Before opening it to the public:

- [ ] `CORTEXSIM_SECRET` is set to a 96-char hex string and **rotated** if leaked.
- [ ] `NEXT_PUBLIC_SITE_URL` is set to the canonical URL.
- [ ] Persistent storage configured (Vercel Blob / managed DB).
- [ ] HTTPS only — Vercel does this automatically once a domain is added.
- [ ] Tighten `next.config.mjs` (turn TS/ESLint errors back on).
- [ ] Add Sentry / log drain.
- [ ] Restrict signups: edit `src/app/api/auth/signup/route.ts` to require an invite token or check the email domain.
- [ ] Rate-limit `/api/auth/*` with [Vercel Firewall](https://vercel.com/docs/security/vercel-firewall) or an upstash middleware.
- [ ] Schedule a backup of the data store.
- [ ] Audit log review every week (Activity page).

That's it — you're production-ready. Happy simulating.
