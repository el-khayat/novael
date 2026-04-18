-- =====================================================================
-- Novaël — initial schema
-- Creates every table, RLS policy, and trigger required by the frontend.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  full_name     text,
  email         text,
  phone         text,
  avatar_url    text,
  addresses     jsonb default '[]'::jsonb,
  is_admin      boolean default false,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- ---------------------------------------------------------------------
-- Products + variants
-- ---------------------------------------------------------------------
create table if not exists public.products (
  id                  uuid primary key default gen_random_uuid(),
  slug                text unique not null,
  name                text not null,
  tagline             text,
  description         text,
  price               numeric(10,2) not null,
  compare_at_price    numeric(10,2),
  images              jsonb default '[]'::jsonb,
  category            text,
  tags                text[] default '{}',
  ingredients         text,
  usage_instructions  text,
  stock               integer default 0,
  is_active           boolean default true,
  is_featured         boolean default false,
  avg_rating          numeric(3,2) default 0,
  review_count        integer default 0,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

alter table public.products enable row level security;

drop policy if exists "products_select_all" on public.products;
create policy "products_select_all" on public.products
  for select using (true);

drop policy if exists "products_admin_all" on public.products;
create policy "products_admin_all" on public.products
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

create table if not exists public.product_variants (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid references public.products(id) on delete cascade,
  name        text not null,
  price_delta numeric(10,2) default 0,
  stock       integer default 0,
  sort_order  integer default 0
);

alter table public.product_variants enable row level security;

drop policy if exists "variants_select_all" on public.product_variants;
create policy "variants_select_all" on public.product_variants
  for select using (true);

drop policy if exists "variants_admin_all" on public.product_variants;
create policy "variants_admin_all" on public.product_variants
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

-- ---------------------------------------------------------------------
-- Promo codes + per-user usage
-- ---------------------------------------------------------------------
create table if not exists public.promo_codes (
  id              uuid primary key default gen_random_uuid(),
  code            text unique not null,
  description     text,
  discount_type   text check (discount_type in ('percent','fixed')),
  discount_value  numeric(10,2) not null,
  min_order_value numeric(10,2) default 0,
  first_time_only boolean default false,
  max_uses        integer,
  uses_count      integer default 0,
  expires_at      timestamptz,
  is_active       boolean default true,
  created_at      timestamptz default now()
);

alter table public.promo_codes enable row level security;

drop policy if exists "promo_select_active" on public.promo_codes;
create policy "promo_select_active" on public.promo_codes
  for select using (is_active);

drop policy if exists "promo_admin_all" on public.promo_codes;
create policy "promo_admin_all" on public.promo_codes
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

create table if not exists public.user_promo_usage (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade,
  promo_code  text not null,
  used        boolean default false,
  used_at     timestamptz,
  unique (user_id, promo_code)
);

alter table public.user_promo_usage enable row level security;

drop policy if exists "promo_usage_select_own" on public.user_promo_usage;
create policy "promo_usage_select_own" on public.user_promo_usage
  for select using (auth.uid() = user_id);

drop policy if exists "promo_usage_update_own" on public.user_promo_usage;
create policy "promo_usage_update_own" on public.user_promo_usage
  for update using (auth.uid() = user_id);

drop policy if exists "promo_usage_insert_own" on public.user_promo_usage;
create policy "promo_usage_insert_own" on public.user_promo_usage
  for insert with check (auth.uid() = user_id);

drop policy if exists "promo_usage_admin_all" on public.user_promo_usage;
create policy "promo_usage_admin_all" on public.user_promo_usage
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

-- ---------------------------------------------------------------------
-- Orders
-- ---------------------------------------------------------------------
create table if not exists public.orders (
  id                uuid primary key default gen_random_uuid(),
  order_number      text unique not null,
  user_id           uuid references auth.users(id) on delete set null,
  guest_email       text,
  status            text default 'pending'
    check (status in ('pending','processing','shipped','delivered','cancelled','refunded')),
  items             jsonb not null,
  subtotal          numeric(10,2) not null,
  discount          numeric(10,2) default 0,
  shipping          numeric(10,2) default 0,
  tax               numeric(10,2) default 0,
  total             numeric(10,2) not null,
  promo_code        text,
  shipping_address  jsonb,
  billing_address   jsonb,
  shipping_method   text,
  tracking_number   text,
  notes             text,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

alter table public.orders enable row level security;

drop policy if exists "orders_select_own" on public.orders;
create policy "orders_select_own" on public.orders
  for select using (auth.uid() = user_id);

drop policy if exists "orders_insert_anyone" on public.orders;
create policy "orders_insert_anyone" on public.orders
  for insert with check (true);

drop policy if exists "orders_admin_all" on public.orders;
create policy "orders_admin_all" on public.orders
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

-- ---------------------------------------------------------------------
-- Wishlist
-- ---------------------------------------------------------------------
create table if not exists public.wishlist (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade,
  product_id  uuid references public.products(id) on delete cascade,
  created_at  timestamptz default now(),
  unique (user_id, product_id)
);

alter table public.wishlist enable row level security;

drop policy if exists "wishlist_own" on public.wishlist;
create policy "wishlist_own" on public.wishlist
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- Reviews
-- ---------------------------------------------------------------------
create table if not exists public.reviews (
  id           uuid primary key default gen_random_uuid(),
  product_id   uuid references public.products(id) on delete cascade,
  user_id      uuid references auth.users(id) on delete set null,
  rating       integer check (rating between 1 and 5),
  title        text,
  body         text,
  is_approved  boolean default false,
  created_at   timestamptz default now()
);

alter table public.reviews enable row level security;

drop policy if exists "reviews_select_approved" on public.reviews;
create policy "reviews_select_approved" on public.reviews
  for select using (is_approved or auth.uid() = user_id);

drop policy if exists "reviews_insert_auth" on public.reviews;
create policy "reviews_insert_auth" on public.reviews
  for insert with check (auth.uid() = user_id);

drop policy if exists "reviews_admin_all" on public.reviews;
create policy "reviews_admin_all" on public.reviews
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

-- ---------------------------------------------------------------------
-- Subscribers + email logs
-- ---------------------------------------------------------------------
create table if not exists public.subscribers (
  id          uuid primary key default gen_random_uuid(),
  email       text unique not null,
  source      text,
  is_active   boolean default true,
  created_at  timestamptz default now()
);

alter table public.subscribers enable row level security;

drop policy if exists "subscribers_insert_anyone" on public.subscribers;
create policy "subscribers_insert_anyone" on public.subscribers
  for insert with check (true);

drop policy if exists "subscribers_admin_all" on public.subscribers;
create policy "subscribers_admin_all" on public.subscribers
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

create table if not exists public.email_logs (
  id                uuid primary key default gen_random_uuid(),
  subject           text,
  body              text,
  recipients_count  integer default 0,
  sent_at           timestamptz default now(),
  sent_by           uuid references auth.users(id)
);

alter table public.email_logs enable row level security;

drop policy if exists "email_logs_admin_all" on public.email_logs;
create policy "email_logs_admin_all" on public.email_logs
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

-- ---------------------------------------------------------------------
-- Trigger: auto-create profile + welcome coupon on signup
-- ---------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.email)
  on conflict (id) do nothing;

  insert into public.user_promo_usage (user_id, promo_code, used)
  values (new.id, 'WELCOME15', false)
  on conflict (user_id, promo_code) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- Helpful indexes
-- ---------------------------------------------------------------------
create index if not exists idx_products_category  on public.products (category);
create index if not exists idx_products_featured  on public.products (is_featured) where is_featured;
create index if not exists idx_orders_user        on public.orders (user_id);
create index if not exists idx_orders_status      on public.orders (status);
create index if not exists idx_reviews_product    on public.reviews (product_id);
create index if not exists idx_wishlist_user      on public.wishlist (user_id);
