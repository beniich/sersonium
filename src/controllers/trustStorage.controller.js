const trustStorageService = require('../services/trustStorage.service');

exports.validatePolicy = async (req, res) => {
    try {
        const tenantId = req.user ? req.user.tenantId : "default-tenant";
        const { userId, resource } = req.query;
        const data = await trustStorageService.validatePolicy(tenantId, userId, resource);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getR2Bucket = async (req, res) => {
    try {
        const tenantId = req.user ? req.user.tenantId : "default-tenant";
        const { bucketName } = req.query;
        const data = await trustStorageService.getR2Bucket(tenantId, bucketName);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.executeD1Query = async (req, res) => {
    try {
        const tenantId = req.user ? req.user.tenantId : "default-tenant";
        const { sql } = req.body;
        const data = await trustStorageService.executeD1Query(tenantId, sql);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
