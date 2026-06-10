import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import GuideCard from "@/components/learn/GuideCard";
import { GUIDES } from "@/content/guides";

export const metadata: Metadata = {
  title: "Learn - CortexSim",
  description:
    "A guided learning path through spiking neural networks: from your first simulation to plasticity, topologies and spectral analysis.",
};

export default function LearnPage() {
  return (
    <main className="min-h-screen bg-ink text-white">
      <Navbar />
      <section className="mx-auto max-w-6xl px-6 pb-20 pt-32">
        <div className="max-w-2xl">
          <span className="rounded-md bg-brand/15 px-2.5 py-1 text-xs font-bold text-brand">
            LEARNING PATH
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Learn CortexSim
          </h1>
          <p className="mt-4 text-lg leading-8 text-slate-400">
            Eight guides that take you from a blank screen to designing your own
            experiments. Read them in order, or jump to whatever you need. No
            neuroscience background required.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/learn/getting-started" className="btn-primary">
              Start from the beginning
            </Link>
            <Link href="/tips" className="btn-ghost">
              Browse tips
            </Link>
            <Link href="/glossary" className="btn-ghost">
              Open glossary
            </Link>
          </div>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {GUIDES.map((guide, i) => (
            <GuideCard key={guide.slug} guide={guide} index={i} />
          ))}
        </div>
      </section>
      <Footer />
    </main>
  );
}
