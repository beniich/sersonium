const express = require('express');
const router = express.Router();
const computeController = require('../controllers/compute.controller');

router.post('/worker', computeController.deployWorker);
router.post('/kv', computeController.manageKV);
router.post('/ai-analysis', computeController.runAiAnalysis);

module.exports = router;
