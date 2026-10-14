import { rawPrisma } from "../db/prisma.js";
import { kafkaService } from "./kafka.service.js";
import { SseService } from "./sse.service.js";

export interface CreateOutboxEventParams {
  topic: string;
  payload: any;
  key?: string;
}

export class OutboxService {
  private static isWorkerRunning = false;
  private static workerInterval: NodeJS.Timeout | null = null;

  /**
   * Enregistre un événement dans la table Outbox au sein d'une transaction Prisma.
   * Garantit la persistance atomique de l'événement avec la mutation métier.
   */
  static async queueEvent(
    prismaClient: any,
    params: CreateOutboxEventParams
  ): Promise<any> {
    const payloadStr = typeof params.payload === "string" ? params.payload : JSON.stringify(params.payload);

    return (prismaClient.outboxEvent || rawPrisma.outboxEvent).create({
      data: {
        topic: params.topic,
        payload: payloadStr,
        key: params.key || null,
        status: "PENDING",
        retryCount: 0,
        maxRetries: 5
      }
    });
  }

  /**
   * Traite les événements en attente (Polling Worker avec backoff et verrouillage d'état).
   * Tolère les pannes temporaires de Kafka sans perdre d'événements.
   */
  static async processPendingEvents(batchSize: number = 50): Promise<{ processed: number; failed: number }> {
    let processed = 0;
    let failed = 0;

    try {
      // 1. Récupération des événements PENDING ordonnés par ancienneté
      const pendingEvents = await rawPrisma.outboxEvent.findMany({
        where: {
          status: "PENDING"
        },
        orderBy: { createdAt: "asc" },
        take: batchSize
      });

      if (pendingEvents.length === 0) {
        return { processed: 0, failed: 0 };
      }

      for (const event of pendingEvents) {
        // 2. Marquer l'événement comme PROCESSING
        await rawPrisma.outboxEvent.update({
          where: { id: event.id },
          data: { status: "PROCESSING" }
        });

        try {
          const parsedPayload = JSON.parse(event.payload);

          // 3. Publication vers Kafka
          const published = await kafkaService.produce(event.topic, parsedPayload, event.key || undefined);

          if (published) {
            // 4. Marquer comme PUBLISHED
            await rawPrisma.outboxEvent.update({
              where: { id: event.id },
              data: {
                status: "PUBLISHED",
                processedAt: new Date()
              }
            });
            processed++;

            // 5. Notification SSE en direct si un tenantId est présent dans le payload
            if (parsedPayload?.tenantId) {
              SseService.broadcastToTenant(parsedPayload.tenantId, "OUTBOX_DELIVERY_CONFIRMED", {
                topic: event.topic,
                eventId: event.id,
                payload: parsedPayload,
                timestamp: new Date().toISOString()
              });
            }
          } else {
            throw new Error("Kafka producer failed to acknowledge message delivery");
          }
        } catch (error: any) {
          failed++;
          const newRetryCount = event.retryCount + 1;
          const isDead = newRetryCount >= event.maxRetries;

          await rawPrisma.outboxEvent.update({
            where: { id: event.id },
            data: {
              status: isDead ? "FAILED" : "PENDING",
              retryCount: newRetryCount,
              lastError: error?.message || String(error)
            }
          });

          if (isDead) {
            console.error(`[Outbox Worker] 🚨 Événement #${event.id} basculé en FAILED après ${newRetryCount} tentatives.`);
          }
        }
      }
    } catch (err: any) {
      console.error("[Outbox Worker] ❌ Erreur globale lors du traitement du lot outbox:", err?.message || err);
    }

    return { processed, failed };
  }

  /**
   * Démarre le worker périodique de publication outbox (polling toutes les 5s)
   */
  static startWorker(intervalMs: number = 5000): void {
    if (this.isWorkerRunning) return;
    this.isWorkerRunning = true;

    this.workerInterval = setInterval(async () => {
      try {
        await this.processPendingEvents(25);
      } catch (err) {
        console.error("[Outbox Worker Interval Error]:", err);
      }
    }, intervalMs);

    console.log(`[Outbox Service] 🚀 Worker de publication démarré (cycle de ${intervalMs}ms).`);
  }

  /**
   * Arrête proprement le worker de publication
   */
  static stopWorker(): void {
    if (this.workerInterval) {
      clearInterval(this.workerInterval);
      this.workerInterval = null;
    }
    this.isWorkerRunning = false;
    console.log("[Outbox Service] 🛑 Worker de publication arrêté.");
  }
}
