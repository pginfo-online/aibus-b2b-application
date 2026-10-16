import { create } from "zustand";
import type { AgentOrganization, AgentStaffMember, AuthTokens, UserProfile } from "@/types/api";

interface AuthState {
  user: UserProfile | null;
  agent: AgentOrganization | null;
  staff: AgentStaffMember | null;
  tokens: AuthTokens | null;
  isInitialized: boolean;

  setAuth: (params: {
    user: UserProfile;
    tokens: AuthTokens;
    agent?: AgentOrganization | null;
    staff?: AgentStaffMember | null;
  }) => void;
  updateTokens: (tokens: AuthTokens) => void;
  updateAgent: (agent: Partial<AgentOrganization>) => void;
  updateUser: (user: Partial<UserProfile>) => void;
  clearAuth: () => void;
}

const STORAGE_KEY = "aibus_agent_session_v1";

function loadInitialState(): Pick<AuthState, "user" | "agent" | "staff" | "tokens"> {
  if (typeof window === "undefined") {
    return { user: null, agent: null, staff: null, tokens: null };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { user: null, agent: null, staff: null, tokens: null };
    const parsed = JSON.parse(raw);
    return {
      user: parsed.user || null,
      agent: parsed.agent || null,
      staff: parsed.staff || null,
      tokens: parsed.tokens || null,
    };
  } catch {
    return { user: null, agent: null, staff: null, tokens: null };
  }
}

function persistState(state: Pick<AuthState, "user" | "agent" | "staff" | "tokens">) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn("Failed to persist auth state in localStorage", err);
  }
}

export const useAuthStore = create<AuthState>((set, get) => {
  const initial = loadInitialState();

  return {
    ...initial,
    isInitialized: true,

    setAuth: ({ user, tokens, agent = null, staff = null }) => {
      const next = { user, tokens, agent, staff };
      persistState(next);
      set(next);
    },

    updateTokens: (tokens) => {
      const { user, agent, staff } = get();
      const next = { user, agent, staff, tokens };
      persistState(next);
      set({ tokens });
    },

    updateAgent: (partial) => {
      const current = get().agent;
      if (!current) return;
      const updated = { ...current, ...partial };
      const next = { ...get(), agent: updated };
      persistState(next);
      set({ agent: updated });
    },

    updateUser: (partial) => {
      const current = get().user;
      if (!current) return;
      const updated = { ...current, ...partial };
      const next = { ...get(), user: updated };
      persistState(next);
      set({ user: updated });
    },

    clearAuth: () => {
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {}
      }
      set({ user: null, agent: null, staff: null, tokens: null });
    },
  };
});
