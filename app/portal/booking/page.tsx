"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  AlertCircle,
  Bus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SeatMap } from "@/components/booking/seat-map";
import { BoardingDroppingStep } from "@/components/booking/boarding-dropping-step";
import { PassengerFormStep } from "@/components/booking/passenger-form-step";
import { PriceBreakupSummary } from "@/components/booking/price-breakup-summary";
import { HoldTimer } from "@/components/booking/hold-timer";
import { api } from "@/lib/api-client";
import { useBookingStore } from "@/store/booking-store";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "@/store/toast-store";
import { formatDate, formatCurrency } from "@/lib/utils";
import type { BookingRecord, CreateBookingPayload, HoldSeatsPayload, HoldSeatsResponse, SeatChartResponse } from "@/types/api";

function BookingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const {
    selectedBus,
    selectedSeats,
    selectedBoarding,
    selectedDropping,
    passengers,
    contactInfo,
    activeHold,
    setActiveHold,
    resetBookingJourney,
  } = useBookingStore();

  const busId = Number(searchParams.get("busId") || selectedBus?.RouteBusId || 1);
  const fromCityId = Number(searchParams.get("fromCityId") || 101);
  const toCityId = Number(searchParams.get("toCityId") || 102);
  const journeyDate = searchParams.get("journeyDate") || new Date().toISOString().slice(0, 10);

  // Stepper state for narrow/mobile screens or step navigation
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [confirmedBooking, setConfirmedBooking] = useState<BookingRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Fetch live seat chart from /api/v1/seats/:busId/chart
  const {
    data: chartData,
    isLoading: isChartLoading,
    isError: isChartError,
    error: chartError,
    refetch: refetchChart,
  } = useQuery({
    queryKey: ["chart", busId, fromCityId, toCityId, journeyDate],
    queryFn: async () => {
      const res = await api.get<SeatChartResponse>(`/seats/${busId}/chart`, {
        params: {
          fromCityId,
          toCityId,
          journeyDate,
        },
      });
      return res;
    },
    staleTime: 60 * 1000,
  });

  const busName = chartData?.CompanyName || selectedBus?.CompanyName || "Luxury Bus Service";

  // Pre-fill contact email / name from logged in user if empty
  React.useEffect(() => {
    if (user && (!contactInfo.customerName || !contactInfo.email)) {
      const timer = setTimeout(() => {
        useBookingStore.getState().setContactInfo({
          customerName: contactInfo.customerName || `${user.firstName} ${user.lastName}`.trim(),
          email: contactInfo.email || user.email,
          phone: contactInfo.phone || user.phone || "9876543210",
        });
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [user, contactInfo]);

  // Handle Hold & Booking Flow
  const handleConfirmBooking = async (paymentMethod: "WALLET" | "GATEWAY") => {
    if (selectedSeats.length === 0) {
      toast.warning("Please select at least 1 seat.");
      return;
    }
    if (!selectedBoarding || !selectedDropping) {
      toast.warning("Please select both a Boarding Point and a Dropping Point.");
      setCurrentStep(2);
      return;
    }

    // Validate passenger names
    for (const seat of selectedSeats) {
      const p = passengers[seat.seat_no];
      if (!p || !p.name.trim()) {
        toast.warning(`Please enter passenger name for Seat ${seat.seat_no}.`);
        setCurrentStep(3);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // 1. Acquire Seat Hold from /api/v1/holds
      const holdPayload: HoldSeatsPayload = {
        busId,
        fromCityId,
        toCityId,
        journeyDate,
        pickupId: selectedBoarding.PickupCode,
        dropoffId: selectedDropping.DropoffCode,
        contactInfo: {
          customerName: contactInfo.customerName || "Agent Customer",
          email: contactInfo.email || "booking@aibus.in",
          phone: contactInfo.phone || "9876543210",
          mobile: contactInfo.phone || "9876543210",
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
        throw new Error("Failed to lock seats with upstream operator.");
      }

      setActiveHold({
        holdId: String(holdRes.holdId),
        providerHoldId: holdRes.providerHoldId,
        expiresAt: holdRes.expiresAt,
        totalFare: holdRes.totalFare,
      });

      // 2. Create Booking record in backend /api/v1/bookings
      const totalGross = selectedSeats.reduce((sum, s) => sum + s.total_fare, 0);
      const totalBase = selectedSeats.reduce((sum, s) => sum + s.base_fare, 0);

      const bookingPayload: CreateBookingPayload = {
        holdId: String(holdRes.holdId),
        fromCityId,
        toCityId,
        fromCityName: searchParams.get("fromCityName") || "Bengaluru",
        toCityName: searchParams.get("toCityName") || "Chennai",
        journeyDate,
        busId,
        tripId: selectedBus?.TripId || "TRIP-01",
        pickupCode: selectedBoarding.PickupCode,
        pickupLocation: selectedBoarding.PickupName,
        pickupTime: selectedBoarding.PickupTime,
        dropoffCode: selectedDropping.DropoffCode,
        dropoffLocation: selectedDropping.DropoffName,
        dropoffTime: selectedDropping.DropoffTime,
        operatorName: busName,
        busType: chartData?.BusTypeName || selectedBus?.BusTypeName || "AC Sleeper",
        totalFare: totalGross,
        baseFare: totalBase,
        serviceTax: Math.max(0, totalGross - totalBase),
        contactName: contactInfo.customerName,
        contactEmail: contactInfo.email,
        contactPhone: contactInfo.phone,
        passengers: holdPayload.passengers,
        cancellationPolicy: chartData?.CancellationPolicy,
      };

      const createdBooking = await api.post<BookingRecord>("/bookings", bookingPayload);

      // 3. Process Payment
      if (paymentMethod === "WALLET") {
        // Direct agent wallet debit
        const walletResult = await api.post<{
          booking: BookingRecord;
          success: boolean;
        }>("/payments/wallet-pay", {
          bookingId: createdBooking.id,
        });

        // Invalidate wallet and bookings cache
        queryClient.invalidateQueries({ queryKey: ["agent"] });

        toast.success("Ticket confirmed! Payment debited from Agency Wallet.");
        setConfirmedBooking(walletResult.booking || createdBooking);
        resetBookingJourney();
      } else {
        // Initiate Gateway Intent
        const intentRes = await api.post<{
          paymentUrl?: string;
          redirectUrl?: string;
          merchantTxnId: string;
        }>("/payments/intent", {
          bookingId: createdBooking.id,
          amount: totalGross,
          paymentMode: "ALL",
        });

        const checkoutUrl = intentRes.paymentUrl || intentRes.redirectUrl;
        if (checkoutUrl) {
          window.location.assign(checkoutUrl);
        } else {
          toast.success("Booking placed. Please verify payment.");
          router.push(`/portal/bookings?id=${createdBooking.id}`);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to finalize booking. Please try again.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // If booking confirmed: Render Confirmed Ticket View
  if (confirmedBooking) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 py-4 animate-in fade-in duration-300">
        <div className="p-8 rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-white dark:bg-slate-900 text-center space-y-4 shadow-sm">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              Booking Confirmed Successfully!
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              An authoritative ticket has been issued with the bus operator.
            </p>
          </div>

          {/* Ticket Key Data Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-left">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Booking ID</span>
              <p className="font-mono font-bold text-sm text-slate-900 dark:text-white truncate">
                {confirmedBooking.bookingNumber}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Operator PNR</span>
              <p className="font-mono font-bold text-sm text-[#D92D20] dark:text-red-400 truncate">
                {confirmedBooking.providerPnrNo || "ISSUED"}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Travel Date</span>
              <p className="font-bold text-sm text-slate-900 dark:text-white">
                {formatDate(confirmedBooking.journeyDate, "short")}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Fare Paid</span>
              <p className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">
                {formatCurrency(confirmedBooking.totalFare)}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Link href={`/portal/bookings?id=${confirmedBooking.id}`}>
              <Button variant="primary" size="lg" className="w-full sm:w-auto font-bold">
                <FileText className="h-4 w-4 mr-2" />
                View Ticket & Passenger Manifest
              </Button>
            </Link>
            <Link href="/portal">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Book Another Bus
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href={`/portal/search?fromCityId=${fromCityId}&toCityId=${toCityId}&journeyDate=${journeyDate}`}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors"
            title="Back to search results"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              {busName}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {searchParams.get("fromCityName") || "Bengaluru"} →{" "}
              {searchParams.get("toCityName") || "Chennai"} • {formatDate(journeyDate, "full")}
            </p>
          </div>
        </div>

        {/* Hold Countdown if seats are locked */}
        {activeHold && (
          <HoldTimer
            expiresAt={activeHold.expiresAt}
            onExpire={() => {
              toast.error("Seat hold has expired. Please select your seats again.");
              refetchChart();
            }}
          />
        )}
      </div>

      {/* Stepper Navigation Pills */}
      <div className="flex items-center justify-between sm:justify-start gap-2 p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 max-w-md">
        <button
          type="button"
          onClick={() => setCurrentStep(1)}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
            currentStep === 1
              ? "bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <span className="h-4 w-4 rounded-full bg-[#D92D20] text-white flex items-center justify-center text-[10px]">
            1
          </span>
          <span>Seat Map</span>
        </button>

        <button
          type="button"
          onClick={() => setCurrentStep(2)}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
            currentStep === 2
              ? "bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <span className="h-4 w-4 rounded-full bg-[#D92D20] text-white flex items-center justify-center text-[10px]">
            2
          </span>
          <span>Boarding & Drop</span>
        </button>

        <button
          type="button"
          onClick={() => setCurrentStep(3)}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
            currentStep === 3
              ? "bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <span className="h-4 w-4 rounded-full bg-[#D92D20] text-white flex items-center justify-center text-[10px]">
            3
          </span>
          <span>Passengers</span>
        </button>
      </div>

      {/* Responsive Split View: Left Column (Steps) vs Right Column (Price Breakup) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Step */}
        <div className="lg:col-span-7 space-y-6">
          {isChartLoading ? (
            <div className="p-16 text-center space-y-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <Bus className="h-8 w-8 text-[#D92D20] animate-pulse mx-auto" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Fetching real-time seat inventory from operator GDS...
              </p>
            </div>
          ) : isChartError || !chartData ? (
            <div className="p-8 text-center rounded-2xl border border-red-200 bg-red-50 dark:border-red-950 dark:bg-red-950/30 space-y-3">
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
              <h3 className="font-bold text-sm text-red-900 dark:text-red-200">
                Seat layout unavailable for this bus
              </h3>
              <p className="text-xs text-red-700 dark:text-red-300">
                {chartError instanceof Error ? chartError.message : "Operator chart could not be loaded."}
              </p>
              <Button variant="primary" size="sm" onClick={() => refetchChart()}>
                Retry Chart
              </Button>
            </div>
          ) : (
            <>
              {currentStep === 1 && <SeatMap chart={chartData} />}

              {currentStep === 2 && (
                <BoardingDroppingStep
                  boardingPoints={chartData.BoardingPoints || []}
                  droppingPoints={chartData.DroppingPoints || []}
                  fromCityName={searchParams.get("fromCityName") || "Bengaluru"}
                  toCityName={searchParams.get("toCityName") || "Chennai"}
                />
              )}

              {currentStep === 3 && <PassengerFormStep />}

              {/* Navigation controls between steps */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
                {currentStep > 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep((prev) => (prev > 1 ? ((prev - 1) as 1 | 2 | 3) : 1))}
                  >
                    ← Previous Step
                  </Button>
                ) : <div />}

                {currentStep < 3 && (
                  <Button
                    type="button"
                    variant="primary"
                    disabled={selectedSeats.length === 0}
                    onClick={() => setCurrentStep((prev) => (prev < 3 ? ((prev + 1) as 1 | 2 | 3) : 3))}
                  >
                    Proceed to Next Step →
                  </Button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Right Column: Price Breakup and Authoritative Checkout */}
        <div className="lg:col-span-5">
          {chartData && (
            <PriceBreakupSummary
              bus={{
                RouteBusId: busId,
                CompanyId: 1,
                CompanyName: busName,
                BusTypeName: chartData.BusTypeName || "AC Sleeper",
                DepartureTime: chartData.DepartureTime || "21:00",
                ArrivalTime: chartData.ArrivalTime || "06:00",
                TripId: "TRIP-01",
                ChartCode: "CHART-01",
                TotalSeats: chartData.TotalSeats,
                AvailableSeats: chartData.AvailableSeats,
                BaseFare: chartData.Layout[0]?.base_fare || 800,
                TotalFare: chartData.Layout[0]?.total_fare || 900,
                ServiceTax: 50,
                IsAC: true,
                IsSleeper: true,
                BoardingPoints: chartData.BoardingPoints,
                DroppingPoints: chartData.DroppingPoints,
                CancellationPolicy: chartData.CancellationPolicy,
              }}
              isLoading={isSubmitting}
              onConfirmBooking={handleConfirmBooking}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-slate-400">
          Loading booking journey...
        </div>
      }
    >
      <BookingContent />
    </Suspense>
  );
}
