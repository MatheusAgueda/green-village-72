import {validateConfiguration} from './configuration.js';

const MAX_ARCHIVE_BYTES=250*1024*1024;
const PNG_SIGNATURE=[137,80,78,71,13,10,26,10];
const encoder=new TextEncoder();
const CRC_TABLE=Uint32Array.from({length:256},(_,index)=>{
 let value=index;for(let bit=0;bit<8;bit++)value=(value>>>1)^((value&1)?0xedb88320:0);return value>>>0;
});
const COPY={
 pt:['GREEN VILLAGE — A SUA CASA','Três perspectivas da configuração actual, em imagens PNG de 3 840 × 2 160 píxeis.','O ficheiro configuration.json contém a referência e as escolhas da configuração.','Visualização ilustrativa. O terreno e o jardim não estão incluídos.','Este conjunto de imagens não declara preços nem constitui uma proposta comercial.','Referência'],
 en:['GREEN VILLAGE — YOUR HOME','Three views of the current configuration, as 3,840 × 2,160 pixel PNG images.','The configuration.json file contains the reference and configuration choices.','Illustrative visualisation. Land and garden are not included.','This image collection states no prices and does not constitute a commercial quotation.','Reference'],
 es:['GREEN VILLAGE — SU CASA','Tres perspectivas de la configuración actual, en imágenes PNG de 3.840 × 2.160 píxeles.','El archivo configuration.json contiene la referencia y las opciones de la configuración.','Visualización ilustrativa. El terreno y el jardín no están incluidos.','Este conjunto de imágenes no indica precios ni constituye una oferta comercial.','Referencia'],
 fr:['GREEN VILLAGE — VOTRE MAISON','Trois vues de la configuration actuelle, sous forme d’images PNG de 3 840 × 2 160 pixels.','Le fichier configuration.json contient la référence et les choix de configuration.','Visualisation illustrative. Le terrain et le jardin ne sont pas inclus.','Cet ensemble d’images n’indique aucun prix et ne constitue pas une proposition commerciale.','Référence'],
 it:['GREEN VILLAGE — LA SUA CASA','Tre viste della configurazione attuale, in immagini PNG da 3.840 × 2.160 pixel.','Il file configuration.json contiene il riferimento e le scelte della configurazione.','Visualizzazione illustrativa. Il terreno e il giardino non sono inclusi.','Questa raccolta di immagini non indica prezzi e non costituisce una proposta commerciale.','Riferimento']
};
const ERRORS={
 pt:{name:'Nome de imagem inválido. Use um nome PNG sem pastas.',duplicate:'Os nomes das imagens não podem repetir-se.',png:'Imagem PNG inválida ou incompleta.',dimensions:'As imagens devem ter 3 840 × 2 160 píxeis.',size:'O conjunto de imagens excede o limite de 250 MB.',count:'São necessárias três imagens para este conjunto.',reference:'Referência de configuração inválida.',file:'Ficheiro de imagem inválido.',incomplete:'Ficheiro de imagem incompleto.'},
 en:{name:'Invalid image name. Use a PNG name without folders.',duplicate:'Image names must not be repeated.',png:'Invalid or incomplete PNG image.',dimensions:'Images must be 3,840 × 2,160 pixels.',size:'The image collection exceeds the 250 MB limit.',count:'Three images are required for this collection.',reference:'Invalid configuration reference.',file:'Invalid image file.',incomplete:'Incomplete image file.'},
 es:{name:'Nombre de imagen no válido. Utilice un nombre PNG sin carpetas.',duplicate:'Los nombres de las imágenes no pueden repetirse.',png:'Imagen PNG no válida o incompleta.',dimensions:'Las imágenes deben tener 3.840 × 2.160 píxeles.',size:'El conjunto de imágenes supera el límite de 250 MB.',count:'Se necesitan tres imágenes para este conjunto.',reference:'Referencia de configuración no válida.',file:'Archivo de imagen no válido.',incomplete:'Archivo de imagen incompleto.'},
 fr:{name:'Nom d’image non valide. Utilisez un nom PNG sans dossier.',duplicate:'Les noms des images ne doivent pas se répéter.',png:'Image PNG non valide ou incomplète.',dimensions:'Les images doivent mesurer 3 840 × 2 160 pixels.',size:'L’ensemble d’images dépasse la limite de 250 Mo.',count:'Trois images sont nécessaires pour cet ensemble.',reference:'Référence de configuration non valide.',file:'Fichier image non valide.',incomplete:'Fichier image incomplet.'},
 it:{name:'Nome immagine non valido. Utilizzi un nome PNG senza cartelle.',duplicate:'I nomi delle immagini non possono ripetersi.',png:'Immagine PNG non valida o incompleta.',dimensions:'Le immagini devono essere di 3.840 × 2.160 pixel.',size:'La raccolta di immagini supera il limite di 250 MB.',count:'Sono necessarie tre immagini per questa raccolta.',reference:'Riferimento della configurazione non valido.',file:'File immagine non valido.',incomplete:'File immagine incompleto.'}
};

function crc32(bytes){
 let crc=0xffffffff;for(const byte of bytes)crc=CRC_TABLE[(crc^byte)&255]^(crc>>>8);return (crc^0xffffffff)>>>0;
}

function imageName(name,seen,fail){
 if(typeof name!=='string'||! /^[\p{L}\p{N}][\p{L}\p{M}\p{N}._ -]*\.png$/iu.test(name)||encoder.encode(name).length>128||/^(con|prn|aux|nul|com[1-9]|lpt[1-9])\./i.test(name))fail('name');
 const key=name.normalize('NFC').toLowerCase();if(seen.has(key))fail('duplicate');seen.add(key);return name;
}

// Check complete PNG framing and chunk checksums; the renderer owns pixel encoding.
function validatePNG(bytes,fail){
 const invalid=()=>fail('png');
 if(bytes.length<57||PNG_SIGNATURE.some((byte,index)=>bytes[index]!==byte))invalid();
 const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
 let position=8,header=false,imageData=false,imageEnded=false,dataEnded=false;
 while(position<bytes.length){
  if(position+12>bytes.length)invalid();
  const length=view.getUint32(position),end=position+12+length;
  if(end>bytes.length)invalid();
  const type=String.fromCharCode(...bytes.subarray(position+4,position+8));
  if(!/^[A-Za-z]{2}[A-Z][A-Za-z]$/.test(type)||crc32(bytes.subarray(position+4,end-4))!==view.getUint32(end-4))invalid();
  if(!header){
   if(type!=='IHDR'||length!==13)invalid();
   if(view.getUint32(position+8)!==3840||view.getUint32(position+12)!==2160)fail('dimensions');
   const depth=bytes[position+16],colour=bytes[position+17];
   if(!({0:[1,2,4,8,16],2:[8,16],3:[1,2,4,8],4:[8,16],6:[8,16]})[colour]?.includes(depth)||bytes[position+18]!==0||bytes[position+19]!==0||bytes[position+20]>1)invalid();
   header=true;
  }else if(type==='IHDR')invalid();
  if(type==='IDAT'){
   if(dataEnded)invalid();
   if(length)imageData=true;
  }else if(imageData)dataEnded=true;
  if(type==='IEND'){
   if(length!==0||!imageData||end!==bytes.length)invalid();
   imageEnded=true;
  }
  position=end;
 }
 if(!imageEnded)invalid();
}

function zip(entries,fail){
 const local=[],central=[];let offset=0,centralSize=0;
 for(const {name,bytes} of entries){
  const encodedName=encoder.encode(name),checksum=crc32(bytes),localHeader=new Uint8Array(30),centralHeader=new Uint8Array(46);
  const first=new DataView(localHeader.buffer),directory=new DataView(centralHeader.buffer);
  // Stored entries, UTF-8 names and a fixed 1980-01-01 DOS date make output stable.
  first.setUint32(0,0x04034b50,true);first.setUint16(4,20,true);first.setUint16(6,0x0800,true);first.setUint16(12,33,true);
  first.setUint32(14,checksum,true);first.setUint32(18,bytes.length,true);first.setUint32(22,bytes.length,true);first.setUint16(26,encodedName.length,true);
  directory.setUint32(0,0x02014b50,true);directory.setUint16(4,20,true);directory.setUint16(6,20,true);directory.setUint16(8,0x0800,true);directory.setUint16(14,33,true);
  directory.setUint32(16,checksum,true);directory.setUint32(20,bytes.length,true);directory.setUint32(24,bytes.length,true);directory.setUint16(28,encodedName.length,true);directory.setUint32(42,offset,true);
  local.push(localHeader,encodedName,bytes);central.push(centralHeader,encodedName);
  offset+=localHeader.length+encodedName.length+bytes.length;centralSize+=centralHeader.length+encodedName.length;
  if(!Number.isSafeInteger(offset)||offset>0xffffffff||offset+centralSize+22>MAX_ARCHIVE_BYTES)fail('size');
 }
 const end=new Uint8Array(22),view=new DataView(end.buffer);
 view.setUint32(0,0x06054b50,true);view.setUint16(8,entries.length,true);view.setUint16(10,entries.length,true);view.setUint32(12,centralSize,true);view.setUint32(16,offset,true);
 return new Blob([...local,...central,end],{type:'application/zip'});
}

/** Export presentation images and public configuration choices, without client records. */
export async function createImageArchive({images,configuration,reference,lang='pt'}={}){
 const language=Object.hasOwn(COPY,lang)?lang:'pt',fail=key=>{throw new Error(ERRORS[language][key]);};
 if(!Array.isArray(images)||images.length!==3)fail('count');
 if(typeof reference!=='string'||!reference.trim()||reference.length>120||/[\u0000-\u001f\u007f]/.test(reference))fail('reference');
 const validated=validateConfiguration(configuration),seen=new Set();
 // Snapshot metadata before the first await so caller edits cannot mix configurations.
 const manifest=encoder.encode(JSON.stringify({reference,configuration:validated},null,2)+'\n');
 const t=COPY[language],readme=encoder.encode(`${t[0]}\n\n${t[5]}: ${reference}\n\n${t.slice(1,5).join('\n\n')}\n`);
 let size=manifest.length+readme.length;
 const sources=images.map(image=>{
  const name=imageName(image?.name,seen,fail),blob=image?.blob;
  if(!(blob instanceof Blob)||!Number.isSafeInteger(blob.size)||blob.size<1)fail('file');
  size+=blob.size;if(size>MAX_ARCHIVE_BYTES)fail('size');
  return{name,blob};
 });
 const entries=[];
 for(const {name,blob} of sources){
  const bytes=new Uint8Array(await blob.arrayBuffer());
  if(bytes.length!==blob.size)fail('incomplete');
  validatePNG(bytes,fail);entries.push({name,bytes});
 }
 return zip([...entries,{name:'configuration.json',bytes:manifest},{name:'README.txt',bytes:readme}],fail);
}
