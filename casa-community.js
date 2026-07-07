/** Casa community layer — Phase 07 (supabase/community.sql)
    Voting, spaces ("communities"), threaded replies, saves, reposts.

    Every function here degrades gracefully: if window.casaSupabase isn't
    ready, or the community.sql migration hasn't been applied yet (the
    tables/columns don't exist), calls resolve to null/[]/{} rather than
    throwing — so feed.html can call these unconditionally and just treat
    a falsy/empty result as "feature not available yet". */

async function casaCommunitySession() {
  if (!window.casaSupabase) return null;
  const { data: { session } } = await window.casaSupabase.auth.getSession();
  return session || null;
}

// ─── Communities ("spaces") ───
async function casaFetchCommunities() {
  if (!window.casaSupabase) return [];
  const { data, error } = await window.casaSupabase
    .from('communities')
    .select('id, slug, name, description, kind, region, icon, color, member_count, post_count, is_official')
    .order('kind', { ascending: true })
    .order('member_count', { ascending: false });
  if (error) { console.error('casaFetchCommunities failed', error); return []; }
  return data || [];
}

async function casaFetchMyCommunityIds() {
  const session = await casaCommunitySession();
  if (!session) return new Set();
  const { data, error } = await window.casaSupabase
    .from('community_members').select('community_id').eq('user_id', session.user.id);
  if (error) { console.error('casaFetchMyCommunityIds failed', error); return new Set(); }
  return new Set((data || []).map(r => r.community_id));
}

async function casaJoinCommunity(communityId) {
  const session = await casaCommunitySession();
  if (!session) return false;
  const { error } = await window.casaSupabase
    .from('community_members').upsert({ community_id: communityId, user_id: session.user.id }, { onConflict: 'community_id,user_id' });
  if (error) console.error('casaJoinCommunity failed', error);
  return !error;
}

async function casaLeaveCommunity(communityId) {
  const session = await casaCommunitySession();
  if (!session) return false;
  const { error } = await window.casaSupabase
    .from('community_members').delete().eq('community_id', communityId).eq('user_id', session.user.id);
  if (error) console.error('casaLeaveCommunity failed', error);
  return !error;
}

// ─── Voting — value is 1 (up), -1 (down), or 0 (remove vote) ───
async function casaVotePost(postId, value) {
  const session = await casaCommunitySession();
  if (!session) return null;
  if (value === 0) {
    const { error } = await window.casaSupabase.from('post_votes').delete().eq('post_id', postId).eq('user_id', session.user.id);
    return error ? null : 0;
  }
  const { error } = await window.casaSupabase
    .from('post_votes').upsert({ post_id: postId, user_id: session.user.id, value }, { onConflict: 'post_id,user_id' });
  if (error) { console.error('casaVotePost failed', error); return null; }
  return value;
}

async function casaGetMyPostVotes(postIds) {
  const session = await casaCommunitySession();
  if (!session || !postIds || !postIds.length) return {};
  const { data, error } = await window.casaSupabase
    .from('post_votes').select('post_id, value').eq('user_id', session.user.id).in('post_id', postIds);
  if (error) { console.error('casaGetMyPostVotes failed', error); return {}; }
  const map = {};
  (data || []).forEach(r => { map[r.post_id] = r.value; });
  return map;
}

async function casaVoteReply(replyId, value) {
  const session = await casaCommunitySession();
  if (!session) return null;
  if (value === 0) {
    const { error } = await window.casaSupabase.from('reply_votes').delete().eq('reply_id', replyId).eq('user_id', session.user.id);
    return error ? null : 0;
  }
  const { error } = await window.casaSupabase
    .from('reply_votes').upsert({ reply_id: replyId, user_id: session.user.id, value }, { onConflict: 'reply_id,user_id' });
  if (error) { console.error('casaVoteReply failed', error); return null; }
  return value;
}

async function casaGetMyReplyVotes(replyIds) {
  const session = await casaCommunitySession();
  if (!session || !replyIds || !replyIds.length) return {};
  const { data, error } = await window.casaSupabase
    .from('reply_votes').select('reply_id, value').eq('user_id', session.user.id).in('reply_id', replyIds);
  if (error) { console.error('casaGetMyReplyVotes failed', error); return {}; }
  const map = {};
  (data || []).forEach(r => { map[r.reply_id] = r.value; });
  return map;
}

// ─── Saves & reposts ───
async function casaToggleSavePost(postId) {
  const session = await casaCommunitySession();
  if (!session) return null;
  const { data } = await window.casaSupabase.from('post_saves').select('post_id').eq('post_id', postId).eq('user_id', session.user.id).maybeSingle();
  if (data) {
    const { error } = await window.casaSupabase.from('post_saves').delete().eq('post_id', postId).eq('user_id', session.user.id);
    return error ? null : false;
  }
  const { error } = await window.casaSupabase.from('post_saves').insert({ post_id: postId, user_id: session.user.id });
  return error ? null : true;
}

async function casaGetMySavedPostIds() {
  const session = await casaCommunitySession();
  if (!session) return new Set();
  const { data, error } = await window.casaSupabase.from('post_saves').select('post_id').eq('user_id', session.user.id);
  if (error) return new Set();
  return new Set((data || []).map(r => r.post_id));
}

async function casaToggleRepost(postId, comment) {
  const session = await casaCommunitySession();
  if (!session) return null;
  const { data } = await window.casaSupabase.from('post_reposts').select('post_id').eq('post_id', postId).eq('user_id', session.user.id).maybeSingle();
  if (data) {
    const { error } = await window.casaSupabase.from('post_reposts').delete().eq('post_id', postId).eq('user_id', session.user.id);
    return error ? null : false;
  }
  const { error } = await window.casaSupabase.from('post_reposts').insert({ post_id: postId, user_id: session.user.id, comment: comment || null });
  return error ? null : true;
}

// ─── Threaded replies — fetched flat, nested client-side by parent_id ───
function casaNestReplies(flat) {
  const byId = {};
  flat.forEach(r => { byId[r.id] = Object.assign({}, r, { children: [] }); });
  const roots = [];
  flat.forEach(r => {
    const node = byId[r.id];
    if (r.parent_id && byId[r.parent_id]) byId[r.parent_id].children.push(node);
    else roots.push(node);
  });
  return roots;
}

async function casaFetchThreadedReplies(postId) {
  if (!window.casaSupabase) return [];
  const { data, error } = await window.casaSupabase
    .from('feed_replies')
    .select('id, post_id, parent_id, body, score, upvotes, downvotes, created_at, author:profiles!feed_replies_author_id_fkey(id, full_name, role, avatar_url)')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });
  if (error) { console.error('casaFetchThreadedReplies failed', error); return []; }
  return casaNestReplies(data || []);
}

async function casaCreateThreadedReply(postId, body, parentId) {
  const session = await casaCommunitySession();
  if (!session) return null;
  const { data, error } = await window.casaSupabase
    .from('feed_replies')
    .insert({ post_id: postId, author_id: session.user.id, body, parent_id: parentId || null })
    .select('id, post_id, parent_id, body, score, upvotes, downvotes, created_at, author:profiles!feed_replies_author_id_fkey(id, full_name, role, avatar_url)')
    .single();
  if (error) { console.error('casaCreateThreadedReply failed', error); return null; }
  return data;
}

// ─── Ranking — client-side "hot" so it shares the single fetch that the
// rest of feed.html's filters (county/type/tag/search) already run against,
// rather than a second network round-trip per sort mode. Mirrors the SQL
// view's formula (supabase/community.sql: feed_posts_ranked) so client and
// server agree if/when the view is queried directly elsewhere. ───
function casaHotRank(score, createdAt) {
  const s = score || 0;
  const sign = s > 0 ? 1 : s < 0 ? -1 : 0;
  const order = Math.log(Math.max(Math.abs(s), 1));
  const seconds = (new Date(createdAt).getTime() / 1000) - 1704067200; // 2024-01-01
  return sign * order + seconds / 45000;
}

async function casaCreatePost({ type, region, communityId, propertyId, body, reviewStars, title, hashtags }) {
  const session = await casaCommunitySession();
  if (!session) return null;
  const row = { author_id: session.user.id, type, region: region || 'all', property_id: propertyId || null, body, review_stars: reviewStars || null };
  if (communityId) row.community_id = communityId;
  if (title) row.title = title;
  if (hashtags && hashtags.length) row.hashtags = hashtags;
  const { data, error } = await window.casaSupabase
    .from('feed_posts')
    .insert(row)
    .select('id, type, region, community_id, property_id, body, image_urls, review_stars, score, upvotes, downvotes, reply_count, created_at, author:profiles!feed_posts_author_id_fkey(id, full_name, role, avatar_url)')
    .single();
  if (error) { console.error('casaCreatePost failed', error); return null; }
  return data;
}

window.casaFetchCommunities = casaFetchCommunities;
window.casaFetchMyCommunityIds = casaFetchMyCommunityIds;
window.casaJoinCommunity = casaJoinCommunity;
window.casaLeaveCommunity = casaLeaveCommunity;
window.casaVotePost = casaVotePost;
window.casaGetMyPostVotes = casaGetMyPostVotes;
window.casaVoteReply = casaVoteReply;
window.casaGetMyReplyVotes = casaGetMyReplyVotes;
window.casaToggleSavePost = casaToggleSavePost;
window.casaGetMySavedPostIds = casaGetMySavedPostIds;
window.casaToggleRepost = casaToggleRepost;
window.casaFetchThreadedReplies = casaFetchThreadedReplies;
window.casaCreateThreadedReply = casaCreateThreadedReply;
window.casaHotRank = casaHotRank;
window.casaCreatePost = casaCreatePost;
