(() => {
  const moviesGrid = document.getElementById('movies-grid');
  const loader = document.getElementById('loader');
  const errorMessage = document.getElementById('error-message');
  const retryBtn = document.getElementById('retry-btn');
  const searchInput = document.getElementById('search-input');
  const searchBtn = document.getElementById('search-btn');
  const searchClear = document.getElementById('search-clear');
  const sectionTitle = document.getElementById('section-title');

  function formatDate(dateStr) {
    if (!dateStr) return 'Date inconnue';
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  function getRatingClass(rating) {
    if (rating >= 7) return 'rating-high';
    if (rating >= 5) return 'rating-medium';
    return 'rating-low';
  }

  function createCard(movie) {
    const card = document.createElement('article');
    card.className = 'movie-card';
    card.dataset.id = movie.id;
    const ratingClass = movie.vote_average ? getRatingClass(movie.vote_average) : '';
    card.innerHTML = `
      <div class="movie-poster">
        <img src="${getPosterUrl(movie.poster_path)}" alt="${movie.title} - Affiche" loading="lazy">
        <span class="movie-rating ${ratingClass}">${movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</span>
      </div>
      <div class="movie-info">
        <h3 class="movie-title">${movie.title}</h3>
        <p class="movie-date">${formatDate(movie.release_date)}</p>
      </div>
    `;
    return card;
  }

  function renderMovies(movies) {
    moviesGrid.innerHTML = '';
    if (movies.length === 0) {
      moviesGrid.innerHTML = '<p class="no-results">Aucun film trouvé.</p>';
      return;
    }
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
    sectionTitle.textContent = 'Films Populaires';
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

  async function handleSearch() {
    const query = searchInput.value.trim();
    if (!query) {
      loadTrending();
      return;
    }
    sectionTitle.textContent = `Résultats pour "${query}"`;
    showLoader();
    try {
      const movies = await searchMovies(query);
      hideLoader();
      renderMovies(movies);
    } catch (err) {
      console.error('Erreur recherche:', err);
      showError();
    }
  }

  searchBtn.addEventListener('click', handleSearch);

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSearch();
  });

  searchInput.addEventListener('input', () => {
    searchClear.classList.toggle('visible', searchInput.value.length > 0);
  });

  searchClear.addEventListener('click', () => {
    searchInput.value = '';
    searchClear.classList.remove('visible');
    loadTrending();
    searchInput.focus();
  });

  retryBtn.addEventListener('click', loadTrending);
  loadTrending();
})();
