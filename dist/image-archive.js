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
 es:['GREEN VILLAGE — SU CASA','Tres perspectivas de la configuración actual, en imágenes PNG de 3.840 × 2.160 píxeles.','El archivo configuration.json contiene la referencia y las opciones de la configuración.','Visualización ilustrativa. El terreno y el jardín no están incluidos.','Este conjunto de imágenes no indica precios ni constituye una oferta comercial.','Referencia']
};

function crc32(bytes){
 let crc=0xffffffff;for(const byte of bytes)crc=CRC_TABLE[(crc^byte)&255]^(crc>>>8);return (crc^0xffffffff)>>>0;
}

function imageName(name,seen){
 if(typeof name!=='string'||! /^[\p{L}\p{N}][\p{L}\p{M}\p{N}._ -]*\.png$/iu.test(name)||encoder.encode(name).length>128||/^(con|prn|aux|nul|com[1-9]|lpt[1-9])\./i.test(name))throw new Error('Nome de imagem inválido. Use um nome PNG sem pastas.');
 const key=name.normalize('NFC').toLowerCase();if(seen.has(key))throw new Error('Os nomes das imagens não podem repetir-se.');seen.add(key);return name;
}

// Check complete PNG framing and chunk checksums; the renderer owns pixel encoding.
function validatePNG(bytes){
 const invalid=()=>{throw new Error('Imagem PNG inválida ou incompleta.');};
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
   if(view.getUint32(position+8)!==3840||view.getUint32(position+12)!==2160)throw new Error('As imagens devem ter 3 840 × 2 160 píxeis.');
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

function zip(entries){
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
  if(!Number.isSafeInteger(offset)||offset>0xffffffff||offset+centralSize+22>MAX_ARCHIVE_BYTES)throw new Error('O conjunto de imagens excede o limite de 250 MB.');
 }
 const end=new Uint8Array(22),view=new DataView(end.buffer);
 view.setUint32(0,0x06054b50,true);view.setUint16(8,entries.length,true);view.setUint16(10,entries.length,true);view.setUint32(12,centralSize,true);view.setUint32(16,offset,true);
 return new Blob([...local,...central,end],{type:'application/zip'});
}

/** Export presentation images and public configuration choices, without client records. */
export async function createImageArchive({images,configuration,reference,lang='pt'}={}){
 if(!Array.isArray(images)||images.length!==3)throw new Error('São necessárias três imagens para este conjunto.');
 if(typeof reference!=='string'||!reference.trim()||reference.length>120||/[\u0000-\u001f\u007f]/.test(reference))throw new Error('Referência de configuração inválida.');
 const validated=validateConfiguration(configuration),seen=new Set();
 // Snapshot metadata before the first await so caller edits cannot mix configurations.
 const manifest=encoder.encode(JSON.stringify({reference,configuration:validated},null,2)+'\n');
 const t=Object.hasOwn(COPY,lang)?COPY[lang]:COPY.pt,readme=encoder.encode(`${t[0]}\n\n${t[5]}: ${reference}\n\n${t.slice(1,5).join('\n\n')}\n`);
 let size=manifest.length+readme.length;
 const sources=images.map(image=>{
  const name=imageName(image?.name,seen),blob=image?.blob;
  if(!(blob instanceof Blob)||!Number.isSafeInteger(blob.size)||blob.size<1)throw new Error('Ficheiro de imagem inválido.');
  size+=blob.size;if(size>MAX_ARCHIVE_BYTES)throw new Error('O conjunto de imagens excede o limite de 250 MB.');
  return{name,blob};
 });
 const entries=[];
 for(const {name,blob} of sources){
  const bytes=new Uint8Array(await blob.arrayBuffer());
  if(bytes.length!==blob.size)throw new Error('Ficheiro de imagem incompleto.');
  validatePNG(bytes);entries.push({name,bytes});
 }
 return zip([...entries,{name:'configuration.json',bytes:manifest},{name:'README.txt',bytes:readme}]);
}
