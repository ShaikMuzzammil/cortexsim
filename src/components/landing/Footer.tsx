"use client";

import Link from "next/link";
import { Brain } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-edge/60 bg-ink/60 py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
        <div className="flex items-center gap-2 font-bold">
          <Brain className="text-brand" size={18} />
          CortexSim Studio
        </div>
        <p className="text-sm text-slate-500">
          Built with Next.js, TypeScript, Tailwind, Framer Motion and Three.js.
        </p>
        <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-400">
          <Link href="/simulator" className="hover:text-white">Simulator</Link>
          <Link href="/learn" className="hover:text-white">Learn</Link>
          <Link href="/tips" className="hover:text-white">Tips</Link>
          <Link href="/glossary" className="hover:text-white">Glossary</Link>
          <Link href="/docs" className="hover:text-white">Docs</Link>
        </div>
      </div>
    </footer>
  );
}
