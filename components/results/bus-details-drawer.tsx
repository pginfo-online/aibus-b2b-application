"use client";

import React, { useState, useEffect } from "react";
import { X, Star } from "lucide-react";
import type { BoardingPoint, DroppingPoint, CancellationPolicyRule } from "@/types/api";

interface BusDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  operatorName: string;
  rating?: number | string;
  busType: string;
  journeyDate?: string;
  boardingPoints: BoardingPoint[];
  droppingPoints: DroppingPoint[];
  cancellationPolicies?: CancellationPolicyRule[] | null;
  initialTab?: "boarding" | "cancellation";
}

export function BusDetailsDrawer({
  isOpen,
  onClose,
  operatorName,
  rating = 3.6,
  busType,
  journeyDate,
  boardingPoints = [],
  droppingPoints = [],
  cancellationPolicies = [],
}: BusDetailsDrawerProps) {
  const [showAllBoarding, setShowAllBoarding] = useState(false);
  const [showAllDropping, setShowAllDropping] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Format journey date display (e.g. "18 Oct")
  const dateDisplay = journeyDate
    ? new Date(journeyDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
    : "18 Oct";

  const visibleBoarding = showAllBoarding ? boardingPoints : boardingPoints.slice(0, 4);
  const visibleDropping = showAllDropping ? droppingPoints : droppingPoints.slice(0, 4);

  // Format policies into human readable time ranges matching ref-4
  const formattedPolicies = (cancellationPolicies || []).map((policy, idx, arr) => {
    const hours = Math.round(policy.Mins / 60);
    const refundPct = Math.max(0, 100 - policy.Pct);

    let timeLabel = "";
    if (idx === 0) {
      timeLabel = `Before ${hours} hrs of departure`;
    } else {
      const prevHours = Math.round(arr[idx - 1].Mins / 60);
      timeLabel = `Between ${hours} & ${prevHours} hrs before departure`;
    }

    if (policy.Mins === 0) {
      const prevHours = arr[idx - 1] ? Math.round(arr[idx - 1].Mins / 60) : 0;
      timeLabel = `Less than ${prevHours} hrs before departure`;
    }

    return {
      label: timeLabel,
      refund: `${refundPct}%`,
    };
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex justify-end overflow-hidden"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-in Drawer Container matching ref-4.png */}
      <div className="relative z-10 flex h-full w-full max-w-lg flex-col bg-white shadow-2xl transition-transform dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-300">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800">
          <h2 className="text-lg font-black text-slate-900 dark:text-white">Bus Details</h2>
          <button
            onClick={onClose}
            aria-label="Close details"
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Operator Banner */}
          <div className="space-y-1.5 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                {operatorName}
              </h3>
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[11px] font-bold">
                <Star className="h-3 w-3 fill-current" />
                {rating}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{busType}</p>
          </div>

          {/* 1. Boarding Points Timeline matching ref-4.png */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Boarding Points
            </h4>

            {boardingPoints.length === 0 ? (
              <p className="text-xs text-slate-400">No boarding points specified.</p>
            ) : (
              <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-red-200 dark:before:bg-red-950">
                {visibleBoarding.map((point, idx) => (
                  <div key={`${point.PickupCode}-${idx}`} className="relative group">
                    {/* Coral timeline dot */}
                    <div className="absolute -left-6 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#EB5757] dark:border-slate-900 shadow-xs" />

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {point.PickupTime}
                        </span>
                        <span className="text-[11px] text-slate-400">{dateDisplay}</span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {point.PickupName}
                        </span>
                      </div>
                      {point.Address && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 pl-0.5">
                          {point.Address}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {boardingPoints.length > 4 && (
              <button
                type="button"
                onClick={() => setShowAllBoarding(!showAllBoarding)}
                className="w-full py-2.5 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/20 text-[#D92D20] dark:text-red-400 font-bold text-xs hover:bg-red-100/60 transition-colors"
              >
                {showAllBoarding ? "Show Less" : "View all Boarding Points"}
              </button>
            )}
          </div>

          {/* 2. Dropping Points Timeline matching ref-4.png */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Dropping Points
            </h4>

            {droppingPoints.length === 0 ? (
              <p className="text-xs text-slate-400">No dropping points specified.</p>
            ) : (
              <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-red-200 dark:before:bg-red-950">
                {visibleDropping.map((point, idx) => (
                  <div key={`${point.DropoffCode}-${idx}`} className="relative group">
                    {/* Coral timeline dot */}
                    <div className="absolute -left-6 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#EB5757] dark:border-slate-900 shadow-xs" />

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {point.DropoffTime}
                        </span>
                        <span className="text-[11px] text-slate-400">{dateDisplay}</span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {point.DropoffName}
                        </span>
                      </div>
                      {point.Address && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 pl-0.5">
                          {point.Address}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {droppingPoints.length > 4 && (
              <button
                type="button"
                onClick={() => setShowAllDropping(!showAllDropping)}
                className="w-full py-2.5 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/20 text-[#D92D20] dark:text-red-400 font-bold text-xs hover:bg-red-100/60 transition-colors"
              >
                {showAllDropping ? "Show Less" : "View all Dropping Points"}
              </button>
            )}
          </div>

          {/* 3. Cancellation Policies Table matching ref-4.png */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Cancellation Policies
            </h4>

            {formattedPolicies.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-slate-200 text-xs text-slate-400 text-center">
                Standard operator cancellation policies apply.
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 font-bold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-2.5 px-4 font-bold">Cancellation Time</th>
                      <th className="py-2.5 px-4 text-right font-bold">Refund (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium">
                    {formattedPolicies.map((p, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="py-2.5 px-4 text-slate-800 dark:text-slate-200 font-semibold">
                          {p.label}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {p.refund}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
