const { fetchTvInfo } = require('../services/tvInfoService');
const NodeCache = require('node-cache');

const tvCache = new NodeCache({ stdTTL: 86400, checkperiod: 3600 });

const tvInfoController = async (req, res, next) => {
  try {
    const { imdbId } = req.params;
    if (!imdbId || !imdbId.startsWith('tt')) {
      return res.status(400).json({ success: false, data: null, error: 'Invalid IMDb ID' });
    }

    const cached = tvCache.get(imdbId);
    if (cached) return res.json({ success: true, data: cached, error: null });

    const data = await fetchTvInfo(imdbId);
    tvCache.set(imdbId, data);

    return res.json({ success: true, data, error: null });
  } catch (error) {
    next(error);
  }
};

module.exports = { tvInfoController };
