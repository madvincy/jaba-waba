"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAppDispatch, useAppSelector } from "@/lib/redux-hooks";
import { removeFromCart, updateCartQuantity } from "@/lib/store";
import { MapPin, Truck, CreditCard, AlertCircle } from "lucide-react";
import { GoogleLocationPicker, GoogleLocation } from "@/components/google-location-picker";

type PaymentMethod = "mpesa" | "stripe";

const DELIVERY_RATE_PER_KM = 50; // KSH
const DELIVERY_ORIGIN = "Freedom Heights, Langata, Nairobi";

export default function CheckoutPage() {
  const dispatch = useAppDispatch();
  const cart = useAppSelector((state) => state.shop.cart);
  const user = useAppSelector((state) => state.shop.user);

  const [deliveryLocation, setDeliveryLocation] = useState<string>("");
  const [deliveryCoordinates, setDeliveryCoordinates] = useState<GoogleLocation | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [calculatingDistance, setCalculatingDistance] = useState(false);
  const [customerName, setCustomerName] = useState(user?.name || "");
  const [customerEmail, setCustomerEmail] = useState(user?.email || "");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("mpesa");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const cartSubtotal = cart.reduce((sum, item) => sum + (item.variantPrice ?? item.price) * item.quantity, 0);
  const deliveryFee = distance ? distance * DELIVERY_RATE_PER_KM : 0;
  const tax = Number((cartSubtotal * 0.08).toFixed(2));
  const total = Number((cartSubtotal + deliveryFee + tax).toFixed(2));

  // Simulate Google Maps distance calculation
  const calculateDistance = async () => {
    setLocationError(null);

    if (!deliveryCoordinates) {
      setLocationError("Please select a delivery location on the map.");
      return;
    }

    setCalculatingDistance(true);
    try {
      const response = await fetch("/api/distance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination: deliveryCoordinates,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to calculate distance");
      }

      const data = await response.json();
      setDistance(Number(data.distanceInKm?.toFixed(1)));
    } catch (error) {
      console.error("Error calculating distance:", error);
      setLocationError(
        error instanceof Error
          ? error.message
          : "Could not calculate distance. Please try again."
      );
      setDistance(null);
    } finally {
      setCalculatingDistance(false);
    }
  };

  const handlePlaceOrder = () => {
    if (!customerName || !customerEmail) {
      alert("Please fill in your name and email");
      return;
    }
    if (!deliveryLocation || !deliveryCoordinates || distance === null) {
      alert("Please select a delivery location on the map and calculate delivery fee.");
      return;
    }
    setOrderPlaced(true);
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col">
        <Navbar />
        <main className="flex-1 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center mx-auto">
              <div className="text-4xl">✓</div>
            </div>
            <h1 className="text-3xl font-bold text-green-600">Order Placed!</h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Thank you for your order. You will receive a confirmation email shortly.
            </p>
            <div className="bg-green-50 dark:bg-green-950 p-6 rounded-lg border border-green-200 dark:border-green-800 space-y-3">
              <p className="font-semibold">Order Summary</p>
              <div className="text-left space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Items:</span>
                  <span>{cart.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>KSH {cartSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery ({distance} km):</span>
                  <span>KSH {deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>KSH {tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-green-200 dark:border-green-800 pt-2 flex justify-between font-semibold">
                  <span>Total:</span>
                  <span>KSH {total.toFixed(2)}</span>
                </div>
              </div>
            </div>
            <Button asChild className="bg-green-600 hover:bg-green-700 text-white rounded-lg">
              <a href="/">Back to Home</a>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col">
      <Navbar />

      <main className="flex-1 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 w-full">
        <h1 className="text-3xl font-bold mb-12 bg-gradient-to-r from-green-600 to-pink-600 bg-clip-text text-transparent">
          Checkout
        </h1>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <Card className="overflow-hidden rounded-lg py-0">
              <CardHeader className="bg-green-50 dark:bg-green-950 -mx-0 rounded-none border-b border-green-100 dark:border-green-900  rounded-t-xl">
                {/* <CardHeader className="bg-green-50 dark:bg-green-950 "> */}
                <CardTitle className="mt-4">Customer Information</CardTitle>
                <CardDescription>
                  Enter your full name and email to continue with the checkout process
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-2">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="name" className="mb-2">Full name</Label>
                    <Input
                      id="name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="mb-2">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone" className="mb-2">Phone number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+254 700 000 000"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Delivery Location */}
            <Card className="overflow-hidden py-0">
              <CardHeader className="bg-pink-50 dark:bg-pink-950  rounded-t-xl">
                <CardTitle className="flex items-center gap-2 mt-4">
                  <MapPin className="h-5 w-5" />
                  Delivery Location
                </CardTitle>
                <CardDescription className="mb-2">
                  Delivery is calculated from Freedom Heights, Langata
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <Label htmlFor="selected-location" className="mb-2">Selected delivery address</Label>
                  <Input
                    id="selected-location"
                    value={deliveryLocation}
                    readOnly
                    placeholder="Select a location on the map or search above"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    Use the map search box or click a point on the map to select delivery.
                  </p>
                </div>

                <GoogleLocationPicker
                  apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}
                  value={deliveryCoordinates}
                  onChange={(location) => {
                    setDeliveryCoordinates(location);
                    setDeliveryLocation(location.address);
                    setLocationError(null);
                    // Auto-calculate delivery whenever a valid location is selected
                    calculateDistance().catch(() => {
                      // calculateDistance already sets error state
                    });
                  }}
                />

                {locationError ? (
                  <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950 p-3 text-sm text-red-700 dark:text-red-200">
                    {locationError}
                  </div>
                ) : null}

                <Button
                  onClick={calculateDistance}
                  disabled={calculatingDistance}
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white rounded-lg"
                >
                  {calculatingDistance ? "Calculating..." : "Calculate Delivery Fee"}
                </Button>

                {distance !== null && (
                  <div className="p-4 rounded-lg border-2 border-pink-200 dark:border-pink-800 bg-pink-50 dark:bg-pink-950">
                    <div className="flex gap-4">
                      <Truck className="h-5 w-5 text-pink-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {distance} km from Freedom Heights
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Delivery fee: KSH {deliveryFee.toFixed(2)} ({DELIVERY_RATE_PER_KM} KSH/km)
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card className="overflow-hidden py-0">
              <CardHeader className="bg-purple-50 dark:bg-purple-950 ">
                <CardTitle className="flex items-center gap-2 mt-4">
                  <CreditCard className="h-5 w-5" />
                  Payment Method
                </CardTitle>
                <CardDescription className="mb-2">Choose how you'd like to pay</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <RadioGroup value={paymentMethod} onValueChange={(val) => setPaymentMethod(val as PaymentMethod)}>
                  <div className="space-y-4">
                    {/* M-Pesa */}
                    <div className="flex items-center space-x-3 p-4 border-2 border-slate-200 dark:border-slate-700 rounded-lg hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-950/20 cursor-pointer transition-colors">
                      <RadioGroupItem value="mpesa" id="mpesa" />
                      <Label htmlFor="mpesa" className="flex-1 cursor-pointer">
                        <span className="font-semibold text-slate-900 dark:text-white">M-Pesa</span>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          Secure mobile money payment
                        </p>
                      </Label>
                    </div>

                    {/* Stripe Card */}
                    <div className="flex items-center space-x-3 p-4 border-2 border-slate-200 dark:border-slate-700 rounded-lg hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 cursor-pointer transition-colors">
                      <RadioGroupItem value="stripe" id="stripe" />
                      <Label htmlFor="stripe" className="flex-1 cursor-pointer">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          Credit/Debit Card (Stripe)
                        </span>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          Visa, Mastercard, or American Express
                        </p>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>

                {paymentMethod === "mpesa" && (
                  <div className="mt-6 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg text-sm text-slate-700 dark:text-slate-300">
                    <p>
                      After placing your order, you'll receive an M-Pesa prompt to
                      complete the payment. The delivery will start once payment is
                      confirmed.
                    </p>
                  </div>
                )}

                {paymentMethod === "stripe" && (
                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg text-sm text-slate-700 dark:text-slate-300">
                    <p>
                      You'll be redirected to a secure Stripe payment page to enter
                      your card details.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary Sidebar */}
          <div>
            <Card className="sticky top-20 border-2 border-green-200 dark:border-green-900 py-0">
              <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white  rounded-t-xl">
                <CardTitle className="mt-4">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {cart.length === 0 ? (
                  <div className="p-4 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg text-center text-slate-500 dark:text-slate-400">
                    <p>Your cart is empty</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {cart.map((item) => (
                        <div
                          key={item.id}
                          className="flex gap-3 pb-3 border-b border-slate-200 dark:border-slate-700"
                        >
                          <div className="h-16 w-16 rounded-lg overflow-hidden bg-slate-100">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm text-slate-900 dark:text-white">
                              {item.name}
                            </p>
                            {item.selectedVariantName ? (
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {item.selectedVariantName}
                              </p>
                            ) : item.selectedVariantId ? (
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {item.variants?.find((v) => v.id === item.selectedVariantId)?.name || "Variant"}
                              </p>
                            ) : null}
                            <div className="flex items-center gap-2 mt-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() =>
                                  dispatch(
                                    updateCartQuantity({
                                      productId: item.id,
                                      quantity: item.quantity - 1,
                                    })
                                  )
                                }
                              >
                                −
                              </Button>
                              <span className="text-xs font-medium w-6 text-center">
                                {item.quantity}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() =>
                                  dispatch(
                                    updateCartQuantity({
                                      productId: item.id,
                                      quantity: item.quantity + 1,
                                    })
                                  )
                                }
                              >
                                +
                              </Button>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-sm text-slate-900 dark:text-white">
                              KSH {((item.variantPrice ?? item.price) * item.quantity).toFixed(2)}
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-red-600 h-auto p-0 mt-1"
                              onClick={() => dispatch(removeFromCart(item.id))}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-3 border-t border-slate-200 dark:border-slate-700 pt-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">Subtotal:</span>
                        <span className="font-medium">KSH {cartSubtotal.toFixed(2)}</span>
                      </div>
                      {distance !== null && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600 dark:text-slate-400">
                            Delivery:
                          </span>
                          <span className="font-medium">
                            KSH {deliveryFee.toFixed(2)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">Tax (8%):</span>
                        <span className="font-medium">KSH {tax.toFixed(2)}</span>
                      </div>
                      <div className="border-t border-slate-200 dark:border-slate-700 pt-3 flex justify-between">
                        <span className="font-bold text-slate-900 dark:text-white">Total:</span>
                        <span className="font-bold text-lg text-green-600">
                          KSH {total.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {distance === null && (
                      <div className="flex gap-2 p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg text-xs text-amber-700 dark:text-amber-300">
                        <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <p>Calculate delivery fee to proceed</p>
                      </div>
                    )}

                    <Button
                      onClick={handlePlaceOrder}
                      disabled={!customerName || !customerEmail || distance === null}
                      className="w-full h-11 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold"
                    >
                      Place Order
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
