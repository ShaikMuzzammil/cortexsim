# CortexSim Pro — Roadmap (Implemented vs Planned)

This document maps the full 16-category feature vision to what is **shipped today** versus **planned**. We keep this honest on purpose — every “Implemented” item below actually works in this build; every “Planned” item has a defined integration seam in the code so it can be added without a rewrite.

Legend: ✅ Implemented · 🟡 Partial / foundation present · 🔮 Planned

## 1. Multi-scale simulation
- 🟡 Layered (laminar-style) spatial layout for cortical-column visualization
- 🔮 Whole-brain parcellation / MRI-DTI connectome import (HCP, mouse, fly)
- 🔮 Multi-compartment neurons (dendrite/soma/axon)
- 🔮 LFP/EEG extracellular field proxy

## 2. Neuromorphic hardware export
- 🟡 Reproducible code export (Brian2 Python, JSON spec) — the export pipeline opsins/Loihi will plug into
- 🔮 Loihi 2 / SpiNNaker code generation
- 🔮 FPGA bitstream synthesis
- 🔮 pJ/spike energy estimation

## 3. Closed-loop optogenetics
- ✅ Virtual light injection on a chosen fraction of cells
- ✅ ChR2 / ChrimsonR / eNpHR / ArchT opsins with saturating activation curves
- ✅ GCaMP6f calcium-fluorescence proxy (in `analytics/toolbox.js`)
- 🔮 Spatially-targeted illumination from the 3D view

## 4. Machine learning integration
- 🔮 Surrogate-gradient SNN training (MNIST/SHD/NMNIST)
- 🔮 ANN→SNN conversion toolkit
- 🔮 Spike-based RL (Gym interface)
- 🔮 eProp / DECOLLE online learning
> Foundation: `models.js` pure `step()` functions and seeded RNG make autodiff wrappers tractable.

## 5. Real neuroscience data pipeline
- 🔮 Neuropixels / Phy / KiloSort import (.npy, .mat)
- 🔮 Patch-clamp model fitting
- 🟡 Statistical validation primitives (rate distributions, autocorrelation) present in analytics

## 6. Volumetric rendering & visualization
- ✅ Real-time 3D instanced network rendering (sphere/layers/grid)
- 🟡 WebXR VR session hook (auto-enabled when a device is present)
- 🔮 .swc morphology rendering, EM volume slicing

## 7. Streaming & collaboration
- 🟡 Local persistence + shareable preset/JSON export
- 🔮 WebRTC live streaming, CRDT multi-user editing, annotations, timeline scrubbing
> Foundation: `PUBLIC_COLLAB_SIGNALING_URL` env hook reserved.

## 8. AI Copilot
- ✅ Offline natural-language control (presets, parameters, scaling, transport)
- ✅ Optional hosted-LLM hook (`PUBLIC_LLM_ENDPOINT` / `window.CORTEXSIM_LLM_ENDPOINT`)
- ✅ Code generation from current GUI state (Brian2/JSON)
- 🔮 Automatic parameter search (“find 40 Hz gamma”) as a closed-loop optimizer

## 9. Information theory suite
- ✅ Mutual information between spike trains (`toolbox.js`)
- 🔮 Transfer entropy, Granger causality, computational capacity

## 10. Dimensionality reduction & dynamics
- 🔮 PCA/t-SNE/UMAP population embedding, phase portraits, attractor detection
> Foundation: per-bin population vectors already computed in analytics.

## 11. Connectome analysis toolbox
- ✅ Degree distribution, clustering, density (`connectomeMetrics`)
- ✅ Hub-targeted lesion studies (`lesionStudy`)
- 🔮 Motif detection, modularity, rich-club, network control theory

## 12. Cross-platform & offline
- ✅ PWA install + service-worker offline (airplane-mode capable)
- ✅ Responsive layout (desktop → tablet → mobile)
- 🔮 Electron desktop build, WebUSB/WebSerial hardware bridge

## 13. Cloud & distributed computing
- ✅ Web Worker multi-threading (sim isolated from UI)
- ✅ IndexedDB state persistence helper
- 🔮 WebGPU compute shaders, WASM SIMD, distributed multi-tab, Supabase sync
> Foundation: engine uses typed arrays + CSR + isolated worker → GPU/WASM backend swaps in behind the same message protocol.

## 14. Plugin ecosystem
- 🟡 Model registry pattern (`models.js`) and preset registry (`presets.js`) are the plugin seams
- 🔮 Formal plugin API, marketplace, Jupyter kernel, REST API + OpenAPI

## 15. Interactive tutorials
- ✅ Preset-driven guided regimes + in-app copilot hints
- 🔮 Gamified badges, step-by-step builder, publication-ready PDF export

## 16. Accessibility & i18n
- ✅ Colorblind palettes (protan/deutan/tritan) + monochrome
- ✅ Voice control (Web Speech) + keyboard shortcuts
- 🟡 Semantic structure for screen readers
- 🔮 Full WCAG 2.1 AA audit, 20+ language translations

---

### Design principle

We prioritized a **correct, verifiable, dependency-free core** over a large surface of stubs. The numerical engine is unit-tested and deterministic; the visualization, analytics, optogenetics, copilot, and export paths are real. Everything marked 🔮 has an explicit hook so contributors can build it incrementally.
