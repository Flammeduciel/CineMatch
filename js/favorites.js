const Favorites = {
  KEY: 'cinematch_favorites',

  getAll() {
    try {
      return JSON.parse(localStorage.getItem(this.KEY)) || [];
    } catch {
      return [];
    }
  },

  add(movie) {
    const favs = this.getAll();
    if (!this.isFavorite(movie.id)) {
      favs.push({
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        vote_average: movie.vote_average,
        release_date: movie.release_date
      });
      localStorage.setItem(this.KEY, JSON.stringify(favs));
    }
  },

  remove(movieId) {
    const favs = this.getAll().filter(m => m.id !== movieId);
    localStorage.setItem(this.KEY, JSON.stringify(favs));
  },

  isFavorite(movieId) {
    return this.getAll().some(m => m.id === movieId);
  },

  toggle(movie) {
    if (this.isFavorite(movie.id)) {
      this.remove(movie.id);
      return false;
    } else {
      this.add(movie);
      return true;
    }
  }
};
