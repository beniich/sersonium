import json
import logging
import sys
import time
from datetime import datetime, timezone
from typing import Dict, Any

logging.basicConfig(level=logging.INFO, format="[%(asctime)s] [%(levelname)s] %(message)s")

class SensoriumDaqBridge:
    def __init__(self, mqtt_broker: str, kafka_broker: str, target_topic: str):
        self.mqtt_broker = mqtt_broker
        self.kafka_broker = kafka_broker
        self.target_topic = target_topic
        logging.info(f"Initialisation du pont DAQ SENSORIUM.")
        logging.info(f"Source MQTT : {mqtt_broker} | Destination Kafka : {kafka_broker} -> Topic: {target_topic}")

    def transform_industrial_payload(self, mqtt_topic: str, raw_payload: bytes) -> Dict[str, Any]:
        """
        Couche d'Ingestion & Normalisation :
        Convertit le format compact binaire ou texte industriel vers le schéma JSON strict SENSORIUM.
        """
        try:
            # Exemple de payload industriel brut MQTT : "23.4;celcius;PT100" ou JSON direct
            data_str = raw_payload.decode("utf-8")
            
            # Extraction des segments du topic (ex: "sensors/dc-01/rack_b/temperature")
            topic_parts = mqtt_topic.split("/")
            rack_id = topic_parts[2] if len(topic_parts) > 2 else "unknown_rack"
            
            # Parsing de la valeur analogique lue par l'Edge
            value = float(data_str.split(";")[0]) if ";" in data_str else float(data_str)
            
            now_iso = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
            
            # Structuration finale conforme au schéma attendu par go_gateways et le Neural Core
            normalized_payload = {
                "timestamp": now_iso,
                "rack_id": rack_id,
                "temperature": round(value, 2),
                "metric_name": "rack_temperature_celsius"
            }
            return normalized_payload
        except Exception as e:
            logging.error(f"Échec de normalisation du payload industriel : {e}")
            return {}

    def forward_to_sensorium(self, normalized_data: Dict[str, Any]):
        """
        Couche Transport : Transmet la donnée normalisée sur le bus souverain.
        """
        if not normalized_data:
            return
            
        json_message = json.dumps(normalized_data)
        # Simulation de l'appel du producteur Kafka sécurisé (mTLS configuré au niveau de l'infra)
        logging.info(f"[FORWARD KAFKA] Packet injecté dans {self.target_topic} -> {json_message}")

    def simulate_live_bridge_run(self):
        """
        Simule l'écoute d'un événement physique (Rupture thermique progressive sur le Rack B)
        """
        logging.info("[BRIDGE] Connexion au réseau industriel établie. Écoute active...")
        
        # Simulation d'une dérive de température réelle lue sur une sonde PT100
        mock_industrial_events = [
            ("sensors/dc-01/rack_b/temperature", b"85.2;celsius;PT100"),
            ("sensors/dc-01/rack_b/temperature", b"89.7;celsius;PT100"),
            ("sensors/dc-01/rack_b/temperature", b"92.4;celsius;PT100") # Point de bascule alerte critique
        ]
        
        for topic, raw_bytes in mock_industrial_events:
            time.sleep(1.0)
            logging.info(f"[MQTT RECEIVE] Topic '{topic}' -> Données physiques : {raw_bytes.decode()}")
            
            # Traitement de la chaîne
            normalized = self.transform_industrial_payload(topic, raw_bytes)
            self.forward_to_sensorium(normalized)

if __name__ == "__main__":
    # Paramètres d'usine correspondants à notre manifeste Docker Compose
    bridge = SensoriumDaqBridge(
        mqtt_broker="localhost:1883",
        kafka_broker="localhost:9092",
        target_topic="telemetry.rackB.thermal"
    )
    bridge.simulate_live_bridge_run()
