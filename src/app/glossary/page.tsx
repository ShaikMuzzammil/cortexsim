import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import GlossaryList from "@/components/learn/GlossaryList";
import { GLOSSARY } from "@/content/glossary";

export const metadata: Metadata = {
  title: "Glossary - CortexSim",
  description:
    "Plain-language definitions of every neuroscience and modeling term used in CortexSim.",
};

export default function GlossaryPage() {
  return (
    <main className="min-h-screen bg-ink text-white">
      <Navbar />
      <section className="mx-auto max-w-5xl px-6 pb-20 pt-32">
        <div className="max-w-2xl">
          <span className="rounded-md bg-good/15 px-2.5 py-1 text-xs font-bold text-good">
            REFERENCE
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Glossary
          </h1>
          <p className="mt-4 text-lg leading-8 text-slate-400">
            {GLOSSARY.length} terms from across the simulator and guides, defined
            in plain language. Use the search box to jump straight to one.
          </p>
        </div>

        <div className="mt-10">
          <GlossaryList terms={GLOSSARY} />
        </div>

        <div className="mt-12">
          <Link href="/learn" className="btn-ghost">
            Back to learning path
          </Link>
        </div>
      </section>
      <Footer />
    </main>
  );
}
