const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const timeout = require('connect-timeout');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { success: false, data: null, error: 'Too many requests, please try again later.' }
});
app.use(limiter);

app.use(timeout('20s'));
app.use((req, res, next) => {
  if (!req.timedout) next();
});

const searchRoutes = require('./routes/search');
const tvRoutes = require('./routes/tv');

app.use('/api/search', searchRoutes);
app.use('/api/tv', tvRoutes);

// In Electron production builds, serve the compiled React app
if (process.env.FRONTEND_DIST) {
  app.use(express.static(process.env.FRONTEND_DIST));
  // Catch-all for React Router — must use app.use, Express 5 dropped wildcard '*' routes
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(process.env.FRONTEND_DIST, 'index.html'));
  });
}

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Error:', err.message);

  if (req.timedout) {
    return res.status(503).json({ success: false, data: null, error: 'Request Timeout' });
  }

  res.status(err.status || 500).json({
    success: false,
    data: null,
    error: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 3001;
const serverReady = new Promise((resolve) => {
  app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
    resolve(PORT);
  });
});

module.exports = { serverReady };
