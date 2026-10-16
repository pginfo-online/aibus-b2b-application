"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftRight, Calendar, MapPin, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CitySelectorModal } from "./city-selector-modal";
import { DatePickerModal } from "./date-picker-modal";
import { useBookingStore } from "@/store/booking-store";
import { formatDate } from "@/lib/utils";
import { toast } from "@/store/toast-store";

export function SearchForm() {
  const router = useRouter();
  const { fromCity, toCity, journeyDate, setSearchCriteria, swapCities } = useBookingStore();

  const [fromModalOpen, setFromModalOpen] = useState(false);
  const [toModalOpen, setToModalOpen] = useState(false);
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);

  // Default fallback cities if unselected
  const currentFrom = fromCity || {
    id: "101",
    providerCityId: 101,
    name: "Bengaluru",
    City: "Bengaluru",
    CityId: 101,
    State: "Karnataka",
  };

  const currentTo = toCity || {
    id: "102",
    providerCityId: 102,
    name: "Chennai",
    City: "Chennai",
    CityId: 102,
    State: "Tamil Nadu",
  };

  const handleSwap = () => {
    setIsSwapping(true);
    swapCities();
    setTimeout(() => setIsSwapping(false), 300);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const fromId = currentFrom.CityId || currentFrom.providerCityId;
    const toId = currentTo.CityId || currentTo.providerCityId;
    const fromName = currentFrom.City || currentFrom.name;
    const toName = currentTo.City || currentTo.name;

    if (!fromId || !toId) {
      toast.warning("Please select both origin and destination cities.");
      return;
    }

    if (fromId === toId || fromName.toLowerCase() === toName.toLowerCase()) {
      toast.error("Origin and Destination cities cannot be the same.");
      return;
    }

    // Save in store
    setSearchCriteria(currentFrom, currentTo, journeyDate);

    // Navigate to results route with query parameters
    const params = new URLSearchParams({
      fromCityId: String(fromId),
      toCityId: String(toId),
      fromCityName: fromName,
      toCityName: toName,
      journeyDate,
    });

    router.push(`/portal/search?${params.toString()}`);
  };

  return (
    <div className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md p-4 sm:p-6 lg:p-8">
      <div className="flex items-center gap-2 mb-4 text-[#D92D20] font-bold text-xs uppercase tracking-wider">
        <Sparkles className="h-4 w-4" />
        <span>B2B Bus Search & Live Inventory</span>
      </div>

      <form onSubmit={handleSearch} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 relative items-center">
          {/* From City Field */}
          <div className="md:col-span-4">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              From (Origin)
            </label>
            <button
              type="button"
              onClick={() => setFromModalOpen(true)}
              className="flex w-full items-center gap-3 h-14 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors"
            >
              <div className="p-2 rounded-lg bg-red-100 text-[#D92D20] dark:bg-red-950 dark:text-red-400 shrink-0">
                <MapPin className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-extrabold text-slate-900 dark:text-white truncate">
                  {currentFrom.City || currentFrom.name}
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  {currentFrom.State || "Select Departure Terminal"}
                </p>
              </div>
            </button>
          </div>

          {/* Atomic Swap Button */}
          <div className="md:col-span-1 flex justify-center -my-2 md:my-0 z-10">
            <button
              type="button"
              onClick={handleSwap}
              aria-label="Swap origin and destination"
              className={`h-10 w-10 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm hover:shadow hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-transform ${
                isSwapping ? "rotate-180" : ""
              }`}
            >
              <ArrowLeftRight className="h-4 w-4 text-[#D92D20]" />
            </button>
          </div>

          {/* To City Field */}
          <div className="md:col-span-4">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              To (Destination)
            </label>
            <button
              type="button"
              onClick={() => setToModalOpen(true)}
              className="flex w-full items-center gap-3 h-14 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors"
            >
              <div className="p-2 rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 shrink-0">
                <MapPin className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-extrabold text-slate-900 dark:text-white truncate">
                  {currentTo.City || currentTo.name}
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  {currentTo.State || "Select Arrival Terminal"}
                </p>
              </div>
            </button>
          </div>

          {/* Journey Date Field */}
          <div className="md:col-span-3">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Journey Date
            </label>
            <button
              type="button"
              onClick={() => setDateModalOpen(true)}
              className="flex w-full items-center gap-3 h-14 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors"
            >
              <div className="p-2 rounded-lg bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-400 shrink-0">
                <Calendar className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-extrabold text-slate-900 dark:text-white truncate">
                  {formatDate(journeyDate, "short")}
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  {formatDate(journeyDate, "full").split(",")[0]} (Change)
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Submit CTA button */}
        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full h-12 text-base font-extrabold shadow-md shadow-red-600/20"
          >
            <Search className="h-5 w-5 mr-2" />
            Search Buses & View Live Inventory
          </Button>
        </div>
      </form>

      {/* Origin City Modal */}
      <CitySelectorModal
        isOpen={fromModalOpen}
        onClose={() => setFromModalOpen(false)}
        title="Select Origin City"
        currentSelectedCityId={currentFrom.CityId || currentFrom.providerCityId}
        onSelectCity={(city) => {
          setSearchCriteria(city, currentTo, journeyDate);
        }}
      />

      {/* Destination City Modal */}
      <CitySelectorModal
        isOpen={toModalOpen}
        onClose={() => setToModalOpen(false)}
        title="Select Destination City"
        currentSelectedCityId={currentTo.CityId || currentTo.providerCityId}
        onSelectCity={(city) => {
          setSearchCriteria(currentFrom, city, journeyDate);
        }}
      />

      {/* Date Picker Modal */}
      <DatePickerModal
        isOpen={dateModalOpen}
        onClose={() => setDateModalOpen(false)}
        selectedDate={journeyDate}
        onSelectDate={(newDate) => {
          setSearchCriteria(currentFrom, currentTo, newDate);
        }}
      />
    </div>
  );
}
