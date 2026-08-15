-- Add the Bible reference shown in the business logo as editable global content.
-- The full verse text is intentionally blank until the owner confirms a translation.

insert into public.page_sections (
  page_slug, section_key, eyebrow, heading, body, image_url,
  primary_cta_label, primary_cta_url, secondary_cta_label,
  secondary_cta_url, settings, is_visible, display_order, status
)
values (
  'global',
  'footer_verse',
  'Our guiding verse',
  'Proverbs 3:5–6',
  '',
  null,
  '',
  '',
  '',
  '',
  '{}'::jsonb,
  true,
  21,
  'published'
)
on conflict (page_slug, section_key) do nothing;
