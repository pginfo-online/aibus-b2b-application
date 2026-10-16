"use client";

import React, { useEffect, useSyncExternalStore } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";
import { ToastContainer } from "@/components/ui/toast";
import { useAuthStore } from "@/store/auth-store";
import { useUiStore } from "@/store/ui-store";
import { api } from "@/lib/api-client";
import type { AgentOrganization } from "@/types/api";

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export function AppProviders({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  const { tokens, user, updateAgent } = useAuthStore();
  const { setTheme } = useUiStore();
  const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    const savedTheme = (localStorage.getItem("aibus_theme") as "light" | "dark" | "system") || "light";
    setTheme(savedTheme);
  }, [setTheme]);

  // Sync profile when authenticated
  useEffect(() => {
    if (tokens?.accessToken && user) {
      api
        .get<AgentOrganization>("/agents/profile")
        .then((agent) => {
          if (agent && agent.id) {
            updateAgent(agent);
          }
        })
        .catch(() => {
          // Token may be invalid or guest
        });
    }
  }, [tokens?.accessToken, user, updateAgent]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {mounted && <ToastContainer />}
    </QueryClientProvider>
  );
}
