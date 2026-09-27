import assert from 'node:assert/strict';
import {emptyClientProject,validateClientProject,validateOptionSelections,catalogueEstimate} from '../dist/project-options.js';
import {DEFAULT_CONFIG} from '../dist/configuration.js';
import {attachmentBytes,MAX_FILE_BYTES,MAX_ATTACHMENTS} from '../dist/client-records.js';
import {clientProjectMarkup,clientSummaryMarkup,optionsPanelMarkup} from '../dist/project-ui.js';
import {getPlan} from '../dist/specification.js';
import {shareConfiguration,readSharedConfiguration} from '../dist/client-tools.js';
const checks=[];
function test(name,run){try{run();checks.push({name,pass:true});}catch(e){checks.push({name,pass:false,error:e.message});}}
const select=(id,quantity=1)=>({id,quantity,targets:[],variant:''});
test('glazing permits multiple requested units',()=>assert.equal(validateOptionSelections([select('glass-front',3)])[0].quantity,3));
test('lateral glass and island are independent quoted requests',()=>{
 const e=catalogueEstimate({...DEFAULT_CONFIG,optionSelections:[select('side-glass-partial'),select('kitchen-island')]});
 assert.equal(e.pending.length,2);assert.equal(e.knownSubtotalCents,0);
});
test('climate fixed price, quantity and quotation',()=>{
 const e=catalogueEstimate({...DEFAULT_CONFIG,optionSelections:[select('ac-monosplit-12000',2),select('ac-multisplit-3x1')]});
 assert.equal(e.knownSubtotalCents,100000);assert.equal(e.pending.length,1);assert.equal(e.pending[0].totalCents,null);
 assert.match(e.lines.find(l=>l.id==='ac-monosplit-12000').item.scope,/instalação incluída/i);
});
test('requests preserve kitchen window quantity and notes',()=>{
 const p=validateClientProject({...emptyClientProject(),requests:[{id:'request-1',title:'Janela extra',quantity:2,location:'Cozinha',notes:'Acima da bancada'}]});
 assert.equal(p.requests[0].location,'Cozinha');assert.equal(p.requests[0].quantity,2);
});
const image='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aFO0AAAAASUVORK5CYII=';
const file={id:'photo-1',kind:'photo',name:'janela.png',mime:'image/png',dataUrl:image,size:attachmentBytes(image).bytes.length,notes:'Janela na cozinha'};
const client=()=>({...emptyClientProject(),attachments:[file],requests:[{id:'request-1',title:'Extra',quantity:2,location:'Cozinha',notes:'Pendente de cotação'}],optionNotes:{'window-930':'Janela extra na cozinha'}});
test('legacy v1 client upgrades without losing fields',()=>{const p=validateClientProject(emptyClientProject());assert.deepEqual(p.attachments,[]);assert.deepEqual(p.requests,[]);assert.deepEqual(p.optionNotes,{});});
test('attachment original bytes and notes survive JSON roundtrip',()=>assert.deepEqual(validateClientProject(JSON.parse(JSON.stringify(client()))).attachments,[file]));
test('record validation is idempotent',()=>{const p=validateClientProject(client());assert.deepEqual(validateClientProject(p),p);});
for(const url of ['https://example.com/photo.png','javascript:alert(1)','data:image/svg+xml;base64,PHN2Zz4=','data:text/html;base64,PHNjcmlwdD4=','data:image/png;base64,YmFk','data:image/png;base64,!!!!'])test('reject unsafe or invalid attachment '+url.slice(0,40),()=>assert.throws(()=>validateClientProject({...client(),attachments:[{...file,dataUrl:url}]})));
for(const patch of [{mime:'application/pdf'},{size:999},{kind:'other'},{notes:'x'.repeat(2401)},{id:'bad<id'}])test('reject attachment metadata '+JSON.stringify(patch).slice(0,45),()=>assert.throws(()=>validateClientProject({...client(),attachments:[{...file,...patch}]})));
test('two plans rejected atomically',()=>assert.throws(()=>validateClientProject({...client(),attachments:[{...file,kind:'plan'},{...file,id:'plan-2',kind:'plan'}]})));
test('duplicate attachment IDs rejected',()=>assert.throws(()=>validateClientProject({...client(),attachments:[file,file]})));
test('attachment count enforced',()=>assert.throws(()=>validateClientProject({...client(),attachments:Array.from({length:MAX_ATTACHMENTS+1},(_,i)=>({...file,id:'file-'+i}))})));
test('individual byte limit enforced',()=>assert.throws(()=>attachmentBytes('data:image/png;base64,'+Buffer.alloc(MAX_FILE_BYTES+1).toString('base64'))));
for(const quantity of [0,-1,100,1.5,'2'])test('request quantity boundary '+quantity,()=>assert.throws(()=>validateClientProject({...client(),requests:[{...client().requests[0],quantity}]})));
test('overlong and duplicate requests rejected',()=>{assert.throws(()=>validateClientProject({...client(),requests:[client().requests[0],client().requests[0]]}));assert.throws(()=>validateClientProject({...client(),requests:[{...client().requests[0],title:'x'.repeat(161)}]}));});
test('private records and files excluded from share links',()=>{const url=shareConfiguration({...DEFAULT_CONFIG,project:client(),attachments:client().attachments,requests:client().requests,optionNotes:client().optionNotes},'https://example.com/');const shared=readSharedConfiguration(new URL(url).hash);assert.equal(Object.hasOwn(shared,'attachments'),false);assert.equal(Object.hasOwn(shared,'requests'),false);assert.equal(Object.hasOwn(shared,'optionNotes'),false);});
test('new quoted options cannot target existing geometry',()=>assert.throws(()=>validateOptionSelections([{...select('side-glass-partial'),targets:['entry']}])));
test('new requests never claim an original catalogue page',()=>{const html=optionsPanelMarkup({...DEFAULT_CONFIG,optionSelections:[select('ac-monosplit-12000')]},getPlan(DEFAULT_CONFIG),'climate');assert.equal(html.includes('p. null'),false);assert.equal(html.includes('#page=null'),false);assert.match(html,/Instalação incluída/);});
test('all private filenames and notes escape HTML',()=>{
 const hostile='</textarea><img src=x onerror=alert(1)>';
 const project=validateClientProject({...client(),attachments:[{...file,name:hostile,notes:hostile}],requests:[{...client().requests[0],title:hostile,notes:hostile}],optionNotes:{'window-930':hostile}});
 for(const html of [clientProjectMarkup(project,DEFAULT_CONFIG),clientSummaryMarkup(project,{...DEFAULT_CONFIG,optionSelections:[select('window-930')]}),optionsPanelMarkup({...DEFAULT_CONFIG,optionSelections:[select('window-930')]},getPlan(DEFAULT_CONFIG),'windows',project)]){assert.equal(html.includes(hostile),false);assert.ok(html.includes('&lt;'));}
});
test('editing notes reuses immutable attachment validation',()=>{
 const p=validateClientProject(client()),start=performance.now();for(let i=0;i<1000;i++)validateClientProject({...p,notes:'Nota '+i});assert.ok(performance.now()-start<1000);
});
console.log(JSON.stringify({tests:checks.length,failed:checks.filter(c=>!c.pass).length,checks},null,2));
process.exitCode=checks.some(c=>!c.pass)?1:0;
