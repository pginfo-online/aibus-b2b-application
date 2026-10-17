"use client";

import React, { useState } from "react";
import { Award, IndianRupee, Layers, Users, Sparkles, Cpu, Check, X as Cross, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const ADVANTAGES = [
  {
    icon: Award,
    iconBg: "bg-rose-50 text-[#E24B4B] dark:bg-red-950/40 dark:text-red-400",
    title: "Backed by a travel giant",
    description:
      "Powered by AiBus, India's dedicated B2B bus ticketing infrastructure engineered for travel agents.",
  },
  {
    icon: IndianRupee,
    iconBg: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
    title: "More ways to earn",
    description:
      "Increase your income with add-ons like travel insurance and other value-added services.",
  },
  {
    icon: Layers,
    iconBg: "bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400",
    title: "Unmatched inventory",
    description:
      "Access a wide network of operators, routes, and seats across India - all in real time.",
  },
  {
    icon: Users,
    iconBg: "bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400",
    title: "One login, all operators",
    description:
      "No more juggling multiple systems. Book across all partners from a single platform.",
  },
  {
    icon: Sparkles,
    iconBg: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
    title: "Simple, agent-friendly flows",
    description:
      "Designed to reduce clicks, avoid errors, and help you serve customers faster.",
  },
  {
    icon: Cpu,
    iconBg: "bg-rose-50 text-rose-500 dark:bg-rose-950/40 dark:text-rose-400",
    title: "Cutting-edge technology",
    description:
      "Fast, reliable, and built for scale - bookings, payments, and reports work smoothly.",
  },
];

const COMPARISON_ITEMS = [
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

export function WhyUsSection() {
  const [showComparison, setShowComparison] = useState(false);

  return (
    <section
      id="landing-page-section-why-us"
      className="py-24 sm:py-28 bg-white dark:bg-[#0B1220] transition-colors border-t border-slate-100 dark:border-slate-800/80"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3.5">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <span className="inline-flex items-center px-4 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/40">
              Our Advantages
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight"
          >
            Why Choose Us?
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed"
          >
            Everything a modern travel agent needs — in one powerful platform
          </motion.p>
        </div>

        {/* 6 Centered Cards Grid matching Reference 5 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-16">
          {ADVANTAGES.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                whileHover={{ y: -5 }}
                className="rounded-3xl p-8 bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-xs hover:shadow-lg transition-all duration-300 text-center flex flex-col items-center group"
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.iconBg} group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className="h-6 w-6 stroke-[2.2]" />
                </div>

                <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-5">
                  {item.title}
                </h3>

                <p className="text-slate-600 dark:text-slate-300 text-sm mt-3 leading-relaxed max-w-xs">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Technical Deep Dive Toggle (AiBus B2B vs Generic Portals) */}
        <div className="mt-14 flex flex-col items-center">
          <button
            onClick={() => setShowComparison(!showComparison)}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-slate-300 hover:border-slate-400 dark:border-slate-700 dark:hover:border-slate-600 bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 text-sm font-semibold transition-all"
          >
            <span>{showComparison ? "Hide Detailed Feature Comparison" : "Compare AiBus B2B vs Generic Portals"}</span>
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${
                showComparison ? "rotate-180" : ""
              }`}
            />
          </button>

          <AnimatePresence>
            {showComparison && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full mt-8 overflow-hidden"
              >
                <div className="overflow-x-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                  <div className="min-w-[660px]">
                    <div className="grid grid-cols-12 bg-slate-50 dark:bg-slate-800/70 p-4 font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                      <div className="col-span-4">Feature / Capability</div>
                      <div className="col-span-4 text-[#E24B4B] font-extrabold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#E24B4B]" />
                        AiBus B2B Platform
                      </div>
                      <div className="col-span-4 text-slate-500 dark:text-slate-400">
                        Generic Consumer Portals
                      </div>
                    </div>

                    <div className="divide-y divide-slate-100 dark:divide-slate-800/70">
                      {COMPARISON_ITEMS.map((item) => (
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
