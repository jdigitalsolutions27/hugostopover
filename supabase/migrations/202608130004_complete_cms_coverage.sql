-- Complete structured CMS coverage for global navigation/footer content,
-- product-page labels, catalog controls, visit cards, and image alt text.
-- New records use ON CONFLICT DO NOTHING so owner edits are never overwritten.

insert into public.pages (slug, title, seo_title, seo_description, status)
values
  ('product', 'Product page', 'Product details | Hugo''s Stop Over', 'Product details, availability, and inquiry information.', 'published'),
  ('global', 'Header & footer', 'Global website content', 'Shared navigation, footer, and utility content.', 'published')
on conflict (slug) do nothing;

insert into public.page_sections (
  page_slug, section_key, eyebrow, heading, body, image_url,
  primary_cta_label, primary_cta_url, secondary_cta_label,
  secondary_cta_url, settings, is_visible, display_order, status
)
values
  ('global', 'header_actions', '', 'Header actions', 'Primary navigation', null,
    'Message us', 'https://m.me/61557086043030', 'Facebook',
    'https://www.facebook.com/profile.php?id=61557086043030', '{}'::jsonb, true, 1, 'published'),
  ('global', 'nav_home', '', 'Home', '', null, '', '/', '', '', '{}'::jsonb, true, 10, 'published'),
  ('global', 'nav_menu', '', 'Menu', '', null, '', '/menu', '', '', '{}'::jsonb, true, 11, 'published'),
  ('global', 'nav_about', '', 'Our Story', '', null, '', '/about', '', '', '{}'::jsonb, true, 12, 'published'),
  ('global', 'nav_gallery', '', 'Gallery', '', null, '', '/gallery', '', '', '{}'::jsonb, true, 13, 'published'),
  ('global', 'nav_visit', '', 'Visit Us', '', null, '', '/visit', '', '', '{}'::jsonb, true, 14, 'published'),
  ('global', 'footer_intro', '', 'Footer introduction', 'Your Favorite Filipino Comfort Food Stopover', null,
    '', '', '', '', '{}'::jsonb, true, 20, 'published'),
  ('global', 'footer_links', '', 'Explore', '', null, '', '', '', '', '{}'::jsonb, true, 21, 'published'),
  ('global', 'footer_contact', '', 'Find us', '', null,
    'Follow on Facebook', 'https://www.facebook.com/profile.php?id=61557086043030', '', '', '{}'::jsonb, true, 22, 'published'),
  ('global', 'footer_legal', '', 'Footer legal text', 'All rights reserved.', null,
    '', '', '', '', '{}'::jsonb, true, 23, 'published'),
  ('global', 'not_found', '404 • Wrong turn', 'This stop isn''t on the menu.',
    'The page may have moved, or the address might need another look.', null,
    'Back to Hugo''s', '/', '', '', '{}'::jsonb, true, 30, 'published'),
  ('product', 'detail_controls', '', 'Product page controls',
    'Availability, ingredients, serving details, and prices may change. Please message us for confirmation.', null,
    '', '', '', '',
    '{"back_label":"Back to the menu","availability_label":"Availability","package_label":"Serving / package","price_label":"Price","tags_label":"Tags","inquiry_label":"Ask about this product","related_heading":"You might also enjoy","available_value":"Available today—please confirm","fallback_tags":"Filipino favorite"}'::jsonb,
    true, 1, 'published'),
  ('menu', 'catalog_controls', '', 'Catalog controls', '', null,
    '', '', '', '',
    '{"search_placeholder":"Search batchoy, buko pie, kakanin…","all_label":"All","best_label":"Best sellers","featured_label":"Featured","available_label":"Available","category_label":"Categories","results_label":"Showing {shown} of {total} products","clear_label":"Clear filters","empty_heading":"No matches yet","empty_body":"Try a broader search or clear the current filters.","show_all_label":"Show all products"}'::jsonb,
    true, 2, 'published'),
  ('visit', 'location_details', '', 'Location', 'Boundary of Sta. Fe and Alangalang, Leyte, Philippines', null,
    'Open in Maps', '', '', '', '{}'::jsonb, true, 3, 'published'),
  ('visit', 'hours_details', '', 'Opening hours', 'Holiday schedules may vary. Message before traveling on a holiday.', null,
    '', '', '', '', '{}'::jsonb, true, 4, 'published'),
  ('visit', 'contact_details', '', 'Call or message', '(0954) 980 9670', null,
    'Call', '', 'Messenger', '', '{}'::jsonb, true, 5, 'published'),
  ('visit', 'map_note', '', 'Visit note', 'The exact pin and route instructions need owner confirmation before launch.', null,
    '', '', '', '', '{"image_alt":"Map showing Hugo''s Stop Over near Sta. Fe and Alangalang"}'::jsonb, true, 6, 'published'),
  ('visit', 'form_controls', '', 'Inquiry form controls', '', null,
    '', '', '', '',
    '{"name_label":"Your name","phone_label":"Phone number","phone_placeholder":"09XX XXX XXXX","email_label":"Email address","email_hint":"Add an email or phone so we can reply.","subject_label":"Subject","message_label":"How can we help?","privacy_note":"Your details are only used to answer this inquiry.","submit_label":"Send inquiry","sending_label":"Sending…"}'::jsonb,
    true, 7, 'published')
on conflict (page_slug, section_key) do nothing;

-- Make the existing homepage story photo editable without changing its current look.
update public.page_sections
set image_url = '/images/filipino-food-hero.png'
where page_slug = 'home'
  and section_key = 'about_preview'
  and image_url is null;

update public.page_sections
set settings = settings || '{"location_label":"Find us","hours_label":"Opening hours","phone_label":"Call us"}'::jsonb
where page_slug = 'home'
  and section_key = 'hero'
  and not (settings ? 'location_label');

update public.page_sections
set secondary_cta_label = 'Call us'
where page_slug = 'home'
  and section_key = 'location'
  and secondary_cta_label = '';

-- Seed accessible descriptions only when the owner has not already supplied one.
update public.page_sections
set settings = settings || jsonb_build_object(
  'image_alt',
  case page_slug || '/' || section_key
    when 'home/hero' then 'La Paz Batchoy, buko pie, halo-halo, and Filipino kakanin on a warm table'
    when 'home/about_preview' then 'Filipino food served at Hugo''s Stop Over'
    when 'home/location' then 'Map showing Hugo''s Stop Over near Sta. Fe and Alangalang, Leyte'
    when 'about/story' then 'A Filipino food spread representing Hugo''s Stop Over'
    else ''
  end
)
where not (settings ? 'image_alt')
  and (image_url is not null or section_key in ('location', 'map_note'));
