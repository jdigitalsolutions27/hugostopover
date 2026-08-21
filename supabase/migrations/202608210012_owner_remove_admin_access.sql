-- Owner-only, audited removal of dashboard access without deleting auth history.

create or replace function public.remove_admin_user(p_profile_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email text;
begin
  if not public.is_owner() then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if p_profile_id is null or p_profile_id = auth.uid() then
    raise exception 'cannot remove current owner' using errcode = '22023';
  end if;

  select lower(email) into v_email
  from public.profiles
  where id = p_profile_id;

  if not found then
    raise exception 'administrator not found' using errcode = 'P0002';
  end if;

  update public.profiles
  set is_active = false
  where id = p_profile_id;

  update public.admin_invitations
  set status = 'revoked', revoked_at = now()
  where status = 'pending'
    and (
      auth_user_id = p_profile_id
      or (v_email is not null and lower(email) = v_email)
    );
end;
$$;

revoke all on function public.remove_admin_user(uuid) from public;
grant execute on function public.remove_admin_user(uuid) to authenticated;
