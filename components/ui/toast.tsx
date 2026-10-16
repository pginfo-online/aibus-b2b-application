"use client";

import React from "react";
import { useToastStore, ToastMessage } from "@/store/toast-store";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: ToastMessage; onDismiss: () => void }) {
  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />,
    info: <Info className="h-5 w-5 text-sky-500 shrink-0" />,
  };

  const bgStyles = {
    success: "border-emerald-200 bg-white dark:bg-slate-900 dark:border-emerald-900/50 shadow-emerald-500/10",
    error: "border-red-200 bg-white dark:bg-slate-900 dark:border-red-900/50 shadow-red-500/10",
    warning: "border-amber-200 bg-white dark:bg-slate-900 dark:border-amber-900/50 shadow-amber-500/10",
    info: "border-sky-200 bg-white dark:bg-slate-900 dark:border-sky-900/50 shadow-sky-500/10",
  };

  return (
    <div
      className={cn(
        "pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg transition-all animate-in slide-in-from-bottom-5 duration-200",
        bgStyles[toast.type]
      )}
    >
      {icons[toast.type]}
      <div className="flex-1 min-w-0">
        {toast.title && (
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {toast.title}
          </h4>
        )}
        <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
          {toast.message}
        </p>
      </div>
      <button
        onClick={onDismiss}
        aria-label="Dismiss toast"
        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
