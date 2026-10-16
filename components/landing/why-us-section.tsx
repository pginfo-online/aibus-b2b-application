import React from "react";
import { Check, X as Cross } from "lucide-react";

export function WhyUsSection() {
  const comparisonItems = [
    {
      feature: "B2B Net Fare Settlement",
      aibus: "Instant net debit from agent wallet",
      retailOta: "Full retail price charged upfront, monthly rebates",
    },
    {
      feature: "Seat Hold Window",
      aibus: "Authoritative 10-minute hold with GDS reservation",
      retailOta: "No seat locks; seats can be snapped mid-form",
    },
    {
      feature: "Financial Accounting",
      aibus: "Cryptographic double-entry ledger statement",
      retailOta: "Basic invoice lists with unverified deductions",
    },
    {
      feature: "Cancellation Charges",
      aibus: "Direct upstream provider policy transparently broken down",
      retailOta: "Heavy platform convenience retention fees",
    },
    {
      feature: "Multi-Staff Delegation",
      aibus: "Role-based accounts (Owner, Manager, Booking Agent, Accountant)",
      retailOta: "Shared logins with no individual booking traceability",
    },
  ];

  return (
    <section
      id="landing-page-section-why-us"
      className="py-20 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200/60 dark:border-slate-800/60"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#D92D20] bg-red-100 dark:bg-red-950/60 px-3 py-1 rounded-full">
            Competitive Comparison
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Why Travel Agents Choose AiBus
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
            See how our dedicated B2B ticketing infrastructure outclasses standard consumer booking websites for travel agencies.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="mt-14 overflow-x-auto">
          <div className="min-w-[640px] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
            <div className="grid grid-cols-12 bg-slate-100/70 dark:bg-slate-800/70 p-4 font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
              <div className="col-span-4">Feature / Capability</div>
              <div className="col-span-4 text-[#D92D20] dark:text-red-400 font-extrabold flex items-center gap-1">
                AiBus B2B Platform
              </div>
              <div className="col-span-4 text-slate-500 dark:text-slate-400">
                Generic Retail Portals
              </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {comparisonItems.map((item) => (
                <div
                  key={item.feature}
                  className="grid grid-cols-12 p-4 text-sm items-center hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="col-span-4 font-semibold text-slate-900 dark:text-slate-100 pr-2">
                    {item.feature}
                  </div>
                  <div className="col-span-4 flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-medium pr-2">
                    <Check className="h-4 w-4 shrink-0 text-emerald-500" />
                    <span>{item.aibus}</span>
                  </div>
                  <div className="col-span-4 flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
                    <Cross className="h-4 w-4 shrink-0 text-slate-400" />
                    <span>{item.retailOta}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
