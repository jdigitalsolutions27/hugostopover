-- Hugo's Stop Over: production schema, authorization, auditing, and storage policies.
create extension if not exists pgcrypto;

do $$ begin create type public.admin_role as enum ('owner', 'editor'); exception when duplicate_object then null; end $$;
do $$ begin create type public.publish_status as enum ('draft', 'published', 'archived'); exception when duplicate_object then null; end $$;
do $$ begin create type public.product_availability as enum ('available', 'unavailable', 'seasonal', 'preorder'); exception when duplicate_object then null; end $$;
do $$ begin create type public.inquiry_status as enum ('new', 'in_progress', 'resolved', 'archived'); exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  role public.admin_role not null default 'editor',
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_display_name_length check (char_length(display_name) <= 100)
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  image_url text,
  display_order integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint categories_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  short_description text not null default '',
  full_description text not null default '',
  category_id uuid not null references public.categories(id) on update cascade on delete restrict,
  main_image_url text,
  price numeric(12,2),
  discounted_price numeric(12,2),
  price_label text not null default 'Ask for price',
  serving_size text not null default '',
  availability public.product_availability not null default 'available',
  is_best_seller boolean not null default false,
  is_featured boolean not null default false,
  is_new boolean not null default false,
  is_seasonal boolean not null default false,
  is_preorder boolean not null default false,
  display_order integer not null default 0,
  tags text[] not null default '{}',
  seo_title text not null default '',
  seo_description text not null default '',
  status public.publish_status not null default 'draft',
  needs_review boolean not null default true,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint products_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint products_prices_positive check (price is null or price >= 0),
  constraint products_discount_positive check (discounted_price is null or discounted_price >= 0),
  constraint products_discount_valid check (discounted_price is null or price is null or discounted_price <= price)
);

create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null unique,
  public_url text not null,
  filename text not null,
  mime_type text not null,
  size_bytes bigint not null,
  width integer,
  height integer,
  alt_text text not null default '',
  caption text not null default '',
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint media_file_size check (size_bytes > 0 and size_bytes <= 5242880),
  constraint media_type check (mime_type in ('image/jpeg','image/png','image/webp','image/avif'))
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  media_id uuid references public.media(id) on delete set null,
  image_url text not null,
  alt_text text not null default '',
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique(product_id, image_url)
);

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.product_tags (
  product_id uuid not null references public.products(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (product_id, tag_id)
);

create table if not exists public.pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  seo_title text not null default '',
  seo_description text not null default '',
  status public.publish_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.page_sections (
  id uuid primary key default gen_random_uuid(),
  page_slug text not null references public.pages(slug) on update cascade on delete cascade,
  section_key text not null,
  eyebrow text not null default '',
  heading text not null default '',
  body text not null default '',
  image_url text,
  primary_cta_label text not null default '',
  primary_cta_url text not null default '',
  secondary_cta_label text not null default '',
  secondary_cta_url text not null default '',
  settings jsonb not null default '{}'::jsonb,
  is_visible boolean not null default true,
  display_order integer not null default 0,
  status public.publish_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(page_slug, section_key)
);

create table if not exists public.business_settings (
  id smallint primary key default 1 check (id = 1),
  business_name text not null default 'Hugo''s Stop Over',
  tagline text not null default '',
  logo_url text,
  favicon_url text,
  phone text not null default '',
  email text not null default '',
  address text not null default '',
  map_embed_url text not null default '',
  latitude numeric(9,6),
  longitude numeric(9,6),
  opening_hours jsonb not null default '[]'::jsonb,
  holiday_schedule text not null default '',
  facebook_url text not null default '',
  messenger_url text not null default '',
  social_links jsonb not null default '{}'::jsonb,
  announcement text not null default '',
  show_announcement boolean not null default false,
  currency text not null default 'PHP',
  default_seo_image text,
  maintenance_notice text not null default '',
  brand_colors jsonb not null default '{}'::jsonb,
  needs_confirmation text[] not null default '{}',
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null
);

create table if not exists public.promotions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  cta_label text not null default '',
  cta_url text not null default '',
  image_url text,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default false,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint promotions_date_order check (ends_at is null or starts_at is null or ends_at >= starts_at)
);

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  quote text not null,
  photo_url text,
  rating smallint,
  source text not null default '',
  status public.publish_status not null default 'draft',
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint testimonial_rating check (rating is null or rating between 1 and 5)
);

create table if not exists public.gallery_albums (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  display_order integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  album_id uuid references public.gallery_albums(id) on delete set null,
  media_id uuid references public.media(id) on delete set null,
  title text not null default '',
  image_url text not null,
  alt_text text not null,
  caption text not null default '',
  category text not null default 'food' check (category in ('food','store','customers','events','behind_the_scenes')),
  is_visible boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  product_id uuid references public.products(id) on delete set null,
  subject text not null,
  message text not null,
  status public.inquiry_status not null default 'new',
  is_read boolean not null default false,
  private_notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  deleted_at timestamptz,
  constraint inquiry_contact check (nullif(trim(coalesce(email,'')), '') is not null or nullif(trim(coalesce(phone,'')), '') is not null),
  constraint inquiry_lengths check (char_length(name) between 2 and 100 and char_length(subject) between 3 and 120 and char_length(message) between 10 and 2000)
);

create table if not exists public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  table_name text not null,
  record_id text,
  old_values jsonb,
  new_values jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.rate_limits (
  key_hash text primary key,
  attempts integer not null default 0,
  window_started_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_products_public_order on public.products(status, display_order) where deleted_at is null;
create index if not exists idx_products_category on public.products(category_id) where deleted_at is null;
create index if not exists idx_products_flags on public.products(is_featured, is_best_seller) where status = 'published' and deleted_at is null;
create index if not exists idx_categories_order on public.categories(display_order) where deleted_at is null;
create index if not exists idx_page_sections_page_order on public.page_sections(page_slug, display_order);
create index if not exists idx_inquiries_unread on public.inquiries(is_read, created_at desc) where deleted_at is null;
create index if not exists idx_media_created on public.media(created_at desc) where deleted_at is null;
create index if not exists idx_audit_logs_created on public.audit_logs(created_at desc);

create or replace function public.set_updated_at() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end; $$;

do $$ declare table_name text; begin
  foreach table_name in array array['profiles','categories','products','media','pages','page_sections','business_settings','promotions','testimonials','gallery_albums','gallery_items','inquiries'] loop
    execute format('drop trigger if exists set_%I_updated_at on public.%I', table_name, table_name);
    execute format('create trigger set_%I_updated_at before update on public.%I for each row execute function public.set_updated_at()', table_name, table_name);
  end loop;
end $$;

create or replace function public.current_admin_role() returns public.admin_role
language sql stable security definer set search_path = '' as $$
  select role from public.profiles where id = auth.uid() and is_active = true;
$$;
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.profiles where id = auth.uid() and is_active = true and role in ('owner','editor'));
$$;
create or replace function public.is_owner() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.profiles where id = auth.uid() and is_active = true and role = 'owner');
$$;

revoke all on function public.current_admin_role() from public;
revoke all on function public.is_admin() from public;
revoke all on function public.is_owner() from public;
grant execute on function public.current_admin_role() to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_owner() to authenticated;

create or replace function public.handle_new_auth_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name, role, is_active)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(coalesce(new.email,''), '@', 1)), 'editor', false)
  on conflict (id) do nothing;
  return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_auth_user();

create or replace function public.audit_admin_change() returns trigger
language plpgsql security definer set search_path = '' as $$
declare row_id text; begin
  row_id := coalesce((case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end)->>'id', 'singleton');
  insert into public.audit_logs(actor_id, action, table_name, record_id, old_values, new_values)
  values (auth.uid(), lower(tg_op), tg_table_name, row_id, case when tg_op in ('UPDATE','DELETE') then to_jsonb(old) end, case when tg_op in ('INSERT','UPDATE') then to_jsonb(new) end);
  return case when tg_op = 'DELETE' then old else new end;
end; $$;
do $$ declare table_name text; begin
  foreach table_name in array array['products','categories','business_settings','profiles'] loop
    execute format('drop trigger if exists audit_%I_changes on public.%I', table_name, table_name);
    execute format('create trigger audit_%I_changes after insert or update or delete on public.%I for each row execute function public.audit_admin_change()', table_name, table_name);
  end loop;
end $$;

create or replace function public.check_rate_limit(p_key text, p_limit integer, p_window_seconds integer) returns boolean
language plpgsql security definer set search_path = '' as $$
declare v_hash text := encode(digest(p_key, 'sha256'), 'hex'); v_row public.rate_limits%rowtype; begin
  if p_limit < 1 or p_window_seconds < 1 then return false; end if;
  insert into public.rate_limits(key_hash, attempts, window_started_at, updated_at) values (v_hash, 1, now(), now())
  on conflict (key_hash) do update set
    attempts = case when public.rate_limits.window_started_at < now() - make_interval(secs => p_window_seconds) then 1 else public.rate_limits.attempts + 1 end,
    window_started_at = case when public.rate_limits.window_started_at < now() - make_interval(secs => p_window_seconds) then now() else public.rate_limits.window_started_at end,
    updated_at = now()
  returning * into v_row;
  return v_row.attempts <= p_limit;
end; $$;
revoke all on function public.check_rate_limit(text, integer, integer) from public;
grant execute on function public.check_rate_limit(text, integer, integer) to anon, authenticated;

create or replace function public.submit_inquiry(
  p_name text,
  p_email text,
  p_phone text,
  p_subject text,
  p_message text,
  p_product_id text default null
) returns uuid
language plpgsql security definer set search_path = '' as $$
declare v_id uuid; v_product_id uuid;
begin
  if char_length(trim(coalesce(p_name, ''))) not between 2 and 100
    or char_length(trim(coalesce(p_subject, ''))) not between 3 and 120
    or char_length(trim(coalesce(p_message, ''))) not between 10 and 2000
    or char_length(trim(coalesce(p_email, ''))) > 254
    or char_length(trim(coalesce(p_phone, ''))) > 30
    or (trim(coalesce(p_email, '')) = '' and trim(coalesce(p_phone, '')) = '') then
    raise exception using errcode = '22023', message = 'invalid_inquiry';
  end if;
  if nullif(trim(coalesce(p_email, '')), '') is not null
    and trim(p_email) !~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    raise exception using errcode = '22023', message = 'invalid_inquiry';
  end if;
  if coalesce(p_product_id, '') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then
    select id into v_product_id from public.products
      where id = p_product_id::uuid and status = 'published' and deleted_at is null;
  end if;
  insert into public.inquiries(name, email, phone, product_id, subject, message)
  values (
    trim(p_name),
    nullif(trim(coalesce(p_email, '')), ''),
    nullif(trim(coalesce(p_phone, '')), ''),
    v_product_id,
    trim(p_subject),
    trim(p_message)
  ) returning id into v_id;
  return v_id;
end; $$;
revoke all on function public.submit_inquiry(text, text, text, text, text, text) from public;
grant execute on function public.submit_inquiry(text, text, text, text, text, text) to anon, authenticated;

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.media enable row level security;
alter table public.product_images enable row level security;
alter table public.tags enable row level security;
alter table public.product_tags enable row level security;
alter table public.pages enable row level security;
alter table public.page_sections enable row level security;
alter table public.business_settings enable row level security;
alter table public.promotions enable row level security;
alter table public.testimonials enable row level security;
alter table public.gallery_albums enable row level security;
alter table public.gallery_items enable row level security;
alter table public.inquiries enable row level security;
alter table public.audit_logs enable row level security;
alter table public.rate_limits enable row level security;

create policy "public categories are readable" on public.categories for select using (is_visible and deleted_at is null);
create policy "public products are readable" on public.products for select using (status = 'published' and deleted_at is null);
create policy "public product images are readable" on public.product_images for select using (exists(select 1 from public.products p where p.id = product_id and p.status = 'published' and p.deleted_at is null));
create policy "public pages are readable" on public.pages for select using (status = 'published');
create policy "public sections are readable" on public.page_sections for select using (status = 'published' and is_visible);
create policy "public settings are readable" on public.business_settings for select using (true);
create policy "active promotions are readable" on public.promotions for select using (is_active and deleted_at is null and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at >= now()));
create policy "published testimonials are readable" on public.testimonials for select using (status = 'published' and deleted_at is null);
create policy "public albums are readable" on public.gallery_albums for select using (is_visible and deleted_at is null);
create policy "public gallery items are readable" on public.gallery_items for select using (is_visible and deleted_at is null);
create policy "public media metadata is readable" on public.media for select using (deleted_at is null);
do $$ declare table_name text; begin
  foreach table_name in array array['categories','products','media','product_images','tags','product_tags','pages','page_sections','promotions','testimonials','gallery_albums','gallery_items','inquiries'] loop
    execute format('create policy "admins manage %1$s" on public.%1$I for all to authenticated using (public.is_admin()) with check (public.is_admin())', table_name);
  end loop;
end $$;
create policy "owners manage settings" on public.business_settings for all to authenticated using (public.is_owner()) with check (public.is_owner());
create policy "editors view settings" on public.business_settings for select to authenticated using (public.is_admin());
create policy "admins view own profile" on public.profiles for select to authenticated using (id = auth.uid() or public.is_owner());
create policy "owners manage profiles" on public.profiles for all to authenticated using (public.is_owner()) with check (public.is_owner());
create policy "owners view audit logs" on public.audit_logs for select to authenticated using (public.is_owner());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 5242880, array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
create policy "public reads media bucket" on storage.objects for select using (bucket_id = 'media');
create policy "admins upload media" on storage.objects for insert to authenticated with check (bucket_id = 'media' and public.is_admin());
create policy "admins update media" on storage.objects for update to authenticated using (bucket_id = 'media' and public.is_admin()) with check (bucket_id = 'media' and public.is_admin());
create policy "admins delete media" on storage.objects for delete to authenticated using (bucket_id = 'media' and public.is_admin());
