const categories = {
  cumplida: { label: 'Cumplida', icon: '<path d="m5 12 4 4L19 6"/>' },
  incumplida: { label: 'Incumplida', icon: '<path d="m6 6 12 12M18 6 6 18"/>' },
  demorada: { label: 'Demorada', icon: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3 2"/>' },
  adelantada: { label: 'Adelantada', icon: '<path d="M4 12h15m-6-6 6 6-6 6"/>' }
};
const root = document.querySelector('#article-root');
const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const icon = (status) => `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${categories[status].icon}</svg>`;

function imageFigure(image) {
  return `<figure class="article-figure"><button type="button" class="image-expand" aria-label="Ampliar imagen: ${esc(image.alt || image.caption || 'evidencia visual')}"><img src="/${esc(image.src).replace(/^\/+/, '')}" alt="${esc(image.alt || '')}" loading="lazy"></button>${image.caption ? `<figcaption>${esc(image.caption)}</figcaption>` : ''}</figure>`;
}

fetch('/verifications.json').then((response) => response.json()).then((items) => {
  const item = items.find((entry) => entry.id === root.dataset.id);
  if (!item) throw new Error('Verificación no encontrada');
  if (!item.published || !item.title?.trim() || !categories[item.status]) {
    root.innerHTML = `<div class="article-empty"><p class="eyebrow">ESPECIAL · CHEQUEO A LAS PROPUESTAS</p><h1>Verificación en preparación</h1><p>Este espacio está reservado para una de las verificaciones del especial. El artículo se publicará cuando la redacción incorpore el contenido.</p><a class="button-link" href="/#verificaciones">Volver al listado general <span aria-hidden="true">→</span></a></div>`;
    return;
  }
  document.title = `${item.title} | ChequeaBolivia`;
  const status = categories[item.status];
  const cover = item.coverImage ? `<figure class="article-cover"><img src="/${esc(item.coverImage).replace(/^\/+/, '')}" alt="${esc(item.coverAlt || '')}"></figure>` : '';
  const images = Array.isArray(item.images) ? item.images.map(imageFigure).join('') : '';
  root.innerHTML = `<article class="article"><header class="article-header"><p class="eyebrow"><a href="/#verificaciones">ESPECIAL · LAS PROMESAS BAJO LA LUPA</a></p><span class="status-pill status-${item.status}">${icon(item.status)}<span>${status.label}</span></span><h1>${esc(item.title)}</h1>${item.date ? `<time class="article-date" datetime="${esc(item.date)}">${esc(item.date)}</time>` : ''}</header>${cover}<div class="article-body">${item.bodyHtml || ''}${images}</div><nav class="article-pagination" aria-label="Navegación entre verificaciones"><a class="button-link" href="/#verificaciones"><span aria-hidden="true">←</span> Volver al listado general</a></nav></article>`;
  document.querySelectorAll('.article-body a').forEach((link) => { if (link.hostname !== location.hostname) { link.rel = 'noopener noreferrer'; link.target = '_blank'; } });
}).catch(() => {
  root.innerHTML = '<div class="article-empty"><h1>No se pudo cargar esta verificación</h1><a class="button-link" href="/#verificaciones">Volver al listado general</a></div>';
});

const dialog = document.querySelector('.image-dialog');
document.addEventListener('click', (event) => {
  const button = event.target.closest('.image-expand');
  if (!button || !dialog) return;
  const image = button.querySelector('img');
  const expanded = dialog.querySelector('img');
  expanded.src = image.src;
  expanded.alt = image.alt;
  dialog.querySelector('p').textContent = button.closest('figure').querySelector('figcaption')?.textContent || image.alt;
  dialog.showModal();
});
dialog?.querySelector('.dialog-close')?.addEventListener('click', () => dialog.close());
