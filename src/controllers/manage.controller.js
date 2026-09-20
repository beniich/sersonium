const manageService = require('../services/manage.service');

exports.getBilling = async (req, res) => {
    try {
        const tenantId = req.user ? req.user.tenantId : "default-tenant";
        const data = await manageService.getBilling(tenantId);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getAuditLog = async (req, res) => {
    try {
        const tenantId = req.user ? req.user.tenantId : "default-tenant";
        const data = await manageService.getAuditLog(tenantId);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getGmailOverview = async (req, res) => {
    try {
        const tenantId = req.user ? req.user.tenantId : "default-tenant";
        const accessToken = req.headers.authorization ? req.headers.authorization.split(' ')[1] : "";
        const data = await manageService.getGmailOverview(tenantId, accessToken);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
