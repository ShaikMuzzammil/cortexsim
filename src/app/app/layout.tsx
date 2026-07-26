"use client";
import AuthProvider from "@/components/app/AuthProvider";
import AppShell from "@/components/app/AppShell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    // requireAuth is now false - no login required, direct entry as guest
    <AuthProvider requireAuth={false}>
      <AppShell>{children}</AppShell>
    </AuthProvider>
  );
}
