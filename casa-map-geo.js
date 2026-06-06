/**
 * Casa map — detailed region & sub-area polygons (GeoJSON-style rings)
 * Loaded before casa-map-data.js; merged into CASA_MAP_REGIONS at runtime.
 */
const CASA_MAP_GEO = {
  'lake-district': {
    polygon: [
      [54.68, -3.42], [54.72, -3.15], [54.65, -2.85], [54.58, -2.55], [54.48, -2.42],
      [54.35, -2.48], [54.22, -2.72], [54.15, -2.95], [54.12, -3.18], [54.18, -3.35],
      [54.28, -3.45], [54.42, -3.48], [54.55, -3.44],
    ],
    subareas: {
      windermere: {
        label: 'Windermere & Bowness',
        towns: ['Windermere', 'Bowness', 'Troutbeck', 'Staveley'],
        bounds: [[54.28, -2.98], [54.42, -2.82]],
        polygon: [[54.40, -2.96], [54.38, -2.84], [54.30, -2.86], [54.28, -2.94], [54.34, -2.98]],
      },
      ambleside: {
        label: 'Ambleside & Grasmere',
        towns: ['Ambleside', 'Grasmere', 'Rydal', 'Elterwater'],
        bounds: [[54.38, -3.08], [54.48, -2.88]],
        polygon: [[54.46, -3.06], [54.45, -2.90], [54.40, -2.88], [54.38, -3.00], [54.42, -3.08]],
      },
      keswick: {
        label: 'Keswick & Derwent',
        towns: ['Keswick', 'Derwent', 'Threlkeld', 'Bassenthwaite'],
        bounds: [[54.58, -3.22], [54.68, -2.98]],
        polygon: [[54.66, -3.20], [54.65, -3.00], [54.60, -2.98], [54.58, -3.12], [54.62, -3.22]],
      },
      coniston: {
        label: 'Coniston & Grizedale',
        towns: ['Coniston', 'Grizedale', 'Torver', 'Hawkshead'],
        bounds: [[54.30, -3.12], [54.42, -2.92]],
        polygon: [[54.38, -3.10], [54.36, -2.94], [54.32, -2.96], [54.30, -3.08], [54.35, -3.12]],
      },
      buttermere: {
        label: 'Buttermere & Ennerdale',
        towns: ['Buttermere', 'Ennerdale', 'Lorton', 'Loweswater'],
        bounds: [[54.52, -3.38], [54.62, -3.18]],
        polygon: [[54.60, -3.36], [54.58, -3.20], [54.54, -3.18], [54.52, -3.30], [54.56, -3.38]],
      },
      ullswater: {
        label: 'Ullswater & Penrith',
        towns: ['Ullswater', 'Penrith', 'Pooley Bridge', 'Glenridding'],
        bounds: [[54.52, -2.95], [54.68, -2.72]],
        polygon: [[54.66, -2.92], [54.64, -2.74], [54.56, -2.72], [54.52, -2.85], [54.58, -2.95]],
      },
    },
  },
  cornwall: {
    polygon: [
      [50.52, -5.72], [50.48, -5.35], [50.42, -4.85], [50.28, -4.18], [50.08, -4.15],
      [49.98, -4.55], [49.96, -5.15], [50.05, -5.55], [50.22, -5.75], [50.38, -5.78],
    ],
    subareas: {
      'far-west': {
        label: 'Land\'s End & Penwith',
        towns: ['Zennor', 'St Ives', 'Porthcurno', 'Mousehole', 'Penzance'],
        bounds: [[49.98, -5.75], [50.22, -5.15]],
        polygon: [[50.18, -5.70], [50.12, -5.35], [50.05, -5.15], [50.00, -5.45], [50.08, -5.72]],
      },
      south: {
        label: 'South Coast & Lizard',
        towns: ['Fowey', 'St Agnes', 'Helston', 'Lizard'],
        bounds: [[49.98, -5.25], [50.28, -4.65]],
        polygon: [[50.22, -5.20], [50.18, -4.70], [50.05, -4.68], [50.00, -5.05], [50.12, -5.22]],
      },
      north: {
        label: 'North Coast & Padstow',
        towns: ['Padstow', 'Newquay', 'Bude', 'Tintagel'],
        bounds: [[50.48, -5.05], [50.58, -4.55]],
        polygon: [[50.55, -5.00], [50.52, -4.58], [50.48, -4.60], [50.50, -4.95]],
      },
      truro: {
        label: 'Truro & Roseland',
        towns: ['Truro', 'Falmouth', 'St Mawes', 'Tregothnan'],
        bounds: [[50.18, -5.15], [50.32, -4.85]],
        polygon: [[50.28, -5.10], [50.26, -4.88], [50.20, -4.90], [50.18, -5.05], [50.24, -5.12]],
      },
    },
  },
  norfolk: {
    polygon: [
      [52.98, 0.18], [52.96, 0.55], [52.88, 0.95], [52.72, 1.28], [52.52, 1.32],
      [52.48, 1.05], [52.50, 0.65], [52.55, 0.35], [52.68, 0.20], [52.85, 0.15],
    ],
    subareas: {
      coast: {
        label: 'North Norfolk Coast',
        towns: ['Wells-next-the-Sea', 'Burnham Overy', 'Blakeney', 'Brancaster', 'Hunstanton'],
        bounds: [[52.82, 0.45], [52.98, 0.95]],
        polygon: [[52.96, 0.48], [52.94, 0.88], [52.86, 0.92], [52.84, 0.62], [52.90, 0.46]],
      },
      broads: {
        label: 'The Broads',
        towns: ['Norwich', 'Wroxham', 'Horning', 'Acle'],
        bounds: [[52.55, 1.25], [52.72, 1.55]],
        polygon: [[52.70, 1.28], [52.68, 1.50], [52.58, 1.52], [52.56, 1.35], [52.62, 1.26]],
      },
      breckland: {
        label: 'Breckland & Thetford',
        towns: ['Thetford', 'Swaffham', 'Dereham'],
        bounds: [[52.45, 0.55], [52.62, 0.95]],
        polygon: [[52.60, 0.58], [52.58, 0.88], [52.50, 0.90], [52.48, 0.65], [52.54, 0.56]],
      },
    },
  },
  yorkshire: {
    polygon: [
      [54.48, -2.65], [54.42, -2.35], [54.28, -1.85], [54.05, -1.45], [53.78, -0.95],
      [53.68, -0.55], [53.72, -0.35], [53.85, -0.42], [54.05, -0.85], [54.22, -1.55],
      [54.35, -2.15], [54.42, -2.45],
    ],
    subareas: {
      dales: {
        label: 'Yorkshire Dales',
        towns: ['Wharfedale', 'Wensleydale', 'Swaledale', 'Malham'],
        bounds: [[54.05, -2.55], [54.35, -1.85]],
        polygon: [[54.32, -2.50], [54.28, -1.90], [54.12, -1.88], [54.08, -2.35], [54.18, -2.52]],
      },
      moors: {
        label: 'North York Moors',
        towns: ['Goathland', 'Whitby', 'Pickering', 'Helmsley'],
        bounds: [[54.28, -1.05], [54.48, -0.55]],
        polygon: [[54.45, -1.00], [54.42, -0.60], [54.32, -0.58], [54.30, -0.95], [54.38, -1.02]],
      },
      coast: {
        label: 'Heritage Coast',
        towns: ['Whitby', 'Scarborough', 'Robin Hood\'s Bay', 'Filey'],
        bounds: [[54.15, -0.55], [54.35, 0.05]],
        polygon: [[54.32, -0.50], [54.28, 0.00], [54.18, -0.02], [54.16, -0.45], [54.24, -0.52]],
      },
    },
  },
  cotswolds: {
    polygon: [
      [52.08, -2.22], [52.06, -1.95], [52.02, -1.65], [51.88, -1.42], [51.72, -1.48],
      [51.68, -1.72], [51.72, -1.95], [51.82, -2.12], [51.95, -2.20],
    ],
    subareas: {
      north: {
        label: 'North Cotswolds',
        towns: ['Chipping Campden', 'Broadway', 'Stow-on-the-Wold'],
        bounds: [[51.95, -1.95], [52.08, -1.55]],
        polygon: [[52.06, -1.92], [52.04, -1.58], [51.98, -1.56], [51.96, -1.88], [52.02, -1.94]],
      },
      central: {
        label: 'Central Cotswolds',
        towns: ['Bourton-on-the-Water', 'Stow', 'Lower Slaughter', 'Bourton-on-the-Hill'],
        bounds: [[51.82, -1.95], [51.98, -1.65]],
        polygon: [[51.96, -1.92], [51.94, -1.68], [51.86, -1.66], [51.84, -1.88], [51.90, -1.94]],
      },
      south: {
        label: 'South Cotswolds',
        towns: ['Cirencester', 'Tetbury', 'Malmesbury'],
        bounds: [[51.62, -2.15], [51.82, -1.85]],
        polygon: [[51.78, -2.12], [51.76, -1.88], [51.66, -1.86], [51.64, -2.08], [51.72, -2.14]],
      },
    },
  },
  highlands: {
    polygon: [
      [58.15, -6.15], [57.95, -5.55], [57.75, -4.85], [57.45, -4.25], [57.05, -3.95],
      [56.82, -4.35], [56.78, -5.05], [56.85, -5.65], [57.15, -6.05], [57.55, -6.18],
      [57.85, -6.12],
    ],
    subareas: {
      glencoe: {
        label: 'Glencoe & Lochaber',
        towns: ['Glencoe', 'Fort William', 'Ballachulish', 'Kinlochleven'],
        bounds: [[56.65, -5.35], [56.95, -4.85]],
        polygon: [[56.92, -5.30], [56.88, -4.88], [56.72, -4.90], [56.68, -5.22], [56.82, -5.32]],
      },
      cairngorms: {
        label: 'Cairngorms',
        towns: ['Aviemore', 'Cairngorms', 'Grantown', 'Kingussie'],
        bounds: [[57.05, -4.05], [57.35, -3.45]],
        polygon: [[57.32, -4.00], [57.28, -3.50], [57.10, -3.48], [57.08, -3.95], [57.22, -4.02]],
      },
      torridon: {
        label: 'Wester Ross & Torridon',
        towns: ['Torridon', 'Gairloch', 'Ullapool', 'Applecross'],
        bounds: [[57.45, -5.75], [57.85, -5.15]],
        polygon: [[57.82, -5.70], [57.78, -5.20], [57.52, -5.18], [57.48, -5.62], [57.65, -5.72]],
      },
      lochness: {
        label: 'Loch Ness & Inverness',
        towns: ['Drumnadrochit', 'Inverness', 'Fort Augustus', 'Beauly'],
        bounds: [[57.25, -4.65], [57.55, -4.05]],
        polygon: [[57.52, -4.60], [57.48, -4.10], [57.30, -4.08], [57.28, -4.55], [57.40, -4.62]],
      },
    },
  },
  skye: {
    polygon: [
      [57.72, -6.82], [57.68, -6.35], [57.58, -5.95], [57.42, -5.72], [57.12, -5.78],
      [57.05, -6.15], [57.08, -6.55], [57.22, -6.78], [57.45, -6.82], [57.62, -6.80],
    ],
    subareas: {
      trotternish: {
        label: 'Trotternish Peninsula',
        towns: ['Trotternish', 'Portree', 'Staffin', 'Uig'],
        bounds: [[57.45, -6.35], [57.72, -5.85]],
        polygon: [[57.68, -6.30], [57.62, -5.90], [57.50, -5.88], [57.48, -6.25], [57.58, -6.32]],
      },
      cuillin: {
        label: 'Cuillin & Sleat',
        towns: ['Sligachan', 'Broadford', 'Armadale', 'Elgol'],
        bounds: [[57.12, -6.55], [57.35, -5.95]],
        polygon: [[57.32, -6.50], [57.28, -6.00], [57.18, -5.98], [57.14, -6.45], [57.24, -6.52]],
      },
    },
  },
  snowdonia: {
    polygon: [
      [53.20, -4.32], [53.18, -4.05], [53.12, -3.72], [52.88, -3.68], [52.78, -3.85],
      [52.75, -4.08], [52.82, -4.25], [52.95, -4.30], [53.08, -4.32],
    ],
    subareas: {
      llanberis: {
        label: 'Llanberis & Padarn',
        towns: ['Llanberis', 'Padarn', 'Dinorwig', 'Nant Peris'],
        bounds: [[53.08, -4.18], [53.18, -3.95]],
        polygon: [[53.16, -4.15], [53.14, -3.98], [53.10, -3.96], [53.08, -4.12], [53.12, -4.16]],
      },
      betws: {
        label: 'Betws-y-Coed & Conwy',
        towns: ['Betws-y-Coed', 'Capel Curig', 'Conwy', 'Llanrwst'],
        bounds: [[53.02, -3.95], [53.15, -3.72]],
        polygon: [[53.12, -3.92], [53.10, -3.75], [53.04, -3.74], [53.02, -3.88], [53.08, -3.94]],
      },
      coast: {
        label: 'Coastal Snowdonia',
        towns: ['Barmouth', 'Harlech', 'Porthmadog', 'Criccieth'],
        bounds: [[52.82, -4.25], [52.98, -3.95]],
        polygon: [[52.95, -4.22], [52.92, -3.98], [52.85, -3.96], [52.84, -4.18], [52.90, -4.24]],
      },
    },
  },
  pembrokeshire: {
    polygon: [
      [51.98, -5.32], [51.95, -5.05], [51.88, -4.72], [51.72, -4.58], [51.58, -4.72],
      [51.55, -5.05], [51.62, -5.25], [51.78, -5.30], [51.90, -5.32],
    ],
    subareas: {
      north: {
        label: 'St Davids & North Coast',
        towns: ['St Davids', 'Fishguard', 'Newport', 'Porthgain'],
        bounds: [[51.85, -5.32], [52.02, -4.95]],
        polygon: [[51.98, -5.28], [51.95, -4.98], [51.88, -4.96], [51.86, -5.22], [51.92, -5.30]],
      },
      south: {
        label: 'South Coast & Marloes',
        towns: ['Marloes', 'Tenby', 'Pembroke', 'Manorbier'],
        bounds: [[51.55, -5.05], [51.72, -4.55]],
        polygon: [[51.68, -5.00], [51.65, -4.58], [51.58, -4.60], [51.56, -4.95], [51.62, -5.02]],
      },
      islands: {
        label: 'Islands & Estuaries',
        towns: ['Solva', 'Skomer', 'Milford Haven', 'Neyland'],
        bounds: [[51.68, -5.25], [51.82, -4.85]],
        polygon: [[51.78, -5.20], [51.75, -4.88], [51.70, -4.86], [51.68, -5.12], [51.74, -5.22]],
      },
    },
  },
  causeway: {
    polygon: [
      [55.28, -6.72], [55.25, -6.45], [55.18, -6.15], [55.02, -5.95], [54.82, -5.92],
      [54.78, -6.25], [54.82, -6.55], [55.02, -6.68], [55.15, -6.72],
    ],
    subareas: {
      causeway: {
        label: 'Giant\'s Causeway',
        towns: ['Bushmills', 'Ballintoy', 'Dunluce', 'Portballintrae'],
        bounds: [[55.12, -6.55], [55.28, -6.25]],
        polygon: [[55.25, -6.50], [55.22, -6.28], [55.15, -6.26], [55.14, -6.48], [55.20, -6.52]],
      },
      glens: {
        label: 'Glens & Dark Hedges',
        towns: ['Armoy', 'Ballymoney', 'Ballycastle', 'Cushendun'],
        bounds: [[54.95, -6.35], [55.15, -6.05]],
        polygon: [[55.12, -6.30], [55.08, -6.08], [54.98, -6.06], [54.96, -6.28], [55.05, -6.32]],
      },
    },
  },
};

/** Merge detailed polygons into CASA_MAP_REGIONS and attach subareas */
function casaMapApplyGeo() {
  if (typeof CASA_MAP_REGIONS === 'undefined') return;
  Object.keys(CASA_MAP_GEO).forEach(regionId => {
    const geo = CASA_MAP_GEO[regionId];
    const region = CASA_MAP_REGIONS[regionId];
    if (!region || !geo) return;
    if (geo.polygon?.length) region.polygon = geo.polygon;
    region.subareas = geo.subareas || {};
  });
}

function casaMapResolveSubarea(item) {
  const regionId = item.region;
  const region = CASA_MAP_REGIONS[regionId];
  if (!region?.subareas) return null;
  const loc = String(item.loc || item.where || '').toLowerCase();
  for (const [id, sa] of Object.entries(region.subareas)) {
    if (sa.towns?.some(t => loc.includes(String(t).toLowerCase()))) return id;
  }
  return null;
}

function casaMapGetSubarea(regionId, subareaId) {
  return CASA_MAP_REGIONS[regionId]?.subareas?.[subareaId] || null;
}

function casaMapCountForSubarea(regionId, subareaId) {
  const sa = casaMapGetSubarea(regionId, subareaId);
  if (!sa) return { stays: 0, feed: 0 };
  const props = typeof casaMapGetProperties === 'function' ? casaMapGetProperties() : (typeof CASA_PROPERTIES !== 'undefined' ? CASA_PROPERTIES : []);
  const feed = typeof casaMapGetFeed === 'function' ? casaMapGetFeed() : (typeof CASA_MAP_FEED !== 'undefined' ? CASA_MAP_FEED : []);
  const matchLoc = p => sa.towns?.some(t => String(p.loc || '').toLowerCase().includes(String(t).toLowerCase()));
  return {
    stays: props.filter(p => p.region === regionId && matchLoc(p)).length,
    feed: feed.filter(f => f.region === regionId && (matchLoc(f) || (f.propertyId && matchLoc(props.find(x => x.id === f.propertyId) || {})))).length,
  };
}

window.casaMapApplyGeo = casaMapApplyGeo;
window.casaMapResolveSubarea = casaMapResolveSubarea;
window.casaMapGetSubarea = casaMapGetSubarea;
window.casaMapCountForSubarea = casaMapCountForSubarea;
