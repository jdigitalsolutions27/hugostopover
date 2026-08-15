-- Give every primary public page a consistent, editable photo hero and retire
-- the optional Gallery page without deleting any stored images or gallery data.

update public.page_sections
set
  image_url = '/images/filipino-food-hero.png',
  settings = coalesce(settings, '{}'::jsonb) || jsonb_build_object(
    'image_alt',
    case page_slug
      when 'menu' then 'La Paz Batchoy, buko pie, halo-halo, and Filipino kakanin from Hugo''s Stop Over'
      when 'about' then 'Filipino comfort food and pasalubong representing Hugo''s Stop Over'
      when 'visit' then 'Filipino favorites served at Hugo''s Stop Over in Leyte'
      else 'Filipino comfort food and pasalubong at Hugo''s Stop Over'
    end
  )
where section_key = 'hero'
  and page_slug in ('menu', 'about', 'visit')
  and image_url is null;

-- Preserve any owner-supplied image while filling only a missing description.
update public.page_sections
set settings = coalesce(settings, '{}'::jsonb) || jsonb_build_object(
  'image_alt',
  case page_slug
    when 'menu' then 'La Paz Batchoy, buko pie, halo-halo, and Filipino kakanin from Hugo''s Stop Over'
    when 'about' then 'Filipino comfort food and pasalubong representing Hugo''s Stop Over'
    when 'visit' then 'Filipino favorites served at Hugo''s Stop Over in Leyte'
    else 'Filipino comfort food and pasalubong at Hugo''s Stop Over'
  end
)
where section_key = 'hero'
  and page_slug in ('menu', 'about', 'visit')
  and not (coalesce(settings, '{}'::jsonb) ? 'image_alt');

update public.page_sections
set is_visible = false, status = 'archived'
where page_slug = 'global' and section_key = 'nav_gallery';

update public.page_sections
set is_visible = false, status = 'archived'
where page_slug = 'gallery';

update public.pages
set status = 'archived'
where slug = 'gallery';
