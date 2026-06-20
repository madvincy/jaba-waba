"use client";

import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Flag, Sparkles, Users, Leaf } from "lucide-react";
import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="space-y-10">
          <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] items-center">
            <div className="space-y-6">
              <Image src="/assets/jabawb_logo.png" alt="Jaba Waba" width={150} height={150} className="rounded-lg object-cover" />
              <p className="text-sm font-medium uppercase tracking-[0.25em] text-green-600 dark:text-green-400">
                About Jaba Waba
              </p>
              <h1 className="text-4xl font-bold sm:text-5xl">
                Fresh juice with heart, made for Nairobi life.
              </h1>
              <p className="max-w-2xl text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                Jaba Waba began as a small juice stand in Langata and grew into a local favorite for health-minded shoppers, busy families, and offices who want organic, handcrafted juice delivered fast. We blend local fruit, herbs, and nutrition science to make every bottle feel fresh and energizing.
              </p>
              <div className="grid gap-3 sm:grid-cols-2 md:w-full">
                <Button asChild className="bg-gradient-to-r from-green-600 to-pink-600 hover:from-green-700 hover:to-pink-700 text-white rounded-full">
                  <Link href="/contact">Contact Us</Link>
                </Button>
                <Button variant="outline" className="rounded-full border-green-600 text-green-700 hover:bg-green-50 dark:border-green-400 dark:text-green-300 dark:hover:bg-green-950">
                  Learn More
                </Button>
              </div>
            </div>
            <div className="rounded-[2rem] bg-gradient-to-br from-green-50 to-pink-50 p-8 dark:from-slate-900 dark:to-slate-950 shadow-xl shadow-slate-200/50 dark:shadow-slate-950/40">
              <div className="space-y-4">
                <p className="text-sm uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Our mission</p>
                <p className="text-lg sm:text-xl text-slate-700 dark:text-slate-200 leading-relaxed">
                  To make healthy choices easy and joyful by delivering made-to-order juice, wellness shots, and community-powered events across Nairobi.
                </p>
              </div>
              <div className="mt-10 grid gap-4">
                <Card className="border-green-200 dark:border-green-900">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                      <Leaf className="h-5 w-5 text-green-600" />
                      Pure Ingredients
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-slate-600 dark:text-slate-300">
                      Farm-fresh fruit, natural herbs, no preservatives, and no added sugar.
                    </CardDescription>
                  </CardContent>
                </Card>
                <Card className="border-pink-200 dark:border-pink-900">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                      <Sparkles className="h-5 w-5 text-pink-600" />
                      Wellness First
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-slate-600 dark:text-slate-300">
                      Every recipe is built to support energy, immunity, and recovery with ingredients chosen for their benefit.
                    </CardDescription>
                  </CardContent>
                </Card>
                <Card className="border-slate-200 dark:border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                      <Users className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                      Community Driven
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-slate-600 dark:text-slate-300">
                      We partner with local growers, events, and wellness communities to deliver more than just juice.
                    </CardDescription>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          <section className="grid gap-10 lg:grid-cols-3">
            <Card className="rounded-[2rem] border-slate-200 dark:border-slate-800 p-6 bg-white dark:bg-slate-950 shadow-sm">
              <div className="flex items-center gap-3">
                <Flag className="h-6 w-6 text-green-600" />
                <h2 className="text-xl font-semibold">Our Story</h2>
              </div>
              <p className="mt-4 text-slate-600 dark:text-slate-300 leading-relaxed">
                Jaba Waba was established in 2020. Born from a love of fresh juice and local farming, Jaba Waba began with a single goal: bring nutrient-rich drinks to busy Nairobiites without sacrificing flavour or convenience.
              </p>
            </Card>
            <Card className="rounded-[2rem] border-slate-200 dark:border-slate-800 p-6 bg-white dark:bg-slate-950 shadow-sm">
              <div className="flex items-center gap-3">
                <Sparkles className="h-6 w-6 text-pink-600" />
                <h2 className="text-xl font-semibold">Why Choose Us</h2>
              </div>
              <p className="mt-4 text-slate-600 dark:text-slate-300 leading-relaxed">
                Because we combine quality produce, rapid delivery, and honest pricing in a package designed for everyday life.
              </p>
            </Card>
            <Card className="rounded-[2rem] border-slate-200 dark:border-slate-800 p-6 bg-white dark:bg-slate-950 shadow-sm">
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-slate-700 dark:text-slate-300" />
                <h2 className="text-xl font-semibold">Meet the Team</h2>
              </div>
              <p className="mt-4 text-slate-600 dark:text-slate-300 leading-relaxed">
                A small team of founders, wellness experts, and delivery partners who care about quality from farm gate to doorstep.
              </p>
            </Card>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
