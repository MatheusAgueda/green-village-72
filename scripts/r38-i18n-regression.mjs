import assert from 'node:assert/strict';
import {translateText,resolveLanguage,SUPPORTED_LANGUAGES,LOCALES,translationCoverage,formatCurrency,formatDecimal,setLanguage,translateDOM,getLang} from '../dist/i18n.js';
import {OPTIONAL_ITEMS} from '../dist/project-options.js';
import {COMMERCIAL_TRANSLATIONS} from '../dist/commercial-terms.js';

let passed=0;
const check=(label,run)=>{run();passed++;console.log('PASS '+label);};
check('Five supported languages share a complete authored EN/ES/FR/IT catalogue',()=>{
 assert.deepEqual(SUPPORTED_LANGUAGES,['pt','en','es','fr','it']);
 const report=translationCoverage();
 for(const lang of ['en','es','fr','it']){
  assert.ok(report[lang].total>=950);
  assert.deepEqual(report[lang].missing,[],`${lang} missing authored messages`);
  assert.equal(report[lang].translated,report[lang].total);
 }
});
check('All priced optional-item names and commercial terms translate into French and Italian',()=>{
 for(const lang of ['fr','it']){
  for(const item of OPTIONAL_ITEMS)assert.notEqual(translateText(item.label,lang),item.label,`${lang}: ${item.id}`);
  for(const [pt] of COMMERCIAL_TRANSLATIONS)assert.notEqual(translateText(pt,lang),pt,`${lang}: ${pt}`);
 }
 assert.match(translateText('O pavimento vinílico está incluído no preço base. O pavimento SPC tem um custo adicional de 1 200 €.','fr'),/1 200 €/);
 assert.match(translateText('500 € por sistema, com instalação incluída.','it'),/^500 €.*installazione inclusa/);
});
check('Customer-facing recovery and export feedback is translated in all four target languages',()=>{
 for(const lang of ['en','es','fr','it'])for(const message of [
  'Ficheiro de projecto demasiado grande (máximo 30 MB).',
  'A ficha mudou durante a importação. Tente novamente.',
  'A pré-visualização 3D está indisponível. Pode continuar a escolher e guardar as referências.',
  'A configuração mudou durante a captura. Tente novamente.',
  'Pode guardar até 12 anexos.',
  'Projecto, escolhas e anexos recuperados do ficheiro.',
  '3D indisponível. Reabra a apresentação para guardar as imagens.',
  'Três imagens 4K e a configuração guardadas em ZIP.'
 ])assert.notEqual(translateText(message,lang),message,`${lang}: ${message}`);
 assert.equal(translateText('Não foi possível criar o PDF: Recorte indisponível','fr'),'Le PDF n’a pas pu être créé : Extrait indisponible');
 assert.equal(translateText('Antes das divisórias: ≈ 68,3 m²','en'),'Before partitions: ≈ 68.3 m²');
 assert.equal(translateText('≈ 68,3 m²','en'),'≈ 68.3 m²');
 assert.equal(translateText('Espaço comum','fr'),'Espace commun');
 assert.equal(translateText('Entrada / fachada principal','it'),'Ingresso / facciata principale');
 assert.equal(translateText('Cotas exteriores confirmadas · áreas aproximadas · cores suavizadas','fr'),'Cotes extérieures confirmées · surfaces approximatives · couleurs adoucies');
 assert.equal(translateText('Antes das divisórias: ≈ 68,3 m²','fr'),'Avant les cloisons : ≈ 68,3 m²');
 for(const lang of ['en','es','fr','it'])assert.notEqual(translateText('PVP de 05/10/2026 · IVA incluído. No PDF de julho: 500,00 € (valor anterior).',lang),'PVP de 05/10/2026 · IVA incluído. No PDF de julho: 500,00 € (valor anterior).');
});
check('Bounded dynamic templates cover quantities, plan captions, catalogue prices and accessible descriptions',()=>{
 const samples=[
  ['Amostra 9','Échantillon 9','Campione 9'],
  ['Todos os 26 artigos','Tous les 26 articles','Tutti i 26 articoli'],
  ['Os meus adicionais (4)','Mes options (4)','I miei optional (4)'],
  ['2 de 3 locais definidos','2 emplacements définis sur 3','2 di 3 posizioni definite'],
  ['1 alteração por orçamentar','1 modification en attente de devis','1 modifica in attesa di preventivo'],
  ['2 alterações por orçamentar','2 modifications en attente de devis','2 modifiche in attesa di preventivo'],
  ['Porta do quarto 2','Porte de la chambre 2','Porta della camera 2'],
  ['Janela lateral esquerda · 2','Fenêtre latérale gauche · 2','Finestra laterale sinistra · 2'],
  ['Porta lateral direita · 1','Porte latérale droite · 1','Porta laterale destra · 1'],
  ['Quarto 4 *','Chambre 4 *','Camera 4 *'],
  ['1 quarto / 1 WC','1 chambre / 1 salle de bains','1 camera / 1 bagno'],
  ['3 quartos · 1 casa de banho · usar cozinha linear, sob orçamento','3 chambres · 1 salle de bains · cuisine linéaire, sur devis','3 camere · 1 bagno · cucina lineare, su preventivo'],
  ['Original · página 5 ↗','Original · page 5 ↗','Originale · pagina 5 ↗'],
  ['Referência 9 · fotografia original ↗','Référence 9 · photographie originale ↗','Riferimento 9 · fotografia originale ↗'],
  ['Fotografia do artigo · catálogo p. 5','Photographie de l’article · catalogue p. 5','Fotografia dell’articolo · catalogo p. 5'],
  ['Amostra SPC SP-09 · recorte do catálogo sem inscrições','Échantillon SPC SP-09 · extrait du catalogue sans inscriptions','Campione SPC SP-09 · ritaglio del catalogo senza scritte'],
  ['Amostra do painel 3D · catálogo p. 7','Échantillon du panneau 3D · catalogue p. 7','Campione del pannello 3D · catalogo p. 7'],
  ['T4 · distribuição · A','T4 · agencement · A','T4 · distribuzione · A'],
  ['15 COZINHAS','15 CUISINES','15 CUCINE'],
  ['17 AMBIENTES','17 AMBIANCES','17 AMBIENTI'],
  ['6 VÍDEOS DE REFERÊNCIA','6 VIDÉOS DE RÉFÉRENCE','6 VIDEO DI RIFERIMENTO'],
  ['A carregar 1 material…','Chargement de 1 matériau…','Caricamento di 1 materiale…'],
  ['A carregar 12 materiais…','Chargement de 12 matériaux…','Caricamento di 12 materiali…'],
  ['Descarregar Casa de banho em MP4','Télécharger Salle de bains en MP4','Scarica Bagno in MP4'],
  ['01 / CASA DE BANHO','01 / SALLE DE BAINS','01 / BAGNO'],
  ['  Nome do cliente  ','  Nom du client  ','  Nome del cliente  '],
  ['Ampliar Cozinha','Agrandir Cuisine','Ingrandisci Cucina'],
  ['Portas e envidraçados · Actualização Green Village · 02/10/2026','Portes et vitrages · Mise à jour Green Village · 02/10/2026','Porte e vetrate · Aggiornamento Green Village · 02/10/2026'],
  ['Opacidade: Cozinha','Opacité : Cuisine','Opacità: Cucina'],
  ['Cozinha de referência 4: Cozinha em L','Cuisine de référence 4: Cuisine en L','Cucina di riferimento 4: Cucina a L']
 ];
 for(const [pt,fr,it] of samples){assert.equal(translateText(pt,'fr'),fr);assert.equal(translateText(pt,'it'),it);assert.equal(translateText(pt,'pt'),pt);}
 for(const lang of ['fr','it']){
  for(const source of ['1 mosquiteiro por atribuir. Escolha uma janela ou ajuste a quantidade pretendida.','PVP ACTUALIZADO · 02/10/2026','PVP actual · ficha p. 4','PVP actualizado em 02/10/2026. O PDF original conserva os preços da edição de julho. O subtotal soma os PVP actuais multiplicados pelas quantidades pedidas; o âmbito de facturação dos artigos sem unidade expressa e os equipamentos já incluídos têm de ser confirmados pela Green Village.','500 € com IVA · PVP de 02/10/2026. Conjunto de módulos abrangido por confirmar.','SPC: adicional único de 1 200 € por casa; referência escolhida no configurador.','Ampliar fotografia de Janela grande corte térmico','Referência escolhida: Pavimento SPC','Falta definir a aplicação de Janela da casa de banho.'])assert.notEqual(translateText(source,lang),source,`${lang}: ${source}`);
 }
});
check('Language query validation, saved fallback and numeric locale formatting retain commercial values',()=>{
 for(const lang of SUPPORTED_LANGUAGES){assert.equal(resolveLanguage('?lang='+lang,'pt'),lang);assert.equal(resolveLanguage('?lang=invalid',lang),lang);}
 assert.equal(resolveLanguage('?lang=javascript%3Aalert(1)','it'),'it');
 assert.equal(resolveLanguage('?lang=fr','it'),'fr');
 assert.equal(resolveLanguage('?lang=invalid','invalid'),'pt');
 assert.equal(translateText('1 200,00 €','it'),new Intl.NumberFormat('it-IT',{style:'currency',currency:'EUR',minimumFractionDigits:2,maximumFractionDigits:2}).format(1200));
 assert.equal(translateText('1 200,00 €','fr'),'1\u202f200,00\u00a0€');
 assert.equal(translateText('1 200,00 €','en'),'€1,200.00');
 assert.equal(translateText('1 200,00 €','pt'),'1 200,00 €');
 assert.equal(translateText('Adicionais: 500,00 € + personalizações sob orçamento','it'),'Optional: 500,00\u00a0€ + personalizzazioni su preventivo');
 for(const lang of ['constructor','toString','__proto__','de'])assert.equal(translateText('Cozinha',lang),'Cozinha');
 for(const lang of SUPPORTED_LANGUAGES){
  assert.equal(formatCurrency(1200,lang),new Intl.NumberFormat(LOCALES[lang],{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(1200));
  assert.equal(formatDecimal(11.8,lang),'en'===lang?'11.8':'11,8');
 }
});

// Minimal DOM contract exercises the production translator without a browser dependency.
// The browser audit separately renders the complete application and real form controls.
const storage=new Map();
globalThis.localStorage={getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value)};
globalThis.NodeFilter={SHOW_TEXT:4};
function element({privateText=false,file=false,attachment=false,attributes={}}={}){
 return {nodeType:1,attributes:{...attributes},children:[],dataset:{},
  closest(selector){return privateText?this:null;},
  matches(selector){return file?selector.includes('.client-attachment > strong'):attachment?selector.includes('.client-attachment img'):false;},
  querySelectorAll(){return [];},hasAttribute(name){return Object.hasOwn(this.attributes,name);},getAttribute(name){return this.attributes[name];},setAttribute(name,value){this.attributes[name]=value;}
 };
}
function text(parent,value){const node={nodeType:3,parentElement:parent,nodeValue:value};parent.children=[node];return node;}
const ordinary=element({attributes:{'aria-label':'Nome do cliente'}}),privateElement=element({privateText:true}),fileElement=element({file:true}),remove=element({attributes:{'data-remove-attachment':'photo','aria-label':'Retirar Cozinha.pdf'}});
const ordinaryText=text(ordinary,'Cozinha'),privateNode=text(privateElement,'Cozinha'),fileNode=text(fileElement,'Fotografia de referência · Cozinha.pdf');
let allNodes=[ordinaryText,privateNode,fileNode];
const buttons=SUPPORTED_LANGUAGES.map(language=>({...element(),dataset:{language}}));
const meta={content:''};
globalThis.document={documentElement:{lang:'pt-PT'},title:'',querySelector(selector){return selector==='meta[name="description"]'?meta:null;},querySelectorAll(selector){return selector==='[data-language]'?buttons:[ordinary,privateElement,fileElement,remove];},createTreeWalker(){let index=-1;return {currentNode:null,nextNode(){this.currentNode=allNodes[++index];return Boolean(this.currentNode);}};}};
check('DOM round trips restore Portuguese and preserve private text and filenames',()=>{
 for(const [lang,expected,filePrefix,removePrefix] of [['fr','Cuisine','Photographie de référence','Retirer'],['it','Cucina','Fotografia di riferimento','Rimuovi'],['pt','Cozinha','Fotografia de referência','Retirar']]){
  setLanguage(lang);
  assert.equal(getLang(),lang);assert.equal(storage.get('gv72-language'),lang);
  assert.equal(document.documentElement.lang,LOCALES[lang]);
  assert.equal(ordinaryText.nodeValue,expected);
  assert.equal(privateNode.nodeValue,'Cozinha');
  assert.equal(fileNode.nodeValue,`${filePrefix} · Cozinha.pdf`);
  assert.equal(remove.getAttribute('aria-label'),`${removePrefix} Cozinha.pdf`);
  assert.equal(buttons.filter(button=>button.getAttribute('aria-pressed')==='true').length,1);
  assert.equal(buttons.find(button=>button.getAttribute('aria-pressed')==='true').dataset.language,lang);
 }
 assert.equal(ordinary.getAttribute('aria-label'),'Nome do cliente');
 assert.throws(()=>setLanguage('de'),/Unsupported language/);
 assert.equal(getLang(),'pt');
});
check('Restored translated text nodes retain their original source without a global reverse dictionary',()=>{
 setLanguage('fr');const saved=ordinaryText.nodeValue;
 setLanguage('it');
 const replacement=text(ordinary,saved);allNodes=[replacement,privateNode,fileNode];
 translateDOM(replacement);assert.equal(replacement.nodeValue,'Cucina');
 setLanguage('pt');assert.equal(replacement.nodeValue,'Cozinha');
 replacement.nodeValue='Nome do cliente';setLanguage('it');assert.equal(replacement.nodeValue,'Nome del cliente');
 setLanguage('fr');assert.match(document.title,/Extensible/);assert.match(meta.content,/maison extensible/);
 setLanguage('it');assert.match(document.title,/Espandibile/);assert.match(meta.content,/casa espandibile/);
 assert.equal(translateText('Cliente particular <&> Cozinha.pdf','fr'),'Cliente particular <&> Cozinha.pdf');
});
storage.set('gv72-language','fr');
globalThis.window={localStorage};
const freshFrench=await import('../dist/i18n.js?startup-saved=fr');
assert.equal(freshFrench.getLang(),'fr');
storage.set('gv72-language','it');
const freshItalian=await import('../dist/i18n.js?startup-saved=it');
assert.equal(freshItalian.getLang(),'it');
passed++;console.log('PASS Fresh module startup restores saved French and Italian');
console.log(JSON.stringify({passed,failed:0,coverage:translationCoverage()},null,2));
