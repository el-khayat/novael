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

## Supabase setup (hosted, no Docker)

All schema lives in version-controlled migration files under `supabase/`. The CLI applies them directly to your hosted Supabase project over HTTPS/Postgres — **no Docker required**.

```
supabase/
├── config.toml                              # CLI project id
├── migrations/
│   └── 20260418000000_initial_schema.sql    # tables, RLS, triggers, indexes
└── seed.sql                                 # welcome coupon + sample products
```

### 1. Supabase CLI

Already installed as a dev dependency of this repo — no global install needed. `npm install` at the root gives you access to every `db:*` script below.

(If you prefer a global install: `brew install supabase/tap/supabase` on macOS, `npm i -g supabase` elsewhere.)

### 2. Create a hosted project

1. Go to <https://supabase.com/dashboard> → **New project**.
2. Pick a name (e.g. `novael`), a region, and a strong DB password.
3. Wait ~2 minutes for it to provision.
4. Grab two things from **Project Settings → API**:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public key** → `VITE_SUPABASE_ANON_KEY`
5. Grab one more thing from the same page: the **project ref** (the subdomain before `.supabase.co`, e.g. `abcdxyz123`).

Put the URL + anon key into `.env.local`:

```
VITE_SUPABASE_URL=https://<ref>.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

### 3. Link the CLI to your project

```bash
npm run db:login                            # opens a browser once
npm run db:link -- <your-project-ref>       # stores the ref locally
```

The CLI will prompt for your DB password (from step 2). Enter it — it's saved in your keychain, not committed.

### 4. Apply the schema + seed

```bash
npm run db:push            # runs every file in supabase/migrations/
npm run db:seed            # loads welcome coupon + sample products
```

You should now see all tables in the dashboard's **Table Editor**.

### 5. Creating new migrations later

```bash
supabase migration new add_lookbook_table
# edit the new file under supabase/migrations/
npm run db:push            # ship to hosted
```

Or let the CLI diff changes made directly in the dashboard:

```bash
npm run db:diff my_schema_change
```

### 6. Promoting an admin user

After registering in the app, open the dashboard's **SQL editor** and run:

```sql
update public.profiles
set is_admin = true
where email = 'you@example.com';
```

Admin routes (`/admin/*`) are now accessible.

### 7. Optional: Google OAuth

In the dashboard → **Authentication → Providers → Google**, enable Google and drop in your OAuth client credentials. The login page routes through the provider automatically.

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

| command                     | description                                   |
|-----------------------------|-----------------------------------------------|
| `npm run dev`               | Start Vite dev server (hot reload)            |
| `npm run build`             | Production build to `dist/`                   |
| `npm run preview`           | Preview the production build locally          |
| `npm run db:login`          | Authenticate the Supabase CLI (one-time)      |
| `npm run db:link -- <ref>`  | Link this repo to a hosted Supabase project   |
| `npm run db:push`           | Apply migrations to the linked project        |
| `npm run db:seed`           | Run `supabase/seed.sql` on the linked project |
| `npm run db:diff <name>`    | Generate a new migration from dashboard edits |

---

## Notes

- **Payments** are **simulated**. Search for `// TODO: Stripe` in `src/pages/Checkout.jsx` to plug in a real PSP.
- **Transactional emails** (order confirmation, password reset) are logged only. Wire them up via a Supabase Edge Function or service like Resend; placeholders live in `src/pages/admin/AdminMarketing.jsx` and the order flow.
- **Images** use Unsplash placeholders. Swap in your production CDN by updating the `images` JSON on each product.
- **Accessibility**: All interactive components are built on Radix primitives for keyboard & screen-reader support.
- **SEO**: Page-level metadata is managed via `react-helmet-async`.

---

© Novaël. Crafted with quiet confidence.
