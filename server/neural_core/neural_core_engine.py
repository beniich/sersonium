import json
import math
import os
import sys
from typing import Dict, Any, Tuple

class NeuralCoreEngine:
    def __init__(self, topology_data: Dict[str, Any]):
        self.topology = topology_data["racks"]
        
    def simulate_blast_radius(self, source: str, target: str, load_to_transfer: float) -> Tuple[float, float, str]:
        """
        Simule l'impact thermique du transfert de charge sur le rack cible.
        Formule : Delta Temp = (Charge Transférée / Marge CPU Restante) * Coefficient de dissipation
        """
        tgt = self.topology[target]
        available_cpu = tgt["maxCapacityCpu"] - tgt["currentLoadCpu"]
        
        if available_cpu <= 0:
            return 999.0, 0.0, "REJECTED_OVERLOAD"
            
        # Modélisation prédictive de la hausse thermique
        thermal_coefficient = 1.5 / tgt["thermalDissipationFactor"]
        delta_temp = (load_to_transfer / available_cpu) * thermal_coefficient
        predicted_temp = tgt["currentTemperature"] + delta_temp
        
        # Marge de sécurité résiduelle
        margin = tgt["maxThermalLimit"] - predicted_temp
        
        status = "APPROVED" if predicted_temp < tgt["maxThermalLimit"] else "REJECTED_THERMAL_CRITICAL"
        return predicted_temp, margin, status

    def compute_remediation(self, critical_rack: str) -> Dict[str, Any]:
        source_rack = self.topology[critical_rack]
        current_temp = source_rack["currentTemperature"]
        threshold = source_rack["maxThermalLimit"]
        
        # Déterminer la charge excédentaire à délester (proportionnelle au dépassement de température)
        temp_overshoot = current_temp - threshold
        load_reduction_pct = min(40.0, math.ceil(temp_overshoot * 15)) # Ex: 2.4°C * 15 = 36% -> 40% max
        
        best_target = None
        best_margin = -999.0
        best_predicted_temp = 0.0
        
        # Parcours des racks adjacents pour trouver la cible optimale
        for adjacent in source_rack["adjacentRacks"]:
            pred_temp, margin, status = self.simulate_blast_radius(critical_rack, adjacent, load_reduction_pct)
            if status == "APPROVED" and margin > best_margin:
                best_margin = margin
                best_target = adjacent
                best_predicted_temp = pred_temp
                
        # Calcul du score de confiance DORA
        confidence_score = 100 - int(temp_overshoot * 2) - (10 - int(best_margin))
        confidence_score = max(50, min(98, confidence_score))
        
        if not best_target:
            return {"status": "FAILSAFE_THROTTLING_REQUIRED", "confidenceScore": 50}

        # Génération des nouveaux poids Anycast du Mesh
        new_weight_original = int(source_rack["anycastWeight"] - load_reduction_pct)
        new_weight_alternate = int(load_reduction_pct)

        return {
            "status": "SUCCESS",
            "eventId": f"evt_sh_{critical_rack}_thermal_remediation",
            "sourceStream": f"telemetry.{critical_rack}.thermal",
            "severity": "CRITICAL",
            "currentTemp": current_temp,
            "thresholdTemp": threshold,
            "targetComponent": f"{critical_rack}_load_balancer",
            "proposedRedirectPercent": int(load_reduction_pct),
            "alternateTarget": best_target,
            "alternateAvailableCapacity": int(self.topology[best_target]["maxCapacityCpu"] - self.topology[best_target]["currentLoadCpu"]),
            "alternateThermalMargin": round(best_margin, 2),
            "confidenceScore": confidence_score,
            "originalWeight": source_rack["anycastWeight"],
            "newWeightOriginal": new_weight_original,
            "newWeightAlternate": new_weight_alternate
        }

if __name__ == "__main__":
    topo_path = os.path.join(os.path.dirname(__file__), "topology.json")
    with open(topo_path, "r", encoding="utf-8-sig") as f:
        topo = json.load(f)
        
    engine = NeuralCoreEngine(topo)
    target = sys.argv[1] if len(sys.argv) > 1 else "rack_b"
    remediation_payload = engine.compute_remediation(target)
    print(json.dumps(remediation_payload, indent=2))
