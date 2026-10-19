"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";

interface DatePickerPopoverProps {
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  className?: string;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAY_NAMES_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKDAYS = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

function parseDate(dateStr: string): Date {
  const parts = dateStr.split("-").map(Number);
  if (parts.length === 3) {
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }
  return new Date();
}

function formatDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDisplayDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

export function DatePickerPopover({ value, onChange, className = "" }: DatePickerPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedDate = parseDate(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Month navigation inside calendar
  const [viewYear, setViewYear] = useState(selectedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(selectedDate.getMonth());

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePrevDay = () => {
    const cur = parseDate(value);
    cur.setDate(cur.getDate() - 1);
    if (cur >= today) {
      onChange(formatDateString(cur));
    }
  };

  const handleNextDay = () => {
    const cur = parseDate(value);
    cur.setDate(cur.getDate() + 1);
    onChange(formatDateString(cur));
  };

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  // Calendar matrix calculation
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const handleSelectDay = (day: number) => {
    const picked = new Date(viewYear, viewMonth, day);
    onChange(formatDateString(picked));
    setIsOpen(false);
  };

  const isPrevDayDisabled = parseDate(value) <= today;

  // Selected date formatted as "Sat 17 Oct" matching ref-2.png
  const formattedHeaderDay = `${DAY_NAMES_SHORT[selectedDate.getDay()]} ${selectedDate.getDate()} ${
    MONTH_NAMES[selectedDate.getMonth()].slice(0, 3)
  }`;

  return (
    <div ref={containerRef} className={`relative flex items-center ${className}`}>
      {/* 3-Part Date Control matching ref-1 & ref-3: < [📅 17/10/2026] > */}
      <div className="flex items-center h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
        {/* Previous day arrow */}
        <button
          type="button"
          onClick={handlePrevDay}
          disabled={isPrevDayDisabled}
          aria-label="Previous day"
          className="h-full px-2.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 dark:hover:text-slate-200 disabled:opacity-30 disabled:hover:bg-transparent transition-colors border-r border-slate-100 dark:border-slate-800"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Center Date display */}
        <button
          type="button"
          onClick={() => {
            if (!isOpen) {
              const d = parseDate(value);
              setViewYear(d.getFullYear());
              setViewMonth(d.getMonth());
            }
            setIsOpen(!isOpen);
          }}
          aria-label="Open date calendar"
          aria-expanded={isOpen}
          className="flex items-center gap-2 h-full px-3.5 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <CalendarIcon className="h-4 w-4 text-slate-400 shrink-0" />
          <span className="font-mono tracking-tight">{formatDisplayDate(value)}</span>
        </button>

        {/* Next day arrow */}
        <button
          type="button"
          onClick={handleNextDay}
          aria-label="Next day"
          className="h-full px-2.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors border-l border-slate-100 dark:border-slate-800"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Calendar Popover matching ref-2.png */}
      {isOpen && (
        <div className="absolute right-0 top-[calc(100%+6px)] w-72 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl z-50 p-4 animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Month / Year header with navigation */}
          <div className="flex items-center justify-between pb-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/40 text-xs font-bold text-[#D92D20] dark:text-red-400">
              <span>{MONTH_NAMES[viewMonth]}</span>
              <span>/</span>
              <span>{viewYear}</span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                aria-label="Previous month"
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                aria-label="Next month"
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Big day display matching ref-2 */}
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <p className="text-base font-black text-slate-900 dark:text-white">
              {formattedHeaderDay}
            </p>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 pt-3 pb-1 text-center text-[10px] font-bold text-red-500/80 uppercase">
            {WEEKDAYS.map((wd) => (
              <span key={wd}>{wd}</span>
            ))}
          </div>

          {/* Day Grid */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {/* Empty offset slots */}
            {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
              <div key={`offset-${idx}`} className="h-8 w-8" />
            ))}

            {/* Month days */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1;
              const cellDate = new Date(viewYear, viewMonth, day);
              cellDate.setHours(0, 0, 0, 0);

              const isPast = cellDate < today;
              const isSelected =
                selectedDate.getFullYear() === viewYear &&
                selectedDate.getMonth() === viewMonth &&
                selectedDate.getDate() === day;

              return (
                <button
                  key={day}
                  type="button"
                  disabled={isPast}
                  onClick={() => handleSelectDay(day)}
                  className={`h-8 w-8 mx-auto flex items-center justify-center rounded-full text-xs font-semibold transition-all ${
                    isSelected
                      ? "bg-[#D92D20] text-white font-black shadow-xs shadow-red-500/30"
                      : isPast
                      ? "text-slate-300 dark:text-slate-700 cursor-not-allowed"
                      : "text-slate-700 dark:text-slate-300 hover:bg-red-50 hover:text-[#D92D20] dark:hover:bg-red-950/40"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
