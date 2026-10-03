import assert from 'node:assert/strict';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {deflateSync,crc32} from 'node:zlib';
import {createImageArchive} from '../dist/image-archive.js';
import {DEFAULT_CONFIG,validateConfiguration} from '../dist/configuration.js';

function chunk(type,bytes=Buffer.alloc(0)){
 const data=Buffer.concat([Buffer.from(type),bytes]),header=Buffer.alloc(4),checksum=Buffer.alloc(4);
 header.writeUInt32BE(bytes.length);checksum.writeUInt32BE(crc32(data));return Buffer.concat([header,data,checksum]);
}
function png(width=3840,height=2160){
 const header=Buffer.alloc(13);header.writeUInt32BE(width);header.writeUInt32BE(height,4);header[8]=8;header[9]=2;
 return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',deflateSync(Buffer.alloc((width*3+1)*height))),chunk('IEND')]);
}
const source=png(),blob=new Blob([source],{type:'image/png'}),names=['01-chegada.png','02-jardím.png','03-vista-geral.png'];
const images=names.map(name=>({name,blob}));
const configuration={...structuredClone(DEFAULT_CONFIG),clientName:'PRIVATE_CLIENT',email:'PRIVATE_EMAIL',notes:'PRIVATE_NOTES',attachments:[{data:'PRIVATE_BYTES'}],optionSelections:[{id:'ac-monosplit-12000',quantity:1,notes:'PRIVATE_OPTION_NOTES',clientName:'PRIVATE_OPTION_CLIENT'}]};
const reference='GV-72-É123',options={images,configuration,reference};
let passed=0;
async function check(name,fn){await fn();passed++;console.log('PASS '+name);}
const directory=await mkdtemp(join(tmpdir(),'gv72-r36-archive-'));
try{
 await check('Stored ZIP opens in Python zipfile with intact UTF-8 names, bytes, CRCs and private-free manifest',async()=>{
  const archive=await createImageArchive(options);assert.equal(archive.type,'application/zip');
  const archivePath=join(directory,'images.zip');await writeFile(archivePath,new Uint8Array(await archive.arrayBuffer()));await writeFile(join(directory,'source.png'),source);
  const script=`import json, pathlib, sys, zipfile, zlib
p=pathlib.Path(sys.argv[1])
with zipfile.ZipFile(p) as archive:
 assert archive.testzip() is None
 names=archive.namelist()
 assert names == ['01-chegada.png','02-jardím.png','03-vista-geral.png','configuration.json','README.txt'], names
 for item in archive.infolist():
  assert item.compress_type == zipfile.ZIP_STORED
  assert item.flag_bits & 0x800
  assert item.date_time == (1980,1,1,0,0,0)
  assert item.CRC == zlib.crc32(archive.read(item))
 for name in names[:3]:
  assert archive.read(name) == (p.parent/'source.png').read_bytes()
 manifest=json.loads(archive.read('configuration.json'))
 assert list(manifest) == ['reference','configuration']
 assert manifest['reference'] == 'GV-72-É123'
 assert 'PRIVATE_' not in json.dumps(manifest)
 assert manifest['configuration']['optionSelections'] == [{'id':'ac-monosplit-12000','quantity':1,'variant':'','targets':[]}]
 readme=archive.read('README.txt').decode('utf-8')
 assert 'Três perspectivas da configuração actual' in readme
 assert 'O terreno e o jardim não estão incluídos.' in readme
 assert 'não declara preços' in readme
 print(json.dumps({'entries':len(names),'crc':'verified','utf8':'verified','privateData':'absent'}))
`;
  const parsed=spawnSync('python3',['-c',script,archivePath],{encoding:'utf8'});assert.equal(parsed.status,0,parsed.stderr);console.log(parsed.stdout.trim());
 });
 await check('Archive is deterministic and does not mutate the supplied configuration',async()=>{
  const before=JSON.stringify(options),a=await createImageArchive(options),b=await createImageArchive(options);
  assert.deepEqual(new Uint8Array(await a.arrayBuffer()),new Uint8Array(await b.arrayBuffer()));assert.equal(JSON.stringify(options),before);
 });
 await check('Configuration snapshot remains stable across asynchronous image reads',async()=>{
  const mutable=structuredClone(configuration),expected=JSON.stringify(validateConfiguration(mutable));
  const pending=createImageArchive({...options,configuration:mutable});mutable.roof=true;mutable.optionSelections[0].quantity=10;
  const archive=await pending,path=join(directory,'snapshot.zip');await writeFile(path,new Uint8Array(await archive.arrayBuffer()));
  const parsed=spawnSync('python3',['-c','import json,sys,zipfile; print(json.dumps(json.loads(zipfile.ZipFile(sys.argv[1]).read("configuration.json"))["configuration"]))',path],{encoding:'utf8'});
  assert.equal(parsed.status,0,parsed.stderr);assert.deepEqual(JSON.parse(parsed.stdout),JSON.parse(expected));
 });
 await check('README uses the requested supported language and safe fallback',async()=>{
  for(const [lang,expected] of [['en','Three views of the current configuration'],['es','Tres perspectivas de la configuración actual'],['unknown','Três perspectivas da configuração actual'],['constructor','Três perspectivas da configuração actual']]){
   const archive=await createImageArchive({...options,lang});assert.ok((await archive.text()).includes(expected));
  }
 });
 await check('Traversal, ambiguous basenames, repeated and case-equivalent image names are rejected',async()=>{
  for(const name of ['../bad.png','dir/bad.png','dir\\bad.png','/bad.png','C:bad.png','bad.png\0','bad.jpg','bad.png.exe','.hidden.png','CON.png','x'.repeat(130)+'.png'])await assert.rejects(createImageArchive({...options,images:[{name,blob},...images.slice(1)]}),/Nome de imagem inválido/);
  for(const name of [names[0],names[0].toUpperCase()])await assert.rejects(createImageArchive({...options,images:[images[0],{name,blob},images[2]]}),/repetir/);
  await assert.rejects(createImageArchive({...options,images:[{name:names[1].normalize('NFD'),blob},images[1],images[2]]}),/repetir/);
 });
 await check('Malformed PNGs, truncated streams, wrong dimensions and corrupt chunk CRCs are rejected',async()=>{
  const corrupt=Buffer.from(source);corrupt[corrupt.length-1]^=1;
  for(const bytes of [Buffer.from('not a PNG'),source.subarray(0,24),source.subarray(0,33),source.subarray(0,-12),Buffer.concat([source,Buffer.from([0])]),corrupt])await assert.rejects(createImageArchive({...options,images:[{name:names[0],blob:new Blob([bytes])},...images.slice(1)]}),/PNG inválida/);
  await assert.rejects(createImageArchive({...options,images:[{name:names[0],blob:new Blob([png(1,1)])},...images.slice(1)]}),/3 840 × 2 160/);
 });
 await check('Invalid image count, configuration, reference, blobs and excessive sizes fail before assembly',async()=>{
  for(const entries of [[],images.slice(1),[...images,images[0]]])await assert.rejects(createImageArchive({...options,images:entries}),/três imagens/);
  await assert.rejects(createImageArchive({...options,configuration:{}}),/configuração desconhecido/);
  for(const value of ['',null,'REF\nINJECTED','x'.repeat(121)])await assert.rejects(createImageArchive({...options,reference:value}),/Referência/);
  for(const value of [null,new Blob([]),{size:source.length,arrayBuffer:()=>source.buffer}])await assert.rejects(createImageArchive({...options,images:[{name:names[0],blob:value},...images.slice(1)]}),/Ficheiro de imagem inválido/);
  class OversizedBlob extends Blob {get size(){return 251*1024*1024;}async arrayBuffer(){throw new Error('Oversized blob must not be read');}}
  await assert.rejects(createImageArchive({...options,images:[{name:names[0],blob:new OversizedBlob()},...images.slice(1)]}),/250 MB/);
 });
 console.log(`${passed} R36 image archive checks passed.`);
}finally{await rm(directory,{recursive:true,force:true});}
