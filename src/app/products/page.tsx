"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronRight, Crown, X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/redux-hooks";
import { addToCart, Product } from "@/lib/store";
import { ProductDetailOne } from "@/components/commercn/product-details/product-detail-01";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

const categories = ["All", "Juice", "Party Pack", "Merch", "Event"] as const;

const partyPacks = [
  {
    id: "starter-pack",
    title: "Starter Pack",
    tagline: "Kick It Off",
    description:
      "Perfect for a chill hangout, birthday pre-game, or just vibing with your crew of 4–6.",
    details: [
      "6 bottles of Handas Jaba Juice (mixed flavors)",
      "1 pack of Handas Hibiscus Tea Bags",
      "6 branded party cups",
      "Free delivery within Nairobi CBD",
    ],
    price: "KSh 2,500",
    badge: "Most Popular",
  },
  {
    id: "squad-pack",
    title: "Squad Pack",
    tagline: "Level Up the Energy",
    description:
      "Hosting 8–15 friends? This pack brings the full energy for a memorable celebration.",
    details: [
      "12 bottles of Handas Jaba Juice (your choice of flavors)",
      "2 packs of Handas Hibiscus Tea Bags",
      "12 branded party cups & napkins",
      "Ice bucket with fresh fruit garnishes",
      "Priority same-day delivery in Nairobi",
    ],
    price: "KSh 5,500",
    badge: "Popular",
  },
  {
    id: "vip-pack",
    title: "VIP Pack",
    tagline: "Go All Out",
    description:
      "The ultimate bespoke experience for 20+ guests — weddings, launches, or milestone events.",
    details: [
      "24 bottles of Handas Jaba Juice (full flavor range)",
      "4 packs of Handas Hibiscus Tea Bags",
      "24 branded party cups, napkins & stirrers",
      "Premium ice bucket, exotic fruits & condiments",
      "Branded display setup with signage",
      "Dedicated delivery & on-site setup team",
    ],
    price: "KSh 12,000",
    badge: "VIP",
    footnote: "* VIP orders require at least 3 days advance booking.",
  },
];

const predefinedProducts: Array<Product & Record<string, any>> = [
  {
    id: "jaba-original",
    name: "Jaba Waba Original Juice",
    category: "Juice",
    description: "A refreshing tropical blend made with fresh pineapple, mango, and orange.",
    price: 6.5,
    image: "https://images.unsplash.com/photo-1508747703725-7197e5119a04?auto=format&fit=crop&q=80&w=900",
    stock: 78,
    tags: ["Tropical", "Fresh", "Best Seller"],
    images: [
      "https://images.unsplash.com/photo-1508747703725-7197e5119a04?auto=format&fit=crop&q=80&w=900",
      "https://images.unsplash.com/photo-1551024709-8f23befc6fd4?auto=format&fit=crop&q=80&w=900",
      "https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&q=80&w=900",
    ],
    sizes: ["500ml", "1L", "2L"],
  },
  {
    id: "green-boost",
    name: "Green Boost Juice",
    category: "Juice",
    description: "A nutrient-rich green blend with spinach, apple, celery, and lime.",
    price: 7.5,
    image: "https://images.unsplash.com/photo-1551024709-8f23befc6fd4?auto=format&fit=crop&q=80&w=900",
    stock: 52,
    tags: ["Detox", "Kale", "Vitamin C"],
    images: [
      "https://images.unsplash.com/photo-1551024709-8f23befc6fd4?auto=format&fit=crop&q=80&w=900",
      "https://images.unsplash.com/photo-1510626176961-45a9b7c714f1?auto=format&fit=crop&q=80&w=900",
    ],
    sizes: ["500ml", "1L"],
  },
  {
    id: "party-pack-6",
    name: "Party Pack - 6 Bottles",
    category: "Party Pack",
    description: "Perfect for group orders: six mixed juices for any celebration.",
    price: 36,
    image: "https://images.unsplash.com/photo-1543353071-087092ec393a?auto=format&fit=crop&q=80&w=900",
    stock: 24,
    tags: ["Bulk", "Party", "Gift"],
    images: [
      "https://images.unsplash.com/photo-1543353071-087092ec393a?auto=format&fit=crop&q=80&w=900",
      "https://images.unsplash.com/photo-1527596420908-2f2a70af0171?auto=format&fit=crop&q=80&w=900",
    ],
    sizes: ["6 bottles", "12 bottles"],
  },
  {
    id: "jaba-hoodie",
    name: "Jaba Waba Hoodie",
    category: "Merch",
    description: "Soft cotton hoodie with the Jaba Waba logo for ambassadors and fans.",
    price: 45,
    image: "https://images.unsplash.com/photo-1520975911877-5de8e8d55dda?auto=format&fit=crop&q=80&w=900",
    stock: 18,
    tags: ["Clothing", "Brand", "Limited Edition"],
    images: [
      "https://images.unsplash.com/photo-1520975911877-5de8e8d55dda?auto=format&fit=crop&q=80&w=900",
      "https://images.unsplash.com/photo-1593032465177-e850bba8dd0f?auto=format&fit=crop&q=80&w=900",
    ],
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "summer-launch-party",
    name: "Summer Launch Party Ticket",
    category: "Event",
    description: "Reserve a ticket for the Jaba Waba Community Launch Party.",
    price: 12,
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=900",
    stock: 150,
    tags: ["Event", "Live", "Community"],
    images: [
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=900",
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&q=80&w=900",
    ],
    venue: "Saritte Gardens",
    location: "Saritte Gardens, Nairobi",
    ticketPhone: "254712345678",
  },
];



export default function ProductsPage() {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const categoryQuery = searchParams.get("category") ?? "All";
  const [selectedProduct, setSelectedProduct] = useState<Product & Record<string, any> | null>(null);
  const products = useAppSelector((state) => state.shop.products || predefinedProducts);

  const filteredProducts = useMemo(() => {
    if (categoryQuery === "All") {
      return products;
    }
    return products.filter((product) => product.category === categoryQuery);
  }, [categoryQuery]);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col">
      <style>{`
      @keyframes goldShine {
        0%   { background-position: 0% 50%; }
        50%  { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
    `}</style>
      <Navbar />
      <main className="flex-1 px-6 py-10 max-w-7xl mx-auto w-full">
        <div className="mb-10 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-green-600">Jaba Waba Shop</p>
              <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                Browse products and events.
              </h1>
              <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-400">
                Discover juice blends, party packs, merch items, and ticketed experiences with live booking.
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm transition hover:border-green-500 hover:text-green-700"
            >
              Need help? Contact us
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-[240px_minmax(0,1fr)]">
            <aside className="rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-950">
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                Categories
              </h2>
              <div className="mt-6 space-y-2">
                {categories.map((category) => {
                  const isActive = category === categoryQuery;
                  return (
                    <Link
                      key={category}
                      href={`/products${category === "All" ? "" : `?category=${encodeURIComponent(category)}`}`}
                      className={`block rounded-2xl px-4 py-3 transition ${isActive
                        ? "bg-green-600 text-white shadow-lg"
                        : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
                        }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span>{category}</span>
                        {category !== "All" && (
                          <span className="rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                            {products.filter((item) => item.category === category).length}
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </aside>

            <section className="space-y-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Showing {filteredProducts.length} items for
                    <span className="font-semibold text-slate-900 dark:text-white"> {categoryQuery}</span>
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                  {categories.slice(1).map((cat) => (
                    <Link
                      key={cat}
                      href={`/products?category=${encodeURIComponent(cat)}`}
                      className="rounded-full border border-slate-200 px-3 py-2 text-slate-600 transition hover:border-green-500 hover:text-green-700 dark:border-slate-800 dark:text-slate-300 dark:hover:text-green-400"
                    >
                      {cat}
                    </Link>
                  ))}
                </div>
              </div>

              {categoryQuery === "Party Pack" ? (
                <section className="grid gap-6">
                  <div className="rounded-3xl border border-green-200 bg-green-50 p-6 dark:border-green-900 dark:bg-green-950">
                    <p className="text-sm uppercase tracking-[0.3em] font-semibold text-green-700 dark:text-green-300">
                      Party Packs
                    </p>
                    <h2 className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">
                      We plan. You party.
                    </h2>
                    <p className="mt-3 text-slate-700 dark:text-slate-300 max-w-2xl leading-relaxed">
                      Sit back and let us deliver a complete Jaba experience to your door. Pick a pack, choose your flavors, and let the vibes flow.
                    </p>
                  </div>
                  <div className="grid gap-6 md:grid-cols-3">
                    {partyPacks.map((pack) => (
                      <div key={pack.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs uppercase tracking-[0.3em] text-green-600">{pack.tagline}</p>
                            <h3 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">{pack.title}</h3>
                          </div>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase inline-flex items-center gap-1 ${pack.badge === "VIP"
                                ? "text-yellow-900"
                                : "bg-green-600 text-white"
                              }`}
                            style={
                              pack.badge === "VIP"
                                ? {
                                  background:
                                    "linear-gradient(135deg, #f6d365 0%, #fda085 25%, #f6d365 50%, #c8960c 75%, #f6d365 100%)",
                                  backgroundSize: "200% 200%",
                                  animation: "goldShine 3s ease infinite",
                                  boxShadow: "0 2px 8px rgba(198,150,12,0.5)",
                                  border: "1px solid #c8960c",
                                }
                                : {}
                            }
                          >
                            {pack.badge === "VIP" && (
                              <Crown className="h-3 w-3 fill-yellow-800 text-yellow-800" />
                            )}
                            {pack.badge}
                          </span>
                        </div>
                        <p className="mt-4 text-slate-600 dark:text-slate-400 leading-relaxed">{pack.description}</p>
                        <ul className="mt-6 space-y-3 text-sm text-slate-700 dark:text-slate-300">
                          {pack.details.map((detail) => (
                            <li key={detail} className="flex gap-3">
                              <span className="mt-1 h-2.5 w-2.5 rounded-full bg-green-600" />
                              {detail}
                            </li>
                          ))}
                        </ul>
                        <div className="mt-6 flex items-center justify-between gap-4">
                          <span className="text-xl font-bold text-slate-900 dark:text-white">{pack.price}</span>
                          <Link
                            href="/contact"
                            className="rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
                          >
                            Order This Pack
                          </Link>
                        </div>
                        {pack.footnote ? (
                          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{pack.footnote}</p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}

              <div className="grid gap-6 md:grid-cols-2">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-lg dark:border-slate-800 dark:bg-slate-950">
                    <div className="overflow-hidden rounded-3xl bg-slate-100">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-60 w-full object-cover transition duration-500 hover:scale-105"
                      />
                    </div>
                    <div className="mt-5 space-y-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.3em] text-green-600">{product.category}</p>
                          <h3 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">{product.name}</h3>
                        </div>
                        <span className="text-lg font-bold text-slate-900 dark:text-white">KSH {product.price.toFixed(1)}</span>
                      </div>
                      <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">{product.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {product.tags.map((tag: string) => (
                          <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="text-sm text-slate-500">{product.stock} in stock</span>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => setSelectedProduct(product)}
                            className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                          >
                            View details
                          </button>
                          <button
                            onClick={() => dispatch(addToCart({ productId: product.id }))}
                            className="inline-flex items-center rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
                          >
                            Add to cart
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {selectedProduct ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-5xl overflow-hidden rounded-[2rem] bg-white shadow-2xl dark:bg-slate-950">
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-900 transition hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
              <ProductDetailOne product={selectedProduct} />
            </div>
          </div>
        ) : null}
      </main>
      <Footer />
    </div>
  );
}
