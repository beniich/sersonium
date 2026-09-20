const computeService = require('../services/compute.service');

exports.deployWorker = async (req, res) => {
    try {
        const tenantId = req.user ? req.user.tenantId : "default-tenant";
        const { code } = req.body;
        const data = await computeService.deployWorker(tenantId, code);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.manageKV = async (req, res) => {
    try {
        const tenantId = req.user ? req.user.tenantId : "default-tenant";
        const { key, value } = req.body;
        const data = await computeService.manageKV(tenantId, key, value);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.runAiAnalysis = async (req, res) => {
    try {
        const tenantId = req.user ? req.user.tenantId : "default-tenant";
        const { prompt } = req.body;
        const data = await computeService.runAiAnalysis(tenantId, prompt);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
