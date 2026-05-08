const express = require('express');
const { tvInfoController } = require('../controllers/tvController');

const router = express.Router();

router.get('/:imdbId/info', tvInfoController);

module.exports = router;
