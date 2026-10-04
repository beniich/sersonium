import { kafkaService } from '../services/kafka.service.js';
import { rawPrisma } from '../db/prisma.js';

export const startTelemetryWorker = async () => {
  await kafkaService.connect();

  // Ce worker s'occupe de la surveillance des seuils critiques
  await kafkaService.createConsumer('alert-engine', async (data) => {
    console.log(`Processing telemetry for Tenant ${data.tenantId}: Sensor ${data.sensorId} = ${data.value}`);

    // Exemple : Si température > 50°C, on crée une alerte en DB (audit log)
    if (data.type === 'temperature' && data.value > 50) {
      console.warn(`⚠️ CRITICAL TEMP detected for ${data.tenantId}!`);
      
      await rawPrisma.auditLog.create({
        data: {
          tenantId: data.tenantId,
          userId: null,
          action: 'CRITICAL_ALERT',
          resource: 'Sensor',
          resourceId: data.sensorId,
          newValue: JSON.stringify({ value: data.value, threshold: 50 }),
          userAgent: 'SYSTEM_KAFKA'
        }
      });
    }
  });
};
