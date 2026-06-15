"use client";
import AuthProvider from "@/components/app/AuthProvider";
import AppShell from "@/components/app/AppShell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider requireAuth>
      <AppShell>{children}</AppShell>
    </AuthProvider>
  );
}
