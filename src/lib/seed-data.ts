/**
 * Single source of truth for sample data.
 * Used by the /api/seed endpoint and supabase/seed.sql.
 */

export const SEED_CATEGORIES = [
  { id: "juice", name: "Juice", slug: "juice" },
  { id: "party-pack", name: "Party Pack", slug: "party-pack" },
  { id: "merch", name: "Merch", slug: "merch" },
  { id: "event", name: "Event", slug: "event" },
] as const;

export const SEED_PRODUCTS = [
  {
    id: "jaba-original",
    name: "Jaba Waba Original Juice",
    category: "Juice",
    category_id: "juice",
    description:
      "A refreshing tropical blend made with fresh pineapple, mango, and orange.",
    price: 6.5,
    image:
      "https://images.unsplash.com/photo-1508747703725-7197e5119a04?auto=format&fit=crop&q=80&w=900",
    stock: 78,
    tags: ["Tropical", "Fresh", "Best Seller"],
  },
  {
    id: "green-boost",
    name: "Green Boost Juice",
    category: "Juice",
    category_id: "juice",
    description:
      "A nutrient-rich green blend with spinach, apple, celery, and lime.",
    price: 7.5,
    image:
      "https://images.unsplash.com/photo-1551024709-8f23befc6fd4?auto=format&fit=crop&q=80&w=900",
    stock: 52,
    tags: ["Detox", "Kale", "Vitamin C"],
  },
  {
    id: "party-pack-6",
    name: "Party Pack - 6 Bottles",
    category: "Party Pack",
    category_id: "party-pack",
    description: "Perfect for group orders: six mixed juices for any celebration.",
    price: 36,
    image:
      "https://images.unsplash.com/photo-1543353071-087092ec393a?auto=format&fit=crop&q=80&w=900",
    stock: 24,
    tags: ["Bulk", "Party", "Gift"],
  },
  {
    id: "jaba-hoodie",
    name: "Jaba Waba Hoodie",
    category: "Merch",
    category_id: "merch",
    description:
      "Soft cotton hoodie with the Jaba Waba logo for ambassadors and fans.",
    price: 45,
    image:
      "https://images.unsplash.com/photo-1520975911877-5de8e8d55dda?auto=format&fit=crop&q=80&w=900",
    stock: 18,
    tags: ["Clothing", "Brand", "Limited Edition"],
  },
  {
    id: "summer-launch-party",
    name: "Summer Launch Party Ticket",
    category: "Event",
    category_id: "event",
    description: "Reserve a ticket for the Jaba Waba Community Launch Party.",
    price: 12,
    image:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=900",
    stock: 150,
    tags: ["Event", "Live", "Community"],
  },
] as const;

export const SEED_STORES = [
  { id: "store-central", name: "Jaba Waba Central", city: "Nairobi" },
  { id: "store-riverside", name: "Jaba Waba Riverside", city: "Mombasa" },
] as const;

export const SEED_INVENTORY = [
  { store_id: "store-central", product_id: "jaba-original", stock: 42 },
  { store_id: "store-central", product_id: "green-boost", stock: 30 },
  { store_id: "store-central", product_id: "jaba-hoodie", stock: 10 },
  { store_id: "store-riverside", product_id: "jaba-original", stock: 24 },
  { store_id: "store-riverside", product_id: "party-pack-6", stock: 18 },
  { store_id: "store-riverside", product_id: "summer-launch-party", stock: 52 },
] as const;

export const SEED_RIDERS = [
  {
    id: "rider-kimani",
    name: "Kimani",
    area: "Westlands",
    available: true,
    status: "available" as const,
    current_order_id: null,
  },
  {
    id: "rider-anya",
    name: "Anya",
    area: "Karen",
    available: false,
    status: "delivering" as const,
    current_order_id: null,
  },
] as const;

export const SEED_REVIEWS = [
  {
    id: "review-1",
    customer: "Miriam",
    rating: 5,
    text: "Jaba Waba juice is the freshest I've ever tasted. Fast delivery and amazing service!",
    source: "Google" as const,
    date: "2026-05-18",
  },
  {
    id: "review-2",
    customer: "Peter",
    rating: 4,
    text: "The party pack was a hit at our event. Loved the tropical vibes.",
    source: "In-house" as const,
    date: "2026-05-03",
  },
] as const;

export const SEED_EVENTS = [
  {
    id: "event-launch",
    title: "Jaba Waba Launch Festival",
    date: "2026-06-25",
    location: "Saritte Gardens",
    description:
      "Join our grand launch party with live music, demo tastings and exclusive gifts.",
  },
  {
    id: "event-holiday",
    title: "Holiday Juice Pop-Up",
    date: "2026-07-10",
    location: "Village Market",
    description:
      "Discover new seasonal blends, limited merch, and ambassador sign-ups.",
  },
] as const;
