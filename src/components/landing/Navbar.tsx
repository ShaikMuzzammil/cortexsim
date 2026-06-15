"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Brain } from "lucide-react";
import { fadeIn } from "@/lib/motion";
import { useScrollSpy } from "@/hooks/useScrollSpy";

const SECTION_IDS = ["features", "platform", "stack", "showcase", "learn-cta"];

const SECTION_LINKS: Array<{ id: string; label: string }> = [
  { id: "features", label: "Features" },
  { id: "platform", label: "Platform" },
  { id: "stack", label: "Tech" },
  { id: "showcase", label: "Showcase" },
];

const PAGE_LINKS: Array<{ href: string; label: string }> = [
  { href: "/learn", label: "Learn" },
  { href: "/learn/map", label: "Map" },
  { href: "/platform", label: "Sections" },
  { href: "/docs", label: "Docs" },
  { href: "/app", label: "Workspace" },
  { href: "/auth/login", label: "Sign in" },
];

export default function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const active = useScrollSpy(SECTION_IDS);

  return (
    <motion.header
      variants={fadeIn}
      initial="hidden"
      animate="show"
      className="fixed inset-x-0 top-0 z-50 border-b border-edge/60 bg-ink/70 backdrop-blur-xl"
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-extrabold tracking-tight"
        >
          <Brain className="text-brand" size={22} />
          <span>CortexSim</span>
          <span className="rounded-md bg-brand/15 px-2 py-0.5 text-[10px] font-bold text-brand">
            STUDIO
          </span>
        </Link>

        <div className="hidden items-center gap-6 text-sm text-slate-300 lg:flex">
          {SECTION_LINKS.map((s) => {
            const isActive = isHome && active === s.id;
            return (
              <a
                key={s.id}
                href={`/#${s.id}`}
                className={
                  isActive
                    ? "relative font-semibold text-white"
                    : "relative text-slate-400 transition-colors hover:text-white"
                }
              >
                {s.label}
                {isActive ? (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute -bottom-1.5 left-0 h-0.5 w-full rounded-full bg-brand"
                  />
                ) : null}
              </a>
            );
          })}
          <span className="h-4 w-px bg-edge" />
          {PAGE_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={
                pathname.startsWith(l.href) && l.href !== "/"
                  ? "font-semibold text-white"
                  : "text-slate-400 transition-colors hover:text-white"
              }
            >
              {l.label}
            </Link>
          ))}
        </div>

        <Link href="/simulator" className="btn-primary">
          Launch App
        </Link>
      </nav>
    </motion.header>
  );
}
