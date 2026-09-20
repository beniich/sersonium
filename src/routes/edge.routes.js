const express = require('express');
const router = express.Router();
const edgeController = require('../controllers/edge.controller');

router.post('/dns', edgeController.manageDns);
router.post('/routing', edgeController.setRoutingRule);
router.get('/waf-events', edgeController.getWafEvents);

module.exports = router;
