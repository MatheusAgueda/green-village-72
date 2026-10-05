import * as THREE from './vendor/three.module.js';
import {RoundedBoxGeometry} from './vendor/RoundedBoxGeometry.js';

/** Foreground architecture for an illustrative village, separate from the product. */
export function createVillage(scene,{onChange=()=>{},loadAssets=typeof document!=='undefined'}={}){
 const root=new THREE.Group();root.name='Largo de aldeia · inspiração região do Porto';root.userData.presentationOnly=true;root.visible=false;scene.add(root);
 const materials=new Set(),geometries=new Set(),textures=new Set(),failures=[];
 let disposed=false,pending=null,loaded=false;
 const material=(colour,roughness=.9)=>{const m=new THREE.MeshStandardMaterial({color:colour,roughness});materials.add(m);return m;};
 const paving=material('#d4c8b5'),granite=material('#b6b2a7'),timber=material('#82715a',.8),iron=material('#303b38',.65),soil=material('#403c30'),leaf=material('#6b7852');iron.metalness=.55;leaf.side=THREE.DoubleSide;
 // Fade the physically lit foreground into the continuous photographic ground.
 paving.transparent=true;paving.depthWrite=false;
 paving.onBeforeCompile=shader=>{
  shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec2 gvPlazaPosition;').replace('#include <begin_vertex>','#include <begin_vertex>\ngvPlazaPosition=(modelMatrix*vec4(transformed,1.)).xz;');
  shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec2 gvPlazaPosition;').replace('#include <opaque_fragment>','diffuseColor.a *= 1.-smoothstep(14.,24.,length(gvPlazaPosition));\n#include <opaque_fragment>');
 };paving.customProgramCacheKey=()=> 'gv-r38-continuous-plaza';
 const slab=new THREE.PlaneGeometry(150,150);geometries.add(slab);
 const plaza=new THREE.Mesh(slab,paving);plaza.rotation.x=-Math.PI/2;plaza.position.y=-.364;plaza.receiveShadow=true;root.add(plaza);
 plaza.renderOrder=-999;
 function box(parent,w,h,d,x,y,z,mat,name){const g=new RoundedBoxGeometry(w,h,d,2,Math.min(.012,h*.1,d*.1));geometries.add(g);const m=new THREE.Mesh(g,mat);m.position.set(x,y,z);m.name=name;m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 const entrance=new THREE.Group();root.add(entrance);
 for(const [y,z,w,h,d] of [[-.29,.88,2.05,.15,.5],[-.19,.48,1.96,.35,.45],[-.08,.12,1.88,.57,.4]])box(entrance,w,h,d,0,y,z,granite,'Degrau de acesso · cenário');
 function setEntrance(front=5.9){entrance.position.z=front+.12;}
 setEntrance();
 // Low planted edges establish a human-scale forecourt beyond the product envelope.
 const beds=[];
 for(const side of [-1,1]){
  for(const z of [-5.6,6.4]){
   const x=side*9.4,w=1.25,d=3.25,top=.04;
   box(root,w,.11,d,x,-.315,z,granite,'Base de canteiro · cenário');
   box(root,w-.14,.24,d-.14,x,-.16,z,soil,'Terra de canteiro · cenário');
   for(const edge of [-1,1]){
    box(root,.13,.4,d,x+edge*(w-.13)/2,-.165,z,granite,'Lancil de canteiro · cenário');
    box(root,w-.26,.4,.13,x,-.165,z+edge*(d-.13)/2,granite,'Topo de canteiro · cenário');
   }
   beds.push({x,z,w:w-.25,d:d-.25,y:top});
  }
  for(const z of [-6,-2,2,6])box(root,.16,.09,3.85,side*8.5,-.33,z,granite,'Guia lateral do largo · cenário');
 }
 // Bent, tapered blades share one geometry and draw call; no spherical vegetation.
 const blade=new THREE.BufferGeometry();blade.setAttribute('position',new THREE.Float32BufferAttribute([-.018,0,0,.018,0,0,-.012,.26,.035,.012,.26,.035,0,.53,.14],3));blade.setIndex([0,1,2,1,3,2,2,3,4]);blade.computeVertexNormals();geometries.add(blade);
 const grass=new THREE.InstancedMesh(blade,leaf,beds.length*600),dummy=new THREE.Object3D(),colour=new THREE.Color();grass.name='Gramineas dos canteiros · cenário';grass.castShadow=true;grass.receiveShadow=true;
 let seed=37072,index=0;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 for(const bed of beds)for(let n=0;n<600;n++){
  dummy.position.set(bed.x+(random()-.5)*bed.w,bed.y,bed.z+(random()-.5)*bed.d);dummy.rotation.set(0,random()*Math.PI*2,0);const height=.65+random()*.7;dummy.scale.set(.7+random()*.8,height,.65+random()*.7);dummy.updateMatrix();grass.setMatrixAt(index,dummy.matrix);colour.setHSL(.19+random()*.04,.18+random()*.16,.29+random()*.13);grass.setColorAt(index++,colour);
 }
 grass.instanceMatrix.needsUpdate=true;grass.instanceColor.needsUpdate=true;grass.computeBoundingSphere();root.add(grass);
 // Timber slats and metal feet, with open space around every optional terrace.
 for(const x of [-9.5,9.5]){
  const bench=new THREE.Group();bench.position.set(x,-.365,3.5);bench.rotation.y=x<0?Math.PI/2:-Math.PI/2;root.add(bench);
  for(const z of [-.2,-.07,.06,.19])box(bench,1.7,.045,.10,0,.47,z,timber,'Ripa de banco · cenário');
  for(const y of [.68,.81,.94])box(bench,1.7,.1,.04,0,y,-.26,timber,'Encosto de banco · cenário');
  for(const side of [-.63,.63]){box(bench,.055,.48,.055,side,.24,.17,iron,'Pé de banco');box(bench,.055,.98,.055,side,.49,-.24,iron,'Suporte de banco');}
 }
 function load(){
  if(pending||!loadAssets||disposed)return pending||Promise.resolve();
  pending=Promise.all([['map','diff',true],['normalMap','nor_gl',false],['roughnessMap','rough',false]].map(async([key,kind,srgb])=>{
   const url=`assets/scene-r37/cobblestone_01_${kind}_2k.jpg`;
   try{const texture=await new THREE.TextureLoader().loadAsync(url);if(disposed){texture.dispose();return;}textures.add(texture);texture.colorSpace=srgb?THREE.SRGBColorSpace:THREE.NoColorSpace;texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(150/1.6,150/1.6);texture.anisotropy=16;paving[key]=texture;if(key==='map')paving.color.set('#ffffff');paving.normalScale.set(.45,.45);paving.needsUpdate=true;onChange();}
   catch{if(!disposed)failures.push({url,error:'Recurso do largo indisponível'});}
  })).then(()=>{loaded=true;if(!disposed)onChange();});return pending;
 }
 return{root,setEntrance,setVisible(value){root.visible=Boolean(value);if(root.visible)void load();},status(){return{visible:root.visible,ready:!loadAssets||loaded,failures:[...failures]};},async ready(){if(root.visible)await load();return{failures:root.visible?[...failures]:[]};},dispose(){if(disposed)return;disposed=true;root.removeFromParent();for(const x of textures)x.dispose();for(const x of geometries)x.dispose();for(const x of materials)x.dispose();}};
}
