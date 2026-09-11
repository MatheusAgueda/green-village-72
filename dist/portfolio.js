import {DATA} from './data.js';
import {SWATCHES,summaryRows,validateConfiguration} from './configuration.js';
import {INTERIOR_REFERENCES} from './interior-references.js';
import {referenceCropAsset} from './material-library.js';
import {getPlan,REVISION} from './specification.js';

export const PRESENTATION_REVISION='GV72-R8-2026-09-10';
export const BRAND_ASSET='assets/catalogue/reference/logo-white.png';
export const CONTACT_EMAIL='info@greenvillagemobilehomes.com';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function configurationReference(configuration){
 const canonical=JSON.stringify(validateConfiguration(configuration));let hash=2166136261;
 for(let i=0;i<canonical.length;i++)hash=Math.imul(hash^canonical.charCodeAt(i),16777619);
 return 'GV72-'+(hash>>>0).toString(16).toUpperCase().padStart(8,'0');
}
export function selectionMaterials(s){
 const material=(id,title,colour)=>{const x=SWATCHES.find(x=>x.id===id);return {title,name:x?.label||'Cor livre '+colour,image:x?referenceCropAsset(id):null,colour,source:x?'Catálogo 2026 · p. '+x.page:'Cor de visualização'};};
 const k=INTERIOR_REFERENCES[s.kitchenRef],b=INTERIOR_REFERENCES[s.bathroomRef];
 return [material(s.exteriorId,'Fachada',s.exterior),material(s.floorId,'Pavimento SPC',s.floor),{title:'Paredes interiores',name:s.interiorName,colour:s.interior,source:'Cor de visualização · '+s.interior},...(s.kitchen==='none'?[]:[{title:'Cozinha · '+s.kitchenRef.slice(-2),name:k.name,image:k.sourceAsset,source:'Catálogo 2026 · p. '+k.sourcePage}]),{title:'Casa de banho · '+s.bathroomRef.slice(-2),name:b.name,image:b.sourceAsset,source:'Catálogo 2026 · p. '+b.sourcePage},...(s.bathroomUV?[material(s.bathroomUV,'Revestimento UV do banho',null)]:[])];
}
export function selectionGroups(s){
 const rows=summaryRows(s),k=INTERIOR_REFERENCES[s.kitchenRef],b=INTERIOR_REFERENCES[s.bathroomRef];
 return [
  {title:'Espaço e distribuição',rows:[rows[0],rows[1],['Dimensões exteriores','11,80 × 6,22 m'],['Quartos',String(DATA.layouts.find(p=>p.id===s.layout).bedrooms)],['Casas de banho','1']]},
  {title:'Acabamentos e ambientes',rows:[rows[2],rows[3],rows[4],rows[5],['Referência de cozinha',s.kitchen==='none'?'Guardada, sem cozinha representada':s.kitchenRef.slice(-2)+' · '+k.name],rows[7],['Ambiente de banho',s.bathroomRef.slice(-2)+' · '+b.name],rows[8]]},
  {title:'Cobertura e apresentação',rows:[rows[12],rows[13],rows[10],rows[11]]}
 ];
}
export function summaryMarkup(s,{image,plan,warning}={}){
 const p=getPlan(s),ref=configurationReference(s);
 return `<div class="summary-heading"><strong>${esc(p.label)} · Expandível 72</strong><small>Referência ${ref}</small></div><p class="summary-meta">${p.bedrooms} ${p.bedrooms===1?'quarto':'quartos'} · 1 casa de banho · 11,80 × 6,22 m exteriores</p><div class="summary-visuals">${image?`<figure><img class="summary-thumbnail" src="${image}" alt="Vista da sua configuração no estúdio"><figcaption>Vista guardada no estúdio</figcaption></figure>`:''}<figure><div class="summary-plan">${plan||''}</div><figcaption>Planta da sua configuração · áreas estimadas</figcaption></figure></div>${warning?`<p class="summary-note">${esc(warning)}</p>`:''}<div class="summary-materials">${selectionMaterials(s).map(m=>`<article class="summary-material">${m.image?`<img src="${m.image}" alt="${esc(m.name)}">`:`<div class="colour-chip" style="--chip:${m.colour}"></div>`}<span>${esc(m.title)}</span><strong>${esc(m.name)}</strong><small>${esc(m.source)}</small></article>`).join('')}</div>${selectionGroups(s).map(group=>`<section class="summary-group"><h3>${group.title}</h3><dl class="details-list">${group.rows.map(([k,v])=>`<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl></section>`).join('')}<div class="summary-commercial"><h3>Pronto para preparar a proposta.</h3><p>Guarde o PDF e partilhe as suas escolhas com a Green Village. A proposta deverá confirmar compatibilidade, equipamentos incluídos, transporte, instalação e valor final.</p><a href="mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Configuração Expandível 72 · '+ref)}">${CONTACT_EMAIL} ↗</a><p class="caption-note">Contacto publicado no catálogo, p. 19. O PDF é um resumo de preferências, sem orçamento total.</p></div><p class="summary-note">Designação comercial: 72 m². A área útil certificada não consta dos anexos. Medidas interiores e detalhes não cotados são estimados. Instalações e mecanismo exacto de expansão aguardam documentação. Valores sob consulta.</p>`;
}

// Four fixed-purpose spreads with measured wrapping and explicit page boundaries.
export async function createPortfolioPDF(s,{image,planImage}={}){
 const {PDFDocument,StandardFonts,rgb}=window.PDFLib,doc=await PDFDocument.create();
 const regular=await doc.embedFont(StandardFonts.Helvetica),bold=await doc.embedFont(StandardFonts.HelveticaBold);
 const W=595.28,H=841.89,M=36,green=rgb(.086,.247,.18),ink=rgb(.12,.23,.16),muted=rgb(.31,.41,.33),pale=rgb(.94,.96,.92),white=rgb(1,1,1);
 const ref=configurationReference(s),date=new Intl.DateTimeFormat('pt-PT').format(new Date());
 const supportedCharacters=new Set(regular.getCharacterSet());
 const pdfText=value=>[...String(value).normalize('NFC').replace(/\p{Cc}/gu,' ')].map(c=>supportedCharacters.has(c.codePointAt(0))?c:'?').join('');
 function wrap(value,width,size=10,font=regular){const lines=[''];for(const word of pdfText(value).split(/\s+/)){let rest=word;while(rest){const last=lines.length-1,joined=lines[last]+(lines[last]?' ':'')+rest;if(font.widthOfTextAtSize(joined,size)<=width){lines[last]=joined;break;}if(lines[last]){lines.push('');continue;}let end=1;while(end<rest.length&&font.widthOfTextAtSize(rest.slice(0,end+1),size)<=width)end++;lines[last]=rest.slice(0,end);rest=rest.slice(end);if(rest)lines.push('');}}return lines;}
 function text(page,value,x,y,{size=10,font=regular,color=ink,width}={}){const lines=width?wrap(value,width,size,font):[pdfText(value)];for(const line of lines){if(y<40)throw new Error('O conteúdo do PDF excedeu a área da página.');page.drawText(line,{x,y,size,font,color});y-=size*1.42;}return y;}
 const fetched=new Map();
 async function embed(src){if(!src)return null;if(fetched.has(src))return fetched.get(src);const result=(async()=>{const response=await fetch(src);if(!response.ok)throw new Error('Não foi possível carregar uma imagem do resumo.');const bytes=new Uint8Array(await response.arrayBuffer());return bytes[0]===137?doc.embedPng(bytes):doc.embedJpg(bytes);})();fetched.set(src,result);return result;}
 const logo=await embed(BRAND_ASSET);
 async function photo(page,src,x,y,w,h,{background=pale}={}){page.drawRectangle({x,y,width:w,height:h,color:background});const im=await embed(src);if(!im)return;const scale=Math.min(w/im.width,h/im.height);page.drawImage(im,{x:x+(w-im.width*scale)/2,y:y+(h-im.height*scale)/2,width:im.width*scale,height:im.height*scale});}
 function base(title,number){const page=doc.addPage([W,H]);page.drawRectangle({x:0,y:H-94,width:W,height:94,color:green});page.drawImage(logo,{x:M,y:H-64,width:205,height:205*logo.height/logo.width});text(page,'EXPANDÍVEL 72',W-M-124,H-41,{size:12,font:bold,color:white});text(page,'PORTFÓLIO / 2026',W-M-124,H-62,{size:9,color:rgb(.77,.86,.75)});text(page,title,M,H-134,{size:26,font:bold});page.drawLine({start:{x:M,y:37},end:{x:W-M,y:37},thickness:.6,color:rgb(.77,.82,.76)});page.drawText(`${ref}  ·  ${date}`,{x:M,y:22,size:8,font:regular,color:muted});page.drawText(`${number} / 4`,{x:W-M-22,y:22,size:8,font:regular,color:muted});return page;}
 const cover=base('A sua configuração.',1),layout=DATA.layouts.find(p=>p.id===s.layout);
 text(cover,'O espaço, os materiais e os detalhes que escolheu.',M,673,{size:12,color:muted});
 if(image){await photo(cover,image,M,330,W-2*M,315);text(cover,'Vista guardada no estúdio · modelo 3D de apresentação',M,314,{size:9,color:muted});}
 else {cover.drawRectangle({x:M,y:440,width:W-2*M,height:180,color:pale});text(cover,'Configuração sem imagem 3D',M+24,535,{size:20,font:bold});text(cover,'As escolhas, as referências e a planta seguem nas próximas páginas.',M+24,503,{size:11,width:450,color:muted});}
 const facts=[['MODELO','72 m² comerciais'],['PLANTA',layout.label],['DIMENSÕES','11,80 × 6,22 m']];facts.forEach(([k,v],i)=>{const x=M+i*178;text(cover,k,x,274,{size:9,color:muted});text(cover,v,x,251,{size:17,font:bold});});
 text(cover,`${layout.bedrooms} ${layout.bedrooms===1?'quarto':'quartos'} · 1 casa de banho · ${s.roof?'telhado triangular':'cobertura plana'}${s.porch?' · alpendre seleccionado':''}`,M,214,{size:11,width:W-2*M});
 text(cover,'Uma base para a sua proposta.',M,165,{size:17,font:bold});
 text(cover,'Este documento reúne as suas preferências. A Green Village deverá confirmar a compatibilidade, o âmbito do fornecimento, o transporte, a instalação e o preço final.',M,141,{size:11,width:W-2*M,color:muted});
 text(cover,CONTACT_EMAIL,M, 72,{size:11,font:bold});
 const materials=base('Os seus acabamentos.',2);
 text(materials,'Amostras e fotografias de referência do catálogo original.',M,673,{size:11,color:muted});
 const cards=selectionMaterials(s),cw=(W-2*M-28)/3,rows=[];
 for(let i=0;i<cards.length;i+=3){const entries=cards.slice(i,i+3);const textHeight=Math.max(...entries.map(m=>20+wrap(m.title,cw,9).length*9*1.42+6+wrap(m.name,cw,12,bold).length*12*1.42+6+wrap(m.source,cw,9).length*9*1.42+20));rows.push({entries,textHeight});}
 const photoHeight=Math.min(128,(496-rows.reduce((n,row)=>n+row.textHeight,0))/rows.length);if(photoHeight<70)throw new Error('Os nomes dos materiais excedem o espaço do resumo.');let top=638;
 for(const row of rows){for(let col=0;col<row.entries.length;col++){const m=row.entries[col],x=M+col*(cw+14);
  if(m.image)await photo(materials,m.image,x,top-photoHeight,cw,photoHeight);
  else {const c=m.colour;materials.drawRectangle({x,y:top-photoHeight,width:cw,height:photoHeight,color:rgb(parseInt(c.slice(1,3),16)/255,parseInt(c.slice(3,5),16)/255,parseInt(c.slice(5,7),16)/255)});}
  let y=text(materials,m.title,x,top-photoHeight-20,{size:9,color:muted,width:cw});y=text(materials,m.name,x,y-6,{size:12,font:bold,width:cw});text(materials,m.source,x,y-6,{size:9,color:muted,width:cw});
 }top-=photoHeight+row.textHeight;}
 text(materials,'As amostras digitais reproduzem as referências seleccionadas. A luz e o ecrã alteram a percepção da cor; escala dos padrões e rugosidade não foram medidas pelo fabricante. Paredes interiores: cor de visualização, sem equivalência RAL/NCS documentada.',M,115,{size:9,width:W-2*M,color:muted});
 const plan=base('O espaço que escolheu.',3);
 text(plan,layout.label+' · '+layout.bedrooms+(layout.bedrooms===1?' quarto':' quartos')+' · 1 casa de banho',M,673,{size:12,font:bold});
 await photo(plan,planImage,M,150,W-2*M,499,{background:white});
 text(plan,'Cotas exteriores: 11,80 × 6,22 m. Rectângulo exterior: 73,396 m².',M,125,{size:10,font:bold});
 text(plan,'72 m² é a designação comercial. Áreas interiores calculadas com espessuras assumidas; área útil certificada não documentada. Cozinha proposta no espaço livre, não cotada no XLSX. Alpendre e cobertura adicional excluídos destas áreas.',M,101,{size:9,width:W-2*M,color:muted});
 const detail=base('Todos os pormenores.',4);let y=674;
 for(const group of selectionGroups(s)){y=text(detail,group.title,M,y,{size:13,font:bold})-7;for(const [label,value]of group.rows){const vlines=wrap(value,329,9),llines=wrap(label,176,9),rh=Math.max(vlines.length,llines.length)*12.78+8;text(detail,label,M,y,{size:9,color:muted,width:176});text(detail,value,M+190,y,{size:9,width:329});y-=rh;}y-=9;}
 y-=4;text(detail,'Condições a confirmar com a Green Village',M,y,{size:11,font:bold});
 text(detail,'Valores sob consulta. Este resumo não substitui a proposta comercial nem um projecto de execução. Medidas não cotadas são estimadas. Instalações e mecanismo exacto de expansão aguardam documentação.',M,y-20,{size:9,width:W-2*M,color:muted});
 doc.setTitle('Green Village · Expandível 72 · '+layout.label+' · '+ref);doc.setAuthor('Green Village Mobile Homes');doc.setSubject('Apresentação '+PRESENTATION_REVISION+' · geometria '+REVISION);doc.setKeywords(['Green Village','Expandível 72',layout.label,ref]);
 return doc.save();
}
