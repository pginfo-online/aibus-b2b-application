"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { SearchForm } from "@/components/search/search-form";
import { useAuthStore } from "@/store/auth-store";
import { api } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TrendingUp,
  Ticket,
  Wallet,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import type { BookingRecord, CommissionSummary } from "@/types/api";

export default function AgentHomePage() {
  const { agent, user } = useAuthStore();

  // 1. Fetch real agency commissions from /agents/reports/commissions
  const { data: commissionData, isLoading: isCommLoading } = useQuery({
    queryKey: ["agent", "commissions", agent?.id],
    queryFn: async () => {
      const res = await api.get<CommissionSummary>("/agents/reports/commissions");
      return res;
    },
    enabled: !!agent?.id,
  });

  // 2. Fetch recent bookings from /agents/reports/bookings?limit=5
  const { data: recentBookingsData, isLoading: isBookingsLoading } = useQuery({
    queryKey: ["agent", "recent-bookings", agent?.id],
    queryFn: async () => {
      const res = await api.get<{ bookings: BookingRecord[]; total: number }>(
        "/agents/reports/bookings",
        { params: { limit: 5 } }
      );
      return res;
    },
    enabled: !!agent?.id,
  });

  const recentBookings = recentBookingsData?.bookings || [];
  const totalBookingsCount = recentBookingsData?.total ?? 0;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-[#172033] text-white shadow-sm border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              Welcome, {user?.firstName || "Agent"}!
            </h1>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/30 text-red-300">
              {agent?.businessName || "Registered Agency"}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300">
            Book bus seats instantly with direct operator GDS locking & net fare wallet settlement.
          </p>
        </div>

        {agent && (
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/portal/profile"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-slate-200 transition-colors"
            >
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>KYC: {agent.status.replace(/_/g, " ")}</span>
            </Link>
          </div>
        )}
      </div>

      {/* Main Bus Search Form */}
      <SearchForm />

      {/* Real Aggregate Dashboard Metrics */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Agency Performance & Wallet Status
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Available Wallet Balance */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Wallet Balance
              </span>
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <Wallet className="h-4 w-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {formatCurrency(agent?.wallet?.cashBalance ?? 0)}
              </p>
              <Link
                href="/portal/wallet"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#D92D20] hover:underline mt-1 dark:text-red-400"
              >
                Top up wallet <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Card 2: Net Commission Earned */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Net Commissions
              </span>
              <div className="p-2 rounded-lg bg-red-50 text-[#D92D20] dark:bg-red-950/60 dark:text-red-400">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div>
              {isCommLoading ? (
                <Skeleton className="h-8 w-28" />
              ) : (
                <p className="text-2xl font-black text-slate-900 dark:text-white">
                  {formatCurrency(commissionData?.netCommission ?? 0)}
                </p>
              )}
              <Link
                href="/portal/earnings"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white mt-1"
              >
                View Ledger <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Card 3: Total Bookings Count */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Total Bookings
              </span>
              <div className="p-2 rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400">
                <Ticket className="h-4 w-4" />
              </div>
            </div>
            <div>
              {isBookingsLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <p className="text-2xl font-black text-slate-900 dark:text-white">
                  {totalBookingsCount}
                </p>
              )}
              <Link
                href="/portal/bookings"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white mt-1"
              >
                All Bookings <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Card 4: Gross Commission Tracked */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Gross Commission
              </span>
              <div className="p-2 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div>
              {isCommLoading ? (
                <Skeleton className="h-8 w-28" />
              ) : (
                <p className="text-2xl font-black text-slate-900 dark:text-white">
                  {formatCurrency(commissionData?.totalCommission ?? 0)}
                </p>
              )}
              <p className="text-[11px] text-slate-400 mt-1">
                {commissionData?.count ?? 0} qualifying transactions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bookings Section */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Recent Agency Bookings
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live ticketing status from backend reports
            </p>
          </div>
          <Link
            href="/portal/bookings"
            className="text-xs font-bold text-[#D92D20] hover:underline dark:text-red-400 inline-flex items-center gap-1"
          >
            View all {totalBookingsCount} bookings <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>

        {isBookingsLoading ? (
          <div className="space-y-3 pt-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : recentBookings.length === 0 ? (
          <div className="p-10 text-center space-y-2 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            <Ticket className="h-8 w-8 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No bookings created yet
            </p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Use the bus search module above to book seats for your customers and begin earning commissions.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-bold border-y border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-3">Booking #</th>
                  <th className="py-3 px-3">Journey & Operator</th>
                  <th className="py-3 px-3">Travel Date</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Gross Fare</th>
                  <th className="py-3 px-3">Commission</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {recentBookings.map((b) => (
                  <tr
                    key={b.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white">
                      {b.bookingNumber}
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-bold text-slate-900 dark:text-slate-100">
                        {b.fromCityName} → {b.toCityName}
                      </p>
                      <p className="text-[11px] text-slate-400">{b.operatorName}</p>
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                      {formatDate(b.journeyDate, "short")}
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(b.totalFare)}
                    </td>
                    <td className="py-3 px-3 font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(b.commissionSnapshot?.commissionAmt ?? 0)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        href={`/portal/bookings?id=${b.id}`}
                        className="text-xs font-bold text-[#D92D20] hover:underline dark:text-red-400"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
