// Private customer content. Never include these records in configuration/share URLs.
export const MAX_FILE_BYTES = 5 * 1024 * 1024;
export const MAX_ATTACHMENT_BYTES = 20 * 1024 * 1024;
export const MAX_PROJECT_BYTES = 30 * 1024 * 1024;
export const MAX_ATTACHMENTS = 12;
const validatedAttachments=new Map();
const text = (value, max) => {
  if (typeof value !== 'string' || value.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)) throw new Error('Texto do pedido ou anexo inválido.');
  return value;
};
const id = value => {
  if (typeof value !== 'string' || !/^[a-zA-Z0-9_-]{1,80}$/.test(value)) throw new Error('Identificador do pedido ou anexo inválido.');
  return value;
};
export function attachmentBytes(dataUrl) {
  if (typeof dataUrl !== 'string' || dataUrl.length > Math.ceil(MAX_FILE_BYTES / 3) * 4 + 100) throw new Error('Anexo demasiado grande: máximo 5 MB.');
  const match = dataUrl.match(/^data:(image\/png|image\/jpeg|application\/pdf);base64,([A-Za-z0-9+/]+={0,2})$/);
  if (!match || match[2].length % 4 !== 0) throw new Error('Formato de anexo inválido. Use PNG, JPEG ou PDF.');
  const binary = atob(match[2]);
  if (btoa(binary) !== match[2]) throw new Error('Codificação do anexo inválida.');
  const bytes = Uint8Array.from(binary, character => character.charCodeAt(0));
  if (!bytes.length || bytes.length > MAX_FILE_BYTES) throw new Error('Anexo vazio ou superior a 5 MB.');
  const valid = match[1] === 'image/png' ? [137,80,78,71,13,10,26,10].every((b,i)=>bytes[i]===b)
    : match[1] === 'image/jpeg' ? bytes[0]===255 && bytes[1]===216 && bytes[2]===255
    : binary.startsWith('%PDF-');
  if (!valid) throw new Error('O conteúdo não corresponde ao formato do anexo.');
  return {bytes, mime: match[1]};
}
export function validateClientRecords(value) {
  const attachments = value.attachments ?? [], requests = value.requests ?? [], optionNotes = value.optionNotes ?? {};
  if (!Array.isArray(attachments) || attachments.length > MAX_ATTACHMENTS) throw new Error('Pode guardar até 12 anexos.');
  if (!Array.isArray(requests) || requests.length > 30) throw new Error('Pode guardar até 30 pedidos específicos.');
  if (!optionNotes || typeof optionNotes !== 'object' || Array.isArray(optionNotes) || Object.keys(optionNotes).length > 40) throw new Error('Observações dos adicionais inválidas.');
  const ids = new Set(); let total = 0, plans = 0;
  const files = attachments.map(file => {
    if (!file || !['plan','photo'].includes(file.kind)) throw new Error('Tipo de anexo inválido.');
    const key = id(file.id); if (ids.has(key)) throw new Error('Anexo repetido.'); ids.add(key);
    let metadata=validatedAttachments.get(key);
    if(!metadata||metadata.dataUrl!==file.dataUrl){const {bytes,mime}=attachmentBytes(file.dataUrl);metadata={dataUrl:file.dataUrl,size:bytes.length,mime};if(validatedAttachments.size>=MAX_ATTACHMENTS)validatedAttachments.delete(validatedAttachments.keys().next().value);validatedAttachments.set(key,metadata);}
    const {size,mime}=metadata;
    if (file.mime !== mime || file.size !== size || (file.kind === 'photo' && mime === 'application/pdf')) throw new Error('Dados do anexo inconsistentes.');
    if (file.kind === 'plan' && ++plans > 1) throw new Error('Retire a planta anterior antes de carregar outra.');
    total += size;
    return {id:key,kind:file.kind,name:text(file.name,180),mime,size,dataUrl:file.dataUrl,notes:text(file.notes??'',2400)};
  });
  if (total > MAX_ATTACHMENT_BYTES) throw new Error('Os anexos excedem o limite total de 20 MB.');
  const notes = Object.fromEntries(Object.entries(optionNotes).map(([key,note])=>[id(key),text(note,2400)]));
  const items = requests.map(request => {
    if (!request || !Number.isInteger(request.quantity) || request.quantity < 1 || request.quantity > 99) throw new Error('Quantidade do pedido inválida.');
    const key=id(request.id); if (ids.has(key)) throw new Error('Pedido repetido.'); ids.add(key);
    return {id:key,title:text(request.title,160),quantity:request.quantity,location:text(request.location??'',160),notes:text(request.notes??'',2400)};
  });
  return {attachments:files,requests:items,optionNotes:notes};
}
export async function verifyAttachmentContent(attachment) {
  const {bytes,mime}=attachmentBytes(attachment.dataUrl);
  if (mime==='application/pdf') {
    if (!window.PDFLib) {await import('./vendor/pdf-lib.min.js');}
    const document=await window.PDFLib.PDFDocument.load(bytes);
    if (document.isEncrypted || !document.getPageCount() || document.getPageCount()>20) throw new Error('A planta PDF deve estar desbloqueada e ter entre 1 e 20 páginas.');
  } else {
    const bitmap=await createImageBitmap(new Blob([bytes],{type:mime}));
    try {if (!bitmap.width || !bitmap.height || bitmap.width*bitmap.height>40000000) throw new Error('Imagem demasiado grande: máximo 40 milhões de píxeis.');}
    finally {bitmap.close();}
  }
}
export async function readClientAttachment(file,kind) {
  if (!file.size || file.size>MAX_FILE_BYTES) throw new Error('Cada ficheiro deve ter até 5 MB.');
  const dataUrl=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(new Error('Não foi possível ler o ficheiro.'));reader.readAsDataURL(file);});
  const attachment={id:crypto.randomUUID(),kind,name:file.name,mime:file.type,size:file.size,dataUrl,notes:''};
  validateClientRecords({attachments:[attachment]});
  await verifyAttachmentContent(attachment);
  return attachment;
}

// IndexedDB avoids localStorage's small per-origin quota for photographs and plans.
let databasePromise;
const storedAttachments=new Map();
const storedRevisions=new Map();
let writeQueue=Promise.resolve();
function database() {
  if (!databasePromise) databasePromise=new Promise((resolve,reject)=>{
    const request=indexedDB.open('green-village-72-client',1);
    request.onupgradeneeded=()=>request.result.createObjectStore('projects');
    request.onsuccess=()=>resolve(request.result);
    request.onerror=()=>reject(request.error);
    request.onblocked=()=>reject(new Error('Feche as outras janelas do portefólio para guardar os anexos.'));
  }).catch(error=>{databasePromise=null;throw error;});
  return databasePromise;
}
export async function readClientStorage(key) {
  await writeQueue.catch(()=>{});
  const db=await database();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction('projects','readonly'),store=tx.objectStore('projects'),r=store.get(key);let result;
    r.onsuccess=()=>{result=r.result??null;for(const file of result?.attachments||[])if(file.contentKey){const content=store.get(file.contentKey);content.onsuccess=()=>{file.dataUrl=content.result;storedAttachments.set(file.contentKey,file.dataUrl);delete file.contentKey;};}};
    tx.oncomplete=()=>{storedRevisions.set(key,result?.storageRevision);if(result&&typeof result==='object')delete result.storageRevision;resolve(result);};tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);
  });
}
export function writeClientStorage(key,value) {
  const save=writeQueue.catch(()=>{}).then(()=>writeRecord(key,value));
  writeQueue=save;return save;
}
async function writeRecord(key,value) {
  const db=await database();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction('projects','readwrite'),store=tx.objectStore('projects'),updates=new Map();
    let revision;
    if(value&&Array.isArray(value.attachments)){
      const previous=store.get(key);
      previous.onsuccess=()=>{
        const active=new Set(),known=Boolean(storedRevisions.get(key))&&previous.result?.storageRevision===storedRevisions.get(key);
        revision=crypto.randomUUID();
        const record={...value,storageRevision:revision,attachments:value.attachments.map(file=>{
          const contentKey=key+'/attachment/'+file.id;active.add(contentKey);
          // Another tab may have removed/replaced content since this tab last read it.
          if(!known||storedAttachments.get(contentKey)!==file.dataUrl){store.put(file.dataUrl,contentKey);updates.set(contentKey,file.dataUrl);}
          const {dataUrl,...metadata}=file;return {...metadata,contentKey};
        })};
        for(const file of previous.result?.attachments||[])if(file.contentKey&&!active.has(file.contentKey)){store.delete(file.contentKey);storedAttachments.delete(file.contentKey);}
        store.put(record,key);
      };
    }else store.put(value,key);
    tx.oncomplete=()=>{storedRevisions.set(key,revision);for(const [id,url]of updates)storedAttachments.set(id,url);resolve();};tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);
  });
}
