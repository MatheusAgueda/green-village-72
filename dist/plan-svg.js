import {DIM,getPlan} from './specification.js';
import {materialById} from './material-library.js';
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function planSVG(configuration,{compact=false,materialColours={}}={}){
 const p=getPlan(configuration),scale=58,ox=285,oy=80;const X=x=>ox+x*scale,Z=z=>oy+(z+DIM.length/2)*scale;
 const floor=materialColours.floor||materialById(configuration.floorId)?.previewHexApprox||configuration.floor||'#e4dfd3',wall=configuration.interior||'#eee';
 let content='';const rect=(r,fill,stroke='#85988b',rx=0)=>`<rect x="${X(r.x0)}" y="${Z(r.z0)}" width="${(r.x1-r.x0)*scale}" height="${(r.z1-r.z0)*scale}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width=".65"/>`;
 const ln=(x1,y1,x2,y2,style='')=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" ${style}/>`;
 const text=(x,y,str,size=12,more='')=>`<text x="${x}" y="${y}" font-size="${size}" ${more}>${escape(str)}</text>`;
 content+=rect({x0:-DIM.width/2,x1:DIM.width/2,z0:-DIM.length/2,z1:DIM.length/2},floor,'#183c32');
 // Exterior envelope is drawn at the same dimensions and wall thickness as the model.
 for(const wall of p.perimeter){const {axis,c,a,b,holes}=wall;const segments=[a,b,...holes.flatMap(h=>[h.u-h.width/2,h.u+h.width/2])].sort((a,b)=>a-b);
  for(let i=0;i<segments.length-1;i++){const lo=segments[i],hi=segments[i+1];if(holes.some(h=>(lo+hi)/2>h.u-h.width/2&&(lo+hi)/2<h.u+h.width/2))continue;const inward=c>0?-DIM.panel:DIM.panel;
   content+=rect(axis==='x'?{x0:lo,x1:hi,z0:Math.min(c,c+inward),z1:Math.max(c,c+inward)}:{x0:Math.min(c,c+inward),x1:Math.max(c,c+inward),z0:lo,z1:hi},'#29493e','#29493e');}
  for(const h of holes){if(h.kind==='window'){if(axis==='x')content+=ln(X(h.u-h.width/2),Z(c+(c>0?-.04:.04)),X(h.u+h.width/2),Z(c+(c>0?-.04:.04)),'stroke="#4c8992" stroke-width="2.5"');else content+=ln(X(c+(c>0?-.04:.04)),Z(h.u-h.width/2),X(c+(c>0?-.04:.04)),Z(h.u+h.width/2),'stroke="#4c8992" stroke-width="2.5"');}}
 }
 for(const w of p.walls){const cuts=w.door?[[w.a,w.door.u-w.door.width/2],[w.door.u+w.door.width/2,w.b]]:[[w.a,w.b]];for(const [a,b]of cuts)content+=rect(w.axis==='z'?{x0:w.c-w.thickness/2,x1:w.c+w.thickness/2,z0:a,z1:b}:{x0:a,x1:b,z0:w.c-w.thickness/2,z1:w.c+w.thickness/2},'#50685b','#50685b');
  if(w.door){const d=w.door,r=d.width*scale;if(w.axis==='z'){const hx=X(w.c),hy=Z(d.u-d.width/2),direction=w.c>0?1:-1;content+=ln(hx,hy,hx+direction*r,hy,'stroke="#687e70" stroke-width="1"');content+=`<path d="M ${hx},${hy+r} A ${r},${r} 0 0 ${direction>0?0:1} ${hx+direction*r},${hy}" fill="none" stroke="#809487" stroke-width=".8"/>`;}else{const hx=X(d.u-d.width/2),hy=Z(w.c);content+=ln(hx,hy,hx,hy+r,'stroke="#687e70"');content+=`<path d="M ${hx+r},${hy} A ${r},${r} 0 0 1 ${hx},${hy+r}" fill="none" stroke="#809487" stroke-width=".8"/>`;}}
 }
 for(const f of p.furnishings){if(f.type==='bed'){content+=rect(f,'#f8f7ef','#9ea99c',4);content+=rect({x0:f.x0+.05,x1:f.x1-.05,z0:f.z0+.05,z1:f.z0+.39},'#fff','#c7cbbf',3);content+=rect({x0:f.x0+.025,x1:f.x1-.025,z0:f.z0+.75,z1:f.z1-.04},'#c4cfba','#b8c5ae');}
 else if(f.type==='shower'){content+=rect(f,'#e2edf0','#80a6a9',2);content+=ln(X(f.x0),Z(f.z0),X(f.x1),Z(f.z1),'stroke="#bfd0d0"');content+=ln(X(f.x1),Z(f.z0),X(f.x0),Z(f.z1),'stroke="#bfd0d0"');}
 else if(f.type==='toilet'||f.type==='basin'){content+=rect(f,'#fbfcfc','#91a9a2',8);}
 else if(f.type.includes('kitchen')||f.type==='island'){content+=rect(f,'#f2f1eb','#8b9d8e',1);}
 else content+=rect(f,f.type==='sofa'?'#c1cbbb':'#ba9e7f','#9baf9a',4);
 }
 for(const r of p.rooms){const c=r.clear,cx=(c.x0+c.x1)/2,cz=r.kind==='bathroom'?c.z1-.95:(c.z0+c.z1)/2+1.55;content+=text(X(cx),Z(cz),r.kind==='bathroom'?'Banho':r.label,compact?10:12,'text-anchor="middle" font-weight="600"');content+=text(X(cx),Z(cz)+15,`≈ ${r.area.toFixed(1).replace('.',',')} m²`,compact?9:11,'text-anchor="middle" fill="#546d5d"');}
 const commonX=p.compact?0:-1.9,commonZ=p.compact?3.2:2.7;content+=text(X(commonX),Z(commonZ),'Espaço comum',compact?10:12,'text-anchor="middle" font-weight="600"');content+=text(X(commonX),Z(commonZ)+15,`≈ ${p.areas.common.toFixed(1).replace('.',',')} m²`,compact?9:11,'text-anchor="middle" fill="#546d5d"');
 // Dimensions are sourced from the workbook, never measured from a screenshot.
 const y=49;content+=ln(X(-3.11),y,X(3.11),y,'stroke="#173f35"');for(const x of [-3.11,3.11])content+=ln(X(x),y-7,X(x),y+9,'stroke="#173f35"');content+=text(ox,y-10,'6 220 mm',13,'text-anchor="middle"');
 content+=ln(66,Z(-5.9),66,Z(5.9),'stroke="#173f35"');for(const z of [-5.9,5.9])content+=ln(58,Z(z),75,Z(z),'stroke="#173f35"');content+=`<text transform="translate(49,${Z(0)}) rotate(-90)" font-size="13" text-anchor="middle">11 800 mm</text>`;
 const bandY=Z(5.9)+35;for(const [a,b,n] of [[-3.11,-1.1,'2 010'],[-1.1,1.1,'2 200'],[1.1,3.11,'2 010']]){content+=ln(X(a),bandY,X(b),bandY,'stroke="#94a390"');content+=text(X((a+b)/2),bandY+16,n,11,'text-anchor="middle"');}
 content+=text(ox,bandY+39,'Entrada / fachada principal',12,'text-anchor="middle"');
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 570 885" role="img" aria-label="Planta derivada ${escape(p.label)}" style="font-family:Arial,sans-serif;color:#173f35"><rect width="570" height="885" fill="#fff"/><g fill="#173f35">${content}</g><text x="25" y="866" font-family="Arial" font-size="10" fill="#617468">Cotas exteriores confirmadas · áreas e divisões interiores aproximadas</text></svg>`;
}
