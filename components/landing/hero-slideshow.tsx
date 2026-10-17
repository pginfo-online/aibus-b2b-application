"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { motion } from "motion/react";

const HERO_SLIDES = [
  {
    image: "/hero/hero_1.jpg",
    alt: "Premium Volvo 9600 multi-axle luxury coach cruising on open highway at dusk",
    title: "Volvo 9600 Multi-Axle",
  },
  {
    image: "/hero/hero_2.jpg",
    alt: "Modern executive sleeper coach at modern platform terminal",
    title: "Real-Time Direct GDS",
  },
  {
    image: "/hero/hero_3.jpg",
    alt: "Ultra-luxury executive sleeper coach interior with recliner berths",
    title: "High-Margin Inventory",
  },
];

export function HeroSlideshow() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6500);
    return () => clearInterval(timer);
  }, []);

  return (
    <section
      id="hero"
      className="relative w-full overflow-hidden min-h-[640px] md:min-h-[720px] lg:min-h-[800px] flex items-center justify-center bg-slate-950 text-white"
    >
      {/* Background Slideshow with Smooth Ken Burns cross-fade */}
      {HERO_SLIDES.map((slide, index) => {
        const isActive = index === currentSlide;
        return (
          <div
            key={slide.image}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? "opacity-100 z-0" : "opacity-0 -z-10 pointer-events-none"
            }`}
            aria-hidden={!isActive}
          >
            <div
              className={`w-full h-full transition-transform duration-[8000ms] ease-out ${
                isActive ? "scale-105" : "scale-100"
              }`}
            >
              <Image
                src={slide.image}
                alt={slide.alt}
                fill
                priority={index === 0}
                className="object-cover object-center"
                sizes="100vw"
                quality={90}
              />
            </div>
            {/* Dark Vignette & Balanced Readability Gradient */}
            <div className="absolute inset-0 bg-radial-[at_center_center] from-black/20 via-black/55 to-black/85" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-slate-950/60" />
          </div>
        );
      })}

      {/* Main Hero Foreground Content */}
      <div className="relative z-10 mx-auto max-w-5xl px-4 py-24 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        {/* Animated Main Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="space-y-4 max-w-4xl"
        >
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[80px] font-black tracking-tight leading-[1.08] text-white drop-shadow-md">
            Seats that <br />
            <span className="relative inline-block pb-3">
              pay higher
              {/* Hand-drawn decorative red brush underline matching reference design */}
              <svg
                viewBox="0 0 280 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="absolute -bottom-1 sm:bottom-0 left-0 right-0 w-full h-3 sm:h-4 text-[#E24B4B] pointer-events-none"
                preserveAspectRatio="none"
              >
                <path
                  d="M4 14C68 5 190 4 276 10M12 17C105 9 198 8 268 14"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  opacity="0.95"
                />
              </svg>
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-base sm:text-lg md:text-xl text-slate-200/95 font-normal leading-relaxed pt-2 drop-shadow-sm">
            India&apos;s most rewarding bus ticketing platform for travel agents.
            <span className="block mt-1 sm:inline sm:mt-0">
              {" "}
              Earn more on every booking, plus exclusive commissions on add-ons that others don&apos;t offer.
            </span>
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
        >
          <Link
            href="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-white text-slate-900 font-bold px-8 py-3.5 text-base shadow-xl hover:bg-slate-100 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 group"
          >
            Start earning
            <ArrowRight className="h-4 w-4 ml-2 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>

          <Link
            href="/sign-in"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-slate-900/40 backdrop-blur-md border border-white/25 text-white font-medium px-8 py-3.5 text-base hover:bg-white/10 hover:border-white/40 active:scale-[0.98] transition-all duration-200 shadow-md group"
          >
            <Play className="h-3.5 w-3.5 fill-white text-white mr-2 transition-transform duration-200 group-hover:scale-110" />
            Sign In
          </Link>
        </motion.div>

        {/* Micro-trust copy */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-6 text-xs sm:text-sm text-slate-300/80 font-medium tracking-wide flex items-center justify-center gap-2"
        >
          <span>Free to join</span>
          <span className="text-white/40">•</span>
          <span>No setup fees</span>
          <span className="text-white/40">•</span>
          <span>Start earning in minutes</span>
        </motion.p>

        {/* Interactive Scroll Down Mouse Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="mt-12 sm:mt-16 flex flex-col items-center cursor-pointer"
          onClick={() => {
            const el = document.getElementById("landing-page-section-earn");
            el?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          <div className="w-5 h-9 rounded-full border-2 border-white/40 hover:border-white/70 flex items-start justify-center p-1.5 transition-colors">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="w-1 h-2 rounded-full bg-white"
            />
          </div>
        </motion.div>
      </div>

      {/* Slide Navigation Dots */}
      <div className="absolute bottom-16 sm:bottom-20 right-6 sm:right-10 z-20 flex items-center gap-2">
        {HERO_SLIDES.map((slide, idx) => (
          <button
            key={slide.title}
            onClick={() => setCurrentSlide(idx)}
            aria-label={`Switch to slide ${idx + 1}`}
            className={`transition-all duration-300 rounded-full ${
              idx === currentSlide
                ? "w-7 h-2 bg-[#E24B4B]"
                : "w-2 h-2 bg-white/40 hover:bg-white/75"
            }`}
          />
        ))}
      </div>

      {/* Smooth Organic Wave Divider at the bottom (matching ref-1 / ref-2) */}
      <div className="absolute -bottom-1 left-0 right-0 w-full overflow-hidden leading-none pointer-events-none z-10">
        <svg
          viewBox="0 0 1440 90"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="relative block w-full h-10 sm:h-14 lg:h-20 text-white dark:text-[#0B1220]"
        >
          <path
            d="M0,32 C360,95 1080,0 1440,50 L1440,90 L0,90 Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </section>
  );
}
