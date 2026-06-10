# CortexSim GODMODE

A full-stack, real-time **spiking neural network simulator** that runs in the
browser. Watch thousands of Izhikevich neurons fire on a 3D brain shell, sculpt
the dynamics live, run parameter sweeps, edit the governing equations, and
export your experiments.

Built as a real production-grade app — not a single HTML file.

---

## Tech stack

| Layer | Technology |
| --- | --- |
| Framework | **Next.js 14** (App Router) |
| Language | **TypeScript** (end-to-end) |
| UI | **React 18** + **Tailwind CSS** design system |
| Animation | **Framer Motion** (smooth landing + transitions) |
| 3D graphics | **Three.js** WebGL (with a 2D canvas fallback) |
| State | **Zustand** store |
| Backend | **Next.js API routes** (Node serverless functions) |
| Database | **MongoDB** (MERN-style persistence, optional) |
| Deploy | **Vercel** |

## Project structure

```
cortexsim-godmode/
  src/
    app/
      layout.tsx            Root layout + fonts + metadata
      globals.css           Tailwind layers + design tokens
      page.tsx              Animated marketing landing page
      simulator/page.tsx    The full simulator app
      docs/page.tsx         Science explainer
      api/
        health/route.ts          Health + persistence status
        presets/route.ts         Built-in regime presets
        simulations/route.ts     List + create saved experiments
        simulations/[id]/route.ts Read + delete one experiment
    components/
      landing/   Navbar, Hero, Features, TechStack, Showcase, CTA, Footer
      sim/       SimulatorShell, ControlPanel, Network3D, charts, panels
      ui/        Slider, Toggle, Select
    lib/
      engine/    snn.ts, models.ts, topology.ts   (the simulation core)
      dsp/       fft.ts (Welch PSD), metrics.ts    (analytics)
      draw/      charts.ts, canvas renderers
      export/    exporters.ts (CSV / JSON / PDF / recording / formulas)
      db/        mongodb.ts (cached serverless connection)
      motion.ts  Framer Motion variants
      presets.ts utils.ts
    hooks/       useAnimationFrame.ts
    store/       useSimStore.ts
    types/       index.ts
```

## Features

- **3D network view** — Three.js point cloud on a brain shell. Excitatory cells
  red, inhibitory blue, spikes flash white. Drag to rotate, scroll to zoom,
  click to probe a neuron. Automatic 2D fallback when WebGL is unavailable.
- **Live controls** — 10+ sliders/selects: N, exc fraction, connectivity,
  gains, drive, synaptic tau, noise, cell models, topology, integrator.
- **Editable dynamics** — rewrite the `dv/dt` and `du/dt` equations at runtime.
- **Seven live charts** — raster, population rate, Welch power spectrum,
  probe voltage scope, phase plane with nullcline, correlation matrix.
- **Real analytics** — rate, synchrony index, dominant frequency, Shannon
  entropy, active fraction, LFP proxy.
- **Parameter sweep** — batch run across any parameter, charted live.
- **Custom calculator** — evaluate your own metric expressions.
- **Topologies** — random, small-world, scale-free, grid.
- **Plasticity + delays** — optional STDP and axonal delay lines.
- **Export** — PNG, CSV spike trains, JSON state, printable PDF report,
  replayable `.cxs` recording, and save experiments (MongoDB or local).
- **6 presets** — asynchronous, synchronous, gamma, bursting, seizure, quiet.
- **Keyboard shortcuts** — Space = play/pause, Right arrow = step, r = reset,
  i = inject pulse.

---

## Run locally

> Requires Node.js 18+.

```bash
npm install
npm run dev
```

Then open **http://localhost:3000**.

**Important:** this is a real Next.js app — it must be run with `npm run dev`
(or built and served). Do **not** open the files directly in the browser by
double-clicking; there is no static `index.html`.

Production build:

```bash
npm run build
npm run start
```

---

## Deploy to Vercel

Vercel builds the app for you automatically.

### Option A — Dashboard

1. Push this folder to a GitHub repository.
2. Go to vercel.com -> **Add New Project** -> import the repo.
3. Vercel auto-detects Next.js. Keep the defaults:
   - **Framework Preset:** Next.js
   - **Build Command:** `next build` (auto)
   - **Install Command:** `npm install` (auto)
   - **Output Directory:** `.next` (auto)
4. (Optional) add environment variables (see below).
5. Click **Deploy**.

### Option B — CLI

```bash
npm i -g vercel
vercel        # preview deploy
vercel --prod # production deploy
```

### Build commands summary

| Setting | Value |
| --- | --- |
| Install command | `npm install` |
| Build command | `next build` |
| Dev command | `next dev` |
| Output | `.next` (managed by Next.js) |
| Node version | 18.x or 20.x |

---

## Environment variables

**None are required.** The simulator runs fully client-side and works with zero
configuration. The variables below are optional and only enable extra features.

| Variable | Required | Purpose |
| --- | --- | --- |
| `MONGODB_URI` | No | MongoDB connection string. Enables saving experiments to a database via the `/api/simulations` routes. If unset, experiments save to the browser's localStorage instead. |
| `MONGODB_DB` | No | Database name (defaults to `cortexsim`). |
| `NEXT_PUBLIC_SITE_URL` | No | Public site URL for share links / Open Graph. |
| `NEXT_PUBLIC_ANALYTICS_ID` | No | Analytics id; blank disables analytics. |

Copy `.env.example` to `.env.local` for local development, and add the same keys
under **Vercel -> Project Settings -> Environment Variables** for production.

> Security note: never expose secret keys with the `NEXT_PUBLIC_` prefix. Only
> `MONGODB_URI` / `MONGODB_DB` are server-side and stay private.

### Setting up MongoDB (optional)

1. Create a free cluster at MongoDB Atlas.
2. Create a database user and allow network access.
3. Copy the connection string into `MONGODB_URI`.
4. Redeploy. The app will report `persistence: "mongodb"` at `/api/health`.

---

## The science (short version)

Each neuron is an **Izhikevich** model — two variables (membrane potential `v`
and recovery `u`) reproduce a huge range of cortical firing patterns from four
parameters. 80% of cells are excitatory, 20% inhibitory. Spikes deposit
exponentially-decaying synaptic current onto sparse targets. The balance of
excitation and inhibition pushes the network between asynchronous, oscillatory
(gamma), bursting and seizure-like regimes — all visible live. See `/docs` in
the app for more.

---

## License

MIT — do whatever you like.
