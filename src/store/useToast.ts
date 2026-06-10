"use client";

import { create } from "zustand";

// Ephemeral popup toasts (not persisted). The durable history lives in
// useLearnStore.notifications. Most actions push to both.
export interface Toast {
  id: string;
  title: string;
  body?: string;
  kind: "success" | "info" | "reward" | "error";
}

interface ToastState {
  toasts: Toast[];
  show: (t: Omit<Toast, "id">) => void;
  dismiss: (id: string) => void;
}

function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export const useToast = create<ToastState>((set) => ({
  toasts: [],
  show: (t) => {
    const id = uid();
    set((s) => ({ toasts: [...s.toasts, { ...t, id }] }));
    if (typeof window !== "undefined") {
      window.setTimeout(() => {
        set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) }));
      }, 3600);
    }
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}));
