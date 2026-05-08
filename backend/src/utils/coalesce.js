const inFlightRequests = new Map();

/**
 * Coalesces concurrent identical requests into a single promise.
 * This acts as a backend "debounce" preventing multiple simultaneous scrapes for the exact same query.
 * 
 * @param {string} key - Unique identifier for the request (e.g., search query string)
 * @param {Function} fetchPromiseFactory - Function returning the promise to execute
 * @returns {Promise<any>}
 */
const coalesce = (key, fetchPromiseFactory) => {
  if (inFlightRequests.has(key)) {
    return inFlightRequests.get(key);
  }

  const promise = fetchPromiseFactory().finally(() => {
    inFlightRequests.delete(key);
  });

  inFlightRequests.set(key, promise);
  return promise;
};

module.exports = { coalesce };
