"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const faqs = [
  {
    id: 1,
    question: "What are your delivery hours?",
    answer:
      "We deliver Monday to Sunday from 8:00 AM to 8:00 PM. Same-day delivery available for orders placed before 6:00 PM.",
  },
  {
    id: 2,
    question: "How is the delivery cost calculated?",
    answer:
      "Delivery costs are calculated at 50 KSH per kilometer from our central location in Freedom Heights, Langata. The distance is calculated using Google Maps API.",
  },
  {
    id: 3,
    question: "What payment methods do you accept?",
    answer:
      "We accept M-Pesa for mobile payments and Stripe for credit/debit cards. All payments are secured and encrypted.",
  },
  {
    id: 4,
    question: "Can I cancel or modify my order?",
    answer:
      "You can cancel or modify orders within 30 minutes of placement. After that, you can contact our support team at support@jabawaba.com.",
  },
  {
    id: 5,
    question: "Do you offer bulk/wholesale orders?",
    answer:
      "Yes! We offer special pricing for bulk and wholesale orders. Apply through our 'Work With Us' section or email wholesale@jabawaba.com.",
  },
  {
    id: 6,
    question: "Are your juices fresh?",
    answer:
      "All our juices are freshly made daily using organic, locally-sourced fruits. We prioritize quality and freshness in every bottle.",
  },
];

export function FAQsAccordion() {
  const [openId, setOpenId] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {faqs.map((faq) => (
        <div
          key={faq.id}
          className="rounded-xl border border-slate-200/70 overflow-hidden dark:border-slate-700"
        >
          <button
            onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-green-50 dark:hover:bg-slate-900 transition-colors text-left"
          >
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {faq.question}
            </span>
            <ChevronDown
              className={`h-5 w-5 text-green-600 transition-transform ${
                openId === faq.id ? "rotate-180" : ""
              }`}
            />
          </button>
          {openId === faq.id && (
            <div className="px-6 py-4 border-t border-slate-200/70 bg-slate-50 dark:border-slate-700 dark:bg-slate-950">
              <p className="text-slate-600 dark:text-slate-400">{faq.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
