-- Provisional launch prices requested for owner handoff. These values are
-- intentionally reviewable and are only applied when a product has no price,
-- so a later owner-confirmed amount is never overwritten by this migration.
with draft_prices(slug, price) as (
  values
    ('authentic-iloilo-la-paz-batchoy', 120::numeric),
    ('pansit-palabok', 100),
    ('classic-buko-pie', 300),
    ('ube-buko-pie', 350),
    ('classic-apple-pie', 350),
    ('heart-shaped-buko-pie', 380),
    ('buko-halo-halo', 120),
    ('special-halo-halo', 150),
    ('mais-con-yelo', 90),
    ('leche-flan', 100),
    ('traditional-puto-bumbong', 80),
    ('special-puto-bumbong-with-leche-flan', 130),
    ('pichi-pichi', 100),
    ('cheesy-pichi-pichi', 120),
    ('ube-cheese-buchi', 120),
    ('sweet-potato-buchi', 100),
    ('special-binagol', 90),
    ('pastillas', 100),
    ('buko-shake', 90),
    ('ube-buko-shake', 110),
    ('pure-buko-juice', 70),
    ('fresh-squeezed-lemonade', 70),
    ('lemontito-calamansi-juice', 80),
    ('brewed-coffee', 60),
    ('pure-cacao-tablea', 150),
    ('kobe-s-calamansi-concentrate', 180),
    ('banana-chips', 100),
    ('kamote-chips', 100),
    ('karlang-chips', 120),
    ('assorted-kakanin-box', 350)
)
update public.products as product
set
  price = draft_prices.price,
  discounted_price = null,
  needs_review = true,
  updated_at = now()
from draft_prices
where product.slug = draft_prices.slug
  and product.price is null;
