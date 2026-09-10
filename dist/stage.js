import * as THREE from './vendor/three.module.js';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';
export function createStage({canvas=null,width=1280,height=720,pixelRatio=1}={}){
 const renderer=new THREE.WebGLRenderer({canvas:canvas||undefined,antialias:true,alpha:false,preserveDrawingBuffer:true});renderer.setSize(width,height,false);renderer.setPixelRatio(Math.min(pixelRatio,1.75));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.NeutralToneMapping;renderer.toneMappingExposure=1;renderer.localClippingEnabled=true;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 const scene=new THREE.Scene();scene.background=new THREE.Color('#e8ebe5');
 const camera=new THREE.PerspectiveCamera(36,width/height,.05,200);camera.position.set(15.5,11.5,18.5);camera.lookAt(0,.7,0);
 const generator=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment(),environment=generator.fromScene(room,.04);scene.environment=environment.texture;scene.environmentIntensity=.35;room.dispose();generator.dispose();
 const hemi=new THREE.HemisphereLight('#ffffff','#d9ddd5',.9);scene.add(hemi);
 const key=new THREE.DirectionalLight('#ffffff',2.1);key.position.set(-8,17,10);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-13,right:13,top:14,bottom:-14,near:.5,far:50});key.shadow.bias=-.00012;key.shadow.normalBias=.015;scene.add(key);
 const fill=new THREE.DirectionalLight('#ffffff',.35);fill.position.set(12,7,-10);scene.add(fill);
 const groundMat=new THREE.MeshStandardMaterial({color:'#e2e6dc',roughness:.98,metalness:0});const ground=new THREE.Mesh(new THREE.PlaneGeometry(180,180),groundMat);ground.rotation.x=-Math.PI/2;ground.position.y=-.365;ground.receiveShadow=true;scene.add(ground);
 function resize(w,h,ratio=null){renderer.setSize(w,h,false);if(ratio)renderer.setPixelRatio(Math.min(ratio,1.75));camera.aspect=w/h;camera.updateProjectionMatrix();}
 function lighting(mode){const exterior=mode==='exterior';key.color.set(exterior?'#fff5e6':'#ffffff');key.intensity=exterior?2.3:2.1;key.position.set(exterior?-11:-8,exterior?12:17,exterior?5:10);hemi.color.set('#ffffff');hemi.groundColor.set(exterior?'#cbd5c4':'#d9ddd5');scene.background.set(exterior?'#e5eadf':'#e8ebe5');groundMat.color.set(exterior?'#d4dfc6':'#e2e6dc');renderer.toneMappingExposure=1;}
 // Fit all eight corners in camera space instead of fitting an oversized sphere.
 function fitBox(box,direction=new THREE.Vector3(1,.74,1.3),padding=1.17){
  const centre=box.getCenter(new THREE.Vector3()),back=direction.clone().normalize(),right=new THREE.Vector3().crossVectors(camera.up,back).normalize(),up=new THREE.Vector3().crossVectors(back,right),tan=Math.tan(THREE.MathUtils.degToRad(camera.fov)/2);let distance=0;
  for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z]){const p=new THREE.Vector3(x,y,z).sub(centre),depth=p.dot(back);distance=Math.max(distance,depth+Math.abs(p.dot(right))*padding/(tan*camera.aspect),depth+Math.abs(p.dot(up))*padding/tan);}
  camera.zoom=1;camera.position.copy(centre).addScaledVector(back,distance);camera.near=.05;camera.far=200;camera.lookAt(centre);camera.updateProjectionMatrix();return centre;
 }
 function preset(name,modelBounds){const b=modelBounds||new THREE.Box3(new THREE.Vector3(-3.11,-.18,-5.9),new THREE.Vector3(3.11,2.6,5.9)),c=b.getCenter(new THREE.Vector3()),s=b.getSize(new THREE.Vector3());camera.zoom=1;camera.up.set(0,1,0);
  if(name==='top'){camera.up.set(0,0,-1);const v=THREE.MathUtils.degToRad(camera.fov);const dist=Math.max(s.z/(2*Math.tan(v/2)),s.x/(2*Math.tan(v/2)*camera.aspect))*1.33;camera.position.set(0,dist,0);camera.lookAt(0,0,0);camera.updateProjectionMatrix();return new THREE.Vector3(0,0,0);}
  if(name==='inside')return fitBox(b,new THREE.Vector3(.7,1.2,1.15),1.15);
  const dir=name==='front'?new THREE.Vector3(0,.17,1):name==='right'?new THREE.Vector3(1,.14,0):name==='left'?new THREE.Vector3(-1,.14,0):new THREE.Vector3(1,.78,1.25);
  return fitBox(b,dir,1.17);
 }
 return {renderer,scene,camera,lighting,resize,preset,fitBox,setView(view){ground.position.y=view==='finishes'?-.96:-.365;},render:()=>renderer.render(scene,camera),dispose(){environment.dispose();ground.geometry.dispose();ground.material.dispose();renderer.dispose();}};
}
