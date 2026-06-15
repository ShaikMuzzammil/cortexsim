"use client";
import { useEffect, useState } from "react";
import { api, downloadBlob, timeAgo } from "@/lib/client/api";
import { useAuth } from "@/components/app/AuthProvider";

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

  const refresh = async () => {
    const r = await api<{ tokens: Token[] }>("/api/tokens");
    setTokens(r.tokens);
  };
  useEffect(() => {
    refresh();
  }, []);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = await api<{ token: Token }>("/api/tokens", { method: "POST", body: JSON.stringify({ name: newName || "Default" }) });
    setCreatedSecret(r.token.token);
    setNewName("");
    refresh();
  };

  const onRevoke = async (id: string) => {
    if (!confirm("Revoke this token?")) return;
    await api(`/api/tokens?id=${id}`, { method: "DELETE" });
    refresh();
  };

  const onExport = async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/account/export", { credentials: "include" });
      const text = await res.text();
      downloadBlob(`cortexsim-export-${Date.now()}.json`, text, "application/json");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Account</div>
        <h1 className="text-2xl font-semibold text-white mt-1">Settings</h1>
        <p className="text-sm text-slate-400">Profile, API tokens, and data export.</p>
      </div>

      <section className="rounded-xl bg-[#0b1226] border border-[#1d2742] p-4">
        <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500 mb-3">Profile</div>
        {user ? (
          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
            <div><span className="text-slate-500">Name:</span> <span className="text-white">{user.name}</span></div>
            <div><span className="text-slate-500">Email:</span> <span className="text-white">{user.email}</span></div>
            <div><span className="text-slate-500">Role:</span> <span className="text-white">{user.role}</span></div>
            <div><span className="text-slate-500">Member since:</span> <span className="text-white">{timeAgo(user.createdAt)}</span></div>
          </div>
        ) : null}
        <div className="mt-4 flex justify-end">
          <button onClick={logout} className="text-xs px-3 py-1.5 rounded-md border border-[#3a1d2a] text-[#ff5d73] hover:bg-[#1a0d12]">Sign out</button>
        </div>
      </section>

      <section className="rounded-xl bg-[#0b1226] border border-[#1d2742] p-4">
        <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500 mb-3">API tokens</div>
        <p className="text-xs text-slate-400 mb-3">Use tokens to call the workspace API programmatically with <code className="text-[#6ea8ff]">Authorization: Bearer &lt;token&gt;</code>. Treat them like passwords.</p>
        <form onSubmit={onCreate} className="flex gap-2 mb-3">
          <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Token name (e.g. notebook)" className="flex-1 px-3 py-1.5 rounded-md bg-[#05070e] border border-[#1d2742] text-sm text-white outline-none focus:border-[#6ea8ff]"/>
          <button type="submit" className="text-xs px-3 py-1.5 rounded-md bg-[#6ea8ff] text-[#05070e] font-semibold">Generate token</button>
        </form>
        {createdSecret ? (
          <div className="rounded-md border border-[#36d399] bg-[#0a1a13] p-3 mb-3">
            <div className="text-[11px] uppercase tracking-[0.18em] text-[#36d399] mb-1">Copy this token now</div>
            <code className="text-[12px] text-white break-all">{createdSecret}</code>
            <div className="text-[11px] text-slate-400 mt-2">It will not be shown again. We only store a fingerprint.</div>
            <button onClick={() => setCreatedSecret(null)} className="mt-2 text-[10px] text-slate-400 hover:text-white">Dismiss</button>
          </div>
        ) : null}
        {tokens.length === 0 ? (
          <div className="text-xs text-slate-500">No tokens yet.</div>
        ) : (
          <table className="w-full text-xs">
            <thead className="text-[10px] uppercase tracking-wide text-slate-500">
              <tr><th className="text-left p-2">Name</th><th className="text-left p-2">Fingerprint</th><th className="text-right p-2">Created</th><th/></tr>
            </thead>
            <tbody>
              {tokens.map((t) => (
                <tr key={t.id} className="border-t border-[#1d2742]">
                  <td className="p-2 text-white">{t.name}</td>
                  <td className="p-2 font-mono text-slate-400">{t.token}</td>
                  <td className="p-2 text-right text-slate-500">{timeAgo(t.createdAt)}</td>
                  <td className="p-2 text-right"><button onClick={() => onRevoke(t.id)} className="text-slate-500 hover:text-[#ff5d73]">Revoke</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="rounded-xl bg-[#0b1226] border border-[#1d2742] p-4">
        <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500 mb-3">Account export</div>
        <p className="text-xs text-slate-400 mb-3">Download a full JSON snapshot of every project, run, note, dataset, comment, and audit event in this account.</p>
        <button onClick={onExport} disabled={exporting} className="text-xs px-3 py-1.5 rounded-md bg-[#6ea8ff] text-[#05070e] font-semibold disabled:opacity-60">{exporting ? "Preparing\u2026" : "Download account export"}</button>
      </section>
    </div>
  );
}
