(function () {
    window.setupPlayer = function (videoId, overlayId, streamUrl) {
        var video = document.getElementById(videoId);
        var overlay = document.getElementById(overlayId);
        var hlsInstance = null;

        function begin() {
            if (!video || !streamUrl) {
                return;
            }

            if (overlay) {
                overlay.classList.add("is-hidden");
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                if (video.src !== streamUrl) {
                    video.src = streamUrl;
                }
                video.play().catch(function () {});
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                if (!hlsInstance) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(streamUrl);
                    hlsInstance.attachMedia(video);
                }
                video.play().catch(function () {});
                return;
            }

            if (video.src !== streamUrl) {
                video.src = streamUrl;
            }
            video.play().catch(function () {});
        }

        if (overlay) {
            overlay.addEventListener("click", begin);
        }

        if (video) {
            video.addEventListener("click", function () {
                if (video.paused) {
                    begin();
                }
            });
        }
    };
})();
