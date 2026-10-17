"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  variant?: "light" | "dark" | "auto";
  href?: string;
}

export function BrandLogo({ className, variant = "auto", href = "/" }: BrandLogoProps) {
  const isLightText = variant === "light";

  const content = (
    <div className={cn("inline-flex items-center gap-3 select-none group", className)}>
      {/* Brand Icon: Two tilted parallel geometric bars matching reference design */}
      <div className="relative flex h-9 w-9 shrink-0 items-center justify-center">
        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-9 w-9 transform transition-transform duration-300 group-hover:scale-105"
        >
          {/* Back bar (Dark / Grey / White) */}
          <rect
            x="4"
            y="9"
            width="10"
            height="22"
            rx="5"
            transform="rotate(-25 4 9)"
            className={
              isLightText
                ? "fill-white/80"
                : "fill-slate-800 dark:fill-white/80 transition-colors"
            }
          />
          {/* Front bar (Vibrant Coral Red) */}
          <rect
            x="16"
            y="5"
            width="10"
            height="24"
            rx="5"
            transform="rotate(-25 16 5)"
            fill="#E24B4B"
          />
        </svg>
      </div>

      {/* Wordmark & Tagline */}
      <div className="flex flex-col">
        <div className="flex items-baseline leading-none">
          <span
            className={cn(
              "text-2xl font-black tracking-tight",
              isLightText
                ? "text-white"
                : "text-slate-900 dark:text-white transition-colors"
            )}
          >
            Ai<span className="text-[#E24B4B]">Bus</span>
          </span>
          <span
            className={cn(
              "ml-1.5 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded",
              isLightText
                ? "bg-white/15 text-white/90"
                : "bg-red-50 text-[#E24B4B] border border-red-200/60 dark:bg-red-950/60 dark:border-red-900/40 dark:text-red-300"
            )}
          >
            B2B
          </span>
        </div>
        <span
          className={cn(
            "text-[10px] font-semibold tracking-wide mt-0.5 flex items-center gap-1",
            isLightText
              ? "text-white/70"
              : "text-slate-500 dark:text-slate-400 transition-colors"
          )}
        >
          Agent Booking Platform
        </span>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E24B4B] rounded-lg">
        {content}
      </Link>
    );
  }

  return content;
}
