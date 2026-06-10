import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import MindMap from "@/components/learn/MindMap";

export const metadata: Metadata = {
  title: "Curriculum mind map - CortexSim",
  description:
    "The whole CortexSim learning path as a branching mind map. Click any node to open the module; completed modules are highlighted.",
};

export default function MindMapPage() {
  return (
    <main className="min-h-screen bg-ink text-white">
      <Navbar />
      <section className="mx-auto max-w-6xl px-6 pb-20 pt-32">
        <Link
          href="/learn"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white"
        >
          <ArrowLeft size={15} /> Back to learning
        </Link>
        <div className="mt-5 max-w-2xl">
          <span className="rounded-md bg-good/15 px-2.5 py-1 text-xs font-bold text-good">
            MIND MAP
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
            The curriculum, mapped
          </h1>
          <p className="mt-4 text-lg leading-8 text-slate-400">
            Every module branches from a theme. Click a node to dive in. As you
            complete modules, their nodes fill in - so you can always see how far
            you have come and what is next.
          </p>
        </div>
        <div className="mt-10">
          <MindMap />
        </div>
      </section>
      <Footer />
    </main>
  );
}
