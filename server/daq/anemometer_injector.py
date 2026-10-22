import json
import time
import random
import logging
from datetime import datetime, timezone

logging.basicConfig(level=logging.INFO, format="[%(asctime)s] [ANEMOMETER-DAQ] %(message)s")

class AnemometerMetricsInjector:
    def __init__(self, target_rack: str = "rack_b", normal_cfm: float = 350.0):
        self.target_rack = target_rack
        self.normal_cfm = normal_cfm
        logging.info(f"Injecteur aéraulique activé pour le {target_rack.upper()}")

    def capture_airflow_metrics(self) -> dict:
        """
        Simule la capture numérique issue d'un anémomètre thermique industriel.
        En cas de surchauffe imminente, le flux d'air s'effondre (panne de ventilateur).
        """
        # Simulation d'une dégradation critique du flux d'air
        degraded_cfm = self.normal_cfm * 0.35  # Chute à 35% de la capacité nominale (~122.5 CFM)
        now_iso = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
        
        return {
            "timestamp": now_iso,
            "rack_id": self.target_rack,
            "metric_name": "rack_airflow_cfm",
            "value": round(degraded_cfm, 2),
            "unit": "CFM",
            "status": "CRITICAL_FLOW_LOW"
        }

    def run_injection_loop(self, iterations: int = 3):
        """Exécute des cycles d'injection rapides sur le réseau interne SENSORIUM."""
        for i in range(iterations):
            time.sleep(1)
            metric_payload = self.capture_airflow_metrics()
            logging.info(f"[INPUT FLOW] {metric_payload['rack_id'].upper()} : {metric_payload['value']} {metric_payload['unit']} | Statut: {metric_payload['status']}")
            # En production, ce bloc appelle SecureKafkaProducer pour pousser dans le topic : telemetry.rackB.airflow

if __name__ == "__main__":
    injector = AnemometerMetricsInjector(target_rack="rack_b")
    injector.run_injection_loop()
