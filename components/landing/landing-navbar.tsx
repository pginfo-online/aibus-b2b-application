"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ArrowRight, UserCheck } from "lucide-react";
import { BrandLogo } from "@/components/landing/brand-logo";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/lib/utils";

export function LandingNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user } = useAuthStore();

  const navLinks = [
    { label: "Home", href: "#hero" },
    { label: "How You Earn", href: "#landing-page-section-earn" },
    { label: "Features", href: "#landing-page-section-benefits" },
    { label: "About", href: "/about-aibus" },
    { label: "Why Us", href: "#landing-page-section-why-us" },
    { label: "FAQs", href: "#landing-page-section-faqs" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        isScrolled
          ? "bg-white/95 dark:bg-[#0B1220]/95 backdrop-blur-md shadow-xs border-b border-slate-200/70 dark:border-slate-800/80 py-3"
          : "bg-white/80 dark:bg-[#0B1220]/80 backdrop-blur-sm border-b border-slate-200/40 dark:border-slate-800/40 py-4"
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <BrandLogo href="/" />

        {/* Desktop Navigation Links */}
        <nav
          className="hidden md:flex items-center gap-7 lg:gap-8"
          aria-label="Main Navigation"
        >
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-semibold text-slate-700 hover:text-[#E24B4B] dark:text-slate-200 dark:hover:text-[#EF4444] transition-colors relative group py-1"
            >
              {link.label}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#E24B4B] transition-all duration-200 group-hover:w-full rounded-full" />
            </Link>
          ))}
        </nav>

        {/* Action CTAs (Pill-styled buttons matching reference designs) */}
        <div className="hidden sm:flex items-center gap-3">
          {user ? (
            <Link
              href="/portal"
              className="inline-flex items-center justify-center rounded-full bg-[#E24B4B] hover:bg-[#D92D20] text-white px-5 py-2 text-sm font-semibold shadow-xs hover:shadow-md transition-all active:scale-[0.98]"
            >
              <UserCheck className="h-4 w-4 mr-1.5" />
              Go to Portal
            </Link>
          ) : (
            <>
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-full border border-slate-700 text-slate-800 hover:border-slate-900 hover:bg-slate-100/80 dark:border-slate-400 dark:text-slate-100 dark:hover:border-white dark:hover:bg-slate-800/80 px-5 py-2 text-sm font-semibold transition-all active:scale-[0.98]"
              >
                Get Started
              </Link>
              <Link
                href="/sign-in"
                className="inline-flex items-center justify-center rounded-full bg-[#E24B4B] hover:bg-[#D92D20] text-white px-5 py-2 text-sm font-semibold shadow-xs hover:shadow-md shadow-red-500/10 transition-all active:scale-[0.98]"
              >
                Sign In
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex sm:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle mobile navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-b border-slate-200/80 bg-white/95 dark:border-slate-800 dark:bg-[#0B1220]/95 backdrop-blur-xl px-5 pt-3 pb-6 space-y-4 shadow-xl">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 text-base font-semibold text-slate-800 hover:text-[#E24B4B] hover:bg-slate-50 rounded-xl dark:text-slate-200 dark:hover:bg-slate-800/60 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2.5">
            {user ? (
              <Link
                href="/portal"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex items-center justify-center w-full rounded-full bg-[#E24B4B] text-white py-3 font-semibold shadow-md"
              >
                Go to Agent Portal
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex items-center justify-center w-full rounded-full border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 py-2.5 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Get Started
                </Link>
                <Link
                  href="/sign-in"
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex items-center justify-center w-full rounded-full bg-[#E24B4B] hover:bg-[#D92D20] text-white py-2.5 font-semibold shadow-md transition-colors"
                >
                  Sign In
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
