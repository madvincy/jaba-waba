-- 003_products_details_and_variants.sql
-- Add images, description, tags to products and create variant/stock tables

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Create product_variants table (e.g. 500ml, 1L, S, M, mug)
CREATE TABLE IF NOT EXISTS public.product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name text NOT NULL,
  sku text,
  price numeric(10,2),
  created_at timestamptz DEFAULT now()
);

-- Store-level stock per variant
CREATE TABLE IF NOT EXISTS public.product_stock_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id uuid NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  quantity integer DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  UNIQUE (variant_id, store_id)
);

CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_stock_variants_variant ON public.product_stock_variants(variant_id);
