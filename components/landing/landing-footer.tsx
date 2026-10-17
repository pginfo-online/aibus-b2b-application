"use client";

import React from "react";
import Link from "next/link";
import { Phone, Mail } from "lucide-react";
import { BrandLogo } from "@/components/landing/brand-logo";

export function LandingFooter() {
  return (
    <footer className="bg-white dark:bg-[#0B1220] text-slate-600 dark:text-slate-400 border-t border-slate-200/80 dark:border-slate-800 transition-colors select-none">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12">
          {/* Brand Info & Tagline (Col 1 to 5) */}
          <div className="space-y-4 md:col-span-5 lg:col-span-4">
            <BrandLogo href="/" />
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm pt-2">
              India&apos;s most rewarding bus ticketing platform for travel agents. Earn more, serve better, grow faster.
            </p>
          </div>

          {/* Quick Links (Col 6 to 7) */}
          <div className="space-y-3.5 md:col-span-3 lg:col-span-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="#landing-page-section-earn"
                  className="hover:text-[#E24B4B] dark:hover:text-white transition-colors"
                >
                  How You Earn
                </Link>
              </li>
              <li>
                <Link
                  href="#landing-page-section-benefits"
                  className="hover:text-[#E24B4B] dark:hover:text-white transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="/about-aibus"
                  className="hover:text-[#E24B4B] dark:hover:text-white transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="#landing-page-section-why-us"
                  className="hover:text-[#E24B4B] dark:hover:text-white transition-colors"
                >
                  Why Choose Us
                </Link>
              </li>
              <li>
                <Link
                  href="#landing-page-section-faqs"
                  className="hover:text-[#E24B4B] dark:hover:text-white transition-colors"
                >
                  FAQs
                </Link>
              </li>
              <li>
                <span className="text-slate-400 dark:text-slate-500 cursor-default">
                  AiBus Edge
                </span>
              </li>
              <li>
                <Link
                  href="/about-aibus"
                  className="hover:text-[#E24B4B] dark:hover:text-white transition-colors"
                >
                  AiBus Platform
                </Link>
              </li>
            </ul>
          </div>

          {/* Support (Col 8 to 9) */}
          <div className="space-y-3.5 md:col-span-2 lg:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Support
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/about-aibus"
                  className="hover:text-[#E24B4B] dark:hover:text-white transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/about-aibus"
                  className="hover:text-[#E24B4B] dark:hover:text-white transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/about-aibus"
                  className="hover:text-[#E24B4B] dark:hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Get In Touch (Col 10 to 12) */}
          <div className="space-y-3.5 md:col-span-2 lg:col-span-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Get in Touch
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                <a
                  href="tel:08069807358"
                  className="hover:text-[#E24B4B] dark:hover:text-white transition-colors font-medium"
                >
                  080 69807358
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                <a
                  href="mailto:support@aibus.in"
                  className="hover:text-[#E24B4B] dark:hover:text-white transition-colors font-medium break-all"
                >
                  support@aibus.in
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar matching Reference 7 */}
        <div className="mt-14 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-4">
          <p>© 2026 AiBus Technologies. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/about-aibus" className="hover:text-slate-800 dark:hover:text-white transition-colors">
              Terms
            </Link>
            <Link href="/about-aibus" className="hover:text-slate-800 dark:hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="/about-aibus" className="hover:text-slate-800 dark:hover:text-white transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
