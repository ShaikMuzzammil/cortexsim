// Session persistence for the Studio: save/load named sim configurations to
// localStorage so a real workflow survives reloads.

import type { SimConfig } from "@/types";

export interface StudioSession {
  id: string;
  name: string;
  createdAt: string;
  activeSlug: string;
  config: SimConfig;
}

const KEY = "cortexsim:studio:sessions";

export function loadAllSessions(): StudioSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as StudioSession[];
  } catch {
    return [];
  }
}

export function saveSession(name: string, activeSlug: string, config: SimConfig): StudioSession {
  const session: StudioSession = {
    id: "s_" + Math.random().toString(36).slice(2, 9),
    name,
    createdAt: new Date().toISOString(),
    activeSlug,
    config: { ...config },
  };
  const all = loadAllSessions();
  all.unshift(session);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KEY, JSON.stringify(all.slice(0, 30)));
  }
  return session;
}

export function deleteSession(id: string): void {
  const all = loadAllSessions().filter((s) => s.id !== id);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KEY, JSON.stringify(all));
  }
}

export function downloadJson(filename: string, data: unknown): void {
  if (typeof window === "undefined") return;
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadCanvasPng(canvas: HTMLCanvasElement, filename: string): void {
  if (typeof window === "undefined") return;
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, "image/png");
}
