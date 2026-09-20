const infraService = require('../services/infrastructure.service');

exports.getAssetHeatmap = async (req, res) => {
    try {
        const tenantId = req.user ? req.user.tenantId : "default-tenant";
        const data = await infraService.getAssetHeatmap(tenantId);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.createWorkOrder = async (req, res) => {
    try {
        const tenantId = req.user ? req.user.tenantId : "default-tenant";
        const data = await infraService.createWorkOrder(tenantId, req.body);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getPredictiveMaint = async (req, res) => {
    try {
        const tenantId = req.user ? req.user.tenantId : "default-tenant";
        const data = await infraService.getPredictiveMaint(tenantId);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
