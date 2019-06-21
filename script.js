const searchForm = document.querySelector('#search-form');
const movie = document.querySelector('#movies');
const urlPoster = 'https://image.tmdb.org/t/p/w500';

function apiSearch(event) {
    event.preventDefault();
    const searchText = document.querySelector('.form-control').value;
    if (searchText.trim().length === 0) {
        movie.innerHTML = '<h2 class="col-12 text-center text-danger">Write something...</h2>';
        return;
    }

    movie.innerHTML = '<div class="spinner"></div>';

    fetch('https://api.themoviedb.org/3/search/multi?api_key=0b5e9f76ec18463b43a4402421d24307&language=ru&query=' + searchText)
        .then(function (value) {
            if (value.status !== 200) {
                return Promise.reject(value);
            }
            return value.json();
        })
        .then(function (output) {
            let inner = '';
            if (output.results.length === 0) {
                inner = '<h2 class="col-12 text-center text-danger text-info">Nothing found =(</h2>';
            }
            output.results.forEach(function (item) {
                let nameItem = item.name || item.title;
                const poster = item.poster_path ? urlPoster + item.poster_path : './img/no_poster.jpg';
                let dataInfo = '';
                if (item.media_type !== 'person') dataInfo = `data-id ="${item.id}" data-type="${item.media_type}"`;

                inner += `<div class="item col-5 col-md-4">
                <img src="${poster}" class="img_poster" alt="${nameItem}" ${dataInfo}/>
                <h5>${nameItem}</h5>
                </div>`;
            });
            movie.innerHTML = inner;

            addEventMedia();

        })
        .catch(function (err) {
            movie.innerHTML = 'Oops...something went wrong(';
            console.error('error: ' + err.status);
        })
}

searchForm.addEventListener('submit', apiSearch);

function addEventMedia() {
    const media = movie.querySelectorAll('img[data-id]');
    media.forEach(function (elem) {
        elem.style.cursor = 'pointer';
        elem.addEventListener('click', showFullInfo);
    });
}

function showFullInfo() {
    let url = '';
    if (this.dataset.type === 'movie') {
        url = 'https://api.themoviedb.org/3/movie/' + this.dataset.id + '?api_key=0b5e9f76ec18463b43a4402421d24307&language=en-US'
    } else if (this.dataset.type === 'tv') {
        url = 'https://api.themoviedb.org/3/tv/' + this.dataset.id + '?api_key=0b5e9f76ec18463b43a4402421d24307&language=en-US'
    } else {
        movie.innerHTML = '<h2 class="col-12 text-center text-danger">Something went wrong... Try again later</h2>';
    }

    fetch(url)
        .then(function (value) {
            if (value.status !== 200) {
                return Promise.reject(new Error(value.status));
            }
            return value.json();
        })
        .then((output) => {
            console.log(output);
            movie.innerHTML = `<h4 class="col-12 text-center text-danger">${output.name || output.title}</h4>
            <div class="col-12 text-center">
             <div class="poster_section">
             <img src='${urlPoster + output.poster_path}' alt='${output.name || output.title}'/>
             ${(output.homepage) ? `<p class="text-center"><a href="${output.homepage}" target="_blank">Official page</a></p>` : ''}
             
             ${(output.imdb_id) ? `<p class="text-center"><a href="https://imdb.com/title/${output.imdb_id}" target="_blank">IMDB.com</a></p>` : ''}
        </div>
        <div class="descript">
       <p>Raiting: ${output.vote_average}</p>
       <p>Status: ${output.status}</p>
       <p>Release: ${output.first_air_date || output.release_date}</p>
       
       ${(output.last_episode_to_air) ? `<p>${output.number_of_seasons} Season ${output.last_episode_to_air.episode_number} Episodes released</p>` : ""}
                <p>Description: ${output.overview}</p>
                <br>
                <div class="youtube"></div>
            </div>
          </div>`;
            getVideo(this.dataset.type, this.dataset.id);
        })
        .catch(function (err) {
            movie.innerHTML = 'Oops...something went wrong(';
            console.error(err || err.status);
        })
}

document.addEventListener('DOMContentLoaded', function () {
    fetch('https://api.themoviedb.org/3/trending/all/week?api_key=0b5e9f76ec18463b43a4402421d24307')
        .then(function (value) {
            if (value.status !== 200) {
                return Promise.reject(value);
            }
            return value.json();
        })
        .then(function (output) {
            let inner = '<h4 class="col-12 text-center text-danger text-info">Popular for this week</h4>';
            if (output.results.length === 0) {
                inner = '<h4 class="col-12 text-center text-danger text-info">Write something...</h4>';
            }
            output.results.forEach(function (item) {

                let nameItem = item.name || item.title;

                let mediaType = item.title ? 'movie' : 'tv';

                const poster = item.poster_path ? urlPoster + item.poster_path : './img/no_poster.jpg';
                let dataInfo = `data-id ="${item.id}" data-type="${mediaType}"`;

                inner += `<div class="item col-5 col-md-4">
                <img src="${poster}" class="img_poster" alt="${nameItem}" ${dataInfo}/>
                <h5>${nameItem}</h5>
                </div>`;
            });
            movie.innerHTML = inner;

            addEventMedia();

        })
        .catch(function (err) {
            movie.innerHTML = 'Oops...something went wrong(';
            console.error('error: ' + err.status);
        });
});

function getVideo(type, id) {
    let youtube = movie.querySelector('.youtube');
    youtube.innerHTML = type;
    fetch(`https://api.themoviedb.org/3/${type}/${id}/videos?api_key=0b5e9f76ec18463b43a4402421d24307&language=ru`)
        .then((value) => {
            if (value.status !== 200) {
                return Promise.reject(new Error(value.status));
            }
            return value.json();
        })
        .then((output) => {
            let videoFrame = '<h4>Video</h4>';

            if (output.results.length === 0) {
                videoFrame = '<p>Video not exist</p>';
            }

            output.results.forEach((item) => {
                videoFrame += '<iframe width="560" height="315" src="https://www.youtube.com/embed/' + item.key + '" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
            });
            youtube.innerHTML = videoFrame;
        })
        .catch((err) => {
            youtube.innerHTML = 'Video not exist';
            console.log(err || err.status);
        });
}
