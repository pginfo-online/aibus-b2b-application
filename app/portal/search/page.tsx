"use client";

import React, { useState, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  ArrowLeft,
  Filter,
  ArrowUpDown,
  Bus,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BusCard } from "@/components/results/bus-card";
import { FilterPanel, FilterState } from "@/components/results/filter-panel";
import { BusCardSkeleton } from "@/components/ui/skeleton";
import { DatePickerModal } from "@/components/search/date-picker-modal";
import { api } from "@/lib/api-client";
import { useBookingStore } from "@/store/booking-store";
import { formatDate } from "@/lib/utils";
import type { BusSearchResult } from "@/types/api";

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setSelectedBus } = useBookingStore();

  const fromCityId = searchParams.get("fromCityId") || "101";
  const toCityId = searchParams.get("toCityId") || "102";
  const fromCityName = searchParams.get("fromCityName") || "Bengaluru";
  const toCityName = searchParams.get("toCityName") || "Chennai";
  const journeyDate = searchParams.get("journeyDate") || new Date().toISOString().slice(0, 10);

  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState<"fare_asc" | "departure_asc" | "duration_asc" | "seats_desc">("fare_asc");

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    departureTimeSlot: "all",
    isAC: null,
    isSleeper: null,
    maxPrice: 5000,
    operatorQuery: "",
  });

  // Query buses from verified endpoint /api/v1/search
  const {
    data: searchData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["search", fromCityId, toCityId, journeyDate],
    queryFn: async () => {
      const res = await api.get<{ results: BusSearchResult[]; total: number }>("/search", {
        params: {
          fromCityId: Number(fromCityId),
          toCityId: Number(toCityId),
          journeyDate,
        },
      });
      return res;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const rawBuses: BusSearchResult[] = useMemo(() => searchData?.results || [], [searchData?.results]);

  // Compute price bounds
  const { minPrice, maxPrice } = useMemo(() => {
    if (rawBuses.length === 0) return { minPrice: 300, maxPrice: 3000 };
    const fares = rawBuses.map((b) => b.TotalFare);
    return {
      minPrice: Math.min(...fares),
      maxPrice: Math.max(...fares),
    };
  }, [rawBuses]);

  // Apply Client-Side Filters and Sort
  const filteredBuses = useMemo(() => {
    let result = [...rawBuses];

    // 1. Time slot filter
    if (filters.departureTimeSlot !== "all") {
      result = result.filter((b) => {
        const hour = parseInt(b.DepartureTime.split(":")[0], 10);
        if (filters.departureTimeSlot === "early") return hour < 6;
        if (filters.departureTimeSlot === "morning") return hour >= 6 && hour < 12;
        if (filters.departureTimeSlot === "afternoon") return hour >= 12 && hour < 18;
        if (filters.departureTimeSlot === "night") return hour >= 18;
        return true;
      });
    }

    // 2. AC filter
    if (filters.isAC !== null) {
      result = result.filter((b) => b.IsAC === filters.isAC);
    }

    // 3. Sleeper filter
    if (filters.isSleeper !== null) {
      result = result.filter((b) => b.IsSleeper === filters.isSleeper);
    }

    // 4. Max Price filter
    result = result.filter((b) => b.TotalFare <= filters.maxPrice);

    // 5. Operator search
    if (filters.operatorQuery.trim()) {
      const q = filters.operatorQuery.toLowerCase().trim();
      result = result.filter((b) => b.CompanyName.toLowerCase().includes(q));
    }

    // Sorting
    switch (sortBy) {
      case "fare_asc":
        result.sort((a, b) => a.TotalFare - b.TotalFare);
        break;
      case "departure_asc":
        result.sort((a, b) => a.DepartureTime.localeCompare(b.DepartureTime));
        break;
      case "duration_asc":
        result.sort((a, b) => a.DepartureTime.localeCompare(b.DepartureTime));
        break;
      case "seats_desc":
        result.sort((a, b) => b.AvailableSeats - a.AvailableSeats);
        break;
    }

    return result;
  }, [rawBuses, filters, sortBy]);

  const handleSelectSeats = (bus: BusSearchResult) => {
    setSelectedBus(bus);
    router.push(
      `/portal/booking?busId=${bus.RouteBusId}&fromCityId=${fromCityId}&toCityId=${toCityId}&journeyDate=${journeyDate}`
    );
  };

  const handleDateChange = (newDate: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("journeyDate", newDate);
    router.push(`/portal/search?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      {/* Search Context Summary Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/portal"
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors"
            title="Modify Search Route"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {fromCityName} → {toCityName}
              </h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-50 text-[#D92D20] dark:bg-red-950/60 dark:text-red-400">
                {filteredBuses.length} Buses
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              <span>{formatDate(journeyDate, "full")}</span>
              <span>•</span>
              <button
                type="button"
                onClick={() => setDateModalOpen(true)}
                className="font-bold text-[#D92D20] hover:underline dark:text-red-400"
              >
                Change Date
              </button>
            </div>
          </div>
        </div>

        {/* Sort controls & Mobile filter toggle */}
        <div className="flex items-center gap-2">
          {/* Mobile filter button */}
          <button
            type="button"
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
          >
            <Filter className="h-4 w-4 text-[#D92D20]" />
            <span>Filters</span>
          </button>

          {/* Sort selector */}
          <div className="flex items-center gap-1 text-xs">
            <ArrowUpDown className="h-3.5 w-3.5 text-slate-400 hidden sm:block" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "fare_asc" | "departure_asc" | "seats_desc")}
              className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#D92D20]"
            >
              <option value="fare_asc">Cheapest First</option>
              <option value="departure_asc">Earliest Departure</option>
              <option value="seats_desc">Most Available Seats</option>
            </select>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => refetch()}
            disabled={isFetching}
            title="Refresh results"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin text-[#D92D20]" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Main Grid: Filters Sidebar + Results List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Desktop Filter Panel */}
        <div className="hidden lg:block lg:col-span-4 sticky top-20">
          <FilterPanel
            filters={filters}
            onChange={setFilters}
            onReset={() =>
              setFilters({
                departureTimeSlot: "all",
                isAC: null,
                isSleeper: null,
                maxPrice: maxPrice || 5000,
                operatorQuery: "",
              })
            }
            priceMin={minPrice}
            priceMax={maxPrice}
          />
        </div>

        {/* Mobile Filter Drawer */}
        {mobileFilterOpen && (
          <div className="lg:hidden col-span-1">
            <FilterPanel
              filters={filters}
              onChange={setFilters}
              onReset={() =>
                setFilters({
                  departureTimeSlot: "all",
                  isAC: null,
                  isSleeper: null,
                  maxPrice: maxPrice || 5000,
                  operatorQuery: "",
                })
              }
              priceMin={minPrice}
              priceMax={maxPrice}
            />
          </div>
        )}

        {/* Results List */}
        <div className="lg:col-span-8 space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              <BusCardSkeleton />
              <BusCardSkeleton />
              <BusCardSkeleton />
            </div>
          ) : isError ? (
            <div className="p-8 text-center rounded-2xl border border-red-200 bg-red-50 dark:border-red-950 dark:bg-red-950/30 space-y-3">
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
              <h3 className="font-bold text-sm text-red-900 dark:text-red-200">
                Failed to load buses for this route
              </h3>
              <p className="text-xs text-red-700 dark:text-red-300 max-w-md mx-auto">
                {error instanceof Error ? error.message : "The upstream bus inventory provider is temporarily unavailable."}
              </p>
              <Button variant="primary" size="sm" onClick={() => refetch()}>
                Retry Search
              </Button>
            </div>
          ) : filteredBuses.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
              <Bus className="h-10 w-10 text-slate-300 mx-auto" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                No buses found for your filters
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Try resetting your filters or selecting another travel date to view available operator services.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setFilters({
                    departureTimeSlot: "all",
                    isAC: null,
                    isSleeper: null,
                    maxPrice: maxPrice || 5000,
                    operatorQuery: "",
                  })
                }
              >
                Reset All Filters
              </Button>
            </div>
          ) : (
            filteredBuses.map((bus) => (
              <BusCard
                key={`${bus.RouteBusId}-${bus.TripId}`}
                bus={bus}
                onSelectSeats={handleSelectSeats}
              />
            ))
          )}
        </div>
      </div>

      {/* Date Picker Modal for quick date switching */}
      <DatePickerModal
        isOpen={dateModalOpen}
        onClose={() => setDateModalOpen(false)}
        selectedDate={journeyDate}
        onSelectDate={handleDateChange}
      />
    </div>
  );
}

export default function SearchResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4 p-6">
          <BusCardSkeleton />
          <BusCardSkeleton />
        </div>
      }
    >
      <SearchResultsContent />
    </Suspense>
  );
}
