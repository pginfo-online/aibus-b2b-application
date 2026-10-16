import React from "react";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { HeroSlideshow } from "@/components/landing/hero-slideshow";
import { EarnSection } from "@/components/landing/earn-section";
import { BenefitsSection } from "@/components/landing/benefits-section";
import { WhyUsSection } from "@/components/landing/why-us-section";
import { FaqsSection } from "@/components/landing/faqs-section";
import { LandingFooter } from "@/components/landing/landing-footer";

export const metadata = {
  title: "AiBus — Seats That Pay More | B2B Bus Booking Platform for Travel Agents",
  description:
    "An exceptionally rewarding bus-ticketing platform for travel agents. Earn more on every booking, plus exclusive commissions on add-ons that other platforms may not offer.",
};

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-slate-900 transition-colors">
      <LandingNavbar />
      <main className="flex-1">
        <HeroSlideshow />
        <EarnSection />
        <BenefitsSection />
        <WhyUsSection />
        <FaqsSection />
      </main>
      <LandingFooter />
    </div>
  );
}
