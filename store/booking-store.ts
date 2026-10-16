import { create } from "zustand";
import type {
  BoardingPoint,
  BusSearchResult,
  City,
  DroppingPoint,
  SeatLayoutItem,
} from "@/types/api";

interface BookingState {
  // 1. Search Criteria
  fromCity: City | null;
  toCity: City | null;
  journeyDate: string; // YYYY-MM-DD

  // 2. Selected Journey Components
  selectedBus: BusSearchResult | null;
  selectedSeats: SeatLayoutItem[];
  selectedBoarding: BoardingPoint | null;
  selectedDropping: DroppingPoint | null;

  // 3. Passenger & Contact Information
  passengers: Record<string, { name: string; age: number; gender: "M" | "F" }>;
  contactInfo: {
    customerName: string;
    email: string;
    phone: string;
  };

  // 4. Active Hold State
  activeHold: {
    holdId: string;
    providerHoldId: string;
    expiresAt: string; // ISO date string
    totalFare: number;
  } | null;

  // Actions
  setSearchCriteria: (from: City, to: City, date: string) => void;
  swapCities: () => void;
  setSelectedBus: (bus: BusSearchResult | null) => void;
  toggleSeatSelection: (seat: SeatLayoutItem) => boolean;
  clearSeatSelection: () => void;
  setSelectedBoarding: (point: BoardingPoint | null) => void;
  setSelectedDropping: (point: DroppingPoint | null) => void;
  setPassengerForSeat: (seatNo: string, details: { name: string; age: number; gender: "M" | "F" }) => void;
  setContactInfo: (info: { customerName: string; email: string; phone: string }) => void;
  setActiveHold: (hold: { holdId: string; providerHoldId: string; expiresAt: string; totalFare: number } | null) => void;
  resetBookingJourney: () => void;
}

const getTodayDateString = () => new Date().toISOString().slice(0, 10);

export const useBookingStore = create<BookingState>((set, get) => ({
  fromCity: null,
  toCity: null,
  journeyDate: getTodayDateString(),

  selectedBus: null,
  selectedSeats: [],
  selectedBoarding: null,
  selectedDropping: null,
  passengers: {},
  contactInfo: {
    customerName: "",
    email: "",
    phone: "",
  },
  activeHold: null,

  setSearchCriteria: (fromCity, toCity, journeyDate) => {
    set({ fromCity, toCity, journeyDate });
  },

  swapCities: () => {
    const { fromCity, toCity } = get();
    set({ fromCity: toCity, toCity: fromCity });
  },

  setSelectedBus: (bus) => {
    set({
      selectedBus: bus,
      selectedSeats: [],
      selectedBoarding: null,
      selectedDropping: null,
      passengers: {},
      activeHold: null,
    });
  },

  toggleSeatSelection: (seat) => {
    const { selectedSeats } = get();
    const isSelected = selectedSeats.some((s) => s.seat_no === seat.seat_no);

    if (isSelected) {
      set({
        selectedSeats: selectedSeats.filter((s) => s.seat_no !== seat.seat_no),
      });
      return true;
    }

    if (selectedSeats.length >= 6) {
      return false; // Max 6 seats limit
    }

    set({
      selectedSeats: [...selectedSeats, seat],
    });
    return true;
  },

  clearSeatSelection: () => set({ selectedSeats: [], passengers: {} }),

  setSelectedBoarding: (selectedBoarding) => set({ selectedBoarding }),
  setSelectedDropping: (selectedDropping) => set({ selectedDropping }),

  setPassengerForSeat: (seatNo, details) => {
    set((state) => ({
      passengers: {
        ...state.passengers,
        [seatNo]: details,
      },
    }));
  },

  setContactInfo: (contactInfo) => set({ contactInfo }),

  setActiveHold: (activeHold) => set({ activeHold }),

  resetBookingJourney: () => {
    set({
      selectedBus: null,
      selectedSeats: [],
      selectedBoarding: null,
      selectedDropping: null,
      passengers: {},
      activeHold: null,
    });
  },
}));
