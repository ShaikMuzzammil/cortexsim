import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import TipsGrid from "@/components/learn/TipsGrid";
import { TIPS, KEYBOARD_SHORTCUTS } from "@/content/tips";

export const metadata: Metadata = {
  title: "Tips & shortcuts - CortexSim",
  description:
    "Practical tips for getting the most out of CortexSim, plus the full keyboard shortcut reference.",
};

export default function TipsPage() {
  return (
    <main className="min-h-screen bg-ink text-white">
      <Navbar />
      <section className="mx-auto max-w-6xl px-6 pb-20 pt-32">
        <div className="max-w-2xl">
          <span className="rounded-md bg-warn/15 px-2.5 py-1 text-xs font-bold text-warn">
            TIPS &amp; TRICKS
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Tips &amp; shortcuts
          </h1>
          <p className="mt-4 text-lg leading-8 text-slate-400">
            Field-tested advice for running cleaner experiments and reading the
            simulator faster, plus every keyboard shortcut in one place.
          </p>
        </div>

        <h2 className="mb-4 mt-12 text-xl font-bold">Keyboard shortcuts</h2>
        <div className="mb-12 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {KEYBOARD_SHORTCUTS.map((k) => (
            <div
              key={k.combo}
              className="flex items-center justify-between rounded-lg border border-edge bg-panel/70 px-3 py-2.5"
            >
              <span className="text-sm text-slate-300">{k.action}</span>
              <kbd className="rounded-md border border-edge bg-ink px-2 py-1 font-mono text-xs text-brand">
                {k.combo}
              </kbd>
            </div>
          ))}
        </div>

        <h2 className="mb-4 text-xl font-bold">Workflow &amp; analysis tips</h2>
        <TipsGrid tips={TIPS} />

        <div className="mt-12 flex flex-wrap gap-3">
          <Link href="/learn" className="btn-primary">
            Read the guides
          </Link>
          <Link href="/simulator" className="btn-ghost">
            Open the simulator
          </Link>
        </div>
      </section>
      <Footer />
    </main>
  );
}
