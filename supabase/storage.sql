-- Run this once in the Supabase SQL editor (dashboard), the same way
-- schema.sql and seed.sql were applied. It doesn't touch the
-- service_role key — the SQL editor already runs with the permissions
-- needed to create a bucket, which the frontend's publishable key
-- deliberately can't do.
--
-- Creates the "property-photos" bucket that list.html uploads real
-- listing photos into (see uploadListingPhotos() in list.html), and
-- the storage.objects policies that let a host manage only their own
-- photos while everyone can read them. Photo files are stored under
-- {host_id}/{property_id}/{filename}; the row in property_photos
-- (see schema.sql) then stores the resulting public URL.

insert into storage.buckets (id, name, public)
values ('property-photos', 'property-photos', true)
on conflict (id) do nothing;

create policy "public read access to property photos"
on storage.objects for select
using (bucket_id = 'property-photos');

create policy "hosts upload their own property photos"
on storage.objects for insert
with check (
  bucket_id = 'property-photos'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "hosts delete their own property photos"
on storage.objects for delete
using (
  bucket_id = 'property-photos'
  and auth.uid()::text = (storage.foldername(name))[1]
);
