-- ═══════════════════════════════════════════════════════════════
-- Casa — real availability blocking
--
-- Guests can't read other guests' enquiries rows at all under RLS
-- ("guest or host read their enquiries" using (guest_id = auth.uid() or
-- host_id = auth.uid())) — correctly, for privacy. But that means there
-- was no way for a browser about to submit a NEW enquiry to know a
-- property is already confirmed-booked for those dates: nothing checked,
-- so two different guests could both get a "confirmed" booking for the
-- same week. Same shape of problem as create_conversation_for_enquiry
-- (schema.sql) — solved the same proven way: a narrow SECURITY DEFINER
-- function that returns only the minimum needed (a yes/no conflict, or
-- the list of already-confirmed date ranges), never guest identity or
-- any other enquiry detail.
--
-- ADDITIVE & IDEMPOTENT — safe to re-run. Apply after schema.sql.
-- ═══════════════════════════════════════════════════════════════

-- Does this property already have a CONFIRMED enquiry overlapping
-- [p_check_in, p_check_out)? Only confirmed bookings block — a pending
-- or merely-replied-to enquiry isn't a real commitment yet, so it
-- shouldn't stop someone else from asking about the same dates.
create or replace function public.casa_check_date_conflict(
  p_property_id bigint, p_check_in date, p_check_out date
) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from enquiries
    where property_id = p_property_id
      and status = 'confirmed'
      and check_in < p_check_out
      and check_out > p_check_in
  );
$$;

grant execute on function public.casa_check_date_conflict(bigint, date, date) to anon, authenticated;

-- The full list of confirmed date ranges for a property (dates only, no
-- guest name/message/price) — lets a booking form grey out unavailable
-- dates up front, not just fail at submit time.
create or replace function public.casa_get_confirmed_ranges(p_property_id bigint)
returns table (check_in date, check_out date)
language sql stable security definer set search_path = public as $$
  select check_in, check_out from enquiries
  where property_id = p_property_id and status = 'confirmed'
  order by check_in;
$$;

grant execute on function public.casa_get_confirmed_ranges(bigint) to anon, authenticated;
