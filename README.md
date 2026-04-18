# Novaël

> _Elegance, Effortless._ — A minimalist luxury beauty e-commerce experience, crafted for the modern woman.

Novaël is a single-page React application for a premium women's beauty brand, starting with magnetic eyelashes. The UI is inspired by the restraint and confidence of houses like Chanel: deep noir, ivory linens, whispered gold. The architecture is built to scale effortlessly from one SKU to a full beauty portfolio.

---

## Tech stack

- **React 18** + **Vite** — fast SPA tooling
- **Tailwind CSS** — design tokens driven from `src/styles/tokens.css`
- **Supabase** — auth, database, storage (frontend-only consumer)
- **Zustand** — lightweight stores for cart + auth
- **React Router DOM** — lazy-loaded routes with page transitions
- **Framer Motion** — scroll reveals, marquee, drawer & modal motion
- **Radix UI** — accessible Dialog, Toast, Tabs, Accordion, Dropdown
- **React Hook Form + Zod** — typed form validation
- **Recharts** — admin analytics
- **react-image-gallery** — product imagery
- **lucide-react** — icon system

---

## Getting started

### 1. Prerequisites

- Node.js `>= 20.19` (Vite 7 requirement)
- An account on [Supabase](https://supabase.com/)

### 2. Install

```bash
npm install
```

### 3. Environment

Copy the example file and fill in your Supabase credentials:

```bash
cp .env.local.example .env.local
```

```
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

> With placeholder credentials the UI still renders, but auth/data operations will fail gracefully and log to the console.

### 4. Dev server

```bash
npm run dev
```

Opens at `http://localhost:5173`.

### 5. Production build

```bash
npm run build
npm run preview
```

---

## Supabase setup

### Schema

Paste the following into the Supabase **SQL editor** and run once. It creates every table, RLS policy, trigger, and seed row the app needs.

<details>
<summary>Click to expand the full SQL</summary>

```sql
-- =========================
-- EXTENSIONS
-- =========================
create extension if not exists "pgcrypto";

-- =========================
-- PROFILES
-- =========================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  avatar_url text,
  addresses jsonb default '[]'::jsonb,
  is_admin boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- Auto create profile + grant welcome coupon when a user registers
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email)
  on conflict (id) do nothing;

  insert into public.user_promo_usage (user_id, promo_code, used)
  values (new.id, 'WELCOME15', false)
  on conflict do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================
-- PRODUCTS
-- =========================
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  tagline text,
  description text,
  price numeric(10,2) not null,
  compare_at_price numeric(10,2),
  images jsonb default '[]'::jsonb,
  category text,
  tags text[] default '{}',
  ingredients text,
  usage_instructions text,
  stock integer default 0,
  is_active boolean default true,
  is_featured boolean default false,
  avg_rating numeric(3,2) default 0,
  review_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.products enable row level security;
create policy "products_select_all" on public.products for select using (true);
create policy "products_admin_all" on public.products for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade,
  name text not null,
  price_delta numeric(10,2) default 0,
  stock integer default 0,
  sort_order integer default 0
);

alter table public.product_variants enable row level security;
create policy "variants_select_all" on public.product_variants for select using (true);
create policy "variants_admin_all" on public.product_variants for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

-- =========================
-- PROMO CODES
-- =========================
create table if not exists public.promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  description text,
  discount_type text check (discount_type in ('percent','fixed')),
  discount_value numeric(10,2) not null,
  min_order_value numeric(10,2) default 0,
  first_time_only boolean default false,
  max_uses integer,
  uses_count integer default 0,
  expires_at timestamptz,
  is_active boolean default true,
  created_at timestamptz default now()
);

alter table public.promo_codes enable row level security;
create policy "promo_select_active" on public.promo_codes
  for select using (is_active);
create policy "promo_admin_all" on public.promo_codes for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

create table if not exists public.user_promo_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  promo_code text not null,
  used boolean default false,
  used_at timestamptz,
  unique (user_id, promo_code)
);

alter table public.user_promo_usage enable row level security;
create policy "promo_usage_select_own" on public.user_promo_usage
  for select using (auth.uid() = user_id);
create policy "promo_usage_update_own" on public.user_promo_usage
  for update using (auth.uid() = user_id);
create policy "promo_usage_insert_own" on public.user_promo_usage
  for insert with check (auth.uid() = user_id);
create policy "promo_usage_admin_all" on public.user_promo_usage for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

-- =========================
-- ORDERS
-- =========================
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  user_id uuid references auth.users(id) on delete set null,
  guest_email text,
  status text default 'pending'
    check (status in ('pending','processing','shipped','delivered','cancelled','refunded')),
  items jsonb not null,
  subtotal numeric(10,2) not null,
  discount numeric(10,2) default 0,
  shipping numeric(10,2) default 0,
  tax numeric(10,2) default 0,
  total numeric(10,2) not null,
  promo_code text,
  shipping_address jsonb,
  billing_address jsonb,
  shipping_method text,
  tracking_number text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.orders enable row level security;
create policy "orders_select_own" on public.orders
  for select using (auth.uid() = user_id);
create policy "orders_insert_anyone" on public.orders
  for insert with check (true);
create policy "orders_admin_all" on public.orders for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

-- =========================
-- WISHLIST
-- =========================
create table if not exists public.wishlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  product_id uuid references public.products(id) on delete cascade,
  created_at timestamptz default now(),
  unique (user_id, product_id)
);

alter table public.wishlist enable row level security;
create policy "wishlist_own" on public.wishlist for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- =========================
-- REVIEWS
-- =========================
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  rating integer check (rating between 1 and 5),
  title text,
  body text,
  is_approved boolean default false,
  created_at timestamptz default now()
);

alter table public.reviews enable row level security;
create policy "reviews_select_approved" on public.reviews
  for select using (is_approved or auth.uid() = user_id);
create policy "reviews_insert_auth" on public.reviews
  for insert with check (auth.uid() = user_id);
create policy "reviews_admin_all" on public.reviews for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

-- =========================
-- SUBSCRIBERS / EMAIL LOGS
-- =========================
create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  source text,
  is_active boolean default true,
  created_at timestamptz default now()
);

alter table public.subscribers enable row level security;
create policy "subscribers_insert_anyone" on public.subscribers
  for insert with check (true);
create policy "subscribers_admin_all" on public.subscribers for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

create table if not exists public.email_logs (
  id uuid primary key default gen_random_uuid(),
  subject text,
  body text,
  recipients_count integer default 0,
  sent_at timestamptz default now(),
  sent_by uuid references auth.users(id)
);

alter table public.email_logs enable row level security;
create policy "email_logs_admin_all" on public.email_logs for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

-- =========================
-- SEED: welcome coupon
-- =========================
insert into public.promo_codes (code, description, discount_type, discount_value, first_time_only)
values ('WELCOME15', '15% off your first order', 'percent', 15, true)
on conflict (code) do nothing;

-- =========================
-- SEED: sample product
-- =========================
insert into public.products (slug, name, tagline, description, price, compare_at_price, category, images, stock, is_active, is_featured, tags)
values (
  'the-signature-lash',
  'The Signature Lash',
  'Magnetic. Weightless. Unmistakable.',
  'A featherlight magnetic eyelash crafted from premium silk fibres, designed for effortless wear from sunrise ceremony to candlelit soirée. Reusable up to 40 applications.',
  68, 84, 'Magnetic Lashes',
  '[
    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1600",
    "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=1600",
    "https://images.unsplash.com/photo-1583241800698-9c2e8c0e6f36?w=1600"
  ]'::jsonb,
  120, true, true, '{signature,bestseller}'
)
on conflict (slug) do nothing;
```

</details>

### Promoting an admin user

After registering a user in the app, mark them as admin:

```sql
update public.profiles
set is_admin = true
where email = 'you@example.com';
```

Admin routes (`/admin/*`) will now be accessible.

### Optional: Google OAuth

Inside the Supabase dashboard → **Authentication → Providers → Google**, enable Google and drop in your OAuth client credentials. The login page will route through the provider automatically.

---

## Project structure

```
src/
├── components/
│   ├── auth/          # AuthShell
│   ├── cart/          # CartDrawer, CartItem
│   ├── common/        # Logo, GoldDivider, AnimatedReveal, SearchOverlay
│   ├── layout/        # Navbar, Footer, MainLayout, AdminLayout
│   ├── product/       # ProductCard, ProductGrid
│   └── ui/            # Button, Input, Badge, Modal, Toast, Spinner
├── config/            # brand.js — tone, copy, nav, values
├── hooks/             # useProducts, useOrders, usePromo, useWishlist, useAdmin
├── lib/               # supabase client, utils (cn, formatters)
├── pages/             # Home, Shop, ProductDetail, Cart, Checkout, …
│   └── admin/         # Dashboard, Orders, Products, Stock, Customers, Marketing
├── routes/            # AppRouter, ProtectedRoute
├── store/             # cartStore, authStore (Zustand + persist)
└── styles/            # tokens.css, globals.css
```

---

## Theming

Every color, radius, transition, and spacing value is exposed as a CSS custom property in `src/styles/tokens.css`. To re-theme the entire experience:

1. Open `src/styles/tokens.css`.
2. Edit the values under `:root`, e.g.

   ```css
   --noir: #0a0a0a;          /* primary dark */
   --ivory: #f7f3ed;         /* primary light */
   --champagne: #d4af76;     /* gold accent */
   --rose-shadow: #c9a0a0;   /* soft accent */
   ```

3. Save. Tailwind maps these variables into utilities (`bg-noir`, `text-champagne`, …) so the brand updates everywhere instantly.

For typography, replace the Google Fonts link in `index.html` and update `fontFamily` in `tailwind.config.js`.

---

## Scripts

| command            | description                              |
|--------------------|------------------------------------------|
| `npm run dev`      | Start Vite dev server (hot reload)       |
| `npm run build`    | Production build to `dist/`              |
| `npm run preview`  | Preview the production build locally     |

---

## Notes

- **Payments** are **simulated**. Search for `// TODO: Stripe` in `src/pages/Checkout.jsx` to plug in a real PSP.
- **Transactional emails** (order confirmation, password reset) are logged only. Wire them up via a Supabase Edge Function or service like Resend; placeholders live in `src/pages/admin/AdminMarketing.jsx` and the order flow.
- **Images** use Unsplash placeholders. Swap in your production CDN by updating the `images` JSON on each product.
- **Accessibility**: All interactive components are built on Radix primitives for keyboard & screen-reader support.
- **SEO**: Page-level metadata is managed via `react-helmet-async`.

---

© Novaël. Crafted with quiet confidence.
