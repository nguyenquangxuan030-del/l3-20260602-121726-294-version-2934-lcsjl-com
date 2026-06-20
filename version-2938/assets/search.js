(function () {
    var data = window.MOVIE_SEARCH_DATA || [];
    var form = document.querySelector('[data-live-search-form]');
    var input = document.querySelector('[data-live-search-input]');
    var results = document.querySelector('[data-search-results]');
    var count = document.querySelector('[data-search-count]');

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function render(list) {
        if (!results) {
            return;
        }

        if (count) {
            count.textContent = list.length + ' 条结果';
        }

        results.innerHTML = list.slice(0, 200).map(function (movie) {
            var tags = movie.tags.slice(0, 3).map(function (tag) {
                return '<span>' + escapeHtml(tag) + '</span>';
            }).join('');

            return '' +
                '<article class="movie-card" data-title="' + escapeHtml(movie.title) + '">' +
                '    <a class="movie-poster" href="./' + escapeHtml(movie.href) + '">' +
                '        <img src="./' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
                '        <span class="movie-views">' + escapeHtml(movie.views) + ' 热度</span>' +
                '    </a>' +
                '    <div class="movie-info">' +
                '        <h3><a href="./' + escapeHtml(movie.href) + '">' + escapeHtml(movie.title) + '</a></h3>' +
                '        <p>' + escapeHtml(movie.oneLine) + '</p>' +
                '        <div class="movie-tags">' + tags + '</div>' +
                '        <div class="movie-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.channel) + '</span></div>' +
                '    </div>' +
                '</article>';
        }).join('');
    }

    function runSearch(query) {
        var q = String(query || '').trim().toLowerCase();
        var list = data;

        if (q) {
            list = data.filter(function (movie) {
                return [
                    movie.title,
                    movie.year,
                    movie.region,
                    movie.type,
                    movie.genre,
                    movie.channel,
                    movie.oneLine,
                    movie.tags.join(' ')
                ].join(' ').toLowerCase().indexOf(q) !== -1;
            });
        } else {
            list = data.slice(0, 60);
        }

        render(list);
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';

    if (input) {
        input.value = initial;
        input.addEventListener('input', function () {
            runSearch(input.value);
        });
    }

    if (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            runSearch(input ? input.value : '');
        });
    }

    runSearch(initial);
}());
