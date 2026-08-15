-- Add a full public-domain KJV quotation while preserving any owner edits.

update public.page_sections
set
  body = case
    when btrim(body) = '' then
      'Trust in the LORD with all thine heart; and lean not unto thine own understanding. In all thy ways acknowledge him, and he shall direct thy paths.'
    else body
  end,
  settings = case
    when not (settings ? 'translation_label') then
      settings || '{"translation_label":"King James Version (KJV)"}'::jsonb
    else settings
  end
where page_slug = 'global'
  and section_key = 'footer_verse';
