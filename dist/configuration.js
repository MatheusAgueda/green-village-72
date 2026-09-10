import {DATA} from './data.js';
import {MATERIALS} from './material-data.js';
import {compatibility,REVISION,getPlan,MEASURES} from './specification.js';
export const SWATCHES=Object.values(DATA.swatches).flat();
export const PAINTS=[['Branco natural','#eeede8'],['Areia','#d9cdbb'],['Cinza pérola','#c9ccc6'],['Verde oliva','#839079'],['Terracota','#ba8970'],['Carvão','#56615a']];
const white=DATA.swatches['exterior-standard'].find(x=>/Branco Glacial/i.test(x.label));
export const DEFAULT_CONFIG=Object.freeze({schemaVersion:2,layout:'t2',exteriorId:white.id,exterior:MATERIALS.find(m=>m.id===white.id).previewHexApprox,floorId:DATA.swatches['floor-spc'][1].id,floor:MATERIALS.find(m=>m.id===DATA.swatches['floor-spc'][1].id).previewHexApprox,interior:'#eeede8',interiorName:'Branco natural',kitchen:'linear',kitchenRef:'kitchen-01',bathroom:'standard',bathroomRef:'bathroom-01',bathroomUV:null,roof:false,porch:false,lighting:'neutral',textureMode:'source'});
export const VISUAL_DEFAULT=Object.freeze({view:'exterior',expansion:1,cut:1.1,exploded:0,roofVisible:true,wallsVisible:true,furnitureVisible:true,doorsOpen:true});
export const STORAGE_KEY='green-village-72/config-v2';
export const SAVED_KEY='green-village-72/saved-v2';
export function validateConfiguration(value){
 if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('O ficheiro não contém uma configuração válida.');
 const data=value.configuration||value;if(data.schemaVersion!==2)throw new Error('Formato de configuração desconhecido. É necessário um ficheiro da revisão 2.');
 const result={};for(const key of Object.keys(DEFAULT_CONFIG)){
  const v=key==='textureMode'&&data[key]===undefined?'source':data[key];if(v===undefined)throw new Error('Falta o campo '+key+'.');result[key]=v;
 }
 const enumField=(k,values)=>{if(!values.includes(result[k]))throw new Error('Opção inválida: '+k+'.');};
 enumField('textureMode',['source','prepared']);enumField('layout',DATA.layouts.map(x=>x.id));enumField('kitchen',['none','linear','l','u','island']);enumField('bathroom',['standard','mirrored']);enumField('lighting',['neutral','exterior','catalogue']);enumField('kitchenRef',DATA.kitchens.map(x=>x.id));enumField('bathroomRef',DATA.bathrooms.map(x=>x.id));
 for(const [k,families] of [['exteriorId',['exterior-standard','exterior-finishes','exterior-3d-textures','exterior-3d-gm']],['floorId',['floor-spc']],['bathroomUV',['bathroom-uv']]]){const ids=families.flatMap(f=>DATA.swatches[f].map(x=>x.id));if(result[k]!==null&&!ids.includes(result[k]))throw new Error('Material desconhecido: '+k+'.');}
 for(const k of ['floor','interior','exterior'])if(typeof result[k]!=='string'||!/^#[a-f0-9]{6}$/i.test(result[k]))throw new Error('Cor inválida: '+k+'.');
 for(const k of ['roof','porch'])if(typeof result[k]!=='boolean')throw new Error('Opção inválida: '+k+'.');
 if(typeof result.interiorName!=='string'||result.interiorName.length>80)throw new Error('Nome de cor inválido.');
 // Stored colour values are derived fields when an original material ID is selected.
 for(const [id,colour]of [['floorId','floor'],['exteriorId','exterior']])if(result[id])result[colour]=MATERIALS.find(m=>m.id===result[id]).previewHexApprox;
 const reasons=compatibility(result);if(reasons.length)throw new Error(reasons.join(' '));return result;
}
export function propose(current,patch){const value=validateConfiguration({...current,...patch});return {ok:true,value};}
export function encodeConfiguration(state){const configuration=validateConfiguration(state),plan=getPlan(configuration);return JSON.stringify({format:'Green Village — configuração',revision:REVISION,savedAt:new Date().toISOString(),configuration,summary:summaryRows(configuration),dimensions:MEASURES,areas:plan.areas,notes:['Modelo de apresentação. Medidas confirmadas e estimadas discriminadas.','Materiais extraídos do catálogo genérico; compatibilidade específica a confirmar.']},null,2);}
export function decodeConfiguration(text){if(typeof text!=='string'||text.length>100000)throw new Error('Ficheiro demasiado grande ou inválido.');let parsed;try{parsed=JSON.parse(text);}catch{throw new Error('Não foi possível ler este ficheiro JSON.');}return validateConfiguration(parsed);}
export function summaryRows(s){const find=id=>SWATCHES.find(x=>x.id===id),p=DATA.layouts.find(p=>p.id===s.layout);return [['Modelo','Expandível 72 · 40 pés'],['Planta',p.label],['Exterior',find(s.exteriorId)?.label||'Cor livre '+s.exterior],['Paredes interiores',s.interiorName],['Pavimento SPC',find(s.floorId)?.label||'Cor livre '+s.floor],['Cozinha',({none:'Sem cozinha representada',linear:'Linear',l:'Em L',island:'Com ilha',u:'Em U'})[s.kitchen]],['Referência de cozinha',s.kitchenRef.replace('kitchen-','')+' · acabamento e elementos aplicados ao 3D'],['Casa de banho',s.bathroom==='standard'?'Distribuição da planta (aproximada)':'Alternativa espelhada (proposta)'],['Revestimento do banho',find(s.bathroomUV)?.label||'Da fotografia seleccionada'],['Ambiente de banho',s.bathroomRef.replace('bathroom-','')+' · acabamento e equipamentos no 3D'],['Texturas',s.textureMode==='source'?'Recorte original, sem tratamento de cor':'Preparação de emendas R3'],['Luz',s.lighting==='catalogue'?'Cor digital da amostra':s.lighting==='neutral'?'Neutra':'Exterior'],['Telhado adicional',s.roof?'Seleccionado · catálogo 2 830 €':'Não seleccionado'],['Alpendre',s.porch?'Seleccionado · catálogo 2 050 €':'Não seleccionado']];}
