(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    function textOf(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function setupMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5600);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                restart();
            });
        }

        restart();
    }

    function setupCardFilters() {
        var areas = Array.prototype.slice.call(document.querySelectorAll("[data-filter-area]"));
        areas.forEach(function (area) {
            var root = area.closest("main") || document;
            var cards = Array.prototype.slice.call(root.querySelectorAll("[data-movie-card]"));
            var empty = root.querySelector("[data-empty-state]");
            var searchInput = area.querySelector("[data-card-search]");
            var regionSelect = area.querySelector("[data-filter-region]");
            var yearSelect = area.querySelector("[data-filter-year]");

            function apply() {
                var keyword = searchInput ? textOf(searchInput.value) : "";
                var region = regionSelect ? textOf(regionSelect.value) : "";
                var year = yearSelect ? textOf(yearSelect.value) : "";
                var visible = 0;
                cards.forEach(function (card) {
                    var source = textOf(card.getAttribute("data-search-text"));
                    var cardRegion = textOf(card.getAttribute("data-region"));
                    var cardYear = textOf(card.getAttribute("data-year"));
                    var ok = true;
                    if (keyword && source.indexOf(keyword) === -1) {
                        ok = false;
                    }
                    if (region && cardRegion !== region) {
                        ok = false;
                    }
                    if (year && cardYear !== year) {
                        ok = false;
                    }
                    card.classList.toggle("is-hidden", !ok);
                    if (ok) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            [searchInput, regionSelect, yearSelect].forEach(function (control) {
                if (!control) {
                    return;
                }
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            });
        });
    }

    function resultCard(movie) {
        return [
            '<article class="movie-card">',
            '<a class="movie-card-link" href="' + movie.url + '">',
            '<div class="movie-poster">',
            '<img src="' + movie.cover + '" alt="' + movie.title.replace(/"/g, "&quot;") + '" loading="lazy">',
            '<span class="badge badge-year">' + movie.year + '</span>',
            '<span class="badge badge-category">' + movie.category + '</span>',
            '</div>',
            '<div class="movie-card-body">',
            '<h3>' + movie.title + '</h3>',
            '<p>' + movie.oneLine + '</p>',
            '<div class="movie-meta"><span>' + movie.type + '</span><span>·</span><span>' + movie.region + '</span></div>',
            '</div>',
            '</a>',
            '</article>'
        ].join("");
    }

    function setupSearchPage() {
        var data = window.SEARCH_INDEX;
        if (!Array.isArray(data)) {
            return;
        }
        var input = document.querySelector("[data-search-page-input]");
        var results = document.querySelector("[data-search-results]");
        var summary = document.querySelector("[data-search-summary]");
        var empty = document.querySelector("[data-search-empty]");
        if (!input || !results || !summary || !empty) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        input.value = initial;

        function render() {
            var keyword = textOf(input.value);
            if (!keyword) {
                results.innerHTML = "";
                summary.textContent = "";
                empty.textContent = "请输入关键词";
                empty.classList.add("is-visible");
                return;
            }
            var terms = keyword.split(/\s+/).filter(Boolean);
            var matches = data.filter(function (movie) {
                var source = textOf([movie.title, movie.region, movie.type, movie.year, movie.category, movie.genre, movie.oneLine].join(" "));
                return terms.every(function (term) {
                    return source.indexOf(term) !== -1;
                });
            }).slice(0, 120);
            results.innerHTML = matches.map(resultCard).join("");
            summary.textContent = '“' + input.value.trim() + '” 的搜索结果';
            empty.textContent = "没有匹配的影片";
            empty.classList.toggle("is-visible", matches.length === 0);
        }

        input.addEventListener("input", render);
        render();
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupCardFilters();
        setupSearchPage();
    });
})();
