"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Brain,
  Github,
  Twitter,
  Mail,
  Send,
  ArrowRight,
  Heart,
  Zap,
} from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <footer id="footer" className="relative bg-void border-t border-neon/10">
      <div className="absolute inset-0 bg-grid opacity-30" />

      <div className="relative section-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-neon" />
              <span className="font-orbitron text-lg font-bold text-gradient">
                CortexSim
              </span>
            </Link>
            <p className="text-lavenderGray text-sm leading-relaxed">
              Advanced spiking neural network simulation and visualization platform. 
              Build, simulate, and understand the brain.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/cortexsim"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-white/5 hover:bg-neon/20 text-lavenderGray hover:text-neon transition-all"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com/cortexsim"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-white/5 hover:bg-neon/20 text-lavenderGray hover:text-neon transition-all"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="mailto:contact@cortexsim.io"
                className="p-2 rounded-lg bg-white/5 hover:bg-neon/20 text-lavenderGray hover:text-neon transition-all"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-orbitron text-sm font-bold text-softWhite uppercase tracking-wider mb-4">
              Product
            </h3>
            <ul className="space-y-3">
              {[
                { href: "/", label: "Home" },
                { href: "/builder", label: "Builder" },
                { href: "/dashboard", label: "Dashboard" },
                { href: "/docs", label: "Documentation" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-lavenderGray hover:text-neon transition-colors text-sm flex items-center gap-2 group"
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="font-orbitron text-sm font-bold text-softWhite uppercase tracking-wider mb-4">
              Community
            </h3>
            <ul className="space-y-3">
              {[
                { href: "https://github.com/cortexsim", label: "GitHub", external: true },
                { href: "#", label: "Discord", external: true },
                { href: "https://twitter.com/cortexsim", label: "Twitter", external: true },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noopener noreferrer" : undefined}
                    className="text-lavenderGray hover:text-neon transition-colors text-sm flex items-center gap-2 group"
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-orbitron text-sm font-bold text-softWhite uppercase tracking-wider mb-4">
              Newsletter
            </h3>
            <p className="text-lavenderGray text-sm mb-4">
              Get updates on new features and neuroscience research.
            </p>
            <form onSubmit={handleNewsletter} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-void/50 border border-lavenderGray/30 rounded-lg px-4 py-3 text-sm text-softWhite placeholder:text-lavenderGray/50 focus:border-neon focus:outline-none pr-10"
                  required
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-neon hover:bg-neon/20 rounded-md transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              {status === "success" && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-synapticGreen text-xs"
                >
                  Subscribed successfully!
                </motion.p>
              )}
              {status === "error" && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-spikeRed text-xs"
                >
                  Failed to subscribe. Try again.
                </motion.p>
              )}
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-lavenderGray text-sm flex items-center gap-1">
            © 2026 CortexSim. Built with <Heart className="w-3 h-3 text-spikeRed fill-spikeRed" /> and <Zap className="w-3 h-3 text-neon" />
          </p>
          <div className="flex items-center gap-6 text-sm text-lavenderGray">
            <Link href="/contact" className="hover:text-neon transition-colors">
              Contact
            </Link>
            <span className="text-white/10">|</span>
            <span className="hover:text-neon transition-colors cursor-pointer">
              Privacy
            </span>
            <span className="text-white/10">|</span>
            <span className="hover:text-neon transition-colors cursor-pointer">
              Terms
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}