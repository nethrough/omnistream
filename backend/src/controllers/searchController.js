const { fetchImdbSearch } = require('../services/imdbSearchService');
const searchCache = require('../cache/searchCache');
const { coalesce } = require('../utils/coalesce');

const searchController = async (req, res, next) => {
  try {
    const query = req.query.q;
    if (!query || typeof query !== 'string' || query.trim() === '') {
      return res.status(400).json({
        success: false,
        data: null,
        error: 'Query parameter "q" is required.'
      });
    }

    const trimmedQuery = query.trim().toLowerCase();
    
    // Check Cache
    const cachedResult = searchCache.get(trimmedQuery);
    if (cachedResult) {
      return res.json({
        success: true,
        data: cachedResult,
        error: null
      });
    }

    // Coalesce and Fetch
    const results = await coalesce(`search:${trimmedQuery}`, () => fetchImdbSearch(trimmedQuery));
    
    // Set Cache for 1 hour
    searchCache.set(trimmedQuery, results);

    return res.json({
      success: true,
      data: results,
      error: null
    });

  } catch (error) {
    next(error);
  }
};

module.exports = { searchController };
