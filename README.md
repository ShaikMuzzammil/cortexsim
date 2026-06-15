# CortexSim Studio

> **The browser-native studio for spiking neural networks.** Build, tune, visualize, analyze, learn and share biologically-inspired neural dynamics - no install, no GPU, no cluster. One Next.js app with an authenticated workspace, a REST API, a 13-guide learning platform, an interactive practice engine, and 15 export formats.

**Version 7.0.0** &middot; Next.js 14 &middot; React 18 &middot; TypeScript 5 &middot; Tailwind 3 &middot; Framer Motion 11

This is the **single source of truth** for the project. Everything you need - what it is, why it matters, how it is built, how to run it, and how to deploy it to Vercel from GitHub - lives in this one file.

---

## Table of contents

1. [Why CortexSim matters](#1-why-cortexsim-matters)
2. [Feature overview](#2-feature-overview)
3. [The six studio domains](#3-the-six-studio-domains)
4. [Learning platform](#4-learning-platform)
5. [Export Center (15 formats)](#5-export-center-15-formats)
6. [Tech stack](#6-tech-stack)
7. [Project structure](#7-project-structure)
8. [Getting started (local)](#8-getting-started-local)
9. [Environment variables](#9-environment-variables)
10. [Push to GitHub](#10-push-to-github)
11. [Deploy to Vercel](#11-deploy-to-vercel)
12. [Data persistence](#12-data-persistence)
13. [REST API reference](#13-rest-api-reference)
14. [Scripts](#14-scripts)
15. [Troubleshooting](#15-troubleshooting)
16. [Roadmap](#16-roadmap)

---

## 1. Why CortexSim matters

Understanding the brain is one of science's hardest problems, and spiking neural networks (SNNs) are the closest practical model we have of how real neurons compute. But SNNs are normally locked behind heavy Python stacks, CUDA, and HPC clusters. CortexSim removes those barriers.

- **Makes the invisible visible.** Spiking dynamics unfold in milliseconds across thousands of cells. CortexSim slows them down and paints them on screen so you can reason about emergent behaviour.
- **Lowers the barrier to neuroscience.** A browser tab is enough to explore balance, oscillations and plasticity. No setup, no hardware.
- **Bridges theory and practice.** Every concept ships with a guide, a glossary entry and a hands-on module. Read it, then break it, tune it and measure it.
- **Prototypes neuromorphic ideas.** Validate sparse, event-driven circuits before they touch Loihi or SpiNNaker - saving hardware iterations and energy.
- **Reproducible and shareable.** Seeded runs, exportable state and read-only share links mean any result can be rebuilt exactly and sent to a colleague.
- **Runs anywhere, owns its data.** Deploy to Vercel in minutes or self-host forever.

---

## 2. Feature overview

### Marketing site
A polished, animated landing page with: Hero, Features, **Why it matters (Importance)**, live Metrics band, Platform preview, Use cases, **How it works (4-step guide)**, Tech stack, Integrations, Showcase, Comparison table, Pricing, Testimonials, FAQ, Roadmap, Learn callout and CTA. Scroll progress bar and section-aware navbar throughout.

### Authenticated workspace (`/app`)
- Email + password auth with salted **scrypt** hashing and HMAC-signed session cookies.
- Projects, runs, datasets, notes and comments with a file-backed (or MongoDB) store.
- **Insights** dashboard, **Compare** runs (2-4 side by side), global **Search** with Cmd+K palette, **Activity** audit log.
- **Export Center** with 15 downloadable formats.
- **Share** links (public read-only), **Webhooks** (HMAC-signed outgoing events), **API tokens**, bundled **API docs** and a **Changelog**.

### Studio (`/simulator`)
- A shared spiking-network engine with a real-time event bus that keeps every panel in sync.
- **35 modules** across **6 domains**, each with its own controls, animated canvas, readouts and education panel (why it matters, applications, knowledge, try-this, and the relevant stack).

### Learning platform (`/learn`)
- **13 in-depth guides**, a curriculum **mind map**, a **glossary**, a **tips** library and an **interactive practice/quiz** engine.

---

## 3. The six studio domains

Each domain groups focused modules. Every module includes objectives, live controls, an animated visualization, numeric readouts, and an education panel.

| Domain | Focus | Example modules |
|---|---|---|
| **Visualization** | Seeing activity | Raster plot, membrane traces, population heatmap, 3D network |
| **Analysis** | Measuring activity | Power spectrum, spectrogram, synchrony, ISI histogram, information theory |
| **Dynamics & Learning** | How activity evolves | STDP plasticity, oscillations, attractors, criticality, homeostasis |
| **Connectivity** | Network structure | Topology builder, small-world, balanced networks, motifs |
| **Performance & Systems** | Scale & efficiency | Benchmarks, sparsity, neuromorphic energy, batching |
| **Data & Protocols** | Reproducible science | Datasets, seeding, export protocols, run capture |

---

## 4. Learning platform

- **13 guides** spanning five categories: Basics, Neuroscience, Networks, Analysis and Workflow. Topics include getting started, integrate-and-fire neurons, exporting data, oscillations & rhythms, balanced networks, information theory, neuromorphic computing and reproducible research.
- **Mind map** (`/learn/map`) shows the whole syllabus as a branching graph with mastery tracking.
- **Glossary** (`/glossary`) - every term in plain language, searchable.
- **Tips** (`/tips`) - field-tested workflow tips plus the full keyboard reference.
- **Practice** (`/learn/practice`) - an **interactive knowledge check** with 17 questions across six domains. Pick answers, check your work, get instant per-question explanations, filter by domain, see your score, and keep private learning notes saved in your browser. This is hands-on, user-input learning, not passive reading.

---

## 5. Export Center (15 formats)

Open **Export Center** in the workspace (`/app/exports`), tune a demo run, and download to any tool. The same engine powers in-studio exports. Formats are grouped:

| Group | Formats |
|---|---|
| **Raw data** | CSV, TSV, NDJSON, JSON state |
| **Reports** | Markdown, standalone HTML, YAML config |
| **Figures** | Raster SVG |
| **Scientific** | LaTeX table, MATLAB script, NumPy text |
| **Code** | Python (matplotlib), R |
| **Graph** | GraphML (Gephi), Graphviz DOT |

A public manifest of all formats is available at `GET /api/exports`.

---

## 6. Tech stack

- **Framework:** Next.js 14 (App Router), React 18, TypeScript 5
- **Styling/animation:** Tailwind CSS 3, Framer Motion 11, lucide-react icons
- **State:** Zustand
- **3D / canvas:** three.js + custom 2D canvas renderers
- **Backend:** Next.js Route Handlers (Node runtime), file-backed JSON store with per-collection mutex, optional MongoDB driver
- **Auth/security:** scrypt password hashing, HMAC-signed cookies and webhooks, bearer API tokens
- **Realtime:** Server-Sent Events (SSE) pub/sub with toast notifications

---

## 7. Project structure

```
cortexsim/
  src/
    app/                  # Next.js App Router
      page.tsx            # Landing page (16 sections)
      app/                # Authenticated workspace
        exports/          # Export Center
        insights/ compare/ search/ activity/ shares/ webhooks/ ...
      learn/              # Learning platform
        page.tsx  map/  [slug]/  practice/
      simulator/          # The studio
      api/                # REST route handlers
    components/
      landing/            # Hero, Importance, HowItWorks, Metrics, ... (18 sections)
      app/                # Workspace shell + widgets
      learn/              # GuideCard, QuizRunner, MindMap, ...
      studio/  sim/  platform/  ui/
    content/              # guides/, glossary.ts, tips.ts, quiz.ts, modules.ts
    lib/
      export/formats.ts   # 15-format export engine
      studio/             # registry, activities, education
      store.ts auth.ts audit.ts events.ts webhooks.ts motion.ts
  .env.example
  vercel.json
  README.md               # <- this file (the only doc you need)
```

---

## 8. Getting started (local)

**Requirements:** Node.js 20.x and npm.

```bash
# 1. Install dependencies
npm install

# 2. Create your local env file
cp .env.example .env.local
#    then open .env.local and set CORTEXSIM_SECRET (see section 9)

# 3. Run the dev server
npm run dev
#    open http://localhost:3000
```

Build and run a production server locally:

```bash
npm run build
npm start
```

---

## 9. Environment variables

Copy `.env.example` to `.env.local` for local dev, and add the same keys in the Vercel dashboard for production.

| Variable | Required | Description |
|---|---|---|
| `CORTEXSIM_SECRET` | **Yes** | Secret used to sign session cookies, API tokens and webhooks. Generate with `openssl rand -hex 48`. Never reuse the dev default in production. |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Public base URL, e.g. `https://cortexsim.vercel.app`. Used for share links and absolute URLs. |
| `CORTEXSIM_DATA_DIR` | Recommended on Vercel | Directory for the JSON store. On Vercel set `/tmp/cortexsim-db` (only `/tmp` is writable). Defaults to a local folder otherwise. |
| `CORTEXSIM_ADMIN_EMAIL` | Optional | Marks this email as the first admin account on signup. |
| `MONGODB_URI` | Optional | Enables durable MongoDB storage instead of the file store (recommended for production on Vercel). |
| `DATABASE_URL` | Optional | Alternative SQL connection string if you wire a SQL backend. |
| `OPENAI_API_KEY` | Optional | Enables optional AI helper features. |
| `RESEND_API_KEY` | Optional | Enables transactional email (e.g. share invites). |
| `SENTRY_DSN` | Optional | Error monitoring. |

Generate a strong secret:

```bash
openssl rand -hex 48
```

---

## 10. Push to GitHub

```bash
cd cortexsim
git init                       # if not already a repo
git add -A
git commit -m "CortexSim 7.0"
git branch -M main
git remote add origin https://github.com/<you>/cortexsim.git
git push -u origin main
```

The included `.gitignore` keeps `node_modules/`, `.next/`, `.env*` and the local `.cortexsim-db/` out of the repo. **Never commit your real `.env.local`.**

---

## 11. Deploy to Vercel

1. Go to **vercel.com -> Add New -> Project** and import your GitHub repo.
2. Vercel auto-detects Next.js. Confirm these settings:
   - **Framework Preset:** Next.js
   - **Root Directory:** `./`
   - **Build Command:** `next build` (default)
   - **Output Directory:** `.next` (default)
   - **Install Command:** `npm install`
   - **Node.js Version:** 20.x
3. Open **Settings -> Environment Variables** and add the keys from [section 9](#9-environment-variables). At minimum set:
   - `CORTEXSIM_SECRET` (required)
   - `NEXT_PUBLIC_SITE_URL` (your Vercel URL)
   - `CORTEXSIM_DATA_DIR=/tmp/cortexsim-db`
4. Click **Deploy**. Every future `git push` to `main` triggers an automatic production deployment; pull requests get preview deployments.

`vercel.json` pins the function runtime and default region (`iad1`; switch to `bom1` for Mumbai if you are in India).

---

## 12. Data persistence

The default store writes JSON files under `CORTEXSIM_DATA_DIR`. On Vercel, serverless functions only have a **writable, ephemeral** `/tmp` - data is **not** shared between instances and is wiped on cold starts and redeploys.

For durable production data choose one of:

- **Set `MONGODB_URI`** to use MongoDB Atlas (recommended; the driver is already a dependency).
- **Self-host with a persistent disk** on Render, Fly.io, Railway, or Docker, and point `CORTEXSIM_DATA_DIR` at that volume.

For demos and learning, the `/tmp` file store works fine.

---

## 13. REST API reference

All endpoints live under `/api`. Auth is via the session cookie (browser) or `Authorization: Bearer <token>` (programmatic). Full interactive docs are bundled at `/app/api-docs`.

| Area | Endpoints |
|---|---|
| **Auth** | `POST /api/auth/signup`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me` |
| **Projects** | `GET/POST /api/projects`, `GET/PUT/DELETE /api/projects/:id` |
| **Runs** | `GET/POST /api/runs`, `GET/DELETE /api/runs/:id` |
| **Notes** | `GET/POST /api/notes`, `PUT/DELETE /api/notes/:id` |
| **Datasets** | `GET/POST /api/datasets` |
| **Insights** | `GET /api/insights`, `GET /api/stats` |
| **Compare** | `GET /api/runs/compare?ids=a,b,c` |
| **Search** | `GET /api/search?q=...` |
| **Share** | `POST /api/share`, `GET /api/share/:token` |
| **Webhooks** | `GET/POST /api/webhooks`, `DELETE /api/webhooks/:id` |
| **Tokens** | `GET/POST /api/tokens`, `DELETE /api/tokens/:id` |
| **Exports** | `GET /api/exports` (format manifest) |
| **Audit** | `GET /api/audit` |
| **Realtime** | `GET /api/events` (SSE) |
| **Changelog / Health** | `GET /api/changelog`, `GET /api/health` |

---

## 14. Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server at `http://localhost:3000` |
| `npm run build` | Production build |
| `npm start` | Run the production server |
| `npm run lint` | Lint the project |

---

## 15. Troubleshooting

- **"CORTEXSIM_SECRET is using the dev default"** - set a real secret (section 9) in `.env.local` and in Vercel.
- **Data disappears on Vercel** - expected with the `/tmp` file store; switch to `MONGODB_URI` or a host with a persistent disk (section 12).
- **Share links point to localhost** - set `NEXT_PUBLIC_SITE_URL` to your deployed URL.
- **Build fails on a type/lint error** - `next.config.mjs` is configured to not block builds on TS/ESLint errors; if it still fails, run `npm run build` locally to see the message.
- **401 on API calls** - include the session cookie or a bearer token from `/app/settings`.

---

## 16. Roadmap

- Collaborative multi-cursor projects
- More neuromorphic backends and energy models
- GPU-accelerated WebGPU engine
- Additional guide tracks and a certification path
- Plugin API for custom modules

---

*CortexSim Studio - turning spiking-network theory into something you can touch, tune and teach.*
