"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Ticket,
  CreditCard,
  TrendingUp,
  Wallet,
  BarChart3,
  User,
  ShieldCheck,
  ChevronLeft,
} from "lucide-react";
import { useUiStore } from "@/store/ui-store";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/lib/utils";

export function AgentSidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUiStore();
  const { agent } = useAuthStore();

  const navigationItems = [
    { label: "Home", href: "/portal", icon: Home },
    { label: "Booking Details", href: "/portal/bookings", icon: Ticket },
    { label: "Payment Transactions", href: "/portal/payments", icon: CreditCard },
    { label: "My Earnings", href: "/portal/earnings", icon: TrendingUp },
    { label: "Wallet Top-ups", href: "/portal/wallet", icon: Wallet },
    { label: "Reports", href: "/portal/reports", icon: BarChart3 },
    { label: "Agency Profile", href: "/portal/profile", icon: User },
  ];

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 transition-all duration-300 z-20 shrink-0",
        sidebarCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Agency Identity badge in sidebar */}
      {!sidebarCollapsed && agent && (
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
            {agent.businessName}
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            <span
              className={cn(
                "inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full uppercase",
                agent.status === "APPROVED"
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                  : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
              )}
            >
              <ShieldCheck className="h-3 w-3" />
              {agent.status.replace(/_/g, " ")}
            </span>
          </div>
        </div>
      )}

      {/* Nav links */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        {navigationItems.map((item) => {
          const isActive =
            item.href === "/portal"
              ? pathname === "/portal"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={sidebarCollapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all",
                isActive
                  ? "bg-[#D92D20] text-white shadow-sm shadow-red-500/20"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom collapse button */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={toggleSidebar}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="flex w-full items-center justify-center p-2 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
        >
          <ChevronLeft
            className={cn("h-5 w-5 transition-transform", sidebarCollapsed && "rotate-180")}
          />
        </button>
      </div>
    </aside>
  );
}
