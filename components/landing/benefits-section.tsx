import React from "react";
import { Lock, Smartphone, Users, FileText, RefreshCw, Compass } from "lucide-react";

export function BenefitsSection() {
  const benefits = [
    {
      icon: <Lock className="h-6 w-6 text-[#D92D20]" />,
      title: "10-Minute Seat Locks",
      description:
        "Hold seats for 10 minutes while verifying passenger details or waiting for client approval without losing inventory.",
    },
    {
      icon: <Compass className="h-6 w-6 text-sky-500" />,
      title: "Live Multi-Deck Seat Maps",
      description:
        "Interactive lower and upper deck layouts reflecting live upstream GDS status, driver cockpit orientation, and seat types.",
    },
    {
      icon: <Users className="h-6 w-6 text-emerald-500" />,
      title: "Staff Account Hierarchy",
      description:
        "Invite booking agents, managers, and accountants under your agency with granular role-based permissions.",
    },
    {
      icon: <RefreshCw className="h-6 w-6 text-amber-500" />,
      title: "Automated Refund Tracking",
      description:
        "Inspect exact cancellation policy percentages, refund amounts, and cancellation charges before committing ticket cancellations.",
    },
    {
      icon: <FileText className="h-6 w-6 text-purple-500" />,
      title: "Branded PDF Tickets",
      description:
        "Generate clean, printable PDF tickets with boarding points, reporting times, emergency helpline, and agency branding.",
    },
    {
      icon: <Smartphone className="h-6 w-6 text-rose-500" />,
      title: "Optimized Mobile Agent Workflow",
      description:
        "Engineered for on-the-go bus booking from mobile browsers with fast city selector, date quick-pills, and bottom navigation.",
    },
  ];

  return (
    <section
      id="landing-page-section-benefits"
      className="py-20 bg-white dark:bg-slate-900 border-b border-slate-200/60 dark:border-slate-800/60"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#D92D20] bg-red-100 dark:bg-red-950/60 px-3 py-1 rounded-full">
            Platform Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Designed for Real Agent Operations
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
            Every feature is built directly against our high-throughput backend APIs to ensure reliable ticketing, zero duplicate bookings, and seamless reconciliation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-14">
          {benefits.map((b) => (
            <div
              key={b.title}
              className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md transition-all"
            >
              <div className="p-3 w-fit rounded-xl bg-white dark:bg-slate-900 shadow-xs border border-slate-200/60 dark:border-slate-700">
                {b.icon}
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-4">
                {b.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                {b.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
