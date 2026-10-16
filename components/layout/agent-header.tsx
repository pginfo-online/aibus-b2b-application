"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bus,
  Wallet,
  Bell,
  User,
  LogOut,
  Menu,
  ChevronDown,
  ShieldAlert,
  Moon,
  Sun,
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useUiStore } from "@/store/ui-store";
import { formatCurrency } from "@/lib/utils";
import { api } from "@/lib/api-client";
import { toast } from "@/store/toast-store";

export function AgentHeader() {
  const router = useRouter();
  const { user, agent, clearAuth } = useAuthStore();
  const { toggleSidebar, notificationsOpen, setNotificationsOpen, theme, setTheme } = useUiStore();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout", {}, { skipAuth: false }).catch(() => {});
    } catch {}
    clearAuth();
    toast.info("You have been signed out.");
    router.push("/sign-in");
  };

  const cashBalance = agent?.wallet?.cashBalance ?? 0;
  const isKycApproved = agent?.status === "APPROVED";

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 dark:border-slate-800 dark:bg-slate-900 transition-colors">
      {/* Left: Sidebar toggle & Brand (visible on tablet/mobile) */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          aria-label="Toggle navigation sidebar"
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link href="/portal" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#D92D20] text-white shadow-xs">
            <Bus className="h-4 w-4" />
          </div>
          <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white hidden sm:inline-flex items-center gap-1">
            Ai<span className="text-[#D92D20]">Bus</span>
            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-xs bg-red-100 text-[#D92D20] dark:bg-red-950/60 dark:text-red-300 ml-1">
              Agent
            </span>
          </span>
        </Link>
      </div>

      {/* Right controls: Wallet, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-colors"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* KYC Verification warning banner (compact) */}
        {!isKycApproved && agent && (
          <Link
            href="/portal/profile"
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/60"
          >
            <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
            <span>KYC {agent.status === "PENDING_KYC" ? "Pending" : "Review"}</span>
          </Link>
        )}

        {/* Wallet Balance Pill */}
        <Link
          href="/portal/wallet"
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/60 dark:hover:bg-slate-800 transition-colors text-xs font-semibold"
        >
          <div className="p-1 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
            <Wallet className="h-3.5 w-3.5" />
          </div>
          <div className="flex flex-col text-right">
            <span className="text-[10px] text-slate-400 font-medium leading-none">Wallet</span>
            <span className="text-slate-900 dark:text-slate-100 font-bold leading-tight">
              {formatCurrency(cashBalance)}
            </span>
          </div>
        </Link>

        {/* Notifications Icon Button */}
        <button
          onClick={() => setNotificationsOpen(!notificationsOpen)}
          aria-label="View notifications"
          className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-colors"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#D92D20]" />
        </button>

        {/* User profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2 rounded-lg p-1.5 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
            aria-expanded={profileDropdownOpen}
            aria-label="Account menu"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 font-bold text-xs text-slate-700 dark:bg-slate-700 dark:text-slate-200">
              {user?.firstName ? user.firstName[0].toUpperCase() : <User className="h-4 w-4" />}
            </div>
            <span className="hidden lg:inline-block text-xs font-semibold max-w-[120px] truncate">
              {user?.firstName || "Agency Staff"}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 hidden sm:inline-block" />
          </button>

          {/* Profile Menu Dropdown */}
          {profileDropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-900 z-50 animate-in fade-in zoom-in-95 duration-150"
              onMouseLeave={() => setProfileDropdownOpen(false)}
            >
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                  {agent?.businessName || user?.firstName || "Travel Agency"}
                </p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                <span className="inline-block mt-1 text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {user?.role || "OPERATOR_AGENT"}
                </span>
              </div>

              <div className="py-1">
                <Link
                  href="/portal/profile"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <User className="h-4 w-4 text-slate-400" />
                  <span>Profile & Staff</span>
                </Link>
                <Link
                  href="/portal/wallet"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <Wallet className="h-4 w-4 text-slate-400" />
                  <span>Wallet Top-ups</span>
                </Link>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg dark:text-red-400 dark:hover:bg-red-950/40"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
