(function () {
  var button = document.querySelector('[data-menu-button]');
  var panel = document.querySelector('[data-mobile-panel]');

  if (button && panel) {
    button.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function setSlide(index) {
      current = index;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        setSlide(index);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        setSlide((current + 1) % slides.length);
      }, 5200);
    }
  }

  var searchInput = document.querySelector('[data-page-search]');
  var typeFilter = document.querySelector('[data-page-filter]');
  var list = document.querySelector('[data-card-list]');

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyFilters() {
    if (!list) {
      return;
    }

    var query = normalize(searchInput ? searchInput.value : '');
    var selected = normalize(typeFilter ? typeFilter.value : '');
    var cards = Array.prototype.slice.call(list.children);

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-genre'),
        card.textContent
      ].join(' '));
      var cardType = normalize(card.getAttribute('data-type') || card.textContent);
      var matchQuery = !query || haystack.indexOf(query) !== -1;
      var matchType = !selected || cardType.indexOf(selected) !== -1;
      card.classList.toggle('hide-card', !(matchQuery && matchType));
    });
  }

  if (searchInput) {
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q');

    if (initial) {
      searchInput.value = initial;
    }

    searchInput.addEventListener('input', applyFilters);
  }

  if (typeFilter) {
    typeFilter.addEventListener('change', applyFilters);
  }

  applyFilters();
})();
