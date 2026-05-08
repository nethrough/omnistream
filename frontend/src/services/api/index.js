// In a Vite production build (Electron) the app is served by Express on the
// same origin, so relative paths work. In dev, proxy to the backend directly.
const API_BASE = import.meta.env.PROD ? '' : (import.meta.env.VITE_API_URL || 'http://localhost:3001');

export const searchImdb = async (query) => {
  const response = await fetch(`${API_BASE}/api/search?q=${encodeURIComponent(query)}`);
  return response.json();
};

export const getStream = async (imdbId) => {
  const response = await fetch(`${API_BASE}/api/stream/${imdbId}`);
  return response.json();
};

export const getTvInfo = async (imdbId) => {
  const response = await fetch(`${API_BASE}/api/tv/${imdbId}/info`);
  return response.json();
};
