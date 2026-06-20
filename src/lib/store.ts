import { configureStore, createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type UserRole = "customer" | "staff" | "rider" | "admin";

export type UserState = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  storeId?: string;
  phone?: string;
  delivery_address?: string;
  location?: string;
};

export type ProductCategory = "Juice" | "Party Pack" | "Merch" | "Event";

export type Product = {
  id: string;
  name: string;
  category: ProductCategory;
  description: string;
  price: number;
  image: string;
  stock: number;
  tags: string[];
};

export type CartItem = Product & { quantity: number };

export type StoreLocation = {
  id: string;
  name: string;
  city: string;
  inventory: { productId: string; stock: number }[];
};

export type RiderProfile = {
  id: string;
  name: string;
  area: string;
  available: boolean;
  status: "available" | "delivering" | "offline";
  currentOrderId?: string;
};

export type Review = {
  id: string;
  customer: string;
  rating: number;
  text: string;
  source: "Google" | "In-house";
  date: string;
};

export type EventItem = {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
};

export type AmbassadorApplication = {
  id: string;
  name: string;
  email: string;
  socials: string;
  message: string;
  submittedAt: string;
};

export type WholesaleApplication = {
  id: string;
  company: string;
  contact: string;
  email: string;
  region: string;
  expectedVolume: string;
  message: string;
  submittedAt: string;
};

export type Order = {
  id: string;
  customer: string;
  status: "pending" | "preparing" | "on the way" | "delivered";
  eta: string;
  items: CartItem[];
  total: number;
  createdAt: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
};

export type ShopState = {
  user: UserState | null;
  categories: Category[];
  authReady: boolean;
  products: Product[];
  cart: CartItem[];
  stores: StoreLocation[];
  riders: RiderProfile[];
  reviews: Review[];
  events: EventItem[];
  ambassadors: AmbassadorApplication[];
  wholesaleApplications: WholesaleApplication[];
  orders: Order[];
  dataLoaded: boolean;
  dataError: string | null;
};

const initialState: ShopState = {
  user: null,
  authReady: false,
  categories: [],
  dataLoaded: false,
  dataError: null,
  products: [
    {
      id: "jaba-original",
      name: "Jaba Waba Original Juice",
      category: "Juice",
      description: "A refreshing tropical blend made with fresh pineapple, mango, and orange.",
      price: 6.5,
      image: "https://images.unsplash.com/photo-1508747703725-7197e5119a04?auto=format&fit=crop&q=80&w=900",
      stock: 78,
      tags: ["Tropical", "Fresh", "Best Seller"],
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
    },
  ],
  cart: [],
  stores: [
    {
      id: "store-central",
      name: "Jaba Waba Central",
      city: "Nairobi",
      inventory: [
        { productId: "jaba-original", stock: 42 },
        { productId: "green-boost", stock: 30 },
        { productId: "jaba-hoodie", stock: 10 },
      ],
    },
    {
      id: "store-riverside",
      name: "Jaba Waba Riverside",
      city: "Mombasa",
      inventory: [
        { productId: "jaba-original", stock: 24 },
        { productId: "party-pack-6", stock: 18 },
        { productId: "summer-launch-party", stock: 52 },
      ],
    },
  ],
  riders: [
    {
      id: "rider-kimani",
      name: "Kimani",
      area: "Westlands",
      available: true,
      status: "available",
      currentOrderId: undefined,
    },
    {
      id: "rider-anya",
      name: "Anya",
      area: "Karen",
      available: false,
      status: "delivering",
      currentOrderId: "order-1",
    },
  ],
  reviews: [
    {
      id: "review-1",
      customer: "Miriam",
      rating: 5,
      text: "Jaba Waba juice is the freshest I've ever tasted. Fast delivery and amazing service!",
      source: "Google",
      date: "2026-05-18",
    },
    {
      id: "review-2",
      customer: "Peter",
      rating: 4,
      text: "The party pack was a hit at our event. Loved the tropical vibes.",
      source: "In-house",
      date: "2026-05-03",
    },
  ],
  events: [
    {
      id: "event-launch",
      title: "Jaba Waba Launch Festival",
      date: "2026-06-25",
      location: "Saritte Gardens",
      description: "Join our grand launch party with live music, demo tastings and exclusive gifts.",
    },
    {
      id: "event-holiday",
      title: "Holiday Juice Pop-Up",
      date: "2026-07-10",
      location: "Village Market",
      description: "Discover new seasonal blends, limited merch, and ambassador sign-ups.",
    },
  ],
  ambassadors: [],
  wholesaleApplications: [],
  orders: [
    {
      id: "order-1",
      customer: "Amina",
      status: "on the way",
      eta: "12:15 PM",
      createdAt: "2026-05-20T10:30:00Z",
      items: [
        { ...{
          id: "jaba-original",
          name: "Jaba Waba Original Juice",
          category: "Juice",
          description: "A refreshing tropical blend made with fresh pineapple, mango, and orange.",
          price: 6.5,
          image: "https://images.unsplash.com/photo-1508747703725-7197e5119a04?auto=format&fit=crop&q=80&w=900",
          stock: 78,
          tags: ["Tropical", "Fresh", "Best Seller"],
        }, quantity: 2 }],
      total: 13,
    },
  ],
};

const shopSlice = createSlice({
  name: "shop",
  initialState,
  reducers: {
    login(state, action: PayloadAction<UserState>) {
      state.user = action.payload;
      state.authReady = true;
    },
    logout(state) {
      state.user = null;
      state.authReady = true;
    },
    updateUser(state, action: PayloadAction<Partial<UserState>>) {
      if (!state.user) return;
      state.user = { ...state.user, ...action.payload };
    },
    setCategories(state, action: PayloadAction<Category[]>) {
      state.categories = action.payload;
    },
    setProducts(state, action: PayloadAction<Product[]>) {
      state.products = action.payload;
    },
    setStores(state, action: PayloadAction<StoreLocation[]>) {
      state.stores = action.payload;
    },
    setRiders(state, action: PayloadAction<RiderProfile[]>) {
      state.riders = action.payload;
    },
    setReviews(state, action: PayloadAction<Review[]>) {
      state.reviews = action.payload;
    },
    setEvents(state, action: PayloadAction<EventItem[]>) {
      state.events = action.payload;
    },
    setOrders(state, action: PayloadAction<Order[]>) {
      state.orders = action.payload;
    },
    setDataLoaded(state, action: PayloadAction<boolean>) {
      state.dataLoaded = action.payload;
    },
    setDataError(state, action: PayloadAction<string | null>) {
      state.dataError = action.payload;
    },
    addToCart(state, action: PayloadAction<string>) {
      const product = state.products.find((item) => item.id === action.payload);
      if (!product) return;
      const existing = state.cart.find((item) => item.id === product.id);
      if (existing) {
        existing.quantity += 1;
      } else {
        state.cart.push({ ...product, quantity: 1 });
      }
    },
    removeFromCart(state, action: PayloadAction<string>) {
      state.cart = state.cart.filter((item) => item.id !== action.payload);
    },
    updateCartQuantity(
      state,
      action: PayloadAction<{ productId: string; quantity: number }>,
    ) {
      const item = state.cart.find((cartItem) => cartItem.id === action.payload.productId);
      if (!item) return;
      item.quantity = Math.max(1, action.payload.quantity);
    },
    updateStock(
      state,
      action: PayloadAction<{ storeId: string; productId: string; stock: number }>,
    ) {
      const store = state.stores.find((location) => location.id === action.payload.storeId);
      if (!store) return;
      const inventory = store.inventory.find((item) => item.productId === action.payload.productId);
      if (!inventory) return;
      inventory.stock = Math.max(0, action.payload.stock);
    },
    setRiderAvailability(
      state,
      action: PayloadAction<{ riderId: string; available: boolean }>,
    ) {
      const rider = state.riders.find((item) => item.id === action.payload.riderId);
      if (!rider) return;
      rider.available = action.payload.available;
      rider.status = action.payload.available ? "available" : "offline";
    },
    addReview(state, action: PayloadAction<Review>) {
      state.reviews.unshift(action.payload);
    },
    submitAmbassador(state, action: PayloadAction<AmbassadorApplication>) {
      state.ambassadors.unshift(action.payload);
    },
    submitWholesale(state, action: PayloadAction<WholesaleApplication>) {
      state.wholesaleApplications.unshift(action.payload);
    },
    updateOrderStatus(
      state,
      action: PayloadAction<{ orderId: string; status: Order["status"] }>,
    ) {
      const order = state.orders.find((item) => item.id === action.payload.orderId);
      if (!order) return;
      order.status = action.payload.status;
    },
  },
});

export const {
  login,
  logout,
  updateUser,
  setCategories,
  setProducts,
  setStores,
  setRiders,
  setReviews,
  setEvents,
  setOrders,
  setDataLoaded,
  setDataError,
  addToCart,
  removeFromCart,
  updateCartQuantity,
  updateStock,
  setRiderAvailability,
  addReview,
  submitAmbassador,
  submitWholesale,
  updateOrderStatus,
} = shopSlice.actions;

export const store = configureStore({
  reducer: {
    shop: shopSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
