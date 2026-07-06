/** Community feed posts — real Supabase-backed (feed_posts / feed_replies).
    Used by feed.html, property.html (mentions), attractions.html (tips),
    host.html (reply-from-dashboard). No seed/demo posts: the 21 that used
    to live here had fabricated authors, likes, and reply counts with no
    matching real accounts, so the feed starts genuinely empty until real
    users post. */

async function casaFetchFeedPosts({ region, type, authorId, propertyId } = {}) {
  if (!window.casaSupabase) return [];
  let q = window.casaSupabase
    .from('feed_posts')
    .select('id, type, region, property_id, body, image_urls, review_stars, created_at, author:profiles!feed_posts_author_id_fkey(id, full_name, role, avatar_url)')
    .order('created_at', { ascending: false });
  if (region && region !== 'all') q = q.eq('region', region);
  if (type) q = q.eq('type', type);
  if (authorId) q = q.eq('author_id', authorId);
  if (propertyId) q = q.eq('property_id', propertyId);
  const { data, error } = await q;
  if (error) { console.error('casaFetchFeedPosts failed', error); return []; }
  return data || [];
}

async function casaFetchRepliesForPost(postId) {
  if (!window.casaSupabase) return [];
  const { data, error } = await window.casaSupabase
    .from('feed_replies')
    .select('id, body, created_at, author:profiles!feed_replies_author_id_fkey(id, full_name, role, avatar_url)')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });
  if (error) { console.error('casaFetchRepliesForPost failed', error); return []; }
  return data || [];
}

async function casaCreateFeedPost({ type, region, propertyId, body, reviewStars }) {
  if (!window.casaSupabase) return null;
  const { data: { session } } = await window.casaSupabase.auth.getSession();
  if (!session) return null;
  const { data, error } = await window.casaSupabase
    .from('feed_posts')
    .insert({
      author_id: session.user.id,
      type,
      region: region || 'all',
      property_id: propertyId || null,
      body,
      review_stars: reviewStars || null,
    })
    .select('id, type, region, property_id, body, image_urls, review_stars, created_at, author:profiles!feed_posts_author_id_fkey(id, full_name, role, avatar_url)')
    .single();
  if (error) { console.error('casaCreateFeedPost failed', error); return null; }
  return data;
}

// One cheap query for every post's reply count, grouped client-side —
// avoids a round trip per post just to show a badge number.
async function casaFetchFeedReplyCounts() {
  if (!window.casaSupabase) return {};
  const { data, error } = await window.casaSupabase.from('feed_replies').select('post_id');
  if (error) { console.error('casaFetchFeedReplyCounts failed', error); return {}; }
  const counts = {};
  (data || []).forEach(r => { counts[r.post_id] = (counts[r.post_id] || 0) + 1; });
  return counts;
}

async function casaCreateFeedReply(postId, body) {
  if (!window.casaSupabase) return null;
  const { data: { session } } = await window.casaSupabase.auth.getSession();
  if (!session) return null;
  const { data, error } = await window.casaSupabase
    .from('feed_replies')
    .insert({ post_id: postId, author_id: session.user.id, body })
    .select('id, body, created_at, author:profiles!feed_replies_author_id_fkey(id, full_name, role, avatar_url)')
    .single();
  if (error) { console.error('casaCreateFeedReply failed', error); return null; }
  return data;
}

function casaEscapeHtml(s) {
  return String(s || '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
}

// Real post/reply bodies are now free-text from real users, not baked-in
// seed HTML — always escape before highlighting hashtags, since this is
// rendered via innerHTML in several places (feed.html, attractions.html,
// property.html, host.html).
function casaFormatFeedBody(text) {
  return casaEscapeHtml(text).replace(/(#[a-z0-9]*[a-z][a-z0-9]*)/gi, '<span class="tag">$1</span>');
}

window.casaFetchFeedPosts = casaFetchFeedPosts;
window.casaFetchFeedReplyCounts = casaFetchFeedReplyCounts;
window.casaFetchRepliesForPost = casaFetchRepliesForPost;
window.casaCreateFeedPost = casaCreateFeedPost;
window.casaCreateFeedReply = casaCreateFeedReply;
window.casaEscapeHtml = casaEscapeHtml;
window.casaFormatFeedBody = casaFormatFeedBody;
