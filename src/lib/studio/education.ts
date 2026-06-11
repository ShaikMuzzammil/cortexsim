// Educational layer for every one of the 35 studio activities, distilled from
// the GODMODE product brief: why each module matters scientifically, where it
// is used in the real world, what the user learns, and an actionable "try this".

export interface Education {
  why: string;
  applications: string[];
  knowledge: string;
  tryThis: string;
  stack: string[];
}

export const EDUCATION: Record<number, Education> = {
  1: {
    why: "If a simulation runs slower than real time, the parameters are too heavy and results stop being meaningful. This panel tells you whether the device or the model is the bottleneck.",
    applications: ["Cloud resource allocation in the Human Brain Project", "Profiling neuromorphic and HPC simulations"],
    knowledge: "You learn to separate numerical performance from biological fidelity.",
    tryThis: "Push the network size up and watch the real-time factor drop below 1\u00d7.",
    stack: ["requestAnimationFrame loop", "performance.now() timing", "Web Workers"],
  },
  2: {
    why: "Brains and models live in high-dimensional parameter spaces. Sweeping one axis shows which knobs actually change behaviour and where the sensitive operating points are.",
    applications: ["Drug-effect screening", "Tuning neuromorphic chips", "Hyperparameter search"],
    knowledge: "You learn to read cause-and-effect curves and find tipping points.",
    tryThis: "Sweep the input drive and find the steep section where firing switches on.",
    stack: ["Background grid sweep", "Cancellable workers", "Heatmap / line plots"],
  },
  3: {
    why: "Real electrophysiology injects current to probe a cell. This reproduces the dynamic-clamp technique live, without restarting the run.",
    applications: ["Patch-clamp dynamic-clamp rigs", "Brain-computer interface stimulation design"],
    knowledge: "You learn how a neuron's response depends on the shape of its input.",
    tryThis: "Match the sine frequency to the firing rate and watch the cell entrain.",
    stack: ["Live current injection", "Waveform synthesis", "Izhikevich integration"],
  },
  4: {
    why: "The raster is the fundamental picture of network activity \u2014 every dot is one spike from one neuron in time.",
    applications: ["Reading multi-electrode array recordings", "Detecting cortical waves and avalanches"],
    knowledge: "You learn to recognise synchrony, travelling waves and asynchronous states by eye.",
    tryThis: "Raise the drive until vertical bands (population synchrony) appear.",
    stack: ["Canvas 2D rendering", "Rolling spike buffers", "E/I colour coding"],
  },
  5: {
    why: "Collapsing thousands of spikes into a firing rate reveals rhythms, balance and bursts that single spikes hide.",
    applications: ["Comparing model output to EEG / LFP band power", "Closed-loop neurofeedback"],
    knowledge: "You learn how excitatory and inhibitory rates track and oppose each other.",
    tryThis: "Watch the E-rate and I-rate chase each other during an oscillation.",
    stack: ["Sliding-window smoothing", "Area charts", "Real-time aggregation"],
  },
  6: {
    why: "The local field potential's time-frequency content shows rhythms appearing and disappearing over seconds.",
    applications: ["Seizure-onset detection", "Automatic sleep-stage scoring"],
    knowledge: "You learn to read a spectrogram's bright bands as momentarily active frequencies.",
    tryThis: "Generate the demo and find the band that brightens over time.",
    stack: ["Short-time Fourier transform", "Heatmap rendering", "Welch averaging"],
  },
  7: {
    why: "Correlating two groups reveals whether they communicate and with what time lag \u2014 the basis of effective connectivity.",
    applications: ["Mapping interactions between brain regions", "Lag estimation in neural circuits"],
    knowledge: "You learn that a correlation peak offset from zero implies a direction of influence.",
    tryThis: "Compare two groups and read the lag of the correlation peak.",
    stack: ["Cross-correlogram", "Coherence spectrum", "Rolling 2 s window"],
  },
  8: {
    why: "A single number \u2014 the Kuramoto order parameter \u2014 captures how phase-locked the whole network is.",
    applications: ["Parkinson's beta hypersynchrony", "Epilepsy synchronisation research"],
    knowledge: "You learn that synchrony near 1 can be pathological, not healthy.",
    tryThis: "Increase the coupling and watch the order parameter climb toward 1.",
    stack: ["Phase extraction", "Order-parameter math", "Gauge rendering"],
  },
  9: {
    why: "Transfer entropy measures directed information flow \u2014 who drives whom \u2014 beyond simple correlation.",
    applications: ["Inferring causal circuits from recordings", "Effective-connectivity estimation"],
    knowledge: "You learn the difference between correlation and directed influence.",
    tryThis: "Compare the estimate when one group drives another versus when they are independent.",
    stack: ["Information theory", "Probability binning", "Directed measures"],
  },
  10: {
    why: "The (v, u) phase plane shows the geometry behind every spike \u2014 thresholds, recovery and limit cycles.",
    applications: ["Designing neuron models for neuromorphic hardware", "Teaching dynamical systems"],
    knowledge: "You learn why crossing a nullcline triggers a spike.",
    tryThis: "Raise the input and watch the trajectory loop around faster.",
    stack: ["Nullcline geometry", "Phase-space plotting", "Izhikevich equations"],
  },
  11: {
    why: "Bifurcations are the tipping points where the dynamics change kind \u2014 rest to spiking, tonic to bursting.",
    applications: ["Predicting transitions into seizure regimes", "Stability analysis"],
    knowledge: "You learn to spot where tonic firing turns into bursting.",
    tryThis: "Sweep the current and find the jump from one to many inter-spike intervals.",
    stack: ["Parameter sweep", "ISI extraction", "Hysteresis detection"],
  },
  12: {
    why: "Wiring shapes function; the weight matrix is the network's anatomy and sets its graph metrics.",
    applications: ["Connectomics", "Designing reservoir-computing networks"],
    knowledge: "You learn how topology changes clustering coefficient and path length.",
    tryThis: "Switch to small-world and watch clustering jump while paths stay short.",
    stack: ["Weight-matrix heatmap", "Graph metrics", "Editable connectivity"],
  },
  13: {
    why: "Spike-timing-dependent plasticity is the leading rule for how synapses learn from the order of spikes.",
    applications: ["On-chip learning in neuromorphic AI", "Models of memory formation"],
    knowledge: "You learn that the order and timing of spikes decide strengthening versus weakening.",
    tryThis: "Lower the learning rate to stop the weight saturating at its bounds.",
    stack: ["STDP window", "Online weight updates", "LTP / LTD regions"],
  },
  14: {
    why: "Without homeostasis, plastic networks run away. Synaptic scaling pulls firing rates back to a target.",
    applications: ["Stability of deep / spiking learning systems", "Developmental neuroscience"],
    knowledge: "You learn how slow negative feedback stabilises fast learning.",
    tryThis: "Set a low target rate and watch the synaptic gain shrink to meet it.",
    stack: ["Multiplicative scaling", "Set-point control", "Rate estimation"],
  },
  15: {
    why: "Electrical synapses (gap junctions) synchronise neurons faster and more directly than chemical ones.",
    applications: ["Interneuron networks", "Cardiac and retinal coupling"],
    knowledge: "You learn a second, faster route to synchrony.",
    tryThis: "Turn the coupling up from zero and watch the two traces lock together.",
    stack: ["Ohmic coupling", "Pairwise synchrony index", "Toggleable junctions"],
  },
  16: {
    why: "Real neurons are not points \u2014 dendrites compute before the soma fires, and spikes back-propagate.",
    applications: ["Modelling dendritic computation", "Calcium-imaging interpretation"],
    knowledge: "You learn how soma and dendrite voltages diverge.",
    tryThis: "Drive the dendrite and watch the soma follow with a delay.",
    stack: ["Two-compartment model", "Axial coupling", "Calcium traces"],
  },
  17: {
    why: "Bursts carry information distinct from single spikes and signal specific cell types and states.",
    applications: ["Thalamic bursting", "Pathological bursting in disease"],
    knowledge: "You learn to detect and quantify bursts: duration, inter-burst interval, intra-burst rate.",
    tryThis: "Use a bursting model and read off the intra-burst frequency.",
    stack: ["Threshold detection", "Event statistics", "IB neuron model"],
  },
  18: {
    why: "Splitting each frame's budget between simulation and UI keeps an interactive simulator responsive.",
    applications: ["Real-time control loops", "Interactive scientific tools"],
    knowledge: "You learn the trade-off between throughput and responsiveness.",
    tryThis: "Switch to Max throughput and watch sim compute fill the frame budget.",
    stack: ["Frame budgeting", "Priority scheduling", "Adaptive stepping"],
  },
  19: {
    why: "Big networks must be split across cores, and that communication then costs real time.",
    applications: ["Supercomputer brain simulations (NEST, MPI)", "Distributed training"],
    knowledge: "You learn why too many partitions can be slower, not faster.",
    tryThis: "Increase the partition count and watch the communication overhead grow.",
    stack: ["Domain partitioning", "Load balancing", "MPI-style messaging"],
  },
  20: {
    why: "One equation with four parameters (a, b, c, d) produces regular, bursting and chattering neurons.",
    applications: ["Rapidly prototyping neuron types", "Education on model dynamics"],
    knowledge: "You learn what each Izhikevich parameter actually controls.",
    tryThis: "Raise d and watch spike-frequency adaptation and bursting strengthen.",
    stack: ["Live parameter editing", "Hot reload", "Expression evaluation"],
  },
  21: {
    why: "Reproducible science needs scripted, timed stimulation rather than ad-hoc poking.",
    applications: ["Optogenetics / stimulation protocols", "Automated experiments"],
    knowledge: "You learn to compose causal experiments such as pulse \u2192 inhibition \u2192 pulse.",
    tryThis: "Enable a pulse then an inhibition and watch the playhead run them in order.",
    stack: ["Timeline editor", "JSON import / export", "Event scheduling"],
  },
  22: {
    why: "Real neurons are noisy, and the colour of that noise changes the dynamics it produces.",
    applications: ["Modelling trial-to-trial variability", "Stochastic resonance studies"],
    knowledge: "You learn the difference between white and colored (Ornstein-Uhlenbeck) noise.",
    tryThis: "Switch to colored noise and watch excursions last noticeably longer.",
    stack: ["OU process", "Gaussian sampling", "Distribution histogram"],
  },
  23: {
    why: "Averaging the input in the window before each spike reveals exactly what makes a neuron fire.",
    applications: ["Receptive-field mapping in sensory neuroscience", "Reverse correlation"],
    knowledge: "You learn how the spike-triggered average exposes a neuron's preferred input.",
    tryThis: "Read the shape of the average just before time zero.",
    stack: ["Reverse correlation", "Event-aligned averaging", "Causal windows"],
  },
  24: {
    why: "Population activity usually lives on a low-dimensional manifold that PCA can reveal.",
    applications: ["Decoding movement from motor cortex (BCI)", "Neural-state-space analysis"],
    knowledge: "You learn that thousands of neurons share just a few latent dimensions.",
    tryThis: "Watch the trajectory trace a loop as the network rhythm cycles.",
    stack: ["PCA / t-SNE", "Manifold projection", "Animated scatter"],
  },
  25: {
    why: "Stable states are valleys in an energy landscape, and the network rolls into the nearest one.",
    applications: ["Memory as attractors", "Decision-making models"],
    knowledge: "You learn what basins of attraction and bistability mean.",
    tryThis: "Tilt the bias and flip the ball between the up and down states.",
    stack: ["Mean-field potential", "Fixed-point geometry", "Energy landscape"],
  },
  26: {
    why: "Excitation/inhibition balance is essential; a PI controller can hold the ratio steady against disturbance.",
    applications: ["Cortical stability models", "Epilepsy-prevention research"],
    knowledge: "You learn how feedback control keeps a network balanced.",
    tryThis: "Raise the disturbance and watch the controller correct the E/I ratio.",
    stack: ["PI control", "Set-point tracking", "Live balance meter"],
  },
  27: {
    why: "The rise and decay times of AMPA, NMDA and GABA synapses set the network's rhythms.",
    applications: ["Pharmacology \u2014 many drugs change these time constants", "Rhythm generation"],
    knowledge: "You learn how faster inhibition sharpens gamma oscillations.",
    tryThis: "Shorten the GABA decay and watch the post-synaptic potential narrow.",
    stack: ["Dual-exponential PSP", "Synaptic kinetics", "Live retuning"],
  },
  28: {
    why: "The power spectrum names the network's rhythms \u2014 theta, beta and gamma bands.",
    applications: ["EEG biomarkers of disease and cognition", "Brain-state classification"],
    knowledge: "You learn to read spectral peaks as dominant oscillations.",
    tryThis: "Find the gamma peak and watch the dominant-frequency readout track it.",
    stack: ["Welch's method", "Peak detection", "Band markers"],
  },
  29: {
    why: "Co-firing reveals functional cell assemblies that the anatomical wiring alone cannot show.",
    applications: ["Resting-state functional connectivity", "Cell-assembly detection"],
    knowledge: "You learn the difference between structural and functional connectivity.",
    tryThis: "Add more assemblies and watch bright co-firing blocks appear.",
    stack: ["Correlation matrix", "Clustering", "CSV export"],
  },
  30: {
    why: "Custom metrics let you measure exactly the quantity you care about and act on it.",
    applications: ["Bespoke biomarkers", "Scriptable alerts and triggers"],
    knowledge: "You learn to compose meaningful quantities from raw signals.",
    tryThis: "Compute the E/I ratio and push excitation until the value spikes.",
    stack: ["Expression evaluation", "Threshold alerts", "Live formula"],
  },
  31: {
    why: "Capturing results continuously to a buffer makes experiments reproducible and exportable.",
    applications: ["CSV / JSON export for papers", "PDF report generation"],
    knowledge: "You learn how the sampling interval trades detail against buffer size.",
    tryThis: "Shorten the sample interval and watch the buffer fill faster.",
    stack: ["Ring buffers", "jsPDF reports", "Scheduled recording"],
  },
  32: {
    why: "Presets jump straight to a known dynamical regime so you can start from the right place.",
    applications: ["Teaching and demos", "Reproducing published network states"],
    knowledge: "You learn to recognise gamma, bursting, asynchronous and seizure-like rasters.",
    tryThis: "Switch to Seizure-like and watch dense vertical bands form.",
    stack: ["Preset library", "localStorage save / load", "Parameter bundles"],
  },
  33: {
    why: "Long-running simulations have an OS-level footprint in CPU, memory and power.",
    applications: ["Desktop / Electron builds", "Resource budgeting"],
    knowledge: "You learn how recording buffers raise memory usage over time.",
    tryThis: "Turn recording on and watch the memory trace creep upward.",
    stack: ["Resource sampling", "Sparklines", "Electron-style metrics"],
  },
  34: {
    why: "The phase-response curve predicts whether and how neurons will synchronise.",
    applications: ["Predicting network rhythms", "Entrainment by stimulation"],
    knowledge: "You learn how the timing of an input advances or delays the next spike.",
    tryThis: "Read where the curve is positive (advance) versus negative (delay).",
    stack: ["Phase perturbation", "Curve fitting", "Synchronisation theory"],
  },
  35: {
    why: "The f-I curve is a neuron's fundamental input-to-output map, with a linear range and saturation.",
    applications: ["Calibrating models", "Understanding gain control"],
    knowledge: "You learn where the linear range and saturation of a neuron lie.",
    tryThis: "Find the threshold where firing begins, then the saturating top of the curve.",
    stack: ["f-I curve", "Sigmoid fit", "Gain estimation"],
  },
};

export function educationFor(id: number): Education | undefined {
  return EDUCATION[id];
}
