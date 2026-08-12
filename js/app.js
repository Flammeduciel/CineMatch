(() => {
  const moviesGrid = document.getElementById('movies-grid');
  const favoritesGrid = document.getElementById('favorites-grid');
  const favoritesSection = document.getElementById('favorites-section');
  const loader = document.getElementById('loader');
  const errorMessage = document.getElementById('error-message');
  const retryBtn = document.getElementById('retry-btn');
  const searchInput = document.getElementById('search-input');
  const searchBtn = document.getElementById('search-btn');
  const searchClear = document.getElementById('search-clear');
  const sectionTitle = document.getElementById('section-title');
  const modal = document.getElementById('movie-modal');
  const modalClose = document.getElementById('modal-close');
  const modalPoster = document.getElementById('modal-poster');
  const modalTitle = document.getElementById('modal-title');
  const modalDate = document.getElementById('modal-date');
  const modalRating = document.getElementById('modal-rating');
  const modalGenres = document.getElementById('modal-genres');
  const modalOverview = document.getElementById('modal-overview');
  const modalFavBtn = document.getElementById('modal-fav-btn');

  let currentModalMovie = null;

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
    const isFav = Favorites.isFavorite(movie.id);
    card.innerHTML = `
      <button class="card-fav-btn ${isFav ? 'is-fav' : ''}" data-fav-id="${movie.id}" aria-label="${isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}">
        ${isFav ? '&#9829;' : '&#9825;'}
      </button>
      <div class="movie-poster">
        <img src="${getPosterUrl(movie.poster_path)}" alt="${movie.title} - Affiche" loading="lazy">
        <span class="movie-rating ${ratingClass}">${movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</span>
      </div>
      <div class="movie-info">
        <h3 class="movie-title">${movie.title}</h3>
        <p class="movie-date">${formatDate(movie.release_date)}</p>
      </div>
    `;
    card.addEventListener('click', (e) => {
      if (e.target.closest('.card-fav-btn')) return;
      openModal(movie);
    });
    const favBtn = card.querySelector('.card-fav-btn');
    favBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const added = Favorites.toggle(movie);
      favBtn.classList.toggle('is-fav', added);
      favBtn.innerHTML = added ? '&#9829;' : '&#9825;';
      favBtn.setAttribute('aria-label', added ? 'Retirer des favoris' : 'Ajouter aux favoris');
      renderFavorites();
    });
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

  function renderFavorites() {
    const favs = Favorites.getAll();
    if (favs.length === 0) {
      favoritesSection.hidden = true;
      return;
    }
    favoritesSection.hidden = false;
    favoritesGrid.innerHTML = '';
    favs.forEach(movie => {
      favoritesGrid.appendChild(createCard(movie));
    });
  }

  function updateCardFavBtns(movieId) {
    const btns = document.querySelectorAll(`.card-fav-btn[data-fav-id="${movieId}"]`);
    const isFav = Favorites.isFavorite(movieId);
    btns.forEach(btn => {
      btn.classList.toggle('is-fav', isFav);
      btn.innerHTML = isFav ? '&#9829;' : '&#9825;';
      btn.setAttribute('aria-label', isFav ? 'Retirer des favoris' : 'Ajouter aux favoris');
    });
  }

  function updateModalFavBtn() {
    if (!currentModalMovie) return;
    const isFav = Favorites.isFavorite(currentModalMovie.id);
    modalFavBtn.classList.toggle('is-fav', isFav);
    modalFavBtn.querySelector('.heart-icon').innerHTML = isFav ? '&#9829;' : '&#9825;';
    modalFavBtn.setAttribute('aria-label', isFav ? 'Retirer des favoris' : 'Ajouter aux favoris');
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

  async function openModal(movie) {
    currentModalMovie = movie;
    modalPoster.src = getPosterUrl(movie.poster_path, 'w500');
    modalPoster.alt = `${movie.title} - Affiche`;
    modalTitle.textContent = movie.title;
    modalDate.textContent = formatDate(movie.release_date);
    modalRating.textContent = `Note : ${movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}/10`;
    modalRating.className = `modal-rating ${movie.vote_average ? getRatingClass(movie.vote_average) : ''}`;
    modalOverview.textContent = movie.overview || 'Pas de synopsis disponible.';
    modalGenres.textContent = 'Chargement...';
    updateModalFavBtn();
    modal.showModal();
    try {
      const details = await fetchMovieDetails(movie.id);
      modalGenres.textContent = details.genres.map(g => g.name).join(', ') || 'Genres inconnus';
    } catch {
      modalGenres.textContent = '';
    }
  }

  modalClose.addEventListener('click', () => modal.close());

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.close();
  });

  modal.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') modal.close();
  });

  modalFavBtn.addEventListener('click', () => {
    if (!currentModalMovie) return;
    Favorites.toggle(currentModalMovie);
    updateModalFavBtn();
    renderFavorites();
    updateCardFavBtns(currentModalMovie.id);
  });

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
  renderFavorites();
  loadTrending();
})();
