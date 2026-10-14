import { Kafka, Producer, Consumer } from "kafkajs";

// ─── Dead Letter Queue (DLQ) — Buffer de résilience en cas de panne Kafka ────
interface DLQEntry {
  topic: string;
  message: any;
  key?: string;
  timestamp: number;
  retryCount: number;
}

const DLQ_MAX_SIZE = 5000; // Max messages en mémoire avant abandon
const dlqBuffer: DLQEntry[] = [];

function enqueueDLQ(topic: string, message: any, key?: string): void {
  if (dlqBuffer.length >= DLQ_MAX_SIZE) {
    // Evict oldest message pour éviter un memory leak
    dlqBuffer.shift();
    console.warn(`[Kafka DLQ] ⚠️ Buffer saturé (${DLQ_MAX_SIZE}). Suppression du message le plus ancien.`);
  }
  dlqBuffer.push({ topic, message, key, timestamp: Date.now(), retryCount: 0 });
  console.warn(`[Kafka DLQ] 📥 Message stocké en DLQ (topic: ${topic}). Buffer: ${dlqBuffer.length}/${DLQ_MAX_SIZE}`);
}

class KafkaService {
  private kafka: Kafka | null = null;
  private producer: Producer | null = null;
  private isConnected = false;

  constructor() {
    const brokersStr = process.env.KAFKA_BROKERS;
    if (!brokersStr) {
      console.warn("⚠️ KAFKA_BROKERS environment variable not set. Kafka integration will operate in MOCK mode.");
      return;
    }

    const brokers = brokersStr.split(",");
    const username = process.env.KAFKA_USERNAME;
    const password = process.env.KAFKA_PASSWORD;
    const clientId = process.env.KAFKA_CLIENT_ID || "sensorium-edge-backend";

    this.kafka = new Kafka({
      clientId,
      brokers,
      ssl: !!username,
      sasl: (username && password) ? {
        mechanism: "plain",
        username,
        password
      } : undefined
    });

    this.producer = this.kafka.producer();
  }

  async connect() {
    if (!this.producer) return;
    try {
      await this.producer.connect();
      this.isConnected = true;
      console.log("✅ Connecté au Cluster Kafka (Event Streaming Actif)");
      // Rejouer automatiquement le DLQ si des messages en attente
      if (dlqBuffer.length > 0) {
        console.log(`[Kafka DLQ] 🔄 Kafka reconnecté. Replay de ${dlqBuffer.length} messages en DLQ...`);
        this.flushDLQ().catch(e => console.error("[Kafka DLQ] Erreur lors du replay:", e));
      }
    } catch (error) {
      console.error("❌ Erreur de connexion Kafka:", error);
    }
  }

  async disconnect() {
    if (this.producer && this.isConnected) {
      await this.producer.disconnect();
      this.isConnected = false;
    }
  }

  /**
   * Rejoue tous les messages du Dead Letter Queue vers Kafka.
   * Appelé automatiquement à la reconnexion.
   */
  async flushDLQ(): Promise<{ replayed: number; failed: number }> {
    let replayed = 0;
    let failed = 0;
    const toFlush = dlqBuffer.splice(0, dlqBuffer.length);
    for (const entry of toFlush) {
      const ok = await this._sendToKafka(entry.topic, entry.message, entry.key);
      if (ok) {
        replayed++;
      } else {
        entry.retryCount++;
        if (entry.retryCount < 3) {
          dlqBuffer.unshift(entry); // Re-mise en file pour retry
        } else {
          console.error(`[Kafka DLQ] 🗑️ Message abandonné après ${entry.retryCount} tentatives (topic: ${entry.topic})`);
          failed++;
        }
      }
    }
    console.log(`[Kafka DLQ] ✅ Replay terminé: ${replayed} envoyés, ${failed} abandonnés.`);
    return { replayed, failed };
  }

  /** Expose l'état du DLQ pour le monitoring */
  getDLQStatus(): { buffered: number; maxSize: number; oldest?: number } {
    return {
      buffered: dlqBuffer.length,
      maxSize: DLQ_MAX_SIZE,
      oldest: dlqBuffer.length > 0 ? dlqBuffer[0].timestamp : undefined
    };
  }

  private async _sendToKafka(topic: string, message: any, key?: string): Promise<boolean> {
    if (!this.producer || !this.isConnected) return false;
    try {
      await this.producer.send({
        topic,
        messages: [{
          key: key || "default-key",
          value: JSON.stringify({ ...message, _timestamp: new Date().toISOString() })
        }]
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Publie un événement métier (ex: Télémétrie, Alerte Sécurité) sur un Topic Kafka.
   * En cas d'échec ou Kafka hors ligne, le message est mis en Dead Letter Queue pour replay.
   */
  async publishEvent(topic: string, message: any, key?: string) {
    if (!this.producer || !this.isConnected) {
      // Mock mode / Kafka non configuré → DLQ
      if (process.env.KAFKA_BROKERS) {
        enqueueDLQ(topic, message, key);
      } else {
        console.log(`[Mock Kafka] Message publié sur [${topic}]:`, JSON.stringify(message).substring(0, 100) + "...");
      }
      return false;
    }

    const sent = await this._sendToKafka(topic, message, key);
    if (!sent) {
      console.error(`❌ Erreur lors de la publication sur le topic ${topic}. Mise en DLQ.`);
      enqueueDLQ(topic, message, key);
    }
    return sent;
  }

  /**
   * Envoie une donnée de télémétrie dans le bus
   * @param tenantId ID du client propriétaire du capteur
   * @param payload Données du capteur { sensorId, value, unit, type }
   */
  async emitTelemetry(tenantId: string, payload: any) {
    return this.publishEvent('iot-telemetry', {
      ...payload,
      tenantId,
      timestamp: new Date().toISOString(),
    }, tenantId); // On utilise le tenantId comme clé pour garantir l'ordre
  }

  /**
   * Crée un consommateur pour traiter les données en arrière-plan
   * @param groupId Identifiant du groupe de consommateurs (ex: 'ai-engine', 'carbon-calc')
   * @param processCallback Fonction à exécuter pour chaque message reçu
   */
  async createConsumer(groupId: string, processCallback: (data: any) => Promise<void>) {
    if (!this.kafka) {
      console.warn(`[Mock Kafka] Consommateur '${groupId}' démarré (Aucun événement ne sera reçu).`);
      return;
    }

    const consumer = this.kafka.consumer({ groupId });

    try {
      await consumer.connect();
      await consumer.subscribe({ topic: 'iot-telemetry', fromBeginning: false });

      await consumer.run({
        eachMessage: async ({ message }) => {
          if (!message.value) return;
          const data = JSON.parse(message.value.toString());
          await processCallback(data);
        },
      });

      console.log(`🚀 Consumer Group [${groupId}] is listening to iot-telemetry...`);
    } catch (error) {
      console.error(`❌ Erreur de création du consumer ${groupId}:`, error);
    }
  }
}

export const kafkaService = new KafkaService();
