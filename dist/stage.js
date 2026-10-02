import * as THREE from './vendor/three.module.js';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';
import { HDRLoader } from './vendor/HDRLoader.js';
import { GroundedSkybox } from './vendor/GroundedSkybox.js';
import {createLandscape} from './landscape.js';

export function createStage({canvas=null,width=1280,height=720,pixelRatio=1,environment='garden',mood='daylight',onChange=()=>{}}={}){
 const renderer=new THREE.WebGLRenderer({canvas:canvas||undefined,antialias:true,alpha:false,preserveDrawingBuffer:true});renderer.setSize(width,height,false);renderer.setPixelRatio(Math.min(pixelRatio,1.75));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.NeutralToneMapping;renderer.toneMappingExposure=1;renderer.localClippingEnabled=true;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 const scene=new THREE.Scene();scene.background=new THREE.Color('#e8ebe5');
 const loadAssets=typeof document!=='undefined',hdrURL='assets/scene-r35/lilienstein_2k.hdr';
 let lightMode='neutral',detail=null,currentView='exterior',disposed=false;
 let selectedEnvironment=environment==='studio'?'studio':'garden',selectedMood=mood==='late-afternoon'?'late-afternoon':'daylight';
 let hdrTexture=null,hdrEnvironment=null,hdrSkybox=null,hdrPromise=null,hdrState='idle';const hdrFailures=[];
 let sunDirection=new THREE.Vector3(-.72,.58,.38).normalize();
 let camera=new THREE.PerspectiveCamera(36,width/height,.05,200);camera.position.set(15.5,11.5,18.5);camera.lookAt(0,.7,0);
 const generator=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment(),studioEnvironment=generator.fromScene(room,.04);scene.environment=studioEnvironment.texture;scene.environmentIntensity=.35;room.dispose();generator.dispose();
 const hemi=new THREE.HemisphereLight('#ffffff','#d9ddd5',.9);scene.add(hemi);
 const key=new THREE.DirectionalLight('#ffffff',2.1);key.position.set(-8,17,10);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-13,right:13,top:14,bottom:-14,near:.5,far:60});key.shadow.bias=-.00012;key.shadow.normalBias=.015;scene.add(key,key.target);
 const fill=new THREE.DirectionalLight('#ffffff',.35);fill.position.set(12,7,-10);scene.add(fill,fill.target);
 const groundMat=new THREE.MeshStandardMaterial({color:'#e2e6dc',roughness:.98,metalness:0});const ground=new THREE.Mesh(new THREE.PlaneGeometry(180,180),groundMat);ground.rotation.x=-Math.PI/2;ground.position.y=-.365;ground.receiveShadow=true;scene.add(ground);
 // The detailed plot blends into the photograph beyond the planting boundary.
 // Technical views retain an opaque neutral floor; no photo is part of the model.
 const groundBlend={value:0};ground.renderOrder=-999;
 groundMat.onBeforeCompile=shader=>{
  shader.uniforms.gardenGroundBlend=groundBlend;
  shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec2 vGardenGround;').replace('#include <begin_vertex>','#include <begin_vertex>\nvGardenGround = (modelMatrix * vec4(transformed, 1.0)).xz;');
  shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec2 vGardenGround;\nuniform float gardenGroundBlend;').replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor = mix(roughnessFactor, max(roughnessFactor, 0.9), gardenGroundBlend);').replace('#include <opaque_fragment>','diffuseColor.a *= mix(1.0, 1.0 - smoothstep(22.0, 34.0, length(vGardenGround)), gardenGroundBlend);\n#include <opaque_fragment>');
 };groundMat.customProgramCacheKey=()=> 'gv-r35-ground-transition';
 const notify=()=>{if(!disposed)onChange();};
 const landscape=createLandscape(scene,ground,{onChange:notify,loadAssets});
 const gardenActive=()=>selectedEnvironment==='garden'&&currentView==='exterior'&&!detail;
 function resize(w,h,ratio=null){if(!Number.isFinite(w)||!Number.isFinite(h)||w<1||h<1)return;renderer.setSize(w,h,false);if(ratio)renderer.setPixelRatio(Math.min(ratio,1.75));if(camera.isOrthographicCamera){const height=camera.top-camera.bottom;camera.left=-height*w/h/2;camera.right=height*w/h/2;}camera.aspect=w/h;camera.updateProjectionMatrix();}
 // Read the panorama's brightest sky pixel so its sunlight and direct shadow agree.
 // HDRLoader uses a flipped texture; the first decoded row is the zenith.
 function panoramaSun(texture){
  const {data,width,height}=texture.image||{};if(!data||!width||!height)return sunDirection;
  const stride=Math.max(1,Math.floor(width/512)),decode=texture.type===THREE.HalfFloatType?THREE.DataUtils.fromHalfFloat:value=>value;
  let brightest=0,bestX=width*.9,bestY=height*.3;
  for(let y=stride;y<height*.47;y+=stride)for(let x=0;x<width;x+=stride){const i=(y*width+x)*4,luminance=decode(data[i])*.2126+decode(data[i+1])*.7152+decode(data[i+2])*.0722;if(luminance>brightest){brightest=luminance;bestX=x;bestY=y;}}
  const azimuth=((bestX+.5)/width-.5)*Math.PI*2,elevation=(.5-(bestY+.5)/height)*Math.PI;
  return new THREE.Vector3(Math.cos(azimuth)*Math.cos(elevation),Math.sin(elevation),Math.sin(azimuth)*Math.cos(elevation)).normalize();
 }
 function ensureHDR(){
  if(disposed||!loadAssets||!gardenActive())return Promise.resolve();
  if(hdrPromise)return hdrPromise;
  hdrState='loading';
  hdrPromise=(async()=>{
   let loaded=null,pmrem=null,converted=null,backdrop=null;
   try{
    loaded=await new HDRLoader().loadAsync(hdrURL);
    if(disposed){loaded.dispose();return;}
    loaded.mapping=THREE.EquirectangularReflectionMapping;
    pmrem=new THREE.PMREMGenerator(renderer);converted=pmrem.fromEquirectangular(loaded);
    backdrop=new GroundedSkybox(loaded,3,100,64);backdrop.name='Panorama de apresentação';backdrop.userData.presentationOnly=true;backdrop.position.y=3-.365;backdrop.renderOrder=-1000;backdrop.frustumCulled=false;backdrop.material.depthWrite=false;
    sunDirection=panoramaSun(loaded);hdrEnvironment=converted;hdrTexture=loaded;hdrSkybox=backdrop;scene.add(backdrop);hdrState='ready';
   }catch(error){backdrop?.removeFromParent();backdrop?.geometry.dispose();backdrop?.material.dispose();converted?.dispose();loaded?.dispose();if(!disposed){hdrFailures.push(hdrURL);hdrState='failed';}}
   finally{pmrem?.dispose();if(!disposed){applyLighting();notify();}}
  })();
  return hdrPromise;
 }
 function applyLighting(){
  if(disposed)return;
  const garden=gardenActive(),warm=selectedMood==='late-afternoon';
  landscape.setVisible(garden);
  const blend=Boolean(garden&&hdrSkybox);groundBlend.value=blend?1:0;
  if(groundMat.transparent!==blend){groundMat.transparent=blend;groundMat.needsUpdate=true;}groundMat.depthWrite=!blend;
  if(hdrSkybox)hdrSkybox.visible=garden;
  ground.position.y=detail?-.072:currentView==='finishes'?-.96:-.365;
  scene.background=new THREE.Color('#e8ebe5');scene.environment=studioEnvironment.texture;scene.environmentIntensity=.35;scene.backgroundIntensity=1;scene.backgroundBlurriness=0;scene.backgroundRotation.set(0,0,0);scene.environmentRotation.set(0,0,0);
  if(!garden)groundMat.color.set('#e2e6dc');
  key.color.set('#ffffff');key.intensity=2.1;key.position.set(-8,17,10);key.target.position.set(0,0,0);
  fill.color.set('#ffffff');fill.position.set(12,7,-10);fill.target.position.set(0,0,0);fill.intensity=.35;
  hemi.intensity=.9;hemi.color.set('#ffffff');hemi.groundColor.set('#d9ddd5');renderer.toneMappingExposure=1;
  Object.assign(key.shadow.camera,{left:-13,right:13,top:14,bottom:-14,near:.5,far:60});key.shadow.normalBias=.012;key.shadow.bias=-.0001;key.shadow.radius=2;
  if(garden){
   const rotation=warm?3.85:3.5;
   scene.background=hdrTexture||new THREE.Color(warm?'#e7e1d6':'#dce7eb');scene.environment=hdrEnvironment?.texture||studioEnvironment.texture;
   scene.backgroundRotation.set(0,rotation,0);scene.environmentRotation.set(0,rotation,0);scene.backgroundIntensity=warm?.95:1.08;scene.environmentIntensity=warm?.85:1;
   if(hdrSkybox){hdrSkybox.rotation.y=rotation;hdrSkybox.material.color.setScalar(scene.backgroundIntensity);}
   key.color.set(warm?'#ffe0ba':'#fff6e9');key.intensity=warm?2.15:2.4;key.position.copy(sunDirection).applyAxisAngle(new THREE.Vector3(0,1,0),rotation).multiplyScalar(30);key.target.position.set(0,0,0);
   fill.color.set('#fff8ed');fill.position.set(8,6,15);fill.intensity=warm?1.1:1.5;hemi.color.set('#e7f0ff');hemi.groundColor.set('#7b8066');hemi.intensity=.65;
   renderer.toneMappingExposure=warm?1:.98;
   // Keep texel density around the house and adjacent planting for contact shadows.
   Object.assign(key.shadow.camera,{left:-15,right:15,top:15,bottom:-15,near:.5,far:65});key.shadow.normalBias=.008;key.shadow.bias=-.00007;key.shadow.radius=3;
   void ensureHDR();
  }
  if(detail)detailLighting(detail);
  key.shadow.camera.updateProjectionMatrix();
 }
 function lighting(mode){lightMode=mode;applyLighting();}
 function detailLighting(bounds){
  const centre=bounds.getCenter(new THREE.Vector3()),span=Math.max(bounds.max.x-bounds.min.x,bounds.max.z-bounds.min.z,2.5);
  scene.background=new THREE.Color('#f3f2ef');groundMat.color.set('#f3f2ef');ground.position.y=-.072;
  key.color.set('#ffffff');key.intensity=1.9;key.position.copy(centre).add(new THREE.Vector3(-3.5,7,5));key.target.position.copy(centre);
  fill.color.set('#ffffff');fill.position.copy(centre).add(new THREE.Vector3(4,3.5,3));fill.target.position.copy(centre);fill.intensity=.55;
  hemi.intensity=.7;hemi.groundColor.set('#e2dfd9');scene.environmentIntensity=.55;
  const radius=span*.8;Object.assign(key.shadow.camera,{left:-radius,right:radius,top:radius,bottom:-radius,near:.1,far:22});key.shadow.normalBias=.0015;key.shadow.bias=-.00006;key.shadow.radius=3;key.shadow.camera.updateProjectionMatrix();
 }
 function setDetail(bounds){detail=bounds?.clone()||null;lighting(lightMode);}
 function setEnvironment(value){if(value!=='garden'&&value!=='studio')return false;selectedEnvironment=value;applyLighting();notify();return true;}
 function setMood(value){if(value!=='daylight'&&value!=='late-afternoon')return false;selectedMood=value;applyLighting();notify();return true;}
 function presentationStatus(){
  const garden=gardenActive(),landscapeStatus=landscape.status?.()||{};
  const failures=garden?[...hdrFailures,...(landscapeStatus.failures||[])]:[];
  return {selected:{environment:selectedEnvironment,mood:selectedMood},environment:selectedEnvironment,mood:selectedMood,active:garden?'garden':'studio',ready:!disposed&&(!garden||!loadAssets||((hdrState==='ready'||hdrState==='failed')&&landscapeStatus.ready!==false&&!(landscapeStatus.pending>0))),failures,disposed};
 }
 async function ready(){
  if(!disposed&&gardenActive())await Promise.all([ensureHDR(),landscape.ready?.()]);
  return presentationStatus();
 }
 // Fit all eight corners in camera space instead of fitting an oversized sphere.
 function fitBox(box,direction=new THREE.Vector3(1,.74,1.3),padding=1.17){
  const centre=box.getCenter(new THREE.Vector3()),back=direction.clone().normalize(),right=new THREE.Vector3().crossVectors(camera.up,back).normalize(),up=new THREE.Vector3().crossVectors(back,right),tan=Math.tan(THREE.MathUtils.degToRad(camera.fov)/2);let distance=0;
  for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z]){const p=new THREE.Vector3(x,y,z).sub(centre),depth=p.dot(back);distance=Math.max(distance,depth+Math.abs(p.dot(right))*padding/(tan*camera.aspect),depth+Math.abs(p.dot(up))*padding/tan);}
  if(camera.isOrthographicCamera){let halfHeight=0;for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z]){const p=new THREE.Vector3(x,y,z).sub(centre);halfHeight=Math.max(halfHeight,Math.abs(p.dot(up))*padding,Math.abs(p.dot(right))*padding/camera.aspect);}camera.top=halfHeight;camera.bottom=-halfHeight;camera.left=-halfHeight*camera.aspect;camera.right=halfHeight*camera.aspect;distance=40;}
  camera.zoom=1;camera.position.copy(centre).addScaledVector(back,distance);camera.near=.05;camera.far=200;camera.lookAt(centre);camera.updateProjectionMatrix();return centre;
 }
 function perspective(target=new THREE.Vector3()){if(!camera.isOrthographicCamera)return;const old=camera,distance=(old.top-old.bottom)/(2*old.zoom*Math.tan(THREE.MathUtils.degToRad(36)/2));camera=new THREE.PerspectiveCamera(36,old.aspect,.05,200);camera.position.copy(target).add(old.position.clone().sub(target).normalize().multiplyScalar(distance));camera.quaternion.copy(old.quaternion);camera.up.copy(old.up);}
 function preset(name,modelBounds){const b=modelBounds||new THREE.Box3(new THREE.Vector3(-3.11,-.18,-5.9),new THREE.Vector3(3.11,2.6,5.9));
  const aspect=camera.aspect;
  if(['top','front','back','left','right'].includes(name)){camera=new THREE.OrthographicCamera(-1,1,1,-1,.05,200);camera.aspect=aspect;camera.fov=36;camera.up.set(0,name==='top'?0:1,name==='top'?-1:0);const dir=name==='top'?new THREE.Vector3(0,1,0):name==='front'?new THREE.Vector3(0,0,1):name==='back'?new THREE.Vector3(0,0,-1):new THREE.Vector3(name==='left'?-1:1,0,0);return fitBox(b,dir,1.15);}
  perspective();camera.zoom=1;camera.up.set(0,1,0);
  if(name==='inside')return fitBox(b,new THREE.Vector3(.7,1.2,1.15),1.15);
  if(name==='arrival')return fitBox(b,new THREE.Vector3(.9,.18,1.35),1.22);
  if(name==='garden')return fitBox(b,new THREE.Vector3(-1.15,.15,.9),1.24);
  if(name==='overview')return fitBox(b,new THREE.Vector3(1,.7,1.3),1.35);
  const dir=name==='front'?new THREE.Vector3(0,0,1):name==='back'?new THREE.Vector3(0,0,-1):name==='right'?new THREE.Vector3(1,0,0):name==='left'?new THREE.Vector3(-1,0,0):new THREE.Vector3(1,.30,1.25);
  return fitBox(b,dir,1.17);
 }
 applyLighting();
 return {renderer,scene,setEntrance:front=>landscape.setEntrance?.(front),get camera(){return camera;},perspective,lighting,resize,preset,fitBox,setDetail,setEnvironment,setMood,ready,presentationStatus,setView(view){currentView=view;setDetail(null);},render:()=>{if(!disposed)renderer.render(scene,camera);},dispose(){if(disposed)return;disposed=true;scene.environment=null;scene.background=null;landscape.dispose();hdrSkybox?.removeFromParent();hdrSkybox?.geometry.dispose();hdrSkybox?.material.dispose();hdrEnvironment?.dispose();hdrTexture?.dispose();studioEnvironment.dispose();ground.geometry.dispose();ground.material.dispose();key.shadow.dispose();renderer.dispose();}};
}
