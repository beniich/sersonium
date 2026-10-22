# SENSORIUM SOVEREIGN CLOUD — INCIDENT RESPONSE & SELF-HEALING RUNBOOK
## Document Référence : DORA-SEC-ICT-BCP-V2 (Règlement UE 2022/2554)
**Classification :** Confidentiel Défense / Opérations Résilientes  
**Autorités de Contrôle Référentes :** ACPR, EBA, EIOPA, ANSSI  
**Système Cible :** Cockpit d''Hypervision SENSORIUM & Neural Core Anycast Mesh  
**Date d''Homologation :** Octobre 2026 | **Version :** 2.4.0-SENTRY  

---

## 1. Contexte Réglementaire & Champ d'Application

Le présent **Runbook Opérationnel d'Intervention d'Urgence (ICT Incident Response Runbook)** formalise les protocoles d'intervention, d'auto-remédiation et de gouvernance de la plateforme **SENSORIUM** conformément aux exigences impératives du **Règlement (UE) 2022/2554 (DORA - Digital Operational Resilience Act)** :

| Article DORA | Intitulé Réglementaire | Implémentation Technique SENSORIUM |
| :--- | :--- | :--- |
| **Article 9** | Protection & Prévention des Systèmes TIC | Sérialisation canonique RFC 8785, empreinte immuable `complianceHash` (SHA-256) |
| **Article 11 §1-3** | Détection des Activités Anormales | Pont DAQ MQTT/Kafka (`daq_mqtt_kafka_bridge.py`) & Anémomètre CFM (`anemometer_injector.py`) |
| **Article 11 §4** | Évitement des Effets Secondaires & Cascades | Moteur prédictif de rayon d'impact thermique *Blast Radius* (`neural_core_engine.py`) |
| **Article 11 §5** | Procédures de Restauration & Rollback | Chien de garde à état de 300 secondes (`RollbackWatchdogStatus.tsx` / `action_layer_deployer.go`) |
| **Article 12** | Chiffrement & Canaux de Transmission Sécurisés | Chiffrement mTLS mutuel (`secure_kafka_producer.py`), attestation matérielle HSM (`hsm_enclave_signer.py`) |
| **Article 17-19** | Classification & Notification des Incidents Majeurs | Registre immuable (`sensorium_dora_compliance_vault`) et journalisation d'audit automatique |

---

## 2. Matrice de Gravité & Seuils de Déclenchement

Conformément à l'Article 18 de DORA, les incidents opérationnels et de sécurité TIC sont catégorisés selon l'impact sur la disponibilité des services critiques et l'intégrité thermique :

| Niveau de Gravité | Métrique Déclenchante | Débit Aéraulique | Impact Opérationnel | Délai de Réaction Requis |
| :--- | :--- | :--- | :--- | :--- |
| **MINEUR (Télémétrie)** | Température < 80.0°C | 350 CFM (Nominal) | Aucun, fonctionnement nominal | Surveillance périodique (10s) |
| **SIGNIFICATIF (Alerte)** | 80.0°C ≤ Temp < 90.0°C | 250 - 350 CFM | Réduction de marge thermique, début d'engorgement | Préparation du scénario Anycast |
| **CRITIQUE (Incident Majeur)** | **Température ≥ 90.0°C** | **< 150 CFM (`CRITICAL_FLOW_LOW`)** | **Risque de rupture matérielle / Black-out serveur** | **< 10 secondes (Auto-Guérison)** |

---

## 3. Topologie de Sécurité & Réseau Isolé (Zero-Trust)

Le périmètre d'exécution est sanctuarisé dans une zone réseau étanche (`sensorium_isolated_mesh`, sous-réseau `10.26.0.0/16`) :

```
[ Capteurs PT100 / CFM ] ──(mTLS)──> [ Courtier Kafka 29092 ]
                                              │
                      ┌───────────────────────┴───────────────────────┐
                      ▼                                               ▼
          [ python_neural_core ]                            [ go_gateways ]
        - Inférence Blast Radius                         - Port public 8080 (IDE)
        - Signataire Enclave HSM (FIPS 140-3)            - Interface wg-anycast-mesh0
        - topology.json (:ro immuable)                   - RollbackWatchdog (300s)
```

> [!IMPORTANT]
> **Règle Zero-Trust d'Enclave :** Le conteneur `python_neural_core` et le broker `kafka` ne publient aucun port vers l'extérieur. Tout accès non authentifié par certificat d'enclave matérielle est rejeté au niveau noyau.

---

## 4. Procédure Opérationnelle en 6 Étapes

### Étape 1 : Détection & Alerte Physique (t = 0s à 30s)
1. La sonde anémomètre thermique détecte une perte critique de ventilation sur le Rack B (< 130 CFM).
2. La sonde PT100 enregistre la montée thermique : $75^\circ\text{C} \rightarrow 85^\circ\text{C} \rightarrow 92.4^\circ\text{C}$ (seuil 90°C franchi).
3. Le pont DAQ (`daq_mqtt_kafka_bridge.py`) encapsule la trame et l'injecte dans le topic Kafka chiffré `telemetry.rackB.thermal`.

### Étape 2 : Inférence Prédictive & Calcul de Blast Radius (t = 35s)
1. Le composant `neural_core_engine.py` est invoqué dans l'enclave sécurisée.
2. Il simule l'impact thermique sur les racks adjacents :
   $$\Delta T = \left(\frac{\text{Charge Transférée}}{\text{Marge CPU}}\right) \times \left(\frac{1.5}{\text{Dissipation}}\right)$$
3. **Résultat :** Le Rack A est sélectionné (capacité résiduelle CPU : 45%). La hausse thermique calculée est de seulement +1.2°C, laissant une marge de sécurité de **+18.05°C**.
4. L'algorithme attribue un indice de confiance DORA de **98%**.

### Étape 3 : Scellé Cryptographique par l'Enclave HSM (t = 36s)
1. Le manifeste YAML est sérialisé de manière canonique (RFC 8785).
2. L'empreinte d'intégrité `complianceHash` (SHA-256) est calculée pour prévenir toute modification fantôme.
3. Le module `hsm_enclave_signer.py` génère l'attestation `sig_ed25519_...` avec la mention `DORA-SEC-ICT-BCP-V2-CERTIFIED`.

### Étape 4 : Validation Opérateur Human-in-the-Loop (t = 37s)
1. Le Cockpit SENSORIUM affiche instantanément le panneau `SelfHealingModal.tsx`.
2. L'opérateur visualise le Pre-Flight Check et le différentiel YAML :
   ```diff
   - weight: 100 -> target: rack_b
   + weight: 63  -> target: rack_b
   + weight: 37  -> target: rack_a
   ```
3. **Commandes d'Action Opérateur :**
   * **`[CTRL+ENTER]` ou `[CMD+ENTER]`** $\rightarrow$ Approbation et déploiement immédiat.
   * **`[ESC]`** $\rightarrow$ Rejet de la remédiation et maintien sous supervision manuelle.

### Étape 5 : Exécution Réseau & RollbackWatchdog (t = 38s à 338s)
1. L'Action Layer (`action_layer_deployer.go`) valide la signature HSM.
2. La consigne de routage Anycast est appliquée sur l'interface WireGuard sans coupure de trafic.
3. Le minuteur **RollbackWatchdog** de 300 secondes s'enclenche dans le bandeau supérieur de l'IDE :
   * **Convergence Nominal :** La température du Rack B descend sous 85°C (stabilisation observée à 76.5°C). Clôture avec succès et signature du registre DORA immuable.
   * **Non-Convergence (Échec) :** Si $T \ge 90^\circ\text{C}$ ou en cas d'alerte en cascade, le Watchdog restaure automatiquement l'ancien routage et isole le Rack B.

### Étape 6 : Clôture & Archivage Immuable
L'événement complet est consigné dans le volume sécurisé `/var/log/sensorium/audit/` sous format auditable :
* `eventId` : `evt_sh_rack_b_thermal_remediation`
* `complianceHash` : `sha256_bc90a6b61e8141aabed3a296fd0a3ddce53d303ebdb32f6569bdf25d5677de84`
* `operatorKey` : Authentification de session certifiée HSM
* `rtoActual` : **0.82 seconde** (largement sous le RTO contractuel de 120 secondes).

---

## 5. Fiche Standard de Notification DORA (Article 19)

Ce formulaire pré-rempli est généré automatiquement par SENSORIUM pour transmission aux autorités de surveillance (ACPR / BCE) dans les délais réglementaires (Notification initiale sous 4 heures) :

```json
{
  "doraReportingStandard": "RTS-EU-2024-INCIDENT-REPORTING",
  "incidentClassification": "MAJOR_ICT_INCIDENT",
  "affectedEntity": "SENSORIUM Sovereign Hypervision Platform",
  "incidentId": "evt_sh_rack_b_thermal_remediation",
  "initialDetectionTimestamp": "2026-10-22T09:20:25Z",
  "mitigationAppliedTimestamp": "2026-10-22T09:20:26Z",
  "totalServiceDowntimeSeconds": 0,
  "dataLossRecorded": false,
  "financialImpactEstimatedEur": 0.00,
  "rootCauseAnalysis": "Défaillance d'alimentation du groupe moto-ventilateur CU-04 ayant provoqué une chute aéraulique à 122.5 CFM et un pic thermique à 92.4°C sur le Rack B.",
  "mitigationStrategy": "Redirection Anycast automatisée de 37% de la charge vers le Rack A via le Neural Core et l'Action Layer.",
  "cryptographicIntegrityProof": {
    "hsmKeyId": "hsm-slot-01-sensorium-core",
    "algorithm": "ED25519-SHA512",
    "complianceHash": "sha256_bc90a6b61e8141aabed3a296fd0a3ddce53d303ebdb32f6569bdf25d5677de84",
    "watchdogResolutionStatus": "RESOLVED_NOMINAL"
  }
}
```

---

## 6. Procédures Dégradées & Commandes Manuelles d'Urgence

En cas de perte d'accès au Cockpit ou d'indisponibilité du cluster d'orchestration :

```bash
# 1. Vérification de l'intégrité de l'enclave HSM en ligne de commande
python server/neural_core/hsm_enclave_signer.py rack_b

# 2. Exécution du banc de test E2E automatisé (Vérification des 21 contrôles)
python server/tests/e2e_self_healing_sim.py

# 3. Forçage manuel du Rollback d'urgence (Procédure de continuité d'activité)
curl -X POST http://localhost:8080/api/v1/ai/execute \
  -H "Content-Type: application/json" \
  -d '{"action": "EMERGENCY_ROLLBACK", "targetCluster": "cluster-apex-01", "forceWeight": 100}'
```

---
**Homologué par la Direction de la Résilience Numérique (DORA Office) — Octobre 2026**
