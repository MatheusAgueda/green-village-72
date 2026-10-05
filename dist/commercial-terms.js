// Commercial terms supplied directly by Green Village on 2026-10-02.
// The additional on-site period was specified as days, not working days.
export const COMMERCIAL_TERMS=Object.freeze({
 revision:'2026-10-02',
 source:'Green Village · confirmação comercial de 02/10/2026',
 delivery:Object.freeze({minWorkingDays:90,maxWorkingDays:180}),
 onSiteDays:30,
 warranty:Object.freeze({structureYears:10,expansionSystemYears:5,finishesYears:2}),
});

export const COMMERCIAL_COPY=Object.freeze({
 pt:Object.freeze({
  delivery:'90 a 180 dias úteis',
  assemblyLabel:'Montagem e acabamentos no terreno',
  assembly:'Acrescem 30 dias no terreno do cliente para montagem e acabamentos.',
  structure:'10 anos na estrutura',
  expansion:'5 anos no sistema expansível',
  finishes:'2 anos nos acabamentos',
  warranty:'10 anos na estrutura · 5 anos no sistema expansível · 2 anos nos acabamentos',
  source:COMMERCIAL_TERMS.source,
  faq:'Prazo de entrega de 90 a 180 dias úteis, acrescido de 30 dias no terreno do cliente para montagem e acabamentos. Garantia de 10 anos na estrutura, 5 anos no sistema expansível e 2 anos nos acabamentos. Transporte incluído no preço para Portugal Continental; outros destinos sob consulta.',
 }),
 en:Object.freeze({
  delivery:'90 to 180 working days',
  assemblyLabel:'On-site assembly and finishing',
  assembly:"An additional 30 days on the customer's land for assembly and finishing.",
  structure:'10 years on the structure',
  expansion:'5 years on the expansion system',
  finishes:'2 years on finishes',
  warranty:'10 years on the structure · 5 years on the expansion system · 2 years on finishes',
  source:'Green Village · commercial confirmation dated 02/10/2026',
  faq:"Delivery time of 90 to 180 working days, plus 30 days on the customer's land for assembly and finishing. Warranty of 10 years on the structure, 5 years on the expansion system and 2 years on finishes. Transport to mainland Portugal is included in the price; other destinations on request.",
 }),
 es:Object.freeze({
  delivery:'90 a 180 días hábiles',
  assemblyLabel:'Montaje y acabados en el terreno',
  assembly:'Se añaden 30 días en el terreno del cliente para el montaje y los acabados.',
  structure:'10 años en la estructura',
  expansion:'5 años en el sistema expansible',
  finishes:'2 años en los acabados',
  warranty:'10 años en la estructura · 5 años en el sistema expansible · 2 años en los acabados',
  source:'Green Village · confirmación comercial del 02/10/2026',
  faq:'Plazo de entrega de 90 a 180 días hábiles, más 30 días en el terreno del cliente para el montaje y los acabados. Garantía de 10 años en la estructura, 5 años en el sistema expansible y 2 años en los acabados. Transporte incluido en el precio para Portugal continental; otros destinos bajo consulta.',
 }),
 fr:Object.freeze({
  delivery:'90 à 180 jours ouvrés',
  assemblyLabel:'Montage et finitions sur le terrain',
  assembly:'Prévoir 30 jours supplémentaires sur le terrain du client pour le montage et les finitions.',
  structure:'10 ans sur la structure',
  expansion:"5 ans sur le système d’expansion",
  finishes:'2 ans sur les finitions',
  warranty:'10 ans sur la structure · 5 ans sur le système d’expansion · 2 ans sur les finitions',
  source:'Green Village · confirmation commerciale du 02/10/2026',
  faq:'Délai de livraison de 90 à 180 jours ouvrés, auquel s’ajoutent 30 jours sur le terrain du client pour le montage et les finitions. Garantie de 10 ans sur la structure, 5 ans sur le système d’expansion et 2 ans sur les finitions. Transport inclus dans le prix pour le Portugal continental ; autres destinations sur demande.',
 }),
 it:Object.freeze({
  delivery:'Da 90 a 180 giorni lavorativi',
  assemblyLabel:'Montaggio e finiture sul terreno',
  assembly:'Si aggiungono 30 giorni sul terreno del cliente per il montaggio e le finiture.',
  structure:'10 anni sulla struttura',
  expansion:'5 anni sul sistema di espansione',
  finishes:'2 anni sulle finiture',
  warranty:'10 anni sulla struttura · 5 anni sul sistema di espansione · 2 anni sulle finiture',
  source:'Green Village · conferma commerciale del 02/10/2026',
  faq:'Tempi di consegna da 90 a 180 giorni lavorativi, più 30 giorni sul terreno del cliente per il montaggio e le finiture. Garanzia di 10 anni sulla struttura, 5 anni sul sistema di espansione e 2 anni sulle finiture. Trasporto incluso nel prezzo per il Portogallo continentale; altre destinazioni su richiesta.',
 }),
});

export const COMMERCIAL_TRANSLATIONS=Object.keys(COMMERCIAL_COPY.pt).map(key=>['pt','en','es','fr','it'].map(lang=>COMMERCIAL_COPY[lang][key]));
export const COMMERCIAL_FACTS=[
 {id:'commercial-delivery',label:'Prazo de entrega',value:COMMERCIAL_COPY.pt.delivery,note:COMMERCIAL_COPY.pt.assembly},
 {id:'commercial-warranty',label:'Garantia',value:COMMERCIAL_COPY.pt.warranty,note:COMMERCIAL_COPY.pt.source},
].map(fact=>({...fact,category:'Condições Green Village',unit:null,source:{document:COMMERCIAL_TERMS.source},status:'owner-confirmed',applicability:'gv72-commercial'}));
