<div align="center">

# 🧠 CortexSim Pro

### A real-time spiking neural network platform that runs entirely in your browser

Animated landing page → a **dedicated full-screen simulator app** with a Home button · live 3D · professional exports · **no login, no profile, no settings, no backend.**

React · TypeScript · Vite · Tailwind CSS · Zustand

</div>

---

## ✨ Overview

CortexSim Pro simulates thousands of biologically realistic **Izhikevich (2003)** spiking neurons in real time and renders them as a living 3D neuron cloud. Press **Start the Platform** and the landing page gives way to a **dedicated simulator app** (with a **← Home** button to return) where you can tune the network, inject stimuli, probe individual neurons, watch oscillations emerge, and export publication-ready figures and data — all client-side, with zero setup.

## 🧭 Two experiences, one app

- **Landing** — a cinematic intro: mouse-reactive particle field, custom cursor, scroll-spy navigation, reveal-on-scroll, and the science behind the model.
- **Platform app** — launching opens a full-screen workspace with its own header, a global play/pause, and a **Home** button. This is the real simulator, not a demo.

## 🚀 Platform features

- **Interactive 3D neuron cloud** — drag to rotate, scroll to zoom; every spike flashes live with additive glow.
- **Spike raster** (1-second scrolling window) and **population firing-rate** trace.
- **Live power spectrum (FFT)** of the population rate with a **dominant-frequency** readout — watch gamma appear.
- **Single-neuron probe** — pick any neuron and watch its **membrane-voltage oscilloscope** and **phase-plane (v–u) portrait**; the probed cell is ringed in the 3D view.
- **Stimulus injection** — fire a current pulse into a random subset and watch the response propagate.
- **Step-frame** control to advance the simulation one frame while paused.
- Full live controls: neuron count (up to 2,000), excitatory fraction, connectivity, E/I gains, input drive, speed, and cell model.
- **6 one-click regimes**: asynchronous, synchronous, gamma, bursting, seizure, quiescent.
- Live metrics: time, mean rate, excitatory & inhibitory rates, active neurons, synchrony index, dominant frequency, total spikes, synapses, and FPS.

## 📖 Learn while you simulate

Five flagship tools, each one a self-contained lesson. On the landing page and inside the live platform, every feature has an **expandable guide** that explains three things:

1. **How it works** — the actual mechanism under the hood.
2. **What you learn** — the neuroscience / dynamics takeaway.
3. **Engineering & OS parallel** — the computer-science concept the same idea maps onto, so the knowledge transfers:

| Feature | Engineering / OS parallel |
| --- | --- |
| 3D Network & wiring | Sparse graphs (CSR), adjacency lists, cache locality, scheduler ready-queues |
| Spike raster | Event-driven systems, distributed tracing, interrupt timelines, ring/log buffers (dmesg) |
| Population rate | Control systems, PID loops, token-bucket rate limiting, backpressure |
| FFT power spectrum | Digital signal processing, Cooley–Tukey FFT, sampling/Nyquist, clock-jitter analysis |
| Neuron probe | Finite state machines, phase-space stability, watchdog timers, debounce |

Each guide ends with a concrete "try it" experiment and links to authoritative references.

## 📥 Export & print

- **PNG** — high-resolution snapshot of the 3D network.
- **CSV** — the recent spike train (time, neuron, type).
- **JSON** — complete, reproducible configuration + metrics.
- **PDF report** — a clean, print-ready document embedding the configuration, metrics, and all figures.

### Keyboard
`Space` play/pause is available from the controls; use the buttons for Step, Reset, and Inject.

## 🏗️ Architecture

```
src/
├── main.tsx · App.tsx · index.css
├── lib/
│   ├── snn/ engine.ts · presets.ts · types.ts   (typed Izhikevich engine)
│   ├── dsp.ts                                   (FFT power spectrum)
│   └── exporters.ts                             (PNG · CSV · JSON · PDF)
├── store/useSim.ts                              (Zustand state)
├── hooks/ useCursor · useScrollSpy · useReveal
└── components/
    ├── Cursor · Background · ProgressBar · Nav · Footer
    ├── landing/ Hero · HeroCanvas · Features · Science
    └── platform/ PlatformApp · Platform · Network3D · Panel
                Controls · Metrics · ExportBar
```

The **Platform** component owns the engine and runs **one** `requestAnimationFrame` loop that drives every canvas (3D network, raster, rate, spectrum, voltage, phase plane), keeps ring buffers for export, and writes metrics into the store.

## 🧬 The science

```
v' = 0.04 v² + 5 v + 140 − u + I
u' = a (b v − u)
if v ≥ 30 mV:   v ← c,   u ← u + d
```

80% excitatory and 20% fast-spiking inhibitory neurons interact through sparse random synapses stored in compressed-sparse-row form. Oscillations, avalanches and synchrony arise purely from the network.

## 🛠️ Local development

```bash
npm install
npm run dev        # start Vite dev server
npm run build      # type-check + production build to dist/
npm run preview    # preview the production build
```

## ▲ Deploy to Vercel

This is a standard Vite app, so Vercel detects it automatically.

1. Make sure no leftover files from a previous framework (e.g. a stray Next.js `pages/` directory) remain in the repo.
2. Push these files to GitHub.
3. Import the repo on **vercel.com** → Framework Preset **Vite** (auto-detected), build `vite build`, output `dist`. Deploy.

## 📄 License

MIT.
