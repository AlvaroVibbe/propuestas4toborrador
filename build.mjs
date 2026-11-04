import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(root, 'dist');
const verifications = JSON.parse(await readFile(path.join(root, 'verifications.json'), 'utf8'));
const slugs = new Set();
for (const item of verifications) {
  if (!/^verificacion-\d{2}$/.test(item.id) || slugs.has(item.id)) throw new Error(`Identificador inválido o repetido: ${item.id}`);
  slugs.add(item.id);
}

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
for (const file of ['index.html', 'styles.css', 'app.js', 'article.js', 'verifications.json', 'portada-rodrigo-paz.webp', 'logo-chequeabolivia.png']) await cp(path.join(root, file), path.join(out, file));
try { await cp(path.join(root, 'images'), path.join(out, 'images'), { recursive: true }); } catch (error) { if (error.code !== 'ENOENT') throw error; }

const esc = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
for (const item of verifications) {
  const published = item.published && item.title?.trim() && item.status;
  const title = published ? item.title.trim() : 'Verificación en preparación';
  const description = published ? `${item.title.trim()} — una verificación de ChequeaBolivia.` : 'Espacio editorial para una verificación de ChequeaBolivia.';
  const canonical = `/verificaciones/${item.id}/`;
  const imageMeta = published && item.coverImage ? `<meta property="og:image" content="${esc(item.coverImage)}">` : '';
  const article = `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#1E3E59"><meta name="description" content="${esc(description)}"><meta property="og:type" content="article"><meta property="og:site_name" content="ChequeaBolivia"><meta property="og:title" content="${esc(title)} | ChequeaBolivia"><meta property="og:description" content="${esc(description)}">${imageMeta}<title>${esc(title)} | ChequeaBolivia</title><link rel="canonical" href="${canonical}"><link rel="stylesheet" href="/styles.css"><script type="module" src="/article.js"></script></head>
<body><a class="skip-link" href="#contenido">Saltar al contenido</a><header class="site-header"><div class="header-inner"><a class="brand" href="/" aria-label="ChequeaBolivia, inicio"><img class="brand-logo" src="/logo-chequeabolivia.png" alt="ChequeaBolivia"></a><a class="header-kicker header-home" href="/#verificaciones">← VERIFICACIONES</a></div></header><main id="contenido" class="article-main wrap"><div id="article-root" data-id="${esc(item.id)}"><div class="article-loading" aria-live="polite">Cargando verificación…</div></div></main><footer class="site-footer"><div class="footer-inner wrap"><a class="brand brand-footer" href="/" aria-label="ChequeaBolivia, inicio"><img class="brand-logo" src="/logo-chequeabolivia.png" alt="ChequeaBolivia"></a><p>Un especial de <strong>Chequea Bolivia</strong></p><a href="/#verificaciones" class="back-top">Todas las verificaciones ↑</a></div></footer><dialog class="image-dialog" aria-label="Imagen ampliada"><button type="button" class="dialog-close" aria-label="Cerrar imagen">×</button><img alt=""><p></p></dialog></body></html>`;
  const dir = path.join(out, 'verificaciones', item.id);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, 'index.html'), article, 'utf8');
}
console.log(`Sitio estático generado en dist/ (${verifications.length} rutas de artículo).`);
