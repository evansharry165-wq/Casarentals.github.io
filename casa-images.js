/**
 * Casa photography — location-accurate UK landscapes & stays
 * Sources: Unsplash (verified IDs) + Wikimedia Commons / Geograph (CC-licensed)
 */
const CASA_IMG = 'https://images.unsplash.com';

/** Wikimedia / Geograph — geotagged UK locations */
const W = {
  windermere: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Windermere_lake_in_Lake_District_03.jpg/960px-Windermere_lake_in_Lake_District_03.jpg',
  skyeQuiraing: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Quiraing_Isle_of_Skye_Pano.jpg/960px-Quiraing_Isle_of_Skye_Pano.jpg',
  cumbriaCottage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Houses_near_Shaw_Bank_%28geograph_5946133%29.jpg/960px-Houses_near_Shaw_Bank_%28geograph_5946133%29.jpg',
  shepherdHut: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/The_Shepherds_Hut_-_geograph.org.uk_-_3040571.jpg/960px-The_Shepherds_Hut_-_geograph.org.uk_-_3040571.jpg',
  blackhouse: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Outer_Hebrides_-_Garenin_Blackhouses_Museum_-_20180411102132.jpg/960px-Outer_Hebrides_-_Garenin_Blackhouses_Museum_-_20180411102132.jpg',
  norfolkBarn: 'https://upload.wikimedia.org/wikipedia/commons/4/41/Thatched_barn_conversion_-_geograph.org.uk_-_1337238.jpg',
  yorkshireDales: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Landscape_from_Yorkshire_Dales.jpg/960px-Landscape_from_Yorkshire_Dales.jpg',
  swaledale: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/2014_Yorkshire_Dales_country_road_Swaledale_Askrigg.jpg/960px-2014_Yorkshire_Dales_country_road_Swaledale_Askrigg.jpg',
  pembrokeshire: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Marloes_peninsula%2C_Pembrokeshire_coast%2C_Wales%2C_UK.JPG/960px-Marloes_peninsula%2C_Pembrokeshire_coast%2C_Wales%2C_UK.JPG',
  pembrokeshirePath: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Llwybr_Arfordir_Sir_Benfro_-_Pembrokeshire_Coast_Path_-_geograph.org.uk_-_4303609.jpg/960px-Llwybr_Arfordir_Sir_Benfro_-_Pembrokeshire_Coast_Path_-_geograph.org.uk_-_4303609.jpg',
};

/** Unsplash — verified HTTP 200, location-tagged on Unsplash */
const U = {
  ldWindermere: `${CASA_IMG}/photo-1732300070181-e7268d8a1b73`,
  ldAerial: `${CASA_IMG}/photo-1696445324224-478cf0bceaea`,
  ldDock: `${CASA_IMG}/photo-1516537042526-141061d2483b`,
  storr: `${CASA_IMG}/photo-1573083352239-4cab963c3329`,
  glencoe: `${CASA_IMG}/photo-1568665070033-c425669e6605`,
  glencoeValley: `${CASA_IMG}/photo-1659977193681-c40fa885527e`,
  glencoeField: `${CASA_IMG}/photo-1688798708797-f3e6c26397ce`,
  highlandPeaks: `${CASA_IMG}/photo-1609674750700-33895b9b7ce1`,
  kynance: `${CASA_IMG}/photo-1606413447153-b638e3e1d285`,
  bibury: `${CASA_IMG}/photo-1510004868592-324954d4d45a`,
  cotswoldsRiver: `${CASA_IMG}/photo-1630174525280-68619383c7b4`,
  snowdon: `${CASA_IMG}/photo-1596083331697-46711183497f`,
  snowdonLake: `${CASA_IMG}/photo-1576413209841-efe9c2cd11aa`,
  causeway: `${CASA_IMG}/photo-1565057386288-be45581ae226`,
  holkham: `${CASA_IMG}/photo-1604075903199-a78a45751d53`,
  cottageExterior: `${CASA_IMG}/photo-1564013799919-ab600027ffc6`,
  cottageInterior: `${CASA_IMG}/photo-1600596542815-ffad4c1539a9`,
  barnExterior: `${CASA_IMG}/photo-1600585154340-be6161a56a0c`,
  barnInterior: `${CASA_IMG}/photo-1600607687939-ce8a6c25118c`,
  farmhouse: `${CASA_IMG}/photo-1600607687644-c7171b42498f`,
  manor: `${CASA_IMG}/photo-1600585154526-990dced4db0d`,
  houseboat: `${CASA_IMG}/photo-1566073771259-6a8506099945`,
  coastalCottage: `${CASA_IMG}/photo-1499793983690-e29da59ef1c2`,
  poolHouse: `${CASA_IMG}/photo-1571896349842-33c89424de2d`,
};

const CASA_REGION_PHOTOS = {
  'lake-district': U.ldWindermere,
  skye: W.skyeQuiraing,
  highlands: U.glencoe,
  cornwall: U.kynance,
  cotswolds: U.bibury,
  snowdonia: U.snowdon,
  causeway: U.causeway,
  norfolk: U.holkham,
  yorkshire: W.yorkshireDales,
  pembrokeshire: W.pembrokeshire,
};

const CASA_TYPE_PHOTOS = {
  cottage: [U.cottageExterior, U.cottageInterior, W.cumbriaCottage],
  barn: [U.barnExterior, U.barnInterior, W.norfolkBarn],
  cabin: [U.cottageInterior, U.snowdonLake, W.windermere],
  glamping: [W.shepherdHut, U.coastalCottage, U.ldWindermere],
  farmhouse: [U.farmhouse, U.barnExterior, W.swaledale],
  houseboat: [U.houseboat, U.coastalCottage, U.poolHouse],
  manor: [U.manor, U.farmhouse, U.barnExterior],
};

/** Every listing gets a location-appropriate hero photo */
const CASA_PROPERTY_PHOTO_OVERRIDES = {
  1: W.cumbriaCottage,           // Stone Cottage, Windermere
  2: U.barnExterior,             // Slate Barn, Ambleside
  3: W.windermere,               // Lakeside Cabin, Coniston
  4: U.cottageExterior,          // Georgian House, Keswick
  5: W.shepherdHut,              // Shepherd's Hut, Buttermere
  6: W.cumbriaCottage,           // Miller's Cottage, Grasmere
  7: U.farmhouse,                // The Granary, Hawkshead
  8: U.farmhouse,                // Hillside Farmhouse, Grizedale
  9: U.kynance,                  // Cliffside Cottage, Porthcurno
  10: U.manor,                   // Tregothnan Lodge, Truro
  11: U.coastalCottage,          // Harbour Cottage, Mousehole
  12: U.kynance,                 // St Agnes Farmhouse
  13: U.houseboat,               // The Boathouse, Fowey
  14: W.shepherdHut,             // Mizen Shepherd Hut
  15: W.blackhouse,              // Restored Blackhouse, Skye
  16: U.glencoeValley,           // Glen Coe Bothy
  17: U.highlandPeaks,           // Loch Ness Lodge
  18: U.glencoeField,            // Croft House, Torridon
  19: W.skyeQuiraing,            // Isle of Skye Hideaway
  20: W.norfolkBarn,             // Burnham Overy Barn
  21: U.holkham,                 // The Granary, Wells
  22: U.holkham,                 // Saltmarsh Cabin, Blakeney
  23: U.manor,                   // Brancaster Hall
  24: W.yorkshireDales,          // Moorland Cottage, Goathland
  25: W.swaledale,               // Dales Farmhouse, Wharfedale
  26: W.yorkshireDales,          // The Old Forge, Whitby
  27: U.bibury,                  // Honeysuckle Cottage, Cotswolds
  28: U.manor,                   // Chipping Manor
  29: U.cotswoldsRiver,          // The Old Mill
  30: W.pembrokeshire,           // Pembroke Cliffside
  31: W.pembrokeshirePath,       // The Boathouse, Solva
  32: W.pembrokeshire,           // Coast Path Glamping
  33: U.snowdon,                 // Hafod Cottage, Snowdonia
  34: U.snowdonLake,             // Llyn Padarn Cabin
  35: U.causeway,                // Giant's Causeway Cottage
  36: U.causeway,                // Dark Hedges Farmhouse
};

const CASA_HERO_STRIP = [
  { id: 1, label: 'Stone Cottage', sub: 'Windermere · Lake District' },
  { id: 15, label: 'Blackhouse', sub: 'Trotternish · Isle of Skye' },
  { id: 5, label: "Shepherd's Hut", sub: 'Buttermere · Cumbria' },
  { id: 20, label: 'Burnham Overy Barn', sub: 'Norfolk coast' },
];

function casaPhotoUrl(url, width) {
  if (!url) return '';
  const w = width || 800;
  if (url.includes('images.unsplash.com')) {
    const base = url.split('?')[0];
    return `${base}?auto=format&fit=crop&w=${w}&q=80`;
  }
  if (url.includes('upload.wikimedia.org')) {
    if (url.includes('/thumb/')) return url.replace(/\/(\d+)px-/, `/${w}px-`);
    return url;
  }
  return url;
}

function casaGetRegionPhoto(regionId, width) {
  const base = CASA_REGION_PHOTOS[regionId] || CASA_REGION_PHOTOS['lake-district'];
  return casaPhotoUrl(base, width || 900);
}

function casaGetPropertyPhoto(property, width) {
  if (!property) return casaGetRegionPhoto('lake-district', width);
  if (CASA_PROPERTY_PHOTO_OVERRIDES[property.id]) {
    return casaPhotoUrl(CASA_PROPERTY_PHOTO_OVERRIDES[property.id], width);
  }
  const typePool = CASA_TYPE_PHOTOS[property.type];
  if (typePool?.length) {
    return casaPhotoUrl(typePool[property.id % typePool.length], width);
  }
  return casaGetRegionPhoto(property.region, width);
}

function casaGetPropertyGallery(property, count) {
  const n = count || 5;
  const main = casaGetPropertyPhoto(property, 1200);
  const extras = CASA_TYPE_PHOTOS[property.type] || [];
  const region = CASA_REGION_PHOTOS[property.region];
  const list = [main];
  extras.forEach(u => { if (list.length < n && u !== main.split('?')[0]) list.push(casaPhotoUrl(u, 900)); });
  if (region && list.length < n) list.push(casaPhotoUrl(region, 900));
  while (list.length < n) list.push(main);
  return list.slice(0, n);
}

function casaPhotoStyle(property, width) {
  const url = typeof property === 'object' ? casaGetPropertyPhoto(property, width) : property;
  return `background-image:url("${url}");background-size:cover;background-position:center;`;
}

function casaPhotoImg(property, opts = {}) {
  const url = casaGetPropertyPhoto(property, opts.width || 800);
  const alt = opts.alt || `${property.title}, ${property.loc} — holiday rental on Casa`;
  const cls = opts.className || 'casa-photo-img';
  return `<img class="${cls}" src="${url}" alt="${alt.replace(/"/g, '&quot;')}" loading="lazy" decoding="async">`;
}

function casaEnrichPropertyImages() {
  if (typeof CASA_PROPERTIES === 'undefined') return;
  CASA_PROPERTIES.forEach(p => {
    p.img = casaGetPropertyPhoto(p, 1200);
    p.photos = casaGetPropertyGallery(p, 5);
  });
}

casaEnrichPropertyImages();

window.casaGetRegionPhoto = casaGetRegionPhoto;
window.casaGetPropertyPhoto = casaGetPropertyPhoto;
window.casaGetPropertyGallery = casaGetPropertyGallery;
window.casaPhotoStyle = casaPhotoStyle;
window.casaPhotoImg = casaPhotoImg;
window.CASA_REGION_PHOTOS = CASA_REGION_PHOTOS;
window.CASA_HERO_STRIP = CASA_HERO_STRIP;
