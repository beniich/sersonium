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
