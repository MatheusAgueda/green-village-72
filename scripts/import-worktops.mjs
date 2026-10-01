import fs from 'node:fs/promises';
import crypto from 'node:crypto';
const source='https://biz.cli.im/test/GX300499?coding=I2syRW&qrurl=http%3A%2F%2Fqr14.cn%2FI2syRW&gtype=2';
const response=await fetch(source);if(!response.ok)throw new Error('Catalogue HTTP '+response.status);
const html=await response.text(),line=html.split('\n').find(line=>line.startsWith('var data = '));
if(!line)throw new Error('Catalogue data missing');
const data=JSON.parse(line.slice(11).replace(/;\s*$/,''));
const products=data.tree_list.filter(t=>t.module==='rich_text'&&t.item?.imgPath&&t.coding!=='CX683404');
if(products.length!==78)throw new Error('Catalogue changed: review the source before importing');
const root=new URL('../dist/',import.meta.url),dir=new URL('assets/worktops/',root);await fs.mkdir(dir,{recursive:true});
const rows=[];
for(let i=0;i<products.length;i+=4)await Promise.all(products.slice(i,i+4).map(async(t,j)=>{
 const sourceURL='https:'+t.item.imgPath,r=await fetch(sourceURL);if(!r.ok)throw new Error(t.coding+' HTTP '+r.status);
 const bytes=Buffer.from(await r.arrayBuffer()),type=r.headers.get('content-type')||'',ext=type.includes('webp')?'webp':type.includes('png')?'png':'jpg';
 const asset='assets/worktops/'+t.coding+'.'+ext;await fs.writeFile(new URL(asset,root),bytes);
 rows[i+j]={id:t.coding,label:'Bancada '+String(i+j+1).padStart(2,'0'),originalTitle:t.item.title,asset,sourceURL,evidenceURL:'https://biz.cli.im'+t.soncode_link,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length,priceCents:null};
}));
await fs.writeFile(new URL('worktop-data.js',root),'// Original public supplier images; no inferred prices or colour codes.\nexport const WORKTOP_SOURCE='+JSON.stringify(source)+';\nexport const WORKTOPS='+JSON.stringify(rows,null,2)+';\n');
console.log(JSON.stringify({products:rows.length,bytes:rows.reduce((s,r)=>s+r.bytes,0),source}));
