"use client";

import React, { useState, useEffect, useRef, useId } from "react";
import { MapPin, Search, Loader2, X, Building2, Check } from "lucide-react";
import { api } from "@/lib/api-client";
import { toast } from "@/store/toast-store";
import type { City } from "@/types/api";

interface CityAutocompleteProps {
  label: string;
  placeholder: string;
  value: City | null;
  onChange: (city: City) => void;
  otherSelectedCityId?: number | null;
  otherCityName?: string | null;
  className?: string;
  autoFocus?: boolean;
}

// In-memory cache for client-side instant responsiveness across keystrokes
const queryCache = new Map<string, City[]>();

// Fallback popular transit hubs matching UI reference ref-1 & ref-3
const POPULAR_HUBS_FALLBACK: City[] = [
  { id: "4562", providerCityId: 4562, name: "Hyderabad", City: "Hyderabad", CityId: 4562, State: "Telangana" },
  { id: "4292", providerCityId: 4292, name: "Bengaluru", City: "Bengaluru", CityId: 4292, State: "Karnataka" },
  { id: "3001", providerCityId: 3001, name: "Chennai", City: "Chennai", CityId: 3001, State: "Tamil Nadu" },
  { id: "5001", providerCityId: 5001, name: "Goa", City: "Goa", CityId: 5001, State: "Goa" },
  { id: "4563", providerCityId: 4563, name: "Vijayawada", City: "Vijayawada", CityId: 4563, State: "Andhra Pradesh" },
  { id: "4565", providerCityId: 4565, name: "Nellore", City: "Nellore", CityId: 4565, State: "Andhra Pradesh" },
  { id: "2002", providerCityId: 2002, name: "Pune", City: "Pune", CityId: 2002, State: "Maharashtra" },
  { id: "2001", providerCityId: 2001, name: "Mumbai", City: "Mumbai", CityId: 2001, State: "Maharashtra" },
];

export function CityAutocomplete({
  label,
  placeholder,
  value,
  onChange,
  otherSelectedCityId,
  otherCityName,
  className = "",
  autoFocus = false,
}: CityAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [popularCities, setPopularCities] = useState<City[]>(() => queryCache.get("__popular__") || POPULAR_HUBS_FALLBACK);
  const [remoteResults, setRemoteResults] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const listboxId = useId();

  const currentDisplayName = value ? (value.City || value.name) : "";

  // Derive active results list based on search term without cascading effect renders
  const trimmed = searchTerm.trim();
  const results = trimmed
    ? (queryCache.get(trimmed.toLowerCase()) || remoteResults)
    : popularCities;

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch cities when search term changes with debouncing and AbortController
  useEffect(() => {
    if (!isOpen) return;

    const trimmedQuery = searchTerm.trim();

    // If query is empty, ensure background cache is warmed once
    if (!trimmedQuery) {
      if (!queryCache.has("__popular__")) {
        api.get<City[]>("/cities", { params: { popular: true, limit: 12 } })
          .then((cities) => {
            if (Array.isArray(cities) && cities.length > 0) {
              queryCache.set("__popular__", cities);
              setPopularCities(cities);
            }
          })
          .catch(() => {});
      }
      return;
    }

    // Check query cache
    const cacheKey = trimmedQuery.toLowerCase();
    if (queryCache.has(cacheKey)) {
      return;
    }

    // Debounce 200ms
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await api.get<City[]>("/cities", {
          params: { q: trimmedQuery, limit: 12 },
          signal: controller.signal,
        });
        const list = Array.isArray(data) ? data : [];
        queryCache.set(cacheKey, list);
        setRemoteResults(list);
        setHighlightedIndex(-1);
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== "AbortError") {
          // Keep previous results or fallback
        }
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchTerm, isOpen]);

  const handleSelect = (city: City) => {
    const selectedId = city.CityId || city.providerCityId;
    const selectedName = (city.City || city.name).toLowerCase().trim();

    // Origin and destination validation
    if (
      (otherSelectedCityId && selectedId === otherSelectedCityId) ||
      (otherCityName && selectedName === otherCityName.toLowerCase().trim())
    ) {
      toast.warning("Source and destination cannot be the same city.");
      return;
    }

    onChange(city);
    setSearchTerm("");
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < results.length) {
        handleSelect(results[highlightedIndex]);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    const index = text.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) return text;
    const before = text.slice(0, index);
    const match = text.slice(index, index + query.length);
    const after = text.slice(index + query.length);
    return (
      <>
        {before}
        <strong className="text-[#D92D20] font-black">{match}</strong>
        {after}
      </>
    );
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Input container */}
      <div className="relative flex items-center h-12 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xs hover:border-slate-300 dark:hover:border-slate-600 focus-within:border-[#D92D20] dark:focus-within:border-[#D92D20] focus-within:ring-1 focus-within:ring-[#D92D20] transition-all">
        <div className="pl-3.5 pr-2 text-slate-400">
          <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
        </div>

        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls={listboxId}
          autoFocus={autoFocus}
          placeholder={placeholder}
          aria-label={label || placeholder}
          value={isOpen ? searchTerm : currentDisplayName}
          onFocus={() => {
            setIsOpen(true);
            setSearchTerm("");
          }}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full h-full bg-transparent pr-8 text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
        />

        {isOpen && isLoading && (
          <div className="absolute right-3">
            <Loader2 className="h-4 w-4 animate-spin text-[#D92D20]" />
          </div>
        )}

        {!isOpen && value && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSearchTerm("");
              setIsOpen(true);
              inputRef.current?.focus();
            }}
            className="absolute right-2.5 p-1 text-slate-300 hover:text-slate-600 dark:hover:text-slate-200 rounded-md transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Floating Dropdown Autocomplete Menu matching ref-1.png */}
      {isOpen && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute left-0 top-[calc(100%+6px)] w-full sm:min-w-[320px] max-w-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150"
        >
          {/* Header pill when searching or showing popular */}
          <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <span>{searchTerm.trim() ? "Search Results" : "Popular Cities & Hubs"}</span>
            {isLoading && <span className="text-[10px] lowercase text-[#D92D20]">updating...</span>}
          </div>

          {/* List items */}
          <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {results.length === 0 && !isLoading ? (
              <div className="p-6 text-center text-xs text-slate-400 space-y-1">
                <Search className="h-5 w-5 mx-auto text-slate-300" />
                <p className="font-semibold text-slate-700 dark:text-slate-200">No destinations found</p>
                <p className="text-[11px]">Try typing Pune, Hyderabad, or Bengaluru</p>
              </div>
            ) : (
              results.map((city, idx) => {
                const isSelected =
                  value &&
                  (value.CityId === city.CityId || value.providerCityId === city.providerCityId);
                const isOpposing =
                  otherSelectedCityId &&
                  (otherSelectedCityId === city.CityId || otherSelectedCityId === city.providerCityId);
                const isHighlighted = idx === highlightedIndex;
                const cityName = city.City || city.name;

                return (
                  <button
                    key={`${city.CityId || city.providerCityId}-${cityName}-${idx}`}
                    type="button"
                    role="option"
                    aria-selected={Boolean(isSelected)}
                    disabled={Boolean(isOpposing)}
                    onClick={() => handleSelect(city)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left transition-colors ${
                      isOpposing
                        ? "opacity-40 cursor-not-allowed bg-slate-50 dark:bg-slate-800/40"
                        : isHighlighted
                        ? "bg-red-50/70 dark:bg-red-950/40 text-slate-900 dark:text-white"
                        : isSelected
                        ? "bg-red-50 dark:bg-red-950/30 text-[#D92D20] font-bold"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Red circular building/bus icon matching ref-1 */}
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-[#D92D20] border border-red-100 dark:bg-red-950/60 dark:text-red-400 dark:border-red-900/60">
                        <Building2 className="h-4 w-4" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate leading-tight text-slate-900 dark:text-slate-100">
                          {highlightMatch(cityName, searchTerm.trim())}
                        </p>
                        {city.State && (
                          <p className="text-[11px] text-slate-400 truncate leading-tight mt-0.5 font-normal">
                            {city.State}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 pl-2">
                      {isSelected ? (
                        <Check className="h-4 w-4 text-[#D92D20]" />
                      ) : isOpposing ? (
                        <span className="text-[10px] text-slate-400 italic">Origin</span>
                      ) : null}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
