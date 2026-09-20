const express = require('express');
const router = express.Router();
const trafficController = require('../controllers/traffic.controller');

// Exposer les méthodes sous forme d'API REST
router.get('/performance', trafficController.getPerf);
router.get('/error-analysis', trafficController.getErrorAnalysis);
router.get('/bandwidth', trafficController.getBandwidthUsage);
router.get('/kafka-flow', trafficController.getKafkaFlow);

module.exports = router;
