import * as THREE from './vendor/three.module.js';

/** Presentation surroundings only; never part of the house specification or price. */
export function createLandscape(scene,ground){
 const root=new THREE.Group();root.name='Jardim de apresentação';root.userData.presentationOnly=true;scene.add(root);
 const geometries=new Set(),materials=new Set();
 const material=(colour,roughness=1)=>{const m=new THREE.MeshStandardMaterial({color:colour,roughness});materials.add(m);return m;};
 const mesh=(geo,mat)=>{geometries.add(geo);const m=new THREE.Mesh(geo,mat);root.add(m);m.receiveShadow=true;return m;};
 let seed=724026;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const n=512,bytes=new Uint8Array(n*n*4);
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){
  const i=(y*n+x)*4,grain=random()*20;
  bytes[i]=58+grain;bytes[i+1]=82+grain;bytes[i+2]=40+grain*.6;bytes[i+3]=255;
 }
 const grass=new THREE.DataTexture(bytes,n,n,THREE.RGBAFormat);grass.colorSpace=THREE.SRGBColorSpace;grass.wrapS=grass.wrapT=THREE.RepeatWrapping;grass.repeat.set(45,45);grass.generateMipmaps=true;grass.minFilter=THREE.LinearMipmapLinearFilter;grass.magFilter=THREE.LinearFilter;grass.needsUpdate=true;
 const skyMat=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,toneMapped:false,vertexShader:'varying vec3 vDirection; void main(){vDirection=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`varying vec3 vDirection;
 float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
 void main(){vec3 d=normalize(vDirection);float h=max(d.y,0.);vec3 c=mix(vec3(.86,.91,.92),vec3(.29,.58,.80),pow(h,.42));vec2 uv=d.xz/(.18+h)*2.;float f=noise(uv)+.5*noise(uv*2.)+.25*noise(uv*4.);float cloud=smoothstep(1.03,1.42,f)*smoothstep(.07,.32,h)*.62;c=mix(c,vec3(.97,.97,.94),cloud);gl_FragColor=vec4(c,1.);}`});materials.add(skyMat);
 const sky=mesh(new THREE.SphereGeometry(130,32,16),skyMat);sky.name='Céu';sky.receiveShadow=false;sky.renderOrder=-10;
 const stone=material('#bcb8a7'),soil=material('#74684e'),bark=material('#716047'),leaves=[material('#526848'),material('#697c51'),material('#3f5943')];
 const paver=new THREE.BoxGeometry(1.2,.032,.62);for(let z=6.55;z<15;z+=.82){const m=mesh(paver,stone);m.position.set(0,-.343,z);}
 const border=new THREE.BoxGeometry(.12,.07,14);for(const x of [-8.3,8.3]){const m=mesh(border,stone);m.position.set(x,-.335,0);}
 const trunk=new THREE.CylinderGeometry(.075,.11,2.5,8),crown=new THREE.IcosahedronGeometry(1,2),bed=new THREE.CylinderGeometry(.95,.95,.06,24);
 for(const [x,z,s]of [[-13,-15,1.3],[13,-14,1.5],[-18,-22,1.7],[18,-26,1.8]]){
  const earth=mesh(bed,soil);earth.position.set(x,-.325,z);earth.scale.setScalar(s);
  const t=mesh(trunk,bark);t.position.set(x,1.25*s-.35,z);t.scale.setScalar(s);t.castShadow=true;
  for(let j=0;j<18;j++){const c=mesh(crown,leaves[j%3]),a=random()*Math.PI*2,r=random()*.9*s;c.position.set(x+Math.cos(a)*r,2.5*s+random()*.65,z+Math.sin(a)*r);c.scale.set((.38+random()*.4)*s,(.4+random()*.5)*s,(.35+random()*.4)*s);c.rotation.set(random(),random(),random());c.castShadow=true;}
 }
 const shrub=new THREE.IcosahedronGeometry(.38,1);for(const x of [-7.8,7.8])for(let z=-4.5;z<5;z+=1.15){const m=mesh(shrub,leaves[Math.floor(random()*3)]);m.position.set(x,-.10,z);m.scale.set(1.2,.9,1.2);m.castShadow=true;}
 function setVisible(visible){root.visible=visible;scene.fog=visible?new THREE.Fog('#dbe8eb',30,95):null;ground.material.map=visible?grass:null;ground.material.color.set(visible?'#ffffff':'#e2e6dc');ground.material.needsUpdate=true;}
 setVisible(true);
 return {root,setVisible,dispose(){root.removeFromParent();grass.dispose();for(const g of geometries)g.dispose();for(const m of materials)m.dispose();}};
}
