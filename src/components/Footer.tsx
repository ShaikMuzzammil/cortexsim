export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/10 px-6 py-10 text-center text-sm text-white/40">
      <p className="gradient-text text-base font-bold">CortexSim Pro</p>
      <p className="mt-2">
        Real-time Izhikevich spiking neural network · runs entirely in your
        browser · no account required.
      </p>
      <p className="mt-2 text-white/30">
        Built with React, TypeScript, Vite, Tailwind &amp; Zustand.
      </p>
    </footer>
  );
}
