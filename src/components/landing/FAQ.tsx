"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const FAQS: Array<{ q: string; a: string }> = [
  {
    q: "What does CortexSim actually do?",
    a: "It's a browser-based spiking neural network studio plus a full workspace: projects, runs, notes, datasets, comments, and analytics. The studio runs a live SNN in the browser; the workspace tracks every experiment.",
  },
  {
    q: "Do I need a GPU?",
    a: "No. The simulation runs on the CPU in pure TypeScript. The default 1,000-neuron network runs comfortably at 60 fps on a laptop.",
  },
  {
    q: "Can I self-host?",
    a: "Yes. The full app is a Next.js 14 project. Deploy it to Vercel, Render, Fly, or any Node host. Storage is a local JSON store by default; swap in Postgres or Mongo for production.",
  },
  {
    q: "Is my data private?",
    a: "All data lives in your workspace. Passwords are scrypt-hashed. Sessions use HMAC-signed cookies. Public share links are explicitly opt-in and revocable. Account export downloads everything as JSON in one click.",
  },
  {
    q: "Is there an API?",
    a: "Yes \u2014 every UI feature is also a JSON REST endpoint. Generate an API token in Settings and call CortexSim from notebooks, scripts, or your CI pipeline.",
  },
  {
    q: "How do webhooks work?",
    a: "Register an HTTPS URL and CortexSim will POST signed JSON deliveries on every workspace event (project, run, note, dataset, comment, token, share). Each request carries an HMAC-SHA-256 signature in X-CortexSim-Signature.",
  },
  {
    q: "Can I use my own data?",
    a: "Upload CSV, JSON, or plain-text datasets directly. Datasets are searchable from the command palette and the search page.",
  },
  {
    q: "Does it work offline?",
    a: "The studio works fully offline once loaded. The workspace requires the API to be reachable; if you're self-hosting locally, it's an offline-friendly app.",
  },
];

const panelInit = { height: 0, opacity: 0 };
const panelShow = { height: "auto", opacity: 1 };

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="py-24 px-6 bg-[#05070e] border-t border-edge/40">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="text-[11px] uppercase tracking-[0.22em] text-brand mb-3">FAQ</div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">Questions, answered.</h2>
        </div>
        <ul className="divide-y divide-edge/60 rounded-2xl border border-edge/60 bg-[#0b1226] overflow-hidden">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <li key={f.q}>
                <button onClick={() => setOpen(isOpen ? null : i)} className="w-full text-left flex items-center justify-between gap-4 px-5 py-4 hover:bg-[#10172c]">
                  <span className="text-sm font-semibold text-white">{f.q}</span>
                  <ChevronDown size={16} className={`text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}/>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.div key="a" initial={panelInit} animate={panelShow} exit={panelInit} className="overflow-hidden">
                      <div className="px-5 pb-4 text-sm text-slate-300 leading-relaxed">{f.a}</div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
