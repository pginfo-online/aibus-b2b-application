"use client";

import React from "react";
import { useBookingStore } from "@/store/booking-store";
import { User, Phone, Mail, UserCheck } from "lucide-react";
import { Input } from "@/components/ui/input";

export function PassengerFormStep() {
  const { selectedSeats, passengers, contactInfo, setPassengerForSeat, setContactInfo } =
    useBookingStore();

  return (
    <div className="space-y-6">
      {/* Contact Information */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Phone className="h-4 w-4 text-[#D92D20]" />
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Contact & Ticket Delivery Details
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Booking confirmation and SMS updates will be dispatched here
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Primary Contact Name *"
            placeholder="e.g. Ramesh Sharma"
            value={contactInfo.customerName}
            onChange={(e) => setContactInfo({ ...contactInfo, customerName: e.target.value })}
            startIcon={<User className="h-4 w-4" />}
          />
          <Input
            label="Mobile Number *"
            placeholder="9876543210"
            value={contactInfo.phone}
            onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
            startIcon={<Phone className="h-4 w-4" />}
          />
          <Input
            label="Email Address *"
            type="email"
            placeholder="passenger@email.com"
            value={contactInfo.email}
            onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
            startIcon={<Mail className="h-4 w-4" />}
          />
        </div>
      </div>

      {/* Passenger Details per Selected Seat */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <UserCheck className="h-4 w-4 text-[#D92D20]" />
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Passenger Manifest ({selectedSeats.length} Seats)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Provide full passenger legal names for ticketing
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {selectedSeats.map((seat, idx) => {
            const current = passengers[seat.seat_no] || {
              name: "",
              age: 28,
              gender: seat.seat_status === 3 ? "F" : "M",
            };

            return (
              <div
                key={seat.seat_no}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#D92D20] text-white text-xs font-bold">
                      {idx + 1}
                    </span>
                    <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                      Seat #{seat.seat_no}
                    </span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      {seat.seat_type === 2 ? "Sleeper" : "Seater"}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#D92D20] dark:text-red-400">
                    ₹{Math.round(seat.total_fare)}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  <div className="sm:col-span-6">
                    <Input
                      label="Full Legal Name *"
                      placeholder="Passenger name as on Gov ID"
                      value={current.name}
                      onChange={(e) =>
                        setPassengerForSeat(seat.seat_no, { ...current, name: e.target.value })
                      }
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <Input
                      label="Age *"
                      type="number"
                      min={1}
                      max={120}
                      value={current.age}
                      onChange={(e) =>
                        setPassengerForSeat(seat.seat_no, {
                          ...current,
                          age: parseInt(e.target.value, 10) || 18,
                        })
                      }
                    />
                  </div>

                  <div className="sm:col-span-3 space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Gender *
                    </label>
                    <div className="flex rounded-lg bg-slate-200 dark:bg-slate-700 p-1">
                      <button
                        type="button"
                        onClick={() =>
                          setPassengerForSeat(seat.seat_no, { ...current, gender: "M" })
                        }
                        className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                          current.gender === "M"
                            ? "bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white"
                            : "text-slate-500 hover:text-slate-800 dark:text-slate-300"
                        }`}
                      >
                        Male
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setPassengerForSeat(seat.seat_no, { ...current, gender: "F" })
                        }
                        className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                          current.gender === "F"
                            ? "bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white"
                            : "text-slate-500 hover:text-slate-800 dark:text-slate-300"
                        }`}
                      >
                        Female
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
