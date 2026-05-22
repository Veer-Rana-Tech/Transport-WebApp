const express = require('express');
const router = express.Router();
const { trackApplication } = require('../controllers/trackingController');

router.get('/:trackingId', trackApplication);

module.exports = router;