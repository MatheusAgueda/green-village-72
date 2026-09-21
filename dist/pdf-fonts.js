const FONT_ASSETS = ['assets/fonts/NotoSans-Regular.ttf', 'assets/fonts/NotoSans-Bold.ttf'];
let fontBytesPromise;

async function readFont(asset) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(asset, {signal: controller.signal});
    if (!response.ok) throw new Error('HTTP ' + response.status);
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (bytes.length < 1000) throw new Error('Ficheiro de tipo de letra incompleto.');
    return bytes;
  } catch (error) {
    throw new Error('Não foi possível carregar os tipos de letra do PDF. Tente novamente.', {cause: error});
  } finally {
    clearTimeout(timer);
  }
}

/** Preserve the existing four-page PDF; client dossiers support international names. */
export async function embedPortfolioFonts(doc, {unicode = false} = {}) {
  const {StandardFonts} = window.PDFLib;
  if (!unicode) {
    const [regular, bold] = await Promise.all([
      doc.embedFont(StandardFonts.Helvetica), doc.embedFont(StandardFonts.HelveticaBold),
    ]);
    return {regular, bold};
  }
  if (!window.fontkit) throw new Error('O motor de tipos de letra do PDF não ficou disponível. Actualize a página e tente novamente.');
  doc.registerFontkit(window.fontkit);
  if (!fontBytesPromise) {
    fontBytesPromise = Promise.all(FONT_ASSETS.map(readFont)).catch(error => {
      fontBytesPromise = undefined;
      throw error;
    });
  }
  const [regularBytes, boldBytes] = await fontBytesPromise;
  const [regular, bold] = await Promise.all([
    doc.embedFont(regularBytes, {subset: true}), doc.embedFont(boldBytes, {subset: true}),
  ]);
  return {regular, bold};
}
