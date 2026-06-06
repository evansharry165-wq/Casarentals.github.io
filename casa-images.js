/**
 * Casa photography — curated Unsplash (UK landscapes & holiday stays)
 * Images used under Unsplash licence; replace with host uploads when live.
 */
const CASA_IMG = 'https://images.unsplash.com';

const CASA_REGION_PHOTOS = {
  'lake-district': `${CASA_IMG}/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&q=80`,
  skye: `${CASA_IMG}/photo-1542407660655-771c746642bb?auto=format&fit=crop&q=80`,
  highlands: `${CASA_IMG}/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80`,
  cornwall: `${CASA_IMG}/photo-1530739180453-456661476b50?auto=format&fit=crop&q=80`,
  cotswolds: `${CASA_IMG}/photo-1599422471762-0a29d594825b?auto=format&fit=crop&q=80`,
  snowdonia: `${CASA_IMG}/photo-1508739778720-f435b6971040?auto=format&fit=crop&q=80`,
  causeway: `${CASA_IMG}/photo-1551639752-c20698e8a1d8?auto=format&fit=crop&q=80`,
  norfolk: `${CASA_IMG}/photo-1501594907352-352db27c5422?auto=format&fit=crop&q=80`,
  yorkshire: `${CASA_IMG}/photo-1518702776827-ae934794564e?auto=format&fit=crop&q=80`,
  pembrokeshire: `${CASA_IMG}/photo-1505118383647-7cbb46e1dd69?auto=format&fit=crop&q=80`,
};

/** Extra shots per property type for gallery variety */
const CASA_TYPE_PHOTOS = {
  cottage: [`${CASA_IMG}/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80`, `${CASA_IMG}/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80`],
  barn: [`${CASA_IMG}/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80`, `${CASA_IMG}/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80`],
  cabin: [`${CASA_IMG}/photo-1449824913935-59a10b8d2001?auto=format&fit=crop&q=80`, `${CASA_IMG}/photo-1523217582562-09f0bc75619c?auto=format&fit=crop&q=80`],
  glamping: [`${CASA_IMG}/photo-1520250497591-112f2c40a3f4?auto=format&fit=crop&q=80`, `${CASA_IMG}/photo-1478131143081-144f3f7d0b7c?auto=format&fit=crop&q=80`],
  farmhouse: [`${CASA_IMG}/photo-1605276374101-40a098177246?auto=format&fit=crop&q=80`, `${CASA_IMG}/photo-1600607687644-c7171b42498f?auto=format&fit=crop&q=80`],
  houseboat: [`${CASA_IMG}/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80`, `${CASA_IMG}/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80`],
  manor: [`${CASA_IMG}/photo-1613490493650-1fe40d169172?auto=format&fit=crop&q=80`, `${CASA_IMG}/photo-1600585154526-990dced4db0d?auto=format&fit=crop&q=80`],
};

const CASA_PROPERTY_PHOTO_OVERRIDES = {
  1: `${CASA_IMG}/photo-1470290448213-c27f42743f24?auto=format&fit=crop&q=80`,
  5: `${CASA_IMG}/photo-1478131143081-144f3f7d0b7c?auto=format&fit=crop&q=80`,
  9: `${CASA_IMG}/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&q=80`,
  11: `${CASA_IMG}/photo-1502672260266-1c1ef2cd9361?auto=format&fit=crop&q=80`,
  15: `${CASA_IMG}/photo-1542407660655-771c746642bb?auto=format&fit=crop&q=80`,
  19: `${CASA_IMG}/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80`,
  20: `${CASA_IMG}/photo-1501594907352-352db27c5422?auto=format&fit=crop&q=80`,
  27: `${CASA_IMG}/photo-1599422471762-0a29d594825b?auto=format&fit=crop&q=80`,
  34: `${CASA_IMG}/photo-1508739778720-f435b6971040?auto=format&fit=crop&q=80`,
  35: `${CASA_IMG}/photo-1551639752-c20698e8a1d8?auto=format&fit=crop&q=80`,
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
  return url.includes('?') ? `${url}&w=${w}` : `${url}?w=${w}`;
}

function casaGetRegionPhoto(regionId, width) {
  const base = CASA_REGION_PHOTOS[regionId] || CASA_REGION_PHOTOS['lake-district'];
  return casaPhotoUrl(base, width || 900);
}

function casaGetPropertyPhoto(property, width) {
  if (!property) return casaGetRegionPhoto('lake-district', width);
  if (property.img) return casaPhotoUrl(property.img, width);
  if (CASA_PROPERTY_PHOTO_OVERRIDES[property.id]) {
    return casaPhotoUrl(CASA_PROPERTY_PHOTO_OVERRIDES[property.id], width);
  }
  const region = casaGetRegionPhoto(property.region, width);
  const typePool = CASA_TYPE_PHOTOS[property.type];
  if (typePool?.length) {
    return casaPhotoUrl(typePool[property.id % typePool.length], width);
  }
  return region;
}

function casaGetPropertyGallery(property, count) {
  const n = count || 5;
  const main = casaGetPropertyPhoto(property, 1200);
  const extras = CASA_TYPE_PHOTOS[property.type] || [];
  const region = CASA_REGION_PHOTOS[property.region];
  const list = [main];
  extras.forEach(u => { if (list.length < n) list.push(casaPhotoUrl(u, 900)); });
  if (region && list.length < n) list.push(casaPhotoUrl(region, 900));
  while (list.length < n) list.push(main);
  return list.slice(0, n);
}

function casaPhotoStyle(property, width) {
  const url = typeof property === 'object' ? casaGetPropertyPhoto(property, width) : property;
  return `background-image:url('${url}');background-size:cover;background-position:center;`;
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
