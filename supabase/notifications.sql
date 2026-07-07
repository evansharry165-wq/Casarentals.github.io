-- ═══════════════════════════════════════════════════════════════
-- Casa — real cross-user notifications
--
-- notifications.user_id RLS ("users manage their own notifications" using
-- (user_id = auth.uid())) only lets a client insert its OWN row — exactly
-- like conversation_participants before create_conversation_for_enquiry
-- (schema.sql) was added. Same fix here: SECURITY DEFINER trigger
-- functions that fire on the real underlying event and write the
-- recipient's notification row directly, bypassing RLS the same safe,
-- proven way schema.sql already does — not a new pattern.
--
-- Using triggers (not a client-called RPC) means a notification is
-- created for EVERY insert into these tables regardless of which page/
-- code path did it, so it can't be silently skipped by an incomplete
-- client wiring the way the old local-only casaAddNotification() was.
--
-- ADDITIVE & IDEMPOTENT — safe to re-run. Apply after schema.sql (and
-- community.sql if applied) in the Supabase SQL editor.
-- ═══════════════════════════════════════════════════════════════

-- ─── New reply on a feed post → notify the post's author (and, for a
-- reply-to-a-reply, the parent reply's author too) — never yourself. ───
create or replace function public.casa_notify_on_feed_reply()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_post_author uuid;
  v_actor_name text;
  v_parent_reply_author uuid;
begin
  select author_id into v_post_author from feed_posts where id = new.post_id;
  select full_name into v_actor_name from profiles where id = new.author_id;

  if v_post_author is not null and v_post_author != new.author_id then
    insert into notifications (user_id, type, title, body, href, actor_id, entity_type, entity_id)
    values (v_post_author, 'reply', coalesce(v_actor_name, 'Someone') || ' replied to your post',
            left(new.body, 140), 'feed.html?post=' || new.post_id, new.author_id, 'post', new.post_id::text);
  end if;

  if new.parent_id is not null then
    select author_id into v_parent_reply_author from feed_replies where id = new.parent_id;
    if v_parent_reply_author is not null
       and v_parent_reply_author != new.author_id
       and v_parent_reply_author is distinct from v_post_author then
      insert into notifications (user_id, type, title, body, href, actor_id, entity_type, entity_id)
      values (v_parent_reply_author, 'reply', coalesce(v_actor_name, 'Someone') || ' replied to your comment',
              left(new.body, 140), 'feed.html?post=' || new.post_id, new.author_id, 'reply', new.id::text);
    end if;
  end if;

  return new;
end $$;

drop trigger if exists trg_notify_feed_reply on feed_replies;
create trigger trg_notify_feed_reply after insert on feed_replies
  for each row execute function public.casa_notify_on_feed_reply();

-- ─── New enquiry → notify the host ───
create or replace function public.casa_notify_on_enquiry()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_guest_name text;
  v_property_title text;
begin
  select full_name into v_guest_name from profiles where id = new.guest_id;
  select title into v_property_title from properties where id = new.property_id;
  insert into notifications (user_id, type, title, body, href, actor_id, entity_type, entity_id)
  values (new.host_id, 'enquiry', 'New enquiry for ' || coalesce(v_property_title, 'your listing'),
          coalesce(v_guest_name, 'A guest') || ' would like to stay ' || new.check_in || ' – ' || new.check_out,
          'host.html', new.guest_id, 'enquiry', new.id::text);
  return new;
end $$;

drop trigger if exists trg_notify_enquiry on enquiries;
create trigger trg_notify_enquiry after insert on enquiries
  for each row execute function public.casa_notify_on_enquiry();

-- ─── Enquiry confirmed/declined → notify the guest ───
create or replace function public.casa_notify_on_enquiry_status()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_property_title text;
begin
  if new.status is distinct from old.status and new.status in ('confirmed', 'declined') then
    select title into v_property_title from properties where id = new.property_id;
    insert into notifications (user_id, type, title, body, href, actor_id, entity_type, entity_id)
    values (
      new.guest_id, 'enquiry',
      case when new.status = 'confirmed' then 'Booking confirmed' else 'Enquiry declined' end,
      coalesce(v_property_title, 'Your enquiry') || ' — ' ||
        case when new.status = 'confirmed' then 'the host has confirmed your dates.' else 'the host can''t host these dates.' end,
      'messages.html' || case when new.conversation_id is not null then '?c=' || new.conversation_id else '' end,
      new.host_id, 'enquiry', new.id::text
    );
  end if;
  return new;
end $$;

drop trigger if exists trg_notify_enquiry_status on enquiries;
create trigger trg_notify_enquiry_status after update on enquiries
  for each row execute function public.casa_notify_on_enquiry_status();

-- ─── New message → notify the other participant(s), persisted (not just
-- the live-realtime-only client notification messages.html already
-- shows while that tab is open) ───
create or replace function public.casa_notify_on_message()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_sender_name text;
  v_recipient uuid;
begin
  select full_name into v_sender_name from profiles where id = new.sender_id;
  for v_recipient in
    select user_id from conversation_participants where conversation_id = new.conversation_id and user_id != new.sender_id
  loop
    insert into notifications (user_id, type, title, body, href, actor_id, entity_type, entity_id)
    values (v_recipient, 'reply', 'New message from ' || coalesce(v_sender_name, 'someone'),
            left(new.body, 140), 'messages.html?c=' || new.conversation_id, new.sender_id, 'message', new.id::text);
  end loop;
  return new;
end $$;

drop trigger if exists trg_notify_message on messages;
create trigger trg_notify_message after insert on messages
  for each row execute function public.casa_notify_on_message();

-- ─── New follow → notify the host being followed ───
create or replace function public.casa_notify_on_follow()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_follower_name text;
begin
  select full_name into v_follower_name from profiles where id = new.follower_id;
  insert into notifications (user_id, type, title, body, href, actor_id, entity_type, entity_id)
  values (new.followed_id, 'follow', coalesce(v_follower_name, 'Someone') || ' followed you',
          'Check out their profile.', 'profile.html', new.follower_id, 'follow', new.follower_id::text);
  return new;
end $$;

drop trigger if exists trg_notify_follow on follows;
create trigger trg_notify_follow after insert on follows
  for each row execute function public.casa_notify_on_follow();

-- ─── New review → notify the property's host ───
create or replace function public.casa_notify_on_review()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_host_id uuid;
  v_property_title text;
  v_reviewer_name text;
begin
  select host_id, title into v_host_id, v_property_title from properties where id = new.property_id;
  select full_name into v_reviewer_name from profiles where id = new.author_id;
  if v_host_id is not null and v_host_id != new.author_id then
    insert into notifications (user_id, type, title, body, href, actor_id, entity_type, entity_id)
    values (v_host_id, 'review', 'New review for ' || coalesce(v_property_title, 'your listing'),
            coalesce(v_reviewer_name, 'A guest') || ' left a ' || new.stars || '★ review.',
            'property.html?id=' || new.property_id, new.author_id, 'review', new.id::text);
  end if;
  return new;
end $$;

drop trigger if exists trg_notify_review on reviews;
create trigger trg_notify_review after insert on reviews
  for each row execute function public.casa_notify_on_review();

-- Realtime so the bell badge can update live, matching messages.html's
-- existing pattern, without requiring a page reload.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'notifications'
  ) then
    execute 'alter publication supabase_realtime add table notifications';
  end if;
end $$;
