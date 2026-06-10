"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { fadeUp, hoverLift, tapPress, viewportOnce } from "@/lib/motion";
import { Rocket } from "lucide-react";

export default function CTA() {
  return (
    <section className="relative mx-auto max-w-5xl px-6 pb-28">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="relative overflow-hidden rounded-3xl border border-edge bg-gradient-to-br from-panel2 to-panel p-12 text-center shadow-card"
      >
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand/20 blur-3xl" />
        <h2 className="relative text-3xl font-extrabold sm:text-4xl">
          Ready to fire some neurons?
        </h2>
        <p className="relative mx-auto mt-4 max-w-lg text-slate-300">
          No install, no signup. The full simulator runs the moment you click.
        </p>
        <motion.div
          whileHover={hoverLift}
          whileTap={tapPress}
          className="relative mt-8 inline-block"
        >
          <Link href="/simulator" className="btn-primary text-base">
            <Rocket size={18} /> Launch CortexSim GODMODE
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
