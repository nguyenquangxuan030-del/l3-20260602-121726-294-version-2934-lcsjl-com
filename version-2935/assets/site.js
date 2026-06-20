(function () {
  'use strict';

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initMenu() {
    var toggle = document.querySelector('.menu-toggle');
    if (!toggle) return;
    toggle.addEventListener('click', function () {
      var opened = document.body.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  function initHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) return;
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    if (!slides.length) return;
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        var active = i === current;
        slide.classList.toggle('is-active', active);
        slide.setAttribute('aria-hidden', active ? 'false' : 'true');
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot') || 0));
        start();
      });
    });

    show(0);
    start();
  }

  function applyFilter(form) {
    var targetSelector = form.getAttribute('data-target');
    var target = targetSelector ? document.querySelector(targetSelector) : null;
    if (!target) return;
    var keyword = normalize(form.querySelector('[name="keyword"]') ? form.querySelector('[name="keyword"]').value : form.querySelector('[name="q"]') ? form.querySelector('[name="q"]').value : '');
    var region = normalize(form.querySelector('[name="region"]') ? form.querySelector('[name="region"]').value : '');
    var type = normalize(form.querySelector('[name="type"]') ? form.querySelector('[name="type"]').value : '');
    var cards = Array.prototype.slice.call(target.querySelectorAll('[data-card]'));

    cards.forEach(function (card) {
      var haystack = normalize(card.getAttribute('data-search'));
      var passKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      var passRegion = !region || haystack.indexOf(region) !== -1;
      var passType = !type || haystack.indexOf(type) !== -1;
      card.classList.toggle('is-hidden', !(passKeyword && passRegion && passType));
    });
  }

  function initFilters() {
    var forms = Array.prototype.slice.call(document.querySelectorAll('[data-filter-form]'));
    forms.forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        applyFilter(form);
      });
      Array.prototype.slice.call(form.querySelectorAll('input, select')).forEach(function (field) {
        field.addEventListener('input', function () {
          applyFilter(form);
        });
        field.addEventListener('change', function () {
          applyFilter(form);
        });
      });
      var clear = form.querySelector('[data-clear-filter]');
      if (clear) {
        clear.addEventListener('click', function () {
          form.reset();
          applyFilter(form);
          Array.prototype.slice.call(document.querySelectorAll('[data-chip-row] button')).forEach(function (button) {
            button.classList.remove('active');
          });
        });
      }
      applyFilter(form);
    });

    Array.prototype.slice.call(document.querySelectorAll('[data-chip-row] button')).forEach(function (button) {
      button.addEventListener('click', function () {
        var form = document.querySelector('[data-filter-form]');
        if (!form) return;
        var input = form.querySelector('[name="keyword"]');
        if (!input) return;
        var active = button.classList.toggle('active');
        Array.prototype.slice.call(button.parentNode.querySelectorAll('button')).forEach(function (other) {
          if (other !== button) other.classList.remove('active');
        });
        input.value = active ? button.getAttribute('data-chip') : '';
        applyFilter(form);
      });
    });
  }

  function initSearchQuery() {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (!q) return;
    var form = document.querySelector('[data-filter-form]');
    if (!form) return;
    var field = form.querySelector('[name="keyword"]');
    if (!field) return;
    field.value = q;
    applyFilter(form);
  }

  function initPlayer() {
    var video = document.querySelector('[data-player]');
    if (!video) return;
    var stream = video.getAttribute('data-stream-url');
    var playButton = document.querySelector('[data-play]');
    var hlsInstance = null;

    function bind() {
      if (!stream) return;
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else {
        video.src = stream;
      }
    }

    bind();

    if (playButton) {
      playButton.addEventListener('click', function () {
        video.play().catch(function () {});
      });
    }

    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initSearchQuery();
    initPlayer();
  });
})();
