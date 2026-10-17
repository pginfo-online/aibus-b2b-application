"use client";

import React from "react";
import { Ticket, ShieldPlus, ShieldCheck, TrendingUp } from "lucide-react";
import { motion } from "motion/react";

export function EarnSection() {
  return (
    <section
      id="landing-page-section-earn"
      className="relative pt-20 pb-28 bg-white dark:bg-[#0B1220] transition-colors"
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
            <span className="inline-flex items-center px-4 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-[#FEE4E2] text-[#D92D20] dark:bg-red-950/70 dark:text-red-300 border border-red-200/60 dark:border-red-900/40">
              Revenue Streams
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight"
          >
            How You Earn More
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed"
          >
            Multiple income streams on every single booking — not just tickets
          </motion.p>
        </div>

        {/* Bento Grid Layout matching Reference 3 & 4 */}
        <div className="mt-14 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Card 1: Ticket Commission (Tall Left Card) */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            whileHover={{ y: -4 }}
            className="lg:col-span-5 rounded-3xl bg-[#FFF5F5] dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 p-8 sm:p-9 flex flex-col justify-between shadow-xs hover:shadow-md transition-all group"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#FEE4E2] dark:bg-red-900/40 flex items-center justify-center text-[#E24B4B] group-hover:scale-110 transition-transform">
                <Ticket className="h-6 w-6 stroke-[2.2]" />
              </div>

              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-6">
                Ticket Commission
              </h3>

              <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base mt-3 leading-relaxed">
                Earn commission on every bus ticket you sell through the platform. The more you book, the more you earn — it&apos;s that simple.
              </p>
            </div>

            <div className="pt-8 sm:pt-10 mt-8 border-t border-red-200/60 dark:border-red-900/40">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                MONTHLY POTENTIAL
              </span>
              <div className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white mt-1 tracking-tight flex items-baseline">
                ₹50,000<span className="text-[#E24B4B] ml-0.5">*</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column (2 Smaller Cards on top, 1 Wide Card below) */}
          <div className="lg:col-span-7 flex flex-col gap-6 justify-between">
            {/* Top Row: Insurance + Cancellation Protection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Card 2: Insurance Commission */}
              <motion.div
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                whileHover={{ y: -4 }}
                className="rounded-3xl bg-[#FEFBF2] dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 p-7 flex flex-col justify-between shadow-xs hover:shadow-md transition-all group relative"
              >
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                    <ShieldPlus className="h-6 w-6 stroke-[2.2]" />
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100/90 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200">
                    + Extra
                  </span>
                </div>

                <div className="mt-5">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    Insurance Commission
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 text-sm mt-2 leading-relaxed">
                    Earn extra on every travel insurance policy your customers opt for. A revenue stream others don&apos;t offer.
                  </p>
                </div>
              </motion.div>

              {/* Card 3: Cancellation Protection */}
              <motion.div
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                whileHover={{ y: -4 }}
                className="rounded-3xl bg-[#F3F9FE] dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/30 p-7 flex flex-col justify-between shadow-xs hover:shadow-md transition-all group relative"
              >
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-sky-100 dark:bg-sky-900/40 flex items-center justify-center text-sky-600 dark:text-sky-400 group-hover:scale-110 transition-transform">
                    <ShieldCheck className="h-6 w-6 stroke-[2.2]" />
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-sky-100/90 dark:bg-sky-900/60 text-sky-800 dark:text-sky-200">
                    + Extra
                  </span>
                </div>

                <div className="mt-5">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    Cancellation Protection
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 text-sm mt-2 leading-relaxed">
                    Additional earnings when customers add cancellation protection to their bookings.
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Card 4: Earn Up to 20% More (Wide Bottom Card) */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ y: -4 }}
              className="rounded-3xl bg-gradient-to-r from-[#FEF8EC] via-[#FFFBF5] to-[#FEF8EC] dark:from-amber-950/30 dark:to-slate-900 border border-amber-200/80 dark:border-amber-900/40 p-7 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xs hover:shadow-md transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-6 w-6 stroke-[2.2]" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      Earn Up to 20% More
                    </h3>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-200/80 dark:bg-amber-900/70 text-amber-900 dark:text-amber-200">
                      Bonus
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-sm max-w-md leading-relaxed">
                    With add-ons vs ticket-only platforms. Stack your earnings with insurance, cancellation protection, and more on every booking.
                  </p>
                </div>
              </div>

              <div className="sm:text-right shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-amber-200/60 dark:border-amber-900/40 w-full sm:w-auto">
                <div className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                  +20%
                </div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mt-0.5">
                  via add-on commissions
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Decorative Scalloped / Wavy Transition Border into the next section */}
      <div className="absolute -bottom-1 left-0 right-0 w-full overflow-hidden leading-none pointer-events-none z-10">
        <svg
          viewBox="0 0 1440 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="relative block w-full h-8 sm:h-12 text-[#FDF9F7] dark:text-[#0E1726]"
        >
          <path
            d="M0,0 C120,40 240,40 360,0 C480,40 600,40 720,0 C840,40 960,40 1080,0 C1200,40 1320,40 1440,0 L1440,60 L0,60 Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </section>
  );
}
