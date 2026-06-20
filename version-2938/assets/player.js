(function () {
    function initializePlayer(shell) {
        var video = shell.querySelector('video');
        var source = shell.getAttribute('data-src');

        if (!video || !source) {
            return;
        }

        if (video.getAttribute('data-loaded') !== 'true') {
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                video.hlsInstance = hls;
            } else {
                video.src = source;
            }

            video.setAttribute('data-loaded', 'true');
        }

        video.controls = true;
        shell.classList.add('is-playing');

        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
                shell.classList.remove('is-playing');
                video.controls = true;
            });
        }
    }

    document.addEventListener('click', function (event) {
        var button = event.target.closest('[data-player-button]');
        if (!button) {
            return;
        }

        var shell = button.closest('.player-shell');
        if (shell) {
            initializePlayer(shell);
        }
    });
}());
