"use client";

import React, { useState } from "react";
import { Drawer } from "@/components/ui/drawer";
import { formatTime } from "@/lib/utils";
import { Phone } from "lucide-react";
import type { BoardingPoint, DroppingPoint } from "@/types/api";

interface BoardingTimelineDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  busName: string;
  boardingPoints: BoardingPoint[];
  droppingPoints: DroppingPoint[];
}

export function BoardingTimelineDrawer({
  isOpen,
  onClose,
  busName,
  boardingPoints,
  droppingPoints,
}: BoardingTimelineDrawerProps) {
  const [activeTab, setActiveTab] = useState<"boarding" | "dropping">("boarding");

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Boarding & Dropping Locations"
      description={busName}
      width="md"
    >
      <div className="space-y-6">
        {/* Tab switch */}
        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
          <button
            type="button"
            onClick={() => setActiveTab("boarding")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === "boarding"
                ? "bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
            }`}
          >
            Boarding Points ({boardingPoints.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("dropping")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === "dropping"
                ? "bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
            }`}
          >
            Dropping Points ({droppingPoints.length})
          </button>
        </div>

        {/* Vertical Timeline */}
        {activeTab === "boarding" ? (
          boardingPoints.length === 0 ? (
            <p className="text-center text-xs text-slate-400 p-6">
              No specific boarding points listed for this route.
            </p>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {boardingPoints.map((point) => (
                <div key={`${point.PickupCode}-${point.PickupTime}`} className="relative group">
                  {/* Timeline dot */}
                  <div className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#D92D20] dark:border-slate-900 ring-2 ring-red-200 dark:ring-red-950/60" />

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-[#D92D20] dark:text-red-400 font-mono">
                        {formatTime(point.PickupTime)}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {point.PickupName}
                      </h4>
                    </div>

                    {point.Address && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {point.Address}
                      </p>
                    )}

                    {point.Landmark && (
                      <p className="text-[11px] text-slate-400 italic">
                        Landmark: {point.Landmark}
                      </p>
                    )}

                    {point.Contact && (
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-0.5">
                        <Phone className="h-3 w-3 text-slate-400" />
                        <span>Contact: {point.Contact}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : droppingPoints.length === 0 ? (
          <p className="text-center text-xs text-slate-400 p-6">
            No specific dropping points listed for this route.
          </p>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
            {droppingPoints.map((point) => (
              <div key={`${point.DropoffCode}-${point.DropoffTime}`} className="relative group">
                {/* Timeline dot */}
                <div className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-amber-500 dark:border-slate-900 ring-2 ring-amber-200 dark:ring-amber-950/60" />

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-amber-600 dark:text-amber-400 font-mono">
                      {formatTime(point.DropoffTime)}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {point.DropoffName}
                    </h4>
                  </div>

                  {point.Address && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {point.Address}
                    </p>
                  )}

                  {point.Landmark && (
                    <p className="text-[11px] text-slate-400 italic">
                      Landmark: {point.Landmark}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Drawer>
  );
}
