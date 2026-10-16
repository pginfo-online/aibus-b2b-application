"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Ticket,
  Search,
  Filter,
  Download,
  XCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/ui/badge";
import { api } from "@/lib/api-client";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
import { toast } from "@/store/toast-store";
import type { BookingRecord, CancellabilityCheckResult, CancelBookingResponse } from "@/types/api";

function BookingsListContent() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const initialBookingId = searchParams.get("id");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedBooking, setSelectedBooking] = useState<BookingRecord | null>(null);

  // Cancellation modal states
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancellationCheck, setCancellationCheck] = useState<CancellabilityCheckResult | null>(null);
  const [isCheckingCancel, setIsCheckingCancel] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // 1. Fetch bookings from /agents/reports/bookings
  const {
    data,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["agent", "bookings", statusFilter],
    queryFn: async () => {
      const res = await api.get<{ bookings: BookingRecord[]; total: number }>(
        "/agents/reports/bookings",
        {
          params: {
            limit: 50,
            status: statusFilter !== "ALL" ? statusFilter : undefined,
          },
        }
      );
      return res;
    },
  });

  const bookings = React.useMemo(() => data?.bookings || [], [data?.bookings]);

  // Auto open booking details if passed in query param
  React.useEffect(() => {
    if (initialBookingId && bookings.length > 0) {
      const found = bookings.find((b) => b.id === initialBookingId);
      if (found) {
        const timer = setTimeout(() => setSelectedBooking(found), 0);
        return () => clearTimeout(timer);
      }
    }
  }, [initialBookingId, bookings]);

  // Filter by search term
  const filteredBookings = bookings.filter((b) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase().trim();
    return (
      b.bookingNumber.toLowerCase().includes(term) ||
      (b.providerPnrNo && b.providerPnrNo.toLowerCase().includes(term)) ||
      b.contactName.toLowerCase().includes(term) ||
      b.fromCityName.toLowerCase().includes(term) ||
      b.toCityName.toLowerCase().includes(term) ||
      b.operatorName.toLowerCase().includes(term)
    );
  });

  // Check cancellability
  const handleCheckCancellation = async (b: BookingRecord) => {
    setIsCheckingCancel(true);
    setCancelModalOpen(true);
    setCancellationCheck(null);

    try {
      const result = await api.get<CancellabilityCheckResult>(`/cancellations/${b.id}/check`);
      setCancellationCheck(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to retrieve cancellation policy from operator.";
      toast.error(msg);
    } finally {
      setIsCheckingCancel(false);
    }
  };

  // Confirm cancellation
  const handleExecuteCancellation = async () => {
    if (!selectedBooking) return;
    setIsCancelling(true);

    try {
      const seatNos = selectedBooking.passengers.map((p) => p.seatNumber);
      const res = await api.post<CancelBookingResponse>(`/cancellations/${selectedBooking.id}`, {
        seatNos,
        reason: "Cancelled by agency via B2B portal",
      });

      toast.success(res.message || "Booking cancelled and refund credited to wallet!");
      setCancelModalOpen(false);
      setSelectedBooking(null);
      queryClient.invalidateQueries({ queryKey: ["agent"] });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Cancellation failed.";
      toast.error(msg);
    } finally {
      setIsCancelling(false);
    }
  };

  // Download PDF
  const handleDownloadPdf = async (bookingId: string) => {
    try {
      toast.info("Generating official ticket PDF...");
      await api.download(`/tickets/booking/${bookingId}/pdf`, `aibus-ticket-${bookingId}.pdf`);
      toast.success("Ticket PDF downloaded.");
    } catch {
      toast.error("Ticket PDF generation in progress. Please try again shortly.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Booking Details & Manifests
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Inspect confirmed tickets, passenger manifests, PDF vouchers, and cancellations
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
          Refresh List
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search by Booking #, PNR, Customer Name, or City..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            startIcon={<Search className="h-4 w-4" />}
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400 hidden sm:block" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#D92D20]"
          >
            <option value="ALL">All Statuses</option>
            <option value="CONFIRMED">Confirmed Only</option>
            <option value="HELD">Held / Pending</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-16 gap-3 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-[#D92D20]" />
            <p className="text-xs font-medium">Loading agency bookings from reports...</p>
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-xs text-red-500">
            Failed to load bookings. Please check your network and retry.
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <Ticket className="h-10 w-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              No matching bookings found
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Bookings created through the portal will appear here with live PNR, passenger manifests, and cancellation tools.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase tracking-wider font-bold text-slate-500 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Booking # / PNR</th>
                  <th className="py-3.5 px-4">Journey Route</th>
                  <th className="py-3.5 px-4">Travel Date</th>
                  <th className="py-3.5 px-4">Seats / Pax</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Total Fare</th>
                  <th className="py-3.5 px-4">Commission</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {filteredBookings.map((b) => (
                  <tr
                    key={b.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <p className="font-mono font-bold text-slate-900 dark:text-white">
                        {b.bookingNumber}
                      </p>
                      <p className="text-[11px] font-mono text-[#D92D20] dark:text-red-400">
                        PNR: {b.providerPnrNo || "ISSUING"}
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900 dark:text-white">
                        {b.fromCityName} → {b.toCityName}
                      </p>
                      <p className="text-[11px] text-slate-400">{b.operatorName}</p>
                    </td>

                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                      {formatDate(b.journeyDate, "short")}
                    </td>

                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                      {b.passengers?.length || 1} Seats (
                      {b.passengers?.map((p) => p.seatNumber).join(", ") || "1"})
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={b.status} />
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {formatCurrency(b.totalFare)}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(b.commissionSnapshot?.commissionAmt ?? 0)}
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedBooking(b)}
                        className="font-bold text-xs"
                      >
                        Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Booking Details Dialog Modal */}
      {selectedBooking && (
        <Dialog
          isOpen={!!selectedBooking}
          onClose={() => setSelectedBooking(null)}
          title={`Booking ${selectedBooking.bookingNumber}`}
          description={`${selectedBooking.fromCityName} to ${selectedBooking.toCityName}`}
          maxWidth="lg"
        >
          <div className="space-y-6">
            {/* Top Status Banner */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Booking Status</span>
                <div className="mt-0.5">
                  <StatusBadge status={selectedBooking.status} />
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Operator PNR</span>
                <p className="font-mono font-bold text-sm text-[#D92D20] dark:text-red-400">
                  {selectedBooking.providerPnrNo || "PENDING"}
                </p>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Total Fare</span>
                <p className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                  {formatCurrency(selectedBooking.totalFare)}
                </p>
              </div>
            </div>

            {/* Boarding and Journey Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                <p className="font-bold text-slate-500 uppercase text-[10px]">Boarding Point</p>
                <p className="font-bold text-slate-900 dark:text-white text-sm">
                  {selectedBooking.pickupLocation}
                </p>
                <p className="text-slate-500">Reporting: {formatTime(selectedBooking.pickupTime)}</p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                <p className="font-bold text-slate-500 uppercase text-[10px]">Dropping Point</p>
                <p className="font-bold text-slate-900 dark:text-white text-sm">
                  {selectedBooking.dropoffLocation}
                </p>
                <p className="text-slate-500">Arrival: {formatTime(selectedBooking.dropoffTime)}</p>
              </div>
            </div>

            {/* Passenger Manifest */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Passenger Manifest
              </h4>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden text-xs">
                {selectedBooking.passengers?.map((p, idx) => (
                  <div key={p.id || idx} className="flex items-center justify-between p-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-red-100 text-[#D92D20] font-mono font-bold">
                        Seat {p.seatNumber}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {p.passengerName}
                      </span>
                    </div>
                    <span className="text-slate-500">
                      {p.gender === "M" ? "Male" : "Female"}, Age {p.age}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions: Download PDF, Cancel Ticket */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="outline"
                size="md"
                onClick={() => handleDownloadPdf(selectedBooking.id)}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Ticket PDF
              </Button>

              {selectedBooking.status === "CONFIRMED" && (
                <Button
                  variant="danger"
                  size="md"
                  onClick={() => handleCheckCancellation(selectedBooking)}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel Ticket
                </Button>
              )}
            </div>
          </div>
        </Dialog>
      )}

      {/* Cancellation Confirmation Dialog */}
      {cancelModalOpen && (
        <Dialog
          isOpen={cancelModalOpen}
          onClose={() => setCancelModalOpen(false)}
          title="Confirm Ticket Cancellation"
          description="Review operator refund calculation before cancellation"
          maxWidth="md"
        >
          <div className="space-y-5">
            {isCheckingCancel ? (
              <div className="p-8 text-center space-y-2 text-slate-400">
                <Loader2 className="h-6 w-6 animate-spin text-[#D92D20] mx-auto" />
                <p className="text-xs">Fetching live cancellation terms from GDS...</p>
              </div>
            ) : cancellationCheck ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-300 text-xs">
                  <p className="font-bold text-sm">Operator Refund Assessment</p>
                  <p className="mt-1">
                    {cancellationCheck.Message ||
                      "Refund will be credited directly to your agency wallet immediately."}
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span>Original Ticket Fare</span>
                    <span className="font-mono font-bold">
                      {formatCurrency(cancellationCheck.TotalFare || selectedBooking?.totalFare)}
                    </span>
                  </div>
                  <div className="flex justify-between text-red-600 dark:text-red-400">
                    <span>Operator Cancellation Fee</span>
                    <span className="font-mono font-bold">
                      - {formatCurrency(cancellationCheck.CancellationCharge || cancellationCheck.ChargeAmt || 0)}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between font-bold text-sm text-emerald-600 dark:text-emerald-400">
                    <span>Refundable Amount to Wallet</span>
                    <span className="font-mono text-base">
                      {formatCurrency(cancellationCheck.RefundAmount)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="outline" onClick={() => setCancelModalOpen(false)}>
                    Go Back
                  </Button>
                  <Button
                    variant="danger"
                    isLoading={isCancelling}
                    onClick={handleExecuteCancellation}
                  >
                    Confirm Cancellation
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-red-500">
                Unable to retrieve cancellation terms.
              </div>
            )}
          </div>
        </Dialog>
      )}
    </div>
  );
}

export default function BookingsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-400">Loading bookings...</div>}>
      <BookingsListContent />
    </Suspense>
  );
}
