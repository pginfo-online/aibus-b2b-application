import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "secondary" | "success" | "warning" | "danger" | "error" | "info" | "outline" | "default";
  size?: "sm" | "md" | "lg";
}

export function Badge({ className, variant = "secondary", size = "md", children, ...props }: BadgeProps) {
  const normalizedVariant = variant === "error" ? "danger" : variant === "default" ? "secondary" : variant;

  const variantStyles = {
    primary: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/60",
    secondary: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/60",
    warning: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/60",
    danger: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/60",
    info: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-900/60",
    outline: "border border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-300",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-0.5 text-xs",
    lg: "px-3 py-1 text-xs",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-semibold border tracking-wide uppercase",
        variantStyles[normalizedVariant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

/** Helper to render badge based on backend booking/agent status */
export function StatusBadge({ status }: { status: string }) {
  let variant: BadgeProps["variant"] = "secondary";
  const upper = status.toUpperCase();

  if (["CONFIRMED", "SUCCESS", "COMPLETED", "APPROVED", "ACTIVE"].includes(upper)) {
    variant = "success";
  } else if (["HELD", "PENDING", "HOLD_REQUESTED", "INITIATED", "KYC_SUBMITTED", "PENDING_KYC"].includes(upper)) {
    variant = "warning";
  } else if (["FAILED", "CANCELLED", "REJECTED", "SUSPENDED", "EXPIRED"].includes(upper)) {
    variant = "danger";
  } else if (["REFUND_PENDING", "REFUNDED", "PARTIALLY_REFUNDED", "RECONCILED"].includes(upper)) {
    variant = "info";
  }

  const cleanLabel = status.replace(/_/g, " ");

  return <Badge variant={variant}>{cleanLabel}</Badge>;
}
