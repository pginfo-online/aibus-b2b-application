'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  PlusCircle,
  CreditCard,
  Building,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Search,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { api } from '@/lib/api-client';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { useToastStore } from '@/store/toast-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AgentWallet,
  WalletStatementResponse,
  WalletTopupInitiatePayload,
  WalletTopupInitiateResponse,
} from '@/types/api';

const PRESET_AMOUNTS = [500, 1000, 2000, 5000, 10000, 25000];

export default function AgentWalletPage() {
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();

  const [isTopupOpen, setIsTopupOpen] = useState(false);
  const [topupAmount, setTopupAmount] = useState<number>(2000);
  const [customAmountStr, setCustomAmountStr] = useState<string>('2000');
  const [gateway, setGateway] = useState<'AUTO' | 'PHONEPE' | 'RAZORPAY'>('AUTO');
  const [topupResult, setTopupResult] = useState<WalletTopupInitiateResponse | null>(null);

  // Statement Filters & Pagination
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);
  const [searchTerm, setSearchTerm] = useState('');
  const [entryTypeFilter, setEntryTypeFilter] = useState<'ALL' | 'CREDIT' | 'DEBIT'>('ALL');

  // Fetch Wallet Balance
  const {
    data: wallet,
    isLoading: isWalletLoading,
    refetch: refetchWallet,
    isFetching: isWalletFetching,
  } = useQuery({
    queryKey: ['agent-wallet'],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: AgentWallet }>('/agents/wallet');
      return res.data;
    },
    staleTime: 30_000,
  });

  // Fetch Wallet Statement / Ledger
  const {
    data: statementData,
    isLoading: isStatementLoading,
    refetch: refetchStatement,
  } = useQuery({
    queryKey: ['agent-wallet-statement', page, pageSize],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: WalletStatementResponse }>(
        `/agents/wallet/statement?page=${page}&limit=${pageSize}`
      );
      return res.data;
    },
    staleTime: 30_000,
  });

  // Top-up Initiation Mutation
  const initiateMutation = useMutation({
    mutationFn: async (payload: WalletTopupInitiatePayload) => {
      const res = await api.post<{ success: boolean; data: WalletTopupInitiateResponse }>(
        '/agents/wallet/topup',
        payload
      );
      return res.data;
    },
    onSuccess: (data) => {
      setTopupResult(data);
      addToast({
        type: 'info',
        title: 'Top-up Initiated',
        message: `Order #${data.merchantTxnId} created for ₹${topupAmount}. Complete payment below.`,
      });
    },
    onError: (err: { message?: string }) => {
      addToast({
        type: 'error',
        title: 'Top-up Failed',
        message: err.message || 'Unable to initiate wallet top-up. Please try again.',
      });
    },
  });

  // Confirm Top-up Mutation (Instant confirmation / verification)
  const confirmMutation = useMutation({
    mutationFn: async ({
      merchantTxnId,
      gatewayPaymentId,
    }: {
      merchantTxnId: string;
      gatewayPaymentId?: string;
    }) => {
      const res = await api.post<{ success: boolean; message: string; data: unknown }>(
        `/agents/wallet/topup/${merchantTxnId}/confirm`,
        { gatewayPaymentId: gatewayPaymentId || `sim_${Date.now()}` }
      );
      return res;
    },
    onSuccess: () => {
      addToast({
        type: 'success',
        title: 'Wallet Credited Successfully!',
        message: `₹${topupAmount} has been credited to your agent cash balance.`,
      });
      setIsTopupOpen(false);
      setTopupResult(null);
      queryClient.invalidateQueries({ queryKey: ['agent-wallet'] });
      queryClient.invalidateQueries({ queryKey: ['agent-wallet-statement'] });
    },
    onError: (err: { message?: string }) => {
      addToast({
        type: 'error',
        title: 'Confirmation Failed',
        message: err.message || 'Payment confirmation failed. Check status or contact support.',
      });
    },
  });

  const handleStartTopup = () => {
    if (topupAmount < 100 || topupAmount > 500000) {
      addToast({
        type: 'warning',
        title: 'Invalid Amount',
        message: 'Top-up amount must be between ₹100 and ₹5,00,000.',
      });
      return;
    }

    const idempotencyKey = crypto.randomUUID();
    initiateMutation.mutate({
      amount: topupAmount,
      gateway,
      idempotencyKey,
      redirectUrl: typeof window !== 'undefined' ? `${window.location.origin}/portal/wallet` : undefined,
    });
  };

  const cashBalance = Number(wallet?.cashBalance ?? 0);
  const creditLimit = Number(wallet?.creditLimit ?? 0);
  const creditUsed = Number(wallet?.creditUsed ?? 0);
  const availableBalance = cashBalance + Math.max(0, creditLimit - creditUsed);

  // Filter Statement Entries
  const rawEntries = statementData?.entries ?? [];
  const filteredEntries = rawEntries.filter((entry) => {
    if (entryTypeFilter !== 'ALL' && entry.entryType !== entryTypeFilter) {
      return false;
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchDesc = entry.description?.toLowerCase().includes(term);
      const matchRef = entry.referenceId?.toLowerCase().includes(term);
      const matchAmt = entry.amount.toString().includes(term);
      return matchDesc || matchRef || matchAmt;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Wallet className="w-6 h-6 text-primary-red" />
            Agent Wallet & Ledger
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Authoritative pre-funded balance, automated Net Fare debit, and double-entry transaction statement.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetchWallet();
              refetchStatement();
            }}
            disabled={isWalletFetching}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isWalletFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            variant="primary"
            onClick={() => {
              setTopupResult(null);
              setIsTopupOpen(true);
            }}
            className="flex items-center gap-2 shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            Top-up Wallet
          </Button>
        </div>
      </div>

      {/* Financial KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cash Balance */}
        <Card className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-red to-primary-gold" />
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Cash Balance
              </span>
              <Badge variant={wallet?.isFrozen ? 'error' : 'success'} size="sm">
                {wallet?.isFrozen ? 'Frozen' : 'Active'}
              </Badge>
            </div>
            <CardTitle className="text-3xl font-extrabold text-neutral-900 dark:text-neutral-100 mt-1">
              {isWalletLoading ? (
                <Skeleton className="h-9 w-32" />
              ) : (
                formatCurrency(cashBalance)
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Debited at time of GDS booking at discounted Net Fare rate
            </p>
          </CardContent>
        </Card>

        {/* Total Available Limit */}
        <Card className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Total Available Limit
              </span>
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <CardTitle className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
              {isWalletLoading ? (
                <Skeleton className="h-9 w-32" />
              ) : (
                formatCurrency(availableBalance)
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Cash balance + unused credit allocation
            </p>
          </CardContent>
        </Card>

        {/* Credit Facility */}
        <Card className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Credit Limit
              </span>
              <CreditCard className="w-4 h-4 text-neutral-400" />
            </div>
            <CardTitle className="text-3xl font-extrabold text-neutral-900 dark:text-neutral-100 mt-1">
              {isWalletLoading ? (
                <Skeleton className="h-9 w-28" />
              ) : (
                formatCurrency(creditLimit)
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
              <span>Used: {formatCurrency(creditUsed)}</span>
              <span>Available: {formatCurrency(Math.max(0, creditLimit - creditUsed))}</span>
            </div>
          </CardContent>
        </Card>

        {/* Historical Topups */}
        <Card className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Total Top-ups
              </span>
              <Building className="w-4 h-4 text-neutral-400" />
            </div>
            <CardTitle className="text-3xl font-extrabold text-neutral-900 dark:text-neutral-100 mt-1">
              {isWalletLoading ? (
                <Skeleton className="h-9 w-28" />
              ) : (
                formatCurrency(Number(wallet?.totalTopups ?? 0))
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Lifetime deposits credited via PhonePe & UPI
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Safety Notice */}
      <div className="bg-primary-softRed/40 border border-primary-red/20 rounded-xl p-4 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-primary-red shrink-0 mt-0.5" />
        <div className="text-sm">
          <span className="font-semibold text-neutral-900 dark:text-neutral-100">
            Instant B2B Ticketing Guarantee:
          </span>{' '}
          <span className="text-neutral-600 dark:text-neutral-300">
            Maintain adequate wallet balance to lock seats and issue GDS bus tickets without payment gateway latency.
            Commissions are retained upfront via Net Fare billing.
          </span>
        </div>
      </div>

      {/* Statement & Ledger Section */}
      <Card className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
        <CardHeader className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                Wallet Statement & Ledger
              </CardTitle>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Authoritative double-entry ledger audit log for debits, top-ups, and commission adjustments.
              </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-48 sm:w-60">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                <Input
                  placeholder="Search ledger..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-9 text-xs"
                />
              </div>

              <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg">
                {(['ALL', 'CREDIT', 'DEBIT'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setEntryTypeFilter(t)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                      entryTypeFilter === t
                        ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-xs'
                        : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                    }`}
                  >
                    {t === 'ALL' ? 'All' : t === 'CREDIT' ? 'Credits (+)' : 'Debits (-)'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isStatementLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-3">
                <Wallet className="w-6 h-6 text-neutral-400" />
              </div>
              <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                No ledger transactions found
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm mx-auto">
                {searchTerm
                  ? 'No entries match your search query.'
                  : 'Your ledger entries will appear here once you top up or issue bus tickets.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-600 dark:text-neutral-400 text-xs uppercase font-semibold border-b border-neutral-200 dark:border-neutral-800">
                  <tr>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Account</th>
                    <th className="px-4 py-3">Description / Ref</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3 text-right">Balance After</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {filteredEntries.map((entry) => {
                    const isCredit = entry.entryType === 'CREDIT';
                    return (
                      <tr
                        key={entry.id}
                        className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50 transition-colors"
                      >
                        <td className="px-4 py-3 text-xs text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
                          {formatDateTime(entry.postedAt)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${
                              isCredit
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                                : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                            }`}
                          >
                            {isCredit ? (
                              <ArrowDownLeft className="w-3 h-3" />
                            ) : (
                              <ArrowUpRight className="w-3 h-3" />
                            )}
                            {entry.entryType}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs font-medium text-neutral-700 dark:text-neutral-300">
                          {(entry.accountType || entry.type || 'TRANSACTION').replace(/_/g, ' ')}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs font-medium text-neutral-900 dark:text-neutral-100">
                            {entry.description}
                          </div>
                          {entry.referenceId && (
                            <div className="text-[11px] font-mono text-neutral-400 mt-0.5">
                              Ref: {entry.referenceId}
                            </div>
                          )}
                        </td>
                        <td
                          className={`px-4 py-3 text-right font-mono font-bold text-xs whitespace-nowrap ${
                            isCredit
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}
                        >
                          {isCredit ? '+' : '-'}
                          {formatCurrency(Number(entry.amount))}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-xs text-neutral-700 dark:text-neutral-300 whitespace-nowrap">
                          {formatCurrency(Number(entry.balanceAfter))}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {statementData && statementData.pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-200 dark:border-neutral-800 text-xs">
              <span className="text-neutral-500">
                Page {statementData.page} of {statementData.pages} ({statementData.total} entries)
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
                  onClick={() => setPage((p) => Math.min(statementData.pages, p + 1))}
                  disabled={page >= statementData.pages}
                  className="h-8 px-2"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top-up Modal */}
      <Dialog open={isTopupOpen} onOpenChange={setIsTopupOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-primary-red" />
              Top-up Agent Wallet
            </DialogTitle>
          </DialogHeader>

          {!topupResult ? (
            <div className="space-y-4 py-2">
              <p className="text-xs text-neutral-500">
                Select or enter an amount to credit to your agent cash balance via secure payment gateway.
              </p>

              {/* Presets */}
              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2 block">
                  Quick Amount Presets
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {PRESET_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setTopupAmount(amt);
                        setCustomAmountStr(amt.toString());
                      }}
                      className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all ${
                        topupAmount === amt
                          ? 'border-primary-red bg-primary-softRed/50 text-primary-darkRed'
                          : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-400'
                      }`}
                    >
                      ₹{amt.toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Input */}
              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1 block">
                  Custom Amount (₹100 - ₹5,00,000)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-neutral-400 font-bold">₹</span>
                  <Input
                    type="number"
                    min={100}
                    max={500000}
                    value={customAmountStr}
                    onChange={(e) => {
                      setCustomAmountStr(e.target.value);
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val)) setTopupAmount(val);
                    }}
                    className="pl-8"
                  />
                </div>
              </div>

              {/* Gateway selector */}
              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1 block">
                  Payment Gateway
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs font-medium">
                  {[
                    { id: 'AUTO', name: 'Smart Router' },
                    { id: 'PHONEPE', name: 'PhonePe UPI' },
                    { id: 'RAZORPAY', name: 'Razorpay' },
                  ].map((gw) => (
                    <button
                      key={gw.id}
                      type="button"
                      onClick={() => setGateway(gw.id as 'AUTO' | 'PHONEPE' | 'RAZORPAY')}
                      className={`p-2 rounded-lg border text-center transition-all ${
                        gateway === gw.id
                          ? 'border-primary-red bg-primary-softRed/30 text-primary-darkRed font-bold'
                          : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-400'
                      }`}
                    >
                      {gw.name}
                    </button>
                  ))}
                </div>
              </div>

              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={() => setIsTopupOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleStartTopup}
                  disabled={initiateMutation.isPending || topupAmount < 100}
                >
                  {initiateMutation.isPending ? 'Initiating...' : `Proceed to Pay ₹${topupAmount}`}
                </Button>
              </DialogFooter>
            </div>
          ) : (
            /* Order Initiated Confirmation / Completion Step */
            <div className="space-y-4 py-2">
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
                <h4 className="font-bold text-sm text-emerald-900 dark:text-emerald-200">
                  Payment Order Created
                </h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1 font-mono">
                  Txn ID: {topupResult.merchantTxnId}
                </p>
                <div className="text-2xl font-extrabold text-neutral-900 dark:text-neutral-100 mt-2">
                  ₹{topupAmount.toLocaleString('en-IN')}
                </div>
              </div>

              {topupResult.checkoutUrl && (
                <a
                  href={topupResult.checkoutUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-2.5 px-4 text-center rounded-lg bg-primary-red hover:bg-primary-darkRed text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <span>Open Gateway Checkout</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}

              {/* Developer / Sandbox instant confirmation */}
              <div className="p-3 bg-neutral-100 dark:bg-neutral-800/80 rounded-lg text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-semibold text-neutral-700 dark:text-neutral-300">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <span>Sandbox Verification & Webhook Callback</span>
                </div>
                <p className="text-[11px] text-neutral-500">
                  Click below to confirm receipt and credit your agent ledger immediately.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    confirmMutation.mutate({
                      merchantTxnId: topupResult.merchantTxnId,
                      gatewayPaymentId: `gtw_${Date.now()}`,
                    })
                  }
                  disabled={confirmMutation.isPending}
                  className="w-full text-xs font-semibold bg-white dark:bg-neutral-900 border-emerald-600 text-emerald-700 dark:text-emerald-400"
                >
                  {confirmMutation.isPending ? 'Verifying with Ledger...' : 'Verify & Credit Wallet Now'}
                </Button>
              </div>

              <DialogFooter className="mt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsTopupOpen(false);
                    setTopupResult(null);
                  }}
                >
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
