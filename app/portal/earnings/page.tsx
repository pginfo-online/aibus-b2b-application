"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  TrendingUp,
  Calendar,
  CalendarDays,
  FileSpreadsheet,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Receipt,
  Wallet,
  Ticket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/ui/badge";
import { api } from "@/lib/api-client";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import type { CommissionSummary, WalletStatementResponse, LedgerEntry } from "@/types/api";

function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function EarningsPage() {
  const [activeTab, setActiveTab] = useState<"day" | "date" | "month">("day");
  const [subView, setSubView] = useState<"commission" | "ledger">("commission");

  // Date selection states
  const todayStr = useMemo(() => getLocalDateString(), []);
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return getLocalDateString(d);
  });
  const [toDate, setToDate] = useState(todayStr);
  const [selectedMonth, setSelectedMonth] = useState(() => todayStr.slice(0, 7)); // YYYY-MM

  // Compute effective query date range based on activeTab
  const { effectiveFrom, effectiveTo } = useMemo(() => {
    if (activeTab === "day") {
      return { effectiveFrom: selectedDate, effectiveTo: selectedDate };
    }
    if (activeTab === "date") {
      return { effectiveFrom: fromDate, effectiveTo: toDate };
    }
    // month view
    const [year, month] = selectedMonth.split("-").map(Number);
    const lastDay = new Date(year, month, 0).getDate();
    return {
      effectiveFrom: `${selectedMonth}-01`,
      effectiveTo: `${selectedMonth}-${String(lastDay).padStart(2, "0")}`,
    };
  }, [activeTab, selectedDate, fromDate, toDate, selectedMonth]);

  // 1. Fetch authoritative Commission Summary and snapshots
  const {
    data: summaryData,
    isLoading: isSummaryLoading,
    refetch: refetchSummary,
  } = useQuery({
    queryKey: ["agent", "earnings", "summary", activeTab, effectiveFrom, effectiveTo],
    queryFn: async () => {
      const res = await api.get<CommissionSummary>("/agents/reports/commissions", {
        params: {
          fromDate: effectiveFrom,
          toDate: effectiveTo,
        },
      });
      return res;
    },
    staleTime: 30_000,
  });

  // 2. Fetch Day Ledger statement
  const {
    data: ledgerData,
    isLoading: isLedgerLoading,
    refetch: refetchLedger,
  } = useQuery({
    queryKey: ["agent", "earnings", "statement", activeTab, effectiveFrom, effectiveTo],
    queryFn: async () => {
      const res = await api.get<WalletStatementResponse>("/agents/wallet/statement", {
        params: {
          fromDate: effectiveFrom,
          toDate: effectiveTo,
          limit: 100,
        },
      });
      return res;
    },
    staleTime: 30_000,
  });

  // Filter ledger entries with both UTC and local date fallback
  const tabEntries = useMemo(() => {
    const raw: LedgerEntry[] = ledgerData?.entries || [];
    return raw.filter((e) => {
      if (!e.postedAt) return true;
      const utcDate = e.postedAt.slice(0, 10);
      let localDate = utcDate;
      try {
        localDate = new Date(e.postedAt).toLocaleDateString("en-CA");
      } catch {}

      if (activeTab === "day") {
        return utcDate === selectedDate || localDate === selectedDate;
      }
      if (activeTab === "date") {
        return (
          (utcDate >= fromDate && utcDate <= toDate) ||
          (localDate >= fromDate && localDate <= toDate)
        );
      }
      // month view
      return utcDate.startsWith(selectedMonth) || localDate.startsWith(selectedMonth);
    });
  }, [ledgerData?.entries, activeTab, selectedDate, fromDate, toDate, selectedMonth]);

  // Filtered commission snapshots
  const commissionSnapshots = useMemo(() => {
    return summaryData?.snapshots || [];
  }, [summaryData?.snapshots]);

  const tabs = [
    { id: "day", label: "Day Ledger", icon: <CalendarDays className="h-4 w-4" /> },
    { id: "date", label: "Date-wise Summary", icon: <Calendar className="h-4 w-4" /> },
    { id: "month", label: "Month-wise Summary", icon: <FileSpreadsheet className="h-4 w-4" /> },
  ];

  const handleQuickPreset = (preset: "today" | "yesterday" | "7d" | "30d" | "thisMonth") => {
    const now = new Date();
    const today = getLocalDateString(now);

    if (preset === "today") {
      setSelectedDate(today);
      setActiveTab("day");
    } else if (preset === "yesterday") {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      setSelectedDate(getLocalDateString(y));
      setActiveTab("day");
    } else if (preset === "7d") {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      setFromDate(getLocalDateString(d));
      setToDate(today);
      setActiveTab("date");
    } else if (preset === "30d") {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      setFromDate(getLocalDateString(d));
      setToDate(today);
      setActiveTab("date");
    } else if (preset === "thisMonth") {
      setSelectedMonth(today.slice(0, 7));
      setActiveTab("month");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-[#D92D20]" />
            My Earnings & Commissions
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Authoritative commission ledger derived from confirmed bookings and net fare settlements
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            refetchSummary();
            refetchLedger();
          }}
          className="self-start sm:self-auto font-bold"
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
          Refresh Earnings
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
            <span>Net Agency Profit</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {formatCurrency(summaryData?.netCommission ?? 0)}
          </p>
          <p className="text-[11px] text-slate-400">
            Retained profit earned across {summaryData?.count ?? 0} booked seats
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
            <span>Gross Commission Tracked</span>
            <div className="p-1.5 rounded-lg bg-red-50 text-[#D92D20] dark:bg-red-950 dark:text-red-400">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">
            {formatCurrency(summaryData?.totalCommission ?? 0)}
          </p>
          <p className="text-[11px] text-slate-400">
            Calculated at 10% standard rate on base ticket fares
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
            <span>Reversed Commission</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">
            {formatCurrency(summaryData?.reversedCommission ?? 0)}
          </p>
          <p className="text-[11px] text-slate-400">
            Reversed commission clawed back on cancelled tickets
          </p>
        </div>
      </div>

      {/* Primary Tab Switcher */}
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={(t) => setActiveTab(t as "day" | "date" | "month")}
      />

      {/* Date Range Controller Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs">
        {activeTab === "day" && (
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700 dark:text-slate-300">Select Day:</span>
              <input
                type="date"
                max={todayStr}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickPreset("today")}
                className={`px-2.5 py-1 rounded-md text-xs font-medium border ${
                  selectedDate === todayStr
                    ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900"
                    : "border-slate-200 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => handleQuickPreset("yesterday")}
                className="px-2.5 py-1 rounded-md text-xs font-medium border border-slate-200 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                Yesterday
              </button>
            </div>
          </div>
        )}

        {activeTab === "date" && (
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700 dark:text-slate-300">From:</span>
              <input
                type="date"
                max={toDate}
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700 dark:text-slate-300">To:</span>
              <input
                type="date"
                max={todayStr}
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickPreset("7d")}
                className="px-2.5 py-1 rounded-md text-xs font-medium border border-slate-200 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                Last 7 Days
              </button>
              <button
                type="button"
                onClick={() => handleQuickPreset("30d")}
                className="px-2.5 py-1 rounded-md text-xs font-medium border border-slate-200 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                Last 30 Days
              </button>
            </div>
          </div>
        )}

        {activeTab === "month" && (
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700 dark:text-slate-300">Select Month:</span>
              <input
                type="month"
                max={todayStr.slice(0, 7)}
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() => handleQuickPreset("thisMonth")}
              className="px-2.5 py-1 rounded-md text-xs font-medium border border-slate-200 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              This Month
            </button>
          </div>
        )}

        {/* Sub-view switcher: Commission vs Ledger */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setSubView("commission")}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-md transition-all ${
              subView === "commission"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <Receipt className="h-3.5 w-3.5" />
            <span>Commission Earnings ({commissionSnapshots.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setSubView("ledger")}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-md transition-all ${
              subView === "ledger"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <Wallet className="h-3.5 w-3.5" />
            <span>Wallet Ledger ({tabEntries.length})</span>
          </button>
        </div>
      </div>

      {/* Content Table Container */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
        {subView === "commission" ? (
          /* Commission Earnings Breakdown */
          isSummaryLoading ? (
            <div className="p-12 text-center text-slate-400">Loading commission records...</div>
          ) : commissionSnapshots.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Ticket className="h-8 w-8 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No commission records for the selected period
              </p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                No tickets were booked in this date range. Try switching to &quot;Date-wise Summary&quot; or selecting a previous date to review earned commissions.
              </p>
              <div className="pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleQuickPreset("30d")}
                  className="text-xs"
                >
                  View Last 30 Days Activity
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase tracking-wider font-bold text-slate-500 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Booking & PNR</th>
                    <th className="py-3 px-4">Operator & Route</th>
                    <th className="py-3 px-4">Travel Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Gross Fare</th>
                    <th className="py-3 px-4 text-right">Comm. Rate</th>
                    <th className="py-3 px-4 text-right">Commission Earned</th>
                    <th className="py-3 px-4 text-right">Net Fare Paid</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {commissionSnapshots.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-slate-900 dark:text-white">
                          {item.bookingNumber || item.bookingId.slice(0, 8)}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {item.providerPnrNo ? `PNR: ${item.providerPnrNo}` : "Pending PNR"}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {item.operatorName || "Standard Operator"}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {item.route || "City → Destination"}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {item.travelDate ? formatDate(item.travelDate, "short") : formatDate(item.createdAt, "short")}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={item.bookingStatus || "CONFIRMED"} />
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-600 dark:text-slate-300">
                        {formatCurrency(item.grossFare)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                        {item.commissionRate}%
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        +{formatCurrency(item.commissionAmt)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-black text-slate-900 dark:text-white">
                        {formatCurrency(item.netFare)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          /* Wallet Ledger Postings */
          isLedgerLoading ? (
            <div className="p-12 text-center text-slate-400">Loading ledger data...</div>
          ) : tabEntries.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <TrendingUp className="h-8 w-8 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No ledger transactions for the selected range
              </p>
              <p className="text-xs text-slate-400">
                Try adjusting the date selector or create new bookings to view ledger postings.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase tracking-wider font-bold text-slate-500 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Date / Time</th>
                    <th className="py-3 px-4">Reference</th>
                    <th className="py-3 px-4">Account Category</th>
                    <th className="py-3 px-4">Details</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {tabEntries.map((item) => {
                    const isCredit =
                      Number(item.creditAmount ?? 0) > 0 ||
                      item.entryType === "CREDIT" ||
                      (item.type && item.type.includes("CREDIT")) ||
                      (item.type && item.type.includes("TOPUP"));

                    const displayType = isCredit ? "CREDIT" : "DEBIT";

                    const amount =
                      Number(item.creditAmount ?? 0) > 0
                        ? Number(item.creditAmount)
                        : Number(item.debitAmount ?? 0) > 0
                        ? Number(item.debitAmount)
                        : Number(item.amount ?? 0);

                    const category = (item.type || item.accountType || "TRANSACTION").replace(/_/g, " ");

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                          {formatDateTime(item.postedAt)}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                          {item.referenceId || item.bookingId?.slice(0, 8) || item.id.slice(0, 8)}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold uppercase text-slate-600 dark:text-slate-300">
                            {category}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-700 dark:text-slate-300 max-w-sm truncate">
                          {item.description}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 font-bold ${
                              isCredit ? "text-emerald-600" : "text-rose-600"
                            }`}
                          >
                            {isCredit ? (
                              <ArrowDownLeft className="h-3 w-3" />
                            ) : (
                              <ArrowUpRight className="h-3 w-3" />
                            )}
                            {displayType}
                          </span>
                        </td>
                        <td
                          className={`py-3 px-4 text-right font-mono font-bold ${
                            isCredit
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-slate-900 dark:text-white"
                          }`}
                        >
                          {isCredit ? "+" : "-"}
                          {formatCurrency(amount)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
}
