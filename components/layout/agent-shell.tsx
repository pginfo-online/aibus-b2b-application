"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AgentHeader } from "./agent-header";
import { AgentSidebar } from "./agent-sidebar";
import { MobileNav } from "./mobile-nav";
import { NotificationsDrawer } from "./notifications-drawer";
import { useAuthStore } from "@/store/auth-store";

export function AgentShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { tokens, isInitialized } = useAuthStore();

  useEffect(() => {
    // If client has finished hydrating and there is no access token, redirect to sign-in
    if (isInitialized && !tokens?.accessToken) {
      router.push("/sign-in");
    }
  }, [isInitialized, tokens?.accessToken, router]);

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Top Header */}
      <AgentHeader />

      {/* Main Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar (Desktop/Tablet) */}
        <AgentSidebar />

        {/* Content Region */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-20 md:pb-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>

      {/* Notifications Drawer */}
      <NotificationsDrawer />

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
}
