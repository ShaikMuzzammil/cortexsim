import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import SectionCatalog from "@/components/platform/SectionCatalog";
import { SECTION_STATS } from "@/content/sections";

export const metadata: Metadata = {
  title: "Platform sections - CortexSim",
  description:
    "The full CortexSim platform catalog: 35 integrated sections across visualization, analysis, dynamics, connectivity, performance and data, each with what it does, a tip and the outcome.",
};

export default function PlatformPage() {
  return (
    <main className="min-h-screen bg-ink text-white">
      <Navbar />
      <section className="mx-auto max-w-7xl px-6 pb-20 pt-32">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white"
        >
          <ArrowLeft size={15} /> Home
        </Link>
        <div className="mt-5 max-w-2xl">
          <span className="rounded-md bg-inh/15 px-2.5 py-1 text-xs font-bold text-inh">
            PLATFORM CATALOG
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
            {SECTION_STATS.total} sections, one simulation core
          </h1>
          <p className="mt-4 text-lg leading-8 text-slate-400">
            Everything CortexSim does, mapped from the platform specification.
            Each section lists what it does, a practical tip, and the outcome you
            get. Filter by area to find what you need.
          </p>
        </div>
        <div className="mt-10">
          <SectionCatalog />
        </div>
      </section>
      <Footer />
    </main>
  );
}
