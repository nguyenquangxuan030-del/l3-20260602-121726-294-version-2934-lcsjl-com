(function () {
  function initializePlayer(shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('[data-play-button]');
    var source = shell.getAttribute('data-src');
    var started = false;

    function loadSource() {
      if (started || !video || !source) {
        return;
      }

      started = true;

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        video._hlsInstance = hls;
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        video.src = source;
      }
    }

    function playVideo() {
      loadSource();
      if (button) {
        button.classList.add('hidden');
      }
      var promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          if (button) {
            button.classList.remove('hidden');
          }
        });
      }
    }

    if (button) {
      button.addEventListener('click', playVideo);
    }

    shell.addEventListener('click', function (event) {
      if (event.target === video || event.target === shell) {
        playVideo();
      }
    });

    video.addEventListener('play', function () {
      if (button) {
        button.classList.add('hidden');
      }
    });

    video.addEventListener('pause', function () {
      if (button && video.currentTime === 0) {
        button.classList.remove('hidden');
      }
    });
  }

  document.querySelectorAll('[data-player]').forEach(initializePlayer);
})();
