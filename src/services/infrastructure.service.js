const prisma = require('../config/database');

class InfrastructureService {
    async getAssetHeatmap(tenantId) {
        return prisma.hardwareAsset.findMany({ where: { tenantId }, include: { telemetry: true } });
    }
    async createWorkOrder(tenantId, orderData) {
        return prisma.workOrder.create({ data: { ...orderData, tenantId } });
    }
    async getPredictiveMaint(tenantId) {
        const assets = await prisma.hardwareAsset.findMany({ where: { tenantId } });
        return assets.map(asset => ({
            assetId: asset.id,
            risk: asset.lastTemperature > 40 ? 'High' : 'Low',
            prediction: "Check cooling system"
        }));
    }
    async manageDatacenterOps(tenantId, opsData) {
        return prisma.dcOperation.create({ data: { ...opsData, tenantId } });
    }
}
module.exports = new InfrastructureService();
