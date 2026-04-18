-- =====================================================================
-- Align orders + promo_codes schema with frontend field names.
--   orders:
--     - rename discount  -> discount_amount
--     - rename shipping  -> shipping_cost
--     - rename tax       -> tax_amount
--     - add payment_method
--     - add payment_status
--     - allow status 'confirmed'
--   promo_codes:
--     - allow discount_type 'percentage' (frontend uses this spelling)
-- All statements are idempotent so the migration can be re-run safely.
-- =====================================================================

-- orders.discount -> discount_amount
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'orders' and column_name = 'discount'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'orders' and column_name = 'discount_amount'
  ) then
    alter table public.orders rename column discount to discount_amount;
  end if;
end $$;

-- orders.shipping -> shipping_cost
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'orders' and column_name = 'shipping'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'orders' and column_name = 'shipping_cost'
  ) then
    alter table public.orders rename column shipping to shipping_cost;
  end if;
end $$;

-- orders.tax -> tax_amount
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'orders' and column_name = 'tax'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'orders' and column_name = 'tax_amount'
  ) then
    alter table public.orders rename column tax to tax_amount;
  end if;
end $$;

-- orders payment fields
alter table public.orders
  add column if not exists payment_method text,
  add column if not exists payment_status text default 'pending';

-- orders.status: allow 'confirmed' (replace check constraint)
do $$
declare
  conname text;
begin
  select tc.constraint_name into conname
  from information_schema.table_constraints tc
  where tc.table_schema = 'public'
    and tc.table_name   = 'orders'
    and tc.constraint_type = 'CHECK'
    and tc.constraint_name like '%status%';

  if conname is not null then
    execute format('alter table public.orders drop constraint %I', conname);
  end if;
end $$;

alter table public.orders
  add constraint orders_status_check
  check (status in (
    'pending','confirmed','processing','shipped','delivered','cancelled','refunded'
  ));

-- promo_codes.discount_type: allow 'percentage' alongside legacy values
do $$
declare
  conname text;
begin
  select tc.constraint_name into conname
  from information_schema.table_constraints tc
  where tc.table_schema = 'public'
    and tc.table_name   = 'promo_codes'
    and tc.constraint_type = 'CHECK'
    and tc.constraint_name like '%discount_type%';

  if conname is not null then
    execute format('alter table public.promo_codes drop constraint %I', conname);
  end if;
end $$;

-- migrate any existing 'percent' rows to the canonical 'percentage' spelling
update public.promo_codes set discount_type = 'percentage' where discount_type = 'percent';

alter table public.promo_codes
  add constraint promo_codes_discount_type_check
  check (discount_type in ('percentage','fixed'));
