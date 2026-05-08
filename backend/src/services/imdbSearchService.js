const client = require('../utils/fetchWithRetry');

const fetchImdbSearch = async (query) => {
  // Use IMDb's internal autocomplete JSON API to bypass their aggressive WAF on the /find/ HTML page
  // This yields identical robust data without being blocked by Cloudflare/AWS.
  const letter = query.charAt(0).toLowerCase();
  const url = `https://v2.sg.media-imdb.com/suggestion/${letter}/${encodeURIComponent(query)}.json`;
  
  const response = await client.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      'Accept': 'application/json'
    }
  });

  return parseImdbJson(response.data);
};

const parseImdbJson = (data) => {
  const results = [];
  if (!data || !data.d) return results;

  data.d.forEach(item => {
    // Only keep titles (starts with 'tt')
    if (!item.id || !item.id.startsWith('tt')) return;

    results.push({
      title: item.l,
      imdbId: item.id,
      year: item.y ? String(item.y) : null,
      poster: item.i && item.i.imageUrl ? item.i.imageUrl : null,
      type: item.q && item.q.toLowerCase().includes('series') ? 'series' : 'movie'
    });
  });

  return results;
};

module.exports = { fetchImdbSearch, parseImdbJson };
