const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings.controller');
const { cacheResponse, invalidateCache } = require('../middleware/responseCache');

// GET settings
router.get('/', cacheResponse('settings', 5 * 60 * 1000), settingsController.getSettings);

// PUT update settings
router.put('/', invalidateCache('settings'), settingsController.updateSettings);

module.exports = router;
