import { create } from "zustand";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastState {
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, "id">) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],

  addToast: ({ type, title, message, duration = 5000 }) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

    // Prevent duplicate toast spam if exact message is currently visible
    const existing = get().toasts.find((t) => t.message === message && t.type === type);
    if (existing) {
      return existing.id;
    }

    set((state) => ({
      toasts: [...state.toasts, { id, type, title, message, duration }],
    }));

    if (duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, duration);
    }

    return id;
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  clearToasts: () => set({ toasts: [] }),
}));

export const toast = {
  success: (message: string, title = "Success") =>
    useToastStore.getState().addToast({ type: "success", title, message }),
  error: (message: string, title = "Error") =>
    useToastStore.getState().addToast({ type: "error", title, message, duration: 7000 }),
  warning: (message: string, title = "Notice") =>
    useToastStore.getState().addToast({ type: "warning", title, message }),
  info: (message: string, title = "Information") =>
    useToastStore.getState().addToast({ type: "info", title, message }),
};
