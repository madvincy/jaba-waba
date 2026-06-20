"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Truck, CheckCircle, Loader2 } from "lucide-react";
import { canAccessRiderPortal } from "@/lib/auth-utils";
import { useAppDispatch, useAppSelector } from "@/lib/redux-hooks";
import { setRiderAvailability } from "@/lib/store";

export default function RiderPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const shopUser = useAppSelector((state) => state.shop.user);
  const riders = useAppSelector((state) => state.shop.riders);
  const [authChecked, setAuthChecked] = useState(false);
  const [available, setAvailable] = useState(true);
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("Ready for pickup and delivery assignments.");

  const matchedRider = riders.find(
    (r) => r.name.toLowerCase() === shopUser?.name.toLowerCase(),
  ) ?? riders[0];

  useEffect(() => {
    if (!shopUser) {
      router.replace("/auth/signin?next=/rider");
      return;
    }
    if (!canAccessRiderPortal(shopUser.role)) {
      router.replace("/");
      return;
    }
    setLocation(shopUser.location || matchedRider?.area || "");
    setAvailable(matchedRider?.available ?? true);
    setAuthChecked(true);
  }, [shopUser, router, matchedRider]);

  const handleAvailabilityChange = (isAvailable: boolean) => {
    setAvailable(isAvailable);
    if (matchedRider) {
      dispatch(setRiderAvailability({ riderId: matchedRider.id, available: isAvailable }));
    }
  };

  if (!authChecked || !shopUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <section className="rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-900 dark:border dark:border-slate-800">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-green-600">Rider Portal</p>
                <h1 className="mt-3 text-3xl font-bold">Welcome, {shopUser.name}</h1>
                <p className="mt-2 text-slate-600 dark:text-slate-300">
                  Manage your availability and share live location updates.
                </p>
                <p className="mt-1 text-sm text-slate-500">{shopUser.email}</p>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-700">
                <Truck className="w-4 h-4" />
                {available ? "Available" : "Offline"}
              </div>
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <CardHeader>
                <CardTitle>Rider status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-3xl bg-slate-100 p-4 dark:bg-slate-800">
                  <p className="text-sm text-slate-500">Rider</p>
                  <p className="mt-1 text-xl font-semibold">{shopUser.name}</p>
                  {matchedRider && (
                    <p className="text-sm text-slate-500 mt-1">Area: {matchedRider.area}</p>
                  )}
                </div>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="availability">Availability</Label>
                    <div className="flex items-center gap-3">
                      <Button
                        variant={available ? "default" : "outline"}
                        onClick={() => handleAvailabilityChange(true)}
                      >
                        Available
                      </Button>
                      <Button
                        variant={!available ? "default" : "outline"}
                        onClick={() => handleAvailabilityChange(false)}
                      >
                        Offline
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Current area</Label>
                    <Input
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Westlands, Karen"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes for dispatch</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <CardHeader>
                <CardTitle>Assigned deliveries</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {matchedRider?.currentOrderId ? (
                  <div className="rounded-2xl border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/30">
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Active delivery</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                      Order #{matchedRider.currentOrderId.slice(-6)}
                    </p>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-slate-500 dark:border-slate-700">
                    No active deliveries. Stay available to receive new assignments.
                  </div>
                )}
                <div className="flex items-start gap-3 rounded-2xl bg-slate-100 p-4 dark:bg-slate-800">
                  <MapPin className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Location sharing</p>
                    <p className="text-sm text-slate-500 mt-1">
                      Update your area above so dispatch can assign nearby orders.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
