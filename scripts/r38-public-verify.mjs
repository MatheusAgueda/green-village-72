import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';

const root=path.resolve(process.env.AUDIT_SOURCE||'.');
const base=process.env.AUDIT_URL||'https://matheusagueda.github.io/green-village-72/';
const output=process.env.AUDIT_OUTPUT||'audit/r38/publication.json';
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
const html=await fs.readFile(path.join(root,'dist/index.html'),'utf8');
const imports=JSON.parse(html.match(/<script type="importmap">([\s\S]*?)<\/script>/)[1]).imports;
const modules=[...new Set(Object.values(imports))];
const names=['index.html','premium-r36.css','language-r38.css','scene-r38.css',...await fs.readdir(path.join(root,'dist/assets/scene-r38')).then(names=>names.map(name=>'assets/scene-r38/'+name))];
const targets=[...modules,...names].map(name=>({name,local:path.join(root,'dist',name.split('?')[0]),url:new URL(name,new URL('dist/',base)).href}));
const results=[];
async function verify(target) {
  let error;
  for(let attempt=0;attempt<3;attempt++) {
    try {
      const local=await fs.readFile(target.local),url=new URL(target.url);
      url.searchParams.set('audit','r38-'+Date.now());
      const response=await fetch(url,{signal:AbortSignal.timeout(30000)});
      assert.equal(response.status,200,target.name+' HTTP status');
      const bytes=Buffer.from(await response.arrayBuffer());
      assert.equal(digest(bytes),digest(local),target.name+' published hash');
      return {asset:target.name,status:response.status,bytes:bytes.length,sha256:digest(bytes)};
    }catch(e){error=e;if(attempt<2)await new Promise(resolve=>setTimeout(resolve,2000));}
  }
  throw error;
}
for(let i=0;i<targets.length;i+=4)results.push(...await Promise.all(targets.slice(i,i+4).map(verify)));
const entry=await fetch(base+'?v=r38',{signal:AbortSignal.timeout(30000)});
assert.equal(entry.status,200);
await fs.mkdir(path.dirname(output),{recursive:true});
await fs.writeFile(output,JSON.stringify({at:new Date().toISOString(),base,rootStatus:entry.status,modules:modules.length,checked:results.length,results},null,2));
console.log(JSON.stringify({rootStatus:entry.status,modules:modules.length,checked:results.length,allHashesMatch:true,receipt:output}));
