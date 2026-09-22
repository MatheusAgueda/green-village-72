import {DATA} from './data.js';

// July PDF prices remain documentary evidence. DATA contains the later PVP revision.
const currentIds = {
  'door-steel': 'steel-door', 'door-side-glass': 'side-glass-door',
  'door-interior': 'interior-door', 'front-glass-premium': 'glass-front',
  'door-thermal-glass': 'thermal-glass-door', 'wall-3d-metal': 'exterior-3d',
  'interior-bamboo': 'bamboo-interior', 'insulation-rockwool': 'rockwool',
  'insulation-eps': 'eps', 'insulation-pu-floor': 'pu-floor',
  'terrace-canopy': 'terrace', 'bathroom-dry-wet': 'bathroom-separated',
};
export function currentCataloguePrice(documentaryId) {
  const id = currentIds[documentaryId] || documentaryId;
  const item = DATA.options.find(item => item.id === id);
  if (!item) throw new Error('Artigo sem correspondência na tabela actual: ' + documentaryId);
  return {id, value: item.priceEurVatIncluded, currency: 'EUR', vatIncluded: true,
    vatRatePercent: 23, edition: DATA.edition, source: 'Tabela PVP Green Village',
    revisionCommit: 'ba59ec8cfbf6ad3b08c5c9c1ad9575df4c1f1611'};
}
