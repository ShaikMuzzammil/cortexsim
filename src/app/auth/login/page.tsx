"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { api, ApiError } from "@/lib/client/api";

const panelInit = { opacity: 0, y: 12 };
const panelShow = { opacity: 1, y: 0 };

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      router.push("/app");
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Login failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070e] text-slate-100 flex items-center justify-center px-4">
      <motion.div initial={panelInit} animate={panelShow} className="w-full max-w-[420px]">
        <Link href="/" className="flex items-center gap-2 text-sm text-slate-300 mb-6">
          <span className="inline-block w-2 h-2 rounded-full bg-[#6ea8ff]"/>
          <span className="font-semibold tracking-tight">CortexSim</span>
        </Link>
        <div className="rounded-2xl bg-[#0b1226] border border-[#1d2742] p-6 shadow-2xl">
          <h1 className="text-xl font-semibold text-white mb-1">Welcome back</h1>
          <p className="text-sm text-slate-400 mb-5">Sign in to your workspace.</p>
          <form onSubmit={onSubmit} className="space-y-3">
            <label className="block">
              <span className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-md bg-[#05070e] border border-[#1d2742] text-sm text-white outline-none focus:border-[#6ea8ff]"
              />
            </label>
            <label className="block">
              <span className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Password</span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-md bg-[#05070e] border border-[#1d2742] text-sm text-white outline-none focus:border-[#6ea8ff]"
              />
            </label>
            {error ? <div className="text-xs text-[#ff5d73]">{error}</div> : null}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-1 py-2 rounded-md bg-[#6ea8ff] text-[#05070e] text-sm font-semibold hover:bg-white disabled:opacity-60"
            >
              {loading ? "Signing in\u2026" : "Sign in"}
            </button>
          </form>
          <div className="text-xs text-slate-400 mt-4 text-center">
            New to CortexSim?{" "}
            <Link href="/auth/signup" className="text-[#6ea8ff] hover:text-white">Create an account</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
