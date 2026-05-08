const NodeCache = require('node-cache');

// stdTTL is in seconds. 3600 seconds = 1 hour.
const searchCache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

module.exports = searchCache;
