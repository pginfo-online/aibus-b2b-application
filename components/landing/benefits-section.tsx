"use client";

import React from "react";
import { Bus, TrendingUp, Zap, Clock, Headphones, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";

const PLATFORM_BENEFITS = [
  {
    icon: Bus,
    iconBg: "bg-rose-50 text-[#E24B4B] dark:bg-red-950/40 dark:text-red-400",
    title: "Massive Inventory",
    description:
      "Access to 6,200+ bus operators and 6,50,000+ routes through AiBus's direct network. Never miss a sale — if a bus exists, it's on AiBus.",
  },
  {
    icon: TrendingUp,
    iconBg: "bg-orange-50 text-orange-500 dark:bg-orange-950/40 dark:text-orange-400",
    title: "Industry First Add-ons",
    description:
      "Earn on travel insurance and cancellation protection. Income streams that ticket-only platforms don't offer.",
  },
  {
    icon: Zap,
    iconBg: "bg-amber-50 text-amber-500 dark:bg-amber-950/40 dark:text-amber-400",
    title: "Instant Confirmation",
    description:
      "Real-time inventory sync with operators. Book tickets and get instant confirmation. No waiting, no uncertainty.",
  },
  {
    icon: Clock,
    iconBg: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
    title: "Quick Settlements",
    description:
      "Get your commissions settled quickly. No long waiting periods or complicated payout processes.",
  },
  {
    icon: Headphones,
    iconBg: "bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400",
    title: "Dedicated Support",
    description:
      "24/7 support team for bookings, cancellations, and any issues you face along the way.",
  },
  {
    icon: ShieldCheck,
    iconBg: "bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400",
    title: "Trusted Platform",
    description:
      "Powered by AiBus, serving millions of passenger seats with high-availability GDS uptime. Your customers are in safe hands.",
  },
];

export function BenefitsSection() {
  return (
    <section
      id="landing-page-section-benefits"
      className="relative py-24 sm:py-28 bg-[#FDF9F7] dark:bg-[#0E1726] overflow-hidden transition-colors"
    >
      {/* Delicate Geometric / Doodle Background Watermarks matching ref-4 and ref-5 */}
      <div className="absolute top-12 left-6 sm:left-12 pointer-events-none opacity-20 dark:opacity-10 text-slate-400 select-none">
        <svg width="80" height="80" viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6" />
          <line x1="50" y1="8" x2="50" y2="20" stroke="currentColor" strokeWidth="2" />
          <line x1="50" y1="80" x2="50" y2="92" stroke="currentColor" strokeWidth="2" />
          <line x1="8" y1="50" x2="20" y2="50" stroke="currentColor" strokeWidth="2" />
          <line x1="80" y1="50" x2="92" y2="50" stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>

      <div className="absolute top-20 right-6 sm:right-16 pointer-events-none opacity-20 dark:opacity-10 text-slate-400 select-none">
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
          <path
            d="M30 0L35 25L60 30L35 35L30 60L25 35L0 30L25 25L30 0Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
        </svg>
      </div>

      <div className="absolute bottom-12 left-10 pointer-events-none opacity-15 dark:opacity-5 text-slate-400 select-none hidden lg:block">
        <svg width="120" height="24" viewBox="0 0 120 24" fill="none">
          <path
            d="M0 12 Q30 0 60 12 T120 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="4 4"
          />
        </svg>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3.5">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <span className="inline-flex items-center px-4 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200/60 dark:border-purple-900/40">
              Platform Benefits
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight"
          >
            Everything You Need to Grow
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed"
          >
            More than just a ticketing platform — we&apos;re your profit partner
          </motion.p>
        </div>

        {/* 6 Grid Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
          {PLATFORM_BENEFITS.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                whileHover={{ y: -5 }}
                className="rounded-3xl p-7 sm:p-8 bg-white/80 dark:bg-slate-900/70 backdrop-blur-xs border border-slate-200/60 dark:border-slate-800 shadow-xs hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 group"
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center ${benefit.iconBg} group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className="h-6 w-6 stroke-[2.2]" />
                </div>

                <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-5">
                  {benefit.title}
                </h3>

                <p className="text-slate-600 dark:text-slate-300 text-sm mt-3 leading-relaxed">
                  {benefit.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
