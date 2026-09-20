const prisma = require('../config/database');

class ManageWorkspaceService {
    // --- Manage ---
    async getBilling(tenantId) {
        return prisma.invoice.findMany({ where: { tenantId } });
    }
    async getAuditLog(tenantId) {
        return prisma.auditLog.findMany({ where: { tenantId }, orderBy: { timestamp: 'desc' } });
    }
    async manageApiTokens(tenantId, tokenData) {
        return prisma.apiToken.create({ data: { ...tokenData, tenantId } });
    }

    // --- Google Workspace ---
    async getGmailOverview(tenantId, accessToken) {
        // Appel API Google
        return { emails: [], unread: 0 };
    }
    async syncCalendar(tenantId, accessToken) {
        return { events: [], status: "synced" };
    }
    async startMeet(tenantId, accessToken) {
        return { meetLink: "https://meet.google.com/abc-defg-hij" };
    }
}
module.exports = new ManageWorkspaceService();
