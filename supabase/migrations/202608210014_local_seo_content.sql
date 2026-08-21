-- Publish a useful, editable local discovery page for travelers searching for
-- Filipino food and pasalubong in Leyte. Existing owner edits are preserved.

insert into public.pages (slug, title, seo_title, seo_description, status)
values (
  'food-stop-over-leyte',
  'Leyte food stop',
  'Food Stop Over in Leyte | Filipino Meals & Pasalubong',
  'Visit Hugo''s Stop Over in Alangalang, Leyte for Filipino meals, kakanin, pies, desserts, refreshments, and local pasalubong favorites.',
  'published'
)
on conflict (slug) do nothing;

insert into public.page_sections (
  page_slug, section_key, eyebrow, heading, body, image_url,
  primary_cta_label, primary_cta_url, secondary_cta_label,
  secondary_cta_url, settings, is_visible, display_order, status
)
values
  ('food-stop-over-leyte', 'hero', 'Meals · Merienda · Pasalubong in Leyte',
    'A Filipino food stop over in Leyte worth the pause.',
    'Make Hugo''s Stop Over part of your drive through Alangalang and Sta. Fe for comforting meals, merienda, cold desserts, refreshments, and take-home favorites.',
    '/images/filipino-food-hero.png', '', '', '', '',
    '{"image_alt":"Filipino meals, buko pie, halo-halo, and kakanin at Hugo''s Stop Over in Leyte"}'::jsonb,
    true, 1, 'published'),
  ('food-stop-over-leyte', 'stopover_intro', 'A convenient Leyte food stop',
    'Good food for the journey—and something to bring home',
    'Hugo''s Stop Over is located in Alangalang near the Sta. Fe boundary, making it a practical stop for travelers, families, and anyone craving Filipino comfort food or pasalubong.',
    '/images/filipino-food-story.webp', 'Browse the menu', '/menu',
    'Ask what''s available', 'https://m.me/61557086043030',
    '{"image_alt":"A Filipino food spread at Hugo''s Stop Over in Leyte"}'::jsonb,
    true, 2, 'published'),
  ('food-stop-over-leyte', 'specialty_meals', '',
    'Filipino meals and merienda',
    'Enjoy La Paz Batchoy, pansit palabok, traditional kakanin, and other comforting favorites.',
    null, 'See meals', '/menu', '', '', '{}'::jsonb, true, 3, 'published'),
  ('food-stop-over-leyte', 'specialty_pastries', '',
    'Pies and pasalubong',
    'Bring home buko pie, kakanin boxes, local snacks, tablea, and other shareable treats.',
    null, 'See pasalubong', '/menu?category=pasalubong', '', '', '{}'::jsonb, true, 4, 'published'),
  ('food-stop-over-leyte', 'specialty_refreshments', '',
    'Desserts and refreshments',
    'Cool down with halo-halo, buko shakes, fresh juices, lemonade, or brewed coffee.',
    null, 'See refreshments', '/menu?category=shakes-refreshments', '', '', '{}'::jsonb, true, 5, 'published'),
  ('food-stop-over-leyte', 'plan_your_stop', 'Plan your stop',
    'Find Hugo''s along your Leyte journey.',
    'We''re in Alangalang near the Sta. Fe boundary. Use the exact map pin for directions and message before traveling if you need a specific product.',
    null, 'Open exact map pin', '', 'Visit details', '/visit', '{}'::jsonb,
    true, 6, 'published'),
  ('food-stop-over-leyte', 'faq_location', '',
    'Where is Hugo''s Stop Over in Leyte?',
    'Hugo''s Stop Over is in Alangalang, Leyte, near the boundary with Sta. Fe. Use the exact Google Maps pin on this page for directions.',
    null, '', '', '', '', '{}'::jsonb, true, 7, 'published'),
  ('food-stop-over-leyte', 'faq_menu', '',
    'What food and pasalubong can I find at Hugo''s?',
    'The editable menu includes La Paz Batchoy, pansit palabok, pies, kakanin, halo-halo, cold desserts, refreshments, and local take-home products.',
    null, '', '', '', '', '{}'::jsonb, true, 8, 'published'),
  ('food-stop-over-leyte', 'faq_availability', '',
    'Can I check availability before traveling?',
    'Yes. Product availability can change, so call or message the official Facebook page before your trip if you are looking for a particular item or placing a pre-order.',
    null, '', '', '', '', '{}'::jsonb, true, 9, 'published'),
  ('food-stop-over-leyte', 'final_cta', 'See you at the stop',
    'Make Hugo''s part of your next Leyte trip.',
    'Browse the menu, check today''s availability, and use the exact map pin when you''re ready to visit.',
    null, 'Explore the menu', '/menu', 'Message Hugo''s',
    'https://m.me/61557086043030', '{}'::jsonb, true, 10, 'published')
on conflict (page_slug, section_key) do nothing;

insert into public.page_sections (
  page_slug, section_key, eyebrow, heading, body, image_url,
  primary_cta_label, primary_cta_url, secondary_cta_label,
  secondary_cta_url, settings, is_visible, display_order, status
)
values (
  'global', 'nav_leyte_food_stop', '', 'Leyte Food Stop', '', null,
  '', '/food-stop-over-leyte', '', '', '{}'::jsonb, true, 13, 'published'
)
on conflict (page_slug, section_key) do nothing;

-- Improve the launch metadata only when it still contains the original seed
-- copy, so a title already customized by the owner is never overwritten.
update public.pages
set
  seo_title = 'Hugo''s Stop Over | Filipino Food Stop Over in Leyte',
  seo_description = 'Visit Hugo''s Stop Over near Sta. Fe and Alangalang, Leyte for Filipino meals, buko pie, kakanin, desserts, refreshments, and pasalubong.'
where slug = 'home'
  and seo_title = 'Hugo''s Stop Over | Filipino Food & Pasalubong in Leyte';
