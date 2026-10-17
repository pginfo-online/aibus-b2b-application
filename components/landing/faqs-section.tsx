"use client";

import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

type FaqCategory =
  | "Account Creation"
  | "Wallet Loading"
  | "Booking Process"
  | "Cancellation Process"
  | "Booking History (My Earnings)";

interface FaqItem {
  question: string;
  answer: string;
}

const CATEGORIES: FaqCategory[] = [
  "Account Creation",
  "Wallet Loading",
  "Booking Process",
  "Cancellation Process",
  "Booking History (My Earnings)",
];

const FAQS_BY_CATEGORY: Record<FaqCategory, FaqItem[]> = {
  "Account Creation": [
    {
      question: "Who can use this platform?",
      answer:
        "This platform is exclusively for authorized travel agents, tour operators, consolidators, and travel businesses. It is not meant for direct consumer use.",
    },
    {
      question: "How do I create an account?",
      answer:
        "Click 'Get Started' or 'Register', enter your travel agency details, contact information, and business credentials. You will get immediate access to your dashboard to complete verification.",
    },
    {
      question: "What documents are required for verification?",
      answer:
        "To activate your wallet and start ticketing, you will need your PAN card, GSTIN (if registered), and proof of business registration or shop establishment certificate.",
    },
    {
      question: "How long does account approval take?",
      answer:
        "Standard digital KYC verification typically completes within 1 to 2 business hours during working days, after which full booking capabilities are active.",
    },
    {
      question: "Can I have multiple logins for my office staff?",
      answer:
        "Yes! The platform includes a comprehensive staff account hierarchy. Agency owners can invite booking agents, counter staff, managers, and accountants with role-based permissions.",
    },
  ],
  "Wallet Loading": [
    {
      question: "How do I add funds to my agent wallet?",
      answer:
        "You can top up your wallet instantly via UPI, Net Banking, NEFT/RTGS, or Corporate Credit Cards. Wallet funds reflect in real-time with automated confirmation receipts.",
    },
    {
      question: "Is there any minimum deposit required?",
      answer:
        "No long-term lock-in or mandatory high deposit is required. You can maintain a working balance that fits your agency's daily ticketing volume.",
    },
    {
      question: "How does Net Fare debiting work?",
      answer:
        "When confirming a booking, your wallet is debited only for the Net Fare (Gross Customer Price minus your commission). You collect the full fare from the customer and retain your profit immediately.",
    },
  ],
  "Booking Process": [
    {
      question: "How long does the Seat Hold feature lock inventory?",
      answer:
        "The Seat Hold locks your selected seats directly with the upstream bus operator GDS for 10 minutes. A visible countdown timer gives you ample time to collect passenger details with zero risk of seats being snapped by competitors.",
    },
    {
      question: "Are seat selections real-time across upper and lower decks?",
      answer:
        "Yes, interactive seat maps update directly from operator dispatch systems with live berth orientations, sleeper/seater indicators, and ladies-only seat markers.",
    },
    {
      question: "Can I issue agency-branded tickets to passengers?",
      answer:
        "Yes. Generate and download clean, printable PDF tickets complete with your agency name, logo, contact helpline, and exact boarding point directions.",
    },
  ],
  "Cancellation Process": [
    {
      question: "How do cancellations and refunds work?",
      answer:
        "Before cancelling, you can inspect real-time operator cancellation policy slabs, penalty fees, and exact refund amounts. Once confirmed, the refund is credited instantly to your wallet.",
    },
    {
      question: "What happens if a bus service is cancelled by the operator?",
      answer:
        "In the event of an operator cancellation or route breakdown, a 100% full refund of the booked fare is credited directly back to your agency wallet immediately.",
    },
  ],
  "Booking History (My Earnings)": [
    {
      question: "Where can I track my total commissions and profits?",
      answer:
        "Your dedicated Earnings & Reports portal provides live transaction snapshots, route-wise profit breakdowns, and one-click monthly CSV export for your accountant.",
    },
    {
      question: "Is double-entry bookkeeping maintained for audit?",
      answer:
        "Yes. Every single ticket issuance, commission retention, wallet top-up, and cancellation creates an immutable double-entry ledger entry for effortless financial reconciliation.",
    },
  ],
};

export function FaqsSection() {
  const [activeCategory, setActiveCategory] = useState<FaqCategory>("Account Creation");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const currentFaqs = FAQS_BY_CATEGORY[activeCategory];

  const handleCategoryChange = (cat: FaqCategory) => {
    setActiveCategory(cat);
    setOpenIndex(0); // Open first item in the newly selected category
  };

  const toggleAccordion = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section
      id="landing-page-section-faqs"
      className="py-24 sm:py-28 bg-[#FCFDFD] dark:bg-[#0B1220] transition-colors"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3.5">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <span className="inline-flex items-center px-4 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200/60 dark:border-sky-900/40">
              Help Center
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight"
          >
            Got Questions?
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed"
          >
            We&apos;ve got answers. Find what you need below.
          </motion.p>
        </div>

        {/* Category Filter Tabs matching Reference 6 */}
        <div className="mt-12 flex items-center justify-center gap-2.5 flex-wrap">
          {CATEGORIES.map((category) => {
            const isActive = activeCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => handleCategoryChange(category)}
                className={cn(
                  "px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer",
                  isActive
                    ? "bg-[#E24B4B] text-white shadow-md shadow-red-500/20"
                    : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"
                )}
              >
                {category}
              </button>
            );
          })}
        </div>

        {/* Accordion List matching Reference 6 */}
        <div className="mt-10 space-y-3.5">
          {currentFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <motion.div
                key={faq.question}
                layout
                className={cn(
                  "rounded-2xl transition-all duration-200 overflow-hidden",
                  isOpen
                    ? "border border-red-200/90 dark:border-red-900/60 bg-red-50/20 dark:bg-red-950/15 shadow-xs"
                    : "border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-slate-300 dark:hover:border-slate-700"
                )}
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(idx)}
                  className="flex w-full items-center justify-between p-5 sm:p-6 text-left cursor-pointer focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span
                    className={cn(
                      "text-base sm:text-lg font-bold pr-4 transition-colors",
                      isOpen
                        ? "text-slate-950 dark:text-white"
                        : "text-slate-800 dark:text-slate-200"
                    )}
                  >
                    {faq.question}
                  </span>

                  {/* Icon: Red solid circle with minus when open, Gray circle with plus when closed */}
                  <div
                    className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-200",
                      isOpen
                        ? "bg-[#E24B4B] text-white shadow-xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                    )}
                  >
                    {isOpen ? (
                      <Minus className="h-4 w-4 stroke-[2.5]" />
                    ) : (
                      <Plus className="h-4 w-4 stroke-[2.5]" />
                    )}
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                      <div className="px-5 sm:px-6 pb-6 pt-1 text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
