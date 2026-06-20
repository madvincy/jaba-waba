"use client";

import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { FAQsAccordion } from "@/components/faqs-accordion";
import { HelpCircle } from "lucide-react";

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col">
      <Navbar />

      <main className="flex-1 mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 w-full">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <div className="flex items-center justify-center gap-3">
            <HelpCircle className="h-8 w-8 text-green-600" />
            <h1 className="text-4xl font-bold md:text-5xl bg-gradient-to-r from-green-600 to-pink-600 bg-clip-text text-transparent">
              Frequently Asked Questions
            </h1>
          </div>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Find answers to common questions about Jaba Waba, our products,
            delivery, payments, and more.
          </p>
        </div>

        {/* FAQs */}
        <div className="mb-16">
          <FAQsAccordion />
        </div>

        {/* CTA Section */}
        <div className="mt-16 p-8 rounded-3xl bg-gradient-to-r from-green-50 to-pink-50 dark:from-slate-900 dark:to-slate-900 border-2 border-green-200 dark:border-green-800 text-center space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Didn't find your answer?
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Get in touch with our support team. We're here to help!
          </p>
          <Button
            asChild
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-full"
          >
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
