import { create } from "zustand";

interface UiState {
  theme: "light" | "dark" | "system";
  sidebarCollapsed: boolean;
  mobileMenuOpen: boolean;
  notificationsOpen: boolean;
  language: "en" | "hi" | "mr";

  setTheme: (theme: "light" | "dark" | "system") => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
  setNotificationsOpen: (open: boolean) => void;
  setLanguage: (lang: "en" | "hi" | "mr") => void;
}

function applyThemeToDocument(theme: "light" | "dark" | "system") {
  if (typeof window === "undefined") return;
  const root = document.documentElement;
  try {
    localStorage.setItem("aibus_theme", theme);
  } catch {}

  const isDark =
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  if (isDark) {
    root.classList.add("dark");
    root.setAttribute("data-theme", "dark");
    root.style.colorScheme = "dark";
  } else {
    root.classList.remove("dark");
    root.setAttribute("data-theme", "light");
    root.style.colorScheme = "light";
  }
}

export const useUiStore = create<UiState>((set) => ({
  theme: "light",
  sidebarCollapsed: false,
  mobileMenuOpen: false,
  notificationsOpen: false,
  language: "en",

  setTheme: (theme) => {
    applyThemeToDocument(theme);
    set({ theme });
  },

  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
  setMobileMenuOpen: (mobileMenuOpen) => set({ mobileMenuOpen }),
  setNotificationsOpen: (notificationsOpen) => set({ notificationsOpen }),
  setLanguage: (language) => set({ language }),
}));
