-- Jaba Waba / Commercn initial schema
-- Run in Supabase SQL Editor or via `supabase db push`

-- ── Categories ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.categories (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL UNIQUE,
  slug       TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Products ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.products (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  category    TEXT NOT NULL,
  category_id TEXT REFERENCES public.categories(id),
  description TEXT,
  price       DECIMAL(10,2) NOT NULL,
  image       TEXT,
  stock       INTEGER DEFAULT 0,
  tags        TEXT[] DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ── Stores ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.stores (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  city       TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Inventory (per-store stock) ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.inventory (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id   TEXT NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  stock      INTEGER DEFAULT 0,
  UNIQUE (store_id, product_id)
);

-- ── Riders ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.riders (
  id               TEXT PRIMARY KEY,
  user_id          UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name             TEXT NOT NULL,
  area             TEXT NOT NULL,
  available        BOOLEAN DEFAULT true,
  status           TEXT CHECK (status IN ('available', 'delivering', 'offline')) DEFAULT 'available',
  current_order_id UUID,
  created_at       TIMESTAMPTZ DEFAULT now()
);

-- ── User Profiles ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id               UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  email            TEXT NOT NULL,
  phone            TEXT,
  delivery_address TEXT,
  location         TEXT,
  role             TEXT CHECK (role IN ('customer', 'staff', 'rider', 'admin')) DEFAULT 'customer',
  store_id         TEXT REFERENCES public.stores(id),
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);

-- ── Orders ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.orders (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name    TEXT,
  items            JSONB NOT NULL DEFAULT '[]',
  total            DECIMAL(10,2) NOT NULL,
  delivery_address TEXT,
  delivery_fee     DECIMAL(10,2) DEFAULT 0,
  payment_method   TEXT CHECK (payment_method IN ('mpesa', 'stripe')),
  status           TEXT CHECK (status IN ('pending', 'confirmed', 'preparing', 'on_the_way', 'delivered')) DEFAULT 'pending',
  eta              TEXT,
  created_at       TIMESTAMPTZ DEFAULT now()
);

-- ── Reviews ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.reviews (
  id         TEXT PRIMARY KEY,
  customer   TEXT NOT NULL,
  rating     INTEGER CHECK (rating >= 1 AND rating <= 5),
  text       TEXT,
  source     TEXT CHECK (source IN ('Google', 'In-house')) DEFAULT 'In-house',
  date       DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Events ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.events (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  date        DATE NOT NULL,
  location    TEXT NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ── Auto-create profile on signup ───────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'customer'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── Row Level Security ────────────────────────────────────────────────────────
ALTER TABLE public.categories    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.riders        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events        ENABLE ROW LEVEL SECURITY;

-- Public read for catalog data
CREATE POLICY "categories_public_read" ON public.categories FOR SELECT USING (true);
CREATE POLICY "products_public_read"   ON public.products   FOR SELECT USING (true);
CREATE POLICY "stores_public_read"     ON public.stores     FOR SELECT USING (true);
CREATE POLICY "inventory_public_read"  ON public.inventory  FOR SELECT USING (true);
CREATE POLICY "riders_public_read"     ON public.riders     FOR SELECT USING (true);
CREATE POLICY "reviews_public_read"    ON public.reviews    FOR SELECT USING (true);
CREATE POLICY "events_public_read"     ON public.events     FOR SELECT USING (true);

-- Users manage their own profile
CREATE POLICY "profiles_select_own" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Users manage their own orders
CREATE POLICY "orders_select_own" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "orders_insert_own" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Anyone can submit a review (authenticated)
CREATE POLICY "reviews_insert_auth" ON public.reviews
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
