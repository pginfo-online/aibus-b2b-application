"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Zap, TrendingUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const HERO_SLIDES = [
  {
    image: "/hero/hero_1.jpg",
    alt: "Premium Volvo multi-axle luxury bus cruising at dusk",
    tagline: "Nationwide Luxury Bus Inventory",
  },
  {
    image: "/hero/hero_2.jpg",
    alt: "Modern sleeper coach at high-tech bus terminal platform",
    tagline: "Real-Time Direct GDS Integration",
  },
  {
    image: "/hero/hero_3.jpg",
    alt: "Executive sleeper coach interior with recliner berths",
    tagline: "Higher Yield & Instant Commissions",
  },
];

export function HeroSlideshow() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    // Auto cycle every 6 seconds
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full overflow-hidden min-h-[600px] lg:min-h-[700px] flex items-center bg-[#0B1220]">
      {/* Background Slideshow with Smooth Cross-fades */}
      {HERO_SLIDES.map((slide, index) => (
        <div
          key={slide.image}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none"
          }`}
          style={{ transitionProperty: "opacity, transform" }}
          aria-hidden={index !== currentSlide}
        >
          <Image
            src={slide.image}
            alt={slide.alt}
            fill
            priority={index === 0}
            className="object-cover object-center"
            sizes="100vw"
          />
          {/* Multi-layer Dark Gradient for Maximum Readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/75 to-slate-950/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1220] via-transparent to-slate-950/40" />
        </div>
      ))}

      {/* Foreground Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 w-full">
        <div className="max-w-2xl lg:max-w-3xl space-y-8">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/20 border border-red-500/30 text-red-200 backdrop-blur-md text-xs font-semibold tracking-wide">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Dedicated B2B Bus Platform for Travel Agents</span>
          </div>

          {/* Main Headline */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
              Seats That <span className="text-[#EF4444]">Pay More</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-200 font-normal leading-relaxed max-w-2xl">
              An exceptionally rewarding bus-ticketing platform for travel agents. Earn more on every booking, plus exclusive commissions on add-ons that other platforms may not offer.
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <Link href="/register">
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto text-base font-bold shadow-lg shadow-red-600/30"
              >
                Start Earning
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto text-base font-semibold border-white/30 text-white hover:bg-white/10 dark:border-white/30"
              >
                Sign In to Portal
              </Button>
            </Link>
          </div>

          {/* Quick Value Metrics */}
          <div className="grid grid-cols-3 gap-4 pt-8 border-t border-white/10 max-w-xl">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-white/10 text-emerald-400 shrink-0">
                <TrendingUp className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">B2B Commission</p>
                <p className="text-sm font-bold text-white">Up to 10% Net</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-white/10 text-amber-400 shrink-0">
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Seat Lock</p>
                <p className="text-sm font-bold text-white">10-Min Hold</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-white/10 text-sky-400 shrink-0">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Settlement</p>
                <p className="text-sm font-bold text-white">Wallet Ledger</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 right-6 z-20 flex items-center gap-2">
        {HERO_SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === currentSlide ? "w-8 bg-[#EF4444]" : "w-2 bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
