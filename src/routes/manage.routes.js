const express = require('express');
const router = express.Router();
const manageController = require('../controllers/manage.controller');

router.get('/billing', manageController.getBilling);
router.get('/audit', manageController.getAuditLog);
router.get('/gmail', manageController.getGmailOverview);

module.exports = router;
