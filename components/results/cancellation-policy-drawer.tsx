"use client";

import React from "react";
import { Drawer } from "@/components/ui/drawer";
import { AlertCircle } from "lucide-react";
import type { CancellationPolicyRule } from "@/types/api";

interface CancellationPolicyDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  busName: string;
  policies?: CancellationPolicyRule[] | null;
}

export function CancellationPolicyDrawer({
  isOpen,
  onClose,
  busName,
  policies = [],
}: CancellationPolicyDrawerProps) {
  const policyList = Array.isArray(policies) ? policies : [];

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Cancellation & Refund Terms"
      description={busName}
      width="md"
    >
      <div className="space-y-6">
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-300 text-xs">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>
            Cancellation charges are governed directly by the bus operator. Refunds are credited instantly back to your agency wallet once processed.
          </span>
        </div>

        {policyList.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            <p className="font-semibold text-slate-600 dark:text-slate-300">
              Standard Operator Cancellation Terms Apply
            </p>
            <p className="mt-1">
              Check exact cancellability and refund amounts on the booking review screen before confirming.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800/80 font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                <tr>
                  <th className="py-3 px-3">Cancellation Window</th>
                  <th className="py-3 px-3">Refund %</th>
                  <th className="py-3 px-3 text-right">Deduction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {policyList.map((rule, idx) => {
                  const hours = Math.round(rule.Mins / 60);
                  const refundPct = Math.max(0, 100 - rule.Pct);

                  let windowLabel = "";
                  if (idx === 0) {
                    windowLabel = `More than ${hours} hrs before journey`;
                  } else {
                    const prevHours = Math.round(policyList[idx - 1].Mins / 60);
                    windowLabel = `Between ${hours} and ${prevHours} hrs before`;
                  }

                  return (
                    <tr
                      key={rule.Mins}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-3 text-slate-900 dark:text-white font-semibold">
                        {windowLabel}
                      </td>
                      <td className="py-3 px-3 font-bold text-emerald-600 dark:text-emerald-400">
                        {refundPct}% Refund
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-red-600 dark:text-red-400">
                        {rule.Pct}% Penalty
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Drawer>
  );
}
