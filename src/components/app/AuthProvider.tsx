"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client/api";

export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const Ctx = createContext<AuthContextValue>({
  user: null,
  loading: true,
  refresh: async () => {},
  logout: async () => {},
});

export function useAuth(): AuthContextValue {
  return useContext(Ctx);
}

export default function AuthProvider({
  children,
  requireAuth = false,
}: {
  children: ReactNode;
  requireAuth?: boolean;
}) {
  const router = useRouter();
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const res = await api<{ user: AppUser | null }>("/api/auth/me");
      setUser(res.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api("/api/auth/logout", { method: "POST" });
    } catch {}
    setUser(null);
    router.push("/auth/login");
  };

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    if (!loading && requireAuth && !user) {
      router.replace("/auth/login");
    }
  }, [loading, user, requireAuth, router]);

  const ctxValue: AuthContextValue = { user, loading, refresh, logout };
  return <Ctx.Provider value={ctxValue}>{children}</Ctx.Provider>;
}
