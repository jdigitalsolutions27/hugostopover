-- Give lower-page editorial and product content its own optimized placeholder.
-- Guard each update so owner-supplied media is never overwritten.

update public.products
set
  main_image_url = '/images/filipino-food-story.webp',
  updated_at = now()
where slug = 'authentic-iloilo-la-paz-batchoy'
  and main_image_url = '/images/filipino-food-hero.png';

update public.page_sections
set
  image_url = '/images/filipino-food-story.webp',
  updated_at = now()
where page_slug = 'home'
  and section_key = 'about_preview'
  and image_url = '/images/filipino-food-hero.png';

update public.page_sections
set
  image_url = '/images/filipino-food-story.webp',
  updated_at = now()
where page_slug = 'about'
  and section_key = 'story'
  and image_url = '/images/filipino-food-hero.png';
