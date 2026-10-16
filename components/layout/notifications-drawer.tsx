"use client";

import React from "react";
import { Drawer } from "@/components/ui/drawer";
import { useUiStore } from "@/store/ui-store";
import { Bell, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";

export function NotificationsDrawer() {
  const { notificationsOpen, setNotificationsOpen } = useUiStore();
  const { agent } = useAuthStore();

  // Real context-derived notifications from agency status and wallet
  const items: Array<{
    id: string;
    type: "info" | "warning" | "success";
    title: string;
    description: string;
    time: string;
  }> = [];

  if (agent) {
    if (agent.status === "PENDING_KYC") {
      items.push({
        id: "kyc-pending",
        type: "warning",
        title: "KYC Documents Required",
        description: "Submit agency PAN Card and GST certificate to unlock instant seat ticketing.",
        time: "Action required",
      });
    } else if (agent.status === "KYC_SUBMITTED") {
      items.push({
        id: "kyc-review",
        type: "info",
        title: "KYC Under Verification",
        description: "Your agency verification documents are under review by platform compliance.",
        time: "In progress",
      });
    } else if (agent.status === "APPROVED") {
      items.push({
        id: "kyc-approved",
        type: "success",
        title: "Agency Account Active",
        description: "Your agency is approved for instant wallet seat booking and live GDS ticketing.",
        time: "Active",
      });
    }

    if (agent.wallet && Number(agent.wallet.cashBalance) < 1000) {
      items.push({
        id: "wallet-low",
        type: "warning",
        title: "Low Wallet Balance",
        description: "Top up your agency wallet to ensure uninterrupted ticket bookings for customers.",
        time: "Balance alert",
      });
    }
  }

  const icons = {
    info: <Info className="h-5 w-5 text-sky-500" />,
    warning: <AlertCircle className="h-5 w-5 text-amber-500" />,
    success: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
  };

  return (
    <Drawer
      isOpen={notificationsOpen}
      onClose={() => setNotificationsOpen(false)}
      title="Notifications & Alerts"
      description="Operational alerts, KYC updates, and financial status"
      width="md"
    >
      <div className="space-y-4">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-10 text-center space-y-3">
            <div className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
              <Bell className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No New Notifications
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                All agency operations and booking services are operating smoothly.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/40"
              >
                <div className="p-1 rounded-md bg-white dark:bg-slate-900 shadow-xs shrink-0 mt-0.5">
                  {icons[item.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {item.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {item.time}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Drawer>
  );
}
