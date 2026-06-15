"use client";
import { useState } from "react";

interface Endpoint {
  method: string;
  path: string;
  summary: string;
  auth: "required" | "public";
  request?: string;
  response?: string;
}

const GROUPS: Array<{ name: string; endpoints: Endpoint[] }> = [
  {
    name: "Authentication",
    endpoints: [
      { method: "POST", path: "/api/auth/signup", summary: "Create account and set session cookie", auth: "public", request: `{"email":"a@b.com","name":"Ada","password":"secret123"}` },
      { method: "POST", path: "/api/auth/login", summary: "Sign in with email + password", auth: "public", request: `{"email":"a@b.com","password":"secret123"}` },
      { method: "POST", path: "/api/auth/logout", summary: "Clear the session cookie", auth: "required" },
      { method: "GET", path: "/api/auth/me", summary: "Current user", auth: "required" },
    ],
  },
  {
    name: "Projects",
    endpoints: [
      { method: "GET", path: "/api/projects", summary: "List projects", auth: "required" },
      { method: "POST", path: "/api/projects", summary: "Create project", auth: "required", request: `{"name":"Cortex study","description":"","tags":["snn"]}` },
      { method: "GET", path: "/api/projects/:id", summary: "Get one project", auth: "required" },
      { method: "PUT", path: "/api/projects/:id", summary: "Update project (partial)", auth: "required" },
      { method: "DELETE", path: "/api/projects/:id", summary: "Delete project and cascade runs/notes/comments", auth: "required" },
    ],
  },
  {
    name: "Runs, notes, comments",
    endpoints: [
      { method: "GET", path: "/api/projects/:id/runs", summary: "List runs for a project", auth: "required" },
      { method: "POST", path: "/api/projects/:id/runs", summary: "Record a run snapshot", auth: "required" },
      { method: "GET", path: "/api/runs/:id", summary: "Get one run", auth: "required" },
      { method: "DELETE", path: "/api/runs/:id", summary: "Delete a run", auth: "required" },
      { method: "GET", path: "/api/runs/compare?ids=a,b", summary: "Diff config for 2-4 runs", auth: "required" },
      { method: "GET", path: "/api/projects/:id/notes", summary: "List notes", auth: "required" },
      { method: "POST", path: "/api/projects/:id/notes", summary: "Create note (markdown body)", auth: "required" },
      { method: "PUT", path: "/api/notes/:id", summary: "Update a note (partial)", auth: "required" },
      { method: "DELETE", path: "/api/notes/:id", summary: "Delete a note", auth: "required" },
      { method: "GET", path: "/api/projects/:id/comments", summary: "List comments", auth: "required" },
      { method: "POST", path: "/api/projects/:id/comments", summary: "Post a comment", auth: "required" },
    ],
  },
  {
    name: "Datasets",
    endpoints: [
      { method: "GET", path: "/api/datasets", summary: "List datasets", auth: "required" },
      { method: "POST", path: "/api/datasets", summary: "Upload a dataset (csv/json/text)", auth: "required" },
      { method: "GET", path: "/api/datasets/:id", summary: "Fetch a dataset (full data)", auth: "required" },
      { method: "DELETE", path: "/api/datasets/:id", summary: "Delete a dataset", auth: "required" },
    ],
  },
  {
    name: "Sharing & integrations",
    endpoints: [
      { method: "GET", path: "/api/share", summary: "List share links", auth: "required" },
      { method: "POST", path: "/api/share", summary: "Create a read-only share link", auth: "required", request: `{"projectId":"proj_xxx"}` },
      { method: "DELETE", path: "/api/share?id=...", summary: "Revoke a share link", auth: "required" },
      { method: "GET", path: "/api/share/:token", summary: "Public read-only project view", auth: "public" },
      { method: "GET", path: "/api/webhooks", summary: "List webhooks (secret is masked)", auth: "required" },
      { method: "POST", path: "/api/webhooks", summary: "Register a webhook (returns full secret once)", auth: "required", request: `{"name":"Slack","url":"https://...","events":["run.create"]}` },
      { method: "POST", path: "/api/webhooks/:id/test", summary: "Fire a test delivery", auth: "required" },
      { method: "DELETE", path: "/api/webhooks?id=...", summary: "Delete a webhook", auth: "required" },
    ],
  },
  {
    name: "Account & workspace",
    endpoints: [
      { method: "GET", path: "/api/tokens", summary: "List API tokens (fingerprint only)", auth: "required" },
      { method: "POST", path: "/api/tokens", summary: "Generate API token (full secret returned once)", auth: "required" },
      { method: "DELETE", path: "/api/tokens?id=...", summary: "Revoke an API token", auth: "required" },
      { method: "GET", path: "/api/audit?limit=100", summary: "Recent audit events", auth: "required" },
      { method: "GET", path: "/api/search?q=", summary: "Workspace-wide search", auth: "required" },
      { method: "GET", path: "/api/stats", summary: "Dashboard stats + 14-day series", auth: "required" },
      { method: "GET", path: "/api/insights", summary: "Deep workspace analytics", auth: "required" },
      { method: "GET", path: "/api/events", summary: "SSE stream of audit + comments", auth: "required" },
      { method: "GET", path: "/api/account/export", summary: "Full JSON export of the account", auth: "required" },
      { method: "GET", path: "/api/changelog", summary: "Public changelog feed", auth: "public" },
    ],
  },
];

const METHOD_COLORS: Record<string, string> = { GET: "#36d399", POST: "#6ea8ff", PUT: "#fbbd23", DELETE: "#ff5d73" };

export default function ApiDocsPage() {
  const [filter, setFilter] = useState("");

  return (
    <div className="space-y-5">
      <div>
        <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Developers</div>
        <h1 className="text-2xl font-semibold text-white mt-1">Public API</h1>
        <p className="text-sm text-slate-400">Authenticate with an API token from Settings and send <code className="text-[#6ea8ff]">Authorization: Bearer cx_\u2026</code> with each request, or rely on the session cookie set on login.</p>
      </div>

      <div className="rounded-xl bg-[#0b1226] border border-[#1d2742] p-4">
        <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500 mb-2">Quick example</div>
        <pre className="text-[12px] text-slate-200 bg-[#05070e] border border-[#1d2742] rounded-md p-3 overflow-x-auto">{`curl -X POST https://your-cortexsim.app/api/projects \\
  -H "Authorization: Bearer $CORTEXSIM_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"name":"My study","description":"","tags":["snn"]}'`}</pre>
      </div>

      <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter endpoints\u2026" className="w-full px-3 py-2 rounded-md bg-[#0b1226] border border-[#1d2742] text-sm text-white outline-none focus:border-[#6ea8ff]"/>

      {GROUPS.map((g) => {
        const filtered = g.endpoints.filter((e) => !filter || (e.path + " " + e.summary).toLowerCase().includes(filter.toLowerCase()));
        if (filtered.length === 0) return null;
        return (
          <section key={g.name} className="space-y-2">
            <h2 className="text-sm font-semibold text-white">{g.name}</h2>
            <div className="divide-y divide-[#1d2742] rounded-xl bg-[#0b1226] border border-[#1d2742] overflow-hidden">
              {filtered.map((e, i) => {
                const c: React.CSSProperties = { color: METHOD_COLORS[e.method] || "#6ea8ff" };
                return (
                  <div key={g.name + "-" + i} className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[11px] font-bold w-[58px]" style={c}>{e.method}</span>
                      <span className="font-mono text-[12px] text-white truncate">{e.path}</span>
                      <span className="ml-auto text-[10px] uppercase tracking-wide text-slate-500">{e.auth}</span>
                    </div>
                    <div className="text-[12px] text-slate-400 mt-1 ml-[70px]">{e.summary}</div>
                    {e.request ? <pre className="mt-2 ml-[70px] text-[11px] text-slate-200 bg-[#05070e] border border-[#1d2742] rounded-md p-2 overflow-x-auto">{e.request}</pre> : null}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
