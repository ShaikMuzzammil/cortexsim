<<<<<<< HEAD
<div align="center">

# 🧠 CortexSim Pro

### A real-time, in-browser spiking neural network laboratory

**Biophysical neuron models · GPU-instanced 3D visualization · live analytics · STDP plasticity · closed-loop optogenetics · an offline AI copilot · one-click reproducible code export — all running 100% client-side with zero backend.**

[![License: MIT](https://img.shields.io/badge/License-MIT-7b6bff.svg)](./LICENSE)
![Build](https://img.shields.io/badge/build-zero--build-41e0c8)
![PWA](https://img.shields.io/badge/PWA-offline--ready-5b8bff)

[**▶ Launch the simulator**](./app.html) · [Architecture](./docs/ARCHITECTURE.md) · [Roadmap](./docs/ROADMAP.md)

</div>

---

## ✨ What is this?

CortexSim Pro lets you build, run, visualize and analyze biological neural networks **directly in a browser tab** — no install, no server, no GPU cluster. Open `index.html`, click **Launch Simulator**, and you are watching thousands of neurons spike in real time.

It is designed to be honest about scope: the items below marked **Implemented** are fully working in this build. Ambitious research features (WebGPU 100k-neuron compute, neuromorphic-chip export, CRDT collaboration, ML training, real-data import) are intentionally **scaffolded with a documented roadmap** rather than faked — see [`docs/ROADMAP.md`](./docs/ROADMAP.md).

## ✅ Implemented & working

| Area | Feature |
|------|---------|
| **Neuron models** | Leaky Integrate-and-Fire (LIF), Izhikevich, Adaptive-Exponential (AdEx) |
| **Network** | Sparse random E/I connectivity (Dale's principle), conduction delays, current-based exponential synapses |
| **Plasticity** | Pair-based spike-timing-dependent plasticity (STDP) on E→E synapses, toggled live |
| **Visualization** | Three.js GPU-instanced neurons, spike flashing, orbit camera, sphere/layers/grid layouts |
| **Signals** | Scrolling spike raster, population-rate histogram, membrane-voltage trace of a probed neuron |
| **Analytics** | Mean firing rate, synchrony index χ, CV(ISI), autocorrelation oscillation detection, automatic regime classifier |
| **Connectome toolbox** | Degree distribution, clustering, density, hub-targeted lesion studies, mutual information |
| **Optogenetics** | ChR2 / ChrimsonR / eNpHR / ArchT opsins with saturating activation → injected current; GCaMP6f calcium proxy |
| **AI Copilot** | Offline natural-language control (“produce 40 Hz gamma”, “increase inhibition”) + optional Web Speech voice input |
| **Reproducibility** | Export runnable **Brian2 Python**, JSON spec, spike-train CSV, metrics CSV |
| **Presets** | 7 curated regimes incl. Brunel async-irregular & synchronous, gamma oscillation, Izhikevich, AdEx, STDP demo, single-neuron bursting |
| **Platform** | PWA + service worker (offline after first load), responsive layout, keyboard shortcuts |
| **Accessibility** | Colorblind-safe palettes (protan/deutan/tritan), monochrome mode, voice control |

## 🚀 Quick start

> CortexSim Pro is **zero-build** — it is plain HTML + ES modules. You only need a static file server (browsers block ES-module workers on `file://`).

```bash
# clone
git clone https://github.com/USER/cortexsim-pro.git
cd cortexsim-pro

# serve locally (any static server works)
npx serve .            # then open http://localhost:3000
# or: python3 -m http.server 5173
# or: npm run dev
```

Then open the URL and click **▶ Launch Simulator**.

### Verify the build (offline, no CI needed)

```bash
npm run verify         # syntax-checks every module + runs the engine tests
# or just the tests:
npm test
```

## ☁️ Deploy to Vercel

This repo deploys as a **static site** with no build step.

1. Push the repo to GitHub (see below).
2. In Vercel: **Add New → Project → Import** your repo.
3. Framework preset: **Other**. Build command: *(leave empty)*. Output dir: `./` (root).
4. Click **Deploy**. Done.

### Environment variables (Vercel → Settings → Environment Variables)

None are required — the app runs fully client-side. Add these **only** if you enable optional roadmap features. Names (headings) live in [`.env.example`](./.env.example); paste real values in the Vercel dashboard, never in the repo:

- `PUBLIC_LLM_ENDPOINT` — hosted AI-copilot LLM proxy (otherwise offline parser is used)
- `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` — cloud sync
- `PUBLIC_POSTHOG_KEY`, `PUBLIC_SENTRY_DSN` — analytics / error tracking
- `PUBLIC_COLLAB_SIGNALING_URL` — WebRTC/Yjs collaboration signaling
- `PUBLIC_APP_VERSION` — build metadata

## 📁 Push to GitHub (clean repo — no node_modules, no .next)

The included [`.gitignore`](./.gitignore) already excludes `node_modules/`, `.next/`, build output, all `.env*` secrets, and OS/editor noise. To publish:

```bash
git init
git add .
git commit -m "feat: CortexSim Pro — real-time SNN simulator"
git branch -M main
git remote add origin https://github.com/USER/cortexsim-pro.git
git push -u origin main
```

## 🧩 Project structure

```
cortexsim-pro/
├─ index.html              # Landing page (animated hero + START button)
├─ app.html                # The simulator lab
├─ manifest.webmanifest    # PWA manifest
├─ sw.js                   # Service worker (offline)
├─ vercel.json             # Static deploy + security headers
├─ package.json            # Scripts (dev server, tests) — no runtime deps
├─ .gitignore  .env.example
├─ src/
│  ├─ css/styles.css
│  ├─ assets/favicon.svg
│  └─ js/
│     ├─ landing.js                 # landing-page background animation
│     ├─ engine/
│     │  ├─ models.js               # LIF / Izhikevich / AdEx
│     │  ├─ snn-engine.js           # network core (CSR connectivity, delays, STDP)
│     │  ├─ rng.js                  # seeded PRNG (reproducibility)
│     │  ├─ presets.js              # classic regimes
│     │  └─ worker.js               # module Web Worker simulation loop
│     ├─ analytics/
│     │  ├─ metrics.js              # rate, synchrony, CV(ISI), oscillation
│     │  └─ toolbox.js              # connectome graph, lesion, MI, opsins, calcium
│     ├─ viz/
│     │  ├─ network3d.js            # Three.js instanced renderer (+ WebXR hook)
│     │  ├─ raster.js               # scrolling spike raster
│     │  └─ charts.js               # trace + bar charts
│     ├─ io/
│     │  ├─ codegen.js              # Brian2 Python + JSON export
│     │  ├─ export.js               # CSV/JSON download helpers
│     │  └─ storage.js              # localStorage + IndexedDB persistence
│     └─ ui/
│        ├─ app.js                  # simulator controller (wires everything)
│        └─ copilot.js              # offline NL command parser (+ LLM hook)
├─ tests/engine.test.mjs      # deterministic engine unit tests
├─ scripts/verify.mjs         # one-command local verification (syntax + tests)
└─ docs/ARCHITECTURE.md  docs/ROADMAP.md
```

## 🔬 The science (brief)

- **LIF**: `τ dV/dt = -(V - V_rest) + R·I`, fire at threshold, reset + refractory.
- **Izhikevich**: `v' = 0.04v² + 5v + 140 - u + I`, `u' = a(bv - u)`; reproduces RS/IB/CH/FS patterns.
- **AdEx**: exponential spike initiation + adaptation current `w` → spike-frequency adaptation.
- **Network**: Brunel-style sparse random E/I network. Inhibitory weight `= -g·J`. Uniform conduction delay via a circular delivery buffer. Synaptic currents decay exponentially.
- **STDP**: online pair-based rule with pre/post traces; potentiation on causal ordering, depression on anti-causal.
- **Reproducibility**: a single seeded PRNG drives connectivity, initial states, Poisson input and noise — identical seed ⇒ identical run.

The **Brunel asynchronous-irregular** and **gamma-oscillation** presets reproduce qualitative regimes from Brunel (2000); the Izhikevich preset follows Izhikevich (2003).

## ⌨️ Shortcuts

`Space` run/pause · `S` step 1 ms · `R` reset · drag to orbit · scroll to zoom.

## ⚠️ Disclaimer

CortexSim Pro is an educational and research simulator. It is **not** a medical device and must not be used for clinical or diagnostic purposes.

## 📄 License

MIT — see [LICENSE](./LICENSE).
=======
# CortexSim

Advanced Spiking Neural Network Simulator & Visualizer

## Overview

CortexSim is a fully functional, browser-based spiking neural network (SNN) simulator built with Next.js 14. It features a stunning "Neural Labs" dark sci-fi UI with real-time WebGPU-powered simulation, 3D visualization, drag-and-drop experiment builder, and full user authentication.

## Features

- **Real-Time Simulation**: Simulate up to 1000 Izhikevich/LIF neurons with WebGPU acceleration
- **3D Visualization**: Interactive 3D network view with live spike propagation
- **Drag-and-Drop Builder**: React Flow-based experiment construction
- **Synaptic Plasticity**: STDP and Tsodyks-Markram models
- **Live Charts**: Raster plots and membrane potential traces
- **User Authentication**: NextAuth v5 with Google, GitHub, and email/password
- **Experiment Management**: Save/load experiments to database
- **Responsive Design**: Fully responsive with mobile menu
- **Custom Cursor**: Animated neon cursor with hover effects
- **Scroll-Spy Navigation**: Active section highlighting
- **Expandable Feature Cards**: Accordion-style with close buttons
- **Contact Form**: Secure email sending via Resend (no API key exposure)
- **Newsletter Signup**: Functional footer subscription

## Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS with custom "Neural Labs" design tokens
- **Animation**: Framer Motion
- **3D Rendering**: @react-three/fiber + drei
- **Drag-and-Drop**: React Flow
- **Charts**: Recharts
- **Auth**: NextAuth.js v5 + Prisma adapter
- **Database**: SQLite (dev) / PostgreSQL (prod)
- **Email**: Resend (server-side only)
- **ORM**: Prisma

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone or extract the project
cd cortexsim

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Edit .env.local with your credentials:
# - DATABASE_URL
# - NEXTAUTH_SECRET (generate with: openssl rand -base64 32)
# - OAuth credentials (optional)
# - RESEND_API_KEY (optional, for email)

# Generate Prisma client and run migrations
npx prisma generate
npx prisma migrate dev --name init

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

```env
# Database
DATABASE_URL="file:./dev.db"
# Or for PostgreSQL: postgresql://user:password@localhost:5432/cortexsim

# NextAuth
NEXTAUTH_SECRET="your-super-secret-random-string-min-32-chars"
NEXTAUTH_URL="http://localhost:3000"

# OAuth (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# Email (optional)
RESEND_API_KEY="re_xxxxxxxx"
CONTACT_EMAIL="host@cortexsim.io"
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel Dashboard → Settings → Environment Variables
4. Add build command: `npm run build`
5. Deploy

### Database

For production, use PostgreSQL:
- Railway: `railway.app`
- Supabase: `supabase.com`
- Neon: `neon.tech`

Update `DATABASE_URL` in production environment variables.

## Project Structure

```
cortexsim/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Landing page
│   ├── builder/           # Experiment builder
│   ├── dashboard/         # User experiments
│   ├── login/             # Sign in
│   ├── signup/            # Registration
│   ├── contact/           # Contact form
│   ├── docs/              # Documentation
│   ├── api/               # API routes
│   │   ├── auth/          # NextAuth
│   │   ├── contact/       # Contact email
│   │   ├── experiments/   # CRUD operations
│   │   └── newsletter/    # Newsletter signup
│   ├── layout.tsx         # Root layout
│   ├── providers.tsx      # Context providers
│   └── not-found.tsx      # 404 page
├── components/
│   ├── ui/                # Reusable UI components
│   ├── Builder/           # React Flow nodes & edges
│   ├── Charts/            # Recharts components
│   ├── Auth/              # Login/signup forms
│   ├── CustomCursor.tsx   # Neon cursor
│   ├── Navbar.tsx         # Navigation
│   ├── Footer.tsx         # Footer
│   ├── Hero3D.tsx         # 3D hero scene
│   ├── ExpandableCard.tsx # Feature cards
│   ├── ContactForm.tsx    # Contact form
│   └── Simulation3DView.tsx # 3D simulation view
├── lib/
│   ├── prisma.ts          # Prisma client
│   ├── auth.ts            # NextAuth config
│   ├── email.ts           # Resend helpers
│   ├── utils.ts           # Utilities
│   └── simulation/        # Simulation engine
│       ├── engine.ts      # Izhikevich/LIF engine
│       ├── webgpu.ts      # WebGPU shaders
│       └── fallback.ts    # JS fallback
├── prisma/
│   └── schema.prisma      # Database schema
├── styles/
│   └── globals.css        # Tailwind + custom styles
├── middleware.ts          # Route protection
├── tailwind.config.ts     # Tailwind configuration
└── package.json
```

## Pages

| Route | Description | Auth Required |
|-------|-------------|---------------|
| `/` | Landing page with hero, features, demo | No |
| `/builder` | Drag-and-drop experiment builder | No (save requires login) |
| `/dashboard` | Saved experiments management | Yes |
| `/login` | Sign in page | No (redirects if logged in) |
| `/signup` | Registration page | No (redirects if logged in) |
| `/contact` | Contact form | No |
| `/docs` | Documentation | No |

## Authentication

- **Credentials**: Email + password (bcrypt hashed)
- **OAuth**: Google and GitHub
- **Session**: JWT strategy
- **Protection**: Middleware checks for protected routes

## Simulation Engine

The simulation supports:
- **Izhikevich Model**: 2D ODE system with configurable a, b, c, d parameters
- **LIF Model**: Leaky integrate-and-fire with τₘ and R
- **Integration**: Euler (default) and Runge-Kutta 4
- **Noise**: Gaussian current injection
- **Plasticity**: Static, STDP, Tsodyks-Markram

WebGPU compute shaders provide near-native performance. Falls back to JavaScript for unsupported browsers.

## Design System

### Colors
- Void: `#0A0A0F`
- Neon: `#00F0FF`
- Electric: `#9D4EDD`
- Synaptic Green: `#00E676`
- Spike Red: `#FF1744`

### Typography
- Headings: Orbitron (Google Fonts)
- Body: Inter
- Code: Fira Code

## Keyboard Shortcuts (Builder)

| Key | Action |
|-----|--------|
| Space | Play/Pause simulation |
| Delete | Remove selected node |
| Ctrl+D | Duplicate node |
| Ctrl+S | Save experiment |
| Esc | Deselect all |

## License

MIT License - Built with neurons & code.

## Support

- Email: contact@cortexsim.io
- GitHub: github.com/cortexsim
- Twitter: @cortexsim


---

## Quick Vercel Deploy (5 Minutes)

```bash
# 1. Push to GitHub
git push origin main

# 2. Go to vercel.com → Add New Project → Import repo

# 3. Add these Environment Variables in Vercel Dashboard:
#    DATABASE_URL = file:./dev.db  (or PostgreSQL URL)
#    NEXTAUTH_SECRET = openssl rand -base64 32
#    NEXTAUTH_URL = https://your-app.vercel.app

# 4. Deploy!
```

# 🚀 VERCEL DEPLOY — STEP BY STEP (Copy & Paste)

## YOU ONLY NEED TO DO THIS ONCE

### Step 1: Push to GitHub

Open terminal in project folder:

```bash
cd cortexsim
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/cortexsim.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

---

### Step 2: Connect to Vercel

1. Go to https://vercel.com
2. Sign in with **GitHub**
3. Click **"Add New Project"**
4. Find `cortexsim` repo → Click **Import**
5. Vercel auto-detects Next.js — **DO NOT CHANGE ANYTHING**
6. Click **Deploy**

---

### Step 3: Add Environment Variables (CRITICAL)

After first deploy fails (it will), go to:

**Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**

Click **Add** 3 times:

| Name | Value |
|------|-------|
| `DATABASE_URL` | `file:./dev.db` |
| `NEXTAUTH_SECRET` | `supersecretkey123456789` |
| `NEXTAUTH_URL` | `https://cortexsim.vercel.app` |

> **IMPORTANT**: Replace `cortexsim.vercel.app` with your actual URL from Vercel.

Click **Save** → Go to **Deployments** tab → Click the 3 dots on latest → **Redeploy**

---

### Step 4: Done!

Your app is live. Test these URLs:
- `https://YOUR-URL.vercel.app/` — Home
- `https://YOUR-URL.vercel.app/builder` — Builder
- `https://YOUR-URL.vercel.app/login` — Login
- `https://YOUR-URL.vercel.app/dashboard` — Dashboard (needs login)

---

## ⚠️ WHAT WAS FIXED

| Problem | Fix |
|---------|-----|
| `npm run vercel-build` missing | Added `"vercel-build": "prisma generate && next build"` to package.json |
| `prisma migrate deploy` fails | Removed it — SQLite doesn't need deploy, just `generate` |
| Build crashes | Simplified scripts, no complex commands |

---

## 🔧 IF BUILD STILL FAILS

### Option A: Use Vercel's Default Build

In Vercel Dashboard → Project Settings → **Build & Output Settings**

Change **Build Command** to exactly this:
```
next build
```

Change **Output Directory** to:
```
.next
```

Click **Save** → Redeploy

### Option B: No Database (Simplest)

If you want ZERO database setup, the app works with just:

| Variable | Value |
|----------|-------|
| `NEXTAUTH_SECRET` | `anyrandomstring123` |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` |

No `DATABASE_URL` needed. The builder and all pages work. Only "Save Experiment" needs login.

---

## 📦 PACKAGE.JSON SCRIPTS (Already Fixed)

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "postinstall": "prisma generate",
    "vercel-build": "prisma generate && next build"
  }
}
```

---

## ❓ COMMON ERRORS & FIXES

### "Cannot find module '@prisma/client'"
**Fix**: `postinstall` script runs `prisma generate` automatically. If it fails, add this to Vercel Build Command:
```
npx prisma generate && next build
```

### "Database not found"
**Fix**: SQLite is ephemeral on Vercel. For production, switch to PostgreSQL (free on neon.tech). Or use the app without database — builder works fine.

### "NEXTAUTH_SECRET missing"
**Fix**: Add it in Environment Variables. Any random string works.

---

## 🎯 MINIMUM VIABLE DEPLOY

If you want the absolute simplest deploy with NO database headaches:

1. Delete `prisma/` folder
2. Delete `lib/prisma.ts`
3. Delete `lib/auth.ts`
4. Delete `middleware.ts`
5. Delete `app/api/` folder
6. Delete `app/dashboard/` folder
7. Keep only: `app/page.tsx`, `app/builder/page.tsx`, `app/contact/page.tsx`, `app/docs/page.tsx`, `app/login/page.tsx`, `app/signup/page.tsx`
8. Update `package.json` — remove `prisma`, `@prisma/client`, `@auth/prisma-adapter`, `next-auth`, `bcryptjs`
9. Push to GitHub
10. Deploy to Vercel — **zero env vars needed**

The builder, simulation, 3D view, charts, contact form all work. Just no user accounts.

---

## 📧 EMAIL SETUP (Optional)

Contact form works without email. To enable real emails:

1. Go to https://resend.com → Sign up (free)
2. Get API key
3. Add to Vercel env vars:
   - `RESEND_API_KEY` = `re_xxxxxxxxx`
   - `CONTACT_EMAIL` = `your@email.com`
4. Redeploy

Done. No code changes.

>>>>>>> d3db0e24a0d2743ca6a9f17d4eed09f466f2527a
