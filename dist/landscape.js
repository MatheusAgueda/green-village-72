import * as THREE from './vendor/three.module.js';

const ASSETS='assets/scene-r35/';

/** A landscaped presentation, deliberately outside the product specification. */
export function createLandscape(scene,ground,{onChange=()=>{},loadAssets=typeof document!=='undefined'}={}){
 const root=new THREE.Group();root.name='Jardim · inspiração Grande Porto';root.userData.presentationOnly=true;scene.add(root);
 const geometries=new Set(),materials=new Set(),textures=new Set(),failures=[];
 const gm=ground.material,original={map:gm.map,normalMap:gm.normalMap,roughnessMap:gm.roughnessMap,color:gm.color.clone(),normalScale:gm.normalScale.clone(),envMapIntensity:gm.envMapIntensity,fog:scene.fog};
 let disposed=false,visible=true,pending=null,loaded=false;
 let seed=724035;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const mat=(color,props={})=>{const m=new THREE.MeshStandardMaterial({color,roughness:1,...props});materials.add(m);return m;};
 const add=(geo,material,name,x,y,z)=>{geometries.add(geo);const m=new THREE.Mesh(geo,material);m.name=name;m.position.set(x,y,z);m.receiveShadow=true;m.castShadow=true;root.add(m);return m;};
 const grass=mat('#b8cfa0'),stone=mat('#bbb9af'),paving=mat('#c5c3b8'),earth=mat('#4e4435'),metal=mat('#343c35',{roughness:.65,metalness:.5});
 // World-scale UVs prevent long walls from stretching one photograph over their length.
 function boxGeometry(w,h,d){const g=new THREE.BoxGeometry(w,h,d),uv=g.attributes.uv,pos=g.attributes.position,n=g.attributes.normal;for(let i=0;i<uv.count;i++){const a=Math.abs(n.getX(i)),b=Math.abs(n.getY(i));uv.setXY(i,(a>.5?pos.getZ(i):pos.getX(i))/2,(b>.5?pos.getZ(i):pos.getY(i))/2);}return g;}
 for(const x of [-15.5,15.5])add(boxGeometry(.44,.68,34),stone,'Muro baixo de pedra · cenário',x,-.025,-1.8);
 add(boxGeometry(31,.68,.44),stone,'Muro posterior · cenário',0,-.025,-18.6);
 for(const x of [-15.5,15.5])add(boxGeometry(.52,.08,34.1),paving,'Remate em pedra',x,.355,-1.8);
 add(boxGeometry(31.4,.08,.52),paving,'Remate posterior',0,.355,-18.6);
 // Entrance path starts beyond the deepest selectable terrace, without replacing it.
 const shape=new THREE.Shape();shape.moveTo(-.9,-.34);shape.lineTo(.9,-.34);shape.lineTo(.9,.34);shape.lineTo(-.9,.34);shape.closePath();
 const slabGeometry=new THREE.ExtrudeGeometry(shape,{depth:.045,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.018,bevelThickness:.012});slabGeometry.rotateX(-Math.PI/2);
 const accessSlabs=[];
 for(let z=6.6;z<17;z+=.88){const slab=add(slabGeometry,paving,'Laje de acesso',random()*.025-.012,-.33,z);slab.rotation.y=(random()-.5)*.016;accessSlabs.push(slab);}
 const entranceSteps=new THREE.Group();entranceSteps.name='Acesso paisagístico ilustrativo';root.add(entranceSteps);
 for(const [y,z,w,h,d] of [[-.30,.86,1.86,.13,.48],[-.19,.48,1.8,.35,.42],[-.08,.10,1.74,.57,.36]]){
  const step=add(boxGeometry(w,h,d),paving,'Degrau de jardim',0,y,z);entranceSteps.add(step);
 }
 function setEntrance(front=5.9){entranceSteps.position.z=front+.12;for(const slab of accessSlabs)slab.visible=slab.position.z>front+1.1;}
 setEntrance();
 // Small beds and low luminaires frame the house without covering windows or doors.
 for(const x of [-10,10]){
  add(boxGeometry(2.3,.05,16),earth,'Canteiro',x,-.335,-.4);
  for(const dx of [-1.17,1.17])add(boxGeometry(.055,.09,16.1),metal,'Bordadura do canteiro',x+dx,-.31,-.4);
  for(const z of [-7.9,7.1])add(boxGeometry(2.35,.09,.055),metal,'Bordadura do canteiro',x,-.31,z);
 }
 const post=new THREE.BoxGeometry(.075,.58,.075),cap=new THREE.BoxGeometry(.10,.035,.10),lamp=mat('#fff1cf',{emissive:'#fff1cf',emissiveIntensity:.22});
 for(const z of [10.2,13.8,16.4])for(const x of [-1.5,1.5]){add(post,metal,'Balizador de jardim',x,-.07,z);add(cap,lamp,'Difusor de balizador',x,.2,z);}

 // Tapered, curved blades have real silhouettes. Instancing keeps them inexpensive.
 function bladeGeometry(width=.034,bend=.3){
  const vertices=[],indices=[],segments=4;
  for(let i=0;i<=segments;i++){const t=i/segments,w=width*(1-t)*(.8+.2*Math.sin(t*Math.PI));vertices.push(-w/2,t,bend*t*t,w/2,t,bend*t*t);if(i<segments){const j=i*2;indices.push(j,j+1,j+2,j+1,j+3,j+2);}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setIndex(indices);g.computeVertexNormals();geometries.add(g);return g;
 }
 const grassBlade=bladeGeometry(.012,.22),leafMat=mat('#ffffff',{side:THREE.DoubleSide,roughness:.95});
 const transforms=[],colours=[],dummy=new THREE.Object3D(),colour=new THREE.Color();
 for(let i=0;i<68000;i++){
  const x=(random()-.5)*43,z=(random()-.5)*43;
  if((Math.abs(x)<4.25&&z>-6.9&&z<9.2)||(Math.abs(x)<1.15&&z>8.7)||(Math.abs(Math.abs(x)-10)<1.3&&z>-8.5&&z<7.8))continue;
  dummy.position.set(x,-.36,z);dummy.rotation.set((random()-.5)*.12,random()*Math.PI*2,0);const h=.025+random()*.025;dummy.scale.set(.75+random()*.6,h,h);dummy.updateMatrix();transforms.push(dummy.matrix.clone());colour.setHSL(.23+random()*.035,.30+random()*.12,.15+random()*.08);colours.push(colour.clone());
 }
 function instanced(geometry,material,matrices,colors,name){const m=new THREE.InstancedMesh(geometry,material,matrices.length);for(let i=0;i<matrices.length;i++){m.setMatrixAt(i,matrices[i]);m.setColorAt(i,colors[i]);}m.name=name;m.instanceMatrix.needsUpdate=true;m.receiveShadow=true;m.castShadow=false;m.computeBoundingSphere();root.add(m);return m;}
 instanced(grassBlade,leafMat,transforms,colours,'Relva · lâminas de detalhe');
 const reeds=[],reedColours=[],flowerHeads=[],flowerColours=[];
 for(const side of [-1,1])for(let z=-7.1;z<=6.4;z+=1.25){
  const cx=side*(9.7+random()*.5),cz=z+(random()-.5)*.3;
  for(let j=0;j<82;j++){
   const a=random()*Math.PI*2,r=random()*.30;dummy.position.set(cx+Math.cos(a)*r,-.34,cz+Math.sin(a)*r);dummy.rotation.set(0,a,0);dummy.scale.set(.65+random()*.65,.38+random()*.45,.7+random()*.7);dummy.updateMatrix();reeds.push(dummy.matrix.clone());colour.setHSL(.19+random()*.065,.2+random()*.25,.19+random()*.14);reedColours.push(colour.clone());
  }
  for(let j=0;j<16;j++){
   const a=random()*Math.PI*2,r=random()*.36;dummy.position.set(cx+Math.cos(a)*r,.06+random()*.25,cz+Math.sin(a)*r);dummy.rotation.set(random()*.2,a,(random()-.5)*.25);dummy.scale.set(.028,.10+random()*.09,.028);dummy.updateMatrix();flowerHeads.push(dummy.matrix.clone());colour.setHSL(.72+random()*.035,.17,.35+random()*.18);flowerColours.push(colour.clone());
  }
 }
 instanced(bladeGeometry(.04,.5),leafMat,reeds,reedColours,'Gramíneas ornamentais');
 const flowerGeo=new THREE.SphereGeometry(1,5,4);geometries.add(flowerGeo);instanced(flowerGeo,leafMat,flowerHeads,flowerColours,'Espigas floridas');

 function applyGround(){
  if(disposed)return;
  root.visible=visible;scene.fog=original.fog;
  gm.map=visible?grass.map:original.map;gm.normalMap=visible?grass.normalMap:original.normalMap;gm.roughnessMap=visible?grass.roughnessMap:original.roughnessMap;
  gm.color.copy(visible?grass.color:original.color);gm.normalScale.copy(visible?new THREE.Vector2(.20,.20):original.normalScale);gm.envMapIntensity=visible?.35:original.envMapIntensity;gm.needsUpdate=true;
 }
 function load(){
  if(pending||!loadAssets||disposed)return pending||Promise.resolve();
  const jobs=[
   [grass,'map','Grass004_1K-JPG_Color.jpg',true,128.57],
   [grass,'normalMap','Grass004_1K-JPG_NormalGL.jpg',false,128.57],
   [grass,'roughnessMap','Grass004_1K-JPG_Roughness.jpg',false,128.57],
   [stone,'map','granite_wall_diff_1k.jpg',true,1],
   [stone,'normalMap','granite_wall_nor_gl_1k.jpg',false,1],
   [stone,'roughnessMap','granite_wall_rough_1k.jpg',false,1],
   [paving,'map','granite_tile_diff_1k.jpg',true,1],
   [paving,'normalMap','granite_tile_nor_gl_1k.jpg',false,1]
  ];
  pending=Promise.all(jobs.map(async([material,key,file,srgb,repeat])=>{
   try{const texture=await new THREE.TextureLoader().loadAsync(ASSETS+file);if(disposed){texture.dispose();return;}textures.add(texture);texture.colorSpace=srgb?THREE.SRGBColorSpace:THREE.NoColorSpace;texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(repeat,repeat);texture.anisotropy=8;material[key]=texture;if(key==='map'&&material!==grass)material.color.set('#ffffff');material.needsUpdate=true;applyGround();onChange();}
   catch{if(!disposed)failures.push({url:ASSETS+file,error:'Recurso do jardim indisponível'});}
  })).then(()=>{loaded=true;if(!disposed)onChange();});return pending;
 }
 function setVisible(value){visible=Boolean(value);applyGround();if(visible)load();}
 function status(){return{visible:root.visible,ready:!loadAssets||loaded,failures:[...failures],instances:transforms.length+reeds.length+flowerHeads.length};}
 applyGround();
 return{root,setVisible,setEntrance,status,async ready(){if(visible)await load();return{failures:visible?[...failures]:[]};},dispose(){
  if(disposed)return;disposed=true;root.removeFromParent();scene.fog=original.fog;gm.map=original.map;gm.normalMap=original.normalMap;gm.roughnessMap=original.roughnessMap;gm.color.copy(original.color);gm.normalScale.copy(original.normalScale);gm.envMapIntensity=original.envMapIntensity;gm.needsUpdate=true;
  for(const texture of textures)texture.dispose();for(const geometry of geometries)geometry.dispose();for(const material of materials)material.dispose();
 }};
}
