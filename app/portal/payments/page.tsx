"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CreditCard,
  Search,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { WalletStatementResponse } from "@/types/api";

export default function PaymentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [entryTypeFilter, setEntryTypeFilter] = useState<string>("ALL");
  const [page, setPage] = useState(1);

  // Fetch statement from /agents/wallet/statement
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["agent", "payments", page],
    queryFn: async () => {
      const res = await api.get<WalletStatementResponse>("/agents/wallet/statement", {
        params: { page, limit: 25 },
      });
      return res;
    },
  });

  const entries = data?.entries || [];
  const totalPages = data?.pages || 1;

  // Filter entries
  const filteredEntries = entries.filter((entry) => {
    if (entryTypeFilter !== "ALL" && entry.entryType !== entryTypeFilter) return false;
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase().trim();
    return (
      entry.description?.toLowerCase().includes(term) ||
      (entry.referenceId && entry.referenceId.toLowerCase().includes(term)) ||
      (entry.accountType && entry.accountType.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Payment Transaction Details
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Immutable double-entry ledger postings for tickets, top-ups, commissions, and refunds
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="self-start sm:self-auto font-bold"
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isFetching ? "animate-spin text-[#D92D20]" : ""}`} />
          Refresh Transactions
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search by Reference #, Description, or Account..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            startIcon={<Search className="h-4 w-4" />}
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400 hidden sm:block" />
          <select
            value={entryTypeFilter}
            onChange={(e) => setEntryTypeFilter(e.target.value)}
            className="h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#D92D20]"
          >
            <option value="ALL">All Posting Types</option>
            <option value="DEBIT">Debit Entries Only</option>
            <option value="CREDIT">Credit Entries Only</option>
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-16 gap-3 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-[#D92D20]" />
            <p className="text-xs font-medium">Fetching ledger statements...</p>
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-xs text-red-500">
            Failed to load payment transactions. Please check your network and retry.
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <CreditCard className="h-10 w-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              No transactions recorded yet
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Transactions from ticket bookings, wallet recharges, and refunds will post here with double-entry audit records.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase tracking-wider font-bold text-slate-500 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Posted Date</th>
                  <th className="py-3.5 px-4">Reference #</th>
                  <th className="py-3.5 px-4">Account Type</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4 text-right">Balance After</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {filteredEntries.map((item) => {
                  const isCredit = item.entryType === "CREDIT";
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {formatDate(item.postedAt, "full")}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        {item.referenceId || item.id.slice(0, 8)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-semibold text-[10px] uppercase text-slate-600 dark:text-slate-300">
                          {(item.accountType || item.type || "TRANSACTION").replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 max-w-xs truncate">
                        {item.description}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 font-bold ${
                            isCredit ? "text-emerald-600" : "text-red-600"
                          }`}
                        >
                          {isCredit ? (
                            <ArrowDownLeft className="h-3.5 w-3.5" />
                          ) : (
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          )}
                          {item.entryType}
                        </span>
                      </td>
                      <td
                        className={`py-3.5 px-4 font-mono font-bold ${
                          isCredit ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-white"
                        }`}
                      >
                        {isCredit ? "+" : "-"}
                        {formatCurrency(item.amount)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {formatCurrency(item.balanceAfter)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-slate-500">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
