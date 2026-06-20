export type DbCategory = {
  id: string;
  name: string;
  slug: string;
  created_at?: string;
};

export type DbProduct = {
  id: string;
  name: string;
  category: string;
  category_id: string;
  description: string;
  price: number;
  image: string;
  stock: number;
  tags: string[];
  created_at?: string;
};

export type DbStore = {
  id: string;
  name: string;
  city: string;
  created_at?: string;
};

export type DbInventory = {
  id?: string;
  store_id: string;
  product_id: string;
  stock: number;
};

export type DbRider = {
  id: string;
  user_id?: string | null;
  name: string;
  area: string;
  available: boolean;
  status: "available" | "delivering" | "offline";
  current_order_id?: string | null;
  created_at?: string;
};

export type DbUserProfile = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  delivery_address?: string | null;
  location?: string | null;
  role: "customer" | "staff" | "rider" | "admin";
  store_id?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type DbOrderItem = {
  product_id: string;
  quantity: number;
  price: number;
  name?: string;
};

export type DbOrder = {
  id: string;
  user_id: string;
  customer_name?: string | null;
  items: DbOrderItem[];
  total: number;
  delivery_address?: string | null;
  delivery_fee: number;
  payment_method: "mpesa" | "stripe";
  status:
    | "pending"
    | "confirmed"
    | "preparing"
    | "on_the_way"
    | "delivered";
  eta?: string | null;
  created_at?: string;
};

export type DbReview = {
  id: string;
  customer: string;
  rating: number;
  text: string;
  source: "Google" | "In-house";
  date: string;
  created_at?: string;
};

export type DbEvent = {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  created_at?: string;
};

export type DbStoreWithInventory = DbStore & {
  inventory: { product_id: string; stock: number }[];
};
