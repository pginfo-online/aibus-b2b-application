"use client";

import React from "react";

const TICKER_ITEMS = [
  { text: "₹50,000* Monthly Potential", dotColor: "bg-amber-500 shadow-amber-500/50" },
  { text: "Backed by AiBus GDS Network", dotColor: "bg-emerald-500 shadow-emerald-500/50" },
  { text: "Instant Confirmations", dotColor: "bg-sky-500 shadow-sky-500/50" },
  { text: "24/7 Support", dotColor: "bg-rose-500 shadow-rose-500/50" },
  { text: "6,200+ Bus Operators", dotColor: "bg-red-500 shadow-red-500/50" },
  { text: "6,50,000+ Routes Covered", dotColor: "bg-purple-500 shadow-purple-500/50" },
];

export function MarqueeTicker() {
  // Triple the array to ensure smooth continuous loop across ultra-wide monitors
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <div className="w-full bg-white dark:bg-[#0B1220] py-4 overflow-hidden border-b border-slate-100 dark:border-slate-800/80 select-none">
      <div className="relative w-full overflow-hidden">
        {/* Soft Left and Right Edge Fade Gradients */}
        <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-r from-white dark:from-[#0B1220] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-l from-white dark:from-[#0B1220] to-transparent z-10 pointer-events-none" />

        <div className="animate-marquee flex items-center">
          {items.map((item, index) => (
            <div
              key={`${item.text}-${index}`}
              className="flex items-center gap-3 px-6 sm:px-8 text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200 tracking-tight whitespace-nowrap"
            >
              <span className={`w-2.5 h-2.5 rounded-full shadow-xs ${item.dotColor}`} />
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
