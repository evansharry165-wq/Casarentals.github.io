/** Shared property catalogue — used by browse, map, property, feed, saved */
const CASA_PROPERTIES = [
  {id:1,title:'Stone Cottage',loc:'Windermere',region:'lake-district',rLabel:'Lake District',type:'cottage',price:175,rating:4.9,reviews:23,sleeps:6,beds:3,tags:['woodburner','pets','parking'],badge:'verified',col:'#C8A882',mapCol:'warm',mapX:132,mapY:222},
  {id:2,title:'Slate Barn',loc:'Ambleside',region:'lake-district',rLabel:'Lake District',type:'barn',price:215,rating:4.8,reviews:11,sleeps:4,beds:2,tags:['hottub','sauna'],badge:'new',col:'#8DA88A',mapCol:'sage',mapX:142,mapY:232},
  {id:3,title:'Lakeside Cabin',loc:'Coniston',region:'lake-district',rLabel:'Lake District',type:'cabin',price:145,rating:5.0,reviews:34,sleeps:2,beds:1,tags:['romantic'],col:'#8A7DB0',mapCol:'cool',mapX:128,mapY:238},
  {id:4,title:'Georgian House',loc:'Keswick',region:'lake-district',rLabel:'Lake District',type:'cottage',price:240,rating:4.9,reviews:47,sleeps:8,beds:4,tags:['garden','parking'],badge:'verified',col:'#A8B4C0',mapCol:'fog',mapX:138,mapY:214},
  {id:5,title:"Shepherd's Hut",loc:'Buttermere',region:'lake-district',rLabel:'Lake District',type:'glamping',price:95,rating:4.7,reviews:8,sleeps:2,beds:1,tags:['offgrid'],col:'#7BA0B4',mapCol:'dusk',mapX:122,mapY:225},
  {id:6,title:"Miller's Cottage",loc:'Grasmere',region:'lake-district',rLabel:'Lake District',type:'cottage',price:165,rating:4.8,reviews:19,sleeps:4,beds:2,tags:['woodburner'],col:'#3C3830',mapCol:'ink',mapX:135,mapY:228},
  {id:7,title:'The Granary',loc:'Hawkshead',region:'lake-district',rLabel:'Lake District',type:'farmhouse',price:195,rating:4.9,reviews:56,sleeps:5,beds:3,tags:['pets','woodburner'],badge:'editors',col:'#B05533',mapCol:'brick',mapX:138,mapY:234},
  {id:8,title:'Hillside Farmhouse',loc:'Grizedale',region:'lake-district',rLabel:'Lake District',type:'farmhouse',price:385,rating:4.6,reviews:14,sleeps:10,beds:5,tags:['hottub','garden'],col:'#C8A882',mapCol:'warm',mapX:144,mapY:238},
  {id:9,title:'Cliffside Cottage',loc:'Porthcurno',region:'cornwall',rLabel:'Cornwall',type:'cottage',price:210,rating:4.9,reviews:41,sleeps:4,beds:2,tags:['seaview','woodburner'],badge:'verified',col:'#8A7DB0',mapCol:'cool',mapX:94,mapY:445},
  {id:10,title:'Tregothnan Lodge',loc:'Truro',region:'cornwall',rLabel:'Cornwall',type:'cabin',price:320,rating:4.8,reviews:22,sleeps:8,beds:4,tags:['hottub','garden','pets'],col:'#8DA88A',mapCol:'sage',mapX:108,mapY:434},
  {id:11,title:'Harbour Cottage',loc:'Mousehole',region:'cornwall',rLabel:'Cornwall',type:'cottage',price:155,rating:4.9,reviews:63,sleeps:3,beds:2,tags:['seaview'],badge:'editors',col:'#7BA0B4',mapCol:'dusk',mapX:92,mapY:443},
  {id:12,title:'St Agnes Farmhouse',loc:'St Agnes',region:'cornwall',rLabel:'Cornwall',type:'farmhouse',price:185,rating:4.7,reviews:18,sleeps:6,beds:3,tags:['woodburner','pets'],col:'#C8A882',mapCol:'warm',mapX:100,mapY:438},
  {id:13,title:'The Boathouse',loc:'Fowey',region:'cornwall',rLabel:'Cornwall',type:'houseboat',price:175,rating:5.0,reviews:29,sleeps:2,beds:1,tags:['seaview','romantic'],badge:'verified',col:'#A8B4C0',mapCol:'cool',mapX:113,mapY:437},
  {id:14,title:'Mizen Shepherd Hut',loc:'Zennor',region:'cornwall',rLabel:'Cornwall',type:'glamping',price:115,rating:4.8,reviews:12,sleeps:2,beds:1,tags:['offgrid','seaview'],col:'#8A7DB0',mapCol:'fog',mapX:88,mapY:440},
  {id:15,title:'Restored Blackhouse',loc:'Trotternish',region:'highlands',rLabel:'Isle of Skye',type:'cottage',price:195,rating:4.9,reviews:31,sleeps:4,beds:2,tags:['offgrid','hottub','seaview'],badge:'verified',col:'#7BA0B4',mapCol:'cool',mapX:98,mapY:72},
  {id:16,title:'Glen Coe Bothy',loc:'Glencoe',region:'highlands',rLabel:'Highlands',type:'cabin',price:130,rating:4.7,reviews:15,sleeps:3,beds:2,tags:['woodburner','offgrid'],col:'#A8B4C0',mapCol:'fog',mapX:132,mapY:88},
  {id:17,title:'Loch Ness Lodge',loc:'Drumnadrochit',region:'highlands',rLabel:'Highlands',type:'cabin',price:280,rating:4.8,reviews:44,sleeps:6,beds:3,tags:['seaview','hottub'],col:'#8DA88A',mapCol:'sage',mapX:148,mapY:62},
  {id:18,title:'Croft House',loc:'Torridon',region:'highlands',rLabel:'Highlands',type:'farmhouse',price:165,rating:4.9,reviews:27,sleeps:4,beds:2,tags:['woodburner','pets'],badge:'verified',col:'#C8A882',mapCol:'warm',mapX:118,mapY:55},
  {id:19,title:'Isle of Skye Hideaway',loc:'Portree',region:'skye',rLabel:'Isle of Skye',type:'cottage',price:220,rating:5.0,reviews:38,sleeps:2,beds:1,tags:['seaview','offgrid'],badge:'editors',col:'#8A7DB0',mapCol:'cool',mapX:93,mapY:73},
  {id:20,title:'Burnham Overy Barn',loc:'Burnham Overy',region:'norfolk',rLabel:'Norfolk',type:'barn',price:195,rating:4.8,reviews:33,sleeps:6,beds:3,tags:['seaview','pets'],badge:'verified',col:'#C8A882',mapCol:'warm',mapX:218,mapY:282},
  {id:21,title:'The Granary',loc:'Wells-next-the-Sea',region:'norfolk',rLabel:'Norfolk',type:'farmhouse',price:145,rating:4.7,reviews:21,sleeps:4,beds:2,tags:['woodburner','garden'],col:'#8DA88A',mapCol:'sage',mapX:224,mapY:278},
  {id:22,title:'Saltmarsh Cabin',loc:'Blakeney',region:'norfolk',rLabel:'Norfolk',type:'cabin',price:110,rating:4.6,reviews:9,sleeps:2,beds:1,tags:['seaview','offgrid'],col:'#7BA0B4',mapCol:'cool',mapX:230,mapY:284},
  {id:23,title:'Brancaster Hall',loc:'Brancaster',region:'norfolk',rLabel:'Norfolk',type:'manor',price:450,rating:4.9,reviews:17,sleeps:12,beds:6,tags:['garden','hottub'],badge:'editors',col:'#3C3830',mapCol:'ink',mapX:215,mapY:277},
  {id:24,title:'Moorland Cottage',loc:'Goathland',region:'yorkshire',rLabel:'N. Yorkshire',type:'cottage',price:160,rating:4.8,reviews:28,sleeps:4,beds:2,tags:['woodburner','pets'],badge:'verified',col:'#C8A882',mapCol:'warm',mapX:185,mapY:248},
  {id:25,title:'Dales Farmhouse',loc:'Wharfedale',region:'yorkshire',rLabel:'Yorkshire Dales',type:'farmhouse',price:225,rating:4.9,reviews:52,sleeps:8,beds:4,tags:['hottub','garden','pets'],badge:'editors',col:'#8A7DB0',mapCol:'cool',mapX:175,mapY:244},
  {id:26,title:'The Old Forge',loc:'Whitby',region:'yorkshire',rLabel:'N. Yorkshire',type:'cottage',price:135,rating:4.7,reviews:14,sleeps:3,beds:2,tags:['seaview','woodburner'],col:'#A8B4C0',mapCol:'fog',mapX:195,mapY:240},
  {id:27,title:'Honeysuckle Cottage',loc:'Bourton-on-the-Water',region:'cotswolds',rLabel:'Cotswolds',type:'cottage',price:195,rating:4.9,reviews:44,sleeps:4,beds:2,tags:['woodburner','garden'],badge:'verified',col:'#C8A882',mapCol:'warm',mapX:172,mapY:338},
  {id:28,title:'Chipping Manor',loc:'Chipping Campden',region:'cotswolds',rLabel:'Cotswolds',type:'manor',price:550,rating:5.0,reviews:19,sleeps:14,beds:7,tags:['garden','hottub'],badge:'editors',col:'#8DA88A',mapCol:'sage',mapX:180,mapY:333},
  {id:29,title:'The Old Mill',loc:'Bourton-on-the-Hill',region:'cotswolds',rLabel:'Cotswolds',type:'farmhouse',price:175,rating:4.8,reviews:31,sleeps:5,beds:3,tags:['woodburner','pets'],col:'#8A7DB0',mapCol:'dusk',mapX:178,mapY:344},
  {id:30,title:'Pembroke Cliffside',loc:'St Davids',region:'pembrokeshire',rLabel:'Pembrokeshire',type:'cottage',price:175,rating:4.9,reviews:36,sleeps:4,beds:2,tags:['seaview','woodburner'],badge:'verified',col:'#7BA0B4',mapCol:'cool',mapX:87,mapY:342},
  {id:31,title:'The Boathouse',loc:'Solva',region:'pembrokeshire',rLabel:'Pembrokeshire',type:'houseboat',price:155,rating:4.8,reviews:18,sleeps:2,beds:1,tags:['seaview','romantic'],col:'#8A7DB0',mapCol:'dusk',mapX:94,mapY:345},
  {id:32,title:'Coast Path Glamping',loc:'Marloes',region:'pembrokeshire',rLabel:'Pembrokeshire',type:'glamping',price:90,rating:4.7,reviews:11,sleeps:2,beds:1,tags:['seaview','offgrid'],col:'#8DA88A',mapCol:'sage',mapX:82,mapY:348},
  {id:33,title:'Hafod Cottage',loc:'Betws-y-Coed',region:'snowdonia',rLabel:'Snowdonia',type:'cottage',price:145,rating:4.8,reviews:24,sleeps:4,beds:2,tags:['woodburner','pets'],badge:'verified',col:'#C8A882',mapCol:'warm',mapX:122,mapY:294},
  {id:34,title:'Llyn Padarn Cabin',loc:'Llanberis',region:'snowdonia',rLabel:'Snowdonia',type:'cabin',price:185,rating:4.9,reviews:39,sleeps:4,beds:2,tags:['seaview','hottub'],badge:'editors',col:'#7BA0B4',mapCol:'cool',mapX:115,mapY:298},
  {id:35,title:"Giant's Causeway Cottage",loc:'Bushmills',region:'causeway',rLabel:'Causeway Coast',type:'cottage',price:165,rating:4.9,reviews:22,sleeps:4,beds:2,tags:['seaview','woodburner'],badge:'verified',col:'#A8B4C0',mapCol:'fog',mapX:82,mapY:148},
  {id:36,title:'Dark Hedges Farmhouse',loc:'Armoy',region:'causeway',rLabel:'Antrim',type:'farmhouse',price:190,rating:4.8,reviews:15,sleeps:6,beds:3,tags:['woodburner','pets'],col:'#C8A882',mapCol:'warm',mapX:92,mapY:155},
];

function getCasaProperty(id) {
  const num = parseInt(id, 10);
  return CASA_PROPERTIES.find(p => p.id === num) || CASA_PROPERTIES[0];
}

function getCasaPropertyIdByTitle(title) {
  if (!title) return 1;
  const norm = title.toLowerCase().trim();
  const exact = CASA_PROPERTIES.find(p => p.title.toLowerCase() === norm);
  if (exact) return exact.id;
  const partial = CASA_PROPERTIES.find(p =>
    norm.includes(p.title.toLowerCase()) || p.title.toLowerCase().includes(norm)
  );
  return partial ? partial.id : 1;
}

function casaPropertyUrl(id) {
  return `property.html?id=${id}`;
}

function getCasaPropertiesByRegion(regionKey) {
  if (!regionKey || regionKey === 'all') return CASA_PROPERTIES.slice();
  return CASA_PROPERTIES.filter(p => p.region === regionKey);
}

function searchCasaProperties(query, regionKey) {
  const q = (query || '').toLowerCase().trim();
  let list = getCasaPropertiesByRegion(regionKey);
  if (!q) return list;
  return list.filter(p =>
    p.title.toLowerCase().includes(q) ||
    p.loc.toLowerCase().includes(q) ||
    p.rLabel.toLowerCase().includes(q) ||
    p.tags.some(t => t.includes(q))
  );
}

const CASA_TYPE_LABELS = {
  cottage: 'Cottage', barn: 'Barn', cabin: 'Cabin', glamping: 'Glamping',
  farmhouse: 'Farmhouse', houseboat: 'Houseboat', manor: 'Manor',
};
