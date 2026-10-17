"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";

export function CtaSection() {
  return (
    <section className="relative py-28 sm:py-36 bg-gradient-to-r from-[#EFF6FF] via-[#FFFDF9] to-[#FEF9EE] dark:from-[#0B1424] dark:via-[#0E1726] dark:to-[#1C170E] overflow-hidden transition-colors border-t border-slate-100 dark:border-slate-800">
      {/* Decorative Whimsical Hand-Drawn Doodle Watermarks matching Reference 7 */}
      {/* Left Starburst */}
      <div className="absolute top-16 left-8 sm:left-20 pointer-events-none opacity-25 dark:opacity-10 text-sky-500 select-none">
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
          <line x1="30" y1="5" x2="30" y2="55" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="5" y1="30" x2="55" y2="30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="12" y1="12" x2="48" y2="48" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="12" y1="48" x2="48" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>

      {/* Bottom Left Spiral */}
      <div className="absolute bottom-12 left-10 sm:left-24 pointer-events-none opacity-20 dark:opacity-10 text-slate-400 select-none hidden sm:block">
        <svg width="70" height="70" viewBox="0 0 100 100" fill="none">
          <path
            d="M50 50 A 5 5 0 0 1 55 55 A 10 10 0 0 1 45 65 A 18 18 0 0 1 32 47 A 28 28 0 0 1 60 22 A 38 38 0 0 1 88 60"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Top Right Isometric Diamond */}
      <div className="absolute top-16 right-10 sm:right-28 pointer-events-none opacity-25 dark:opacity-10 text-amber-500 select-none">
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
          <rect x="30" y="8" width="28" height="28" rx="4" transform="rotate(45 30 8)" stroke="currentColor" strokeWidth="2" />
          <rect x="30" y="16" width="16" height="16" rx="2" transform="rotate(45 30 16)" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </div>

      {/* Bottom Right Zigzag */}
      <div className="absolute bottom-14 right-8 sm:right-24 pointer-events-none opacity-25 dark:opacity-10 text-amber-500 select-none">
        <svg width="100" height="30" viewBox="0 0 100 30" fill="none">
          <path
            d="M5 25 L 20 5 L 35 25 L 50 5 L 65 25 L 80 5 L 95 25"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center relative z-10 flex flex-col items-center">
        {/* Main Headline with Yellow Highlighter Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-950 dark:text-white tracking-tight leading-[1.15]">
            <span className="relative inline-block px-4 py-1.5 rounded-2xl bg-[#FDE68A] text-slate-950 font-black -rotate-2 shadow-xs mr-2">
              Ready
            </span>
            to Start
            <br />
            Earning?
          </h2>

          <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg max-w-xl mx-auto leading-relaxed pt-2">
            Join the platform that rewards you more for every booking.
          </p>
        </motion.div>

        {/* CTA Button with Hand-Drawn Spark Accents matching Reference 7 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="relative mt-10 inline-block"
        >
          {/* Top-Left Spark lines */}
          <div className="absolute -top-6 -left-6 pointer-events-none text-slate-900 dark:text-white/80 select-none">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <line x1="12" y1="2" x2="12" y2="8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="4" y1="6" x2="8" y2="10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="2" y1="14" x2="8" y2="14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>

          {/* Bottom-Right Spark lines */}
          <div className="absolute -bottom-6 -right-6 pointer-events-none text-slate-900 dark:text-white/80 select-none">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <line x1="16" y1="14" x2="22" y2="14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="16" y1="18" x2="20" y2="22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="12" y1="16" x2="12" y2="22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>

          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-2xl bg-[#E24B4B] hover:bg-[#D92D20] text-white font-bold px-10 py-4 text-base sm:text-lg shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/35 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 group"
          >
            <span>Get Started</span>
            <ArrowRight className="h-5 w-5 ml-2 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
