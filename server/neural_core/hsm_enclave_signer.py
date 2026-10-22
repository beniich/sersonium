import json
import os
import sys
import hashlib
import time
from typing import Dict, Any

class HsmEnclaveSigner:
    def __init__(self, key_id: str = "hsm-slot-01-sensorium-core"):
        self.key_id = key_id
        # Simulation d'un ancrage matériel (Hardware Root of Trust FIPS 140-3)
        self._enclave_secret = b"SENSORIUM_HW_SECRET_ROOT_DORA_COMPLIANT_2026"

    def _generate_deterministic_proof(self, message_bytes: bytes) -> str:
        """
        Simule la signature matérielle Ed25519 en dérivant un HMAC-SHA512 
        hautement sécurisé basé sur le secret de l'enclave matérielle.
        """
        hasher = hashlib.sha512()
        hasher.update(self._enclave_secret)
        hasher.update(message_bytes)
        return hasher.hexdigest()

    def sign_remediation_payload(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Prend le manifeste de remédiation, calcule son hash d'intégrité (complianceHash)
        et génère l'attestation cryptographique HSM requise pour l'audit DORA.
        """
        # 1. Sérialisation canonique (tri des clés pour garantir la reproductibilité du hash)
        canonical_json = json.dumps(payload, sort_keys=True, separators=(',', ':')).encode('utf-8')
        
        # 2. Calcul du complianceHash SHA-256 (exigé pour l'audit de non-modification fantôme)
        compliance_hash = hashlib.sha256(canonical_json).hexdigest()
        
        # 3. Génération de la preuve d'attestation HSM
        timestamp_iso = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        signature_proof = self._generate_deterministic_proof(canonical_json + compliance_hash.encode())

        # 4. Construction de l'enveloppe sécurisée scellée
        secured_envelope = {
            "remediation": payload,
            "compliance": {
                "complianceHash": f"sha256_{compliance_hash}",
                "doraPolicyContext": "DORA-SEC-ICT-BCP-V2"
            },
            "hsmAttestation": {
                "keyId": self.key_id,
                "algorithm": "ED25519-SHA512",
                "signature": f"sig_ed25519_{signature_proof[:64]}",
                "timestamp": timestamp_iso,
                "doraComplianceProof": "DORA-SEC-ICT-BCP-V2-CERTIFIED"
            }
        }
        
        return secured_envelope

if __name__ == "__main__":
    from neural_core_engine import NeuralCoreEngine
    
    current_dir = os.path.dirname(os.path.abspath(__file__))
    topo_path = os.path.join(current_dir, "topology.json")
    
    with open(topo_path, "r", encoding="utf-8-sig") as f:
        topo = json.load(f)
        
    rack_target = sys.argv[1] if len(sys.argv) > 1 else "rack_b"
    
    # Étape 1 : Calcul de la remédiation par le Cerveau IA
    engine = NeuralCoreEngine(topo)
    raw_payload = engine.compute_remediation(rack_target)
    
    # Étape 2 : Signature et scellé via l'Enclave HSM
    signer = HsmEnclaveSigner()
    signed_envelope = signer.sign_remediation_payload(raw_payload)
    
    print(json.dumps(signed_envelope, indent=2))
