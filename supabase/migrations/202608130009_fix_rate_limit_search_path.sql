-- Keep the rate-limit function's empty search path while explicitly resolving
-- pgcrypto from Supabase's extensions schema. This prevents object shadowing
-- and allows the database linter to validate the function body.
create or replace function public.check_rate_limit(
  p_key text,
  p_limit integer,
  p_window_seconds integer
) returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_hash text := pg_catalog.encode(
    extensions.digest(p_key, 'sha256'),
    'hex'
  );
  v_row public.rate_limits%rowtype;
begin
  if p_limit < 1 or p_window_seconds < 1 then
    return false;
  end if;

  insert into public.rate_limits(
    key_hash,
    attempts,
    window_started_at,
    updated_at
  ) values (
    v_hash,
    1,
    pg_catalog.now(),
    pg_catalog.now()
  )
  on conflict (key_hash) do update set
    attempts = case
      when public.rate_limits.window_started_at <
        pg_catalog.now() - pg_catalog.make_interval(secs => p_window_seconds)
      then 1
      else public.rate_limits.attempts + 1
    end,
    window_started_at = case
      when public.rate_limits.window_started_at <
        pg_catalog.now() - pg_catalog.make_interval(secs => p_window_seconds)
      then pg_catalog.now()
      else public.rate_limits.window_started_at
    end,
    updated_at = pg_catalog.now()
  returning * into v_row;

  return v_row.attempts <= p_limit;
end;
$$;

revoke all on function public.check_rate_limit(text, integer, integer)
from public;
grant execute on function public.check_rate_limit(text, integer, integer)
to anon, authenticated;
