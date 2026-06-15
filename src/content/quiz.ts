// Interactive knowledge-check content for the Learn > Practice experience.
// Each question belongs to a domain so learners can drill a single topic or
// test everything at once.

export interface QuizQuestion {
  id: string;
  domain: QuizDomain;
  question: string;
  options: string[];
  answer: number; // index into options
  explanation: string;
}

export type QuizDomain =
  | "Basics"
  | "Neuroscience"
  | "Networks"
  | "Analysis"
  | "Neuromorphic"
  | "Workflow";

export const QUIZ_DOMAINS: QuizDomain[] = [
  "Basics",
  "Neuroscience",
  "Networks",
  "Analysis",
  "Neuromorphic",
  "Workflow",
];

export const QUIZ: QuizQuestion[] = [
  {
    id: "b1",
    domain: "Basics",
    question: "What does a single spike represent in a spiking neural network?",
    options: [
      "A continuous analog voltage value",
      "A discrete all-or-nothing event in time",
      "The average firing rate over a second",
      "A synaptic weight update",
    ],
    answer: 1,
    explanation: "Spikes are discrete, all-or-nothing events. Information is carried by their timing and rate, not by a graded amplitude.",
  },
  {
    id: "b2",
    domain: "Basics",
    question: "In a leaky integrate-and-fire neuron, what causes the membrane potential to decay toward rest?",
    options: ["The threshold", "The leak term", "The refractory period", "The reset voltage"],
    answer: 1,
    explanation: "The leak term continuously pulls the membrane potential back toward its resting value between inputs.",
  },
  {
    id: "b3",
    domain: "Basics",
    question: "After a neuron fires, the refractory period mainly does what?",
    options: [
      "Increases the firing rate",
      "Briefly prevents immediate re-firing",
      "Resets all synaptic weights",
      "Doubles the input current",
    ],
    answer: 1,
    explanation: "The refractory period is a short window after a spike during which the neuron cannot fire again, limiting maximum rate.",
  },
  {
    id: "n1",
    domain: "Neuroscience",
    question: "Gamma-band oscillations are typically associated with which frequency range?",
    options: ["1-4 Hz", "4-8 Hz", "8-12 Hz", "30-80 Hz"],
    answer: 3,
    explanation: "Gamma oscillations sit roughly in the 30-80 Hz band and are linked to local cortical processing and attention.",
  },
  {
    id: "n2",
    domain: "Neuroscience",
    question: "In the PING mechanism, what generates the rhythm?",
    options: [
      "Excitatory cells alone",
      "The interplay between excitatory and inhibitory populations",
      "External noise only",
      "Synaptic pruning",
    ],
    answer: 1,
    explanation: "Pyramidal-Interneuron Network Gamma (PING) arises from the feedback loop between excitatory and inhibitory cells.",
  },
  {
    id: "n3",
    domain: "Neuroscience",
    question: "Spike-timing-dependent plasticity (STDP) strengthens a synapse when the pre-synaptic spike arrives...",
    options: [
      "Just after the post-synaptic spike",
      "Just before the post-synaptic spike",
      "At exactly the same time",
      "Never - timing is irrelevant",
    ],
    answer: 1,
    explanation: "Pre-before-post (causal) ordering typically potentiates the synapse; post-before-pre depresses it.",
  },
  {
    id: "net1",
    domain: "Networks",
    question: "A balanced network keeps activity stable by...",
    options: [
      "Removing all inhibition",
      "Matching excitation with comparable inhibition",
      "Using only feedforward connections",
      "Freezing all weights",
    ],
    answer: 1,
    explanation: "In the balanced regime, strong excitation is cancelled by strong inhibition, producing irregular, stable, low-rate firing.",
  },
  {
    id: "net2",
    domain: "Networks",
    question: "A small-world topology is characterised by...",
    options: [
      "High clustering and short path lengths",
      "No clustering and long paths",
      "A single hub connected to all nodes",
      "Completely random wiring only",
    ],
    answer: 0,
    explanation: "Small-world networks combine high local clustering with short global path lengths via a few long-range links.",
  },
  {
    id: "net3",
    domain: "Networks",
    question: "Raising the E/I ratio too high typically leads to...",
    options: ["Silence", "Runaway, hyper-synchronous activity", "Perfect balance", "Lower firing rates"],
    answer: 1,
    explanation: "Too much excitation relative to inhibition pushes the network toward runaway, seizure-like synchronous bursts.",
  },
  {
    id: "a1",
    domain: "Analysis",
    question: "The power spectrum of a spike train tells you mainly about...",
    options: [
      "The spatial layout of neurons",
      "Which rhythmic frequencies dominate",
      "The total number of synapses",
      "The membrane capacitance",
    ],
    answer: 1,
    explanation: "A power spectrum decomposes activity into frequency components, revealing dominant oscillation bands.",
  },
  {
    id: "a2",
    domain: "Analysis",
    question: "Mutual information between a stimulus and spike train measures...",
    options: [
      "How much knowing one reduces uncertainty about the other",
      "The number of neurons",
      "The synaptic delay",
      "The refractory period",
    ],
    answer: 0,
    explanation: "Mutual information quantifies how much observing the response reduces uncertainty about the stimulus, in bits.",
  },
  {
    id: "a3",
    domain: "Analysis",
    question: "Why use surrogate (shuffled) data when testing synchrony?",
    options: [
      "To speed up the simulation",
      "To build a null distribution and avoid false positives",
      "To increase the firing rate",
      "To compress the export file",
    ],
    answer: 1,
    explanation: "Surrogates destroy real timing structure, giving a chance-level baseline so you can tell genuine synchrony from coincidence.",
  },
  {
    id: "nm1",
    domain: "Neuromorphic",
    question: "Why is sparsity desirable on neuromorphic hardware like Loihi?",
    options: [
      "It makes the math harder",
      "Fewer spikes mean lower energy per inference",
      "It increases memory usage",
      "It removes the need for weights",
    ],
    answer: 1,
    explanation: "Event-driven chips spend energy mostly on spikes, so sparse activity directly lowers power consumption.",
  },
  {
    id: "nm2",
    domain: "Neuromorphic",
    question: "Surrogate gradients are used to...",
    options: [
      "Train spiking networks despite the non-differentiable spike",
      "Replace the membrane equation",
      "Generate random noise",
      "Compress the dataset",
    ],
    answer: 0,
    explanation: "The spike threshold is non-differentiable; surrogate gradients give a smooth proxy so backpropagation can train SNNs.",
  },
  {
    id: "w1",
    domain: "Workflow",
    question: "What is the single most important thing for a reproducible run?",
    options: ["A nice color theme", "Fixing the random seed", "A faster CPU", "More neurons"],
    answer: 1,
    explanation: "Fixing the seed makes the pseudo-random sequence deterministic, so the same configuration yields the same result.",
  },
  {
    id: "w2",
    domain: "Workflow",
    question: "Exporting a run as state JSON is most useful because it...",
    options: [
      "Looks pretty",
      "Captures the full configuration so the run can be rebuilt later",
      "Deletes the run",
      "Speeds up the GPU",
    ],
    answer: 1,
    explanation: "State JSON records parameters and results, letting you or a colleague reconstruct the exact experiment.",
  },
  {
    id: "w3",
    domain: "Workflow",
    question: "A read-only share link is best used to...",
    options: [
      "Give the whole world edit access",
      "Let others view a result without an account",
      "Delete a project",
      "Reset your password",
    ],
    answer: 1,
    explanation: "Share links expose a safe, read-only view of a project so collaborators can review results without signing in.",
  },
];

export function quizByDomain(domain: QuizDomain | "All"): QuizQuestion[] {
  if (domain === "All") return QUIZ;
  return QUIZ.filter((q) => q.domain === domain);
}

export function quizDomainCount(domain: QuizDomain): number {
  return QUIZ.filter((q) => q.domain === domain).length;
}
