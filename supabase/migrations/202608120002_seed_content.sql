insert into public.categories (name, slug, description, display_order) values
('Best Sellers & Main Dishes','best-sellers-main-dishes','Hearty Filipino favorites made for a satisfying stopover.',1),
('Freshly Baked Pies','pies','Golden, generous pies for sharing or taking home.',2),
('Cold Desserts','cold-desserts','Creamy, refreshing Filipino merienda classics.',3),
('Kakanin & Filipino Snacks','kakanin-filipino-snacks','Traditional rice cakes and nostalgic local treats.',4),
('Shakes & Refreshments','shakes-refreshments','Cool drinks, fresh juices, and brewed coffee.',5),
('Pasalubong','pasalubong','Thoughtful Leyte take-home treats for family and friends.',6),
('Bundles & Offers','bundles-offers','Curated boxes that make sharing easier.',7)
on conflict (slug) do update set name=excluded.name, description=excluded.description, display_order=excluded.display_order;

with product_seed(name, slug, category_slug, sort_order, best, featured, is_new, preorder, description) as (values
('Authentic Iloilo La Paz Batchoy','authentic-iloilo-la-paz-batchoy','best-sellers-main-dishes',1,true,true,false,false,'A warming bowl of noodles, savory broth, tender pork, crisp chicharon, and fresh spring onions.'),
('Pansit Palabok','pansit-palabok','best-sellers-main-dishes',2,false,false,false,false,'Rice noodles dressed in rich savory sauce and finished with classic Filipino toppings.'),
('Classic Buko Pie','classic-buko-pie','pies',21,true,false,false,false,'A golden, home-style pie filled with young coconut and a delicately creamy custard.'),
('Ube Buko Pie','ube-buko-pie','pies',22,false,true,false,false,'Our buko pie with a distinctly Filipino ube twist—creamy, fragrant, and made for sharing.'),
('Classic Apple Pie','classic-apple-pie','pies',23,false,false,false,false,'A comforting golden pie filled with gently spiced apple.'),
('Heart-Shaped Buko Pie','heart-shaped-buko-pie','pies',24,false,false,true,true,'A celebratory take on classic buko pie, shaped for thoughtful gifts and special occasions.'),
('Buko Halo-Halo','buko-halo-halo','cold-desserts',41,false,false,false,false,'A refreshing coconut-forward halo-halo for warm Leyte afternoons.'),
('Special Halo-Halo','special-halo-halo','cold-desserts',42,true,false,false,false,'A colorful mix of Filipino sweets, shaved ice, milk, and rich toppings.'),
('Mais con Yelo','mais-con-yelo','cold-desserts',43,false,false,false,false,'Sweet corn, shaved ice, and creamy milk in a simple Filipino cooler.'),
('Leche Flan','leche-flan','cold-desserts',44,false,false,false,false,'Silky caramel-topped custard for dessert or a special merienda.'),
('Traditional Puto Bumbong','traditional-puto-bumbong','kakanin-filipino-snacks',61,true,false,false,false,'Purple rice delicately steamed, then served with coconut, sugar, and butter.'),
('Special Puto Bumbong with Leche Flan','special-puto-bumbong-with-leche-flan','kakanin-filipino-snacks',62,false,true,false,false,'Puto bumbong made extra indulgent with creamy leche flan.'),
('Pichi-Pichi','pichi-pichi','kakanin-filipino-snacks',63,false,false,false,false,'Soft cassava bites rolled in coconut for a familiar merienda favorite.'),
('Cheesy Pichi-Pichi','cheesy-pichi-pichi','kakanin-filipino-snacks',64,false,false,false,false,'Tender pichi-pichi finished with a savory-cheesy topping.'),
('Ube Cheese Buchi','ube-cheese-buchi','kakanin-filipino-snacks',65,false,false,false,false,'Chewy sesame-coated buchi with creamy ube and cheese flavors.'),
('Sweet Potato Buchi','sweet-potato-buchi','kakanin-filipino-snacks',66,false,false,false,false,'A golden, chewy snack with naturally sweet kamote filling.'),
('Special Binagol','special-binagol','kakanin-filipino-snacks',67,false,false,false,false,'A beloved Eastern Visayas delicacy with rich taro and coconut flavors.'),
('Pastillas','pastillas','kakanin-filipino-snacks',68,false,false,false,false,'Soft, milky Filipino sweets for a quick treat or pasalubong.'),
('Buko Shake','buko-shake','shakes-refreshments',81,false,false,false,false,'A cool, creamy shake highlighting fresh young coconut.'),
('Ube Buko Shake','ube-buko-shake','shakes-refreshments',82,false,false,false,false,'A refreshing blend of ube and coconut in a creamy shake.'),
('Pure Buko Juice','pure-buko-juice','shakes-refreshments',83,false,false,false,false,'Straightforward coconut refreshment for the road.'),
('Fresh-Squeezed Lemonade','fresh-squeezed-lemonade','shakes-refreshments',84,false,false,false,false,'Bright, tangy lemonade squeezed for a refreshing break.'),
('LemonTito Calamansi Juice','lemontito-calamansi-juice','shakes-refreshments',85,false,false,false,false,'A distinctly Filipino citrus cooler with lively calamansi flavor.'),
('Brewed Coffee','brewed-coffee','shakes-refreshments',86,false,false,false,false,'Freshly brewed coffee for a comforting pause in the journey.'),
('Pure Cacao Tablea','pure-cacao-tablea','pasalubong',101,false,false,false,false,'Traditional cacao tablea for rich hot chocolate and home recipes.'),
('Kobe''s Calamansi Concentrate','kobe-s-calamansi-concentrate','pasalubong',102,false,false,false,false,'Convenient calamansi concentrate to bring bright local flavor home.'),
('Banana Chips','banana-chips','pasalubong',103,false,false,false,false,'Crisp, lightly sweet banana chips packed for easy sharing.'),
('Kamote Chips','kamote-chips','pasalubong',104,false,false,false,false,'Crunchy sweet potato chips for a satisfying road snack.'),
('Karlang Chips','karlang-chips','pasalubong',105,false,false,false,false,'A crisp local-root snack and distinctive Leyte pasalubong.'),
('Assorted Kakanin Box','assorted-kakanin-box','bundles-offers',121,false,true,false,true,'A shareable selection of Filipino merienda favorites, thoughtfully packed for gatherings and pasalubong.')
)
insert into public.products (name, slug, category_id, display_order, is_best_seller, is_featured, is_new, is_preorder, short_description, full_description, main_image_url, price_label, serving_size, availability, tags, seo_title, seo_description, status, needs_review, published_at)
select p.name, p.slug, c.id, p.sort_order, p.best, p.featured, p.is_new, p.preorder, p.description,
p.description || ' This is helpful draft copy and should be reviewed by the owner for exact ingredients, portions, and preparation details.',
case when p.slug='authentic-iloilo-la-paz-batchoy' then '/images/filipino-food-hero.png' end,
'Ask for price','Serving or package size to be confirmed','available',array[c.name],p.name || ' | Hugo''s Stop Over Leyte',p.description || ' Ask about availability at Hugo''s Stop Over near Sta. Fe and Alangalang, Leyte.','published',true,now()
from product_seed p join public.categories c on c.slug=p.category_slug
on conflict (slug) do update set name=excluded.name, category_id=excluded.category_id, display_order=excluded.display_order, short_description=excluded.short_description, full_description=excluded.full_description, is_best_seller=excluded.is_best_seller, is_featured=excluded.is_featured, is_new=excluded.is_new, is_preorder=excluded.is_preorder;

insert into public.pages(slug,title,seo_title,seo_description,status) values
('home','Home','Hugo''s Stop Over | Filipino Food & Pasalubong in Leyte','Filipino comfort food and pasalubong near Sta. Fe and Alangalang, Leyte.','published'),
('about','About','Our Story | Hugo''s Stop Over','Learn about Hugo''s Stop Over in Leyte.','published'),
('menu','Menu','Menu & Pasalubong | Hugo''s Stop Over','Explore Filipino meals, pies, kakanin, desserts, drinks, and pasalubong.','published'),
('gallery','Gallery','Gallery | Hugo''s Stop Over','Food, store, event, and behind-the-scenes photos.','published'),
('visit','Visit Us','Visit Hugo''s Stop Over','Hours, directions, and contact information.','published')
on conflict(slug) do nothing;

insert into public.page_sections(page_slug,section_key,eyebrow,heading,body,image_url,primary_cta_label,primary_cta_url,secondary_cta_label,secondary_cta_url,is_visible,display_order,status) values
('home','hero','Merienda • Meals • Pasalubong','Your Favorite Filipino Comfort Food Stopover','Take a break and enjoy authentic La Paz Batchoy, freshly baked pies, traditional kakanin, refreshing desserts, and local pasalubong favorites.','/images/filipino-food-hero.png','Explore Our Menu','/menu','Message Us on Facebook','https://m.me/61557086043030',true,1,'published'),
('home','about_preview','A warm Leyte welcome','Good food makes every journey better','Hugo''s Stop Over brings comforting Filipino flavors together in one friendly roadside destination. This is draft story copy awaiting the owner''s official history.',null,'Discover Our Story','/about','','',true,6,'published'),
('home','best_sellers','The favorites','Come hungry. Leave happy.','Start with the dishes and merienda favorites customers ask about most.',null,'See the full menu','/menu','','',true,2,'published'),
('home','why_hugos','Why stop at Hugo''s?','Comforting flavors for the road—and for home','A thoughtfully varied stop for a hearty meal, quick merienda, refreshing dessert, or pasalubong worth bringing back.',null,'','','','',true,3,'published'),
('home','why_proudly_filipino','','Proudly Filipino','Familiar favorites—from Batchoy and palabok to kakanin and halo-halo.',null,'','','','',true,31,'published'),
('home','why_made_for_sharing','','Made for sharing','Pies, boxes, and take-home treats for family, friends, and gatherings.',null,'','','','',true,32,'published'),
('home','why_easy_to_ask','','Easy to ask','Message ahead for current availability, pre-orders, and product details.',null,'','','','',true,33,'published'),
('home','categories','There''s something for everyone','Explore by craving','From a steaming bowl to a cool dessert or something special to take home.',null,'','','','',true,4,'published'),
('home','featured_product','Featured at the stop','Featured product','',null,'View product','','Ask about availability','',true,5,'published'),
('home','promotion','Plan your stop','Ordering for a gathering or bringing pasalubong?','Send a message to ask about current availability, lead times, and shareable options before you travel.',null,'Message ahead','https://m.me/61557086043030','','',true,7,'published'),
('home','testimonials','From our guests','Shared with a full heart','',null,'','','','',true,8,'published'),
('home','location','Make Hugo''s your next stop','Easy to find. Hard to pass up.','',null,'Get visit details','/visit','','',true,9,'published'),
('home','social','Follow the cravings','See what''s fresh on Facebook','Check the official page for current dishes, announcements, and the latest product photos.',null,'Visit our Facebook page','https://www.facebook.com/profile.php?id=61557086043030','','',true,10,'published'),
('home','final_cta','See you at the stop','Your next Filipino comfort food favorite is waiting.','Explore the menu, ask what''s available, or simply stop by and enjoy the break.',null,'Explore our menu','/menu','Message us','https://m.me/61557086043030',true,11,'published'),
('about','hero','Proudly local. Warmly Filipino.','Food worth stopping for.','A welcoming place for comforting meals, merienda favorites, and pasalubong near the Sta. Fe–Alangalang boundary.',null,'','','','',true,1,'published'),
('about','story','Our story','A place to pause, eat well, and bring something home','Draft for owner review: Hugo''s Stop Over is a welcoming food stop near the Sta. Fe–Alangalang boundary, serving comforting meals, merienda, desserts, and pasalubong. Replace this text with the business''s official founding story and the people behind it.','/images/filipino-food-hero.png','Plan Your Visit','/visit','','',true,2,'published'),
('about','value_hospitality','','Warm hospitality','A friendly welcome and food that feels familiar.',null,'','','','',true,3,'published'),
('about','value_local','','Local character','Filipino flavors and regional favorites, proudly presented.',null,'','','','',true,4,'published'),
('about','value_sharing','','Made to share','Meals and take-home treats for families and friends.',null,'','','','',true,5,'published'),
('about','value_stop','','A worthwhile stop','A comforting break between Sta. Fe and Alangalang.',null,'','','','',true,6,'published'),
('about','final_cta','','Come hungry. We''ll make the stop worthwhile.','Browse what''s available today, message ahead, or visit us along the road.',null,'Explore the menu','/menu','','',true,7,'published'),
('menu','hero','Meals • Merienda • Take-home treats','Find your next favorite.','Browse the full Hugo''s Stop Over selection. Prices are shown when confirmed—message us for current availability and details.',null,'','','','',true,1,'published'),
('gallery','hero','From our table and our stop','A little taste of Hugo''s.','Fresh food, colorful merienda, take-home treats, and moments from around the stop.',null,'','','','',true,1,'published'),
('gallery','empty','','Fresh photos are coming soon.','The gallery is connected to the admin media library and currently has no published owner photos. Follow Facebook for the latest updates in the meantime.',null,'Browse the menu','/menu','','',true,2,'published'),
('visit','hero','Your next stop in Leyte','Drop by. Take a break. Eat well.','Find us near the Sta. Fe–Alangalang boundary. Message ahead if you''re looking for a specific item or placing a pre-order.',null,'','','','',true,1,'published'),
('visit','inquiry','Send an inquiry','What are you craving?','Ask about product availability, pre-orders, bundles, ingredients, or a planned visit. We''ll keep your contact details private.',null,'','','','',true,2,'published')
on conflict(page_slug,section_key) do update set eyebrow=excluded.eyebrow, heading=excluded.heading, body=excluded.body, image_url=excluded.image_url;

insert into public.business_settings(id,business_name,tagline,phone,email,address,map_embed_url,opening_hours,holiday_schedule,facebook_url,messenger_url,social_links,announcement,show_announcement,currency,default_seo_image,brand_colors,needs_confirmation)
values(1,'Hugo''s Stop Over','Your Favorite Filipino Comfort Food Stopover','(0954) 980 9670','','Boundary of Sta. Fe and Alangalang, Leyte, Philippines','https://www.google.com/maps?q=Boundary%20of%20Sta.%20Fe%20and%20Alangalang%2C%20Leyte&output=embed','[{"days":"Tuesday–Sunday","hours":"7:00 AM–8:30 PM"},{"days":"Monday","hours":"Closed"}]','Please message the Facebook page to confirm holiday hours.','https://www.facebook.com/profile.php?id=61557086043030','https://m.me/61557086043030','{"facebook":"https://www.facebook.com/profile.php?id=61557086043030"}','Freshly made Filipino favorites and pasalubong—stop by today.',true,'PHP','/images/filipino-food-hero.png','{"cocoa":"#3A2418","cream":"#FFF8E9","gold":"#D99B3D","ube":"#72457A","leaf":"#496B45","beige":"#EEDFC5","charcoal":"#231F1B"}',array['phone','address','opening_hours','map_location','business_story','product_copy','prices','images'])
on conflict(id) do nothing;
