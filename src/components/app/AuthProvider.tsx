"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  isGuest?: boolean;
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

// Guest user for no-login mode
const GUEST_USER: AppUser = {
  id: "guest-user",
  email: "guest@cortexsim.local",
  name: "Guest User",
  role: "user",
  createdAt: new Date().toISOString(),
  isGuest: true,
};

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

  // Auto-login as guest - NO LOGIN REQUIRED
  const refresh = async () => {
    try {
      // Try real auth first (for backward compatibility)
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          setLoading(false);
          return;
        }
      }
    } catch {
      // Ignore errors - fall through to guest mode
    }
    
    // Default to guest mode - DIRECT ENTRY WITHOUT LOGIN
    setUser(GUEST_USER);
    setLoading(false);
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch {}
    // Re-login as guest instead of redirecting
    setUser(GUEST_USER);
  };

  useEffect(() => {
    // Initialize with guest user immediately for instant access
    const initGuest = () => {
      setUser(GUEST_USER);
      setLoading(false);
    };
    
    // Try auth in background, but show guest immediately
    initGuest();
    refresh(); // Will upgrade to real user if session exists
  }, []);

  // No longer redirects to login - always allows access
  const ctxValue: AuthContextValue = { user, loading, refresh, logout };
  return <Ctx.Provider value={ctxValue}>{children}</Ctx.Provider>;
}
