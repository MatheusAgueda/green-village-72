import {deploymentPose} from './deployment-rig.js';
export const PROCESS_REVISION='GV72-EXPANSION-R12-2026-09-12';
export const PROCESS_DURATION=24000;
export const PROCESS_STEPS=Object.freeze([
 Object.freeze({position:0,title:'Contentor fechado',subtitle:'Ponto de partida',note:'O contentor começa totalmente fechado. A arrumação interna das peças é ilustrativa; as dimensões de transporte não estão confirmadas.'}),
 Object.freeze({position:.45,title:'Alas laterais abertas',subtitle:'Painéis deitados',note:'As coberturas abrem até à posição horizontal. Os painéis laterais acompanham a abertura dos pisos e permanecem deitados sobre eles.'}),
 Object.freeze({position:.77,title:'Paredes laterais erguidas',subtitle:'Janelas nos painéis',note:'As paredes laterais erguem-se de dentro para fora, com as janelas solidárias aos painéis. As paredes da frente e de trás continuam recolhidas.'}),
 Object.freeze({position:1,title:'Frente e traseira abertas',subtitle:'Casa expandida',note:'As paredes da frente e de trás rodam do interior para o exterior e completam a casa. Materiais, vãos e planta correspondem à configuração seleccionada.'})
]);
export function processPose(value){
 const e=deploymentPose(value),p=e.p,step=p<.45?0:p<.77?1:p<.995?2:3;
 const motion=p<=.025?'Contentor fechado':p<.17?'A abrir as coberturas':p<.43?'A abrir as alas laterais':p<.48?'Alas laterais abertas':p<.73?'A erguer as paredes laterais':p<.78?'Paredes laterais erguidas':p<.9?'A abrir as paredes da frente':p<.995?'A abrir as paredes de trás':'Casa expandida';
 return {...e,step,sourceIndex:step,representation:'deployment',articulated:p>0&&p<1,motion};
}
