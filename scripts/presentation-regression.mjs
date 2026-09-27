import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import vm from 'node:vm';
import * as THREE from '../dist/vendor/three.module.js';
import {PROCESS_STEPS,PROCESS_DURATION,PROCESS_REVISION,processPose} from '../dist/expansion-process.js';
import {DEFAULT_CONFIG,VISUAL_DEFAULT,validateConfiguration} from '../dist/configuration.js';
import {GENERATED_FILMS,generatedGalleryMarkup} from '../dist/generated-gallery.js';

class Node {
 constructor(){this.hidden=false;this.textContent='';this.dataset={};this.attrs={};this.events={};this.children=[];this.value='';}
 addEventListener(type,fn){this.events[type]=fn;}
 removeEventListener(type){delete this.events[type];}
 setAttribute(k,v){this.attrs[k]=String(v);}
 getBoundingClientRect(){return {width:900,height:520};}
 appendChild(n){this.children.push(n);}
 remove(){}
}
const source=readFileSync('dist/expansion-viewer.js','utf8').replace(/^import .*;\n/gm,'').replace('export function','function');
function fixture(){
 const nodes=new Map(),node=s=>{if(!nodes.has(s))nodes.set(s,new Node());return nodes.get(s);};
 const root=new Node(),buttons=PROCESS_STEPS.map((s,i)=>Object.assign(new Node(),{dataset:{expansionStep:String(i)}}));
 root.querySelector=node;root.querySelectorAll=()=>buttons;
 const stages=[],libraries=[],models=[],frames=[],configuration=structuredClone(DEFAULT_CONFIG),doc=new Node();doc.hidden=false;
 const context={THREE,PROCESS_STEPS,PROCESS_DURATION,PROCESS_REVISION,processPose,VISUAL_DEFAULT,validateConfiguration,devicePixelRatio:1,document:doc,performance:{now:()=>1000},requestAnimationFrame:fn=>frames.push(fn),ResizeObserver:class{observe(){}disconnect(){}},
  OrbitControls:class{constructor(camera){this.object=camera;this.target=new THREE.Vector3();}update(){return false;}addEventListener(){}dispose(){}},
  createMaterialLibrary:callback=>{const item={callback,failures:[],stats(){return {failures:this.failures};},dispose(){}};libraries.push(item);return item;},
  makeHouse:state=>{const item={state,root:new THREE.Group(),updates:[],updateProcess(p){this.updates.push(p);},dispose(){}};models.push(item);return item;},
  createStage:()=>{const item={camera:new THREE.PerspectiveCamera(),scene:new THREE.Scene(),renderer:{domElement:new Node()},preset:()=>new THREE.Vector3(),fitBox:()=>new THREE.Vector3(),resize(){},setView(){},lighting(){},render(){this.renders=(this.renders||0)+1;},dispose(){}};item.camera.position.set(12,9,17);stages.push(item);return item;}
 };
 vm.createContext(context);vm.runInContext(source,context);
 const errors=[],viewer=context.createExpansionViewer(root,{getConfiguration:()=>configuration,onOpenHouse(){},onError:msg=>errors.push(msg)});
 const tick=time=>{const frame=frames.shift();frame?.(time);};
 return {viewer,root,node,stages,libraries,models,configuration,doc,tick,errors};
}
const checks=[];
function check(name,fn){fn();checks.push(name);console.log('PASS '+name);}
check('Expansion is lazy and receives an isolated configuration copy',()=>{const f=fixture(),before=JSON.stringify(f.configuration);assert.equal(f.stages.length,0);f.viewer.activate(true);assert.equal(f.stages.length,1);assert.equal(f.models[0].state.view,'expansion');f.models[0].state.optionSelections.push({id:'isolated'});assert.equal(JSON.stringify(f.configuration),before);f.viewer.dispose();});
check('All four poses share one scene; re-entry preserves progress and avoids duplicate canvases',()=>{const f=fixture();f.viewer.activate(true);for(const s of PROCESS_STEPS){f.viewer.setProgress(s.position);assert.equal(f.viewer.status().p,s.position);}f.viewer.activate(false);f.viewer.activate(true);assert.equal(f.stages.length,1);assert.equal(f.models.length,1);assert.equal(f.viewer.status().p,1);f.viewer.dispose();});
check('Navigation away pauses playback and prevents background renders',()=>{const f=fixture();f.viewer.activate(true);f.viewer.play();f.tick(1400);assert.equal(f.viewer.status().playing,true);f.viewer.activate(false);const renders=f.stages[0].renders;f.tick(2000);assert.equal(f.viewer.status().playing,false);assert.equal(f.stages[0].renders,renders);f.viewer.dispose();});
check('Changed selections are copied on model entry without resetting progress',()=>{const f=fixture();f.viewer.activate(true);f.viewer.setProgress(.45);f.viewer.activate(false);f.configuration.roof=true;f.viewer.activate(true);assert.equal(f.models.length,2);assert.equal(f.viewer.status().p,.45);f.viewer.dispose();});
check('Late texture completion cannot hide WebGL recovery',()=>{const f=fixture();f.viewer.activate(true);f.stages[0].renderer.domElement.events.webglcontextlost({preventDefault(){}});assert.equal(f.node('[data-expansion-retry]').hidden,false);f.libraries[0].callback();assert.equal(f.node('[data-expansion-retry]').hidden,false);assert.equal(f.viewer.status().playing,false);f.viewer.dispose();});
check('Context restoration recreates the scene; stale material callbacks are ignored',()=>{const f=fixture();f.viewer.activate(true);const first=f.stages[0],old=f.libraries[0];first.renderer.domElement.events.webglcontextlost({preventDefault(){}});first.renderer.domElement.events.webglcontextrestored();assert.equal(f.stages.length,2);assert.equal(f.root.dataset.ready,'true');assert.equal(f.node('[data-expansion-retry]').hidden,true);old.failures.push('late failure');old.callback();assert.equal(f.node('[data-expansion-retry]').hidden,true);f.viewer.dispose();});
check('Gallery has six silent presentation films separated by area without generation references',()=>{assert.equal(GENERATED_FILMS.length,6);assert.equal(new Set(GENERATED_FILMS.map(f=>f.id)).size,6);for(const f of GENERATED_FILMS){assert.ok(existsSync('dist/'+f.asset));assert.ok(existsSync('dist/'+f.poster));assert.ok(f.source);}const html=generatedGalleryMarkup();assert.equal((html.match(/<video /g)||[]).length,6);assert.equal((html.match(/controls muted playsinline preload="none"/g)||[]).length,6);assert.equal((html.match(/GERADO POR IA|AI-GENERATED|GENERADO POR IA|Veo|Flow|Google/g)||[]).length,0);assert.equal((html.match(/download aria-label/g)||[]).length,6);});
check('Expansion lives only in Model; source photos remain in technical documentation',()=>{const html=readFileSync('dist/index.html','utf8'),studio=html.slice(html.indexOf('id="studio"'),html.indexOf('id="model"')),model=html.slice(html.indexOf('id="model"'),html.indexOf('id="gallery"'));assert.ok(!studio.includes('data-expansion-viewer'));assert.ok(!studio.includes('data-view="expansion"'));assert.ok(model.includes('data-expansion-viewer'));assert.ok(html.includes('id="original-photo-grid"'));assert.ok(html.includes('id="generated-gallery-note"'));});
console.log(`${checks.length} presentation checks passed.`);
