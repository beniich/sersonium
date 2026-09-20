const prisma = require('../config/database');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "mock-key");

class ComputeService {
    async deployWorker(tenantId, code) {
        return prisma.worker.create({ data: { tenantId, code, status: 'deployed' } });
    }
    async manageKV(tenantId, key, value) {
        return prisma.kvStorage.upsert({ where: { key_tenantId: { key, tenantId } }, update: { value }, create: { key, value, tenantId } });
    }
    async runAiAnalysis(tenantId, prompt) {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(prompt);
        // Facturation automatique
        await prisma.user.update({ where: { tenantId }, data: { tokens: { decrement: 10 } } });
        return result.response.text();
    }
    async manageQueues(tenantId, queueData) {
        return prisma.queue.create({ data: { ...queueData, tenantId } });
    }
}
module.exports = new ComputeService();
