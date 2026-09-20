const trafficService = require('../services/traffic.service');

exports.getPerf = async (req, res) => {
    try {
        const tenantId = req.user ? req.user.tenantId : "default-tenant";
        const data = await trafficService.getPerformance(tenantId);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getErrorAnalysis = async (req, res) => {
    try {
        const tenantId = req.user ? req.user.tenantId : "default-tenant";
        const data = await trafficService.getErrorAnalysis(tenantId);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getBandwidthUsage = async (req, res) => {
    try {
        const tenantId = req.user ? req.user.tenantId : "default-tenant";
        const data = await trafficService.getBandwidthUsage(tenantId);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getKafkaFlow = async (req, res) => {
    try {
        const tenantId = req.user ? req.user.tenantId : "default-tenant";
        const data = await trafficService.getKafkaFlow(tenantId);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
