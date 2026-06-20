-- Seed data for Jaba Waba
-- Run AFTER 001_initial_schema.sql
-- Or use POST /api/seed (recommended — uses the same data from src/lib/seed-data.ts)

INSERT INTO public.categories (id, name, slug) VALUES
  ('juice',       'Juice',       'juice'),
  ('party-pack',  'Party Pack',  'party-pack'),
  ('merch',       'Merch',       'merch'),
  ('event',       'Event',       'event')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, name, category, category_id, description, price, image, stock, tags) VALUES
  ('jaba-original', 'Jaba Waba Original Juice', 'Juice', 'juice',
   'A refreshing tropical blend made with fresh pineapple, mango, and orange.',
   6.50, 'https://images.unsplash.com/photo-1508747703725-7197e5119a04?auto=format&fit=crop&q=80&w=900', 78,
   ARRAY['Tropical','Fresh','Best Seller']),
  ('green-boost', 'Green Boost Juice', 'Juice', 'juice',
   'A nutrient-rich green blend with spinach, apple, celery, and lime.',
   7.50, 'https://images.unsplash.com/photo-1551024709-8f23befc6fd4?auto=format&fit=crop&q=80&w=900', 52,
   ARRAY['Detox','Kale','Vitamin C']),
  ('party-pack-6', 'Party Pack - 6 Bottles', 'Party Pack', 'party-pack',
   'Perfect for group orders: six mixed juices for any celebration.',
   36.00, 'https://images.unsplash.com/photo-1543353071-087092ec393a?auto=format&fit=crop&q=80&w=900', 24,
   ARRAY['Bulk','Party','Gift']),
  ('jaba-hoodie', 'Jaba Waba Hoodie', 'Merch', 'merch',
   'Soft cotton hoodie with the Jaba Waba logo for ambassadors and fans.',
   45.00, 'https://images.unsplash.com/photo-1520975911877-5de8e8d55dda?auto=format&fit=crop&q=80&w=900', 18,
   ARRAY['Clothing','Brand','Limited Edition']),
  ('summer-launch-party', 'Summer Launch Party Ticket', 'Event', 'event',
   'Reserve a ticket for the Jaba Waba Community Launch Party.',
   12.00, 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=900', 150,
   ARRAY['Event','Live','Community'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.stores (id, name, city) VALUES
  ('store-central',   'Jaba Waba Central',   'Nairobi'),
  ('store-riverside', 'Jaba Waba Riverside', 'Mombasa')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.inventory (store_id, product_id, stock) VALUES
  ('store-central',   'jaba-original',        42),
  ('store-central',   'green-boost',          30),
  ('store-central',   'jaba-hoodie',          10),
  ('store-riverside', 'jaba-original',        24),
  ('store-riverside', 'party-pack-6',         18),
  ('store-riverside', 'summer-launch-party',  52)
ON CONFLICT (store_id, product_id) DO UPDATE SET stock = EXCLUDED.stock;

INSERT INTO public.riders (id, name, area, available, status) VALUES
  ('rider-kimani', 'Kimani', 'Westlands', true,  'available'),
  ('rider-anya',   'Anya',   'Karen',     false, 'delivering')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.reviews (id, customer, rating, text, source, date) VALUES
  ('review-1', 'Miriam', 5,
   'Jaba Waba juice is the freshest I''ve ever tasted. Fast delivery and amazing service!',
   'Google', '2026-05-18'),
  ('review-2', 'Peter', 4,
   'The party pack was a hit at our event. Loved the tropical vibes.',
   'In-house', '2026-05-03')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.events (id, title, date, location, description) VALUES
  ('event-launch', 'Jaba Waba Launch Festival', '2026-06-25', 'Saritte Gardens',
   'Join our grand launch party with live music, demo tastings and exclusive gifts.'),
  ('event-holiday', 'Holiday Juice Pop-Up', '2026-07-10', 'Village Market',
   'Discover new seasonal blends, limited merch, and ambassador sign-ups.')
ON CONFLICT (id) DO NOTHING;
