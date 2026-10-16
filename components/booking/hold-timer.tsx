"use client";

import React, { useEffect, useState } from "react";
import { Clock, AlertTriangle } from "lucide-react";

interface HoldTimerProps {
  expiresAt: string; // ISO timestamp
  onExpire?: () => void;
}

export function HoldTimer({ expiresAt, onExpire }: HoldTimerProps) {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => {
    const diff = Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000);
    return Math.max(0, diff);
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000);
      if (diff <= 0) {
        setSecondsRemaining(0);
        clearInterval(interval);
        onExpire?.();
      } else {
        setSecondsRemaining(diff);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const formatted = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

  const isWarning = secondsRemaining < 120; // Under 2 minutes
  const isExpired = secondsRemaining === 0;

  return (
    <div
      className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors ${
        isExpired
          ? "border-red-300 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/60 dark:text-red-300"
          : isWarning
          ? "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/60 dark:text-amber-300 animate-pulse"
          : "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300"
      }`}
    >
      {isExpired ? (
        <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
      ) : (
        <Clock className="h-4 w-4 shrink-0" />
      )}
      <span>
        {isExpired
          ? "Seat hold expired"
          : `Seats Locked: ${formatted} min`}
      </span>
    </div>
  );
}
