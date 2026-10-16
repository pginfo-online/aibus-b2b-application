"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  TrendingUp,
  Calendar,
  CalendarDays,
  FileSpreadsheet,
  DollarSign,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { api } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { CommissionSummary, WalletStatementResponse } from "@/types/api";

export default function EarningsPage() {
  const [activeTab, setActiveTab] = useState<"day" | "date" | "month">("day");

  // Date selection states
  const todayStr = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [toDate, setToDate] = useState(todayStr);
  const [selectedMonth, setSelectedMonth] = useState(() => todayStr.slice(0, 7)); // YYYY-MM

  // 1. Fetch authoritative Commission Summary from /agents/reports/commissions
  const { data: summaryData, refetch: refetchSummary } = useQuery({
    queryKey: ["agent", "earnings", "summary", fromDate, toDate],
    queryFn: async () => {
      const res = await api.get<CommissionSummary>("/agents/reports/commissions", {
        params: {
          fromDate: activeTab === "day" ? selectedDate : fromDate,
          toDate: activeTab === "day" ? selectedDate : toDate,
        },
      });
      return res;
    },
  });

  // 2. Fetch Day Ledger statement
  const { data: ledgerData, isLoading: isLedgerLoading, refetch: refetchLedger } = useQuery({
    queryKey: ["agent", "earnings", "statement"],
    queryFn: async () => {
      const res = await api.get<WalletStatementResponse>("/agents/wallet/statement", {
        params: { limit: 100 },
      });
      return res;
    },
  });

  // Filter entries according to active tab
  const tabEntries = React.useMemo(() => {
    const raw = ledgerData?.entries || [];
    if (activeTab === "day") {
      return raw.filter((e) => e.postedAt.startsWith(selectedDate));
    }
    if (activeTab === "date") {
      return raw.filter((e) => {
        const d = e.postedAt.slice(0, 10);
        return d >= fromDate && d <= toDate;
      });
    }
    // month view
    return raw.filter((e) => e.postedAt.startsWith(selectedMonth));
  }, [ledgerData?.entries, activeTab, selectedDate, fromDate, toDate, selectedMonth]);

  const tabs = [
    { id: "day", label: "Day Ledger", icon: <CalendarDays className="h-4 w-4" /> },
    { id: "date", label: "Date-wise Summary", icon: <Calendar className="h-4 w-4" /> },
    { id: "month", label: "Month-wise Summary", icon: <FileSpreadsheet className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            My Earnings & Commissions
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
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
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase">
            <span>Net Agency Profit</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {formatCurrency(summaryData?.netCommission ?? 0)}
          </p>
          <p className="text-[11px] text-slate-400">Retained after any cancellations</p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase">
            <span>Gross Commission Tracked</span>
            <div className="p-1.5 rounded-lg bg-red-50 text-[#D92D20] dark:bg-red-950 dark:text-red-400">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {formatCurrency(summaryData?.totalCommission ?? 0)}
          </p>
          <p className="text-[11px] text-slate-400">Across {summaryData?.count ?? 0} booked seats</p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase">
            <span>Reversed Commission</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {formatCurrency(summaryData?.reversedCommission ?? 0)}
          </p>
          <p className="text-[11px] text-slate-400">Reversed on cancelled passenger seats</p>
        </div>
      </div>

      {/* Tabs Control */}
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={(t) => setActiveTab(t as "day" | "date" | "month")}
      />

      {/* View Filter Controllers */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs">
        {activeTab === "day" && (
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
                className="h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700 dark:text-slate-300">To:</span>
              <input
                type="date"
                max={todayStr}
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
              />
            </div>
          </div>
        )}

        {activeTab === "month" && (
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 dark:text-slate-300">Select Month:</span>
            <input
              type="month"
              max={todayStr.slice(0, 7)}
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
            />
          </div>
        )}

        <div className="text-slate-500 font-medium">
          Showing {tabEntries.length} ledger postings
        </div>
      </div>

      {/* Ledger Table for Current Tab View */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
        {isLedgerLoading ? (
          <div className="p-12 text-center text-slate-400">Loading ledger data...</div>
        ) : tabEntries.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <TrendingUp className="h-8 w-8 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No transactions for the selected range
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
                {tabEntries.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {formatDate(item.postedAt, "full")}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {item.referenceId || item.id.slice(0, 8)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold uppercase text-slate-600 dark:text-slate-300">
                        {item.accountType.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 max-w-sm truncate">
                      {item.description}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={
                          item.entryType === "CREDIT"
                            ? "text-emerald-600 font-bold"
                            : "text-red-600 font-bold"
                        }
                      >
                        {item.entryType}
                      </span>
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-mono font-bold ${
                        item.entryType === "CREDIT"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-slate-900 dark:text-white"
                      }`}
                    >
                      {item.entryType === "CREDIT" ? "+" : "-"}
                      {formatCurrency(item.amount)}
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
