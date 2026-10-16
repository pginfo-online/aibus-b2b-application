import React from "react";
import Link from "next/link";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { LandingFooter } from "@/components/landing/landing-footer";
import { Button } from "@/components/ui/button";
import { Bus, ShieldCheck, Users2, ArrowRight } from "lucide-react";

export const metadata = {
  title: "About AiBus — Modern B2B Bus Ticketing Infrastructure",
  description: "Learn how AiBus empowers travel agencies and tour operators across India with direct GDS integration and higher margins.",
};

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-slate-900">
      <LandingNavbar />

      <main className="flex-1">
        {/* Hero Banner */}
        <section className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 py-20 text-white">
          <div className="mx-auto max-w-5xl px-4 text-center space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#EF4444] bg-red-950/60 border border-red-900 px-3 py-1 rounded-full">
              About AiBus
            </span>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight">
              Empowering India&apos;s Travel Resellers
            </h1>
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              We connect thousands of independent travel agencies directly with leading bus fleet operators and government transport corporations through high-availability APIs and instant wallet settlements.
            </p>
          </div>
        </section>

        {/* Mission & Values */}
        <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6 space-y-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                Our Mission: Transparent Commercials
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                For years, retail travel agencies were forced to book tickets through consumer websites that withheld commissions, inflated cancellation fees, and offered zero seat-locking capability.
              </p>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                AiBus was founded to deliver an enterprise-grade B2B platform where travel agents enjoy direct GDS inventory access, guaranteed 10-minute seat holds, double-entry ledger security, and instant net fare deductions.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-8 space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-red-100 text-[#D92D20] dark:bg-red-950/60 dark:text-red-400">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100">
                    Authoritative Financial Integrity
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    Every transaction is auditable with strict double-entry ledger bookkeeping.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
                  <Bus className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100">
                    Direct Operator Inventory
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    Direct integration with Mantis GDS and major regional fleets across India.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                  <Users2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100">
                    Dedicated Agent Support
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    24x7 agent desk for booking reconciliations, cancellations, and disputes.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Box */}
          <div className="rounded-2xl bg-[#0F172A] p-8 sm:p-12 text-center text-white space-y-5">
            <h2 className="text-2xl sm:text-3xl font-extrabold">
              Ready to Upgrade Your Agency Operations?
            </h2>
            <p className="text-slate-300 text-sm max-w-xl mx-auto leading-relaxed">
              Join thousands of travel partners who book more and earn more on every journey with AiBus.
            </p>
            <div className="pt-2 flex justify-center gap-4">
              <Link href="/register">
                <Button variant="primary" size="lg">
                  Register Your Agency
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
