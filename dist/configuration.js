import {STANDARD_PACKAGE,validateAdaptationRequests,adaptationEstimate} from './standard-package.js';
import {validateOptionSelections,selectedOption,catalogueEstimate,money} from './project-options.js';
import {INTERIOR_REFERENCES} from './interior-references.js';
import {DATA} from './data.js';
import {MATERIALS} from './material-data.js';
import {compatibility,REVISION,getPlan,MEASURES,configuredMeasures,configuredOpenings,slidingDoorConflicts} from './specification.js';
export const SWATCHES=Object.values(DATA.swatches).flat();
export const PAINTS=[['Branco natural','#eeede8']];
const white=DATA.swatches['exterior-standard'].find(x=>/Branco Glacial/i.test(x.label));
export const DEFAULT_CONFIG=Object.freeze({schemaVersion:2,layout:'t2',exteriorId:white.id,exterior:MATERIALS.find(m=>m.id===white.id).previewHexApprox,floorId:DATA.swatches['floor-spc'][1].id,floor:MATERIALS.find(m=>m.id===DATA.swatches['floor-spc'][1].id).previewHexApprox,interior:'#eeede8',interiorName:'Branco natural',kitchen:STANDARD_PACKAGE.kitchen.layout,kitchenRef:STANDARD_PACKAGE.kitchen.ref,bathroom:STANDARD_PACKAGE.bathroom.layout,bathroomRef:STANDARD_PACKAGE.bathroom.ref,bathroomUV:null,roof:false,porch:false,lighting:'neutral',textureMode:'source',optionSelections:Object.freeze([]),adaptationRequests:Object.freeze([])});
export const VISUAL_DEFAULT=Object.freeze({view:'exterior',expansion:1,cut:1.1,exploded:0,roofVisible:true,wallsVisible:true,furnitureVisible:true,doorsOpen:true});
export const STORAGE_KEY='green-village-72/config-v2';
export const SAVED_KEY='green-village-72/saved-v2';
export function validateConfiguration(value){
 if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('O ficheiro não contém uma configuração válida.');
 const data=value.configuration||value;if(data.schemaVersion!==2)throw new Error('Formato de configuração desconhecido. É necessário um ficheiro da revisão 2.');
 const result={};for(const key of Object.keys(DEFAULT_CONFIG)){
  if(key==='adaptationRequests'){result[key]=validateAdaptationRequests(data[key]===undefined?[]:data[key]);continue;}
  if(key==='optionSelections'){result[key]=validateOptionSelections(data[key]??[]);continue;}
  const v=key==='textureMode'&&data[key]===undefined?'source':data[key];if(v===undefined)throw new Error('Falta o campo '+key+'.');result[key]=v;
 }
 const enumField=(k,values)=>{if(!values.includes(result[k]))throw new Error('Opção inválida: '+k+'.');};
 enumField('textureMode',['source','prepared']);enumField('layout',DATA.layouts.map(x=>x.id));enumField('kitchen',['none','linear','l','u','island']);enumField('bathroom',['standard','mirrored']);enumField('lighting',['neutral','exterior','catalogue']);enumField('kitchenRef',DATA.kitchens.map(x=>x.id));enumField('bathroomRef',DATA.bathrooms.map(x=>x.id));
 for(const [k,families] of [['exteriorId',['exterior-standard','exterior-finishes','exterior-3d-textures','exterior-3d-gm']],['floorId',['floor-spc']],['bathroomUV',['bathroom-uv']]]){const ids=families.flatMap(f=>DATA.swatches[f].map(x=>x.id));if((k!=='bathroomUV'||result[k]!==null)&&!ids.includes(result[k]))throw new Error('Material desconhecido: '+k+'.');}
 for(const k of ['floor','interior','exterior'])if(typeof result[k]!=='string'||!/^#[a-f0-9]{6}$/i.test(result[k]))throw new Error('Cor inválida: '+k+'.');
 for(const k of ['roof','porch'])if(typeof result[k]!=='boolean')throw new Error('Opção inválida: '+k+'.');
 if(result.interior.toLowerCase()!==DEFAULT_CONFIG.interior)throw new Error('A cor interior não está documentada no catálogo. Use a apresentação branca de referência.');
 if(typeof result.interiorName!=='string'||result.interiorName.length>80)throw new Error('Nome de cor inválido.');
 if(/^exterior-3d-(textures|gm)-/.test(result.exteriorId)&&!selectedOption(result,'exterior-3d'))result.optionSelections=validateOptionSelections([...result.optionSelections,{id:'exterior-3d',quantity:1}]);
 if(selectedOption(result,'exterior-3d')&&!/^exterior-3d-(textures|gm)-/.test(result.exteriorId))result.exteriorId=DATA.swatches['exterior-3d-textures'][0].id;
 // Stored colour values are derived fields when an original material ID is selected.
 for(const [id,colour]of [['floorId','floor'],['exteriorId','exterior']])if(result[id])result[colour]=MATERIALS.find(m=>m.id===result[id]).previewHexApprox;
 result.interiorName=DEFAULT_CONFIG.interiorName;
 if(selectedOption(result,'gable-roof'))result.roof=true;if(selectedOption(result,'terrace'))result.porch=true;
 const basePlan=getPlan({...result,optionSelections:[]}),validTargets=new Set([...basePlan.doors.map(d=>d.id),...basePlan.perimeter.flatMap(f=>f.holes.map(h=>h.id))]);
 for(const selection of result.optionSelections)if(selection.targets.some(t=>!validTargets.has(t)))throw new Error('Um adicional aponta para um vão que não existe nesta planta.');
 const reasons=[...compatibility(result),...slidingDoorConflicts(getPlan(result)).map(x=>x.reason)];if(reasons.length)throw new Error(reasons.join(' '));return result;
}
export function propose(current,patch){const value=validateConfiguration({...current,...patch});return {ok:true,value};}
export function encodeConfiguration(state){const configuration=validateConfiguration(state),plan=getPlan(configuration);return JSON.stringify({format:'Green Village — configuração',revision:REVISION,savedAt:new Date().toISOString(),configuration,summary:summaryRows(configuration),sourceDimensions:MEASURES,dimensions:configuredMeasures(plan),configuredOpenings:configuredOpenings(plan),areas:plan.areas,notes:['Modelo de apresentação. Medidas confirmadas e estimadas discriminadas.','Materiais extraídos do catálogo genérico; compatibilidade específica a confirmar.']},null,2);}
export function decodeConfiguration(text){if(typeof text!=='string'||text.length>100000)throw new Error('Ficheiro demasiado grande ou inválido.');let parsed;try{parsed=JSON.parse(text);}catch{throw new Error('Não foi possível ler este ficheiro JSON.');}return validateConfiguration(parsed);}
export function summaryRows(s){const find=id=>SWATCHES.find(x=>x.id===id),p=DATA.layouts.find(p=>p.id===s.layout);return [['Modelo','Expandível 72 · 40 pés'],['Planta',p.label],['Exterior',find(s.exteriorId)?.label||'Referência em falta'],['Paredes interiores',s.interiorName+' · aparência de referência, cor por confirmar'],['Pavimento SPC',find(s.floorId)?.label||'Referência em falta'],['Cozinha',({none:'Sem cozinha representada',linear:'Linear',l:'Em L',island:'Com ilha',u:'Em U'})[s.kitchen]],['Referência de cozinha',s.kitchen==='none'?'Referência guardada, sem cozinha representada':s.kitchenRef.replace('kitchen-','')+' · acabamento e elementos aplicados ao 3D'+(kitchenFitNote(s)?' · '+kitchenFitNote(s):'')],['Casa de banho',s.bathroom==='standard'?'Distribuição da planta (aproximada)':'Alternativa espelhada (proposta)'],['Revestimento do banho',find(s.bathroomUV)?.label||'Da fotografia seleccionada'],['Ambiente de banho',s.bathroomRef.replace('bathroom-','')+' · acabamento e equipamentos no 3D'],['Texturas',s.textureMode==='source'?'Recorte original, sem tratamento de cor':'Preparação de emendas R3'],['Luz',s.lighting==='catalogue'?'Cor digital da amostra':s.lighting==='neutral'?'Neutra':'Exterior'],['Telhado adicional',s.roof?'Seleccionado · sob consulta':'Não seleccionado'],['Alpendre',s.porch?'Seleccionado · confirmar variante na lista de adicionais':'Não seleccionado'],['Adicionais',catalogueEstimate(s).lines.map(l=>l.quantity+' × '+l.item.label+(l.variant?' · '+(l.item.variants.find(v=>v[0]===l.variant)?.[1]||l.variant):'')+(l.locations.length?' · '+l.locations.join(', '):l.item.model==='opening'&&l.id!=='glass-front'?' · local por definir':'')).join('; ')||'Nenhum seleccionado'],['Subtotal indicativo de adicionais',money(catalogueEstimate(s).knownSubtotalCents)+' · preço base e total por confirmar'],['Personalizações sob orçamento',adaptationEstimate(s).lines.map(line=>line.label+' · '+line.detail).join('; ')||'Nenhuma alteração ao standard seleccionada']];}

export function kitchenFitNote(s){if(s.kitchen==='none')return '';const plan=getPlan(s),notes=[];if(plan.compact)notes.push('Bancada ilustrativa de 1,60 m para manter as passagens livres.');if(INTERIOR_REFERENCES[s.kitchenRef].upper&&plan.kitchenUpperModules.some(m=>m.blockedBy.length))notes.push('Armários superiores ajustados para deixar as janelas livres.');return notes.join(' ');}
