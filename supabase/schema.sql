-- ============================================================
-- CLOTHING STORE SCHEMA
-- Run this in your Supabase project's SQL Editor (one paste, run once)
-- ============================================================

-- ---------- PROFILES (extends Supabase's built-in auth.users) ----------
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  is_admin boolean default false,
  created_at timestamptz default now()
);

-- Auto-create a profile row whenever someone signs up
create function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ---------- PRODUCTS ----------
create table products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  price numeric(10,2) not null,
  category text,
  image_url text,
  is_active boolean default true,  -- soft-delete: hide instead of removing
  created_at timestamptz default now()
);

-- ---------- PRODUCT VARIANTS (one row per size, holds the stock count) ----------
create table product_variants (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references products(id) on delete cascade not null,
  size text not null,              -- e.g. 'S', 'M', 'L', 'XL'
  stock_quantity int not null default 0,
  unique (product_id, size)
);

-- ---------- CART ----------
create table cart_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  variant_id uuid references product_variants(id) on delete cascade not null,
  quantity int not null default 1 check (quantity > 0),
  created_at timestamptz default now(),
  unique (user_id, variant_id)
);

-- ---------- WISHLIST ----------
create table wishlist_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  product_id uuid references products(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique (user_id, product_id)
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- This is what stops random users from editing stock or seeing
-- other people's carts. Without this, your database is wide open.
-- ============================================================

alter table profiles enable row level security;
alter table products enable row level security;
alter table product_variants enable row level security;
alter table cart_items enable row level security;
alter table wishlist_items enable row level security;

-- Helper: is the current logged-in user an admin?
create function is_admin()
returns boolean as $$
  select coalesce(
    (select is_admin from profiles where id = auth.uid()),
    false
  );
$$ language sql security definer stable;

-- PROFILES: users can see their own profile only
create policy "view own profile" on profiles
  for select using (auth.uid() = id);

-- PRODUCTS: anyone (even logged out) can view active products
create policy "anyone can view active products" on products
  for select using (is_active = true or is_admin());

-- PRODUCTS: only admins can add/edit/delete
create policy "admins manage products" on products
  for insert with check (is_admin());
create policy "admins update products" on products
  for update using (is_admin());
create policy "admins delete products" on products
  for delete using (is_admin());

-- VARIANTS: anyone can view (need to see sizes/stock to shop)
create policy "anyone can view variants" on product_variants
  for select using (true);

-- VARIANTS: only admins can manage stock
create policy "admins manage variants" on product_variants
  for insert with check (is_admin());
create policy "admins update variants" on product_variants
  for update using (is_admin());
create policy "admins delete variants" on product_variants
  for delete using (is_admin());

-- CART: users only see/edit their own cart
create policy "users manage own cart" on cart_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- WISHLIST: users only see/edit their own wishlist
create policy "users manage own wishlist" on wishlist_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- SEED DATA (optional - delete this section if you don't want test data)
-- ============================================================
insert into products (name, description, price, category, image_url) values
  ('Classic White Tee', 'Soft cotton crew neck', 599.00, 'T-Shirts', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500'),
  ('Denim Jacket', 'Vintage wash denim jacket', 2499.00, 'Jackets', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500'),
  ('Black Hoodie', 'Heavyweight fleece hoodie', 1299.00, 'Hoodies', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500');

-- Add size variants for each seeded product
insert into product_variants (product_id, size, stock_quantity)
select id, size, 10
from products, unnest(array['S','M','L','XL']) as size;
