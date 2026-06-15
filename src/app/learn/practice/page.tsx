import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import QuizRunner from "@/components/learn/QuizRunner";
import { QUIZ } from "@/content/quiz";

export const metadata: Metadata = {
  title: "Practice - CortexSim",
  description:
    "Test your understanding of spiking neural networks with an interactive knowledge check spanning every domain, with instant explanations and saved notes.",
};

export default function PracticePage() {
  return (
    <main className="min-h-screen bg-ink text-white">
      <Navbar />
      <section className="mx-auto max-w-4xl px-6 pb-24 pt-32">
        <Link href="/learn" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-brand">
          <ArrowLeft size={15} /> Back to Learn
        </Link>
        <div className="mt-6 max-w-2xl">
          <span className="rounded-md bg-good/15 px-2.5 py-1 text-xs font-bold text-good">KNOWLEDGE CHECK</span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">Practice &amp; test yourself</h1>
          <p className="mt-4 text-lg leading-8 text-slate-400">
            {QUIZ.length} interactive questions across every domain. Pick an answer, check your work, and read the
            explanation for each one. Your notes are saved in your browser so you can keep building intuition.
          </p>
        </div>
        <div className="mt-10">
          <QuizRunner />
        </div>
      </section>
      <Footer />
    </main>
  );
}
