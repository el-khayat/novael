-- =====================================================================
-- Novaël — seed data
-- Runs automatically after `supabase db reset` (local) and can be
-- executed against a remote project with:
--   supabase db execute --file supabase/seed.sql
-- =====================================================================

-- Welcome coupon
insert into public.promo_codes
  (code, description, discount_type, discount_value, first_time_only, is_active)
values
  ('WELCOME15', '15% off your first order', 'percentage', 15, true, true)
on conflict (code) do nothing;

-- Signature product
insert into public.products (
  slug, sku, name, short_desc, description,
  price, compare_price, category, images, stock,
  is_active, is_featured, tags,
  ingredients, usage_instructions
) values (
  'the-signature-lash',
  'NVL-SIG-001',
  'The Signature Lash',
  'Magnetic. Weightless. Unmistakable.',
  'A featherlight magnetic eyelash crafted from premium silk fibres, designed for effortless wear from sunrise ceremony to candlelit soirée. Reusable up to 40 applications.',
  68, 84, 'Magnetic Lashes',
  '[
    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1600",
    "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=1600",
    "https://images.unsplash.com/photo-1583241800698-9c2e8c0e6f36?w=1600"
  ]'::jsonb,
  120, true, true, '{signature,bestseller}',
  'Premium synthetic silk fibres, medical-grade micro-magnets, vegan-friendly adhesive-free design.',
  E'1. Apply the magnetic eyeliner along your natural lash line.\n2. Allow to dry completely (≈30 seconds).\n3. Place the lash gently on top — the micro-magnets do the rest.\n4. To remove, slide the lash sideways. No tugging, no glue.'
)
on conflict (slug) do nothing;

-- Optional: a second product to showcase the grid
insert into public.products (
  slug, sku, name, short_desc, description,
  price, category, images, stock,
  is_active, is_featured, tags
) values (
  'the-everyday-flutter',
  'NVL-FLT-002',
  'The Everyday Flutter',
  'Understated. Refined. Yours.',
  'A softer sister to The Signature Lash — tapered for a natural, daywear flutter. Made for the woman whose presence needs no announcement.',
  54, 'Magnetic Lashes',
  '[
    "https://images.unsplash.com/photo-1583241800698-9c2e8c0e6f36?w=1600",
    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1600"
  ]'::jsonb,
  80, true, false, '{everyday}'
)
on conflict (slug) do nothing;
