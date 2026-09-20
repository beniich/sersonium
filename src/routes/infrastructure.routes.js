const express = require('express');
const router = express.Router();
const infraController = require('../controllers/infrastructure.controller');

router.get('/heatmap', infraController.getAssetHeatmap);
router.post('/work-order', infraController.createWorkOrder);
router.get('/predictive-maintenance', infraController.getPredictiveMaint);

module.exports = router;
