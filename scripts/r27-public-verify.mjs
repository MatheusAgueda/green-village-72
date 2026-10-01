import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import {setTimeout} from 'node:timers/promises';
const baseline=process.env.BASELINE_REF||'046b9811bcc5524a641e99c1328382e3b598379c';
const base=process.env.SITE_BASE||'https://matheusagueda.github.io/green-village-72/dist/';
const out=process.env.AUDIT_OUTPUT||'audit/r27/public';
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const files=execFileSync('git',['diff','--name-only',baseline,'HEAD','--','dist'],{encoding:'utf8'}).trim().split('\n').filter(Boolean);
assert.ok(files.length>0,'Release has changed site files');
const manifest=await Promise.all(files.map(async file=>{const bytes=await fs.readFile(file);return{file,sha256:hash(bytes),bytes:bytes.length};}));
await fs.mkdir(out,{recursive:true});await fs.writeFile(out+'/expected.json',JSON.stringify({baseline,head:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),manifest},null,2));
const pending=[...manifest],results=[];
await Promise.all(Array.from({length:6},async()=>{
 while(pending.length){const item=pending.shift();let failure;
  for(let attempt=1;attempt<=4;attempt++)try{
   const url=new URL(item.file.slice(5),base);url.searchParams.set('verify',item.sha256.slice(0,12));
   const response=await fetch(url,{signal:AbortSignal.timeout(45000)});assert.equal(response.status,200,`${item.file}: HTTP ${response.status}`);
   const actual=hash(Buffer.from(await response.arrayBuffer()));assert.equal(actual,item.sha256,`${item.file}: public content mismatch`);
   results.push({...item,attempt,pass:true});failure=null;break;
  }catch(error){failure=error.message;if(attempt<4)await setTimeout(attempt*1500);}
  if(failure)results.push({...item,pass:false,error:failure});
 }
}));
const failed=results.filter(x=>!x.pass),report={verifiedAt:new Date().toISOString(),base,total:results.length,passed:results.length-failed.length,failed:failed.length,results};
await fs.writeFile(out+'/result.json',JSON.stringify(report,null,2));console.log(JSON.stringify({total:report.total,passed:report.passed,failed}));
assert.equal(failed.length,0,'Public hashes must match every changed site file');
