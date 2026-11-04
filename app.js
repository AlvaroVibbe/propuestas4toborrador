const categories = [
  { id: 'cumplida', label: 'Cumplida', compact: 'CUMPLIDA', definition: 'La propuesta o promesa se ejecutó en el plazo previsto.', icon: 'check' },
  { id: 'incumplida', label: 'Incumplida', compact: 'INCUMPLIDA', definition: 'A la fecha de la evaluación no se avanzó en la propuesta o promesa, o los resultados muestran que la situación tuvo un retroceso.', icon: 'cross' },
  { id: 'demorada', label: 'Demorada', compact: 'DEMORADA', definition: 'Se avanzó poco en las acciones necesarias para cumplir con el compromiso o promesa y todavía podría lograrse en lo que queda del período de mandato.', icon: 'clock' },
  { id: 'adelantada', label: 'Adelantada', compact: 'ADELANTADA', definition: 'Se ejecutaron acciones y tareas necesarias para lograr la propuesta o promesa en un menor tiempo, aunque todavía no está cumplida.', icon: 'arrow' }
];

const icon = (name) => {
  const paths = {
    check: '<path d="m5 12 4 4L19 6"/>',
    cross: '<path d="m6 6 12 12M18 6 6 18"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3 2"/>',
    arrow: '<path d="M4 12h15m-6-6 6 6-6 6"/>'
  };
  return `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${paths[name]}</svg>`;
};
const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const labelFor = (id) => categories.find((category) => category.id === id);

const definitions = document.querySelector('#definitions-grid');
definitions.innerHTML = categories.map((category) => `<article class="definition-card status-${category.id}"><div class="definition-head"><span class="status-icon">${icon(category.icon)}</span><h3>${category.label}</h3></div><p>${category.definition}</p></article>`).join('');

const list = document.querySelector('#verification-list');
const filterBar = document.querySelector('#filter-bar');
const emptySummary = document.querySelector('#empty-summary');
const emptyList = document.querySelector('#empty-list');
const resultsCount = document.querySelector('#results-count');
let entries = [];
let activeFilter = 'all';
let filterTransition = 0;

function updateActiveFilterButtons() {
  filterBar.querySelectorAll('.filter-button').forEach((button) => {
    const selected = button.dataset.filter === activeFilter;
    button.classList.toggle('is-active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
}

async function selectFilter(nextFilter) {
  if (nextFilter === activeFilter) return;

  const token = ++filterTransition;
  const cards = [...list.querySelectorAll('.verification-card')];
  const order = ['all', ...categories.map((category) => category.id)];
  const direction = order.indexOf(nextFilter) >= order.indexOf(activeFilter) ? 1 : -1;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  activeFilter = nextFilter;
  updateActiveFilterButtons();

  if (reduceMotion) {
    render();
    return;
  }

  cards.forEach((card) => card.getAnimations().forEach((animation) => animation.cancel()));
  const exits = cards.map((card, index) => {
    const animation = card.animate(
      [
        { opacity: 1, transform: 'translate3d(0, 0, 0) scale(1)' },
        { opacity: 0, transform: `translate3d(${-direction * 22}px, 0, 0) scale(.985)` }
      ],
      { duration: 210, delay: Math.min(index * 16, 112), easing: 'cubic-bezier(.4, 0, 1, 1)', fill: 'forwards' }
    );
    return animation.finished.catch(() => {});
  });
  if (cards.length === 0 && !emptyList.hidden) {
    emptyList.getAnimations().forEach((animation) => animation.cancel());
    const exit = emptyList.animate(
      [
        { opacity: 1, transform: 'translate3d(0, 0, 0) scale(1)' },
        { opacity: 0, transform: `translate3d(${-direction * 20}px, -10px, 0) scale(.985)` }
      ],
      { duration: 210, easing: 'cubic-bezier(.4, 0, 1, 1)', fill: 'forwards' }
    );
    exits.push(exit.finished.catch(() => {}));
  }
  await Promise.all(exits);
  if (token !== filterTransition) return;

  render();
  if (emptyList.hidden) {
    list.querySelectorAll('.verification-card').forEach((card, index) => {
      const animation = card.animate(
        [
          { opacity: 0, transform: `translate3d(${direction * 26}px, 0, 0) scale(.985)` },
          { opacity: 1, transform: 'translate3d(0, 0, 0) scale(1)' }
        ],
        { duration: 470, delay: Math.min(index * 30, 210), easing: 'cubic-bezier(.2, .65, .25, 1)', fill: 'both' }
      );
      animation.finished.then(() => animation.cancel()).catch(() => {});
    });
  } else {
    const reveal = emptyList.animate(
      [
        { opacity: 0, transform: `translate3d(${direction * 24}px, 14px, 0) scale(.985)` },
        { opacity: 1, transform: 'translate3d(0, 0, 0) scale(1)' }
      ],
      { duration: 520, easing: 'cubic-bezier(.2, .65, .25, 1)', fill: 'both' }
    );
    reveal.finished.then(() => reveal.cancel()).catch(() => {});
    if (emptyList.classList.contains('empty-list--attention')) {
      const mark = emptyList.querySelector('.empty-list-mark');
      const emphasis = mark.animate(
        [
          { transform: 'scale(.65) rotate(-12deg)' },
          { transform: 'scale(1.08) rotate(3deg)', offset: .72 },
          { transform: 'scale(1) rotate(0deg)' }
        ],
        { duration: 500, delay: 120, easing: 'cubic-bezier(.2, .8, .2, 1)' }
      );
      emphasis.finished.then(() => emphasis.cancel()).catch(() => {});
    }
  }
}

function card(item) {
  const category = labelFor(item.status);
  const image = item.coverImage ? `<img src="${esc(item.coverImage)}" alt="${esc(item.coverAlt || '')}" loading="lazy">` : `<div class="card-image-placeholder" aria-hidden="true"><span>CHEQUEA<br>LA PROMESA</span></div>`;
  const date = item.date ? `<time datetime="${esc(item.date)}">${esc(item.date)}</time>` : '';
  return `<article class="verification-card status-${category.id}"><a class="card-image" href="/verificaciones/${esc(item.id)}/" tabindex="-1" aria-hidden="true">${image}</a><div class="card-content"><span class="status-pill">${icon(category.icon)}<span>${category.label}</span></span><h3><a href="/verificaciones/${esc(item.id)}/">${esc(item.title)}</a></h3><div class="card-meta">${date}<a class="card-read" href="/verificaciones/${esc(item.id)}/">Leer verificación <span aria-hidden="true">↗</span></a></div></div></article>`;
}

function render() {
  const published = entries.filter((item) => item.published && item.title?.trim() && labelFor(item.status));
  const counts = Object.fromEntries(categories.map((category) => [category.id, published.filter((item) => item.status === category.id).length]));
  document.querySelector('#stats-grid').innerHTML = categories.map((category) => `<article class="stat-card status-${category.id}"><div class="stat-label"><span class="status-icon">${icon(category.icon)}</span><span>${category.label}</span></div><strong>${counts[category.id]}</strong><span class="stat-caption">${counts[category.id] === 1 ? 'verificación' : 'verificaciones'}</span></article>`).join('');
  document.querySelector('#published-total').textContent = `${published.length} ${published.length === 1 ? 'publicada' : 'publicadas'}`;
  emptySummary.hidden = published.length !== 0;

  for (const category of categories) {
    if (filterBar.querySelector(`[data-filter="${category.id}"]`)) continue;
    const button = document.createElement('button');
    button.className = `filter-button status-${category.id}`;
    button.type = 'button';
    button.dataset.filter = category.id;
    button.setAttribute('aria-pressed', 'false');
    button.innerHTML = `<span class="status-icon">${icon(category.icon)}</span><span>${category.compact}</span><span class="filter-count" data-count="${category.id}">0</span>`;
    filterBar.append(button);
  }
  filterBar.querySelector('[data-count="all"]').textContent = String(published.length);
  for (const category of categories) filterBar.querySelector(`[data-count="${category.id}"]`).textContent = String(counts[category.id]);
  updateActiveFilterButtons();
  const shown = activeFilter === 'all' ? published : published.filter((item) => item.status === activeFilter);
  list.innerHTML = shown.map(card).join('');
  emptyList.hidden = shown.length !== 0;
  const fulfilledEmpty = activeFilter === 'cumplida' && shown.length === 0;
  emptyList.classList.toggle('empty-list--attention', fulfilledEmpty);
  emptyList.querySelector('.empty-list-mark').textContent = fulfilledEmpty ? '!' : '—';
  const fulfilledEmptyMessage = 'De acuerdo a nuestra metodología, ninguna de las propuestas que hizo la dupla Rodrigo Paz - Edmond Lara en campaña fue cumplida hasta ahora. Puede navegar en las pestañas del menú arriba para ver el resto de propuestas adelantadas, demoradas o incumplidas.';
  emptyList.querySelector('h3').textContent = activeFilter === 'cumplida' && shown.length === 0 ? 'Ninguna propuesta cumplida hasta ahora' : published.length === 0 ? 'Aún no hay verificaciones publicadas' : 'No hay verificaciones en esta categoría';
  emptyList.querySelector('p').textContent = activeFilter === 'cumplida' && shown.length === 0 ? fulfilledEmptyMessage : published.length === 0 ? 'El listado se actualizará cuando la redacción incorpore los artículos y su evaluación.' : 'Prueba otra categoría o vuelve a todas las verificaciones.';
  resultsCount.textContent = `${shown.length} ${shown.length === 1 ? 'resultado' : 'resultados'}`;
}

filterBar.addEventListener('click', (event) => {
  const button = event.target.closest('[data-filter]');
  if (!button) return;
  selectFilter(button.dataset.filter);
});

document.querySelector('[data-explore-verifications]')?.addEventListener('click', (event) => {
  event.preventDefault();
  selectFilter('all');
  const target = document.querySelector('#verificaciones');
  target?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  target?.focus({ preventScroll: true });
});

fetch('/verifications.json').then((response) => {
  if (!response.ok) throw new Error('No se pudo cargar el contenido');
  return response.json();
}).then((data) => { entries = data; render(); }).catch(() => {
  emptySummary.hidden = false;
  document.querySelector('#stats-grid').innerHTML = '';
  emptySummary.textContent = 'No se pudo cargar el contenido. Comprueba que el sitio se sirve desde un servidor local.';
});
