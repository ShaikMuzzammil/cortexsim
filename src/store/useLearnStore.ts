"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

// A stored notification (the persisted "notifications store" the platform keeps
// for the learner). Toasts are the ephemeral popups; these are the history.
export interface StoredNotification {
  id: string;
  title: string;
  body: string;
  kind: "success" | "info" | "reward";
  ts: number;
  read: boolean;
}

interface LearnState {
  completed: Record<string, boolean>;
  notes: Record<string, string>;
  checklist: Record<string, Record<number, boolean>>;
  bookmarks: Record<string, boolean>;
  xp: number;
  lastVisited: string | null;
  notifications: StoredNotification[];

  toggleComplete: (slug: string, xp: number) => boolean;
  isComplete: (slug: string) => boolean;
  setNote: (slug: string, note: string) => void;
  getNote: (slug: string) => string;
  toggleCheck: (slug: string, index: number) => void;
  isChecked: (slug: string, index: number) => boolean;
  checklistProgress: (slug: string, total: number) => number;
  toggleBookmark: (slug: string) => void;
  isBookmarked: (slug: string) => boolean;
  setLastVisited: (slug: string) => void;
  pushNotification: (n: Omit<StoredNotification, "id" | "ts" | "read">) => void;
  markAllRead: () => void;
  clearNotifications: () => void;
  unreadCount: () => number;
  completedCount: () => number;
  resetProgress: () => void;
}

function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export const useLearnStore = create<LearnState>()(
  persist(
    (set, get) => ({
      completed: {},
      notes: {},
      checklist: {},
      bookmarks: {},
      xp: 0,
      lastVisited: null,
      notifications: [],

      toggleComplete: (slug, xp) => {
        const wasComplete = !!get().completed[slug];
        const nowComplete = !wasComplete;
        set((s) => ({
          completed: { ...s.completed, [slug]: nowComplete },
          xp: Math.max(0, s.xp + (nowComplete ? xp : -xp)),
        }));
        return nowComplete;
      },
      isComplete: (slug) => !!get().completed[slug],

      setNote: (slug, note) =>
        set((s) => ({ notes: { ...s.notes, [slug]: note } })),
      getNote: (slug) => get().notes[slug] ?? "",

      toggleCheck: (slug, index) =>
        set((s) => {
          const cur = s.checklist[slug] ?? {};
          return {
            checklist: {
              ...s.checklist,
              [slug]: { ...cur, [index]: !cur[index] },
            },
          };
        }),
      isChecked: (slug, index) => !!get().checklist[slug]?.[index],
      checklistProgress: (slug, total) => {
        if (total <= 0) return 0;
        const cur = get().checklist[slug] ?? {};
        const done = Object.values(cur).filter(Boolean).length;
        return Math.min(1, done / total);
      },

      toggleBookmark: (slug) =>
        set((s) => ({
          bookmarks: { ...s.bookmarks, [slug]: !s.bookmarks[slug] },
        })),
      isBookmarked: (slug) => !!get().bookmarks[slug],

      setLastVisited: (slug) => set({ lastVisited: slug }),

      pushNotification: (n) =>
        set((s) => ({
          notifications: [
            { ...n, id: uid(), ts: Date.now(), read: false },
            ...s.notifications,
          ].slice(0, 50),
        })),
      markAllRead: () =>
        set((s) => ({
          notifications: s.notifications.map((n) => ({ ...n, read: true })),
        })),
      clearNotifications: () => set({ notifications: [] }),
      unreadCount: () => get().notifications.filter((n) => !n.read).length,

      completedCount: () =>
        Object.values(get().completed).filter(Boolean).length,

      resetProgress: () =>
        set({
          completed: {},
          notes: {},
          checklist: {},
          bookmarks: {},
          xp: 0,
          notifications: [],
        }),
    }),
    { name: "cortexsim:learn" },
  ),
);
