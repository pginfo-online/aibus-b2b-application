"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Loader2, X } from "lucide-react";
import { api } from "@/lib/api-client";
import type { City } from "@/types/api";

interface CitySelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  onSelectCity: (city: City) => void;
  currentSelectedCityId?: number | null;
}

export function CitySelectorModal({
  isOpen,
  onClose,
  title,
  onSelectCity,
  currentSelectedCityId,
}: CitySelectorModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 250);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Query cities from verified endpoint /api/v1/cities
  const { data: cities = [], isLoading, isError } = useQuery({
    queryKey: ["cities", debouncedSearch],
    queryFn: async () => {
      const result = await api.get<City[]>("/cities", {
        params: debouncedSearch ? { q: debouncedSearch } : undefined,
      });
      return Array.isArray(result) ? result : [];
    },
    enabled: isOpen,
    staleTime: 60 * 60 * 1000, // 1 hour stale time for cities
  });

  const handleSelect = (city: City) => {
    onSelectCity(city);
    onClose();
    setSearchTerm("");
  };

  // Popular Indian transit hubs fallback list
  const popularHubNames = [
    "Bengaluru",
    "Chennai",
    "Hyderabad",
    "Mumbai",
    "Pune",
    "Delhi",
    "Goa",
    "Coimbatore",
    "Ahmedabad",
    "Jaipur",
  ];

  return (
    <Dialog
      isOpen={isOpen}
      onClose={() => {
        onClose();
        setSearchTerm("");
      }}
      title={title}
      description="Select origin or destination terminal"
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Input
            placeholder="Type city or terminal name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            startIcon={<Search className="h-4 w-4" />}
            autoFocus
            endIcon={
              searchTerm ? (
                <button
                  onClick={() => setSearchTerm("")}
                  className="hover:text-slate-700 dark:hover:text-slate-200"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : undefined
            }
          />
        </div>

        {/* Results List */}
        <div className="max-h-72 overflow-y-auto space-y-1 divide-y divide-slate-100 dark:divide-slate-800">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-8 text-slate-400 gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-[#D92D20]" />
              <p className="text-xs">Searching verified routes...</p>
            </div>
          ) : isError ? (
            <div className="p-4 text-center text-xs text-red-500">
              Unable to load cities. Please check your connection.
            </div>
          ) : cities.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 space-y-1">
              <p className="font-semibold text-slate-600 dark:text-slate-300">
                No matching cities found
              </p>
              <p>Try searching for a major hub like Bengaluru, Mumbai, or Delhi</p>
            </div>
          ) : (
            cities.map((city) => {
              const isSelected = city.CityId === currentSelectedCityId || city.providerCityId === currentSelectedCityId;
              const cityName = city.City || city.name;

              return (
                <button
                  key={`${city.CityId || city.providerCityId}-${cityName}`}
                  type="button"
                  onClick={() => handleSelect(city)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                    isSelected
                      ? "bg-red-50 text-[#D92D20] font-bold dark:bg-red-950/40 dark:text-red-300"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{cityName}</p>
                      {city.State && (
                        <p className="text-[11px] text-slate-400 font-normal">{city.State}</p>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] font-mono uppercase text-slate-400">
                    ID #{city.CityId || city.providerCityId}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Quick Popular Hubs */}
        {!searchTerm && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Popular Routes & Hubs
            </p>
            <div className="flex flex-wrap gap-1.5">
              {popularHubNames.map((name) => {
                const foundCity = cities.find(
                  (c) => (c.City || c.name || "").toLowerCase() === name.toLowerCase()
                );
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => {
                      if (foundCity) {
                        handleSelect(foundCity);
                      } else {
                        setSearchTerm(name);
                      }
                    }}
                    className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-red-50 hover:text-[#D92D20] dark:hover:bg-red-950/40 text-xs text-slate-600 dark:text-slate-300 transition-colors"
                  >
                    {name}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
}
