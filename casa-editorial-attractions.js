/* ──────────────────────────────────────────────────────────
   CASA · editorial local attractions
   Genuine, well-known local attractions per region, written in Casa's
   own original words — NOT scraped, copied, or reproduced from any
   tourist board, Wikipedia, TripAdvisor, or other publisher. A place's
   name, general location, and what it's known for are stated as plain
   fact (facts aren't copyrightable); every sentence describing them
   here is Casa's own writing.

   No photography is attached — these render with the same placeholder/
   illustrative treatment browse.html's property cards use when a real
   photo doesn't exist yet, not scraped images. Real photography (Casa's
   own, or properly licensed) is needed before this looks fully
   finished — flagged here rather than working around it with someone
   else's photos.

   `author.type` is a real content-source concept, not just a label:
   'casa' is Casa's own editorial voice (what every entry below is).
   The same shape is meant to extend to a named third-party
   `'contributor'` later, once a publisher-onboarding flow exists — not
   built yet, this is only the data shape that would carry it without
   a rework. User-submitted tips (feed_posts, type:'tip') are a
   separate, existing source with their own author.type of 'guest' or
   'host' — see attractions.html's mergeAttractionSources().
   ────────────────────────────────────────────────────────── */
const CASA_EDITORIAL_ATTRACTIONS = [
  // ─── Lake District ───
  {
    id: 'ld-scafell-pike', region: 'lake-district', name: 'Scafell Pike', category: 'Walk',
    author: { type: 'casa', name: 'Casa Editorial' },
    body: "England's highest mountain, reached from Wasdale, Borrowdale, or Langdale depending on how long a day you want. It's one of the three peaks in the National Three Peaks Challenge, but plenty of people climb it on its own — the Wasdale route is the shortest, the Corridor Route from Seathwaite the more scenic of the two."
  },
  {
    id: 'ld-windermere', region: 'lake-district', name: 'Windermere', category: 'Landmark',
    author: { type: 'casa', name: 'Casa Editorial' },
    body: "The largest natural lake in England, running for roughly ten and a half miles between Ambleside and Newby Bridge. Steamers and launches cross it regularly from Bowness, and the western shore stays noticeably quieter than the busier Bowness side."
  },
  {
    id: 'ld-cat-bells', region: 'lake-district', name: 'Cat Bells', category: 'Walk',
    author: { type: 'casa', name: 'Casa Editorial' },
    body: "A short fell above Derwentwater, close to Keswick, often recommended as a first Lakeland fell walk because the summit is reachable in under an hour from the Hawes End car park. The ridge gives a clear view down over Derwentwater and across to Skiddaw without needing a full day."
  },
  {
    id: 'ld-tarn-hows', region: 'lake-district', name: 'Tarn Hows', category: 'Viewpoint',
    author: { type: 'casa', name: 'Casa Editorial' },
    body: "A small tarn near Hawkshead and Coniston, owned by the National Trust, with a level, mostly-flat path circling the water — one of the few Lakeland beauty spots that works for pushchairs and less mobile visitors. Beatrix Potter owned part of the land before it passed to the Trust."
  },
  {
    id: 'ld-castlerigg', region: 'lake-district', name: 'Castlerigg Stone Circle', category: 'Landmark',
    author: { type: 'casa', name: 'Casa Editorial' },
    body: "A Neolithic stone circle on a hilltop just outside Keswick, thought to be one of the earliest stone circles built in Britain. The fells rise on almost every side of it, which is as much a reason people visit as the stones themselves."
  },
  {
    id: 'ld-ashness-bridge', region: 'lake-district', name: 'Ashness Bridge', category: 'Viewpoint',
    author: { type: 'casa', name: 'Casa Editorial' },
    body: "A small packhorse bridge on the minor road up from Derwentwater towards Watendlath, framed by Derwentwater and Skiddaw behind it. It's a short stop rather than a walk in its own right, but one of the more photographed single spots in the northern Lakes."
  },

  // ─── Cornwall ───
  {
    id: 'cw-lands-end', region: 'cornwall', name: "Land's End", category: 'Landmark',
    author: { type: 'casa', name: 'Casa Editorial' },
    body: "The most westerly point of mainland England, where the coast path meets open Atlantic with nothing but sea between here and the Isles of Scilly on a clear day. The cliffs either side of the headland, away from the visitor centre itself, are where most people end up spending their time."
  },
  {
    id: 'cw-st-michaels-mount', region: 'cornwall', name: "St Michael's Mount", category: 'Landmark',
    author: { type: 'casa', name: 'Casa Editorial' },
    body: "A tidal island off Marazion with a castle and gardens on top, reachable on foot across a granite causeway at low tide or by small boat when the water's in. It's still a family home as well as a National Trust property, which is part of why it's kept its working, lived-in feel rather than becoming purely a museum piece."
  },
  {
    id: 'cw-minack-theatre', region: 'cornwall', name: 'Minack Theatre', category: 'Landmark',
    author: { type: 'casa', name: 'Casa Editorial' },
    body: "An open-air theatre cut into the cliffs above Porthcurno, with the stage backed directly by the sea. It's a working theatre with a full summer season of performances, not just a viewpoint, though plenty of visitors come to look at it by day when there's no show on."
  },
  {
    id: 'cw-tintagel-castle', region: 'cornwall', name: 'Tintagel Castle', category: 'Landmark',
    author: { type: 'casa', name: 'Casa Editorial' },
    body: "Medieval castle ruins on Cornwall's north coast, long linked with the legend of King Arthur's conception. A footbridge now connects the mainland to the headland where the older ruins sit, and the walk down to the cove and Merlin's Cave below is part of most visits."
  },
  {
    id: 'cw-eden-project', region: 'cornwall', name: 'Eden Project', category: 'Landmark',
    author: { type: 'casa', name: 'Casa Editorial' },
    body: "A cluster of huge biome domes built inside a former china clay pit near St Austell, each housing plants from a different climate — one humid and tropical, one Mediterranean. It's as much a horticultural project as a day out, and one of the few Cornwall attractions built to work whatever the weather's doing outside."
  },
  {
    id: 'cw-kynance-cove', region: 'cornwall', name: 'Kynance Cove', category: 'Beach',
    author: { type: 'casa', name: 'Casa Editorial' },
    body: "A National Trust-managed cove on the Lizard peninsula, known for turquoise water, pale sand, and dark serpentine rock stacks rising out of the beach. The car park sits a fair walk up from the cove itself, and much of the sand disappears at high tide, so timing the visit matters here more than at most Cornish beaches."
  },

  // ─── Scottish Highlands ───
  {
    id: 'hl-loch-ness', region: 'highlands', name: 'Loch Ness', category: 'Landmark',
    author: { type: 'casa', name: 'Casa Editorial' },
    body: "A long, deep freshwater loch running south-west from Inverness, best known outside Scotland for the Loch Ness Monster legend. Urquhart Castle sits in ruins on its northern shore and is the spot most boat trips head for, partly for the castle and partly because it's one of the widest points to see the loch from."
  },
  {
    id: 'hl-glencoe', region: 'highlands', name: 'Glen Coe', category: 'Walk',
    author: { type: 'casa', name: 'Casa Editorial' },
    body: "A glen of steep, dramatic mountains on the road between Fort William and Glasgow, popular with walkers and photographers for the scenery alone. It's also the site of the 1692 Massacre of Glencoe, and the visitor centre covers that history alongside the walking routes."
  },
  {
    id: 'hl-ben-nevis', region: 'highlands', name: 'Ben Nevis', category: 'Walk',
    author: { type: 'casa', name: 'Casa Editorial' },
    body: "The highest mountain in the UK, just outside Fort William. The Mountain Track — sometimes called the Pony Track — is a long but non-technical route to the summit that a fit walker in reasonable weather can manage in a day, while the north face draws more serious climbers in winter conditions."
  },
  {
    id: 'hl-eilean-donan', region: 'highlands', name: 'Eilean Donan Castle', category: 'Landmark',
    author: { type: 'casa', name: 'Casa Editorial' },
    body: "A castle on a small tidal island near Dornie, where three sea lochs meet, connected to the shore by a stone footbridge. The current building is largely a early-20th-century reconstruction of the original medieval castle, and it's one of the most photographed castles in Scotland for exactly the reason it looks the way it does in photos — the water on three sides."
  },
  {
    id: 'hl-cairngorms', region: 'highlands', name: 'Cairngorms National Park', category: 'Walk',
    author: { type: 'casa', name: 'Casa Editorial' },
    body: "The largest national park in the UK, covering a broad range of mountains and moorland in the eastern Highlands. It holds a large share of the UK's remaining native pinewood and is one of the more reliable places to see red squirrels, capercaillie, and — at height — genuinely arctic-like ground conditions."
  },
  {
    id: 'hl-culloden', region: 'highlands', name: 'Culloden Battlefield', category: 'Landmark',
    author: { type: 'casa', name: 'Casa Editorial' },
    body: "The site of the 1746 Battle of Culloden near Inverness, the last pitched battle fought on British soil. The moorland has been kept close to how it looked at the time, with a visitor centre explaining the battle and the clan graves marked out across the field."
  },
];

window.CASA_EDITORIAL_ATTRACTIONS = CASA_EDITORIAL_ATTRACTIONS;

function casaGetEditorialAttractions(region) {
  if (!region || region === 'all') return CASA_EDITORIAL_ATTRACTIONS.slice();
  return CASA_EDITORIAL_ATTRACTIONS.filter(a => a.region === region);
}
window.casaGetEditorialAttractions = casaGetEditorialAttractions;
