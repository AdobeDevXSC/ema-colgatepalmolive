import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
      else div.className = 'cards-card-body';
    });
    ul.append(li);
  });

  // replace images with optimized versions
  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));

  // Add descriptive aria-labels to generic CTA links
  ul.querySelectorAll('li').forEach((li) => {
    const heading = li.querySelector('h1, h2, h3, h4, h5, h6');
    if (heading) {
      li.querySelectorAll('a').forEach((link) => {
        const text = link.textContent.trim().replace(/→$/, '').trim();
        if (/^(discover|learn|read|see|find out)\s+more$/i.test(text)) {
          link.setAttribute('aria-label', `${text} about ${heading.textContent.trim()}`);
        }
      });
    }
  });

  block.replaceChildren(ul);
}
