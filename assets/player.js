(function () {
    function setup(shell) {
        var video = shell.querySelector("[data-player-video]");
        var button = shell.querySelector("[data-player-start]");
        var mediaUrl = shell.getAttribute("data-video-url");
        var loaded = false;
        var hls = null;
        if (!video || !button || !mediaUrl) {
            return;
        }

        function load() {
            if (loaded) {
                return;
            }
            loaded = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = mediaUrl;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true });
                hls.loadSource(mediaUrl);
                hls.attachMedia(video);
                shell.hls = hls;
                return;
            }
            video.src = mediaUrl;
        }

        function start(event) {
            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }
            load();
            shell.classList.add("is-playing");
            video.setAttribute("controls", "controls");
            var playRequest = video.play();
            if (playRequest && typeof playRequest.catch === "function") {
                playRequest.catch(function () {});
            }
        }

        button.addEventListener("click", start);
        shell.addEventListener("click", function (event) {
            if (!shell.classList.contains("is-playing") && event.target !== video) {
                start(event);
            }
        });
        video.addEventListener("play", function () {
            shell.classList.add("is-playing");
        });
        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", function () {
            Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(setup);
        });
        return;
    }
    Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(setup);
})();
