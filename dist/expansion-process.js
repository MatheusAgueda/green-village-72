// Documentary states follow the supplied image. Only states 2–3 have a 3D motion.
export const PROCESS_REVISION='GV72-EXPANSION-R10-2026-09-12';
export const PROCESS_DURATION=18000;
export const PROCESS_STEPS=Object.freeze([
 Object.freeze({position:0,title:'Pisos recolhidos',subtitle:'Coberturas já abertas',note:'Primeiro quadro original. A abertura anterior das coberturas não aparece nesta sequência.',representation:'source'}),
 Object.freeze({position:.18,title:'Pisos abertos',subtitle:'Paredes deitadas',note:'Segundo quadro: pisos laterais abertos e paredes com janelas deitadas. A passagem anterior é uma mudança de estado, sem simular a articulação dos pisos.',representation:'walls'}),
 Object.freeze({position:.78,title:'Paredes erguidas',subtitle:'Topos ainda abertos',note:'Terceiro quadro: paredes longitudinais erguidas, com as janelas fixas aos painéis. Os painéis de topo ainda não fecham as extremidades.',representation:'walls'}),
 Object.freeze({position:1,title:'Topos fechados',subtitle:'Casa expandida',note:'Quarto quadro: extremidades fechadas. O 3D mostra a casa da planta seleccionada, sem os opcionais de telhado e alpendre. O fecho é apresentado por mudança de estado; o movimento das dobradiças não é simulado.',representation:'assembled'})
]);
export function processPose(value){
 const p=Math.min(1,Math.max(0,Number(value)||0));
 const step=p<.18?0:p<.78?1:p<.90?2:3;
 const wall=Math.min(1,Math.max(0,(p-.24)/.54));
 return {p,step,wall,sourceIndex:step,representation:PROCESS_STEPS[step].representation,articulated:p>.24&&p<.78};
}
