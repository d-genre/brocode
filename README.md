# Friday & Co. — Clothing Store Starter

A working storefront: product browsing, size selection, cart, wishlist, and an admin
panel for managing stock. Built with React (Vite) + Supabase.

## What's already built

- **Shop page** — product grid, pulled live from your database
- **Product detail page** — size picker with per-size stock awareness (greys out sold-out sizes, warns at low stock)
- **Cart** — add/update/remove, quantity capped at available stock
- **Wishlist** — heart-toggle on products
- **Auth** — email/password signup & login (Supabase Auth)
- **Admin dashboard** (`/admin`, only visible to admins) — add products, edit stock per size, hide/delete products

## What you need to set up (15–20 minutes)

### 1. Create a free Supabase project
Go to https://supabase.com → New Project. Wait for it to finish provisioning.

### 2. Run the database schema
In your Supabase project: **SQL Editor → New query**, paste the entire contents of
`supabase/schema.sql`, and run it. This creates all tables, security rules, and a
few sample products so you have something to look at immediately.

### 3. Get your API keys
**Project Settings → API**. You need:
- Project URL
- `anon` public key

### 4. Connect the app to your project
```bash
cp .env.example .env
```
Open `.env` and paste in your Project URL and anon key.

### 5. Install and run
```bash
npm install
npm run dev
```
Open the printed localhost URL.

### 6. Make yourself an admin
1. Sign up for an account in the app itself (top right → Log in → Sign up).
2. In Supabase: **Table Editor → profiles**, find your row (matched by email),
   and set `is_admin` to `true`.
3. Refresh the app — you'll now see an "Admin" link in the navbar.

## How stock actually works

Every size of every product is its own row in `product_variants`, with its own
`stock_quantity`. That's the whole trick: "Black Hoodie, size M, 4 left" and
"Black Hoodie, size L, 0 left" are independent numbers you edit independently in
the admin panel. When a customer adds to cart, the app reads stock from this table
directly, so sold-out sizes are disabled automatically — no manual syncing needed.

## What's NOT built yet (on purpose, so you can extend it)

- **Checkout / payment** — the Cart page has a placeholder Checkout button.
  For India, Razorpay or Cashfree are the standard picks; both have docs for
  exactly this kind of React + Supabase setup.
- **Order history** — once checkout exists, you'll want an `orders` table that
  copies cart items into a permanent record (so changing/removing a product later
  doesn't break someone's past order).
- **Decrementing stock on purchase** — right now stock only changes when *you*
  edit it in admin. Once checkout is wired up, the checkout flow should reduce
  `stock_quantity` at the moment of purchase, inside a database transaction (a
  Postgres function is the safe way to do this so two people buying the last item
  at the same time can't both succeed).
- **Image uploads** — currently products take an image URL. Supabase Storage can
  host uploaded images directly if you'd rather not depend on external URLs.
- **Deployment** — Vercel or Netlify both deploy a Vite app for free in a few
  clicks once you connect this to a GitHub repo. Add the same two `.env`
  variables in their dashboard's environment variable settings.

## Project structure
```
src/
  lib/supabase.js          Supabase client
  context/                 Auth, Cart, Wishlist state (shared app-wide)
  components/               Navbar, ProductCard
  pages/                    Shop, ProductDetail, Cart, Wishlist, Login
  admin/                     AdminDashboard, AddProductForm
supabase/schema.sql         Run this once in Supabase's SQL editor
```
