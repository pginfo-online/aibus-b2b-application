"use client";

import React from "react";
import { Filter, RotateCcw, Sun, Moon, Sunrise, Sunset } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export interface FilterState {
  departureTimeSlot: "all" | "early" | "morning" | "afternoon" | "night";
  isAC: boolean | null;
  isSleeper: boolean | null;
  maxPrice: number;
  operatorQuery: string;
}

interface FilterPanelProps {
  filters: FilterState;
  onChange: (updated: FilterState) => void;
  onReset: () => void;
  priceMin: number;
  priceMax: number;
}

export function FilterPanel({
  filters,
  onChange,
  onReset,
  priceMin,
  priceMax,
}: FilterPanelProps) {
  const timeSlots = [
    { id: "all", label: "All Day", icon: null },
    { id: "early", label: "Before 6 AM", icon: <Sunrise className="h-4 w-4" /> },
    { id: "morning", label: "6 AM - 12 PM", icon: <Sun className="h-4 w-4" /> },
    { id: "afternoon", label: "12 PM - 6 PM", icon: <Sunset className="h-4 w-4" /> },
    { id: "night", label: "After 6 PM", icon: <Moon className="h-4 w-4" /> },
  ] as const;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-[#D92D20]" />
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
            Filters
          </h3>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-[#D92D20] dark:hover:text-red-400 transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* 1. Departure Time Slots */}
      <div className="space-y-2.5">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Departure Time
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {timeSlots.map((slot) => {
            const isSelected = filters.departureTimeSlot === slot.id;
            return (
              <button
                key={slot.id}
                type="button"
                onClick={() => onChange({ ...filters, departureTimeSlot: slot.id })}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-left ${
                  isSelected
                    ? "border-[#D92D20] bg-red-50 text-[#D92D20] font-bold dark:bg-red-950/40 dark:text-red-300"
                    : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                }`}
              >
                {slot.icon}
                <span className="truncate">{slot.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Bus Type & Format */}
      <div className="space-y-2.5">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Bus Type & Seating
        </label>
        <div className="space-y-2">
          {/* AC / Non-AC */}
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
            <button
              type="button"
              onClick={() => onChange({ ...filters, isAC: null })}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                filters.isAC === null
                  ? "bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
              }`}
            >
              Any AC
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...filters, isAC: true })}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                filters.isAC === true
                  ? "bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
              }`}
            >
              AC Only
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...filters, isAC: false })}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                filters.isAC === false
                  ? "bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
              }`}
            >
              Non-AC
            </button>
          </div>

          {/* Sleeper / Seater */}
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
            <button
              type="button"
              onClick={() => onChange({ ...filters, isSleeper: null })}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                filters.isSleeper === null
                  ? "bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
              }`}
            >
              Any Deck
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...filters, isSleeper: true })}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                filters.isSleeper === true
                  ? "bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
              }`}
            >
              Sleeper
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...filters, isSleeper: false })}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                filters.isSleeper === false
                  ? "bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
              }`}
            >
              Seater
            </button>
          </div>
        </div>
      </div>

      {/* 3. Price Filter Slider */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <label className="font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Max Price
          </label>
          <span className="font-mono font-bold text-[#D92D20] dark:text-red-400">
            {formatCurrency(filters.maxPrice, false)}
          </span>
        </div>
        <input
          type="range"
          min={priceMin}
          max={priceMax}
          step={50}
          value={filters.maxPrice}
          onChange={(e) => onChange({ ...filters, maxPrice: Number(e.target.value) })}
          className="w-full accent-[#D92D20] cursor-pointer"
        />
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>{formatCurrency(priceMin, false)}</span>
          <span>{formatCurrency(priceMax, false)}</span>
        </div>
      </div>

      {/* 4. Operator Filter */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Filter Operator
        </label>
        <input
          type="text"
          placeholder="Search bus operator..."
          value={filters.operatorQuery}
          onChange={(e) => onChange({ ...filters, operatorQuery: e.target.value })}
          className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#D92D20]"
        />
      </div>
    </div>
  );
}
