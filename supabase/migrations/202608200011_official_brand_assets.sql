-- Adopt the owner-provided official logo. Future changes remain editable in Settings.

update public.business_settings
set
  logo_url = '/images/hugo-official-logo.jpg',
  favicon_url = '/images/hugo-official-logo.jpg',
  updated_at = now();
