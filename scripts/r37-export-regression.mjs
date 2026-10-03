import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import * as THREE from '../dist/vendor/three.module.js';

// Execute the production export functions with real camera maths and a controlled GPU.
const source=readFileSync(new URL('../dist/client-tools.js',import.meta.url),'utf8');
const code=source.slice(source.indexOf('export async function renderCurrent4K'),source.indexOf('export async function exportModelGLB')).replaceAll('export async function','async function');
const context=vm.createContext({THREE,Blob,DataView,Uint8Array,Error});
vm.runInContext(code,context,{filename:'dist/client-tools.js'});
const {renderCurrent4K,renderHighResolution}=context;
function png(width,height){
 const bytes=new Uint8Array(33),view=new DataView(bytes.buffer);
 bytes.set([137,80,78,71,13,10,26,10]);view.setUint32(8,13);view.setUint32(12,0x49484452);view.setUint32(16,width);view.setUint32(20,height);bytes[24]=8;bytes[25]=6;
 return new Blob([bytes],{type:'image/png'});
}
function fixture(options={}){
 const logical=new THREE.Vector2(900,600),originalViewport=new THREE.Vector4(0,0,900,600),originalScissor=new THREE.Vector4(5,7,800,500);
 const viewport=originalViewport.clone(),scissor=originalScissor.clone(),draws=[],progress=[],events=[];
 let pixelRatio=1.5,scissorTest=true,target={name:'original-target'},activeFace=2,activeMip=1,restores=0,lost=false,current=true;
 const originalTarget=target;
 const gl={MAX_RENDERBUFFER_SIZE:1,MAX_VIEWPORT_DIMS:2,drawingBufferWidth:1350,drawingBufferHeight:900,isContextLost:()=>lost,getParameter:key=>key===1?(options.maxBuffer??16384):(options.maxViewport??[16384,16384])};
 const canvas={width:1350,height:900,toBlob(callback){
  events.push({type:'encode'});
  if(options.encodeThrow)throw new Error('Controlled encoder failure');
  const value=options.nullBlob?null:options.invalidPng?new Blob(['not a PNG'],{type:'image/png'}):png(options.wrongDimensions?1280:this.width,options.wrongDimensions?720:this.height);
  queueMicrotask(()=>{if(options.staleDuringEncode)current=false;callback(value);});
 }};
 const renderer={capabilities:{maxTextureSize:options.maxTexture??16384},domElement:canvas,
  getContext:()=>gl,getSize:v=>v.copy(logical),getPixelRatio:()=>pixelRatio,getViewport:v=>v.copy(viewport),getScissor:v=>v.copy(scissor),getScissorTest:()=>scissorTest,getRenderTarget:()=>target,getActiveCubeFace:()=>activeFace,getActiveMipmapLevel:()=>activeMip,
  setPixelRatio:value=>{pixelRatio=value;},setSize:(width,height)=>{logical.set(width,height);canvas.width=Math.floor(width*pixelRatio);canvas.height=Math.floor(height*pixelRatio);gl.drawingBufferWidth=options.smallBuffer&&width>900?1000:canvas.width;gl.drawingBufferHeight=canvas.height;viewport.set(0,0,width,height);},
  setViewport:value=>viewport.copy(value),setScissor:value=>scissor.copy(value),setScissorTest:value=>{scissorTest=value;},setRenderTarget:(value,face=0,mip=0)=>{target=value;activeFace=face;activeMip=mip;},
  render(scene,camera){events.push({type:'capture-render',camera});draws.push({camera:camera.clone(),width:canvas.width,height:canvas.height,target,scissorTest});if(options.renderThrow)throw new Error('Controlled renderer failure');if(options.contextLost)lost=true;}
 };
 const camera=options.orthographic?new THREE.OrthographicCamera(-9,9,3,-3,.1,100):new THREE.PerspectiveCamera(50,3,.1,100);
 camera.position.set(3,7,12);camera.lookAt(0,1,0);camera.updateMatrixWorld();
 const originalCamera=camera.toJSON(),stage={renderer,camera,scene:new THREE.Scene(),prepareFrame(view){events.push({type:'prepare',camera:view});},render(){events.push({type:'restore',camera:this.camera});this.prepareFrame(this.camera);restores++;}};
 const args={stage,ready:async()=>({failures:options.missingTexture?['missing-texture']:[]}),isCurrent:()=>current,onProgress:(value,message)=>progress.push({value,message})};
 function assertRestored(){
  assert.deepEqual(logical.toArray(),[900,600]);assert.equal(pixelRatio,1.5);assert.deepEqual([canvas.width,canvas.height],[1350,900]);
  assert.deepEqual(viewport.toArray(),originalViewport.toArray());assert.deepEqual(scissor.toArray(),originalScissor.toArray());assert.equal(scissorTest,true);assert.equal(target,originalTarget);assert.equal(activeFace,2);assert.equal(activeMip,1);
  assert.deepEqual(camera.toJSON(),originalCamera);
 }
 return {args,stage,draws,progress,events,assertRestored,restores:()=>restores};
}
let passed=0;
async function test(name,run){await run();passed++;console.log('PASS '+name);}

await test('Existing 4K API renders native pixels and restores viewport, scissor, render target and camera',async()=>{
 const f=fixture(),blob=await renderCurrent4K(f.args);assert.equal(blob.type,'image/png');
 assert.deepEqual([f.draws[0].width,f.draws[0].height],[3840,2160]);assert.equal(f.draws[0].target,null);assert.equal(f.draws[0].scissorTest,false);f.assertRestored();assert.equal(f.restores(),1);assert.equal(f.progress.at(-1).value,100);
});
await test('8K requests a real 7680 × 4320 drawing buffer and returns matching PNG dimensions',async()=>{
 const f=fixture(),blob=await renderHighResolution({...f.args,width:7680,height:4320}),header=new DataView(await blob.arrayBuffer());
 assert.deepEqual([f.draws[0].width,f.draws[0].height],[7680,4320]);assert.deepEqual([header.getUint32(16),header.getUint32(20)],[7680,4320]);f.assertRestored();
});
await test('Export prepares the cloned camera before capture and encoding, then prepares the interactive camera on restoration',async()=>{
 for(const orthographic of [false,true])for(const [width,height] of [[3840,2160],[7680,4320]]){
  const f=fixture({orthographic});await renderHighResolution({...f.args,width,height});
  assert.deepEqual(f.events.map(event=>event.type),['prepare','capture-render','encode','restore','prepare']);
  assert.notEqual(f.events[0].camera,f.stage.camera,'Frame preparation must use the export camera, not the previous interactive camera');
  assert.equal(f.events[0].camera,f.events[1].camera,'The prepared camera must be the one used for the captured render');
  assert.equal(f.events[3].camera,f.stage.camera);assert.equal(f.events[4].camera,f.stage.camera);
  assert.deepEqual(f.events[0].camera.projectionMatrix.toArray(),f.draws[0].camera.projectionMatrix.toArray());
  f.assertRestored();
 }
});
await test('Perspective and orthographic exports preserve the complete original visible extent',async()=>{
 for(const orthographic of [false,true]){
  const f=fixture({orthographic}),original=f.stage.camera;await renderHighResolution({...f.args,width:7680,height:4320});const output=f.draws[0].camera;
  assert.ok(original.position.equals(output.position));assert.ok(original.quaternion.equals(output.quaternion));
  if(orthographic){assert.ok(output.left<=original.left);assert.ok(output.right>=original.right);assert.ok(output.top>=original.top);assert.ok(output.bottom<=original.bottom);}
  else{const originalHorizontal=Math.tan(THREE.MathUtils.degToRad(original.fov)/2)*original.aspect,outputHorizontal=Math.tan(THREE.MathUtils.degToRad(output.fov)/2)*output.aspect;assert.ok(outputHorizontal+1e-12>=originalHorizontal);assert.ok(output.fov>=original.fov);}
  f.assertRestored();
 }
});
await test('Unsupported sizes and hardware limits reject before changing the renderer',async()=>{
 const f=fixture();await assert.rejects(renderHighResolution({...f.args,width:1920,height:1080}),/resolução nativa/);f.assertRestored();assert.equal(f.draws.length,0);
 for(const options of [{maxBuffer:4096},{maxTexture:4096},{maxViewport:[4096,4096]}]){const limited=fixture(options);await assert.rejects(renderHighResolution({...limited.args,width:7680,height:4320}),/não suporta uma imagem 8K nativa/);limited.assertRestored();assert.equal(limited.draws.length,0);}
});
await test('Browser drawing-buffer truncation is rejected rather than silently upscaled',async()=>{
 const f=fixture({smallBuffer:true});await assert.rejects(renderHighResolution({...f.args,width:7680,height:4320}),/criar a imagem 8K nativa/);f.assertRestored();assert.equal(f.draws.length,0);
});
await test('Renderer, encoder and context-loss failures restore interactive buffer dimensions',async()=>{
 for(const [options,message] of [[{renderThrow:true},/preparar a imagem 8K/],[{encodeThrow:true},/codificar/],[{contextLost:true},/memória gráfica/],[{nullBlob:true},/codificar/]]){
  const f=fixture(options);await assert.rejects(renderHighResolution({...f.args,width:7680,height:4320}),message);f.assertRestored();
 }
});
await test('Invalid PNGs, mismatched dimensions and a changed configuration cannot be returned',async()=>{
 for(const [options,message] of [[{invalidPng:true},/PNG válida/],[{wrongDimensions:true},/resolução produzida/],[{staleDuringEncode:true},/configuração mudou/]]){
  const f=fixture(options);await assert.rejects(renderHighResolution(f.args),message);f.assertRestored();assert.notEqual(f.progress.at(-1).value,100);
 }
});
await test('Missing textures block export without mutating the existing scene',async()=>{
 const f=fixture({missingTexture:true});await assert.rejects(renderHighResolution(f.args),/Falta uma textura/);f.assertRestored();assert.equal(f.draws.length,0);
});
console.log(JSON.stringify({passed,failed:0}));
