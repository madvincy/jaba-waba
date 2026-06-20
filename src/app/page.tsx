"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { ProductSlider } from "@/components/product-slider";
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
import { Star, Users, Briefcase, X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/redux-hooks";
import { addToCart, submitAmbassador, submitWholesale } from "@/lib/store";
import { EventSlider } from "@/components/event-slider";

const categories = [
  {
    id: "juice",
    name: "Fresh Juices",
    icon: "🥤",
    color: "from-green-400 to-green-600",
  },
  {
    id: "party",
    name: "Party Packs",
    icon: "🎉",
    color: "from-pink-400 to-pink-600",
  },
  {
    id: "merch",
    name: "Merchandise",
    icon: "👕",
    color: "from-purple-400 to-purple-600",
  },
  {
    id: "events",
    name: "Events",
    icon: "🎊",
    color: "from-orange-400 to-orange-600",
  },
];

const eventImages = [
  {
    id: 1,
    title: "Jaba Waba Launch Festival",
    date: "June 25, 2026",
    location: "Saritte Gardens, Nairobi",
    desc: "Grand launch with live music, tastings & exclusive gifts.",
    img: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=900",
    color: "#16a34a",
  },
  {
    id: 2,
    title: "Holiday Juice Pop-Up",
    date: "July 10, 2026",
    location: "Village Market, Nairobi",
    desc: "Seasonal blends, limited merch & ambassador sign-ups.",
    img: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&q=80&w=900",
    color: "#db2777",
  },
  {
    id: 3,
    title: "Rooftop Sunset Sip",
    date: "August 3, 2026",
    location: "Westlands Rooftop, Nairobi",
    desc: "Sundowners with fresh juice cocktails and live DJ sets.",
    img: "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&q=80&w=900",
    color: "#ea580c",
  },
  {
    id: 4,
    title: "Green Detox Brunch",
    date: "August 17, 2026",
    location: "Karen Country Club",
    desc: "Wellness brunch with yoga sessions and detox tastings.",
    img: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=900",
    color: "#0891b2",
  },
  {
    id: 5,
    title: "Jaba Night Market",
    date: "September 6, 2026",
    location: "Ngong Road, Nairobi",
    desc: "Street food, music and unlimited juice sampling till midnight.",
    img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=900",
    color: "#7c3aed",
  },
];

const googleReviews = [
  {
    id: 1,
    name: "Amina K.",
    rating: 5,
    text: "The freshest juice I've ever tasted! Delivered so fast. Highly recommend Jaba Waba!",
    date: "2 weeks ago",
  },
  {
    id: 2,
    name: "James M.",
    rating: 5,
    text: "Perfect for my office parties. The party pack was absolutely delicious and everyone loved it.",
    date: "1 month ago",
  },
  {
    id: 3,
    name: "Sarah L.",
    rating: 4,
    text: "Great quality and taste. Delivery was quick. Would appreciate more flavor options.",
    date: "3 weeks ago",
  },
];

type ModalType = "ambassador" | "wholesale" | null;

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

export default function HomePage() {
  const dispatch = useAppDispatch();
  const products = useAppSelector((state) => state.shop.products);
  const [openModal, setOpenModal] = useState<ModalType>(null);
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

  const handleAmbassadorSubmit = () => {
    if (!ambassadorForm.name || !ambassadorForm.email) return;
    dispatch(
      submitAmbassador({
        ...ambassadorForm,
        id: `ambassador-${Date.now()}`,
        submittedAt: new Date().toISOString(),
      })
    );
    setAmbassadorForm({ name: "", email: "", socials: "", message: "" });
    setOpenModal(null);
  };

  const handleWholesaleSubmit = () => {
    if (!wholesaleForm.company || !wholesaleForm.email) return;
    dispatch(
      submitWholesale({
        ...wholesaleForm,
        id: `wholesale-${Date.now()}`,
        submittedAt: new Date().toISOString(),
      })
    );
    setWholesaleForm({
      company: "",
      contact: "",
      email: "",
      region: "",
      expectedVolume: "",
      message: "",
    });
    setOpenModal(null);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar />

      {/* Hero Section with Slider */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ProductSlider />
      </section>

      {/* Categories Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="mb-12 text-center text-3xl font-bold md:text-4xl bg-gradient-to-r from-green-600 to-pink-600 bg-clip-text text-transparent">
          Shop by Category
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => {
            const queryCategory =
              category.id === "juice"
                ? "Juice"
                : category.id === "party"
                  ? "Party Pack"
                  : category.id === "merch"
                    ? "Merch"
                    : "Event";

            return (
              <Link
                key={category.id}
                href={`/products?category=${encodeURIComponent(queryCategory)}`}
              >
                <Card className="h-full cursor-pointer hover:shadow-lg transition-shadow border-2 border-slate-200 dark:border-slate-800 overflow-hidden group">
                  <CardContent
                    className={`p-8 text-center bg-gradient-to-br ${category.color} text-white h-full flex flex-col items-center justify-center gap-4 group-hover:scale-105 transition-transform`}
                  >
                    <span className="text-5xl">{category.icon}</span>
                    <h3 className="font-bold text-lg">{category.name}</h3>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Products */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900 rounded-3xl">
        <h2 className="mb-12 text-center text-3xl font-bold md:text-4xl bg-gradient-to-r from-green-600 to-pink-600 bg-clip-text text-transparent">
          Featured Products
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {products.slice(0, 4).map((product) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-xl transition-shadow border-green-200 dark:border-green-900">
              <div className="relative h-40 overflow-hidden bg-slate-100">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover group-hover:scale-110 transition-transform"
                />
              </div>
              <CardContent className="p-4">
                <div className="mb-2 inline-block px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300">
                  {product.category}
                </div>
                <CardTitle className="text-lg mb-2">{product.name}</CardTitle>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-2xl font-bold text-green-600">
                    KSH{product.price}
                  </span>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white rounded-lg"
                    onClick={() => dispatch(addToCart({ productId: product.id }))}
                  >
                    Add
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Button
            size="lg"
            asChild
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-full"
          >
            <Link href="/products">Browse All Products</Link>
          </Button>
        </div>
      </section>

      {/* About Us Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 items-center">
          <div>
            <h2 className="text-3xl font-bold md:text-4xl mb-6 bg-gradient-to-r from-green-600 to-pink-600 bg-clip-text text-transparent">
              About Jaba Waba
            </h2>
            <p className="mb-4 text-slate-600 dark:text-slate-400 leading-relaxed">
              Founded in 2024, Jaba Waba is dedicated to bringing fresh, organic
              juices directly to your doorstep. We believe in quality, sustainability,
              and supporting local farmers.
            </p>
            <p className="mb-6 text-slate-600 dark:text-slate-400 leading-relaxed">
              Every bottle of juice is handcrafted daily using the freshest fruits
              available in our region. We don't use any artificial preservatives or
              added sugars.
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">5000+</div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Happy Customers</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-600">2500+</div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Orders Delivered</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">100%</div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Organic</p>
              </div>
            </div>
          </div>
          <div className="h-80 overflow-hidden rounded-3xl">
            <img
              src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=800"
              alt="Fresh juice preparation"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Google Reviews Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="mb-4 text-center text-3xl font-bold md:text-4xl bg-gradient-to-r from-green-600 to-pink-600 bg-clip-text text-transparent">
          Google Reviews
        </h2>
        <p className="text-center text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto">
          See what our customers are saying about Jaba Waba on Google
        </p>
        <div className="grid gap-6 md:grid-cols-3">
          {googleReviews.map((review) => (
            <Card key={review.id} className="border-pink-200 dark:border-pink-900">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    {review.name}
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {review.date}
                  </span>
                </div>
                <div className="flex gap-1 mb-4">
                  {Array(review.rating)
                    .fill(0)
                    .map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                </div>
                <p className="text-slate-600 dark:text-slate-400">{review.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Button variant="outline" className="rounded-full border-2 border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-950">
            View all reviews on Google
          </Button>
        </div>
      </section>

      {/* Work With Us Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 bg-gradient-to-r from-green-50 to-pink-50 dark:from-slate-900 dark:to-slate-900 rounded-3xl">
        <h2 className="mb-4 text-center text-3xl font-bold md:text-4xl bg-gradient-to-r from-green-600 to-pink-600 bg-clip-text text-transparent">
          Work With Us
        </h2>
        <p className="text-center text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto">
          Join the Jaba Waba family as a brand ambassador or wholesale partner
        </p>
        <div className="grid gap-8 md:grid-cols-2">
          {/* Ambassadors Card */}
          <Card className="border-2 border-green-300 dark:border-green-800 py-0">
            <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-xl">
              <CardTitle className="flex items-center gap-2 mt-4">
                <Users className="h-5 w-5" />
                Brand Ambassador
              </CardTitle>
              <CardDescription className="text-green-100 mb-2">
                Influence and inspire your community
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <p className="text-slate-600 dark:text-slate-400">
                Become a Jaba Waba ambassador and earn commissions while spreading
                the word about our fresh juices. Perfect for influencers and
                community leaders.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  Competitive commission rates
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  Free product samples
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  Marketing support
                </li>
              </ul>
              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white rounded-lg"
                onClick={() => setOpenModal("ambassador")}
              >
                Apply Now
              </Button>
            </CardContent>
          </Card>

          {/* Wholesale Card */}
          <Card className="border-2 border-pink-300 dark:border-pink-800 py-0">
            <CardHeader className="bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-t-xl">
              <CardTitle className="flex items-center gap-2 mt-4">
                <Briefcase className="h-5 w-5" />
                Wholesale Partner
              </CardTitle>
              <CardDescription className="text-pink-100 mb-2">
                Scale your business with our products
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <p className="text-slate-600 dark:text-slate-400">
                Interested in reselling Jaba Waba products? Join our wholesale
                network and enjoy bulk pricing and dedicated support.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-pink-500" />
                  Flexible bulk ordering
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-pink-500" />
                  Premium wholesale rates
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-pink-500" />
                  Dedicated account manager
                </li>
              </ul>
              <Button
                className="w-full bg-pink-600 hover:bg-pink-700 text-white rounded-lg"
                onClick={() => setOpenModal("wholesale")}
              >
                Apply Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-widest text-green-600 font-semibold mb-2">
              Live experiences
            </p>
            <h2 className="text-3xl font-bold md:text-4xl bg-gradient-to-r from-green-600 to-pink-600 bg-clip-text text-transparent">
              Upcoming Events
            </h2>
          </div>
          <Link
            href="/events"
            className="text-sm font-medium text-green-600 hover:text-green-700 border-b border-green-600 pb-0.5 self-start sm:self-auto"
          >
            View all events →
          </Link>
        </div>

        <EventSlider events={eventImages} />
      </section>

      {/* Footer */}
      <Footer />

      {/* Ambassador Modal */}
      {openModal === "ambassador" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between bg-green-50 dark:bg-green-950">
              <CardTitle>Apply as Brand Ambassador</CardTitle>
              <button
                onClick={() => setOpenModal(null)}
                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label htmlFor="amb-name">Full name</Label>
                <Input
                  id="amb-name"
                  value={ambassadorForm.name}
                  onChange={(e) =>
                    setAmbassadorForm({ ...ambassadorForm, name: e.target.value })
                  }
                  placeholder="Your full name"
                />
              </div>
              <div>
                <Label htmlFor="amb-email">Email</Label>
                <Input
                  id="amb-email"
                  value={ambassadorForm.email}
                  onChange={(e) =>
                    setAmbassadorForm({ ...ambassadorForm, email: e.target.value })
                  }
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <Label htmlFor="amb-socials">Social media profile</Label>
                <Input
                  id="amb-socials"
                  value={ambassadorForm.socials}
                  onChange={(e) =>
                    setAmbassadorForm({
                      ...ambassadorForm,
                      socials: e.target.value,
                    })
                  }
                  placeholder="@yourhandle or profile link"
                />
              </div>
              <div>
                <Label htmlFor="amb-message">
                  Why do you want to be a Jaba Waba ambassador?
                </Label>
                <Textarea
                  id="amb-message"
                  value={ambassadorForm.message}
                  onChange={(e) =>
                    setAmbassadorForm({
                      ...ambassadorForm,
                      message: e.target.value,
                    })
                  }
                  placeholder="Tell us about yourself and your audience"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setOpenModal(null)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleAmbassadorSubmit}
                >
                  Submit
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Wholesale Modal */}
      {openModal === "wholesale" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between bg-pink-50 dark:bg-pink-950">
              <CardTitle>Wholesale Partnership</CardTitle>
              <button
                onClick={() => setOpenModal(null)}
                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label htmlFor="ws-company">Company name</Label>
                <Input
                  id="ws-company"
                  value={wholesaleForm.company}
                  onChange={(e) =>
                    setWholesaleForm({
                      ...wholesaleForm,
                      company: e.target.value,
                    })
                  }
                  placeholder="Your company name"
                />
              </div>
              <div>
                <Label htmlFor="ws-contact">Contact person</Label>
                <Input
                  id="ws-contact"
                  value={wholesaleForm.contact}
                  onChange={(e) =>
                    setWholesaleForm({
                      ...wholesaleForm,
                      contact: e.target.value,
                    })
                  }
                  placeholder="Contact person name"
                />
              </div>
              <div>
                <Label htmlFor="ws-email">Email</Label>
                <Input
                  id="ws-email"
                  value={wholesaleForm.email}
                  onChange={(e) =>
                    setWholesaleForm({
                      ...wholesaleForm,
                      email: e.target.value,
                    })
                  }
                  placeholder="your@company.com"
                />
              </div>
              <div>
                <Label htmlFor="ws-region">Region</Label>
                <Input
                  id="ws-region"
                  value={wholesaleForm.region}
                  onChange={(e) =>
                    setWholesaleForm({ ...wholesaleForm, region: e.target.value })
                  }
                  placeholder="Your region"
                />
              </div>
              <div>
                <Label htmlFor="ws-volume">Expected monthly volume</Label>
                <Input
                  id="ws-volume"
                  value={wholesaleForm.expectedVolume}
                  onChange={(e) =>
                    setWholesaleForm({
                      ...wholesaleForm,
                      expectedVolume: e.target.value,
                    })
                  }
                  placeholder="e.g., 500 bottles"
                />
              </div>
              <div>
                <Label htmlFor="ws-message">Message</Label>
                <Textarea
                  id="ws-message"
                  value={wholesaleForm.message}
                  onChange={(e) =>
                    setWholesaleForm({
                      ...wholesaleForm,
                      message: e.target.value,
                    })
                  }
                  placeholder="Tell us about your business"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setOpenModal(null)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-pink-600 hover:bg-pink-700 text-white"
                  onClick={handleWholesaleSubmit}
                >
                  Submit
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
