function updateIndicators(block, pageIndex) {
  block.querySelectorAll('.brands-indicator').forEach((ind, idx) => {
    ind.classList.toggle('active', idx === pageIndex);
  });
}

function getItemsPerPage() {
  const w = window.innerWidth;
  if (w >= 1200) return 5;
  if (w >= 900) return 4;
  if (w >= 600) return 3;
  return 2;
}

function showPage(block, pageIndex) {
  const track = block.querySelector('.brands-track');
  const items = [...track.children];
  const perPage = getItemsPerPage();
  const totalPages = Math.ceil(items.length / perPage);
  let page = pageIndex;
  if (page < 0) page = totalPages - 1;
  if (page >= totalPages) page = 0;
  block.dataset.currentPage = page;

  const gap = 24;
  const trackWidth = track.parentElement.offsetWidth;
  const itemWidth = (trackWidth - gap * (perPage - 1)) / perPage;

  items.forEach((item) => {
    item.style.minWidth = `${itemWidth}px`;
    item.style.maxWidth = `${itemWidth}px`;
  });

  const offset = page * (itemWidth + gap) * perPage;
  track.style.transform = `translateX(-${offset}px)`;
  updateIndicators(block, page);
}

function buildIndicators(block) {
  const track = block.querySelector('.brands-track');
  const items = [...track.children];
  const perPage = getItemsPerPage();
  const totalPages = Math.ceil(items.length / perPage);

  let nav = block.querySelector('.brands-indicators');
  if (nav) nav.remove();

  nav = document.createElement('div');
  nav.className = 'brands-indicators';

  for (let i = 0; i < totalPages; i += 1) {
    const dot = document.createElement('button');
    dot.className = 'brands-indicator';
    dot.setAttribute('aria-label', `Page ${i + 1} of ${totalPages}`);
    dot.addEventListener('click', () => showPage(block, i));
    nav.append(dot);
  }

  block.querySelector('.brands-controls').append(nav);
}

function startAutoplay(block) {
  const interval = setInterval(() => {
    const current = parseInt(block.dataset.currentPage || '0', 10);
    showPage(block, current + 1);
  }, 3000);
  block.dataset.autoplayInterval = interval;
}

function stopAutoplay(block) {
  const interval = block.dataset.autoplayInterval;
  if (interval) {
    clearInterval(parseInt(interval, 10));
    delete block.dataset.autoplayInterval;
  }
}

export default function decorate(block) {
  const rows = [...block.children];

  // Build track with brand items
  const track = document.createElement('div');
  track.className = 'brands-track';

  rows.forEach((row) => {
    const item = document.createElement('div');
    item.className = 'brands-item';
    const link = row.querySelector('a');
    const picture = row.querySelector('picture');
    if (link && picture) {
      const a = document.createElement('a');
      a.href = link.href;
      a.append(picture);
      item.append(a);
    } else if (picture) {
      item.append(picture);
    }
    track.append(item);
  });

  // Build wrapper
  const viewport = document.createElement('div');
  viewport.className = 'brands-viewport';
  viewport.append(track);

  // Navigation arrows
  const prevBtn = document.createElement('button');
  prevBtn.className = 'brands-prev';
  prevBtn.setAttribute('aria-label', 'Previous brands');
  prevBtn.addEventListener('click', () => {
    const current = parseInt(block.dataset.currentPage || '0', 10);
    showPage(block, current - 1);
  });

  const nextBtn = document.createElement('button');
  nextBtn.className = 'brands-next';
  nextBtn.setAttribute('aria-label', 'Next brands');
  nextBtn.addEventListener('click', () => {
    const current = parseInt(block.dataset.currentPage || '0', 10);
    showPage(block, current + 1);
  });

  // Pause/play button
  const pauseBtn = document.createElement('button');
  pauseBtn.className = 'brands-pause';
  pauseBtn.setAttribute('aria-label', 'Pause autoplay');
  pauseBtn.dataset.playing = 'true';
  pauseBtn.addEventListener('click', () => {
    if (pauseBtn.dataset.playing === 'true') {
      stopAutoplay(block);
      pauseBtn.dataset.playing = 'false';
      pauseBtn.setAttribute('aria-label', 'Play autoplay');
    } else {
      startAutoplay(block);
      pauseBtn.dataset.playing = 'true';
      pauseBtn.setAttribute('aria-label', 'Pause autoplay');
    }
  });

  // Controls container
  const controls = document.createElement('div');
  controls.className = 'brands-controls';
  controls.append(pauseBtn);

  // Assemble
  block.textContent = '';
  const nav = document.createElement('div');
  nav.className = 'brands-nav';
  nav.append(prevBtn, viewport, nextBtn);
  block.append(nav, controls);

  // Initialize
  block.dataset.currentPage = '0';
  buildIndicators(block);
  showPage(block, 0);
  startAutoplay(block);

  // Rebuild on resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      buildIndicators(block);
      showPage(block, parseInt(block.dataset.currentPage || '0', 10));
    }, 200);
  });
}
