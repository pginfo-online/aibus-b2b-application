"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Disc3,
  Loader2,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Phone,
  Mail,
  User,
  Shield,
  Info,
  Armchair,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "@/store/toast-store";
import type {
  BusSearchResult,
  SeatChartResponse,
  SeatLayoutItem,
  BoardingPoint,
  DroppingPoint,
} from "@/types/api";

interface InlineSeatSelectionProps {
  bus: BusSearchResult;
  fromCityId: number;
  toCityId: number;
  fromCityName: string;
  toCityName: string;
  journeyDate: string;
  duration?: string;
  onOpenBookingSummary: (bookingData: {
    selectedSeats: SeatLayoutItem[];
    selectedBoarding: BoardingPoint;
    selectedDropping: DroppingPoint;
    contactPhone: string;
    contactEmail: string;
    passengers: Record<string, { name: string; age: number; gender: "M" | "F" }>;
    hasProtectionPlan: boolean;
  }) => void;
}

export function InlineSeatSelection({
  bus,
  fromCityId,
  toCityId,
  fromCityName,
  toCityName,
  journeyDate,
  duration = "08h 15m",
  onOpenBookingSummary,
}: InlineSeatSelectionProps) {
  const { user } = useAuthStore();

  // State
  const [displayMode, setDisplayMode] = useState<"seat_no" | "price">("seat_no");
  const [showSingleLadySeatsOnly, setShowSingleLadySeatsOnly] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState<SeatLayoutItem[]>([]);
  const [selectedBoardingCode, setSelectedBoardingCode] = useState<string>("");
  const [selectedDroppingCode, setSelectedDroppingCode] = useState<string>("");
  const [contactPhone, setContactPhone] = useState(user?.phone || "8010097706");
  const [contactEmail, setContactEmail] = useState(user?.email || "madhavmore23445@gmail.com");
  const [passengers, setPassengers] = useState<
    Record<string, { name: string; age: number; gender: "M" | "F" }>
  >({});
  const [hasProtectionPlan, setHasProtectionPlan] = useState(false);

  // Fetch seat chart for this specific bus
  const {
    data: chartData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["chart", bus.RouteBusId, fromCityId, toCityId, journeyDate],
    queryFn: async () => {
      const res = await api.get<SeatChartResponse>(`/seats/${bus.RouteBusId}/chart`, {
        params: { fromCityId, toCityId, journeyDate },
      });
      return res;
    },
    staleTime: 60 * 1000,
  });

  const boardingPoints = useMemo(
    () => chartData?.BoardingPoints || bus.BoardingPoints || [],
    [chartData?.BoardingPoints, bus.BoardingPoints]
  );
  const droppingPoints = useMemo(
    () => chartData?.DroppingPoints || bus.DroppingPoints || [],
    [chartData?.DroppingPoints, bus.DroppingPoints]
  );

  const effectiveBoardingCode =
    selectedBoardingCode || (boardingPoints.length > 0 ? boardingPoints[0].PickupCode : "");
  const effectiveDroppingCode =
    selectedDroppingCode || (droppingPoints.length > 0 ? droppingPoints[0].DropoffCode : "");

  // Handle seat click
  const handleSeatClick = (seat: SeatLayoutItem) => {
    // 0: Booked, -2: Booked Male, -3: Booked Female
    if (seat.seat_status === 0 || seat.seat_status === -2 || seat.seat_status === -3) {
      toast.info(`Seat ${seat.seat_no} is already booked.`);
      return;
    }

    const isAlreadySelected = selectedSeats.some((s) => s.seat_no === seat.seat_no);

    if (isAlreadySelected) {
      setSelectedSeats((prev) => prev.filter((s) => s.seat_no !== seat.seat_no));
      setPassengers((prev) => {
        const copy = { ...prev };
        delete copy[seat.seat_no];
        return copy;
      });
      return;
    }

    if (selectedSeats.length >= 6) {
      toast.warning("You can select up to 6 seats per booking.");
      return;
    }

    setSelectedSeats((prev) => [...prev, seat]);
    setPassengers((prev) => ({
      ...prev,
      [seat.seat_no]: {
        name: "",
        age: 22,
        gender: seat.seat_status === 3 ? "F" : "M",
      },
    }));
  };

  // Group seats by deck
  const { lowerDeckSeats, upperDeckSeats, hasUpperDeck } = useMemo(() => {
    const layout = chartData?.Layout || [];
    const lower = layout.filter((s) => s.deck === 1);
    const upper = layout.filter((s) => s.deck === 2);
    return {
      lowerDeckSeats: lower,
      upperDeckSeats: upper,
      hasUpperDeck: upper.length > 0,
    };
  }, [chartData?.Layout]);

  // Calculate pricing
  const totalBaseFare = selectedSeats.reduce((sum, s) => sum + s.total_fare, 0);
  const totalInsurance = hasProtectionPlan ? selectedSeats.length * 12 : 0;
  const totalPayable = totalBaseFare + totalInsurance;

  // Selected Boarding & Dropping Objects
  const selectedBoarding = boardingPoints.find((b) => b.PickupCode === effectiveBoardingCode) || null;
  const selectedDropping = droppingPoints.find((d) => d.DropoffCode === effectiveDroppingCode) || null;

  // Validate and proceed to booking drawer
  const handleBookClick = () => {
    if (selectedSeats.length === 0) {
      toast.warning("Please choose at least 1 seat to continue.");
      return;
    }

    if (!selectedBoarding || !selectedDropping) {
      toast.warning("Please choose both a boarding and dropping point.");
      return;
    }

    if (!contactPhone || contactPhone.trim().length < 10) {
      toast.warning("Please enter a valid 10-digit mobile number.");
      return;
    }

    for (const seat of selectedSeats) {
      const p = passengers[seat.seat_no];
      if (!p || !p.name.trim()) {
        toast.warning(`Please enter passenger name for Seat ${seat.seat_no}.`);
        return;
      }
    }

    onOpenBookingSummary({
      selectedSeats,
      selectedBoarding,
      selectedDropping,
      contactPhone,
      contactEmail,
      passengers,
      hasProtectionPlan,
    });
  };

  // Render Deck Grid
  const renderDeckGrid = (seats: SeatLayoutItem[], isLower = true) => {
    if (seats.length === 0) {
      return (
        <div className="p-8 text-center text-xs text-slate-400">
          No layout data available for this deck.
        </div>
      );
    }

    const maxRow = Math.max(...seats.map((s) => s.row));
    const maxCol = Math.max(...seats.map((s) => s.column));

    return (
      <div className="space-y-3">
        {/* Deck Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {isLower ? "Lower" : "Upper"}
          </span>
          {isLower && (
            <div className="p-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500" title="Driver Cockpit">
              <Disc3 className="h-4 w-4" />
            </div>
          )}
        </div>

        {/* Chassis Seat Matrix matching ref-4.png and ref-6.png */}
        <div
          className="grid gap-2 justify-center py-1"
          style={{
            gridTemplateColumns: `repeat(${maxCol + 1}, minmax(36px, 44px))`,
          }}
        >
          {Array.from({ length: maxRow + 1 }).map((_, r) =>
            Array.from({ length: maxCol + 1 }).map((_, c) => {
              const seat = seats.find((s) => s.row === r && s.column === c);

              if (!seat) {
                return <div key={`empty-${r}-${c}`} className="w-9 h-14" />;
              }

              const isSelected = selectedSeats.some((s) => s.seat_no === seat.seat_no);
              const isAvailable =
                seat.seat_status === 1 || seat.seat_status === 2 || seat.seat_status === 3;
              const isFemaleBooked = seat.seat_status === -3;
              const isBooked = seat.seat_status === 0 || seat.seat_status === -2;
              const isFemaleAvailable = seat.seat_status === 3;
              const isSleeper = seat.seat_type === 2;

              if (showSingleLadySeatsOnly && !isFemaleAvailable && !isFemaleBooked) {
                // Dim non-ladies seats when toggle is active
              }

              // Styling according to reference images:
              // - Available: white / dark:slate-800 with gray border
              // - Selected: solid green (#16a34a) with white text
              // - For female: pink border
              // - Female booked: pink filled
              // - Booked: gray filled
              let seatStyles =
                "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:border-red-400";

              if (isSelected) {
                seatStyles =
                  "border-emerald-600 bg-emerald-600 text-white font-black shadow-sm ring-2 ring-emerald-500/30";
              } else if (isFemaleBooked) {
                seatStyles =
                  "border-pink-300 bg-pink-200 text-pink-700 dark:bg-pink-950 dark:border-pink-900 cursor-not-allowed opacity-80";
              } else if (isBooked) {
                seatStyles =
                  "border-slate-300 bg-slate-200 text-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-500 cursor-not-allowed opacity-60";
              } else if (isFemaleAvailable) {
                seatStyles =
                  "border-pink-400 bg-pink-50/60 text-pink-700 dark:bg-pink-950/40 dark:border-pink-800 dark:text-pink-300";
              }

              const displayLabel =
                displayMode === "price" && isAvailable
                  ? `₹${Math.round(seat.total_fare)}`
                  : seat.seat_no;

              return (
                <button
                  key={seat.seq_no}
                  type="button"
                  disabled={!isAvailable}
                  onClick={() => handleSeatClick(seat)}
                  title={`Seat ${seat.seat_no} • ₹${Math.round(seat.total_fare)} • ${
                    !isAvailable ? "Booked" : isSelected ? "Selected" : "Available"
                  }`}
                  className={`relative flex flex-col items-center justify-center rounded-md border text-[11px] font-bold transition-all ${
                    isSleeper ? "h-14 w-9" : "h-10 w-9"
                  } ${seatStyles} ${isAvailable ? "active:scale-95" : ""}`}
                >
                  <span className="truncate">{displayLabel}</span>
                </button>
              );
            })
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 bg-slate-50/60 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 animate-in fade-in duration-200">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 gap-3 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin text-[#D92D20]" />
          <p className="text-xs font-semibold">Loading real-time seat inventory from operator...</p>
        </div>
      ) : isError || !chartData ? (
        <div className="p-6 text-center space-y-3 rounded-xl border border-red-200 bg-red-50 dark:border-red-950 dark:bg-red-950/30">
          <AlertCircle className="h-6 w-6 text-red-500 mx-auto" />
          <p className="text-xs font-semibold text-red-800 dark:text-red-300">
            {error instanceof Error ? error.message : "Seat layout could not be loaded."}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700"
          >
            Retry Chart
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: Deck Layout & Seat Controls matching ref-4.png & ref-6.png */}
          <div className="xl:col-span-5 space-y-4">
            {/* Top Toolbar: Price/Seat No toggle & Single lady seats toggle */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2">
              {/* Price / Seat Number pill toggle */}
              <div className="flex items-center rounded-full bg-white dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700 text-xs font-bold shadow-2xs">
                <button
                  type="button"
                  onClick={() => setDisplayMode("price")}
                  className={`px-3 py-1 rounded-full transition-all ${
                    displayMode === "price"
                      ? "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Price
                </button>
                <button
                  type="button"
                  onClick={() => setDisplayMode("seat_no")}
                  className={`px-3 py-1 rounded-full transition-all ${
                    displayMode === "seat_no"
                      ? "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Seat Number
                </button>
              </div>

              {/* Single lady seats switch */}
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-600 dark:text-slate-300">
                <span>Single lady seats</span>
                <input
                  type="checkbox"
                  checked={showSingleLadySeatsOnly}
                  onChange={(e) => setShowSingleLadySeatsOnly(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-8 h-4 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#EB5757] relative"></div>
              </label>
            </div>

            {/* Deck Boxes (Lower and Upper) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Lower Deck */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xs">
                {renderDeckGrid(lowerDeckSeats, true)}
              </div>

              {/* Upper Deck */}
              {hasUpperDeck && (
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xs">
                  {renderDeckGrid(upperDeckSeats, false)}
                </div>
              )}
            </div>

            {/* Seat Legend matching ref-4.png */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[11px] text-slate-500 font-medium px-1">
              <div className="flex items-center gap-1.5">
                <div className="h-3.5 w-3.5 rounded-sm border border-slate-300 bg-white dark:bg-slate-800" />
                <span>Available</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3.5 w-3.5 rounded-sm border border-pink-400 bg-pink-50" />
                <span>For Female</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3.5 w-3.5 rounded-sm border border-blue-400 bg-blue-50" />
                <span>For Male</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3.5 w-3.5 rounded-sm border border-pink-300 bg-pink-200" />
                <span>Female booked</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3.5 w-3.5 rounded-sm border border-slate-300 bg-slate-300" />
                <span>Booked</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Journey, Dropdowns, Contact & Passenger inputs matching ref-4.png & ref-6.png */}
          <div className="xl:col-span-7 space-y-4">
            {/* Route timeline banner */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-sm font-black text-slate-900 dark:text-white">
                  {fromCityName}
                </span>
                <p className="text-[11px] text-slate-400">Day 0 | {bus.DepartureTime}</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-8 sm:w-16 h-px bg-slate-200 dark:bg-slate-700" />
                <span className="text-[11px] font-bold text-slate-500 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">
                  {duration}
                </span>
                <div className="w-8 sm:w-16 h-px bg-slate-200 dark:bg-slate-700" />
              </div>

              <div className="text-right">
                <span className="text-sm font-black text-slate-900 dark:text-white">
                  {toCityName}
                </span>
                <p className="text-[11px] text-slate-400">Day 0 | {bus.ArrivalTime}</p>
              </div>
            </div>

            {/* Boarding & Dropping Dropdowns matching ref-4 & ref-6 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Boarding Point Dropdown */}
              <div className="relative">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                  <ArrowUp className="h-3 w-3 text-[#EB5757]" />
                  <span>Boarding Point</span>
                </label>
                <select
                  value={effectiveBoardingCode}
                  onChange={(e) => setSelectedBoardingCode(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#EB5757]"
                >
                  {boardingPoints.map((b) => (
                    <option key={b.PickupCode} value={b.PickupCode}>
                      {b.PickupName} ({b.PickupTime})
                    </option>
                  ))}
                </select>
              </div>

              {/* Dropping Point Dropdown */}
              <div className="relative">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                  <ArrowDown className="h-3 w-3 text-sky-500" />
                  <span>Dropping Point</span>
                </label>
                <select
                  value={effectiveDroppingCode}
                  onChange={(e) => setSelectedDroppingCode(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#EB5757]"
                >
                  {droppingPoints.map((d) => (
                    <option key={d.DropoffCode} value={d.DropoffCode}>
                      {d.DropoffName} ({d.DropoffTime})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Contact Fields matching ref-4 & ref-6 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Mobile Number *
                </label>
                <div className="relative flex items-center h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3">
                  <Phone className="h-4 w-4 text-slate-400 mr-2 shrink-0" />
                  <input
                    type="tel"
                    placeholder="Enter Mobile Number"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full h-full bg-transparent text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  E-Mail ID
                </label>
                <div className="relative flex items-center h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3">
                  <Mail className="h-4 w-4 text-slate-400 mr-2 shrink-0" />
                  <input
                    type="email"
                    placeholder="Enter Email Address"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full h-full bg-transparent text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Dynamic Passenger Details per Seat matching ref-4 & ref-6 */}
            <div className="space-y-2 pt-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Passenger Details
              </h4>

              {selectedSeats.length === 0 ? (
                <div className="p-6 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 text-xs text-slate-400">
                  <Armchair className="h-6 w-6 mx-auto mb-1 text-slate-300" />
                  <p>Click on any available seat on the layout to enter passenger details.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedSeats.map((seat) => {
                    const current = passengers[seat.seat_no] || {
                      name: "",
                      age: 22,
                      gender: seat.seat_status === 3 ? "F" : "M",
                    };

                    return (
                      <div
                        key={seat.seat_no}
                        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xs"
                      >
                        {/* Seat Badge */}
                        <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 shrink-0 font-bold text-xs">
                          <Armchair className="h-3.5 w-3.5" />
                          <span>{seat.seat_no}</span>
                        </div>

                        {/* Passenger Name Input */}
                        <div className="flex-1 min-w-[140px]">
                          <input
                            type="text"
                            placeholder="Passenger Name"
                            value={current.name}
                            onChange={(e) =>
                              setPassengers((prev) => ({
                                ...prev,
                                [seat.seat_no]: { ...current, name: e.target.value },
                              }))
                            }
                            className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#EB5757]"
                          />
                        </div>

                        {/* Age Input */}
                        <div className="w-16 shrink-0">
                          <input
                            type="number"
                            min={1}
                            max={110}
                            placeholder="Age"
                            value={current.age}
                            onChange={(e) =>
                              setPassengers((prev) => ({
                                ...prev,
                                [seat.seat_no]: {
                                  ...current,
                                  age: parseInt(e.target.value, 10) || 18,
                                },
                              }))
                            }
                            className="w-full h-9 px-2 text-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#EB5757]"
                          />
                        </div>

                        {/* Gender Toggle Icons matching ref-6 */}
                        <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              setPassengers((prev) => ({
                                ...prev,
                                [seat.seat_no]: { ...current, gender: "M" },
                              }))
                            }
                            title="Male"
                            className={`p-2 transition-colors ${
                              current.gender === "M"
                                ? "bg-blue-50 text-blue-600 dark:bg-blue-950 font-bold"
                                : "text-slate-400 hover:text-slate-700"
                            }`}
                          >
                            <User className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setPassengers((prev) => ({
                                ...prev,
                                [seat.seat_no]: { ...current, gender: "F" },
                              }))
                            }
                            title="Female"
                            className={`p-2 transition-colors border-l border-slate-200 dark:border-slate-700 ${
                              current.gender === "F"
                                ? "bg-pink-50 text-pink-600 dark:bg-pink-950 font-bold"
                                : "text-slate-400 hover:text-slate-700"
                            }`}
                          >
                            <User className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Travel Protection Plan Checkbox matching ref-6.png */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasProtectionPlan}
                  onChange={(e) => setHasProtectionPlan(e.target.checked)}
                  className="mt-0.5 rounded-sm border-slate-300 text-[#EB5757] focus:ring-[#EB5757]"
                />
                <div className="text-xs">
                  <div className="flex items-center gap-1 font-bold text-slate-800 dark:text-slate-200">
                    <Shield className="h-3.5 w-3.5 text-[#EB5757]" />
                    <span>Travel Protection Plan</span>
                    <Info className="h-3 w-3 text-slate-400" />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Protect your trip at just ₹12 per person •{" "}
                    <span className="text-[#EB5757] underline">Terms & Conditions</span>
                  </p>
                </div>
              </label>
            </div>

            {/* Bottom Action Footer matching ref-6.png */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  Seats Selected
                </p>
                <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                  {selectedSeats.length > 0
                    ? selectedSeats.map((s) => s.seat_no).join(", ")
                    : "None"}
                </p>
              </div>

              <div className="flex items-center gap-4 justify-between sm:justify-end">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Amount to be collected
                  </span>
                  <span className="text-xl font-black text-slate-900 dark:text-white font-mono">
                    ₹ {totalPayable}
                  </span>
                </div>

                <button
                  type="button"
                  disabled={selectedSeats.length === 0}
                  onClick={handleBookClick}
                  className="h-11 px-7 rounded-xl bg-[#EB5757] hover:bg-[#D92D20] active:bg-[#c2281c] text-white font-bold text-sm shadow-sm hover:shadow transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Book
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
