"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface Tier {
  name: string;
  price: string;
  period?: string;
  blurb: string;
  features: string[];
  cta: string;
  href: string;
  highlight?: boolean;
}

const TIERS: Tier[] = [
  {
    name: "Hobby",
    price: "$0",
    period: "forever",
    blurb: "Run the full studio locally and keep everything on disk.",
    features: [
      "Self-host on your machine or Vercel",
      "Full 35-module studio",
      "Up to 5 projects, 50 runs",
      "File-backed JSON workspace",
      "Account export",
      "Community support",
    ],
    cta: "Start free",
    href: "/auth/signup",
  },
  {
    name: "Pro",
    price: "$19",
    period: "per month",
    blurb: "Built for research teams running cortical experiments daily.",
    features: [
      "Unlimited projects, runs, notes",
      "Workspace insights + tag cloud",
      "Public share links",
      "5 webhooks, signed deliveries",
      "API tokens, audit log",
      "Cmd+K command palette",
      "Email support",
    ],
    cta: "Try Pro",
    href: "/auth/signup?plan=pro",
    highlight: true,
  },
  {
    name: "Lab",
    price: "$79",
    period: "per month",
    blurb: "For neuroscience teams that need collaboration and SSO.",
    features: [
      "Everything in Pro",
      "Team workspaces",
      "SAML / OIDC SSO",
      "Custom data retention",
      "Webhooks unlimited",
      "SLA + priority support",
      "On-prem option",
    ],
    cta: "Contact us",
    href: "mailto:hello@cortexsim.app",
  },
];

const tierInit = { opacity: 0, y: 12 };
const tierShow = { opacity: 1, y: 0 };

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 px-6 bg-[#05070e] border-t border-edge/40">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-[11px] uppercase tracking-[0.22em] text-brand mb-3">Pricing</div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">Run experiments your way.</h2>
          <p className="text-slate-400 max-w-2xl mx-auto mt-3">Self-host free or scale up with hosted features. Switch tiers at any time.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {TIERS.map((tier, i) => {
            const borderCls = tier.highlight ? "border-[#6ea8ff]" : "border-edge";
            const vp = { once: true, amount: 0.3 };
            const tr = { delay: i * 0.05 };
            return (
              <motion.div
                key={tier.name}
                initial={tierInit}
                whileInView={tierShow}
                viewport={vp}
                transition={tr}
                className={`relative rounded-2xl border ${borderCls} bg-[#0b1226] p-6 flex flex-col`}
              >
                {tier.highlight ? (
                  <span className="absolute -top-3 left-6 text-[10px] font-bold uppercase tracking-[0.2em] bg-[#6ea8ff] text-[#05070e] px-2 py-0.5 rounded">Most popular</span>
                ) : null}
                <div className="text-sm font-semibold text-white">{tier.name}</div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">{tier.price}</span>
                  {tier.period ? <span className="text-[11px] text-slate-500">{tier.period}</span> : null}
                </div>
                <p className="text-sm text-slate-400 mt-3">{tier.blurb}</p>
                <ul className="mt-5 space-y-2 text-sm text-slate-200 flex-1">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check size={14} className="text-[#36d399] mt-1 shrink-0"/>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href={tier.href} className={`mt-6 inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-semibold ${tier.highlight ? "bg-[#6ea8ff] text-[#05070e] hover:bg-white" : "border border-edge text-white hover:border-[#6ea8ff]"}`}>
                  {tier.cta}
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
