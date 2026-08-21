-- Point every public map to Hugo's verified Google Maps business listing.

update public.business_settings
set
  map_embed_url = 'https://www.google.com/maps?q=Hugo%E2%80%99s%20Stop%20Over%2C%20Zone%201%2C%20Alangalang%2C%206517%20Leyte&z=18&output=embed',
  latitude = 11.186800,
  longitude = 124.912317,
  needs_confirmation = array_remove(needs_confirmation, 'map_location'),
  updated_at = now()
where id = 1;

update public.page_sections
set
  body = case
    when section_key = 'map_note'
      then 'The map pin points to Hugo''s Stop Over in Zone 1, Alangalang, Leyte.'
    else body
  end,
  primary_cta_url = case
    when section_key = 'location_details'
      then 'https://www.google.com/maps?cid=17066446012554236424'
    else primary_cta_url
  end,
  settings = coalesce(settings, '{}'::jsonb) || jsonb_build_object(
    'image_alt',
    'Map showing the exact Hugo''s Stop Over location in Zone 1, Alangalang, Leyte'
  ),
  updated_at = now()
where page_slug = 'visit'
  and section_key in ('location_details', 'map_note');
