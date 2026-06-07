export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/10 px-6 py-10 text-center text-sm text-white/40">
      <div className="gradient-text mb-1 text-base font-extrabold">
        CortexSim Pro
      </div>
      <p>
        Real-time spiking neural network · built with React, Vite & Tailwind
      </p>
      <p className="mt-2 text-white/30">
        No login · no tracking · runs entirely in your browser
      </p>
    </footer>
  );
}
