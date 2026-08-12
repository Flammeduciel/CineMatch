const API_KEY = 'bb19ede141bb4177ab560889688bbe88';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_BASE = 'https://image.tmdb.org/t/p';

async function fetchTrending() {
  const res = await fetch(`${BASE_URL}/trending/movie/day?api_key=${API_KEY}&language=fr-FR`);
  if (!res.ok) throw new Error(`Erreur ${res.status}`);
  const data = await res.json();
  return data.results;
}

function getPosterUrl(path, size = 'w342') {
  if (!path) return '';
  return `${IMG_BASE}/${size}${path}`;
}

async function searchMovies(query) {
  const res = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&language=fr-FR&query=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error(`Erreur ${res.status}`);
  const data = await res.json();
  return data.results;
}
