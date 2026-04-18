-- =====================================================================
-- Align product schema with frontend field names.
--   - rename products.compare_at_price  -> compare_price
--   - rename products.tagline           -> short_desc
--   - add    products.sku
--   - rename product_variants.price_delta -> price_modifier
-- All statements are idempotent so the migration can be re-run safely.
-- =====================================================================

-- products.compare_at_price -> compare_price
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'products' and column_name = 'compare_at_price'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'products' and column_name = 'compare_price'
  ) then
    alter table public.products rename column compare_at_price to compare_price;
  end if;
end $$;

-- products.tagline -> short_desc
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'products' and column_name = 'tagline'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'products' and column_name = 'short_desc'
  ) then
    alter table public.products rename column tagline to short_desc;
  end if;
end $$;

-- products.sku
alter table public.products
  add column if not exists sku text;

-- product_variants.price_delta -> price_modifier
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'product_variants' and column_name = 'price_delta'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'product_variants' and column_name = 'price_modifier'
  ) then
    alter table public.product_variants rename column price_delta to price_modifier;
  end if;
end $$;
