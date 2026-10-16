'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  FileText,
  Download,
  Calendar,
  RefreshCw,
  Search,
  CheckCircle2,
  TrendingUp,
  Percent,
  ChevronLeft,
  ChevronRight,
  Bus,
} from 'lucide-react';
import { api } from '@/lib/api-client';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import { useToastStore } from '@/store/toast-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { BookingRecord, CommissionSummary } from '@/types/api';

export default function AgentReportsPage() {
  const { addToast } = useToastStore();

  // Date filters
  const [fromDate, setFromDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(20);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Fetch Booking History for Report
  const {
    data: reportData,
    isLoading: isBookingsLoading,
    refetch: refetchBookings,
    isFetching: isBookingsFetching,
  } = useQuery({
    queryKey: ['agent-reports-bookings', page, pageSize, statusFilter, fromDate, toDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', pageSize.toString());
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (fromDate) params.set('fromDate', fromDate);
      if (toDate) params.set('toDate', toDate);

      const res = await api.get<{
        success: boolean;
        data: { bookings: BookingRecord[]; total: number; page: number; limit: number; pages: number };
      }>(`/agents/reports/bookings?${params.toString()}`);
      return res.data;
    },
    staleTime: 60_000,
  });

  // Fetch Commission Summary
  const {
    data: commissionSummary,
    isLoading: isCommissionLoading,
    refetch: refetchCommission,
  } = useQuery({
    queryKey: ['agent-reports-commissions', fromDate, toDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (fromDate) params.set('fromDate', fromDate);
      if (toDate) params.set('toDate', toDate);

      const res = await api.get<{ success: boolean; data: CommissionSummary }>(
        `/agents/reports/commissions?${params.toString()}`
      );
      return res.data;
    },
    staleTime: 60_000,
  });

  // Handle CSV Export
  const handleExportCsv = async () => {
    try {
      setIsExporting(true);
      const params = new URLSearchParams();
      if (fromDate) params.set('fromDate', fromDate);
      if (toDate) params.set('toDate', toDate);

      const endpoint = `/agents/reports/export?${params.toString()}`;
      const filename = `aibus-agent-report-${fromDate}-to-${toDate}.csv`;
      await api.downloadFile(endpoint, filename);

      addToast({
        type: 'success',
        title: 'Report Downloaded',
        message: `Your booking report was exported successfully to ${filename}.`,
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Unable to download CSV report. Check permissions or network.';
      addToast({
        type: 'error',
        title: 'Export Failed',
        message: errorMsg,
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Quick Preset Handlers
  const handlePreset = (type: '7d' | '30d' | 'month' | 'all') => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    setToDate(todayStr);

    if (type === '7d') {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      setFromDate(d.toISOString().split('T')[0]);
    } else if (type === '30d') {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      setFromDate(d.toISOString().split('T')[0]);
    } else if (type === 'month') {
      const d = new Date(today.getFullYear(), today.getMonth(), 1);
      setFromDate(d.toISOString().split('T')[0]);
    } else if (type === 'all') {
      setFromDate('');
      setToDate('');
    }
    setPage(1);
  };

  const rawBookings = reportData?.bookings ?? [];
  const filteredBookings = rawBookings.filter((b) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const matchNum = b.bookingNumber?.toLowerCase().includes(term);
    const matchPnr = b.providerPnrNo?.toLowerCase().includes(term);
    const matchOp = b.operatorName?.toLowerCase().includes(term);
    const matchCity = b.fromCityName?.toLowerCase().includes(term) || b.toCityName?.toLowerCase().includes(term);
    return matchNum || matchPnr || matchOp || matchCity;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Export CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary-red" />
            Operational & Commission Reports
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Reconcile bookings, monitor gross vs net margins, and export audit-ready financial statements.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetchBookings();
              refetchCommission();
            }}
            disabled={isBookingsFetching}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isBookingsFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            variant="primary"
            onClick={handleExportCsv}
            disabled={isExporting}
            className="flex items-center gap-2 shadow-sm"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Exporting CSV...' : 'Export CSV Report'}
          </Button>
        </div>
      </div>

      {/* Date Range Selector Bar */}
      <Card className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-neutral-400" />
              <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Date Range:
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setPage(1);
                }}
                className="h-8 w-36 text-xs"
              />
              <span className="text-xs text-neutral-400">to</span>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setPage(1);
                }}
                className="h-8 w-36 text-xs"
              />
            </div>
          </div>

          {/* Quick Date Presets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => handlePreset('7d')}
              className="px-2.5 py-1 text-xs font-medium rounded-md border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Last 7 Days
            </button>
            <button
              onClick={() => handlePreset('30d')}
              className="px-2.5 py-1 text-xs font-medium rounded-md border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Last 30 Days
            </button>
            <button
              onClick={() => handlePreset('month')}
              className="px-2.5 py-1 text-xs font-medium rounded-md border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              This Month
            </button>
            <button
              onClick={() => handlePreset('all')}
              className="px-2.5 py-1 text-xs font-medium rounded-md border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              All Time
            </button>
          </div>
        </div>
      </Card>

      {/* Financial Aggregates / KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Bookings Count */}
        <Card className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Total Bookings
              </span>
              <Bus className="w-4 h-4 text-neutral-400" />
            </div>
            <CardTitle className="text-3xl font-extrabold text-neutral-900 dark:text-neutral-100 mt-1">
              {isCommissionLoading ? (
                <Skeleton className="h-9 w-20" />
              ) : (
                commissionSummary?.count ?? reportData?.total ?? 0
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-neutral-500">Tickets generated within selected period</p>
          </CardContent>
        </Card>

        {/* Gross Commission Earned */}
        <Card className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Gross Commission
              </span>
              <Percent className="w-4 h-4 text-emerald-600" />
            </div>
            <CardTitle className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
              {isCommissionLoading ? (
                <Skeleton className="h-9 w-28" />
              ) : (
                formatCurrency(commissionSummary?.totalCommission ?? 0)
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-neutral-500">Total earned before cancellation adjustments</p>
          </CardContent>
        </Card>

        {/* Commission Reversed / Cancellations */}
        <Card className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Commission Reversals
              </span>
              <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />
            </div>
            <CardTitle className="text-3xl font-extrabold text-red-600 dark:text-red-400 mt-1">
              {isCommissionLoading ? (
                <Skeleton className="h-9 w-24" />
              ) : (
                formatCurrency(commissionSummary?.reversedCommission ?? 0)
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-neutral-500">Debited back due to cancelled trips</p>
          </CardContent>
        </Card>

        {/* Net Realized Commission */}
        <Card className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-primary-gold" />
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Net Profit Retained
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <CardTitle className="text-3xl font-extrabold text-neutral-900 dark:text-neutral-100 mt-1">
              {isCommissionLoading ? (
                <Skeleton className="h-9 w-28" />
              ) : (
                formatCurrency(commissionSummary?.netCommission ?? 0)
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-neutral-500">Net take-home margin credited to wallet</p>
          </CardContent>
        </Card>
      </div>

      {/* Booking Details Table */}
      <Card className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
        <CardHeader className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                Detailed Ticket Manifest
              </CardTitle>
              <p className="text-xs text-neutral-500 mt-0.5">
                Itemized booking records with Gross Fare, Commission Rate, and Net Fare payable.
              </p>
            </div>

            {/* Search & Status Filter */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-48 sm:w-60">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                <Input
                  placeholder="Search booking / PNR / route..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-9 text-xs"
                />
              </div>

              <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg">
                {(['ALL', 'CONFIRMED', 'CANCELLED'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setStatusFilter(s);
                      setPage(1);
                    }}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                      statusFilter === s
                        ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-xs'
                        : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                    }`}
                  >
                    {s === 'ALL' ? 'All' : s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isBookingsLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 text-neutral-400" />
              </div>
              <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                No report records found
              </h3>
              <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                No bookings match your current date range and filter criteria. Adjust the filters above.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-600 dark:text-neutral-400 text-xs uppercase font-semibold border-b border-neutral-200 dark:border-neutral-800">
                  <tr>
                    <th className="px-4 py-3">Booking # / PNR</th>
                    <th className="px-4 py-3">Journey & Operator</th>
                    <th className="px-4 py-3">Travel Date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Gross Fare</th>
                    <th className="px-4 py-3 text-right">Commission</th>
                    <th className="px-4 py-3 text-right">Net Debited</th>
                    <th className="px-4 py-3">Booked At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {filteredBookings.map((b) => {
                    const snap = b.commissionSnapshot;
                    const commRate = snap?.commissionRate ? `${snap.commissionRate}%` : '—';
                    const commAmt = snap?.commissionAmt ? Number(snap.commissionAmt) : 0;
                    const netFare = snap?.netFare ? Number(snap.netFare) : Number(b.totalFare);

                    return (
                      <tr
                        key={b.id}
                        className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="font-mono font-bold text-xs text-neutral-900 dark:text-neutral-100">
                            {b.bookingNumber}
                          </div>
                          <div className="text-[11px] font-mono text-neutral-400 mt-0.5">
                            PNR: {b.providerPnrNo || 'Pending'}
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                            {b.fromCityName} → {b.toCityName}
                          </div>
                          <div className="text-[11px] text-neutral-500">{b.operatorName}</div>
                        </td>

                        <td className="px-4 py-3 text-xs text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                          {formatDate(b.journeyDate)}
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          <Badge
                            variant={
                              b.status === 'CONFIRMED'
                                ? 'success'
                                : b.status === 'CANCELLED'
                                ? 'error'
                                : 'warning'
                            }
                            size="sm"
                          >
                            {b.status}
                          </Badge>
                        </td>

                        <td className="px-4 py-3 text-right font-mono text-xs font-semibold text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
                          {formatCurrency(Number(b.totalFare))}
                        </td>

                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <div className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                            +{formatCurrency(commAmt)}
                          </div>
                          <div className="text-[10px] text-neutral-400">Rate: {commRate}</div>
                        </td>

                        <td className="px-4 py-3 text-right font-mono text-xs font-bold text-primary-darkRed dark:text-primary-red whitespace-nowrap">
                          {formatCurrency(netFare)}
                        </td>

                        <td className="px-4 py-3 text-xs text-neutral-500 whitespace-nowrap">
                          {formatDateTime(b.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {reportData && reportData.pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-200 dark:border-neutral-800 text-xs">
              <span className="text-neutral-500">
                Page {reportData.page} of {reportData.pages} ({reportData.total} bookings)
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="h-8 px-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(reportData.pages, p + 1))}
                  disabled={page >= reportData.pages}
                  className="h-8 px-2"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
