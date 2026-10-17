import React from "react";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { HeroSlideshow } from "@/components/landing/hero-slideshow";
import { MarqueeTicker } from "@/components/landing/marquee-ticker";
import { EarnSection } from "@/components/landing/earn-section";
import { BenefitsSection } from "@/components/landing/benefits-section";
import { WhyUsSection } from "@/components/landing/why-us-section";
import { FaqsSection } from "@/components/landing/faqs-section";
import { CtaSection } from "@/components/landing/cta-section";
import { LandingFooter } from "@/components/landing/landing-footer";
import { BackToTop } from "@/components/landing/back-to-top";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll-provider";

export const metadata = {
  title: "AiBus — Seats That Pay Higher | Dedicated B2B Bus Ticketing for Travel Agents",
  description:
    "India's most rewarding bus ticketing platform for travel agents. Earn more on every booking, plus exclusive commissions on add-ons that others don't offer.",
};

export default function HomePage() {
  return (
    <SmoothScrollProvider>
      <div className="flex flex-col min-h-screen bg-white dark:bg-[#0B1220] transition-colors relative">
        <LandingNavbar />
        <main className="flex-1">
          <HeroSlideshow />
          <MarqueeTicker />
          <EarnSection />
          <BenefitsSection />
          <WhyUsSection />
          <FaqsSection />
          <CtaSection />
        </main>
        <LandingFooter />
        <BackToTop />
      </div>
    </SmoothScrollProvider>
  );
}
