"use client";

import React from "react";
import { formatTime } from "@/lib/utils";
import { useBookingStore } from "@/store/booking-store";
import { MapPin, Navigation, CheckCircle2 } from "lucide-react";
import type { BoardingPoint, DroppingPoint } from "@/types/api";

interface BoardingDroppingStepProps {
  boardingPoints: BoardingPoint[];
  droppingPoints: DroppingPoint[];
  fromCityName: string;
  toCityName: string;
}

export function BoardingDroppingStep({
  boardingPoints,
  droppingPoints,
  fromCityName,
  toCityName,
}: BoardingDroppingStepProps) {
  const { selectedBoarding, selectedDropping, setSelectedBoarding, setSelectedDropping } =
    useBookingStore();

  return (
    <div className="space-y-8">
      {/* 1. Boarding Points Section */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-100 text-[#D92D20] dark:bg-red-950 dark:text-red-400">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Select Boarding Point ({fromCityName})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose the stop where passenger will board the bus
              </p>
            </div>
          </div>
          {selectedBoarding && (
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" /> Selected
            </span>
          )}
        </div>

        {boardingPoints.length === 0 ? (
          <p className="text-xs text-slate-400 p-4">No specific boarding locations listed.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {boardingPoints.map((point) => {
              const isSelected = selectedBoarding?.PickupCode === point.PickupCode;
              return (
                <button
                  key={`${point.PickupCode}-${point.PickupTime}`}
                  type="button"
                  onClick={() => setSelectedBoarding(point)}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? "border-[#D92D20] bg-red-50/50 text-slate-900 shadow-xs dark:border-red-900 dark:bg-red-950/30 dark:text-white ring-1 ring-[#D92D20]"
                      : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <div
                    className={`mt-0.5 h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      isSelected ? "border-[#D92D20] bg-[#D92D20]" : "border-slate-300"
                    }`}
                  >
                    {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {point.PickupName}
                      </span>
                      <span className="text-xs font-black font-mono text-[#D92D20] dark:text-red-400">
                        {formatTime(point.PickupTime)}
                      </span>
                    </div>
                    {point.Address && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                        {point.Address}
                      </p>
                    )}
                    {point.Landmark && (
                      <p className="text-[11px] text-slate-400 italic mt-0.5">
                        Landmark: {point.Landmark}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Dropping Points Section */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
              <Navigation className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Select Dropping Point ({toCityName})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose the destination stop for deboarding
              </p>
            </div>
          </div>
          {selectedDropping && (
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" /> Selected
            </span>
          )}
        </div>

        {droppingPoints.length === 0 ? (
          <p className="text-xs text-slate-400 p-4">No specific dropping locations listed.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {droppingPoints.map((point) => {
              const isSelected = selectedDropping?.DropoffCode === point.DropoffCode;
              return (
                <button
                  key={`${point.DropoffCode}-${point.DropoffTime}`}
                  type="button"
                  onClick={() => setSelectedDropping(point)}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? "border-amber-500 bg-amber-50/50 text-slate-900 shadow-xs dark:border-amber-900 dark:bg-amber-950/30 dark:text-white ring-1 ring-amber-500"
                      : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <div
                    className={`mt-0.5 h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      isSelected ? "border-amber-600 bg-amber-600" : "border-slate-300"
                    }`}
                  >
                    {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {point.DropoffName}
                      </span>
                      <span className="text-xs font-black font-mono text-amber-600 dark:text-amber-400">
                        {formatTime(point.DropoffTime)}
                      </span>
                    </div>
                    {point.Address && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                        {point.Address}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
