import { H as Hls } from './video-player-dru42stk.js';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function initMobileMenu() {
  const button = $('.menu-toggle');
  const nav = $('#mobile-nav');
  if (!button || !nav) return;

  button.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    button.setAttribute('aria-expanded', String(open));
  });
}

function initBackToTop() {
  $$('.back-to-top').forEach((button) => {
    button.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
}

function initHeroCarousel() {
  const carousel = $('[data-hero-carousel]');
  if (!carousel) return;

  const slides = $$('.hero-slide', carousel);
  const dots = $$('[data-hero-dot]', carousel);
  if (slides.length <= 1) return;

  let index = 0;
  let timer = null;

  const show = (nextIndex) => {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === index);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === index);
    });
  };

  const start = () => {
    stop();
    timer = window.setInterval(() => show(index + 1), 5200);
  };

  const stop = () => {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  };

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      show(Number(dot.dataset.heroDot));
      start();
    });
  });

  carousel.addEventListener('mouseenter', stop);
  carousel.addEventListener('mouseleave', start);
  start();
}

function initFilters() {
  const bar = $('[data-filter-bar]');
  const grid = $('.searchable-grid');
  if (!bar || !grid) return;

  const input = $('[data-filter-input]', bar);
  const category = $('[data-filter-category]', bar);
  const sort = $('[data-filter-sort]', bar);
  const count = $('[data-filter-count]', bar);
  const cards = $$('.movie-card', grid);

  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get('q');
  if (initialQuery && input) input.value = initialQuery;

  const normalize = (value) => String(value || '').trim().toLowerCase();

  const apply = () => {
    const keyword = normalize(input ? input.value : '');
    const cat = category ? category.value : 'all';
    let visible = 0;

    cards.forEach((card) => {
      const haystack = normalize([
        card.dataset.title,
        card.dataset.year,
        card.dataset.type,
        card.dataset.region,
        card.dataset.category,
        card.textContent,
      ].join(' '));
      const matchKeyword = !keyword || haystack.includes(keyword);
      const matchCategory = cat === 'all' || card.dataset.category === cat;
      const isVisible = matchKeyword && matchCategory;
      card.classList.toggle('is-filter-hidden', !isVisible);
      if (isVisible) visible += 1;
    });

    if (sort) {
      const sortedCards = [...cards].sort((a, b) => {
        if (sort.value === 'year-asc') return Number(a.dataset.year) - Number(b.dataset.year);
        if (sort.value === 'title') return String(a.dataset.title).localeCompare(String(b.dataset.title), 'zh-CN');
        return Number(b.dataset.year) - Number(a.dataset.year);
      });
      sortedCards.forEach((card) => grid.appendChild(card));
    }

    if (count) count.textContent = `显示 ${visible} / ${cards.length} 部`;
  };

  [input, category, sort].filter(Boolean).forEach((el) => el.addEventListener('input', apply));
  [category, sort].filter(Boolean).forEach((el) => el.addEventListener('change', apply));
  apply();
}

function initHlsPlayers() {
  $$('video[data-hls-src]').forEach((video) => {
    const src = video.dataset.hlsSrc;
    const wrapper = video.closest('.player-box');
    const cover = wrapper ? $('.video-play-cover', wrapper) : null;
    let isReady = false;

    const attach = () => {
      if (isReady || !src) return;
      isReady = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (Hls && Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        video.src = src;
      }
    };

    video.addEventListener('play', attach, { once: true });
    video.addEventListener('loadeddata', () => cover && cover.classList.add('is-hidden'));
    video.addEventListener('playing', () => cover && cover.classList.add('is-hidden'));

    if (cover) {
      cover.addEventListener('click', () => {
        attach();
        cover.classList.add('is-hidden');
        video.play().catch(() => {
          video.controls = true;
        });
      });
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initBackToTop();
  initHeroCarousel();
  initFilters();
  initHlsPlayers();
});
