# SENSORIUM — Registre d'Information des Prestataires de Services TIC Tiers (DORA Art. 28)
> **Référentiel :** Règlement (UE) 2022/2554 sur la résilience opérationnelle numérique du secteur financier (DORA)  
> **Champ d'application :** Plateforme de supervision d'infrastructures critiques SENSORIUM  
> **Dernière révision :** Octobre 2026 — Build `8de7fb7`  
> **Classification :** Document d'audit réglementaire confidentiel (DSI / RSSI / Auditeurs DORA)

---

## 1. Cadre Réglementaire & Objectifs

Conformément à **l'Article 28 du Règlement DORA**, les entités financières et leurs fournisseurs de services technologiques critiques doivent tenir à jour un registre exhaustif de tous les contrats de prestation TIC tiers (TPSP - *Third-Party Service Providers*).

Ce document consigne :
1. La cartographie des fonctions critiques supportées.
2. L'évaluation des risques de concentration géographique et technique.
3. Les garanties de souveraineté européenne (RGPD, absence d'extraterritorialité non maîtrisée).
4. Les stratégies de sortie (*exit strategies*) et de réversibilité opérationnelle immédiate.

---

## 2. Cartographie des Prestataires TIC Tiers (TPSP)

| Réf. | Prestataire | Entité Contractante | Fonction Supportée | Criticité | Région d'Hébergement | Score Risque Concentration |
| :--- | :--- | :--- | :--- | :---: | :--- | :---: |
| **TPSP-001** | **Google Cloud / Firebase** | Google Ireland Limited (UE) | Authentification SSO, Realtime Firestore | **CRITIQUE** | Francfort (europe-west3), Belgique (europe-west1) | **68 / 100** |
| **TPSP-002** | **PayPal Europe** | PayPal (Europe) S.à r.l. et Cie, S.C.A. (Luxembourg) | Facturation SaaS, Smart Checkout, Webhooks | **ÉLEVÉE** | Luxembourg & Irlande (Établissement bancaire agréé CSSF) | **42 / 100** |
| **TPSP-003** | **Google DeepMind / Gemini** | Google LLC / DeepMind Tech Ltd | AIOps Prédictif CVC, Analyse spectrale | **MODÉRÉE** | St-Ghislain, Belgique (Partition UE) | **55 / 100** |

---

## 3. Fiches Détaillées d'Évaluation & Stratégies de Sortie

### 3.1. TPSP-001 : Google Cloud / Firebase Auth & Sync
* **Rôle opérationnel :** Gestion des sessions Google Workspace pour les opérateurs terrain et synchronisation en direct des statuts d'équipement.
* **Risque identifié :** Single Point of Failure (SPOF) en cas de panne globale Google Cloud ou de blocage réseau WAN.
* **Mesures de remédiation & Résilience active :**
  * **Circuit-Breaker actif (`resilience.middleware.ts`) :** Détection automatique de timeout > 3 secondes sur les appels Firebase.
  * **Fallback JWT RSA Local :** Basculement automatique transparent vers le serveur d'authentification souverain local SENSORIUM (`/api/v1/auth/login`).
  * **Chiffrement :** Données chiffrées de bout en bout avant écriture dans Firestore.
* **Délai d'activation de la stratégie de sortie :** < 3 secondes (temps réel automatisé).

### 3.2. TPSP-002 : PayPal Europe
* **Rôle opérationnel :** Traitement des paiements récurrents CB/PayPal pour les forfaits SaaS (Lite & Pro).
* **Risque identifié :** Faux événements de facturation (usurpation webhook) ou indisponibilité du service bancaire.
* **Mesures de remédiation & Résilience active :**
  * **Validation cryptographique HMAC :** Vérification systématique de l'en-tête `PAYPAL-TRANSMISSION-SIG` avec certificat X.509 officiel avant tout changement de droits.
  * **Alternative Enterprise :** Les clients Tier Enterprise contractualisent par bon de commande avec virement SEPA bancaire direct sur compte européen (sans passer par PayPal).
* **Délai d'activation de la stratégie de sortie :** Immédiat (gestion contractuelle hybride).

### 3.3. TPSP-003 : Google DeepMind / Gemini AI
* **Rôle opérationnel :** Moteur d'inférence multimodale pour la détection précoce d'anomalies vibratoires et thermodynamiques CVC.
* **Risque identifié :** DoS économique (consommation abusive de quotas) et dépendance API externe.
* **Mesures de remédiation & Résilience active :**
  * **Rate Limiting & Quotas par Tenant (`aiRateLimiter.middleware.ts`) :** Plafond strict de requêtes par minute et de budget de tokens par 24h selon le forfait client.
  * **Moteur d'inférence NPU Local :** En cas de coupure Internet ou d'indisponibilité de Gemini, le processeur **Silicium X1 NPU (INT4)** prend le relais en local avec latence < 3 ms sans perte d'analyse critique.
* **Délai d'activation de la stratégie de sortie :** 0 seconde (moteur redondant local toujours actif).

---

## 4. API d'Export et Supervision DORA

Le registre est exposé dynamiquement via l'API REST sécurisée :
```http
GET /api/v1/compliance/dora/tpsp
Authorization: Bearer <TOKEN_ADMIN_AUDITEUR>
```

Le rapport d'audit au format PDF certifié SHA-256 inclut systématiquement la section TPSP pour présentation aux régulateurs bancaires (ACPR, BCE, BaFin, CSSF).
