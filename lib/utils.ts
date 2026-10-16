import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency with Indian Rupee symbol and two decimal places if needed.
 */
export function formatCurrency(amount: number | string | undefined | null, includeDecimals = true): string {
  if (amount === undefined || amount === null || amount === "") return "₹0";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "₹0";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0,
  }).format(num);
}

/**
 * Format date string (YYYY-MM-DD) into user-friendly format: "Fri, 20 Oct 2026"
 */
export function formatDate(dateString: string | undefined | null, formatType: "short" | "full" | "month" = "full"): string {
  if (!dateString) return "";
  try {
    const date = new Date(dateString.includes("T") ? dateString : `${dateString}T00:00:00`);
    if (isNaN(date.getTime())) return dateString;

    if (formatType === "short") {
      return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    }
    if (formatType === "month") {
      return date.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
    }

    return date.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

/**
 * Format full date and time string: "20 Oct 2026, 07:30 PM"
 */
export function formatDateTime(dateString: string | undefined | null): string {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    return date.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return dateString;
  }
}

/**
 * Convert 24-hr time string (e.g. "19:30" or "08:15:00") into 12-hr format: "07:30 PM"
 */
export function formatTime(timeString: string | undefined | null): string {
  if (!timeString) return "--:--";
  try {
    const parts = timeString.split(":");
    if (parts.length < 2) return timeString;
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1];
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    const formattedHours = hours < 10 ? `0${hours}` : `${hours}`;
    return `${formattedHours}:${minutes} ${ampm}`;
  } catch {
    return timeString;
  }
}

/**
 * Calculate journey duration string from departure & arrival times
 */
export function calculateDuration(depTime: string, arrTime: string): string {
  if (!depTime || !arrTime) return "--";
  try {
    const [depH, depM] = depTime.split(":").map(Number);
    const [arrH, arrM] = arrTime.split(":").map(Number);
    if (isNaN(depH) || isNaN(depM) || isNaN(arrH) || isNaN(arrM)) return "--";

    let diffMinutes = arrH * 60 + arrM - (depH * 60 + depM);
    if (diffMinutes < 0) {
      diffMinutes += 24 * 60; // Next day arrival
    }

    const h = Math.floor(diffMinutes / 60);
    const m = diffMinutes % 60;
    return `${h}h ${m > 0 ? `${m}m` : ""}`.trim();
  } catch {
    return "--";
  }
}

/**
 * Mask sensitive phone number: +91 98765 43210 -> +91 98*** **210
 */
export function maskPhone(phone: string | undefined | null): string {
  if (!phone || phone.length < 6) return phone || "";
  const visibleStart = phone.slice(0, 3);
  const visibleEnd = phone.slice(-3);
  return `${visibleStart}****${visibleEnd}`;
}
