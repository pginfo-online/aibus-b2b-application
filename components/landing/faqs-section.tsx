"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: "What documents are required to register as an AiBus Agent?",
    answer:
      "To register your travel agency, you need your business name, contact details, PAN Card, and business registration or GST certificate. Once submitted, your KYC is verified by platform administrators to activate instant wallet ticketing.",
  },
  {
    question: "How does the Agent Wallet and Net Fare payment work?",
    answer:
      "When you book tickets using your agent wallet, our system automatically calculates your commission and only debits the net payable fare (Gross Fare minus Commission). You do not have to wait for end-of-month reimbursement to receive your profit.",
  },
  {
    question: "How long does the Seat Hold feature lock inventory?",
    answer:
      "The Seat Hold locks your selected seats directly with the upstream bus operator GDS for 10 minutes. A visible countdown timer lets you collect passenger details without risk of another agent or passenger booking the same seats.",
  },
  {
    question: "Can I add multiple staff members under my agency account?",
    answer:
      "Yes. Agency Owners can invite team members with specific roles: Managers, Booking Agents (who can search, hold, and book), and Accountants (who can view statements and export ledger reports).",
  },
  {
    question: "How do cancellations and refunds work?",
    answer:
      "Before cancelling, you can check real-time cancellability, penalty charges, and the exact refundable amount as defined by the bus operator. Once confirmed, the refund is credited directly back to your agency wallet with a clear double-entry ledger record.",
  },
];

export function FaqsSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section
      id="landing-page-section-faqs"
      className="py-20 bg-white dark:bg-slate-900 border-b border-slate-200/60 dark:border-slate-800/60"
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#D92D20] bg-red-100 dark:bg-red-950/60 px-3 py-1 rounded-full">
            Frequently Asked Questions
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Everything You Need to Know
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
            Clear, transparent answers about registration, commissions, wallet top-ups, and ticketing operations.
          </p>
        </div>

        <div className="mt-12 space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.question}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between p-5 text-left font-bold text-slate-900 dark:text-slate-100 hover:text-[#D92D20] dark:hover:text-red-400 transition-colors focus:outline-none"
                >
                  <span className="text-base">{faq.question}</span>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 text-slate-400 shrink-0 transition-transform duration-200",
                      isOpen && "rotate-180 text-[#D92D20]"
                    )}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-200/40 dark:border-slate-700/40">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
