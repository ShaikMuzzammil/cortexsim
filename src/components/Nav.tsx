import { useScrollSpy } from "../hooks/useScrollSpy";
import { useSim } from "../store/useSim";

const LINKS = [
  { id: "top", label: "Home" },
  { id: "features", label: "Features" },
  { id: "platform", label: "Platform" },
  { id: "science", label: "Science" },
];

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export default function Nav() {
  const active = useScrollSpy(LINKS.map((l) => l.id));
  const launch = useSim((s) => s.launch);
  const setRunning = useSim((s) => s.setRunning);

  const goPlatform = () => {
    launch();
    setRunning(true);
    scrollTo("platform");
  };

  return (
    <header className="fixed inset-x-0 top-0 z-[80] flex justify-center px-4 pt-4">
      <nav className="glass flex w-full max-w-5xl items-center justify-between rounded-2xl px-4 py-2.5">
        <button
          onClick={() => scrollTo("top")}
          className="flex items-center gap-2 text-sm font-extrabold tracking-tight"
        >
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-brand-cyan to-brand-violet text-ink">
            ◉
          </span>
          <span className="gradient-text">CortexSim Pro</span>
        </button>
        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <button
              key={l.id}
              onClick={() => scrollTo(l.id)}
              className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                active === l.id
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:text-white"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
        <button
          onClick={goPlatform}
          className="glow-btn rounded-xl px-4 py-1.5 text-sm"
        >
          Launch
        </button>
      </nav>
    </header>
  );
}
