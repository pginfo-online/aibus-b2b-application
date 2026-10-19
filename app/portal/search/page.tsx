"use client";

import React, { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Bus,
  AlertCircle,
  RefreshCw,
  Plus,
  TrendingUp,
  IndianRupee,
  Eye,
  EyeOff,
  SlidersHorizontal,
} from "lucide-react";
import { UnifiedSearchBar } from "@/components/search/unified-search-bar";
import { BusCard } from "@/components/results/bus-card";
import { FilterPanel, FilterState } from "@/components/results/filter-panel";
import { BusCardSkeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api-client";
import { toast } from "@/store/toast-store";
import type { BusSearchResult } from "@/types/api";

function SearchResultsContent() {
  const searchParams = useSearchParams();

  const fromCityId = Number(searchParams.get("fromCityId") || 2002);
  const toCityId = Number(searchParams.get("toCityId") || 2003);
  const fromCityName = searchParams.get("fromCityName") || "Pune";
  const toCityName = searchParams.get("toCityName") || "Latur";
  const journeyDate = searchParams.get("journeyDate") || new Date().toISOString().slice(0, 10);

  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showTopCommissionsOnly, setShowTopCommissionsOnly] = useState(false);
  const [showNetFare, setShowNetFare] = useState(false);
  const [hideNetView, setHideNetView] = useState(false);
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
          fromCityId,
          toCityId,
          journeyDate,
        },
      });
      return res;
    },
    staleTime: 2 * 60 * 1000,
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

    // Top commission toggle
    if (showTopCommissionsOnly) {
      result = result.filter((b) => b.TotalFare >= 700 || b.CompanyName.includes("AROHI") || b.CompanyName.includes("BLACK HORSE"));
    }

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
  }, [rawBuses, filters, sortBy, showTopCommissionsOnly]);

  const handleAddFavourite = () => {
    toast.info("Favorite operators list updated for quick filtering.");
  };

  return (
    <div className="space-y-4">
      {/* 1. TOP UNIFIED SEARCH BAR matching ref-3.png */}
      <UnifiedSearchBar onSearch={() => refetch()} />

      {/* 2. SUB-BAR: Favourite Operators & Quick Actions matching ref-3.png */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-2 bg-transparent">
        {/* Left: Add favourite operators pill */}
        <div>
          <button
            type="button"
            onClick={handleAddFavourite}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-sky-200 dark:border-sky-900/60 bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 text-xs font-bold hover:bg-sky-100 transition-colors shadow-2xs"
          >
            <span>Add favourite operators</span>
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Right Action Buttons matching ref-3.png */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Top Commissions Toggle */}
          <button
            type="button"
            onClick={() => setShowTopCommissionsOnly(!showTopCommissionsOnly)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-2xs ${
              showTopCommissionsOnly
                ? "border-[#D92D20] bg-red-50 text-[#D92D20] dark:bg-red-950/50 dark:text-red-300"
                : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50"
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Top Commissions</span>
          </button>

          {/* Net Fare Toggle */}
          <button
            type="button"
            onClick={() => setShowNetFare(!showNetFare)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-2xs ${
              showNetFare
                ? "border-[#D92D20] bg-red-50 text-[#D92D20] dark:bg-red-950/50 dark:text-red-300"
                : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50"
            }`}
          >
            <IndianRupee className="h-3.5 w-3.5" />
            <span>Net Fare</span>
          </button>

          {/* Eye Hide/Show Icon Button */}
          <button
            type="button"
            onClick={() => setHideNetView(!hideNetView)}
            title={hideNetView ? "Show Net Fare" : "Hide Net Fare"}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            {hideNetView ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>

          {/* Sort By Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(
                  e.target.value as "fare_asc" | "departure_asc" | "duration_asc" | "seats_desc"
                )
              }
              className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#D92D20] shadow-2xs"
            >
              <option value="fare_asc">Sort by: Price (Low to High)</option>
              <option value="departure_asc">Sort by: Departure Time</option>
              <option value="seats_desc">Sort by: Available Seats</option>
            </select>
          </div>

          {/* Filter Toggle Button */}
          <button
            type="button"
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-2xs ${
              showFilterPanel
                ? "border-[#D92D20] bg-red-50 text-[#D92D20] dark:bg-red-950/50"
                : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50"
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-[#D92D20]" />
            <span>Filter</span>
          </button>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            title="Refresh inventory"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin text-[#D92D20]" : ""}`} />
          </button>
        </div>
      </div>

      {/* 3. Main Grid: Optional Filter Panel + Bus Listing Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Collapsible Filter Panel */}
        {showFilterPanel && (
          <div className="lg:col-span-4 sticky top-20 animate-in fade-in duration-200">
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

        {/* Bus Listing */}
        <div className={`${showFilterPanel ? "lg:col-span-8" : "lg:col-span-12"} space-y-4`}>
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
                {error instanceof Error ? error.message : "Operator service temporarily unavailable."}
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors"
              >
                Retry Search
              </button>
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
              <button
                type="button"
                onClick={() => {
                  setFilters({
                    departureTimeSlot: "all",
                    isAC: null,
                    isSleeper: null,
                    maxPrice: maxPrice || 5000,
                    operatorQuery: "",
                  });
                  setShowTopCommissionsOnly(false);
                }}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            filteredBuses.map((bus) => (
              <BusCard
                key={`${bus.RouteBusId}-${bus.TripId}`}
                bus={bus}
                fromCityId={fromCityId}
                toCityId={toCityId}
                fromCityName={fromCityName}
                toCityName={toCityName}
                journeyDate={journeyDate}
              />
            ))
          )}
        </div>
      </div>
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
