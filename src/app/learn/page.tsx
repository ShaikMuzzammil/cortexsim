import type { Metadata } from "next";
import Link from "next/link";
import { Map } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import GuideCard from "@/components/learn/GuideCard";
import LearnDashboard from "@/components/learn/LearnDashboard";
import { GUIDES, getGuidesByCategory } from "@/content/guides";

export const metadata: Metadata = {
  title: "Learn - CortexSim",
  description:
    "An interactive learning platform for spiking neural networks: guided modules with objectives, experiments, outcomes, saved notes and progress tracking.",
};

export default function LearnPage() {
  const byCategory = getGuidesByCategory();
  return (
    <main className="min-h-screen bg-ink text-white">
      <Navbar />
      <section className="mx-auto max-w-6xl px-6 pb-20 pt-32">
        <div className="max-w-2xl">
          <span className="rounded-md bg-brand/15 px-2.5 py-1 text-xs font-bold text-brand">
            LEARNING PLATFORM
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Learn CortexSim
          </h1>
          <p className="mt-4 text-lg leading-8 text-slate-400">
            {GUIDES.length} interactive modules that take you from a blank screen
            to designing your own experiments. Each module has objectives,
            experiments to try, expected outcomes, and a workspace where your
            notes and progress are saved.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/learn/getting-started" className="btn-primary">
              Start from the beginning
            </Link>
            <Link
              href="/learn/map"
              className="btn-ghost inline-flex items-center gap-1.5"
            >
              <Map size={15} /> Mind map
            </Link>
            <Link href="/learn/practice" className="btn-ghost">
              Practice
            </Link>
            <Link href="/tips" className="btn-ghost">
              Tips
            </Link>
            <Link href="/glossary" className="btn-ghost">
              Glossary
            </Link>
          </div>
        </div>

        <div className="mt-10">
          <LearnDashboard />
        </div>

        {byCategory.map((group) => (
          <div key={group.category} className="mt-14">
            <div className="flex items-baseline justify-between">
              <h2 className="text-xl font-bold text-white">{group.category}</h2>
              <span className="text-xs text-slate-500">
                {group.guides.length} module
                {group.guides.length === 1 ? "" : "s"}
              </span>
            </div>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {group.guides.map((guide, i) => (
                <GuideCard key={guide.slug} guide={guide} index={i} />
              ))}
            </div>
          </div>
        ))}
      </section>
      <Footer />
    </main>
  );
}
