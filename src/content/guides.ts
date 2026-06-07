// Structured, teachable references for the 5 flagship features.
// Each guide explains the mechanism, the neuroscience you learn, and the
// engineering / operating-systems parallel so the concepts transfer.

export interface GuideRef {
  label: string;
  href: string;
}

export interface Guide {
  id: string;
  icon: string;
  title: string;
  tagline: string;
  /** Step-by-step of what actually happens under the hood. */
  how: string[];
  /** The neuroscience / dynamics you take away. */
  learn: string[];
  /** The engineering / OS concept the same idea maps onto. */
  engineering: { title: string; body: string };
  /** A concrete thing to try in the simulator. */
  tryIt: string;
  refs: GuideRef[];
}

export const GUIDES: Guide[] = [
  {
    id: "network",
    icon: "🌐",
    title: "3D Network & Synaptic Wiring",
    tagline: "Thousands of neurons, sparsely connected, drawn live in 3D.",
    how: [
      "At build time each neuron is given a random 3D position and a sparse set of outgoing synapses (≈10% connectivity by default).",
      "Connections are stored once as a compressed adjacency list — never an N×N matrix — so memory stays linear in the number of edges.",
      "Every frame the engine rotates the cloud, projects each point to 2D with a perspective transform, and lights up neurons that spiked recently using additive blending.",
    ],
    learn: [
      "Structure drives function: the same neurons behave completely differently when you change how they are wired.",
      "Excitatory (cyan) and inhibitory (pink) populations must stay balanced for stable activity.",
      "Sparse, local-plus-random connectivity is what real cortex uses.",
    ],
    engineering: {
      title: "Sparse graphs & cache locality",
      body: "The synapse store is a compressed-sparse-row adjacency list — the exact structure behind graph databases, PageRank, and GPU mesh processing. Iterating only the non-zero edges (instead of every possible pair) is why 100k+ connections can update at 60 fps. It is the same reason a good scheduler keeps a ready-queue instead of scanning every process.",
    },
    tryIt:
      "Raise Connectivity and watch coordinated waves appear; drop it and activity fragments into islands.",
    refs: [
      {
        label: "Izhikevich (2003): Simple Model of Spiking Neurons",
        href: "https://www.izhikevich.org/publications/spikes.htm",
      },
      {
        label: "Sparse matrix (CSR) — Wikipedia",
        href: "https://en.wikipedia.org/wiki/Sparse_matrix",
      },
    ],
  },
  {
    id: "raster",
    icon: "📊",
    title: "Spike Raster & Event Streams",
    tagline: "Every dot is one neuron firing at one instant in time.",
    how: [
      "Each spike is recorded as a tiny event {time, neuron, type} and pushed into a fixed-size ring buffer.",
      "The panel plots a scrolling one-second window: x = time, y = neuron index, colour = excitatory or inhibitory.",
      "Old events are discarded as new ones arrive, so memory never grows without bound.",
    ],
    learn: [
      "Read population behaviour at a glance: scattered dots = healthy asynchronous coding.",
      "Vertical stripes mean the network has synchronised — the signature of a seizure-like state.",
      "Bursts, silences and travelling waves all have distinct raster fingerprints.",
    ],
    engineering: {
      title: "Event-driven systems & observability",
      body: "A raster is a distributed trace: each spike is a timestamped event on a lane, exactly like request logs, an interrupt timeline, or the event flame an OS scheduler emits. The fixed-size ring buffer is the same bounded structure the kernel uses for its log (dmesg) — you keep the most recent history and overwrite the rest.",
    },
    tryIt:
      "Load the 'Synchronous' preset and watch loose dots collapse into hard vertical bars.",
    refs: [
      {
        label: "Circular buffer — Wikipedia",
        href: "https://en.wikipedia.org/wiki/Circular_buffer",
      },
    ],
  },
  {
    id: "rate",
    icon: "🛡️",
    title: "Population Rate & Feedback Control",
    tagline: "How fast the whole network fires — and what keeps it in check.",
    how: [
      "Each millisecond the engine counts the fraction of neurons that fired and converts it to a population rate in Hz.",
      "The trace is smoothed with an exponential moving average, and excitatory vs inhibitory rates are tracked separately.",
      "Inhibition rises automatically as excitation grows, pulling the rate back down.",
    ],
    learn: [
      "Excitation/inhibition (E/I) balance is a negative-feedback loop that stabilises the brain.",
      "Too little inhibition → runaway activity; too much → silence.",
      "Healthy cortex hovers at a low, fluctuating baseline rate, not a fixed value.",
    ],
    engineering: {
      title: "Control systems & rate limiting",
      body: "Inhibition is a negative-feedback controller — conceptually a PID loop or a token-bucket rate limiter that applies backpressure before the system overloads. Remove it and the network melts down, the biological version of an event loop with no backpressure or a service with no admission control.",
    },
    tryIt:
      "Lower the Inhibitory gain toward 0 and watch the rate explode — feedback removed.",
    refs: [
      {
        label: "Excitatory/inhibitory balance — Scholarpedia",
        href: "http://www.scholarpedia.org/article/Balance_of_excitation_and_inhibition",
      },
    ],
  },
  {
    id: "spectrum",
    icon: "📈",
    title: "FFT Power Spectrum & Oscillations",
    tagline: "Turn the firing-rate signal into the rhythms hiding inside it.",
    how: [
      "The population-rate signal is sampled at 1 kHz and fed through a Fast Fourier Transform.",
      "The transform returns how much power sits at each frequency; the tallest peak is reported as the dominant frequency.",
      "The spectrum is recomputed a few times per second so you see rhythms form in real time.",
    ],
    learn: [
      "Brain rhythms (theta, beta, gamma) are emergent — no neuron is told to oscillate.",
      "Gamma rhythms (≈30–80 Hz) arise from the interplay of excitation and inhibition.",
      "A sharp spectral peak means strong, regular oscillation; a flat spectrum means noisy, asynchronous activity.",
    ],
    engineering: {
      title: "Digital signal processing & clock domains",
      body: "This is the Cooley–Tukey FFT — the same transform behind audio codecs, radio, and JPEG. Sampling a signal at a fixed rate and reading its dominant frequency is exactly how you analyse a clock line, detect jitter, or find the heartbeat period of a running system. The 1 kHz sample rate sets the Nyquist limit, just like a real ADC.",
    },
    tryIt:
      "Switch to the 'Gamma' preset and watch the dominant-frequency readout climb into the gamma band.",
    refs: [
      {
        label: "Fast Fourier transform — Wikipedia",
        href: "https://en.wikipedia.org/wiki/Fast_Fourier_transform",
      },
      {
        label: "Nyquist–Shannon sampling theorem",
        href: "https://en.wikipedia.org/wiki/Nyquist%E2%80%93Shannon_sampling_theorem",
      },
    ],
  },
  {
    id: "probe",
    icon: "🔬",
    title: "Neuron Probe: Voltage & Phase Plane",
    tagline: "Zoom into one cell and watch its internal state evolve.",
    how: [
      "Pick any neuron and the engine streams its membrane voltage v and recovery variable u every step.",
      "The oscilloscope plots v over time; the phase plane plots v against u to reveal the trajectory.",
      "When v crosses threshold the cell 'fires' and is instantly reset (v ← c, u ← u + d).",
    ],
    learn: [
      "A spike is a threshold crossing, not a smooth bump.",
      "The phase plane exposes the attractor / limit cycle behind regular firing and bursting.",
      "Different cell models trace visibly different loops in state space.",
    ],
    engineering: {
      title: "State machines & phase space",
      body: "A single neuron is a finite-state dynamical system: it integrates input until a threshold 'interrupt' fires and resets its state — just like a watchdog timer firing and re-arming, or a debounced signal. The phase plane is the very state diagram engineers use to reason about stability, hysteresis, and limit cycles.",
    },
    tryIt:
      "Set the cell model to 'Intrinsically bursting' and watch the phase-plane loop split into bursts.",
    refs: [
      {
        label: "Phase plane / dynamical systems — Wikipedia",
        href: "https://en.wikipedia.org/wiki/Phase_plane",
      },
    ],
  },
];

export function getGuide(id: string): Guide | undefined {
  return GUIDES.find((g) => g.id === id);
}
