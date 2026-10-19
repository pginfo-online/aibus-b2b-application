"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { UnifiedSearchBar } from "@/components/search/unified-search-bar";
import { useAuthStore } from "@/store/auth-store";
import { useBookingStore } from "@/store/booking-store";
import { api } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Flame,
  Ticket,
  Trophy,
  ChevronRight,
  Target,
  Lock,
  ExternalLink,
  IndianRupee,
} from "lucide-react";
import type { BookingRecord, CommissionSummary } from "@/types/api";

export default function AgentHomePage() {
  const router = useRouter();
  const { agent } = useAuthStore();
  const { setSearchCriteria, journeyDate } = useBookingStore();

  // 1. Fetch real agency commissions from /agents/reports/commissions
  const { data: commissionData } = useQuery({
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

  // Quick route search handler
  const handleQuickRouteSearch = (fromName: string, toName: string, fromId: number, toId: number) => {
    const fromCity = {
      id: String(fromId),
      providerCityId: fromId,
      name: fromName,
      City: fromName,
      CityId: fromId,
      State: "Maharashtra",
    };
    const toCity = {
      id: String(toId),
      providerCityId: toId,
      name: toName,
      City: toName,
      CityId: toId,
      State: "Karnataka",
    };
    setSearchCriteria(fromCity, toCity, journeyDate);
    router.push(
      `/portal/search?fromCityId=${fromId}&toCityId=${toId}&fromCityName=${fromName}&toCityName=${toName}&journeyDate=${journeyDate}`
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Search Bar matching ref-1.png */}
      <UnifiedSearchBar />

      {/* Row of Quick Metric Cards matching ref-1 & ref-2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Quick popular route trigger */}
        <button
          type="button"
          onClick={() => handleQuickRouteSearch("Pune", "Bengaluru", 2002, 4292)}
          className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between text-left group"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-[#D92D20] fill-[#D92D20]" />
              <span className="text-sm font-black text-slate-900 dark:text-white">
                Pune → Bengaluru
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Click to search for today</p>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Commission Earned */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-1">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Commission Earned
          </p>
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
              <IndianRupee className="h-3.5 w-3.5" />
            </div>
            <span className="text-lg font-black text-slate-900 dark:text-white font-mono">
              {formatCurrency(commissionData?.netCommission ?? 0, false)}
            </span>
          </div>
        </div>

        {/* Bookings */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-1">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Bookings</p>
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-400">
              <Ticket className="h-3.5 w-3.5" />
            </div>
            <span className="text-lg font-black text-slate-900 dark:text-white">
              {totalBookingsCount}
            </span>
            <span className="text-xs text-slate-400">for today</span>
          </div>
        </div>

        {/* Cancellations */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-1">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Cancellations</p>
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400">
              <Ticket className="h-3.5 w-3.5" />
            </div>
            <span className="text-lg font-black text-slate-900 dark:text-white">0</span>
            <span className="text-xs text-slate-400">for today</span>
          </div>
        </div>
      </div>

      {/* October Dhamaka Rewards Banner matching ref-1.png & ref-2.png */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs space-y-4">
        {/* Banner dark title bar */}
        <div className="bg-[#111827] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-red-600 text-white font-black text-xs shadow-xs">
              🔥
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black tracking-tight text-white">October Dhamaka</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  13 days left
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Milestone Rewards</p>
            </div>
          </div>
          <span className="text-[11px] text-slate-400 underline cursor-pointer hover:text-slate-200">
            Terms & conditions
          </span>
        </div>

        {/* Milestone Steps Bar matching ref-1 & ref-2 */}
        <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Progress Box */}
          <div className="lg:col-span-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Next Up: Tier 1
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                Behind pace
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-[#D92D20]">0</span>
              <span className="text-xs text-slate-400">of 100 seats</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#D92D20] h-full w-[2%]" />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              0 seats/day so far • 8 seats/day needed
            </p>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 pt-1">
              Earn wallet balance of ₹2,000 or Jewellery Voucher Worth ₹2,000
            </p>
          </div>

          {/* 5 Milestone Badges matching ref-1 & ref-2 */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
            {/* Tier 1 */}
            <div className="space-y-1.5">
              <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-[#D92D20] border-2 border-[#D92D20] shadow-xs">
                <Target className="h-4 w-4" />
              </div>
              <p className="text-[10px] font-bold uppercase text-slate-400">Tier 1</p>
              <p className="text-xs font-black text-slate-900 dark:text-white">100 seats</p>
              <p className="text-[10px] text-slate-500 leading-tight">
                Wallet ₹2,000 or Jewellery Voucher
              </p>
              <span className="inline-block text-[9px] font-bold text-slate-400 uppercase">
                Locked
              </span>
            </div>

            {/* Tier 2 */}
            <div className="space-y-1.5">
              <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800">
                <Lock className="h-4 w-4" />
              </div>
              <p className="text-[10px] font-bold uppercase text-slate-400">Tier 2</p>
              <p className="text-xs font-black text-slate-900 dark:text-white">250 seats</p>
              <p className="text-[10px] text-slate-500 leading-tight">
                Wallet ₹5,000 or Jewellery Voucher
              </p>
              <span className="inline-block text-[9px] font-bold text-slate-400 uppercase">
                Locked
              </span>
            </div>

            {/* Tier 3 */}
            <div className="space-y-1.5">
              <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800">
                <Lock className="h-4 w-4" />
              </div>
              <p className="text-[10px] font-bold uppercase text-slate-400">Tier 3</p>
              <p className="text-xs font-black text-slate-900 dark:text-white">500 seats</p>
              <p className="text-[10px] text-slate-500 leading-tight">
                Wallet ₹10,000 or Jewellery Voucher
              </p>
              <span className="inline-block text-[9px] font-bold text-slate-400 uppercase">
                Locked
              </span>
            </div>

            {/* Tier 4 */}
            <div className="space-y-1.5">
              <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800">
                <Lock className="h-4 w-4" />
              </div>
              <p className="text-[10px] font-bold uppercase text-slate-400">Tier 4</p>
              <p className="text-xs font-black text-slate-900 dark:text-white">1000 seats</p>
              <p className="text-[10px] text-slate-500 leading-tight">
                Wallet ₹25,000 or Jewellery Voucher
              </p>
              <span className="inline-block text-[9px] font-bold text-slate-400 uppercase">
                Locked
              </span>
            </div>

            {/* Tier 5 */}
            <div className="space-y-1.5">
              <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800">
                <Lock className="h-4 w-4" />
              </div>
              <p className="text-[10px] font-bold uppercase text-slate-400">Tier 5</p>
              <p className="text-xs font-black text-slate-900 dark:text-white">1500 seats</p>
              <p className="text-[10px] text-slate-500 leading-tight">
                Thailand / Dubai / Sri Lanka 2N/3D
              </p>
              <span className="inline-block text-[9px] font-bold text-slate-400 uppercase">
                Locked
              </span>
            </div>
          </div>
        </div>

        {/* Milestone Trophy Banner matching ref-1 & ref-2 */}
        <div className="mx-4 sm:mx-6 mb-4 p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-200 text-amber-800 dark:bg-amber-900 dark:text-amber-200 shadow-xs">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900 dark:text-white">
                77 agents are already past 100 seats
              </p>
              <p className="text-xs text-[#D92D20] font-semibold">
                You&apos;re 100 seats from joining them.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="px-4 py-2 rounded-xl bg-[#EB5757] hover:bg-[#D92D20] text-white font-bold text-xs shadow-xs self-start sm:self-auto transition-colors"
          >
            See all rewards &gt;
          </button>
        </div>

        {/* Sub-metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-4 sm:px-6 pb-6 pt-1">
          <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
            <p className="text-base font-black text-slate-900 dark:text-white">₹1.95 lakh</p>
            <p className="text-[11px] text-slate-400">in rewards already won by agents this campaign</p>
          </div>
          <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
            <p className="text-base font-black text-slate-900 dark:text-white">16 agents</p>
            <p className="text-[11px] text-slate-400">crossed a milestone in the last 3 days</p>
          </div>
        </div>
      </div>

      {/* Recent Bookings Section */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xs space-y-4">
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
