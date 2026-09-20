const express = require('express');
const router = express.Router();
const trustStorageController = require('../controllers/trustStorage.controller');

router.get('/policy', trustStorageController.validatePolicy);
router.get('/bucket', trustStorageController.getR2Bucket);
router.post('/query', trustStorageController.executeD1Query);

module.exports = router;
