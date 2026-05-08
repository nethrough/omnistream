const KEY = 'streamapp_history';
const MAX = 24;

export const getHistory = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
};

export const saveToHistory = ({ imdbId, title, poster, year, type, season, episode }) => {
  if (!imdbId) return;
  const rest = getHistory().filter((h) => h.imdbId !== imdbId);
  const item = { imdbId, title, poster, year, type, watchedAt: Date.now() };
  if (type === 'series') {
    item.season = season || 1;
    item.episode = episode || 1;
  }
  rest.unshift(item);
  localStorage.setItem(KEY, JSON.stringify(rest.slice(0, MAX)));
};

export const removeFromHistory = (imdbId) => {
  const next = getHistory().filter((h) => h.imdbId !== imdbId);
  localStorage.setItem(KEY, JSON.stringify(next));
};
