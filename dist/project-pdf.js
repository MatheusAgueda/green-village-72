import {STANDARD_PACKAGE,standardDescription,adaptationEstimate} from './standard-package.js';
import {INTERIOR_REFERENCES} from './interior-references.js';
import {
  catalogueEstimate,
  emptyClientProject,
  validateClientProject,
  OPTION_GROUPS,
  money,
} from './project-options.js';

/** Append a paginated client dossier; the caller numbers the complete document. */
export async function appendClientDossier(doc, {state, project, font, bold, image} = {}) {
  const {rgb, StandardFonts} = window.PDFLib;
  const regular = font || await doc.embedFont(StandardFonts.Helvetica);
  const strong = bold || await doc.embedFont(StandardFonts.HelveticaBold);
  const client = validateClientProject(project || emptyClientProject());
  const estimate = catalogueEstimate(state);
  const firstPage = doc.getPageCount();
  const W = 595.28, H = 841.89, M = 36, CONTENT = W - M * 2, BOTTOM = 58;
  const green = rgb(.086, .247, .18), ink = rgb(.12, .23, .16);
  const muted = rgb(.31, .41, .33), pale = rgb(.94, .96, .92), white = rgb(1, 1, 1);
  const fonts = new Map([[regular, new Set(regular.getCharacterSet())], [strong, new Set(strong.getCharacterSet())]]);
  let page, y, section = 'Projecto do cliente';

  function printable(value, face = regular) {
    const text = String(value ?? '').normalize('NFC').replace(/\r\n?/g, '\n').replace(/\t/g, ' ');
    for (const character of text) {
      if (character !== '\n' && !fonts.get(face).has(character.codePointAt(0))) {
        throw new Error('O tipo de letra do PDF não suporta um carácter do projecto (' + character + '). Use um tipo de letra compatível para conservar o texto integral.');
      }
    }
    return text;
  }

  // Preserve paragraphs and every character of long words, rather than clipping fields.
  function wrap(value, width = CONTENT, size = 10, face = regular) {
    const result = [];
    for (const paragraph of printable(value, face).split('\n')) {
      let current = '';
      for (const word of paragraph.split(/\s+/).filter(Boolean)) {
        let remainder = word;
        while (remainder) {
          const joined = current ? current + ' ' + remainder : remainder;
          if (face.widthOfTextAtSize(joined, size) <= width) { current = joined; break; }
          if (current) { result.push(current); current = ''; continue; }
          const characters = Array.from(remainder);
          let low = 1, high = characters.length, fit = 0;
          while (low <= high) {
            const midpoint = Math.floor((low + high) / 2);
            if (face.widthOfTextAtSize(characters.slice(0, midpoint).join(''), size) <= width) { fit = midpoint; low = midpoint + 1; }
            else high = midpoint - 1;
          }
          if (!fit) throw new Error('A largura disponível não permite imprimir o texto.');
          result.push(characters.slice(0, fit).join(''));
          remainder = characters.slice(fit).join('');
        }
      }
      result.push(current);
    }
    return result;
  }

  function nextPage(title = section) {
    section = title;
    page = doc.addPage([W, H]);
    page.drawRectangle({x: 0, y: H - 78, width: W, height: 78, color: green});
    page.drawText('GREEN VILLAGE', {x: M, y: H - 34, size: 17, font: strong, color: white});
    page.drawText('EXPANDÍVEL 72  /  DOSSIÊ DO CLIENTE', {x: M, y: H - 56, size: 9, font: regular, color: white});
    page.drawLine({start: {x: M, y: 39}, end: {x: W - M, y: 39}, thickness: .6, color: rgb(.77, .82, .76)});
    y = H - 110;
    for (const line of wrap(title, CONTENT, 20, strong)) {
      page.drawText(line, {x: M, y, size: 20, font: strong, color: ink}); y -= 26;
    }
    y -= 12;
  }

  function ensure(height) {
    if (height > H - 165 - BOTTOM) throw new Error('Um bloco do dossier é demasiado alto para a página.');
    if (!page || y - height < BOTTOM) nextPage();
  }

  function paragraph(value, {size = 10, face = regular, color = ink, width = CONTENT, x = M, after = 9} = {}) {
    const leading = size * 1.42;
    for (const line of wrap(value, width, size, face)) {
      ensure(leading);
      if (line) page.drawText(line, {x, y, size, font: face, color});
      y -= leading;
    }
    y -= after;
  }

  function heading(value) {
    ensure(wrap(value, CONTENT, 13, strong).length * 18.46 + 32);
    paragraph(value, {size: 13, face: strong, after: 8});
  }

  function field(label, value, fallback = 'Por preencher / por confirmar.') {
    ensure(43);
    paragraph(label, {size: 9, face: strong, color: muted, after: 3});
    paragraph(value || fallback, {size: 10.5, after: 13});
  }

  const imageCache = new Map();
  async function loadImage(src) {
    if (!imageCache.has(src)) {
      imageCache.set(src, (async () => {
        const controller = new AbortController(), timeout = setTimeout(() => controller.abort(), 15000);
        try {
          const response = await fetch(src, {signal: controller.signal});
          if (!response.ok) throw new Error('Resposta HTTP ' + response.status);
          const bytes = new Uint8Array(await response.arrayBuffer());
          if (bytes[0] === 137 && bytes[1] === 80) return await doc.embedPng(bytes);
          if (bytes[0] === 255 && bytes[1] === 216) return await doc.embedJpg(bytes);
          throw new Error('Formato de imagem não suportado.');
        } catch (error) {
          throw new Error('Não foi possível incluir a fotografia do dossier: ' + src + '. ' + error.message);
        } finally { clearTimeout(timeout); }
      })());
    }
    return imageCache.get(src);
  }

  function drawImageContained(picture, x, top, width, height) {
    page.drawRectangle({x, y: top - height, width, height, color: pale});
    const scale = Math.min(width / picture.width, height / picture.height);
    page.drawImage(picture, {x: x + (width - picture.width * scale) / 2,
      y: top - height + (height - picture.height * scale) / 2,
      width: picture.width * scale, height: picture.height * scale});
  }

  nextPage('Projecto do cliente');
  paragraph('Dados e preferências registados para a preparação da proposta.', {color: muted});
  field('Cliente', client.clientName, 'Cliente por identificar.');
  field('Nome do projecto', client.projectName, 'Projecto por designar.');
  field('Data do projecto', client.projectDate.split('-').reverse().join('/'));
  field('Local de instalação', client.location);
  field('Contacto do cliente', client.contact);
  if (image) {
    const picture = await loadImage(image);
    ensure(187);
    drawImageContained(picture, M, y, CONTENT, 153);
    y -= 165;
    paragraph('Vista guardada da configuração · modelo 3D de apresentação.', {size: 9, color: muted});
  }

  field('Composição de cozinha acordada com o cliente', client.kitchenStandard, 'Sem indicações adicionais à referência standard.');
  field('Composição de banho acordada com o cliente', client.bathroomStandard, 'Sem indicações adicionais à referência standard.');
  heading('Adaptações e observações');
  field('Adaptações pedidas', client.adaptations, 'Não foram registadas adaptações adicionais.');
  field('Observações do projecto', client.notes, 'Não foram registadas observações adicionais.');

  nextPage('Cozinha e banho standard');
  paragraph('Referências do modelo standard confirmadas pela Green Village em 21/09/2026. As escolhas personalizadas e os seus acréscimos constam separadamente nesta ficha.', {size: 10, color: muted});
  for (const kind of ['kitchen', 'bathroom']) {
    const standard = STANDARD_PACKAGE[kind], reference = INTERIOR_REFERENCES[standard.ref];
    ensure(275);
    heading(standard.title);
    drawImageContained(await loadImage(reference.sourceAsset), M, y, CONTENT, 135);
    y -= 149;
    paragraph(standardDescription(kind), {size: 9});
    const choice = INTERIOR_REFERENCES[state[kind + 'Ref']];
    field('Referência escolhida no projecto', choice.id.slice(-2) + ' · ' + choice.name);
  }
  nextPage('Mapa dos adicionais');
  paragraph('PVP actualizado em ' + estimate.edition + '. IVA de ' + estimate.vatRate + '% incluído nos preços publicados.', {size: 10, color: muted});
  paragraph('O PDF do catálogo original conserva os preços da edição de julho. Subtotal aritmético dos artigos seleccionados com PVP actual. Quantidades, âmbito de facturação e compatibilidade específica com a casa ficam sujeitos a confirmação; este subtotal não é o preço total da casa.', {size: 9, color: muted});
  const columns = {item: M + 7, quantity: M + 275, unit: M + 394, total: W - M - 7};
  function tableHeader() {
    ensure(30);
    page.drawRectangle({x: M, y: y - 20, width: CONTENT, height: 26, color: pale});
    page.drawText('Artigo', {x: columns.item, y: y - 10, size: 9, font: strong, color: ink});
    page.drawText('Qtd.', {x: columns.quantity, y: y - 10, size: 9, font: strong, color: ink});
    for (const [label, right] of [['PVP actual', columns.unit], ['Parcial', columns.total]]) {
      page.drawText(label, {x: right - strong.widthOfTextAtSize(label, 9), y: y - 10, size: 9, font: strong, color: ink});
    }
    y -= 32;
  }
  tableHeader();
  for (const [index, line] of estimate.lines.entries()) {
    const label = (index + 1) + '. ' + line.item.label;
    const labels = wrap(label, 251, 9.5, regular), height = labels.length * 13.5 + 22;
    if (y - height < BOTTOM) { nextPage('Mapa dos adicionais'); tableHeader(); }
    for (const [row, text] of labels.entries()) page.drawText(text, {x: columns.item, y: y - row * 13.5, size: 9.5, font: regular, color: ink});
    const priceText = money(line.unitCents), totalText = money(line.totalCents);
    page.drawText(String(line.quantity), {x: columns.quantity + 5, y, size: 9.5, font: regular, color: ink});
    for (const [text, right] of [[priceText, columns.unit], [totalText, columns.total]]) {
      page.drawText(printable(text), {x: right - regular.widthOfTextAtSize(printable(text), 9), y, size: 9, font: regular, color: ink});
    }
    page.drawText('Ficha original: catálogo, p. ' + line.item.page, {x: columns.item, y: y - labels.length * 13.5 - 1, size: 8, font: regular, color: muted});
    y -= height;
    page.drawLine({start: {x: M, y: y + 9}, end: {x: W - M, y: y + 9}, thickness: .4, color: pale});
  }
  if (!estimate.lines.length) paragraph('Nenhum adicional seleccionado.', {color: muted});
  y -= 8;
  heading('Subtotal dos adicionais com preço: ' + money(estimate.knownSubtotalCents));
  paragraph('IVA já incluído; não foi acrescentado novamente. Os artigos sem preço não entram neste subtotal e não são gratuitos.', {size: 9, color: muted});
  const adaptations = adaptationEstimate(state);
  if (adaptations.lines.length) {
    heading('Personalizações — acréscimos por definir');
    paragraph('Cada alteração requer um orçamento próprio. Estes valores estão fora do subtotal acima; não são alterações gratuitas.', {size: 9, color: muted});
    for (const line of adaptations.lines) field(line.label + ' · Sob orçamento', line.detail);
  }
  field('Casa base e equipamentos incluídos', 'Preço base por confirmar. As composições standard acima registadas não constituem uma confirmação de preço.');
  field('Transporte', 'Valor e âmbito por confirmar para o local de instalação.');
  field('Instalação e trabalhos no local', 'Valor e âmbito por confirmar.');
  if (estimate.pending.length) field('Adicionais com preço por confirmar', estimate.pending.map(line => line.item.label + ' · quantidade ' + line.quantity).join('\n'));
  if (estimate.unitPending.length) field('Âmbito de facturação por confirmar', estimate.unitPending.map(line => line.item.label).join('\n'));
  if (estimate.unassigned.length) field('Locais de aplicação ainda por atribuir', estimate.unassigned.map(line => line.item.label + ': ' + (line.quantity - line.targets.length) + ' de ' + line.quantity + ' por atribuir.').join('\n'));
  field('Total final do projecto', 'Por confirmar na proposta comercial. O subtotal acima não inclui o preço base, o transporte, a instalação nem os valores ainda por indicar.');

  if (estimate.lines.length) nextPage('Artigos seleccionados');
  for (const [index, line] of estimate.lines.entries()) {
    const item = line.item, title = (index + 1) + '. ' + item.label;
    const variant = item.variants.find(entry => entry[0] === line.variant)?.[1];
    const metadata = [OPTION_GROUPS[item.section] || item.section,
      'Quantidade seleccionada: ' + line.quantity,
      ...(variant ? ['Variante: ' + variant] : []),
      'PVP actual: ' + money(line.unitCents),
      'Parcial: ' + money(line.totalCents),
      'IVA: ' + estimate.vatRate + '% incluído quando existe preço.',
      'PVP ' + estimate.edition + ' · ficha p. ' + item.page];
    const metaLines = metadata.flatMap(value => wrap(value, CONTENT - 194, 9.5));
    const pictureHeight = 112, blockHeight = Math.max(pictureHeight, metaLines.length * 13.5);
    const titleHeight = wrap(title, CONTENT, 13, strong).length * 18.46 + 8;
    ensure(titleHeight + blockHeight + 39);
    heading(title);
    const top = y;
    if (item.photo) drawImageContained(await loadImage(item.photo), M, top, 177, pictureHeight);
    else {
      page.drawRectangle({x: M, y: top - pictureHeight, width: 177, height: pictureHeight, color: pale});
      const lines = wrap('Fotografia específica não associada a este artigo.', 151, 9);
      lines.forEach((text, i) => page.drawText(text, {x: M + 13, y: top - 26 - i * 13, size: 9, font: regular, color: muted}));
    }
    metaLines.forEach((text, i) => page.drawText(text, {x: M + 194, y: top - i * 13.5, size: 9.5, font: regular, color: ink}));
    y = top - blockHeight - 13;
    paragraph(item.photo ? (item.photoCaption || 'Imagem de referência do catálogo · p. ' + (item.photoPage || item.page)) + '. A fotografia não é uma imagem da instalação escolhida.' : 'Consultar o catálogo, p. ' + item.page + ', para a referência original.', {size: 8.5, color: muted});
    if (item.facts?.length) paragraph('Indicações do catálogo: ' + item.facts.join('; ') + '.', {size: 9});
    paragraph('Âmbito: ' + item.scope + '.', {size: 9});
    if (line.locations.length) paragraph('Locais seleccionados: ' + line.locations.join('; ') + '.', {size: 9});
    if (item.model === 'opening' && line.id !== 'glass-front' && line.targets.length < line.quantity) {
      paragraph('Ainda por atribuir a um local: ' + (line.quantity - line.targets.length) + ' de ' + line.quantity + '.', {size: 9, color: muted});
    }
    if (!line.unitConfirmed) paragraph('A aplicação do preço à quantidade seleccionada depende da confirmação do âmbito de facturação.', {size: 8.5, color: muted});
    y -= 12;
  }

  nextPage('Validação do projecto');
  paragraph('Este registo reúne as escolhas, os acordos indicados e os pontos ainda por confirmar. A composição final, as adaptações técnicas e o preço total deverão constar da proposta comercial da Green Village.', {size: 10.5});
  paragraph('As fotografias são referências do catálogo. As plantas e o modelo de apresentação conservam as cotas e limitações descritas nas páginas anteriores; não substituem um projecto de execução.', {size: 9, color: muted});
  heading('Conferência com o cliente');
  for (const label of ['Composição standard da cozinha e da casa de banho', 'Planta, materiais, variantes e locais de aplicação', 'Quantidades e âmbito de facturação dos adicionais', 'Transporte, instalação e total da proposta']) {
    ensure(34);
    page.drawRectangle({x: M, y: y - 1, width: 10, height: 10, borderColor: muted, borderWidth: .7});
    paragraph(label, {x: M + 19, width: CONTENT - 19, size: 10, after: 12});
  }
  heading('Observações na conferência');
  ensure(91);
  for (let row = 0; row < 3; row++) {
    page.drawLine({start: {x: M, y: y - 20}, end: {x: W - M, y: y - 20}, thickness: .5, color: rgb(.65, .72, .67)});
    y -= 28;
  }
  y -= 16;
  ensure(111);
  const width = (CONTENT - 28) / 2;
  for (const [label, x] of [['Cliente', M], ['Green Village', M + width + 28]]) {
    page.drawText(label, {x, y, size: 11, font: strong, color: ink});
    page.drawLine({start: {x, y: y - 45}, end: {x: x + width, y: y - 45}, thickness: .7, color: muted});
    page.drawText('Assinatura', {x, y: y - 60, size: 9, font: regular, color: muted});
    page.drawText('Data: ____ / ____ / ________', {x, y: y - 83, size: 9, font: regular, color: muted});
  }
  y -= 111;
  return doc.getPageCount() - firstPage;
}
