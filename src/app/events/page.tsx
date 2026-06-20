"use client";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, Sparkles, Gift, Users } from "lucide-react";

const events = [
  {
    title: "Juice & Wellness Pop-up",
    date: "June 21, 2026",
    location: "Freedom Heights Market",
    description: "Taste our limited-edition summer blends and meet the Jaba Waba team. Live music, wellness talks, and juice samplers.",
  },
  {
    title: "Office Juice Refresh",
    date: "July 8, 2026",
    location: "Westlands Business Hub",
    description: "Book a corporate delivery for healthy team drinks and learn how we tailor orders for office wellness programs.",
  },
  {
    title: "Community Juice Run",
    date: "July 16, 2026",
    location: "Karura Forest Entrance",
    description: "Join a guided morning wellness walk followed by fresh press juice and a special event-only discount.",
  },
];

export default function EventsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="space-y-10">
          <section className="text-center space-y-6">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-green-600 dark:text-green-400">
              Events & Experiences
            </p>
            <h1 className="text-4xl font-bold sm:text-5xl">
              Join the Jaba Waba community in person.
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
              Discover upcoming wellness pop-ups, corporate refresh days, and community events where fresh juice meets local connection.
            </p>
          </section>

          <section className="grid gap-6 lg:grid-cols-3">
            {events.map((event) => (
              <Card key={event.title} className="rounded-[2rem] border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">{event.title}</CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400">
                    {event.date} · {event.location}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{event.description}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-sm text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-300">
                      <CalendarDays className="h-4 w-4" />
                      Reserve Your Spot
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <Card className="rounded-[2rem] border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="h-6 w-6 text-pink-600" />
                <h2 className="text-xl font-semibold">Tailored activations</h2>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Host a branded juice bar at your event, team retreat, or launch party. We handle ingredients, delivery, and setup so your guests stay refreshed.
              </p>
            </Card>
            <Card className="rounded-[2rem] border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <Gift className="h-6 w-6 text-green-600" />
                <h2 className="text-xl font-semibold">Event catering</h2>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Choose from party packs, wellness shots, and crowd-pleasing juice bundles made for groups of any size.
              </p>
            </Card>
          </section>

          <section className="rounded-[2rem] bg-gradient-to-br from-green-600 to-pink-600 p-10 text-white shadow-xl">
            <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr] items-center">
              <div>
                <p className="uppercase tracking-[0.3em] text-sm text-green-100">Featured Experience</p>
                <h2 className="mt-4 text-3xl font-bold">Private Juice Workshop</h2>
                <p className="mt-4 max-w-xl text-slate-100/90 leading-relaxed">
                  Host a private juice workshop for your office or social group and learn how to blend fresh flavors with healthy ingredients.
                </p>
              </div>
              <div className="flex flex-col gap-4">
                <div className="rounded-3xl bg-white/10 p-5">
                  <div className="flex items-center gap-3 text-sm uppercase tracking-[0.2em] text-green-100">
                    <Users className="h-4 w-4" />
                    Designed for groups
                  </div>
                  <p className="mt-3 text-sm text-slate-100/90">This is perfect for teams, families, and wellness circles.</p>
                </div>
                <Button className="rounded-full bg-white text-slate-950 hover:bg-slate-100 w-full max-w-xs">
                  Contact Events Team
                </Button>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
