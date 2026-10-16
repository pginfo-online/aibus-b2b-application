"use client";

import React, { useState, useMemo } from "react";
import { formatCurrency } from "@/lib/utils";
import { useBookingStore } from "@/store/booking-store";
import { toast } from "@/store/toast-store";
import { Disc3, Layers } from "lucide-react";
import type { SeatChartResponse, SeatLayoutItem } from "@/types/api";

interface SeatMapProps {
  chart: SeatChartResponse;
}

export function SeatMap({ chart }: SeatMapProps) {
  const { selectedSeats, toggleSeatSelection } = useBookingStore();
  const [activeDeck, setActiveDeck] = useState<1 | 2>(1);

  const hasUpperDeck = useMemo(() => {
    return chart.Layout.some((s) => s.deck === 2);
  }, [chart.Layout]);

  const deckSeats = useMemo(() => {
    return chart.Layout.filter((s) => s.deck === activeDeck);
  }, [chart.Layout, activeDeck]);

  // Determine grid matrix bounds
  const { maxRow, maxCol } = useMemo(() => {
    if (deckSeats.length === 0) return { maxRow: 0, maxCol: 0 };
    return {
      maxRow: Math.max(...deckSeats.map((s) => s.row)),
      maxCol: Math.max(...deckSeats.map((s) => s.column)),
    };
  }, [deckSeats]);

  const handleSeatClick = (seat: SeatLayoutItem) => {
    // Check if available
    // seat_status === 1 (Available), 2 (Male), 3 (Female)
    if (seat.seat_status === 0 || seat.seat_status === -2 || seat.seat_status === -3) {
      toast.info(`Seat ${seat.seat_no} is already booked.`);
      return;
    }

    const success = toggleSeatSelection(seat);
    if (!success) {
      toast.warning("You can select a maximum of 6 seats per booking.");
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-6">
      {/* Header and Deck Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base font-black text-slate-900 dark:text-white">
            Select Your Seats
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Click on available seats to add up to 6 passengers
          </p>
        </div>

        {hasUpperDeck && (
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
            <button
              type="button"
              onClick={() => setActiveDeck(1)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeDeck === 1
                  ? "bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Lower Deck</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveDeck(2)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeDeck === 2
                  ? "bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Upper Deck</span>
            </button>
          </div>
        )}
      </div>

      {/* Seat Map Visual Chassis */}
      <div className="relative mx-auto max-w-sm rounded-3xl border-2 border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-6 shadow-inner">
        {/* Front of vehicle marker & steering wheel */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-400">
          <span className="uppercase tracking-wider text-[10px]">Front / Entrance</span>
          <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400" title="Driver cockpit">
            <Disc3 className="h-5 w-5 animate-spin-slow text-[#D92D20]" />
            <span className="text-[10px]">Driver</span>
          </div>
        </div>

        {/* Seat Layout Grid */}
        <div
          className="grid gap-2.5 justify-center py-2"
          style={{
            gridTemplateColumns: `repeat(${maxCol + 1}, minmax(44px, 52px))`,
          }}
        >
          {Array.from({ length: maxRow + 1 }).map((_, r) =>
            Array.from({ length: maxCol + 1 }).map((_, c) => {
              const seat = deckSeats.find((s) => s.row === r && s.column === c);

              if (!seat) {
                // Aisle or empty space
                return <div key={`empty-${r}-${c}`} className="w-11 h-11" />;
              }

              const isSelected = selectedSeats.some((s) => s.seat_no === seat.seat_no);
              const isAvailable =
                seat.seat_status === 1 || seat.seat_status === 2 || seat.seat_status === 3;
              const isLadies = seat.seat_status === 3;
              const isSleeper = seat.seat_type === 2;

              let seatBg = "bg-white border-slate-400 text-slate-800 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 hover:border-[#D92D20]";
              if (!isAvailable) {
                seatBg = "bg-slate-200 border-slate-300 text-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-600 cursor-not-allowed opacity-60";
              } else if (isSelected) {
                seatBg = "bg-emerald-600 border-emerald-700 text-white shadow-md shadow-emerald-500/20";
              } else if (isLadies) {
                seatBg = "bg-pink-50 border-pink-400 text-pink-700 dark:bg-pink-950/40 dark:border-pink-800 dark:text-pink-300";
              }

              return (
                <button
                  key={seat.seq_no}
                  type="button"
                  disabled={!isAvailable}
                  onClick={() => handleSeatClick(seat)}
                  title={`Seat ${seat.seat_no} • ${formatCurrency(seat.total_fare)} • ${
                    !isAvailable ? "Booked" : isSelected ? "Selected" : "Available"
                  }`}
                  className={`relative flex flex-col items-center justify-center rounded-lg border-2 text-xs font-black transition-all ${
                    isSleeper ? "h-16" : "h-11"
                  } ${seatBg} ${isAvailable ? "active:scale-95" : ""}`}
                >
                  <span>{seat.seat_no}</span>
                  {isAvailable && (
                    <span className="text-[9px] font-mono font-medium opacity-80 leading-none mt-0.5">
                      ₹{Math.round(seat.total_fare)}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Rear indicator */}
        <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800 text-center text-[10px] uppercase tracking-wider text-slate-400 font-bold">
          Rear of Bus
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-md border-2 border-slate-400 bg-white dark:bg-slate-800" />
          <span className="text-slate-600 dark:text-slate-400">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-md border-2 border-emerald-700 bg-emerald-600" />
          <span className="text-slate-600 dark:text-slate-400 font-bold text-emerald-700 dark:text-emerald-400">
            Selected ({selectedSeats.length})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-md border-2 border-slate-300 bg-slate-200 opacity-60 dark:bg-slate-700" />
          <span className="text-slate-600 dark:text-slate-400">Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-md border-2 border-pink-400 bg-pink-100 dark:bg-pink-950" />
          <span className="text-slate-600 dark:text-slate-400">Ladies</span>
        </div>
      </div>
    </div>
  );
}
