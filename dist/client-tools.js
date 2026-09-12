import {DEPLOYMENT_ASSUMPTIONS} from './deployment-rig.js';
import {CATALOGUE_OPTIONS,TECHNICAL_FACTS,SOURCE_LAYOUTS} from './technical-data.js';
import {REFERENCE_VIDEOS} from './reference-videos.js';
import {PROCESS_REVISION,PROCESS_STEPS} from './expansion-process.js';
import * as THREE from './vendor/three.module.js';
import {validateConfiguration,DEFAULT_CONFIG,summaryRows} from './configuration.js';
import {configurationReference,CONTACT_EMAIL} from './portfolio.js';
import {REVISION,MEASURES,SOURCES,SOURCE_DIVERGENCES,WALL_RAISE,getPlan} from './specification.js';
import {makeHouse} from './model.js';

export function createHistory(initial,limit=40){
 let entries=[validateConfiguration(initial)],index=0;
 return {
  push(value){const next=validateConfiguration(value);if(JSON.stringify(next)===JSON.stringify(entries[index]))return;entries=entries.slice(0,index+1);entries.push(next);if(entries.length>limit)entries.shift();index=entries.length-1;},
  undo(){if(index===0)return null;return {...entries[--index]};},
  redo(){if(index===entries.length-1)return null;return {...entries[++index]};},
  get canUndo(){return index>0;},get canRedo(){return index<entries.length-1;}
 };
}

export function shareConfiguration(configuration,href){
 const bytes=new TextEncoder().encode(JSON.stringify(validateConfiguration(configuration)));
 const encoded=btoa(String.fromCharCode(...bytes)).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
 const url=new URL(href);url.hash='config='+encoded;return url.href;
}
export function readSharedConfiguration(hash){
 if(!hash.startsWith('#config='))return null;
 const encoded=hash.slice(8);if(encoded.length>6000||!/^[A-Za-z0-9_-]+$/.test(encoded))throw new Error('Ligação de configuração inválida.');
 try{const binary=atob(encoded.replaceAll('-','+').replaceAll('_','/'));return validateConfiguration(JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(binary,c=>c.charCodeAt(0)))));}catch{throw new Error('A ligação contém opções inválidas ou sem referência no catálogo.');}
}
export function migrateStoredConfiguration(raw){
 const parsed=JSON.parse(raw),data=parsed.configuration||parsed,changes=[];
 for(const [id,colour] of [['exteriorId','exterior'],['floorId','floor']])if(data[id]===null){data[id]=DEFAULT_CONFIG[id];data[colour]=DEFAULT_CONFIG[colour];changes.push(colour);}
 if(data.interior!==DEFAULT_CONFIG.interior){data.interior=DEFAULT_CONFIG.interior;data.interiorName=DEFAULT_CONFIG.interiorName;changes.push('interior');}
 return {configuration:validateConfiguration(data),changes};
}
export function quoteLink(configuration){
 const rows=summaryRows(configuration),reference=configurationReference(configuration);
 const body='Olá, gostaria de receber uma proposta para esta configuração.\n\nReferência: '+reference+'\n'+rows.map(([name,value])=>name+': '+value).join('\n')+'\n\nDimensões exteriores documentadas: 11,80 × 6,22 m.\nPreço e compatibilidade: sob consulta.\nPosso anexar o PDF descarregado no portefólio.';
 return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Pedido de proposta · Expandível 72 · '+reference)}&body=${encodeURIComponent(body)}`;
}

// A temporary native drawing buffer preserves the scene's environment and colour pipeline.
// The interactive buffer is restored synchronously before the browser paints again.
export async function renderCurrent4K({stage,ready,isCurrent,onProgress=()=>{}}){
 onProgress(10,'A carregar os materiais…');const status=await ready();
 if(status?.failures?.length)throw new Error('Falta uma textura. Use Tentar texturas antes de exportar.');
 if(!isCurrent())throw new Error('A vista ou a configuração mudou. Tente novamente.');
 const r=stage.renderer,gl=r.getContext();if(gl.isContextLost())throw new Error('A ligação gráfica foi interrompida.');
 if(gl.getParameter(gl.MAX_RENDERBUFFER_SIZE)<3840||r.capabilities.maxTextureSize<3840)throw new Error('Este dispositivo não suporta o tamanho 4K. A galeria 4K continua disponível.');
 const size=r.getSize(new THREE.Vector2()),ratio=r.getPixelRatio(),camera=stage.camera.clone(),aspect=3840/2160;
 if(camera.isPerspectiveCamera){if(aspect<camera.aspect)camera.fov=THREE.MathUtils.radToDeg(2*Math.atan(Math.tan(THREE.MathUtils.degToRad(camera.fov)/2)*camera.aspect/aspect));camera.aspect=aspect;}
 else {const cx=(camera.left+camera.right)/2,cy=(camera.top+camera.bottom)/2;let w=camera.right-camera.left,h=camera.top-camera.bottom;if(w/h>aspect)h=w/aspect;else w=h*aspect;camera.left=cx-w/2;camera.right=cx+w/2;camera.top=cy+h/2;camera.bottom=cy-h/2;}
 camera.updateProjectionMatrix();camera.updateMatrixWorld(true);onProgress(45,'A renderizar 3 840 × 2 160…');
 let encoded;
 try{r.setPixelRatio(1);r.setSize(3840,2160,false);r.render(stage.scene,camera);
  if(gl.isContextLost()||r.domElement.width!==3840||r.domElement.height!==2160)throw new Error('A memória gráfica não permitiu concluir a imagem 4K.');
  encoded=new Promise((resolve,reject)=>r.domElement.toBlob(blob=>blob?resolve(blob):reject(new Error('Não foi possível codificar a imagem.')),'image/png'));
 }finally{r.setPixelRatio(ratio);r.setSize(size.x,size.y,false);if(!gl.isContextLost())stage.render();}
 onProgress(85,'A preparar o ficheiro…');const blob=await encoded;
 if(!isCurrent())throw new Error('A configuração mudou durante a exportação. Tente novamente.');
 const header=new DataView(await blob.slice(16,24).arrayBuffer());if(header.getUint32(0)!==3840||header.getUint32(4)!==2160)throw new Error('A resolução produzida não corresponde a 4K.');
 onProgress(100,'Imagem 4K pronta.');return blob;
}

export async function exportModelGLB(configuration,library,onProgress=()=>{}){
 const config=validateConfiguration(configuration);onProgress(10,'A preparar o modelo completo…');
 const {GLTFExporter}=await import('./vendor/GLTFExporter.js');
 const model=makeHouse({...config,view:'exterior',doorsOpen:false,wallsVisible:true,furnitureVisible:true,roofVisible:true},library);
 try{const status=await library.ready();if(status.failures.length)throw new Error('Faltam texturas para exportar o modelo.');
  model.root.userData={revision:REVISION,configuration:config,units:{dimensions:'m unless specified per record',areas:'m²',catalogue:'per specification'},dimensions:MEASURES,sourceStatus:'presentation-model-with-estimated-details',sources:SOURCES.map(({id,label,limits})=>({id,label,limits})),limits:['No manufacturer deployment mechanism or hidden services.','Static complete house; no application controls, cut planes or interactive door behaviour.','Custom panel-joint shaders and presentation lighting are not part of glTF; standard materials and source textures are retained.']};
  model.root.traverse(o=>{if(o!==model.root)o.userData={component:o.name,layer:o.userData.layer||null};});
  model.root.updateMatrixWorld(true);onProgress(45,'A integrar geometria e texturas…');
  const result=await new GLTFExporter().parseAsync(model.root,{binary:true,onlyVisible:true,trs:true,maxTextureSize:4096});
  const view=new DataView(result);if(view.getUint32(0,true)!==0x46546c67||view.getUint32(4,true)!==2)throw new Error('O exportador não produziu um GLB válido.');
  onProgress(100,'Modelo GLB pronto.');return new Blob([result],{type:'model/gltf-binary'});
 }finally{model.dispose();}
}

export function sourceLedger(configuration){
 const plan=getPlan(configuration),aliases={entryWidthVisual:'entryWidth',entryHeightVisual:'entryHeight',bathWindowWidthVisual:'bathWindowWidth',windowSillVisual:'windowSill',porchDepthVisual:'porchDepth',canopyRiseVisual:'canopyRise',canopyOverhangVisual:'canopyOverhang'};return {revision:REVISION,configuration:validateConfiguration(configuration),units:{dimensions:'m unless specified per record',areas:'m²',catalogue:'per specification'},dimensions:MEASURES.map(m=>({...m,provided:m.status==='confirmed'?m.value:null,modelled:plan.dimensions[aliases[m.id]||m.id]??null,numericMatch:m.status==='confirmed'&&Object.hasOwn(plan.dimensions,m.id)?m.value===plan.dimensions[m.id]:null})),areas:plan.areas,catalogueOptions:CATALOGUE_OPTIONS,technicalFacts:TECHNICAL_FACTS,sourceLayout:SOURCE_LAYOUTS.find(l=>l.id===configuration.layout),videos:REFERENCE_VIDEOS,openings:plan.perimeter,sourceDivergences:SOURCE_DIVERGENCES,expansion:{scope:'full-illustrative-deployment',assumptions:DEPLOYMENT_ASSUMPTIONS,endPanels:'continuous inside-to-outside unfolding, front then rear',presentation:{revision:PROCESS_REVISION,source:'assets/expansao.png and client clarification',sourceConfirmedByUser:'2026-09-12',steps:PROCESS_STEPS,continuousMotion:'all stages',discreteTransitions:[],transportEnvelope:'not documented'}},sourceConflicts:SOURCES.map(({id,limits})=>({id,limits}))};
}
