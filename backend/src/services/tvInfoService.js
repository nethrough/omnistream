const client = require('../utils/fetchWithRetry');

const fetchTvInfo = async (imdbId) => {
  // TVMaze is a free public TV database — no API key required
  const lookupRes = await client.get('https://api.tvmaze.com/lookup/shows', {
    params: { imdb: imdbId },
  });

  const tvmazeId = lookupRes.data.id;

  // Fetch all episodes in one request and group by season for accurate counts
  const episodesRes = await client.get(`https://api.tvmaze.com/shows/${tvmazeId}/episodes`);

  const seasonMap = {};
  for (const ep of episodesRes.data) {
    if (ep.season > 0) {
      seasonMap[ep.season] = (seasonMap[ep.season] || 0) + 1;
    }
  }

  const seasons = Object.entries(seasonMap)
    .map(([num, count]) => ({ seasonNumber: parseInt(num), episodeCount: count }))
    .sort((a, b) => a.seasonNumber - b.seasonNumber);

  return { tvmazeId, totalSeasons: seasons.length, seasons };
};

module.exports = { fetchTvInfo };
