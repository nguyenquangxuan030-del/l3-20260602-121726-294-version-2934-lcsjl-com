(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var params = new URLSearchParams(window.location.search);
  var initialQuery = params.get('q') || '';
  var filterInput = document.querySelector('[data-filter-input]');

  if (filterInput && initialQuery) {
    filterInput.value = initialQuery;
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function filterCards() {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

    if (!cards.length) {
      return;
    }

    var query = normalize(filterInput ? filterInput.value : '');
    var regionSelect = document.querySelector('[data-filter-select="region"]');
    var typeSelect = document.querySelector('[data-filter-select="type"]');
    var region = normalize(regionSelect ? regionSelect.value : '');
    var type = normalize(typeSelect ? typeSelect.value : '');

    cards.forEach(function (card) {
      var haystack = normalize([
        card.dataset.title,
        card.dataset.region,
        card.dataset.type,
        card.dataset.year,
        card.dataset.tags
      ].join(' '));
      var regionText = normalize(card.dataset.region);
      var typeText = normalize(card.dataset.type);
      var matchedQuery = !query || haystack.indexOf(query) !== -1;
      var matchedRegion = !region || regionText.indexOf(region) !== -1;
      var matchedType = !type || typeText.indexOf(type) !== -1;

      card.classList.toggle('is-hidden', !(matchedQuery && matchedRegion && matchedType));
    });
  }

  if (filterInput) {
    filterInput.addEventListener('input', filterCards);
    filterCards();
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-filter-select]')).forEach(function (select) {
    select.addEventListener('change', filterCards);
  });

  Array.prototype.slice.call(document.querySelectorAll('[data-search-form]')).forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      var value = input ? input.value.trim() : '';

      if (!value) {
        event.preventDefault();
      }
    });
  });

  function loadHls(callback) {
    if (window.Hls) {
      callback();
      return;
    }

    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js';
    script.onload = callback;
    document.head.appendChild(script);
  }

  function bindPlayer(video) {
    var src = video.dataset.play;
    var overlay = document.querySelector('[data-player-overlay]');
    var ready = false;

    function attach() {
      if (!src) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        if (!video.src) {
          video.src = src;
        }
        ready = true;
        start();
        return;
      }

      loadHls(function () {
        if (window.Hls && window.Hls.isSupported()) {
          if (!video._hlsPlayer) {
            video._hlsPlayer = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            video._hlsPlayer.loadSource(src);
            video._hlsPlayer.attachMedia(video);
          }
          ready = true;
          start();
        } else {
          video.src = src;
          ready = true;
          start();
        }
      });
    }

    function start() {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }

      if (!ready) {
        attach();
        return;
      }

      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener('click', start);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });

    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('video[data-play]')).forEach(bindPlayer);
})();
