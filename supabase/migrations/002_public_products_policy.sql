-- 002_public_products_policy.sql
-- Ensure anonymous users can SELECT from public.products

-- Enable row level security (safe if already enabled)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Replace any existing policy with a public read policy
DROP POLICY IF EXISTS products_public_read ON public.products;
CREATE POLICY products_public_read
  ON public.products
  FOR SELECT
  USING (true);

-- If you prefer to only allow unauthenticated requests, but keep other
-- policies for logged-in roles, adjust the USING clause accordingly.
