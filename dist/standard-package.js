import {DATA} from './data.js';
import {INTERIOR_REFERENCES} from './interior-references.js';

// These two source photographs were confirmed as standard by Green Village.
export const STANDARD_PACKAGE = Object.freeze({
  confirmedOn: '2026-09-21',
  kitchen: Object.freeze({ref: 'kitchen-14', layout: 'l', title: 'Cozinha standard em L',
    description: 'Cozinha em L da fotografia 14, com móveis inferiores e três gavetas. Fotografia do modelo ainda embalado.',
    limit: 'A película oculta o acabamento da bancada e das frentes. A posição da cuba e da torneira não é visível nesta fotografia.'}),
  bathroom: Object.freeze({ref: 'bathroom-17', layout: 'standard', title: 'Casa de banho standard',
    description: 'Móvel com lavatório integrado à esquerda, sanita ao lado e duche ao fundo com resguardo de correr. Revestimento claro com veios e perfis claros, conforme a fotografia 17.',
    limit: 'Medidas e materiais comerciais exactos por confirmar; a implantação 3D adapta-se à divisão da planta.'}),
});

export const ADAPTATION_REQUESTS = Object.freeze([
  {id: 'kitchen-worktop', kind: 'kitchen', label: 'Alterar a bancada da cozinha'},
  {id: 'kitchen-sink-position', kind: 'kitchen', label: 'Alterar a posição do lava-loiça'},
  {id: 'bathroom-worktop', kind: 'bathroom', label: 'Alterar a bancada ou o móvel do lavatório'},
  {id: 'bathroom-basin-position', kind: 'bathroom', label: 'Alterar a posição do lavatório'},
  {id: 'bathroom-extension', kind: 'bathroom', label: 'Ampliar a casa de banho para o lavatório'},
]);

export function validateAdaptationRequests(value = []) {
  if (!Array.isArray(value) || value.length > ADAPTATION_REQUESTS.length || new Set(value).size !== value.length ||
      value.some(id => !ADAPTATION_REQUESTS.some(item => item.id === id))) {
    throw new Error('Pedido de personalização inválido ou repetido.');
  }
  return [...value].sort();
}

export function adaptationEstimate(state) {
  const lines = new Map();
  const add = (id, kind, label, detail, source) => lines.set(id, {id, kind, label, detail, source, priceCents: null});
  for (const id of validateAdaptationRequests(state.adaptationRequests)) {
    const item = ADAPTATION_REQUESTS.find(item => item.id === id);
    add(id, item.kind, item.label, 'Especificações e acréscimo a definir com a Green Village.', 'Pedido do cliente');
  }
  if (state.kitchen && state.kitchen !== STANDARD_PACKAGE.kitchen.layout) {
    add('kitchen-layout', 'kitchen', 'Alteração da implantação da cozinha',
      ({none: 'Sem cozinha representada; fornecimento e eventual ajuste do preço a acordar.', linear: 'Implantação linear.', u: 'Implantação em U.', island: 'Implantação com ilha.'})[state.kitchen], 'Configuração seleccionada');
  }
  if (state.kitchen !== 'none' && state.kitchenRef && state.kitchenRef !== STANDARD_PACKAGE.kitchen.ref) {
    add('kitchen-reference', 'kitchen', 'Cozinha alternativa ao standard',
      'Referência ' + state.kitchenRef.slice(-2) + ' · ' + INTERIOR_REFERENCES[state.kitchenRef].name, 'Configuração seleccionada');
  }
  if (state.bathroomRef && state.bathroomRef !== STANDARD_PACKAGE.bathroom.ref) {
    add('bathroom-reference', 'bathroom', 'Banho alternativo ao standard',
      'Referência ' + state.bathroomRef.slice(-2) + ' · ' + INTERIOR_REFERENCES[state.bathroomRef].name, 'Configuração seleccionada');
  }
  if (state.bathroom === 'mirrored') {
    add('bathroom-basin-position', 'bathroom', 'Alterar a posição do lavatório',
      'Distribuição espelhada: lavatório e sanita no lado oposto.', 'Configuração seleccionada');
  }
  if (state.bathroomUV) add('bathroom-wall', 'bathroom', 'Alterar o revestimento do banho', DATA.swatches['bathroom-uv'].find(item => item.id === state.bathroomUV)?.label || state.bathroomUV, 'Configuração seleccionada');
  return {lines: [...lines.values()], complete: lines.size === 0};
}

export function standardDescription(kind) {
  const standard = STANDARD_PACKAGE[kind];
  return standard.description + ' Referência standard confirmada pela Green Village em 21/09/2026. ' + standard.limit;
}

export function standardPatch(kind, state) {
  const standard = STANDARD_PACKAGE[kind];
  if (!standard) throw new Error('Composição standard desconhecida.');
  const patch = {
    [kind + 'Ref']: standard.ref,
    [kind]: standard.layout,
    adaptationRequests: validateAdaptationRequests(state.adaptationRequests).filter(id => ADAPTATION_REQUESTS.find(item => item.id === id).kind !== kind),
    optionSelections: (state.optionSelections || []).filter(item => item.id !== (kind === 'kitchen' ? 'kitchen-upper' : 'bathroom-separated')),
  };
  if (kind === 'bathroom') patch.bathroomUV = null;
  return patch;
}

// Only an explicit layout choice applies this adaptation; stored configurations do not.
export function layoutSelectionPatch(layout, state) {
  return layout === 't4-a' && !['linear', 'none'].includes(state.kitchen)
    ? {layout, kitchen: 'linear'} : {layout};
}
