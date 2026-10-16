"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Wallet, Ticket, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();

  const tabs = [
    { label: "Home", href: "/portal", icon: Home, exact: true },
    { label: "Wallet", href: "/portal/wallet", icon: Wallet },
    { label: "Bookings", href: "/portal/bookings", icon: Ticket },
    { label: "Profile", href: "/portal/profile", icon: User },
  ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex h-16 items-center justify-around border-t border-slate-200 bg-white/95 px-2 pb-safe backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95"
    >
      {tabs.map((tab) => {
        const isActive = tab.exact
          ? pathname === tab.href
          : pathname.startsWith(tab.href);
        const Icon = tab.icon;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center py-1 text-center transition-colors touch-manipulation",
              isActive
                ? "text-[#D92D20] dark:text-red-400 font-bold"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 font-medium"
            )}
          >
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full transition-transform",
                isActive && "scale-110"
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
            <span className="text-[10px] tracking-tight">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
