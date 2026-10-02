import assert from 'node:assert/strict';
import fs from 'node:fs';
import {COMMERCIAL_TERMS,COMMERCIAL_COPY,COMMERCIAL_FACTS} from '../dist/commercial-terms.js';
import {DEFAULT_CONFIG} from '../dist/configuration.js';
import {TECHNICAL_FACTS} from '../dist/technical-data.js';
import {sourceLedger} from '../dist/client-tools.js';
import {technicalSheetMarkup} from '../dist/technical-sheet.js';
import {translateText} from '../dist/i18n.js';
import {createPDFI18n} from '../dist/pdf-i18n.js';

const checks=[];
const check=(name,run)=>{run();checks.push(name);console.log('PASS '+name);};
const retired=/\b90\s+(?:dias úteis|working days|días hábiles)|\b2\s+(?:anos na estrutura|years on the structure|años en la estructura)|\b1\s+(?:ano nos equipamentos|year on equipment|año en los equipos)|[12]-year warranty/i;
const unapproved=/30\s+(?:dias úteis|working days|días hábiles)|após a confirmação do pedido|after the order is confirmed|tras la confirmación del pedido/i;
const includesTerms=(text,lang)=>{
 for(const key of ['delivery','structure','expansion','finishes'])assert.ok(text.includes(COMMERCIAL_COPY[lang][key]),`${lang}: missing ${key}`);
 assert.match(text,/30\s+(?:dias|days|días)/);
 assert.doesNotMatch(text,retired);assert.doesNotMatch(text,unapproved);
};

check('Owner terms preserve two distinct delivery periods and all three warranty scopes',()=>{
 assert.deepEqual(COMMERCIAL_TERMS.delivery,{minWorkingDays:90,maxWorkingDays:180});
 assert.equal(COMMERCIAL_TERMS.onSiteDays,30);
 assert.deepEqual(COMMERCIAL_TERMS.warranty,{structureYears:10,expansionSystemYears:5,finishesYears:2});
 assert.equal(COMMERCIAL_TERMS.revision,'2026-10-02');
 assert.ok(Object.isFrozen(COMMERCIAL_TERMS));
 assert.ok(Object.isFrozen(COMMERCIAL_TERMS.delivery));
 assert.ok(Object.isFrozen(COMMERCIAL_TERMS.warranty));
 assert.equal(Object.hasOwn(COMMERCIAL_TERMS.delivery,'startTrigger'),false);
 assert.equal(Object.hasOwn(COMMERCIAL_TERMS,'onSiteWorkingDays'),false);
 for(const lang of ['pt','en','es'])includesTerms(COMMERCIAL_COPY[lang].faq,lang);
});

check('Every authored commercial phrase is translated in both UI and PDF engines',()=>{
 for(const lang of ['pt','en','es'])for(const [key,source]of Object.entries(COMMERCIAL_COPY.pt)){
  assert.equal(translateText(source,lang),COMMERCIAL_COPY[lang][key],`UI ${lang}/${key}`);
  assert.equal(createPDFI18n(lang).t(source),COMMERCIAL_COPY[lang][key],`PDF ${lang}/${key}`);
 }
});

check('Initial HTML and generated technical sheet carry complete current terms',()=>{
 const html=fs.readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
 assert.ok(html.includes(COMMERCIAL_COPY.pt.faq));
 const sheet=technicalSheetMarkup(DEFAULT_CONFIG);
 includesTerms(sheet.replace(/<[^>]+>/g,' '),'pt');
 assert.ok(sheet.includes(COMMERCIAL_COPY.pt.assembly));
 assert.doesNotMatch(sheet,/Classes, ensaios, certificados e garantia do modelo/);
});

check('Downloaded source ledger distinguishes commercial confirmation from missing certificates',()=>{
 const ledger=sourceLedger(DEFAULT_CONFIG);
 assert.deepEqual(ledger.commercialTerms,COMMERCIAL_TERMS);
 for(const fact of COMMERCIAL_FACTS){
  assert.deepEqual(TECHNICAL_FACTS.find(row=>row.id===fact.id),fact);
  assert.deepEqual(ledger.technicalFacts.find(row=>row.id===fact.id),fact);
  assert.equal(fact.status,'owner-confirmed');
 }
 const pending=TECHNICAL_FACTS.filter(f=>f.category==='Documentação pendente'||f.pending);
 assert.ok(pending.some(f=>/certificad/i.test(f.label)),'Actual certificate gap must remain');
 assert.ok(pending.every(f=>!/garantia|warranty|garantía/i.test(f.label+' '+(f.pending||''))),'Confirmed warranty must not be listed as missing');
 const certificate=TECHNICAL_FACTS.find(f=>f.id==='pending-certification');
 for(const lang of ['en','es'])for(const source of [certificate.label,certificate.note,certificate.source.document])assert.notEqual(translateText(source,lang),source,`${lang}: missing certificate-gap translation`);
});

check('Runtime sources contain no retired claims or invented start/day qualifiers',()=>{
 for(const file of ['index.html','technical-sheet.js','technical-data.js','project-pdf.js','i18n.js','pdf-i18n.js','commercial-terms.js']){
  const source=fs.readFileSync(new URL('../dist/'+file,import.meta.url),'utf8');
  assert.doesNotMatch(source,retired,file);assert.doesNotMatch(source,unapproved,file);
 }
});

const out=process.env.AUDIT_OUTPUT||'audit/r33';
fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(out+'/regression.json',JSON.stringify({checks,pass:true,commercialTerms:COMMERCIAL_TERMS},null,2));
console.log(JSON.stringify({passed:checks.length,failed:0}));
