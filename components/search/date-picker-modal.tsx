"use client";

import React from "react";
import { Dialog } from "@/components/ui/dialog";
import { Calendar as CalendarIcon } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface DatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
}

export function DatePickerModal({
  isOpen,
  onClose,
  selectedDate,
  onSelectDate,
}: DatePickerModalProps) {
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().slice(0, 10);

  const dayAfterTomorrow = new Date(today);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
  const dayAfterTomorrowStr = dayAfterTomorrow.toISOString().slice(0, 10);

  // Maximum allowed date is +90 days
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + 90);
  const maxDateStr = maxDate.toISOString().slice(0, 10);

  const handlePick = (dateStr: string) => {
    onSelectDate(dateStr);
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Select Journey Date"
      description="Choose your departure date for bus services"
      maxWidth="sm"
    >
      <div className="space-y-5">
        {/* Quick Date Pills */}
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handlePick(todayStr)}
            className={`p-3 rounded-xl border text-center transition-all ${
              selectedDate === todayStr
                ? "border-[#D92D20] bg-red-50 text-[#D92D20] font-bold dark:bg-red-950/40"
                : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Today</p>
            <p className="text-sm font-bold mt-0.5">{formatDate(todayStr, "short")}</p>
          </button>

          <button
            type="button"
            onClick={() => handlePick(tomorrowStr)}
            className={`p-3 rounded-xl border text-center transition-all ${
              selectedDate === tomorrowStr
                ? "border-[#D92D20] bg-red-50 text-[#D92D20] font-bold dark:bg-red-950/40"
                : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tomorrow</p>
            <p className="text-sm font-bold mt-0.5">{formatDate(tomorrowStr, "short")}</p>
          </button>

          <button
            type="button"
            onClick={() => handlePick(dayAfterTomorrowStr)}
            className={`p-3 rounded-xl border text-center transition-all ${
              selectedDate === dayAfterTomorrowStr
                ? "border-[#D92D20] bg-red-50 text-[#D92D20] font-bold dark:bg-red-950/40"
                : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">In 2 Days</p>
            <p className="text-sm font-bold mt-0.5">{formatDate(dayAfterTomorrowStr, "short")}</p>
          </button>
        </div>

        {/* Standard HTML5 Date Input with Min/Max Bounds */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            Pick from Calendar
          </label>
          <div className="relative">
            <input
              type="date"
              min={todayStr}
              max={maxDateStr}
              value={selectedDate}
              onChange={(e) => {
                if (e.target.value) {
                  handlePick(e.target.value);
                }
              }}
              className="w-full h-11 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold focus:ring-2 focus:ring-[#D92D20] focus:outline-none"
            />
          </div>
        </div>

        {/* Current Selection summary */}
        <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
          <CalendarIcon className="h-4 w-4 text-[#D92D20] shrink-0" />
          <span>
            Selected: <strong className="text-slate-900 dark:text-white">{formatDate(selectedDate)}</strong>
          </span>
        </div>
      </div>
    </Dialog>
  );
}
