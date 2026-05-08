const axios = require('axios');
const axiosRetry = require('axios-retry').default;

const client = axios.create({
  timeout: 10000 // 10 seconds timeout per global rules
});

// Configure retry logic: max 2 retries
axiosRetry(client, {
  retries: 2,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    // Retry on network errors, timeouts, or 5xx status codes
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.code === 'ECONNABORTED';
  }
});

module.exports = client;
