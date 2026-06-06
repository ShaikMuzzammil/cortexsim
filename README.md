<div align="center">

# 🧠 CortexSim Pro

### A real-time, in-browser spiking neural network laboratory

**Biophysical neuron models · GPU-instanced 3D visualization · live analytics · STDP plasticity · closed-loop optogenetics · an offline AI copilot · one-click reproducible code export — all running 100% client-side with zero backend.**

[![CI](https://github.com/USER/cortexsim-pro/actions/workflows/ci.yml/badge.svg)](./.github/workflows/ci.yml)
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

### Run the tests

```bash
npm test               # node tests/engine.test.mjs
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
├─ docs/ARCHITECTURE.md  docs/ROADMAP.md
└─ .github/workflows/ci.yml   # tests + syntax check on push
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
