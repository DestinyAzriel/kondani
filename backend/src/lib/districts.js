// All 28 districts of Malawi with approximate centre coordinates.
// Used as a free fallback when the browser Geolocation API is unavailable
// or the user declines location access. Distance is then computed with the
// Haversine formula (see lib/geo.js) — no paid maps API required.
export const MALAWI_DISTRICTS = {
  // Northern Region
  chitipa:     { name: 'Chitipa',     region: 'Northern', lat: -9.7019,  lon: 33.2700 },
  karonga:     { name: 'Karonga',     region: 'Northern', lat: -9.9333,  lon: 33.9333 },
  rumphi:      { name: 'Rumphi',      region: 'Northern', lat: -11.0186, lon: 33.8580 },
  nkhatabay:   { name: 'Nkhata Bay',  region: 'Northern', lat: -11.6064, lon: 34.2961 },
  mzimba:      { name: 'Mzimba',      region: 'Northern', lat: -11.9000, lon: 33.6000 },
  mzuzu:       { name: 'Mzuzu',       region: 'Northern', lat: -11.4581, lon: 34.0151 },
  likoma:      { name: 'Likoma',      region: 'Northern', lat: -12.0667, lon: 34.7333 },

  // Central Region
  kasungu:     { name: 'Kasungu',     region: 'Central',  lat: -13.0333, lon: 33.4833 },
  nkhotakota:  { name: 'Nkhotakota',  region: 'Central',  lat: -12.9274, lon: 34.2961 },
  ntchisi:     { name: 'Ntchisi',     region: 'Central',  lat: -13.3667, lon: 33.9167 },
  dowa:        { name: 'Dowa',        region: 'Central',  lat: -13.6533, lon: 33.9408 },
  salima:      { name: 'Salima',      region: 'Central',  lat: -13.7804, lon: 34.4587 },
  lilongwe:    { name: 'Lilongwe',    region: 'Central',  lat: -13.9833, lon: 33.7833 },
  mchinji:     { name: 'Mchinji',     region: 'Central',  lat: -13.7989, lon: 32.8800 },
  dedza:       { name: 'Dedza',       region: 'Central',  lat: -14.3786, lon: 34.3331 },
  ntcheu:      { name: 'Ntcheu',      region: 'Central',  lat: -14.8167, lon: 34.6333 },

  // Southern Region
  mangochi:    { name: 'Mangochi',    region: 'Southern', lat: -14.4667, lon: 35.2667 },
  machinga:    { name: 'Machinga',    region: 'Southern', lat: -14.9667, lon: 35.5167 },
  zomba:       { name: 'Zomba',       region: 'Southern', lat: -15.3869, lon: 35.3192 },
  chiradzulu:  { name: 'Chiradzulu',  region: 'Southern', lat: -15.7000, lon: 35.1500 },
  blantyre:    { name: 'Blantyre',    region: 'Southern', lat: -15.7861, lon: 35.0058 },
  mwanza:      { name: 'Mwanza',      region: 'Southern', lat: -15.6000, lon: 34.5167 },
  neno:        { name: 'Neno',        region: 'Southern', lat: -15.3980, lon: 34.6530 },
  thyolo:      { name: 'Thyolo',      region: 'Southern', lat: -16.0700, lon: 35.1400 },
  mulanje:     { name: 'Mulanje',     region: 'Southern', lat: -16.0319, lon: 35.5083 },
  phalombe:    { name: 'Phalombe',    region: 'Southern', lat: -15.8060, lon: 35.6530 },
  chikwawa:    { name: 'Chikwawa',    region: 'Southern', lat: -16.0353, lon: 34.8000 },
  nsanje:      { name: 'Nsanje',      region: 'Southern', lat: -16.9200, lon: 35.2620 }
}

export function districtList() {
  return Object.entries(MALAWI_DISTRICTS).map(([key, d]) => ({ key, ...d }))
}
