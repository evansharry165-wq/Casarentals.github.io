-- ═══════════════════════════════════════════════════════════════
-- Casa — demo data migration (Phase 06 tracker item: "Migrate the 36
-- seed properties and demo hosts into real rows, keep as launch seed
-- content for the pilot region")
--
-- Run order:
--   1. Run schema.sql first.
--   2. Create the 5 demo HOST accounts below via Supabase Auth (dashboard
--      "Add user", or the admin API) using these exact emails. Passwords
--      don't matter for seed data — these aren't meant to be logged into.
--        sarah-r@casa.demo   (Sarah Reynolds — Windermere)
--        patrick-m@casa.demo (Patrick McAllister — Bushmills)
--        emma-t@casa.demo    (Emma Thorne — Mousehole)
--        helen-w@casa.demo   (Helen Walsh — Glencoe)
--        david-k@casa.demo   (David Kerr — Bourton-on-the-Water)
--      (james-h from casa-hosts.js is role='guest' in the demo data, not
--      a host — no property references it, so it's not seeded here.)
--   3. Run the "profiles" insert below (needs the auth.users rows above
--      to exist first, since profiles.id references auth.users.id).
--   4. Run properties_seed.sql (or the block at the bottom of this file).
-- ═══════════════════════════════════════════════════════════════

insert into profiles
  (id, full_name, role, location, bio, languages, response_rate, response_time, joined_at,
   email_verified, phone_verified, gov_id_verified, background_check)
select u.id, v.full_name, 'host', v.location, v.bio, v.languages, v.response_rate, v.response_time, v.joined_at,
   true, true, v.gov_id_verified, v.background_check
from (values
  ('sarah-r@casa.demo',   'Sarah Reynolds',   'Windermere, Lake District',       'Third-generation Cumbrian. I restored Stone Cottage with my partner and love sharing the Lakes with guests who appreciate quiet mornings and proper walks.', ARRAY['English'], 98, 'within an hour',    '2023-03-01'::date, true,  true),
  ('patrick-m@casa.demo', 'Patrick McAllister','Bushmills, Causeway Coast',      'Coastal host on the Causeway Coast. Former B&B owner — I know what guests need before they ask.', ARRAY['English'], 95, 'within 2 hours', '2024-06-01'::date, true,  false),
  ('emma-t@casa.demo',    'Emma Thorne',      'Mousehole, Cornwall',             'Cornish born and bred. Harbour Cottage has been in the family for decades — now shared with travellers who love the sea.', ARRAY['English','French'], 100, 'within 30 minutes', '2022-01-01'::date, true,  true),
  ('helen-w@casa.demo',   'Helen Walsh',      'Glencoe, Highlands',              'Highland bothy keeper and mountain guide. Off-grid hospitality with modern comforts where it counts.', ARRAY['English','Gaelic'], 97, 'within an hour', '2021-11-01'::date, true,  true),
  ('david-k@casa.demo',   'David Kerr',       'Bourton-on-the-Water, Cotswolds', 'Cotswolds stone specialist. Restored three properties — each with its own character and a garden worth sitting in.', ARRAY['English'], 92, 'within 3 hours', '2024-04-01'::date, false, false)
) as v(email, full_name, location, bio, languages, response_rate, response_time, joined_at, gov_id_verified, background_check)
join auth.users u on u.email = v.email;

-- ─── properties (36 rows, from casa-properties.js) ───
-- See supabase/seed.sql's git history / scratchpad/gen_seed.py for the
-- generator; inlined here so this file is the single source of truth.

insert into properties
  (id, host_id, title, town, region, region_label, type, price_per_night, min_stay, sleeps, bedrooms, bathrooms, max_guests, amenities, published)
select v.id, u.id, v.title, v.town, v.region, v.region_label, v.type, v.price_per_night, v.min_stay, v.sleeps, v.bedrooms, v.bathrooms, v.max_guests, v.amenities, v.published
from (values
  (1, 'sarah-r@casa.demo'::text, 'Stone Cottage', 'Windermere', 'lake-district', 'Lake District', 'cottage', 175, 2, 6, 3, 1, 6, ARRAY['woodburner','pets','parking']::text[], true),
  (2, 'emma-t@casa.demo'::text, 'Slate Barn', 'Ambleside', 'lake-district', 'Lake District', 'barn', 215, 2, 4, 2, 1, 4, ARRAY['hottub','sauna']::text[], true),
  (3, 'helen-w@casa.demo'::text, 'Lakeside Cabin', 'Coniston', 'lake-district', 'Lake District', 'cabin', 145, 2, 2, 1, 1, 2, ARRAY['romantic']::text[], true),
  (4, 'david-k@casa.demo'::text, 'Georgian House', 'Keswick', 'lake-district', 'Lake District', 'cottage', 240, 2, 8, 4, 1, 8, ARRAY['garden','parking']::text[], true),
  (5, 'sarah-r@casa.demo'::text, 'Shepherd''s Hut', 'Buttermere', 'lake-district', 'Lake District', 'glamping', 95, 2, 2, 1, 1, 2, ARRAY['offgrid']::text[], true),
  (6, 'patrick-m@casa.demo'::text, 'Miller''s Cottage', 'Grasmere', 'lake-district', 'Lake District', 'cottage', 165, 2, 4, 2, 1, 4, ARRAY['woodburner']::text[], true),
  (7, 'sarah-r@casa.demo'::text, 'The Granary', 'Hawkshead', 'lake-district', 'Lake District', 'farmhouse', 195, 2, 5, 3, 1, 5, ARRAY['pets','woodburner']::text[], true),
  (8, 'helen-w@casa.demo'::text, 'Hillside Farmhouse', 'Grizedale', 'lake-district', 'Lake District', 'farmhouse', 385, 3, 10, 5, 1, 10, ARRAY['hottub','garden']::text[], true),
  (9, 'david-k@casa.demo'::text, 'Cliffside Cottage', 'Porthcurno', 'cornwall', 'Cornwall', 'cottage', 210, 2, 4, 2, 1, 4, ARRAY['seaview','woodburner']::text[], true),
  (10, 'sarah-r@casa.demo'::text, 'Tregothnan Lodge', 'Truro', 'cornwall', 'Cornwall', 'cabin', 320, 3, 8, 4, 1, 8, ARRAY['hottub','garden','pets']::text[], true),
  (11, 'emma-t@casa.demo'::text, 'Harbour Cottage', 'Mousehole', 'cornwall', 'Cornwall', 'cottage', 155, 2, 3, 2, 1, 3, ARRAY['seaview']::text[], true),
  (12, 'emma-t@casa.demo'::text, 'St Agnes Farmhouse', 'St Agnes', 'cornwall', 'Cornwall', 'farmhouse', 185, 2, 6, 3, 1, 6, ARRAY['woodburner','pets']::text[], true),
  (13, 'emma-t@casa.demo'::text, 'The Boathouse', 'Fowey', 'cornwall', 'Cornwall', 'houseboat', 175, 2, 2, 1, 1, 2, ARRAY['seaview','romantic']::text[], true),
  (14, 'david-k@casa.demo'::text, 'Mizen Shepherd Hut', 'Zennor', 'cornwall', 'Cornwall', 'glamping', 115, 2, 2, 1, 1, 2, ARRAY['offgrid','seaview']::text[], true),
  (15, 'sarah-r@casa.demo'::text, 'Restored Blackhouse', 'Trotternish', 'highlands', 'Isle of Skye', 'cottage', 195, 2, 4, 2, 1, 4, ARRAY['offgrid','hottub','seaview']::text[], true),
  (16, 'helen-w@casa.demo'::text, 'Glen Coe Bothy', 'Glencoe', 'highlands', 'Highlands', 'cabin', 130, 2, 3, 2, 1, 3, ARRAY['woodburner','offgrid']::text[], true),
  (17, 'helen-w@casa.demo'::text, 'Loch Ness Lodge', 'Drumnadrochit', 'highlands', 'Highlands', 'cabin', 280, 2, 6, 3, 1, 6, ARRAY['seaview','hottub']::text[], true),
  (18, 'helen-w@casa.demo'::text, 'Croft House', 'Torridon', 'highlands', 'Highlands', 'farmhouse', 165, 2, 4, 2, 1, 4, ARRAY['woodburner','pets']::text[], true),
  (19, 'david-k@casa.demo'::text, 'Isle of Skye Hideaway', 'Portree', 'skye', 'Isle of Skye', 'cottage', 220, 2, 2, 1, 1, 2, ARRAY['seaview','offgrid']::text[], true),
  (20, 'sarah-r@casa.demo'::text, 'Burnham Overy Barn', 'Burnham Overy', 'norfolk', 'Norfolk', 'barn', 195, 2, 6, 3, 1, 6, ARRAY['seaview','pets']::text[], true),
  (21, 'patrick-m@casa.demo'::text, 'The Granary', 'Wells-next-the-Sea', 'norfolk', 'Norfolk', 'farmhouse', 145, 2, 4, 2, 1, 4, ARRAY['woodburner','garden']::text[], true),
  (22, 'emma-t@casa.demo'::text, 'Saltmarsh Cabin', 'Blakeney', 'norfolk', 'Norfolk', 'cabin', 110, 2, 2, 1, 1, 2, ARRAY['seaview','offgrid']::text[], true),
  (23, 'helen-w@casa.demo'::text, 'Brancaster Hall', 'Brancaster', 'norfolk', 'Norfolk', 'manor', 450, 3, 12, 6, 1, 12, ARRAY['garden','hottub']::text[], true),
  (24, 'david-k@casa.demo'::text, 'Moorland Cottage', 'Goathland', 'yorkshire', 'N. Yorkshire', 'cottage', 160, 2, 4, 2, 1, 4, ARRAY['woodburner','pets']::text[], true),
  (25, 'sarah-r@casa.demo'::text, 'Dales Farmhouse', 'Wharfedale', 'yorkshire', 'Yorkshire Dales', 'farmhouse', 225, 2, 8, 4, 1, 8, ARRAY['hottub','garden','pets']::text[], true),
  (26, 'patrick-m@casa.demo'::text, 'The Old Forge', 'Whitby', 'yorkshire', 'N. Yorkshire', 'cottage', 135, 2, 3, 2, 1, 3, ARRAY['seaview','woodburner']::text[], true),
  (27, 'david-k@casa.demo'::text, 'Honeysuckle Cottage', 'Bourton-on-the-Water', 'cotswolds', 'Cotswolds', 'cottage', 195, 2, 4, 2, 1, 4, ARRAY['woodburner','garden']::text[], true),
  (28, 'helen-w@casa.demo'::text, 'Chipping Manor', 'Chipping Campden', 'cotswolds', 'Cotswolds', 'manor', 550, 3, 14, 7, 1, 14, ARRAY['garden','hottub']::text[], true),
  (29, 'david-k@casa.demo'::text, 'The Old Mill', 'Bourton-on-the-Hill', 'cotswolds', 'Cotswolds', 'farmhouse', 175, 2, 5, 3, 1, 5, ARRAY['woodburner','pets']::text[], true),
  (30, 'sarah-r@casa.demo'::text, 'Pembroke Cliffside', 'St Davids', 'pembrokeshire', 'Pembrokeshire', 'cottage', 175, 2, 4, 2, 1, 4, ARRAY['seaview','woodburner']::text[], true),
  (31, 'patrick-m@casa.demo'::text, 'The Boathouse', 'Solva', 'pembrokeshire', 'Pembrokeshire', 'houseboat', 155, 2, 2, 1, 1, 2, ARRAY['seaview','romantic']::text[], true),
  (32, 'emma-t@casa.demo'::text, 'Coast Path Glamping', 'Marloes', 'pembrokeshire', 'Pembrokeshire', 'glamping', 90, 2, 2, 1, 1, 2, ARRAY['seaview','offgrid']::text[], true),
  (33, 'helen-w@casa.demo'::text, 'Hafod Cottage', 'Betws-y-Coed', 'snowdonia', 'Snowdonia', 'cottage', 145, 2, 4, 2, 1, 4, ARRAY['woodburner','pets']::text[], true),
  (34, 'david-k@casa.demo'::text, 'Llyn Padarn Cabin', 'Llanberis', 'snowdonia', 'Snowdonia', 'cabin', 185, 2, 4, 2, 1, 4, ARRAY['seaview','hottub']::text[], true),
  (35, 'patrick-m@casa.demo'::text, 'Giant''s Causeway Cottage', 'Bushmills', 'causeway', 'Causeway Coast', 'cottage', 165, 2, 4, 2, 1, 4, ARRAY['seaview','woodburner']::text[], true),
  (36, 'patrick-m@casa.demo'::text, 'Dark Hedges Farmhouse', 'Armoy', 'causeway', 'Antrim', 'farmhouse', 190, 2, 6, 3, 1, 6, ARRAY['woodburner','pets']::text[], true)
) as v(id, host_email, title, town, region, region_label, type, price_per_night, min_stay, sleeps, bedrooms, bathrooms, max_guests, amenities, published)
join auth.users u on u.email = v.host_email;

-- Note: `rating` and `reviews` count from casa-properties.js are NOT migrated
-- as static columns — they should be computed from the real `reviews` table
-- (avg(stars), count(*)) once reviews exist, not stored as a stale number.
-- Property photos, badges ('editors'/'new' picks), and the review text itself
-- (casa-audit.md-adjacent content) are still on the seed-data side and are a
-- content task, not a migration task — see the launch tracker's Phase 03.
