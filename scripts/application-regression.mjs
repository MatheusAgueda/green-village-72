import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {pathToFileURL} from 'node:url';
const root=process.env.GV_PROJECT_ROOT||process.cwd();
const url=p=>pathToFileURL(root+'/dist/'+p).href;
const THREE=await import(url('vendor/three.module.js'));
const orbitCode=fs.readFileSync(root+'/dist/vendor/OrbitControls.js','utf8').replace("from 'three'",`from '${url('vendor/three.module.js')}'`);
const {OrbitControls}=await import('data:text/javascript;base64,'+Buffer.from(orbitCode).toString('base64'));
const {DEFAULT_CONFIG,STORAGE_KEY,encodeConfiguration}=await import(url('configuration.js'));
const {shareConfiguration,readSharedConfiguration,migrateStoredConfiguration}=await import(url('client-tools.js'));
const app=fs.readFileSync(root+'/dist/app.js','utf8');
function source(name,next){const a=app.indexOf(name),b=app.indexOf(next,a+name.length);assert.ok(a>=0&&b>a,name);return app.slice(a,b);}
function walkScene(){
 const camera=new THREE.PerspectiveCamera(36,16/9,.05,200);camera.position.set(12,14,20);
 const controls=new OrbitControls(camera,null);controls.target.set(0,1.1,0);controls.minDistance=4;controls.maxDistance=65;controls.maxPolarAngle=Math.PI*.485;controls.enableDamping=true;controls.update();
 controls.enabled=false;camera.fov=65;camera.near=.025;camera.position.set(0,1.6,1);camera.lookAt(0,1.6,0);
 return {camera,controls,pose:()=>JSON.stringify({position:camera.position.toArray(),quaternion:camera.quaternion.toArray()})};
}
const results=[];
async function check(name,test){try{await test();results.push({name,pass:true});}catch(error){results.push({name,pass:false,message:error.message});}}
await check('Export preserves a first-person walking camera',async()=>{
 const {camera,controls,pose}=walkScene(),before=pose(),modal={showModal(){},close(){}},context={exporting:false,controls,walker:{active:true,pause(){}},stopAnimation(){},syncHistory(){},requestRender(){},$:()=>modal,notify(message){throw new Error(message);}};
 vm.createContext(context);vm.runInContext(source('async function runExport(', 'async function export4K('),context);
 await context.runExport(async()=>assert.equal(pose(),before,'Camera changed before export task; actual OrbitControls update must not run while walking'));
 assert.equal(pose(),before);assert.equal(controls.enabled,false);assert.equal(controls.enableDamping,true);
});
await check('Viewport resize preserves a first-person walking camera',()=>{
 const {camera,controls,pose}=walkScene(),before=pose();const context={stage:{camera,resize(w,h){camera.aspect=w/h;}},controls,house:{},exporting:false,currentPage:'studio',roomFocus:null,walker:{active:true},viewport:{getBoundingClientRect:()=>({width:640,height:640})},requestRender(){}};
 vm.createContext(context);vm.runInContext(source('function resizeViewport(', 'function setCamera('),context);context.resizeViewport();assert.equal(pose(),before,'Camera changed when viewport aspect resized during walk');
});
await check('Editing a shared configuration survives reload',()=>{
 const linked={...DEFAULT_CONFIG,layout:'t1'},edited={...linked,layout:'t3-b',roof:true},href=shareConfiguration(linked,'https://example.test/portfolio/?retained=1'),location={href,hash:new URL(href).hash},storage=new Map();
 const replaceState=(_state,_title,next)=>{const u=new URL(next,location.href);location.href=u.href;location.hash=u.hash;};
 const context={S:edited,STORAGE_KEY,encodeConfiguration,shareConfiguration,storageSaved:false,localStorage:{setItem:(k,v)=>storage.set(k,v)},location,window:{history:{replaceState}},notify(message){throw new Error(message);}};
 vm.createContext(context);vm.runInContext(source('function persist(', 'function configure('),context);context.persist();
 let reloaded=migrateStoredConfiguration(storage.get(STORAGE_KEY)).configuration;const shared=readSharedConfiguration(location.hash);if(shared)reloaded=shared;
 assert.equal(JSON.stringify(reloaded),JSON.stringify(edited),'Old shared URL still overrides the latest saved choices on reload');assert.equal(new URL(location.href).search,'?retained=1');
});
if(process.env.GV_AUDIT_REPORT)fs.writeFileSync(process.env.GV_AUDIT_REPORT,JSON.stringify({results,passed:results.every(r=>r.pass)},null,2)+'\n');
console.log(JSON.stringify({results,passed:results.every(r=>r.pass)},null,2));process.exitCode=results.every(r=>r.pass)?0:1;
