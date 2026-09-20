const prisma = require('../config/database');

class EdgeSecurityService {
    // --- Edge Network ---
    async manageDns(tenantId, data) { 
        return prisma.dnsRecord.upsert({ where: { id: data.id }, update: data, create: { ...data, tenantId } }); 
    }
    async setRoutingRule(tenantId, rule) { 
        return prisma.routingRule.create({ data: { ...rule, tenantId } }); 
    }
    async updateCaching(tenantId, config) { 
        return prisma.cacheConfig.updateMany({ where: { tenantId }, data: config }); 
    }

    // --- Security (WAF, Bot, DDoS) ---
    async getWafEvents(tenantId) { 
        return prisma.wafEvent.findMany({ where: { tenantId }, orderBy: { timestamp: 'desc' } }); 
    }
    async updateFirewall(tenantId, rule) { 
        return prisma.firewallRule.create({ data: { ...rule, tenantId } }); 
    }
    async setRateLimit(tenantId, limit) { 
        return prisma.rateLimitConfig.upsert({ where: { tenantId }, update: limit, create: { ...limit, tenantId } }); 
    }
}
module.exports = new EdgeSecurityService();
