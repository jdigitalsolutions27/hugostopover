-- Owner-managed administrator invitations and a least-privilege Staff role.
-- The application intentionally uses the publishable key plus owner-checked
-- database functions; no service-role/secret key is required at runtime.

alter type public.admin_role add value if not exists 'staff';

alter table public.profiles
  add column if not exists email text;

update public.profiles as profile
set email = lower(auth_user.email)
from auth.users as auth_user
where auth_user.id = profile.id
  and auth_user.email is not null
  and profile.email is distinct from lower(auth_user.email);

create unique index if not exists profiles_email_unique
  on public.profiles (lower(email))
  where email is not null and email <> '';

create table if not exists public.admin_invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  display_name text not null default '',
  role public.admin_role not null default 'editor',
  status text not null default 'pending',
  auth_user_id uuid references auth.users(id) on delete set null,
  invited_by uuid not null references public.profiles(id) on delete restrict,
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint admin_invitations_email_length check (char_length(email) between 3 and 254),
  constraint admin_invitations_normalized_email check (email = lower(trim(email))),
  constraint admin_invitations_status check (status in ('pending', 'accepted', 'revoked')),
  constraint admin_invitations_display_name_length check (char_length(display_name) <= 100)
);

create index if not exists admin_invitations_email_idx
  on public.admin_invitations (lower(email), created_at desc);
create index if not exists admin_invitations_status_idx
  on public.admin_invitations (status, expires_at desc);
create unique index if not exists admin_invitations_one_pending_email
  on public.admin_invitations (lower(email))
  where status = 'pending';

drop trigger if exists set_admin_invitations_updated_at on public.admin_invitations;
create trigger set_admin_invitations_updated_at
before update on public.admin_invitations
for each row execute function public.set_updated_at();

create or replace function public.is_staff() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(
    select 1
    from public.profiles
    where id = auth.uid()
      and is_active = true
      and role::text = 'staff'
  );
$$;

revoke all on function public.is_staff() from public;
grant execute on function public.is_staff() to authenticated;

create or replace function public.create_admin_invitation(
  p_email text,
  p_display_name text,
  p_role text
) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_email text := lower(trim(coalesce(p_email, '')));
  v_display_name text := trim(coalesce(p_display_name, ''));
  v_role public.admin_role;
  v_user_id uuid;
  v_invitation_id uuid;
begin
  if not public.is_owner() then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if char_length(v_email) < 3
    or char_length(v_email) > 254
    or v_email !~ '^[^@[:space:]]+@[^@[:space:]]+[.][^@[:space:]]+$' then
    raise exception 'invalid email' using errcode = '22023';
  end if;
  if p_role not in ('owner', 'editor', 'staff') then
    raise exception 'invalid role' using errcode = '22023';
  end if;
  if char_length(v_display_name) > 100 then
    raise exception 'invalid display name' using errcode = '22023';
  end if;

  v_role := p_role::public.admin_role;
  select id into v_user_id
  from auth.users
  where lower(email) = v_email
  limit 1;

  if v_user_id = auth.uid() then
    raise exception 'cannot invite current owner' using errcode = '22023';
  end if;

  update public.admin_invitations
  set status = 'revoked', revoked_at = now()
  where lower(email) = v_email and status = 'pending';

  insert into public.admin_invitations (
    email, display_name, role, status, auth_user_id, invited_by, expires_at
  ) values (
    v_email, v_display_name, v_role, 'pending', v_user_id, auth.uid(), now() + interval '7 days'
  ) returning id into v_invitation_id;

  if v_user_id is not null then
    insert into public.profiles (id, email, display_name, role, is_active)
    values (
      v_user_id,
      v_email,
      coalesce(nullif(v_display_name, ''), split_part(v_email, '@', 1)),
      v_role,
      true
    )
    on conflict (id) do update set
      email = excluded.email,
      display_name = coalesce(nullif(excluded.display_name, ''), public.profiles.display_name),
      role = excluded.role,
      is_active = true;
  end if;

  return v_invitation_id;
end;
$$;

create or replace function public.revoke_admin_invitation(
  p_invitation_id uuid
) returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_user_id uuid;
begin
  if not public.is_owner() then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  update public.admin_invitations
  set status = 'revoked', revoked_at = now()
  where id = p_invitation_id and status = 'pending'
  returning auth_user_id into v_user_id;

  if v_user_id is not null and v_user_id <> auth.uid() then
    update public.profiles set is_active = false where id = v_user_id;
  end if;
end;
$$;

create or replace function public.accept_admin_invitation() returns void
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then
    raise exception 'unauthorized' using errcode = '42501';
  end if;

  update public.admin_invitations
  set status = 'accepted', accepted_at = now()
  where auth_user_id = auth.uid()
    and status = 'pending'
    and expires_at > now();
end;
$$;

revoke all on function public.create_admin_invitation(text, text, text) from public;
revoke all on function public.revoke_admin_invitation(uuid) from public;
revoke all on function public.accept_admin_invitation() from public;
grant execute on function public.create_admin_invitation(text, text, text) to authenticated;
grant execute on function public.revoke_admin_invitation(uuid) to authenticated;
grant execute on function public.accept_admin_invitation() to authenticated;

create or replace function public.handle_new_auth_user() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  v_invitation public.admin_invitations%rowtype;
  v_email text := lower(coalesce(new.email, ''));
begin
  select * into v_invitation
  from public.admin_invitations
  where lower(email) = v_email
    and status = 'pending'
    and expires_at > now()
  order by created_at desc
  limit 1;

  insert into public.profiles (id, email, display_name, role, is_active)
  values (
    new.id,
    nullif(v_email, ''),
    coalesce(
      nullif(v_invitation.display_name, ''),
      new.raw_user_meta_data ->> 'display_name',
      split_part(v_email, '@', 1)
    ),
    coalesce(v_invitation.role, 'editor'::public.admin_role),
    v_invitation.id is not null
  )
  on conflict (id) do update set email = excluded.email;

  if v_invitation.id is not null then
    update public.admin_invitations
    set auth_user_id = new.id
    where id = v_invitation.id;
  end if;
  return new;
end;
$$;

alter table public.admin_invitations enable row level security;
create policy "owners manage administrator invitations"
on public.admin_invitations for all to authenticated
using (public.is_owner()) with check (public.is_owner());

create policy "staff read categories"
on public.categories for select to authenticated using (public.is_staff());
create policy "staff read products"
on public.products for select to authenticated using (public.is_staff());
create policy "staff add products"
on public.products for insert to authenticated with check (public.is_staff());
create policy "staff update products"
on public.products for update to authenticated
using (public.is_staff()) with check (public.is_staff());
create policy "staff manage product images"
on public.product_images for all to authenticated
using (public.is_staff()) with check (public.is_staff());
create policy "staff manage tags"
on public.tags for all to authenticated
using (public.is_staff()) with check (public.is_staff());
create policy "staff manage product tags"
on public.product_tags for all to authenticated
using (public.is_staff()) with check (public.is_staff());
create policy "staff read inquiries"
on public.inquiries for select to authenticated using (public.is_staff());
create policy "staff update inquiries"
on public.inquiries for update to authenticated
using (public.is_staff()) with check (public.is_staff());
create policy "staff add media metadata"
on public.media for insert to authenticated with check (public.is_staff());
create policy "staff update media metadata"
on public.media for update to authenticated
using (public.is_staff()) with check (public.is_staff());

create policy "staff upload own media"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'media'
  and public.is_staff()
  and (storage.foldername(name))[1] = auth.uid()::text
);
create policy "staff update own media"
on storage.objects for update to authenticated
using (
  bucket_id = 'media'
  and public.is_staff()
  and (storage.foldername(name))[1] = auth.uid()::text
) with check (
  bucket_id = 'media'
  and public.is_staff()
  and (storage.foldername(name))[1] = auth.uid()::text
);
create policy "staff delete own media"
on storage.objects for delete to authenticated
using (
  bucket_id = 'media'
  and public.is_staff()
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop trigger if exists audit_admin_invitations_changes on public.admin_invitations;
create trigger audit_admin_invitations_changes
after insert or update or delete on public.admin_invitations
for each row execute function public.audit_admin_change();
