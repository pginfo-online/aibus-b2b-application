"use client";

import React, { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import { useBookingStore } from "@/store/booking-store";
import { ChevronDown, Wallet, ShieldCheck, CreditCard, AlertCircle } from "lucide-react";
import type { BusSearchResult } from "@/types/api";

interface PriceBreakupSummaryProps {
  bus?: BusSearchResult;
  onConfirmBooking: (paymentMethod: "WALLET" | "GATEWAY") => void;
  isLoading: boolean;
}

export function PriceBreakupSummary({
  onConfirmBooking,
  isLoading,
}: PriceBreakupSummaryProps) {
  const { selectedSeats, selectedBoarding, selectedDropping } = useBookingStore();
  const { agent } = useAuthStore();
  const [breakupExpanded, setBreakupExpanded] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<"WALLET" | "GATEWAY">("WALLET");

  // Exact calculations
  const totalGrossFare = selectedSeats.reduce((sum, s) => sum + s.total_fare, 0);
  const totalBaseFare = selectedSeats.reduce((sum, s) => sum + s.base_fare, 0);
  const totalTax = Math.max(0, totalGrossFare - totalBaseFare);

  // Approximate agent commission snapshot for display (authoritative calculation done on server)
  // Backend default is typically ~6% to 10%
  const estimatedCommissionRate = 6.0;
  const estimatedCommission = Math.round((totalBaseFare * estimatedCommissionRate) / 100);
  const netPayableFare = Math.max(0, totalGrossFare - estimatedCommission);

  const walletBalance = Number(agent?.wallet?.cashBalance ?? 0);
  const hasEnoughWalletBalance = walletBalance >= netPayableFare;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-5 sticky top-20">
      <div>
        <h3 className="text-base font-black text-slate-900 dark:text-white">
          Fare & Payment Summary
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {selectedSeats.length} Seats: {selectedSeats.map((s) => s.seat_no).join(", ")}
        </p>
      </div>

      {/* Primary Payable Figures */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
          <span>Gross Customer Fare</span>
          <span className="font-mono font-bold text-slate-900 dark:text-white">
            {formatCurrency(totalGrossFare)}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-medium">
          <span>B2B Commission Deduction (~6%)</span>
          <span className="font-mono font-bold">
            - {formatCurrency(estimatedCommission)}
          </span>
        </div>

        <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <span className="text-sm font-black text-slate-900 dark:text-white">
            Net Agent Payable
          </span>
          <span className="text-xl font-black text-[#D92D20] dark:text-red-400 font-mono">
            {formatCurrency(netPayableFare)}
          </span>
        </div>
      </div>

      {/* Expandable detailed tax breakup */}
      <div>
        <button
          type="button"
          onClick={() => setBreakupExpanded(!breakupExpanded)}
          className="flex items-center justify-between w-full text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <span>Detailed Fare Breakdown</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${breakupExpanded ? "rotate-180" : ""}`}
          />
        </button>

        {breakupExpanded && (
          <div className="mt-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 space-y-1.5 text-xs text-slate-600 dark:text-slate-300 animate-in fade-in duration-150">
            <div className="flex justify-between">
              <span>Base Seat Fare</span>
              <span className="font-mono">{formatCurrency(totalBaseFare)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST & Service Taxes</span>
              <span className="font-mono">{formatCurrency(totalTax)}</span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-700">
              <span>Operator Standard Rate</span>
              <span>Direct GDS rate</span>
            </div>
          </div>
        )}
      </div>

      {/* Payment Method Selector */}
      <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Payment Method
        </label>

        {/* Option 1: Agent Wallet */}
        <div
          onClick={() => setSelectedMethod("WALLET")}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            selectedMethod === "WALLET"
              ? "border-[#D92D20] bg-red-50/40 dark:bg-red-950/20 ring-1 ring-[#D92D20]"
              : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                <Wallet className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Agency Wallet (Instant)
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Balance: {formatCurrency(walletBalance)}
                </p>
              </div>
            </div>
            <span
              className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                selectedMethod === "WALLET" ? "border-[#D92D20] bg-[#D92D20]" : "border-slate-300"
              }`}
            >
              {selectedMethod === "WALLET" && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
            </span>
          </div>

          {!hasEnoughWalletBalance && selectedMethod === "WALLET" && (
            <p className="text-[11px] text-red-600 dark:text-red-400 mt-2 font-medium flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              Insufficient wallet balance. Please top up or pay via Gateway.
            </p>
          )}
        </div>

        {/* Option 2: Payment Gateway (PhonePe / Razorpay) */}
        <div
          onClick={() => setSelectedMethod("GATEWAY")}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            selectedMethod === "GATEWAY"
              ? "border-[#D92D20] bg-red-50/40 dark:bg-red-950/20 ring-1 ring-[#D92D20]"
              : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-400">
                <CreditCard className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Payment Gateway (UPI / Cards)
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Instant verification via PhonePe Gateway
                </p>
              </div>
            </div>
            <span
              className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                selectedMethod === "GATEWAY" ? "border-[#D92D20] bg-[#D92D20]" : "border-slate-300"
              }`}
            >
              {selectedMethod === "GATEWAY" && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
            </span>
          </div>
        </div>
      </div>

      {/* Confirm & Book CTA */}
      <Button
        type="button"
        variant="primary"
        size="lg"
        isLoading={isLoading}
        disabled={
          selectedSeats.length === 0 ||
          !selectedBoarding ||
          !selectedDropping ||
          (selectedMethod === "WALLET" && !hasEnoughWalletBalance)
        }
        onClick={() => onConfirmBooking(selectedMethod)}
        className="w-full h-12 text-sm font-extrabold shadow-md shadow-red-600/20"
      >
        {selectedMethod === "WALLET"
          ? `Pay ${formatCurrency(netPayableFare)} & Confirm Ticket`
          : `Proceed to Payment Gateway`}
      </Button>

      <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 text-center">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
        <span>PCI-DSS Secured Transaction • Instant PNR Generation</span>
      </div>
    </div>
  );
}
