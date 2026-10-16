import React from "react";
import { CheckCircle2, DollarSign, Wallet, Percent } from "lucide-react";

export function EarnSection() {
  const earnSteps = [
    {
      icon: <Percent className="h-6 w-6 text-[#D92D20]" />,
      title: "Direct Base Commission",
      description:
        "Earn authoritative, tiered commissions starting on ticket base fare across government and private multi-axle operators.",
      highlight: "Authoritative Payout",
    },
    {
      icon: <Wallet className="h-6 w-6 text-amber-500" />,
      title: "Instant Net Fare Debit",
      description:
        "When booking with your agent wallet, you only pay Net Fare (Gross Fare minus your Commission). Keep your profit in hand immediately.",
      highlight: "Zero Wait Time",
    },
    {
      icon: <DollarSign className="h-6 w-6 text-emerald-500" />,
      title: "Double-Entry Ledger Tracking",
      description:
        "Every rupee is accounted for with cryptographic double-entry ledger bookkeeping. Reconcile transactions, top-ups, and cancellations effortlessly.",
      highlight: "Full Transparency",
    },
  ];

  return (
    <section
      id="landing-page-section-earn"
      className="py-20 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200/60 dark:border-slate-800/60"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#D92D20] bg-red-100 dark:bg-red-950/60 px-3 py-1 rounded-full">
            Agent Commercials
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            How Travel Agents Earn with AiBus
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
            Unlike retail portals that treat agents like standard customers, AiBus provides a dedicated B2B financial infrastructure engineered for higher profit retention.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-14">
          {earnSteps.map((step) => (
            <div
              key={step.title}
              className="relative p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:scale-110 transition-transform">
                  {step.icon}
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {step.highlight}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-5">
                {step.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Commercial Highlights Card */}
        <div className="mt-12 rounded-2xl bg-gradient-to-r from-slate-900 to-[#172033] p-8 text-white border border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-3">
              <h3 className="text-xl sm:text-2xl font-bold">
                Commercial Benefits Summary
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                AiBus guarantees that agent commissions are never clawed back arbitrarily. All cancellations follow verified provider refund windows with explicit ledger audit records.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-sm text-slate-200">Real-time commission snapshots</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-sm text-slate-200">Automated ledger statement</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-sm text-slate-200">Staff sub-agent commissions</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-sm text-slate-200">One-click monthly CSV export</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
