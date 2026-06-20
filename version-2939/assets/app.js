(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function one(selector, root) {
    return (root || document).querySelector(selector);
  }

  function initMenu() {
    var button = one('[data-menu-toggle]');
    var nav = one('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('open');
      button.textContent = nav.classList.contains('open') ? '×' : '☰';
    });
  }

  function initHero() {
    var hero = one('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = all('[data-hero-slide]', hero);
    var dots = all('[data-hero-dot]', hero);
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }
    function play() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        play();
      });
    });
    hero.addEventListener('mouseenter', function () {
      window.clearInterval(timer);
    });
    hero.addEventListener('mouseleave', play);
    show(0);
    play();
  }

  function initCardFilters() {
    var grid = one('[data-filter-grid]');
    if (!grid) {
      return;
    }
    var keyword = one('[data-card-filter]');
    var region = one('[data-region-filter]');
    var year = one('[data-year-filter]');
    var cards = all('[data-movie-card]', grid);
    function apply() {
      var q = keyword ? keyword.value.trim().toLowerCase() : '';
      var r = region ? region.value : '';
      var y = year ? year.value : '';
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();
        var ok = true;
        if (q && haystack.indexOf(q) === -1) {
          ok = false;
        }
        if (r && card.getAttribute('data-region') !== r) {
          ok = false;
        }
        if (y && card.getAttribute('data-year') !== y) {
          ok = false;
        }
        card.classList.toggle('hidden-card', !ok);
      });
    }
    [keyword, region, year].forEach(function (el) {
      if (el) {
        el.addEventListener('input', apply);
        el.addEventListener('change', apply);
      }
    });
  }

  function movieCard(movie) {
    var tags = (movie.tags || []).slice(0, 2).map(function (tag) {
      return '<span class="tag-chip">' + escapeHtml(tag) + '</span>';
    }).join('');
    return '' +
      '<article class="movie-card">' +
      '<a class="poster-wrap" href="' + escapeHtml(movie.url) + '">' +
      '<img loading="lazy" src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '">' +
      '<span class="score-badge">' + escapeHtml(movie.score) + '</span>' +
      '</a>' +
      '<div class="movie-card-body">' +
      '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>' +
      '<p>' + escapeHtml(movie.oneLine) + '</p>' +
      '<div class="movie-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.type) + '</span></div>' +
      '<div class="tag-row">' + tags + '</div>' +
      '</div>' +
      '</article>';
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initSearchPage() {
    var results = one('[data-search-results]');
    if (!results || !window.moviesData) {
      return;
    }
    var input = one('[data-search-input]');
    var category = one('[data-search-category]');
    var button = one('[data-search-button]');
    var summary = one('[data-search-summary]');
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    if (input) {
      input.value = initial;
    }
    function render() {
      var q = input ? input.value.trim().toLowerCase() : '';
      var c = category ? category.value : '';
      var list = window.moviesData.filter(function (movie) {
        var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, (movie.tags || []).join(' '), movie.oneLine].join(' ').toLowerCase();
        var ok = true;
        if (q && haystack.indexOf(q) === -1) {
          ok = false;
        }
        if (c && movie.category !== c) {
          ok = false;
        }
        return ok;
      }).slice(0, 240);
      results.innerHTML = list.map(movieCard).join('');
      if (summary) {
        summary.textContent = list.length ? '为你推荐以下影片' : '暂无匹配影片';
      }
    }
    if (button) {
      button.addEventListener('click', render);
    }
    if (input) {
      input.addEventListener('input', render);
    }
    if (category) {
      category.addEventListener('change', render);
    }
    render();
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initCardFilters();
    initSearchPage();
  });
})();
