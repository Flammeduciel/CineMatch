(() => {
  const moviesGrid = document.getElementById('movies-grid');
  const loader = document.getElementById('loader');
  const errorMessage = document.getElementById('error-message');
  const retryBtn = document.getElementById('retry-btn');

  function formatDate(dateStr) {
    if (!dateStr) return 'Date inconnue';
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  function createCard(movie) {
    const card = document.createElement('article');
    card.className = 'movie-card';
    card.dataset.id = movie.id;
    card.innerHTML = `
      <div class="movie-poster">
        <img src="${getPosterUrl(movie.poster_path)}" alt="${movie.title} - Affiche" loading="lazy">
      </div>
      <div class="movie-info">
        <h3 class="movie-title">${movie.title}</h3>
        <p class="movie-date">${formatDate(movie.release_date)}</p>
        <span class="movie-rating">${movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</span>
      </div>
    `;
    return card;
  }

  function renderMovies(movies) {
    moviesGrid.innerHTML = '';
    movies.forEach(movie => {
      moviesGrid.appendChild(createCard(movie));
    });
  }

  function showLoader() {
    loader.style.display = 'flex';
    errorMessage.style.display = 'none';
    moviesGrid.innerHTML = '';
  }

  function hideLoader() {
    loader.style.display = 'none';
  }

  function showError() {
    hideLoader();
    errorMessage.style.display = 'block';
    moviesGrid.innerHTML = '';
  }

  async function loadTrending() {
    showLoader();
    try {
      const movies = await fetchTrending();
      hideLoader();
      renderMovies(movies);
    } catch (err) {
      console.error('Erreur chargement films:', err);
      showError();
    }
  }

  retryBtn.addEventListener('click', loadTrending);
  loadTrending();
})();
