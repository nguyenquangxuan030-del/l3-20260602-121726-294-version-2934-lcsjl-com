(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            var isOpen = mobileNav.classList.toggle('open');
            menuButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var index = 0;

        function setSlide(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                setSlide(Number(dot.getAttribute('data-hero-dot') || 0));
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                setSlide(index + 1);
            }, 5200);
        }
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    var filterPanels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));

    filterPanels.forEach(function (panel) {
        var search = panel.querySelector('.js-search');
        var year = panel.querySelector('.js-year');
        var type = panel.querySelector('.js-type');
        var region = panel.querySelector('.js-region');
        var container = panel.parentElement || document;
        var cards = Array.prototype.slice.call(container.querySelectorAll('.searchable-card'));
        var empty = container.querySelector('.empty-state');

        function apply() {
            var query = normalize(search && search.value);
            var yearValue = normalize(year && year.value);
            var typeValue = normalize(type && type.value);
            var regionValue = normalize(region && region.value);
            var visible = 0;

            cards.forEach(function (card) {
                var text = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-tags'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year')
                ].join(' '));
                var ok = true;

                if (query && text.indexOf(query) === -1) {
                    ok = false;
                }
                if (yearValue && normalize(card.getAttribute('data-year')) !== yearValue) {
                    ok = false;
                }
                if (typeValue && normalize(card.getAttribute('data-type')) !== typeValue) {
                    ok = false;
                }
                if (regionValue && normalize(card.getAttribute('data-region')) !== regionValue) {
                    ok = false;
                }

                card.style.display = ok ? '' : 'none';
                if (ok) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('show', visible === 0);
            }
        }

        [search, year, type, region].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });
    });
})();
