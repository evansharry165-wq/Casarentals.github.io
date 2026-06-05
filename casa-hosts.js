/** Host personas by region — prototype until public host profiles */

const CASA_HOSTS = {
  'lake-district': { first: 'Sarah', full: 'Sarah R.', initial: 'S' },
  cornwall: { first: 'Rachel', full: 'Rachel B.', initial: 'R' },
  highlands: { first: 'Callum', full: 'Callum D.', initial: 'C' },
  skye: { first: 'Fiona', full: 'Fiona M.', initial: 'F' },
  norfolk: { first: 'Bridget', full: 'Bridget H.', initial: 'B' },
  yorkshire: { first: 'Graham', full: 'Graham & Kate', initial: 'G' },
  cotswolds: { first: 'Hannah', full: 'Hannah F.', initial: 'H' },
  pembrokeshire: { first: 'Elin', full: 'Elin P.', initial: 'E' },
  snowdonia: { first: 'Rhys', full: 'Rhys W.', initial: 'R' },
  causeway: { first: 'Patrick', full: 'Patrick M.', initial: 'P' },
  default: { first: 'Sarah', full: 'Sarah R.', initial: 'S' },
};

function getCasaHostForListing(listing) {
  if (!listing) return { ...CASA_HOSTS.default };
  return { ...(CASA_HOSTS[listing.region] || CASA_HOSTS.default) };
}

window.getCasaHostForListing = getCasaHostForListing;
