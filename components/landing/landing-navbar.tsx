"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Bus, Menu, X, ArrowRight, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";

export function LandingNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuthStore();

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "How You Earn", href: "/#landing-page-section-earn" },
    { label: "Features", href: "/#landing-page-section-benefits" },
    { label: "About", href: "/about-aibus" },
    { label: "Why Us", href: "/#landing-page-section-why-us" },
    { label: "FAQs", href: "/#landing-page-section-faqs" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90 transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D92D20] text-white shadow-md shadow-red-600/20 group-hover:bg-[#B42318] transition-colors">
            <Bus className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1">
              Ai<span className="text-[#D92D20]">Bus</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-red-100 text-[#D92D20] dark:bg-red-950/60 dark:text-red-300 ml-1">
                B2B
              </span>
            </span>
            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 -mt-1 tracking-wide">
              Agent Booking Platform
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Main Navigation">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-semibold text-slate-600 hover:text-[#D92D20] dark:text-slate-300 dark:hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Action CTAs */}
        <div className="hidden sm:flex items-center gap-3">
          {user ? (
            <Link href="/portal">
              <Button variant="primary" size="md">
                <UserCheck className="h-4 w-4 mr-1" />
                Go to Portal
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/sign-in">
                <Button variant="ghost" size="md">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="md">
                  Get Started
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex sm:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 px-4 pt-2 pb-6 space-y-3 animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-lg dark:text-slate-300 dark:hover:bg-slate-800"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
            {user ? (
              <Link href="/portal" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" className="w-full">
                  Go to Agent Portal
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/sign-in" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full">
                    Start Earning
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
