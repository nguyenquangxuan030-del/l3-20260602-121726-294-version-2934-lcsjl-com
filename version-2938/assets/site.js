(function () {
    function $(selector, parent) {
        return (parent || document).querySelector(selector);
    }

    function $all(selector, parent) {
        return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
    }

    var menuButton = $('[data-mobile-menu]');
    var mobileNav = $('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    $all('[data-site-search]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            var input = form.querySelector('input[name="q"]');
            if (!input || !input.value.trim()) {
                event.preventDefault();
                window.location.href = form.getAttribute('action') || './search.html';
            }
        });
    });

    var hero = $('[data-hero]');

    if (hero) {
        var slides = $all('[data-hero-slide]', hero);
        var dots = $all('[data-hero-dot]', hero);
        var current = 0;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }
    }

    var filterScope = $('[data-filter-scope]');
    var cardList = $('[data-card-list]');

    if (filterScope && cardList) {
        var keywordInput = $('[data-card-filter]', filterScope);
        var yearSelect = $('[data-year-filter]', filterScope);
        var typeSelect = $('[data-type-filter]', filterScope);
        var cards = $all('.movie-card', cardList);

        function applyFilters() {
            var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
            var year = yearSelect ? yearSelect.value : '';
            var type = typeSelect ? typeSelect.value : '';

            cards.forEach(function (card) {
                var text = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-tags'),
                    card.getAttribute('data-year')
                ].join(' ').toLowerCase();
                var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchYear = !year || card.getAttribute('data-year') === year;
                var matchType = !type || card.getAttribute('data-type') === type;
                card.classList.toggle('is-hidden', !(matchKeyword && matchYear && matchType));
            });
        }

        [keywordInput, yearSelect, typeSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilters);
                control.addEventListener('change', applyFilters);
            }
        });
    }
}());
