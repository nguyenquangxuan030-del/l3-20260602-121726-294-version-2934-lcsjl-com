(function () {
  function initPlayer(player) {
    var video = player.querySelector('video');
    var button = player.querySelector('[data-play-button]');
    if (!video || !button) {
      return;
    }
    var stream = video.getAttribute('data-stream');
    var loaded = false;
    var hls = null;

    function setFailure() {
      button.classList.remove('hidden');
      button.innerHTML = '<span class="play-circle">▶</span><strong>视频加载失败，请稍后再试</strong>';
    }

    function attach() {
      if (loaded) {
        return Promise.resolve();
      }
      loaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        return Promise.resolve();
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setFailure();
          }
        });
        return Promise.resolve();
      }
      setFailure();
      return Promise.reject(new Error('playback unavailable'));
    }

    function start() {
      attach().then(function () {
        button.classList.add('hidden');
        video.controls = true;
        var attempt = video.play();
        if (attempt && typeof attempt.catch === 'function') {
          attempt.catch(function () {
            button.classList.remove('hidden');
          });
        }
      }).catch(function () {
        setFailure();
      });
    }

    button.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      } else {
        video.pause();
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(initPlayer);
  });
})();
