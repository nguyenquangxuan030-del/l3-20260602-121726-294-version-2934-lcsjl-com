(function () {
    var shell = document.querySelector('.player-shell');
    var video = document.getElementById('movie-player');
    var trigger = document.querySelector('.play-trigger');

    if (!shell || !video || !trigger) {
        return;
    }

    var stream = shell.getAttribute('data-stream');
    var started = false;
    var hlsInstance = null;

    function playVideo() {
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {});
        }
    }

    function bindStream() {
        if (started || !stream) {
            playVideo();
            return;
        }

        started = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream;
            playVideo();
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                maxBufferLength: 30,
                backBufferLength: 30,
                enableWorker: true
            });
            hlsInstance.loadSource(stream);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                playVideo();
            });
            return;
        }

        video.src = stream;
        playVideo();
    }

    function start() {
        trigger.classList.add('hidden');
        bindStream();
    }

    trigger.addEventListener('click', start);

    video.addEventListener('click', function () {
        if (video.paused) {
            start();
        } else {
            video.pause();
        }
    });

    video.addEventListener('play', function () {
        trigger.classList.add('hidden');
    });

    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
})();
