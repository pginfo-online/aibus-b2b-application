"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  X,
  Calendar,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  Wallet,
  CreditCard,
  FileText,
  Loader2,
  Armchair,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";
import { toast } from "@/store/toast-store";
import { useAuthStore } from "@/store/auth-store";
import type {
  BoardingPoint,
  DroppingPoint,
  SeatLayoutItem,
  BookingRecord,
  HoldSeatsPayload,
  HoldSeatsResponse,
  CreateBookingPayload,
  CancellationPolicyRule,
} from "@/types/api";

interface BookingSummaryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  bus: {
    RouteBusId: number;
    CompanyName: string;
    BusTypeName: string;
    TripId?: string;
    TotalFare: number;
    BaseFare: number;
    CancellationPolicy?: CancellationPolicyRule[];
  };
  journeyDate: string;
  fromCityName: string;
  toCityName: string;
  fromCityId: number;
  toCityId: number;
  selectedSeats: SeatLayoutItem[];
  selectedBoarding: BoardingPoint | null;
  selectedDropping: DroppingPoint | null;
  contactPhone: string;
  contactEmail: string;
  passengers: Record<string, { name: string; age: number; gender: "M" | "F" }>;
  hasProtectionPlan?: boolean;
}

export function BookingSummaryDrawer({
  isOpen,
  onClose,
  bus,
  journeyDate,
  fromCityName,
  toCityName,
  fromCityId,
  toCityId,
  selectedSeats,
  selectedBoarding,
  selectedDropping,
  contactPhone,
  contactEmail,
  passengers,
  hasProtectionPlan = false,
}: BookingSummaryDrawerProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { agent, user } = useAuthStore();

  const [paymentMethod, setPaymentMethod] = useState<"WALLET" | "GATEWAY">("WALLET");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStage, setSubmissionStage] = useState<string>("");
  const [confirmedBooking, setConfirmedBooking] = useState<BookingRecord | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  // Pricing calculations
  const totalGrossSeats = selectedSeats.reduce((sum, s) => sum + s.total_fare, 0);
  const totalBaseSeats = selectedSeats.reduce((sum, s) => sum + s.base_fare, 0);
  const protectionFee = hasProtectionPlan ? selectedSeats.length * 12 : 0;
  const totalCustomerAmount = totalGrossSeats + protectionFee;

  // Agent estimated commission (~6% default on base fare)
  const estimatedCommission = Math.round((totalBaseSeats * 6.0) / 100);
  const netAgentPayable = Math.max(0, totalCustomerAmount - estimatedCommission);

  const walletCashBalance = Number(agent?.wallet?.cashBalance ?? 0);
  const hasEnoughWalletBalance = walletCashBalance >= netAgentPayable;

  const serviceNumber = `Service Number - ${journeyDate.replace(/-/g, "")}${bus.RouteBusId}603`;

  // Handle Confirmed Payment & Ticketing Execution
  const handleProceedToPay = async () => {
    if (selectedSeats.length === 0) {
      toast.warning("Please select at least 1 seat.");
      return;
    }
    if (!selectedBoarding || !selectedDropping) {
      toast.warning("Please choose both boarding and dropping points.");
      return;
    }

    // Validate passenger inputs
    for (const seat of selectedSeats) {
      const p = passengers[seat.seat_no];
      if (!p || !p.name.trim()) {
        toast.warning(`Please enter passenger name for Seat ${seat.seat_no}.`);
        return;
      }
    }

    if (!contactPhone || contactPhone.trim().length < 10) {
      toast.warning("Please provide a valid 10-digit mobile number.");
      return;
    }

    setIsSubmitting(true);
    setSubmissionStage("Securing seats with upstream operator...");

    try {
      // 1. Hold seats with upstream operator
      const holdPayload: HoldSeatsPayload = {
        busId: bus.RouteBusId,
        fromCityId,
        toCityId,
        journeyDate,
        pickupId: selectedBoarding.PickupCode,
        dropoffId: selectedDropping.DropoffCode,
        contactInfo: {
          customerName: passengers[selectedSeats[0].seat_no]?.name || user?.firstName || "Customer",
          email: contactEmail || user?.email || "booking@aibus.in",
          phone: contactPhone,
          mobile: contactPhone,
        },
        passengers: selectedSeats.map((s) => {
          const p = passengers[s.seat_no];
          return {
            seatNo: s.seat_no,
            seatTypeId: s.seat_type,
            fare: s.total_fare,
            gender: p?.gender || (s.seat_status === 3 ? "F" : "M"),
            age: p?.age || 28,
            name: p?.name || "Passenger",
            isAcSeat: s.seat_type === 1 || s.seat_type === 2,
          };
        }),
      };

      const holdRes = await api.post<HoldSeatsResponse>("/holds", holdPayload);
      if (!holdRes || !holdRes.holdId) {
        throw new Error("Unable to place temporary hold on selected seats.");
      }

      // 2. Create authoritative booking
      setSubmissionStage("Generating booking and computing agency net fare...");
      const bookingPayload: CreateBookingPayload = {
        holdId: String(holdRes.holdId),
        fromCityId,
        toCityId,
        fromCityName,
        toCityName,
        journeyDate,
        busId: bus.RouteBusId,
        tripId: bus.TripId || "TRIP-01",
        pickupCode: selectedBoarding.PickupCode,
        pickupLocation: selectedBoarding.PickupName,
        pickupTime: selectedBoarding.PickupTime,
        dropoffCode: selectedDropping.DropoffCode,
        dropoffLocation: selectedDropping.DropoffName,
        dropoffTime: selectedDropping.DropoffTime,
        operatorName: bus.CompanyName,
        busType: bus.BusTypeName,
        totalFare: totalCustomerAmount,
        baseFare: totalBaseSeats,
        serviceTax: Math.max(0, totalGrossSeats - totalBaseSeats),
        contactName: passengers[selectedSeats[0].seat_no]?.name || "Customer",
        contactEmail,
        contactPhone,
        passengers: holdPayload.passengers,
        cancellationPolicy: bus.CancellationPolicy,
      };

      const createdBooking = await api.post<BookingRecord>("/bookings", bookingPayload);

      // 3. Process payment
      if (paymentMethod === "WALLET") {
        setSubmissionStage("Confirming net settlement from Agency Wallet...");
        const walletResult = await api.post<{
          booking: BookingRecord;
          success: boolean;
        }>("/payments/wallet-pay", {
          bookingId: createdBooking.id,
        });

        queryClient.invalidateQueries({ queryKey: ["agent"] });
        queryClient.invalidateQueries({ queryKey: ["search"] });

        toast.success("Ticket confirmed! Authoritative PNR issued.");
        setConfirmedBooking(walletResult.booking || createdBooking);
      } else {
        setSubmissionStage("Redirecting to secured payment gateway...");
        const intentRes = await api.post<{
          paymentUrl?: string;
          redirectUrl?: string;
          merchantTxnId: string;
        }>("/payments/intent", {
          bookingId: createdBooking.id,
          amount: totalCustomerAmount,
          paymentMode: "ALL",
        });

        const checkoutUrl = intentRes.paymentUrl || intentRes.redirectUrl;
        if (checkoutUrl) {
          window.location.assign(checkoutUrl);
        } else {
          router.push(`/portal/bookings?id=${createdBooking.id}`);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Booking could not be completed. Please try again.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
      setSubmissionStage("");
    }
  };

  // If Confirmed: Render Confirmed State in Drawer
  if (confirmedBooking) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-50 flex justify-end overflow-hidden"
      >
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" />
        <div className="relative z-10 flex h-full w-full max-w-lg flex-col bg-white shadow-2xl dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-300">
          <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800">
            <h2 className="text-lg font-black text-slate-900 dark:text-white">Ticket Issued</h2>
            <button
              onClick={() => {
                onClose();
                router.push("/portal/bookings");
              }}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                Booking Confirmed!
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Authoritative ticket and PNR generated with operator {bus.CompanyName}.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-left space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-bold uppercase">Booking ID</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {confirmedBooking.bookingNumber}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-bold uppercase">Operator PNR</span>
                <span className="font-mono font-bold text-[#D92D20] dark:text-red-400 text-sm">
                  {confirmedBooking.providerPnrNo || "ISSUED"}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-bold uppercase">Seats</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {selectedSeats.map((s) => s.seat_no).join(", ")}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-bold uppercase">Amount Debited</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(netAgentPayable)}
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-4">
              <button
                type="button"
                onClick={() => router.push(`/portal/bookings?id=${confirmedBooking.id}`)}
                className="w-full h-12 rounded-xl bg-[#D92D20] hover:bg-[#c2281c] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all"
              >
                <FileText className="h-4 w-4" />
                <span>View Ticket & Manifest</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  window.location.reload();
                }}
                className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors"
              >
                Book Another Trip
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex justify-end overflow-hidden"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={() => {
          if (!isSubmitting) onClose();
        }}
        aria-hidden="true"
      />

      {/* Drawer Container matching ref-5.png */}
      <div className="relative z-10 flex h-full w-full max-w-lg flex-col bg-white shadow-2xl dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800">
          <h2 className="text-lg font-black text-slate-900 dark:text-white">Booking Summary</h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close summary"
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body Content matching ref-5.png */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Operator and Journey Date Badge */}
          <div className="space-y-1.5 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                {bus.CompanyName}
              </h3>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <Calendar className="h-3.5 w-3.5 text-slate-500" />
                <span>{journeyDate}</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {bus.BusTypeName}
            </p>
            <p className="text-[11px] text-slate-400 font-mono tracking-tight">{serviceNumber}</p>
          </div>

          {/* Boarding and Dropping Timeline matching ref-5 */}
          <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-red-200 dark:before:bg-red-950">
            {/* Boarding stop */}
            <div className="relative">
              <div className="absolute -left-6 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#EB5757] dark:border-slate-900 shadow-xs" />
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {selectedBoarding?.PickupName || "Selected Boarding Point"}, {fromCityName}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedBoarding?.PickupTime} | {selectedBoarding?.PickupName}
                </p>
              </div>
            </div>

            {/* Dropping stop */}
            <div className="relative">
              <div className="absolute -left-6 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#EB5757] dark:border-slate-900 shadow-xs" />
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {selectedDropping?.DropoffName || "Selected Dropping Point"}, {toCityName}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedDropping?.DropoffTime} | {selectedDropping?.DropoffName}
                </p>
              </div>
            </div>
          </div>

          {/* Passenger & Contact Details */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Passenger Details
            </h4>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                <span>+91 {contactPhone}</span>
              </div>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <div className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                <span className="truncate max-w-[200px]">{contactEmail}</span>
              </div>
            </div>

            {/* Passenger Roster */}
            <div className="space-y-2 pt-1">
              {selectedSeats.map((seat) => {
                const p = passengers[seat.seat_no];
                return (
                  <div
                    key={seat.seat_no}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded-md bg-red-100 text-[#D92D20] font-bold text-[11px] dark:bg-red-950 dark:text-red-400">
                        Seat {seat.seat_no}
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {p?.name || "Passenger"}
                      </span>
                    </div>
                    <span className="text-slate-500 dark:text-slate-400">
                      {p?.gender === "F" ? "Female" : "Male"}, {p?.age || 28} yrs
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Seats Booked Tag */}
          <div className="space-y-1.5 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Seats Booked
            </h4>
            <div className="flex items-center gap-2">
              <Armchair className="h-4 w-4 text-[#D92D20]" />
              <span className="text-sm font-black text-slate-900 dark:text-white">
                {selectedSeats.map((s) => s.seat_no).join(", ")}
              </span>
            </div>
          </div>

          {/* Fare Details Card matching ref-5.png */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Fare Details
            </h4>

            <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Seat Base Fare</span>
                <span className="font-mono">{formatCurrency(totalBaseSeats)}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes & GST</span>
                <span className="font-mono">{formatCurrency(totalGrossSeats - totalBaseSeats)}</span>
              </div>
              {hasProtectionPlan && (
                <div className="flex justify-between text-slate-700 dark:text-slate-300">
                  <span>Travel Protection</span>
                  <span className="font-mono">{formatCurrency(protectionFee)}</span>
                </div>
              )}
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                <span>Agency Commission Deduction</span>
                <span className="font-mono">- {formatCurrency(estimatedCommission)}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                Amount to be collected
              </span>
              <span className="text-xl font-black text-slate-900 dark:text-white font-mono">
                {formatCurrency(totalCustomerAmount)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Net Agency Debit:</span>
              <span className="font-mono font-bold text-[#D92D20] dark:text-red-400">
                {formatCurrency(netAgentPayable)}
              </span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Payment Settlement
            </h4>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod("WALLET")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  paymentMethod === "WALLET"
                    ? "border-[#D92D20] bg-red-50/50 dark:bg-red-950/20 text-[#D92D20] dark:text-red-400 font-bold ring-1 ring-[#D92D20]"
                    : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Wallet className="h-4 w-4" />
                  <span className="text-xs">Agency Wallet</span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                  Bal: {formatCurrency(walletCashBalance)}
                </p>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("GATEWAY")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  paymentMethod === "GATEWAY"
                    ? "border-[#D92D20] bg-red-50/50 dark:bg-red-950/20 text-[#D92D20] dark:text-red-400 font-bold ring-1 ring-[#D92D20]"
                    : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <CreditCard className="h-4 w-4" />
                  <span className="text-xs">Pay Online</span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                  UPI / Cards / Net Banking
                </p>
              </button>
            </div>

            {paymentMethod === "WALLET" && !hasEnoughWalletBalance && (
              <p className="text-[11px] text-red-600 dark:text-red-400 flex items-center gap-1 pt-1 font-medium">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>Insufficient wallet balance. Please choose Pay Online or top up.</span>
              </p>
            )}
          </div>
        </div>

        {/* Sticky Proceed to Pay Bottom Action matching ref-5.png */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
          {isSubmitting && (
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#D92D20] dark:text-red-400 animate-pulse">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{submissionStage || "Processing..."}</span>
            </div>
          )}

          <button
            type="button"
            disabled={isSubmitting || (paymentMethod === "WALLET" && !hasEnoughWalletBalance)}
            onClick={handleProceedToPay}
            className="w-full h-12 rounded-xl bg-[#EB5757] hover:bg-[#D92D20] active:bg-[#c2281c] text-white font-black text-base shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <span>Proceed to Pay</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
