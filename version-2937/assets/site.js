const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

document.addEventListener("DOMContentLoaded", () => {
    initMobileMenu();
    initHero();
    initSearchForms();
    initPageFilter();
    initPlayers();
});

function initMobileMenu() {
    const button = $("[data-menu-button]");
    const nav = $("[data-mobile-nav]");

    if (!button || !nav) {
        return;
    }

    button.addEventListener("click", () => {
        nav.classList.toggle("is-open");
        button.classList.toggle("is-open");
    });
}

function initHero() {
    const slides = $$(".hero-slide");
    const dots = $$(".hero-dot");

    if (slides.length < 2) {
        return;
    }

    let activeIndex = 0;

    const showSlide = (nextIndex) => {
        activeIndex = (nextIndex + slides.length) % slides.length;

        slides.forEach((slide, index) => {
            slide.classList.toggle("is-active", index === activeIndex);
        });

        dots.forEach((dot, index) => {
            dot.classList.toggle("is-active", index === activeIndex);
        });
    };

    dots.forEach((dot, index) => {
        dot.addEventListener("click", () => showSlide(index));
    });

    window.setInterval(() => showSlide(activeIndex + 1), 5200);
}

function initSearchForms() {
    const forms = $$("[data-search-form]");

    forms.forEach((form) => {
        form.addEventListener("submit", (event) => {
            const input = $("input[name='q']", form);
            const query = input ? input.value.trim() : "";

            if (!query) {
                return;
            }

            const grid = $("[data-filter-grid]");

            if (grid) {
                event.preventDefault();
                applyFilter(query);
            }
        });
    });
}

function initPageFilter() {
    const input = $("[data-local-search]");
    const params = new URLSearchParams(window.location.search);
    const query = params.get("q") || "";

    if (input && query) {
        input.value = query;
        applyFilter(query);
    }

    if (!input) {
        return;
    }

    input.addEventListener("input", () => {
        applyFilter(input.value.trim());
    });
}

function applyFilter(query) {
    const normalizedQuery = query.toLowerCase();
    const items = $$("[data-search-item]");
    const noResults = $("[data-no-results]");
    let visibleCount = 0;

    items.forEach((item) => {
        const haystack = (item.getAttribute("data-title") || "").toLowerCase();
        const isVisible = !normalizedQuery || haystack.includes(normalizedQuery);

        item.style.display = isVisible ? "" : "none";

        if (isVisible) {
            visibleCount += 1;
        }
    });

    if (noResults) {
        noResults.classList.toggle("is-visible", visibleCount === 0);
    }
}

function initPlayers() {
    const players = $$(".video-player");

    players.forEach((player) => {
        setupPlayer(player);
    });
}

let hlsLibraryPromise;

function getHlsLibrary() {
    if (!hlsLibraryPromise) {
        hlsLibraryPromise = import("./hls-vendor-dru42stk.js")
            .then((module) => module.H)
            .catch(() => loadExternalHls());
    }

    return hlsLibraryPromise;
}

function loadExternalHls() {
    if (window.Hls) {
        return Promise.resolve(window.Hls);
    }

    return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js";
        script.async = true;
        script.onload = () => resolve(window.Hls);
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

async function setupPlayer(player) {
    const video = $("video", player);
    const playButton = $(".player-cover", player);
    const status = $(".player-status", player);

    if (!video) {
        return;
    }

    const source = video.getAttribute("data-m3u8");

    if (!source) {
        return;
    }

    let hlsLoaded = false;

    try {
        const Hls = await getHlsLibrary();

        if (Hls && Hls.isSupported()) {
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });

            hls.loadSource(source);
            hls.attachMedia(video);
            hlsLoaded = true;

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                if (status) {
                    status.textContent = "视频已就绪";
                }
            });

            hls.on(Hls.Events.ERROR, () => {
                if (status) {
                    status.textContent = "正在尝试重新连接播放源";
                }
            });
        }
    } catch (error) {
        hlsLoaded = false;
    }

    if (!hlsLoaded && video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;

        if (status) {
            status.textContent = "视频已就绪";
        }
    }

    const startPlayback = () => {
        video.play()
            .then(() => {
                player.classList.add("is-playing");
            })
            .catch(() => {
                if (status) {
                    status.textContent = "点击视频控件后继续播放";
                }
            });
    };

    if (playButton) {
        playButton.addEventListener("click", startPlayback);
    }

    video.addEventListener("play", () => {
        player.classList.add("is-playing");
    });

    video.addEventListener("pause", () => {
        player.classList.remove("is-playing");
    });

    video.addEventListener("ended", () => {
        player.classList.remove("is-playing");
    });

    video.addEventListener("click", () => {
        if (video.paused) {
            startPlayback();
        }
    });
}
