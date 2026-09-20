const prisma = require('../config/database');

class TrafficService {
    // --- Global Traffic ---
    async getPerformance(tenantId) {
        return prisma.trafficLog.aggregate({
            where: { tenantId },
            _avg: { latency: true, responseTime: true }
        });
    }
    async getErrorAnalysis(tenantId) {
        return prisma.trafficLog.groupBy({
            by: ['statusCode'],
            where: { tenantId, statusCode: { gte: 400 } },
            _count: true
        });
    }
    async getBandwidthUsage(tenantId) {
        return prisma.bandwidthLog.aggregate({
            where: { tenantId },
            _sum: { bytesIn: true, bytesOut: true }
        });
    }

    // --- Telemetry (Kafka) ---
    async getKafkaFlow(tenantId) {
        return prisma.kafkaMetric.findMany({ where: { tenantId }, orderBy: { timestamp: 'desc' }, take: 100 });
    }
    async getPartitionStatus(tenantId) {
        return prisma.kafkaPartition.findMany({ where: { tenantId } });
    }
    async getThroughput(tenantId) {
        return prisma.kafkaMetric.aggregate({
            where: { tenantId },
            _avg: { messagesPerSecond: true }
        });
    }
}
module.exports = new TrafficService();
