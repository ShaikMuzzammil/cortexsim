import HeroCanvas from "./HeroCanvas";
import { useSim } from "../../store/useSim";

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

const STATS = [
  { value: "2,000", label: "Neurons, live" },
  { value: "60 fps", label: "Real-time 3D" },
  { value: "0", label: "Logins required" },
];

export default function Hero() {
  const launch = useSim((s) => s.launch);
  const setRunning = useSim((s) => s.setRunning);

  const start = () => {
    launch();
    setRunning(true);
    scrollTo("platform");
  };

  return (
    <section
      id="top"
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-6"
    >
      <HeroCanvas />
      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-cyan-200">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300" />
          Real-time Izhikevich spiking network
        </span>
        <h1 className="mt-6 text-5xl font-black leading-[1.05] tracking-tight sm:text-7xl">
          Watch a brain
          <br />
          <span className="gradient-text">come alive.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-white/65">
          CortexSim Pro simulates thousands of biologically realistic spiking
          neurons in your browser — in real time, in 3D, with zero setup.
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <button
            onClick={start}
            className="glow-btn rounded-2xl px-8 py-4 text-base"
          >
            Start the Platform →
          </button>
          <button
            onClick={() => scrollTo("features")}
            className="glass rounded-2xl px-6 py-4 text-base text-white/80 transition-colors hover:text-white"
          >
            Explore features
          </button>
        </div>
        <div className="mx-auto mt-14 grid max-w-lg grid-cols-3 gap-4">
          {STATS.map((s) => (
            <div key={s.label} className="glass rounded-2xl px-3 py-4">
              <div className="gradient-text text-2xl font-extrabold">
                {s.value}
              </div>
              <div className="mt-1 text-xs text-white/50">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40">
        <div className="animate-bounce text-2xl">↓</div>
      </div>
    </section>
  );
}
