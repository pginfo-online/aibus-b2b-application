"use client";

import React from "react";
import Link from "next/link";
import { Bus, Shield, Mail, Phone, MapPin } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="bg-slate-950 text-slate-400 py-16 border-t border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand info */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D92D20] text-white">
                <Bus className="h-5 w-5" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">
                Ai<span className="text-[#D92D20]">Bus</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-red-950 text-red-400 ml-1">
                  B2B
                </span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              India&apos;s leading B2B bus-ticketing and inventory platform for travel agents, tour operators, and ticket resellers.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Shield className="h-4 w-4 text-emerald-400" />
              <span>PCI-DSS & ISO Compliant Infrastructure</span>
            </div>
          </div>

          {/* Quick links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Platform Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about-aibus" className="hover:text-white transition-colors">
                  About AiBus
                </Link>
              </li>
              <li>
                <Link href="/#landing-page-section-earn" className="hover:text-white transition-colors">
                  How Agents Earn
                </Link>
              </li>
              <li>
                <Link href="/#landing-page-section-benefits" className="hover:text-white transition-colors">
                  Key Capabilities
                </Link>
              </li>
              <li>
                <Link href="/#landing-page-section-why-us" className="hover:text-white transition-colors">
                  Why Choose Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Agent Operations */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Agent Services
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/register" className="hover:text-white transition-colors">
                  Agent Registration
                </Link>
              </li>
              <li>
                <Link href="/sign-in" className="hover:text-white transition-colors">
                  Agent Sign In
                </Link>
              </li>
              <li>
                <Link href="/#landing-page-section-faqs" className="hover:text-white transition-colors">
                  FAQs & Help
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact and Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Support & Desk
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-400" />
                <span>support@aibus.in</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-slate-400" />
                <span>+91 1800 209 8888 (24x7 Desk)</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
                <span>AiBus Travel Technologies Pvt Ltd, Bengaluru, India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 AiBus Technologies. All rights reserved.</p>
          <p>B2B Bus Inventory & Ticketing Platform. Authoritative contracts strictly enforced.</p>
        </div>
      </div>
    </footer>
  );
}
