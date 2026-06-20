(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    ready(function () {
        var menuToggle = document.querySelector(".menu-toggle");
        var mobileNav = document.querySelector(".mobile-nav");

        if (menuToggle && mobileNav) {
            menuToggle.addEventListener("click", function () {
                var isOpen = mobileNav.classList.toggle("open");
                menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var previous = document.querySelector("[data-hero-prev]");
        var next = document.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, position) {
                slide.classList.toggle("active", position === current);
            });
            dots.forEach(function (dot, position) {
                dot.classList.toggle("active", position === current);
            });
        }

        function restartTimer() {
            if (timer) {
                window.clearInterval(timer);
            }
            if (slides.length > 1) {
                timer = window.setInterval(function () {
                    showSlide(current + 1);
                }, 5200);
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
                restartTimer();
            });
        });

        if (previous) {
            previous.addEventListener("click", function () {
                showSlide(current - 1);
                restartTimer();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(current + 1);
                restartTimer();
            });
        }

        showSlide(0);
        restartTimer();

        var searchInput = document.querySelector("[data-search-input]");
        var yearFilter = document.querySelector("[data-year-filter]");
        var items = Array.prototype.slice.call(document.querySelectorAll(".filter-target"));
        var emptyMessage = document.querySelector("[data-empty-message]");

        function applyFilters() {
            var keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";
            var year = yearFilter ? yearFilter.value : "";
            var visible = 0;

            items.forEach(function (item) {
                var haystack = [
                    item.getAttribute("data-title") || "",
                    item.getAttribute("data-keywords") || "",
                    item.getAttribute("data-year") || ""
                ].join(" ").toLowerCase();
                var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchesYear = !year || item.getAttribute("data-year") === year;
                var shouldShow = matchesKeyword && matchesYear;
                item.classList.toggle("hidden-by-filter", !shouldShow);
                if (shouldShow) {
                    visible += 1;
                }
            });

            if (emptyMessage) {
                emptyMessage.classList.toggle("show", visible === 0 && items.length > 0);
            }
        }

        if (searchInput) {
            searchInput.addEventListener("input", applyFilters);
        }

        if (yearFilter) {
            yearFilter.addEventListener("change", applyFilters);
        }
    });
})();
