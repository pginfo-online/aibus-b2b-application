"use client";

import React, { useState } from "react";
import { formatCurrency, formatTime, calculateDuration } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BoardingTimelineDrawer } from "./boarding-timeline-drawer";
import { CancellationPolicyDrawer } from "./cancellation-policy-drawer";
import { ArrowRight, Bus } from "lucide-react";
import type { BusSearchResult } from "@/types/api";

interface BusCardProps {
  bus: BusSearchResult;
  onSelectSeats: (bus: BusSearchResult) => void;
}

export function BusCard({ bus, onSelectSeats }: BusCardProps) {
  const [boardingOpen, setBoardingOpen] = useState(false);
  const [cancellationOpen, setCancellationOpen] = useState(false);

  const duration = calculateDuration(bus.DepartureTime, bus.ArrivalTime);
  const isAvailable = bus.AvailableSeats > 0;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:shadow-md transition-all overflow-hidden">
      {/* Top Main Section */}
      <div className="p-5 sm:p-6 space-y-4">
        {/* Row 1: Operator Name, Bus Type, and Fare */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-red-100 dark:bg-red-950 text-[#D92D20] dark:text-red-400">
                <Bus className="h-4 w-4" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                {bus.CompanyName}
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pl-8">
              <span>{bus.BusTypeName}</span>
              <span>•</span>
              <span className="font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {bus.IsAC ? "AC" : "Non-AC"}
              </span>
              <span className="font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {bus.IsSleeper ? "Sleeper" : "Seater"}
              </span>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">
              Starting From
            </span>
            <span className="text-2xl font-black text-[#D92D20] dark:text-red-400">
              {formatCurrency(bus.TotalFare, false)}
            </span>
            <span className="text-[10px] text-slate-400 block -mt-1">excl. taxes</span>
          </div>
        </div>

        {/* Row 2: Timing, Route & Duration */}
        <div className="grid grid-cols-3 items-center py-3 px-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
          <div>
            <p className="text-xs text-slate-400 font-medium">Departure</p>
            <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-mono">
              {formatTime(bus.DepartureTime)}
            </p>
          </div>

          <div className="flex flex-col items-center justify-center text-center">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 font-mono">
              {duration}
            </span>
            <div className="w-16 sm:w-24 h-0.5 bg-slate-300 dark:bg-slate-700 my-1 relative">
              <div className="absolute -top-1 right-0 h-2.5 w-2.5 rounded-full bg-[#D92D20]" />
            </div>
            <span className="text-[10px] text-slate-400">Direct Route</span>
          </div>

          <div className="text-right">
            <p className="text-xs text-slate-400 font-medium">Arrival</p>
            <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-mono">
              {formatTime(bus.ArrivalTime)}
            </p>
          </div>
        </div>

        {/* Row 3: Availability & Highlights */}
        <div className="flex items-center justify-between text-xs pt-1">
          <div className="flex items-center gap-1.5 font-bold">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                bus.AvailableSeats > 10
                  ? "bg-emerald-500"
                  : bus.AvailableSeats > 0
                  ? "bg-amber-500"
                  : "bg-red-500"
              }`}
            />
            <span
              className={
                bus.AvailableSeats > 0
                  ? "text-emerald-700 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400"
              }
            >
              {bus.AvailableSeats} Seats Available
            </span>
          </div>

          <div className="text-[11px] text-slate-400 hidden sm:block">
            {bus.BoardingPoints?.length || 0} Boarding • {bus.DroppingPoints?.length || 0} Dropping Points
          </div>
        </div>
      </div>

      {/* Bottom Actions Divider */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-slate-50/80 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-4 text-xs font-bold">
          <button
            type="button"
            onClick={() => setBoardingOpen(true)}
            className="text-slate-600 hover:text-[#D92D20] dark:text-slate-300 dark:hover:text-red-400 hover:underline"
          >
            Boarding & Dropping Points
          </button>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <button
            type="button"
            onClick={() => setCancellationOpen(true)}
            className="text-slate-600 hover:text-[#D92D20] dark:text-slate-300 dark:hover:text-red-400 hover:underline"
          >
            Cancellation Policies
          </button>
        </div>

        <Button
          type="button"
          variant="primary"
          size="md"
          disabled={!isAvailable}
          onClick={() => onSelectSeats(bus)}
          className="font-bold shadow-sm"
        >
          {isAvailable ? "View Seats" : "Sold Out"}
          <ArrowRight className="h-4 w-4 ml-1.5" />
        </Button>
      </div>

      {/* Boarding timeline drawer */}
      <BoardingTimelineDrawer
        isOpen={boardingOpen}
        onClose={() => setBoardingOpen(false)}
        busName={bus.CompanyName}
        boardingPoints={bus.BoardingPoints || []}
        droppingPoints={bus.DroppingPoints || []}
      />

      {/* Cancellation policies drawer */}
      <CancellationPolicyDrawer
        isOpen={cancellationOpen}
        onClose={() => setCancellationOpen(false)}
        busName={bus.CompanyName}
        policies={bus.CancellationPolicy || []}
      />
    </div>
  );
}
