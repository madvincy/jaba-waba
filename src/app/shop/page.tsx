"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { signInWithEmail, signOut, resolveUserState } from "@/lib/api/auth";
import { getRedirectForRole } from "@/lib/auth-utils";
import { useAppDispatch, useAppSelector } from "@/lib/redux-hooks";
import {
  addReview,
  addToCart,
  login,
  logout,
  removeFromCart,
  setRiderAvailability,
  submitAmbassador,
  submitWholesale,
  updateCartQuantity,
  updateOrderStatus,
  updateStock,
} from "@/lib/store";

const categories = ["All", "Juice", "Party Pack", "Merch", "Event"] as const;

type CategoryFilter = (typeof categories)[number];

type AmbassadorForm = {
  name: string;
  email: string;
  socials: string;
  message: string;
};

type WholesaleForm = {
  company: string;
  contact: string;
  email: string;
  region: string;
  expectedVolume: string;
  message: string;
};

export default function ShopPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const shop = useAppSelector((state) => state.shop);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("All");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [orderTrackingId, setOrderTrackingId] = useState(shop.orders[0]?.id ?? "");
  const [ambassadorForm, setAmbassadorForm] = useState<AmbassadorForm>({
    name: "",
    email: "",
    socials: "",
    message: "",
  });
  const [wholesaleForm, setWholesaleForm] = useState<WholesaleForm>({
    company: "",
    contact: "",
    email: "",
    region: "",
    expectedVolume: "",
    message: "",
  });
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [selectedStoreId, setSelectedStoreId] = useState(shop.stores[0]?.id ?? "");
  const [selectedRiderId, setSelectedRiderId] = useState(shop.riders[0]?.id ?? "");

  const filteredProducts = useMemo(
    () =>
      selectedCategory === "All"
        ? shop.products
        : shop.products.filter((product) => product.category === selectedCategory),
    [selectedCategory, shop.products],
  );

  const cartSubtotal = useMemo(
    () => shop.cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [shop.cart],
  );
  const shipping = shop.cart.length > 0 ? 10 : 0;
  const tax = Number((cartSubtotal * 0.08).toFixed(2));
  const orderTotal = Number((cartSubtotal + shipping + tax).toFixed(2));
  const trackedOrder = shop.orders.find((order) => order.id === orderTrackingId) ?? shop.orders[0];
  const userRole = shop.user?.role ?? "customer";

  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) return;
    setLoginLoading(true);
    setLoginError("");
    try {
      const { user, error } = await signInWithEmail(loginEmail, loginPassword);
      if (error) throw new Error(error.message);
      if (!user) throw new Error("Login failed");
       console.log("user shop", user);
      const userState = await resolveUserState(user);
      dispatch(login(userState));
      setLoginPassword("");
      router.push(getRedirectForRole(userState.role));
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    dispatch(logout());
  };

  const handlePublishReview = () => {
    if (!reviewText) return;
    dispatch(
      addReview({
        id: `review-${Date.now()}`,
        customer: shop.user?.name ?? "Guest Shopper",
        rating: reviewRating,
        text: reviewText,
        source: "Google",
        date: new Date().toISOString().slice(0, 10),
      }),
    );
    setReviewText("");
    setReviewRating(5);
  };

  const handleAmbassadorSubmit = () => {
    if (!ambassadorForm.name || !ambassadorForm.email) {
      return;
    }
    dispatch(
      submitAmbassador({
        ...ambassadorForm,
        id: `ambassador-${Date.now()}`,
        submittedAt: new Date().toISOString(),
      }),
    );
    setAmbassadorForm({ name: "", email: "", socials: "", message: "" });
  };

  const handleWholesaleSubmit = () => {
    if (!wholesaleForm.company || !wholesaleForm.email) {
      return;
    }
    dispatch(
      submitWholesale({
        ...wholesaleForm,
        id: `wholesale-${Date.now()}`,
        submittedAt: new Date().toISOString(),
      }),
    );
    setWholesaleForm({
      company: "",
      contact: "",
      email: "",
      region: "",
      expectedVolume: "",
      message: "",
    });
  };

  const selectedStore = shop.stores.find((store) => store.id === selectedStoreId) ?? shop.stores[0];
  const selectedRider = shop.riders.find((rider) => rider.id === selectedRiderId) ?? shop.riders[0];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <section className="border-b border-slate-200/70 bg-white/90 py-10 shadow-sm shadow-slate-200/40 dark:border-slate-800/70 dark:bg-slate-900/90 dark:shadow-slate-950/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 xl:grid-cols-[1.3fr_0.9fr] xl:items-center">
            <div className="space-y-6">
              <p className="text-sm uppercase tracking-[0.28em] text-primary">Jaba Waba Juice Platform</p>
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                Build a complete juice delivery experience for customers, staff, riders, and partners.
              </h1>
              <p className="max-w-3xl text-base text-slate-600 dark:text-slate-300">
                Login, browse products, manage store inventory, share rider availability, track delivery, apply as a brand ambassador, file a wholesale application, and publish Google-style reviews.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => setSelectedCategory("Juice")}>Shop juice</Button>
                <Button variant="outline" onClick={() => setSelectedCategory("Party Pack")}>Party packs</Button>
                <Button variant="secondary" onClick={() => setSelectedCategory("Merch")}>Merch</Button>
              </div>
            </div>
            <Card className="rounded-3xl border-slate-200/70 bg-slate-50 p-5 shadow-sm dark:border-slate-700/80 dark:bg-slate-950/90">
              <CardHeader>
                <CardTitle>Today’s platform snapshot</CardTitle>
                <CardDescription>
                  All interactions are managed through Redux state to avoid duplicate Supabase calls.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-3xl bg-white p-4 shadow-sm dark:bg-slate-900">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Products</p>
                    <p className="mt-2 text-3xl font-semibold">{shop.products.length}</p>
                  </div>
                  <div className="rounded-3xl bg-white p-4 shadow-sm dark:bg-slate-900">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Orders</p>
                    <p className="mt-2 text-3xl font-semibold">{shop.orders.length}</p>
                  </div>
                  <div className="rounded-3xl bg-white p-4 shadow-sm dark:bg-slate-900">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Stores</p>
                    <p className="mt-2 text-3xl font-semibold">{shop.stores.length}</p>
                  </div>
                  <div className="rounded-3xl bg-white p-4 shadow-sm dark:bg-slate-900">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Riders</p>
                    <p className="mt-2 text-3xl font-semibold">{shop.riders.length}</p>
                  </div>
                </div>
                <div className="rounded-3xl border border-slate-200/70 bg-white p-4 dark:border-slate-700 dark:bg-slate-950">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Active session</p>
                  <p className="mt-2 text-lg font-semibold">
                    {shop.user ? `${shop.user.name} (${shop.user.role})` : "Not logged in"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 xl:grid-cols-[1.4fr_0.9fr]">
          <div className="space-y-8">
            <Card className="rounded-3xl bg-white dark:bg-slate-900">
              <CardHeader>
                <CardTitle>Customer login & checkout</CardTitle>
                <CardDescription>Secure login plus a full cart experience for Jaba Waba shoppers.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-4">
                  {shop.user ? (
                    <div className="space-y-3 rounded-3xl border border-slate-200/70 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-950">
                      <p className="text-sm text-slate-500 dark:text-slate-400">Logged in as</p>
                      <p className="text-xl font-semibold">{shop.user.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Role: {shop.user.role}</p>
                      <Button variant="outline" onClick={handleLogout}>Logout</Button>
                    </div>
                  ) : (
                    <div className="space-y-4 rounded-3xl border border-slate-200/70 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-950">
                      <div>
                        <Label htmlFor="login-email">Email</Label>
                        <Input
                          id="login-email"
                          value={loginEmail}
                          onChange={(event) => setLoginEmail(event.target.value)}
                          placeholder="staff@jaba-waba.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="login-password">Password</Label>
                        <Input
                          id="login-password"
                          type="password"
                          value={loginPassword}
                          onChange={(event) => setLoginPassword(event.target.value)}
                          placeholder="Enter password"
                        />
                      </div>
                      {loginError && (
                        <p className="text-sm text-red-600">{loginError}</p>
                      )}
                      <Button onClick={handleLogin} disabled={loginLoading}>
                        {loginLoading ? "Signing in..." : "Login"}
                      </Button>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Use email addresses containing <span className="font-semibold">staff</span>, <span className="font-semibold">rider</span>, or <span className="font-semibold">admin</span> to see role-based views.
                      </p>
                    </div>
                  )}
                </div>
                <div className="rounded-3xl border border-slate-200/70 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-950">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Cart status</p>
                  <div className="mt-4 space-y-3">
                    <p className="text-2xl font-semibold">{shop.cart.length} items</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Subtotal: ${cartSubtotal.toFixed(2)}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Shipping: ${shipping.toFixed(2)}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Tax: ${tax.toFixed(2)}</p>
                    <p className="text-xl font-semibold">Total: ${orderTotal.toFixed(2)}</p>
                  </div>
                  <Button className="mt-4 w-full" disabled={!shop.cart.length}>
                    {shop.cart.length ? "Proceed to checkout" : "Add products to checkout"}
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3 rounded-3xl border border-slate-200/70 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-950">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Track a delivery</p>
                    <select
                      className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-ring/50"
                      value={orderTrackingId}
                      onChange={(event) => setOrderTrackingId(event.target.value)}
                    >
                      {shop.orders.map((order) => (
                        <option key={order.id} value={order.id}>
                          {order.id} — {order.customer}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-3 rounded-3xl border border-slate-200/70 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-950">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Delivery status</p>
                    <p className="text-lg font-semibold">{trackedOrder.status}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">ETA: {trackedOrder.eta}</p>
                  </div>
                </div>
              </CardFooter>
            </Card>

            <Card className="rounded-3xl bg-white dark:bg-slate-900">
              <CardHeader>
                <CardTitle>Product catalog</CardTitle>
                <CardDescription>
                  Categories, party packs, merch, and event products for your juice platform.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-wrap gap-3">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={category === selectedCategory ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {filteredProducts.map((product) => (
                    <Card key={product.id} className="overflow-hidden rounded-3xl border border-slate-200/70 dark:border-slate-700">
                      <div className="relative h-52 overflow-hidden bg-slate-100 dark:bg-slate-950">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <CardContent>
                        <div className="flex items-center justify-between gap-3 text-sm text-slate-500 dark:text-slate-400">
                          <span>{product.category}</span>
                          <span>${product.price.toFixed(2)}</span>
                        </div>
                        <CardTitle className="mt-3 text-lg">{product.name}</CardTitle>
                        <CardDescription className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                          {product.description}
                        </CardDescription>
                        <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                          {product.tags.map((tag) => (
                            <span key={tag} className="rounded-full border border-slate-200/70 px-2 py-1 dark:border-slate-700">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter className="gap-3">
                        <Button className="w-full" onClick={() => dispatch(addToCart(product.id))}>
                          Add to cart
                        </Button>
                        <span className="text-sm text-slate-500 dark:text-slate-400">Stock: {product.stock}</span>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl bg-white dark:bg-slate-900">
              <CardHeader>
                <CardTitle>Google reviews and customer voice</CardTitle>
                <CardDescription>Publish customer feedback and pull in a review-style feed.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                  <div className="space-y-4 rounded-3xl border border-slate-200/70 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-950">
                    <Label htmlFor="review-text">New review</Label>
                    <Textarea
                      id="review-text"
                      value={reviewText}
                      onChange={(event) => setReviewText(event.target.value)}
                      placeholder="Share your Jaba Waba experience"
                    />
                    <div className="flex items-center gap-3">
                      <Label className="gap-2">
                        Rating
                        <select
                          value={reviewRating}
                          onChange={(event) => setReviewRating(Number(event.target.value))}
                          className="rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-ring/50"
                        >
                          {[5, 4, 3, 2, 1].map((rating) => (
                            <option key={rating} value={rating}>
                              {rating} stars
                            </option>
                          ))}
                        </select>
                      </Label>
                      <Button onClick={handlePublishReview}>Publish review</Button>
                    </div>
                  </div>
                  <div className="space-y-4 rounded-3xl border border-slate-200/70 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-950">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Latest reviews</p>
                    <div className="space-y-3">
                      {shop.reviews.slice(0, 3).map((review) => (
                        <div key={review.id} className="rounded-3xl border border-slate-200/70 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                          <div className="flex items-center justify-between gap-3 text-sm text-slate-500 dark:text-slate-400">
                            <span>{review.customer}</span>
                            <span>{review.source}</span>
                          </div>
                          <p className="mt-2 text-base font-semibold">{review.rating} ★</p>
                          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{review.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-8">
            <Card className="rounded-3xl bg-white dark:bg-slate-900">
              <CardHeader>
                <CardTitle>Cart overview</CardTitle>
                <CardDescription>Update quantities, remove items, and see the total at a glance.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {shop.cart.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-300/70 bg-slate-50 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950/80 dark:text-slate-400">
                    Your cart is empty. Add fresh juice or merch to continue.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {shop.cart.map((item) => (
                      <div key={item.id} className="rounded-3xl border border-slate-200/70 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950">
                        <div className="flex items-start gap-4">
                          <div className="h-20 w-20 overflow-hidden rounded-3xl bg-white">
                            <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <h3 className="font-semibold">{item.name}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{item.category}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-slate-500 hover:text-destructive"
                                type="button"
                                onClick={() => dispatch(removeFromCart(item.id))}
                              >
                                ×
                              </Button>
                            </div>
                            <div className="mt-4 flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-950">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-9 rounded-full"
                                  onClick={() => dispatch(updateCartQuantity({ productId: item.id, quantity: item.quantity - 1 }))}
                                >
                                  −
                                </Button>
                                <span className="w-8 text-center font-medium">{item.quantity}</span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-9 rounded-full"
                                  onClick={() => dispatch(updateCartQuantity({ productId: item.id, quantity: item.quantity + 1 }))}
                                >
                                  +
                                </Button>
                              </div>
                              <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-3xl bg-white dark:bg-slate-900">
              <CardHeader>
                <CardTitle>Staff inventory management</CardTitle>
                <CardDescription>Staff can adjust stock levels for each store from this dashboard.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="mb-2 block">Select store</Label>
                  <select
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-ring/50"
                    value={selectedStoreId}
                    onChange={(event) => setSelectedStoreId(event.target.value)}
                  >
                    {shop.stores.map((store) => (
                      <option key={store.id} value={store.id}>
                        {store.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-3">
                  {selectedStore?.inventory.map((inventory) => {
                    const product = shop.products.find((item) => item.id === inventory.productId);
                    return (
                      <div key={inventory.productId} className="rounded-3xl border border-slate-200/70 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{product?.name}</p>
                            <p className="font-semibold">Stock: {inventory.stock}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => dispatch(updateStock({ storeId: selectedStore.id, productId: inventory.productId, stock: inventory.stock + 5 }))}
                            >
                              +5
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => dispatch(updateStock({ storeId: selectedStore.id, productId: inventory.productId, stock: Math.max(0, inventory.stock - 5) }))}
                            >
                              −5
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl bg-white dark:bg-slate-900">
              <CardHeader>
                <CardTitle>Rider availability & delivery tracking</CardTitle>
                <CardDescription>Riders can mark availability and customers can follow active deliveries.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="mb-2 block">Choose rider</Label>
                  <select
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-ring/50"
                    value={selectedRiderId}
                    onChange={(event) => setSelectedRiderId(event.target.value)}
                  >
                    {shop.riders.map((rider) => (
                      <option key={rider.id} value={rider.id}>
                        {rider.name} — {rider.area}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="rounded-3xl border border-slate-200/70 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Rider status</p>
                      <p className="mt-1 text-lg font-semibold">{selectedRider?.status}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id="rider-availability"
                        checked={selectedRider?.available ?? false}
                        onCheckedChange={(checked) =>
                          dispatch(
                            setRiderAvailability({ riderId: selectedRider?.id ?? "", available: Boolean(checked) }),
                          )
                        }
                      />
                      <Label htmlFor="rider-availability">Available for delivery</Label>
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-slate-600 dark:text-slate-400">
                    {selectedRider?.available
                      ? "This rider can accept new pickup requests now."
                      : "This rider is currently offline or delivering another order."}
                  </div>
                </div>
                <div className="rounded-3xl border border-slate-200/70 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Live delivery tracker</p>
                  <div className="mt-3 rounded-3xl border border-dashed border-slate-300/70 bg-white p-5 dark:border-slate-700 dark:bg-slate-950">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Order ID</p>
                    <p className="mt-1 text-lg font-semibold">{trackedOrder.id}</p>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Status: {trackedOrder.status}</p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">ETA: {trackedOrder.eta}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {(["pending", "preparing", "on the way", "delivered"] as const).map((status) => (
                        <Button
                          key={status}
                          variant={trackedOrder?.status === status ? "secondary" : "outline"}
                          size="sm"
                          onClick={() => dispatch(updateOrderStatus({ orderId: trackedOrder.id, status }))}
                        >
                          {status}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl bg-white dark:bg-slate-900">
              <CardHeader>
                <CardTitle>Brand ambassadors</CardTitle>
                <CardDescription>Sign up influencers and ambassadors for Jaba Waba juice campaigns.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 rounded-3xl border border-slate-200/70 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-950">
                  <div>
                    <Label htmlFor="ambassador-name">Full name</Label>
                    <Input
                      id="ambassador-name"
                      value={ambassadorForm.name}
                      onChange={(event) => setAmbassadorForm({ ...ambassadorForm, name: event.target.value })}
                      placeholder="Amina Mwangi"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ambassador-email">Email</Label>
                    <Input
                      id="ambassador-email"
                      value={ambassadorForm.email}
                      onChange={(event) => setAmbassadorForm({ ...ambassadorForm, email: event.target.value })}
                      placeholder="amina@jaba-waba.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ambassador-socials">Social profile</Label>
                    <Input
                      id="ambassador-socials"
                      value={ambassadorForm.socials}
                      onChange={(event) => setAmbassadorForm({ ...ambassadorForm, socials: event.target.value })}
                      placeholder="@jaba_influencer"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ambassador-message">Why do you want to represent Jaba Waba?</Label>
                    <Textarea
                      id="ambassador-message"
                      value={ambassadorForm.message}
                      onChange={(event) => setAmbassadorForm({ ...ambassadorForm, message: event.target.value })}
                      placeholder="Tell us about your audience and ideas."
                    />
                  </div>
                  <Button onClick={handleAmbassadorSubmit}>Submit ambassador application</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl bg-white dark:bg-slate-900">
              <CardHeader>
                <CardTitle>Wholesale enrollment</CardTitle>
                <CardDescription>Allow wholesale partners to register and request product access.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 rounded-3xl border border-slate-200/70 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-950">
                  <div>
                    <Label htmlFor="wholesale-company">Company name</Label>
                    <Input
                      id="wholesale-company"
                      value={wholesaleForm.company}
                      onChange={(event) => setWholesaleForm({ ...wholesaleForm, company: event.target.value })}
                      placeholder="Jaba Waba Distributors"
                    />
                  </div>
                  <div>
                    <Label htmlFor="wholesale-contact">Contact person</Label>
                    <Input
                      id="wholesale-contact"
                      value={wholesaleForm.contact}
                      onChange={(event) => setWholesaleForm({ ...wholesaleForm, contact: event.target.value })}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="wholesale-email">Email</Label>
                    <Input
                      id="wholesale-email"
                      value={wholesaleForm.email}
                      onChange={(event) => setWholesaleForm({ ...wholesaleForm, email: event.target.value })}
                      placeholder="contact@jaba-wholesale.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="wholesale-region">Region</Label>
                    <Input
                      id="wholesale-region"
                      value={wholesaleForm.region}
                      onChange={(event) => setWholesaleForm({ ...wholesaleForm, region: event.target.value })}
                      placeholder="East Africa"
                    />
                  </div>
                  <div>
                    <Label htmlFor="wholesale-volume">Expected monthly volume</Label>
                    <Input
                      id="wholesale-volume"
                      value={wholesaleForm.expectedVolume}
                      onChange={(event) => setWholesaleForm({ ...wholesaleForm, expectedVolume: event.target.value })}
                      placeholder="2500 bottles"
                    />
                  </div>
                  <div>
                    <Label htmlFor="wholesale-message">Message</Label>
                    <Textarea
                      id="wholesale-message"
                      value={wholesaleForm.message}
                      onChange={(event) => setWholesaleForm({ ...wholesaleForm, message: event.target.value })}
                      placeholder="Tell us about your wholesale network and needs."
                    />
                  </div>
                  <Button onClick={handleWholesaleSubmit}>Submit wholesale application</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl bg-white dark:bg-slate-900">
              <CardHeader>
                <CardTitle>Upcoming events</CardTitle>
                <CardDescription>Party packs and launch events that keep the brand active.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {shop.events.map((event) => (
                  <div key={event.id} className="rounded-3xl border border-slate-200/70 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold">{event.title}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{event.location} — {event.date}</p>
                      </div>
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary dark:bg-primary/20">
                        Event
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">{event.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </aside>
        </div>
      </section>
    </main>
  );
}
