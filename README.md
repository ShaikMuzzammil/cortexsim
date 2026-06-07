<div align="center">

# 🧠 CortexSim Pro

### A real-time spiking neural network platform that runs entirely in your browser

Stunning animated landing page · live 3D simulation · professional exports · **no login, no profile, no settings, no backend.**

React · TypeScript · Vite · Tailwind CSS · Zustand

</div>

---

## ✨ Overview

CortexSim Pro simulates thousands of biologically realistic **Izhikevich (2003)** spiking neurons in real time and renders them as a living 3D neuron cloud. Tune the network, watch oscillations and synchrony emerge, and export publication-ready figures and data — all client-side, with zero setup.

This is a **full multi-file application** with a clean, production-style architecture: a typed simulation engine, a Zustand state store, custom React hooks, and modular components for the landing experience and the live platform.

## 🏗️ Architecture

```
cortexsim-app/
├── index.html                  # Vite entry
├── package.json                # React + Vite + Tailwind + Zustand
├── vite.config.ts
├── tailwind.config.js
├── vercel.json                 # Vite preset — deploys cleanly
└── src/
    ├── main.tsx                # React bootstrap
    ├── App.tsx                 # Page composition
    ├── index.css               # Tailwind + design system
    ├── lib/
    │   ├── snn/
    │   │   ├── engine.ts        # Izhikevich engine (CSR synapses)
    │   │   ├── presets.ts       # 6 dynamical regimes
    │   │   └── types.ts         # Shared simulation types
    │   └── exporters.ts         # PNG / CSV / JSON / PDF
    ├── store/
    │   └── useSim.ts            # Zustand store
    ├── hooks/
    │   ├── useCursor.ts         # Custom trailing cursor
    │   ├── useScrollSpy.ts      # Active-section nav highlight
    │   └── useReveal.ts         # Reveal-on-scroll
    └── components/
        ├── Cursor.tsx
        ├── Background.tsx
        ├── ProgressBar.tsx
        ├── Nav.tsx
        ├── Footer.tsx
        ├── landing/
        │   ├── Hero.tsx
        │   ├── HeroCanvas.tsx   # Mouse-reactive particle field
        │   ├── Features.tsx
        │   └── Science.tsx
        └── platform/
            ├── Platform.tsx     # Engine + single render loop
            ├── Network3D.tsx    # Interactive 3D cloud
            ├── RasterPlot.tsx
            ├── RateChart.tsx
            ├── Controls.tsx
            ├── Metrics.tsx
            └── ExportBar.tsx
```

## 🚀 Features

### Landing experience
- **Custom animated cursor** — a precise dot plus a smoothly trailing ring that reacts on hover.
- **Mouse-reactive particle hero** — a living neural-network canvas that responds to your pointer.
- **Animated aurora background** with a subtle grid and floating gradient blobs.
- **Sticky glass navigation** with scroll-spy section highlighting and smooth scrolling.
- **Scroll-progress bar** and reveal-on-scroll animations throughout.
- A glowing **Start the Platform** button that launches straight into the live simulator.

### The live platform
- Real-time **Izhikevich** spiking network — up to **2,000 neurons**.
- **Interactive 3D neuron cloud** — drag to rotate, scroll to zoom; every spike flashes live.
- **Spike raster** plot and **population firing-rate** trace, updated every frame.
- Full live controls: neuron count, excitatory fraction, connectivity, gains, input drive, speed.
- **4 cell models** (regular spiking, bursting, chattering, fast spiking).
- **6 one-click regimes**: asynchronous, synchronous, gamma, bursting, seizure, quiescent.
- Live metrics: sim time, mean firing rate, active neurons, synchrony index, total spikes, synapses.

### Export & print
- **PNG** — high-resolution snapshot of the 3D network.
- **CSV** — the full recent spike train (time, neuron, type).
- **JSON** — complete, reproducible configuration + metrics.
- **PDF report** — a clean, publication-style print view embedding all figures.

### Keyboard shortcuts
`Space` play/pause · `R` reset · `S` PNG · `P` PDF report

## 🧬 The science

Each neuron evolves with the Izhikevich model:

```
v' = 0.04 v² + 5 v + 140 − u + I
u' = a (b v − u)
if v ≥ 30 mV:   v ← c,   u ← u + d
```

80% excitatory and 20% fast-spiking inhibitory neurons interact through sparse random synapses stored in compressed-sparse-row form for fast propagation. Oscillations, avalanches and synchrony arise purely from the network — nothing is scripted.

## 🛠️ Local development

```bash
npm install
npm run dev        # start Vite dev server
npm run build      # type-check + production build to dist/
npm run preview    # preview the production build
```

## ▲ Deploy to Vercel

This repo is a standard Vite app, so Vercel detects it automatically.

1. Push the project to GitHub (these files at the repo root).
2. Import the repo on **vercel.com** → Framework Preset: **Vite** (auto-detected).
3. Build command `vite build`, output directory `dist`. Deploy.

> Tip: make sure no leftover files from a previous framework (e.g. a stray Next.js `pages/` or root `package.json`) remain in the repo, or Vercel may misdetect the framework.

## 📦 Tech stack

| Layer | Choice |
|------|--------|
| Framework | React 18 + TypeScript |
| Build | Vite 5 |
| Styling | Tailwind CSS 3 |
| State | Zustand |
| Rendering | HTML5 Canvas (2D, hand-rolled 3D projection) |

## 📄 License

MIT — do anything you like.
