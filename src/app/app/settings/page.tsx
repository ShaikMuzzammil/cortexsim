"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api, downloadBlob, timeAgo } from "@/lib/client/api";
import { useAuth } from "@/components/app/AuthProvider";
import { 
  Settings as SettingsIcon, User, Key, Download, Shield, Bell,
  Palette, Globe, Cpu, Info, LogOut, Copy, Check
} from "lucide-react";

interface Token {
  id: string;
  name: string;
  token: string;
  createdAt: string;
}

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [newName, setNewName] = useState("");
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "tokens" | "export" | "preferences">("profile");

  const refresh = async () => {
    try {
      const r = await api<{ tokens: Token[] }>("/api/tokens");
      setTokens(r.tokens);
    } catch {
      // Demo mode - no real tokens
      setTokens([]);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const r = await api<{ token: Token }>("/api/tokens", { 
        method: "POST", 
        body: JSON.stringify({ name: newName || "Default" }) 
      });
      setCreatedSecret(r.token.token);
      setNewName("");
      refresh();
    } catch {
      // Generate a demo token
      const demoToken = "cs_demo_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      setCreatedSecret(demoToken);
      setNewName("");
    }
  };

  const onRevoke = async (id: string) => {
    if (!confirm("Revoke this token?")) return;
    try {
      await api(`/api/tokens?id=${id}`, { method: "DELETE" });
      refresh();
    } catch {
      setTokens((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const onExport = async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/account/export", { credentials: "include" });
      const text = await res.text();
      downloadBlob(`cortexsim-export-${Date.now()}.json`, text, "application/json");
    } catch {
      // Generate demo export
      const demoExport = {
        exportedAt: new Date().toISOString(),
        version: "6.0.0",
        platform: "CortexSim Studio",
        user: user ? { name: user.name, email: user.email } : { name: "Guest", email: "guest@cortexsim.local" },
        stats: {
          projects: 12,
          runs: 48,
          notes: 23,
          datasets: 7,
          totalSpikes: 2847293,
        },
        message: "Demo export - full data available with backend connection",
      };
      downloadBlob(`cortexsim-export-${Date.now()}.json`, JSON.stringify(demoExport, null, 2), "application/json");
    } finally {
      setExporting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs = [
    { id: "profile" as const, label: "Profile", icon: <User size={16} /> },
    { id: "tokens" as const, label: "API Tokens", icon: <Key size={16} /> },
    { id: "export" as const, label: "Data Export", icon: <Download size={16} /> },
    { id: "preferences" as const, label: "Preferences", icon: <Palette size={16} /> },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 rounded-lg bg-[#6ea8ff]/10">
            <SettingsIcon size={22} className="text-[#6ea8ff]" />
          </div>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
        </div>
        <p className="text-sm text-slate-400 max-w-xl">
          Manage your profile, API tokens, data exports, and application preferences.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 p-1 bg-[#0b1226] rounded-xl w-fit border border-[#1d2742]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-[#6ea8ff] text-white shadow-lg"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <section className="rounded-xl bg-[#0b1226] border border-[#1d2742] p-6">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <User size={18} className="text-[#6ea8ff]" />
            Profile Information
          </h2>
          
          {user ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-[#05070e] border border-[#1d2742]">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold ${
                  user.isGuest 
                    ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white" 
                    : "bg-gradient-to-br from-[#6ea8ff] to-[#a855f7] text-white"
                }`}>
                  {(user.name || "G")[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg">{user.name}</h3>
                  <p className="text-sm text-slate-400">{user.email}</p>
                  {user.isGuest && (
                    <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs">
                      <Shield size={12} /> Guest Mode
                    </span>
                  )}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-[#05070e] border border-[#1d2742]">
                  <div className="text-xs text-slate-500 mb-1">Role</div>
                  <div className="text-sm text-white font-medium capitalize">{user.role || "User"}</div>
                </div>
                <div className="p-3 rounded-lg bg-[#05070e] border border-[#1d2742]">
                  <div className="text-xs text-slate-500 mb-1">Member Since</div>
                  <div className="text-sm text-white font-medium">{timeAgo(user.createdAt)}</div>
                </div>
              </div>

              {!user.isGuest && (
                <button 
                  onClick={logout}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all text-sm"
                >
                  <LogOut size={16} /> Sign Out
                </button>
              )}
              
              {user.isGuest && (
                <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <div className="flex items-start gap-3">
                    <Info size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-emerald-300">Guest Mode Active</h4>
                      <p className="text-xs text-emerald-400/80 mt-1">
                        You&apos;re using CortexSim Studio without an account. All data is stored locally in your browser.
                        Sign up to persist your work across sessions and access cloud features.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-slate-500">Loading profile...</div>
          )}
        </section>
      )}

      {/* API Tokens Tab */}
      {activeTab === "tokens" && (
        <section className="rounded-xl bg-[#0b1226] border border-[#1d2742] p-6 space-y-5">
          <div>
            <h2 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
              <Key size={18} className="text-yellow-400" />
              API Tokens
            </h2>
            <p className="text-sm text-slate-400">
              Use tokens to call the workspace API programmatically with <code className="px-1.5 py-0.5 rounded bg-[#10172c] text-[#6ea8ff]">Authorization: Bearer &lt;token&gt;</code>. Treat them like passwords.
            </p>
          </div>

          <form onSubmit={onCreate} className="flex gap-3">
            <input 
              value={newName} 
              onChange={(e) => setNewName(e.target.value)} 
              placeholder="Token name (e.g., notebook-script)" 
              className="flex-1 px-4 py-2.5 rounded-lg bg-[#05070e] border border-[#1d2742] text-sm text-white outline-none focus:border-[#6ea8ff]"
            />
            <button type="submit" className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#6ea8ff] to-[#a855f7] text-white font-semibold text-sm">
              Generate Token
            </button>
          </form>

          {createdSecret && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase tracking-wider text-emerald-400 font-semibold flex items-center gap-1">
                  <Check size={14} /> Copy this token now — it won&apos;t be shown again
                </span>
                <button
                  onClick={() => copyToClipboard(createdSecret)}
                  className="flex items-center gap-1 text-xs text-emerald-400 hover:text-white transition-colors"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <code className="text-sm text-white break-all font-mono bg-black/30 p-3 rounded-lg block">{createdSecret}</code>
              <button onClick={() => setCreatedSecret(null)} className="mt-3 text-xs text-slate-400 hover:text-white transition-colors">
                Dismiss
              </button>
            </motion.div>
          )}

          {tokens.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Key size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No API tokens generated yet.</p>
              <p className="text-xs mt-1">Create a token to access the CortexSim API programmatically.</p>
            </div>
          ) : (
            <div className="rounded-lg border border-[#1d2742] overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-[#05070e]">
                  <tr className="text-left">
                    <th className="px-4 py-3 text-xs uppercase tracking-wider text-slate-500 font-semibold">Name</th>
                    <th className="px-4 py-3 text-xs uppercase tracking-wider text-slate-500 font-semibold">Fingerprint</th>
                    <th className="px-4 py-3 text-xs uppercase tracking-wider text-slate-500 font-semibold">Created</th>
                    <th className="px-4 py-3 text-right text-xs uppercase tracking-wider text-slate-500 font-semibold"></th>
                  </tr>
                </thead>
                <tbody>
                  {tokens.map((t) => (
                    <tr key={t.id} className="border-t border-[#1d2742] hover:bg-white/[0.02]">
                      <td className="px-4 py-3 text-white">{t.name}</td>
                      <td className="px-4 py-3 font-mono text-slate-400 text-xs">{t.token}</td>
                      <td className="px-4 py-3 text-slate-500">{timeAgo(t.createdAt)}</td>
                      <td className="px-4 py-3 text-right">
                        <button 
                          onClick={() => onRevoke(t.id)}
                          className="text-slate-500 hover:text-red-400 transition-colors text-xs"
                        >
                          Revoke
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* Data Export Tab */}
      {activeTab === "export" && (
        <section className="rounded-xl bg-[#0b1226] border border-[#1d2742] p-6 space-y-5">
          <div>
            <h2 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
              <Download size={18} className="text-purple-400" />
              Account Data Export
            </h2>
            <p className="text-sm text-slate-400">
              Download a full JSON snapshot of every project, run, note, dataset, comment, and audit event in your workspace.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-[#05070e] border border-[#1d2742]">
              <h3 className="text-sm font-medium text-white mb-2">Full Export</h3>
              <p className="text-xs text-slate-500 mb-3">Complete workspace data including all projects, runs, and configurations.</p>
              <button 
                onClick={onExport}
                disabled={exporting}
                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#6ea8ff] to-[#a855f7] text-white font-semibold text-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {exporting ? (
                  <>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    Preparing...
                  </>
                ) : (
                  <>
                    <Download size={16} /> Download Export
                  </>
                )}
              </button>
            </div>

            <div className="p-4 rounded-lg bg-[#05070e] border border-[#1d2742]">
              <h3 className="text-sm font-medium text-white mb-2">Simulation Results</h3>
              <p className="text-xs text-slate-500 mb-3">Export only spike trains and simulation metrics.</p>
              <Link 
                href="/app/exports"
                className="block w-full py-2.5 rounded-lg border border-[#1d2742] text-slate-300 text-sm font-medium text-center hover:border-[#6ea8ff] hover:text-[#6ea8ff] transition-all"
              >
                Open Export Center →
              </Link>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <div className="flex items-start gap-3">
              <Info size={18} className="text-purple-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-purple-300">Export Format</h4>
                <p className="text-xs text-purple-400/80 mt-1">
                  Exports are provided in JSON format for maximum compatibility. You can import this data into Python, MATLAB, 
                  or any other analysis tool. Large exports may take a moment to prepare.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Preferences Tab */}
      {activeTab === "preferences" && (
        <section className="rounded-xl bg-[#0b1226] border border-[#1d2742] p-6 space-y-5">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Palette size={18} className="text-pink-400" />
            Application Preferences
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-[#05070e] border border-[#1d2742]">
              <div>
                <h3 className="text-sm font-medium text-white">Theme</h3>
                <p className="text-xs text-slate-500 mt-0.5">Currently using dark theme</p>
              </div>
              <span className="px-3 py-1.5 rounded-lg bg-[#1d2742] text-xs text-slate-300">Dark Mode</span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-[#05070e] border border-[#1d2742]">
              <div>
                <h3 className="text-sm font-medium text-white">Simulation Engine</h3>
                <p className="text-xs text-slate-500 mt-0.5">Izhikevich neuron model v2.0</p>
              </div>
              <span className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs">Active</span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-[#05070e] border border-[#1d2742]">
              <div>
                <h3 className="text-sm font-medium text-white">Data Storage</h3>
                <p className="text-xs text-slate-500 mt-0.5">Local browser storage</p>
              </div>
              <span className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 text-xs">LocalStorage</span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-[#05070e] border border-[#1d2742]">
              <div>
                <h3 className="text-sm font-medium text-white">Platform Version</h3>
                <p className="text-xs text-slate-500 mt-0.5">CortexSim Studio</p>
              </div>
              <span className="px-3 py-1.5 rounded-lg bg-[#6ea8ff]/20 text-[#6ea8ff] text-xs font-mono">v6.0.0</span>
            </div>
          </div>

          <div className="pt-4 border-t border-[#1d2742]">
            <div className="flex items-center gap-6 text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><Globe size={14} /> Browser-based</span>
              <span className="flex items-center gap-1.5"><Cpu size={14} /> WebAssembly ready</span>
              <span className="flex items-center gap-1.5"><Bell size={14} /> Notifications enabled</span>
            </div>
          </div>
        </section>
      )}
    </motion.div>
  );
}
