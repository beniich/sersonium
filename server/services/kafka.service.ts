import { Kafka, Producer, Consumer } from "kafkajs";

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
    const clientId = process.env.KAFKA_CLIENT_ID || "jeton-edge-backend";

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
   * Publie un événement métier (ex: Télémétrie, Alerte Sécurité) sur un Topic Kafka.
   * Si Kafka n'est pas configuré (sandbox), le message est ignoré gracieusement.
   */
  async publishEvent(topic: string, message: any, key?: string) {
    if (!this.producer || !this.isConnected) {
      // Mock mode logging for development
      console.log(`[Mock Kafka] Message publié sur [${topic}]:`, JSON.stringify(message).substring(0, 100) + "...");
      return false;
    }

    try {
      await this.producer.send({
        topic,
        messages: [
          {
            key: key || "default-key",
            value: JSON.stringify({
              ...message,
              _timestamp: new Date().toISOString()
            })
          }
        ]
      });
      return true;
    } catch (error) {
      console.error(`❌ Erreur lors de la publication sur le topic ${topic}:`, error);
      return false;
    }
  }
}

export const kafkaService = new KafkaService();
