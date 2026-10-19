"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftRight, Search } from "lucide-react";
import { CityAutocomplete } from "./city-autocomplete";
import { DatePickerPopover } from "./date-picker-popover";
import { useBookingStore } from "@/store/booking-store";
import { toast } from "@/store/toast-store";
import type { City } from "@/types/api";

interface UnifiedSearchBarProps {
  className?: string;
  onSearch?: () => void;
}

export function UnifiedSearchBar({ className = "", onSearch }: UnifiedSearchBarProps) {
  const router = useRouter();
  const { fromCity, toCity, journeyDate, setSearchCriteria, swapCities } = useBookingStore();

  const [isSwapping, setIsSwapping] = useState(false);

  // Defaults if unselected
  const currentFrom: City = fromCity || {
    id: "2002",
    providerCityId: 2002,
    name: "Pune",
    City: "Pune",
    CityId: 2002,
    State: "Maharashtra",
  };

  const currentTo: City = toCity || {
    id: "2003",
    providerCityId: 2003,
    name: "Latur",
    City: "Latur",
    CityId: 2003,
    State: "Maharashtra",
  };

  const handleSwap = () => {
    setIsSwapping(true);
    swapCities();
    setTimeout(() => setIsSwapping(false), 300);
  };

  const handleSourceSelect = (city: City) => {
    setSearchCriteria(city, currentTo, journeyDate);
  };

  const handleDestSelect = (city: City) => {
    setSearchCriteria(currentFrom, city, journeyDate);
  };

  const handleDateChange = (newDate: string) => {
    setSearchCriteria(currentFrom, currentTo, newDate);
  };

  const executeSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const fromId = currentFrom.CityId || currentFrom.providerCityId;
    const toId = currentTo.CityId || currentTo.providerCityId;
    const fromName = currentFrom.City || currentFrom.name;
    const toName = currentTo.City || currentTo.name;

    if (!fromId || !toId) {
      toast.warning("Please choose both departure and destination cities.");
      return;
    }

    if (fromId === toId || fromName.toLowerCase().trim() === toName.toLowerCase().trim()) {
      toast.error("Source and Destination cannot be the same city.");
      return;
    }

    // Save criteria in store
    setSearchCriteria(currentFrom, currentTo, journeyDate);

    const params = new URLSearchParams({
      fromCityId: String(fromId),
      toCityId: String(toId),
      fromCityName: fromName,
      toCityName: toName,
      journeyDate,
    });

    if (onSearch) {
      onSearch();
    }

    router.push(`/portal/search?${params.toString()}`);
  };

  return (
    <div
      className={`w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-2 sm:p-2.5 shadow-sm ${className}`}
    >
      <form
        onSubmit={executeSearch}
        className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2"
      >
        {/* Source City Autocomplete */}
        <div className="flex-1 min-w-[200px]">
          <CityAutocomplete
            label="Source"
            placeholder="Source"
            value={currentFrom}
            onChange={handleSourceSelect}
            otherSelectedCityId={currentTo.CityId || currentTo.providerCityId}
            otherCityName={currentTo.City || currentTo.name}
          />
        </div>

        {/* Swap Button */}
        <div className="flex justify-center -my-1 lg:my-0">
          <button
            type="button"
            onClick={handleSwap}
            aria-label="Swap origin and destination"
            className={`h-10 w-10 shrink-0 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-300 hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-700 flex items-center justify-center transition-transform duration-300 ${
              isSwapping ? "rotate-180" : ""
            }`}
          >
            <ArrowLeftRight className="h-4 w-4 text-slate-500" />
          </button>
        </div>

        {/* Destination City Autocomplete */}
        <div className="flex-1 min-w-[200px]">
          <CityAutocomplete
            label="Destination"
            placeholder="Destination"
            value={currentTo}
            onChange={handleDestSelect}
            otherSelectedCityId={currentFrom.CityId || currentFrom.providerCityId}
            otherCityName={currentFrom.City || currentFrom.name}
          />
        </div>

        {/* Date Picker Popover */}
        <div className="shrink-0">
          <DatePickerPopover value={journeyDate} onChange={handleDateChange} />
        </div>

        {/* Search Button matching ref-1 & ref-3 */}
        <button
          type="submit"
          className="h-12 px-6 rounded-xl bg-[#D92D20] hover:bg-[#c2281c] active:bg-[#a82218] text-white font-bold text-sm tracking-wide shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 shrink-0"
        >
          <span>Search</span>
          <Search className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
