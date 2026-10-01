#!/usr/bin/env python3
"""
SENSORIUM — Sovereign Compliance Sync Engine v3
════════════════════════════════════════════════════════════════════════════════
Rôle       : Synchronise le Registre de Conformité (Certifications, Permis,
             Assurances) depuis le Cloud Sensorium vers le Terminal Physique.
Fréquence  : Au démarrage et toutes les 6 heures via systemd timer.
Stockage   : /opt/sensorium/data/compliance_registry.json (readable by Ollama)
Terminal   : SNSR-SILICIUM-X1 NPU Edge Appliance
════════════════════════════════════════════════════════════════════════════════

Usage:
    python3 sync_compliance.py [--once] [--verbose] [--api-url URL]

Flags:
    --once       : Exécute une seule fois et quitte (sans boucle de veille)
    --verbose    : Affiche les logs détaillés
    --api-url    : Override l'URL de l'API Cloud (défaut: config)

Fichiers produits:
    /opt/sensorium/data/compliance_registry.json   — Registre complet JSON
    /opt/sensorium/data/compliance_summary.txt      — Résumé lisible par LLM
    /opt/sensorium/logs/sync_compliance.log         — Journal de synchronisation
"""

import requests
import json
import os
import sys
import time
import logging
import argparse
import hashlib
from datetime import datetime, timezone
from pathlib import Path

# ── Configuration ────────────────────────────────────────────────────────────

CONFIG = {
    # URL de l'API Cloud Sensorium
    "api_url": os.environ.get("SENSORIUM_API_URL", "https://sensorium.app/api/v1"),

    # Identifiants Terminal (définis lors de l'activation par email)
    "org_id": os.environ.get("SENSORIUM_ORG_ID", "tenant_enterprise_lacaza"),
    "activation_key": os.environ.get("SENSORIUM_ACTIVATION_KEY", ""),
    "hardware_id": os.environ.get("SENSORIUM_HARDWARE_ID", "SNSR-SILICIUM-X1"),
    "jwt_token": os.environ.get("SENSORIUM_JWT_TOKEN", ""),

    # Chemins de stockage local
    "data_dir": Path("/opt/sensorium/data"),
    "log_dir": Path("/opt/sensorium/logs"),
    "registry_file": "compliance_registry.json",
    "summary_file": "compliance_summary.txt",
    "log_file": "sync_compliance.log",

    # Intervalles
    "sync_interval_seconds": 6 * 3600,  # 6 heures
    "retry_delay_seconds": 60,
    "request_timeout_seconds": 30,
    "max_retries": 3,
}

# ── Logging Setup ─────────────────────────────────────────────────────────────

def setup_logging(verbose=False):
    CONFIG["log_dir"].mkdir(parents=True, exist_ok=True)
    log_path = CONFIG["log_dir"] / CONFIG["log_file"]

    log_level = logging.DEBUG if verbose else logging.INFO
    logger = logging.getLogger("SovereignSync")
    logger.setLevel(log_level)

    # File handler
    fh = logging.FileHandler(log_path, encoding="utf-8")
    fh.setLevel(log_level)
    fh.setFormatter(logging.Formatter(
        "[%(asctime)s] [%(levelname)s] %(message)s",
        datefmt="%Y-%m-%dT%H:%M:%S"
    ))

    # Console handler
    ch = logging.StreamHandler(sys.stdout)
    ch.setLevel(log_level)
    ch.setFormatter(logging.Formatter("%(levelname)s │ %(message)s"))

    logger.addHandler(fh)
    logger.addHandler(ch)
    return logger

# ── API Client ────────────────────────────────────────────────────────────────

def build_headers():
    headers = {
        "Content-Type": "application/json",
        "X-Terminal-ID": CONFIG["hardware_id"],
        "X-Org-ID": CONFIG["org_id"],
    }
    if CONFIG["jwt_token"]:
        headers["Authorization"] = "Bearer " + CONFIG["jwt_token"]
    return headers


def fetch_compliance_registry(logger):
    """Télécharge le registre de conformité depuis l'API Cloud."""
    url = CONFIG["api_url"] + "/compliance/" + CONFIG["org_id"]
    headers = build_headers()

    for attempt in range(1, CONFIG["max_retries"] + 1):
        try:
            logger.debug("[Fetch] Tentative %d/%d -> %s", attempt, CONFIG["max_retries"], url)
            resp = requests.get(url, headers=headers, timeout=CONFIG["request_timeout_seconds"])
            resp.raise_for_status()
            data = resp.json()

            if data.get("success") is False:
                logger.error("[Fetch] API a retourné success=false: %s", data.get("error"))
                return None

            logger.info("[Fetch] ✅ Registre récupéré (%.2fs)", resp.elapsed.total_seconds())
            return data

        except requests.exceptions.ConnectionError:
            logger.warning("[Fetch] ⚠️ Connexion refusée (tentative %d). Retry dans %ds...",
                           attempt, CONFIG["retry_delay_seconds"])
        except requests.exceptions.Timeout:
            logger.warning("[Fetch] ⚠️ Timeout (tentative %d).", attempt)
        except requests.exceptions.HTTPError as e:
            logger.error("[Fetch] ❌ HTTP %d: %s", e.response.status_code, e.response.text[:200])
            return None
        except Exception as e:
            logger.error("[Fetch] ❌ Erreur inattendue: %s", e)
            return None

        if attempt < CONFIG["max_retries"]:
            time.sleep(CONFIG["retry_delay_seconds"])

    logger.error("[Fetch] ❌ Toutes les tentatives ont échoué.")
    return None


def notify_heartbeat(logger, sync_status="success"):
    """Notifie le cloud que le terminal est actif et a synchronisé."""
    url = CONFIG["api_url"] + "/terminal/heartbeat"
    payload = {
        "orgId": CONFIG["org_id"],
        "terminalSerial": CONFIG["hardware_id"],
        "activationKey": CONFIG["activation_key"],
        "syncStatus": sync_status,
        "uptimeSeconds": int(time.monotonic()),
        "inferenceCount": 0,
        "modelLoaded": "llama3:8b",
        "source": "sync_compliance_py_v3",
    }
    try:
        resp = requests.post(url, json=payload, headers=build_headers(), timeout=15)
        if resp.ok:
            logger.debug("[Heartbeat] ✅ Signal envoyé au Cloud.")
        else:
            logger.warning("[Heartbeat] ⚠️ Code %d: %s", resp.status_code, resp.text[:100])
    except Exception as e:
        logger.debug("[Heartbeat] ⚠️ Non-bloquant: %s", e)

# ── Data Transformation ───────────────────────────────────────────────────────

def compute_checksum(data):
    """Génère un hash SHA-256 des données pour détecter les changements."""
    serialized = json.dumps(data, sort_keys=True, default=str)
    return hashlib.sha256(serialized.encode()).hexdigest()


def compute_days_until(expiry_str):
    now = datetime.now(timezone.utc)
    try:
        exp = datetime.fromisoformat(expiry_str.replace("Z", "+00:00"))
        return (exp - now).days
    except (ValueError, TypeError):
        return -999


def compute_status(expiry_str, current_status):
    days = compute_days_until(expiry_str)
    if days < 0:
        return "Expired"
    if days <= 60:
        return "Warning"
    return current_status if current_status != "Expired" else "Valid"


def enrich_registry(raw_data):
    """Enrichit les données avec des métadonnées calculées localement."""
    now = datetime.now(timezone.utc)

    certs = raw_data.get("certs", [])
    permits = raw_data.get("permits", [])
    insurances = raw_data.get("insurances") or raw_data.get("insurance", [])

    for item in certs:
        expiry = item.get("dateExpiry") or item.get("expiry", "")
        item["_daysUntilExpiry"] = compute_days_until(expiry)
        item["_resolvedStatus"] = compute_status(expiry, item.get("status", "Valid"))

    for item in permits:
        expiry = item.get("dateExpiry") or item.get("expiry", "")
        item["_daysUntilExpiry"] = compute_days_until(expiry)
        item["_resolvedStatus"] = compute_status(expiry, item.get("status", "Valid"))

    for item in insurances:
        expiry = item.get("dateExpiry") or item.get("expiry", "")
        item["_daysUntilExpiry"] = compute_days_until(expiry)
        item["_resolvedStatus"] = compute_status(expiry, item.get("status", "Valid"))

    all_items = certs + permits + insurances
    stats = {
        "total": len(all_items),
        "valid": sum(1 for i in all_items if i.get("_resolvedStatus") == "Valid"),
        "warning": sum(1 for i in all_items if i.get("_resolvedStatus") == "Warning"),
        "expired": sum(1 for i in all_items if i.get("_resolvedStatus") == "Expired"),
        "expiringIn30Days": sum(1 for i in all_items if 0 <= i.get("_daysUntilExpiry", -1) <= 30),
    }

    return {
        "_meta": {
            "syncedAt": now.isoformat(),
            "syncEngine": "Sovereign Sync Engine v3",
            "terminal": CONFIG["hardware_id"],
            "orgId": CONFIG["org_id"],
            "checksum": compute_checksum(raw_data),
            "apiVersion": "v1",
        },
        "stats": stats,
        "certs": certs,
        "permits": permits,
        "insurances": insurances,
        "compliance_score": round((stats["valid"] / stats["total"] * 100) if stats["total"] > 0 else 0, 1),
    }


def generate_llm_summary(registry):
    """Génère un résumé textuel optimisé pour le LLM local (Ollama)."""
    stats = registry.get("stats", {})
    synced = registry.get("_meta", {}).get("syncedAt", "?")
    score = registry.get("compliance_score", 0)

    lines = [
        "═══════════════════════════════════════════════════════════",
        "  SENSORIUM — REGISTRE DE CONFORMITE SOUVERAIN (Resume IA)",
        "═══════════════════════════════════════════════════════════",
        "  Synchronise le   : " + str(synced),
        "  Terminal          : " + CONFIG["hardware_id"],
        "  Organisation      : " + CONFIG["org_id"],
        "  Score conformite  : " + str(score) + "%",
        "",
        "  Total elements  : " + str(stats.get("total", 0)),
        "  [OK] Conformes  : " + str(stats.get("valid", 0)),
        "  [!!] Vigilance  : " + str(stats.get("warning", 0)),
        "  [KO] Expires    : " + str(stats.get("expired", 0)),
        "  [!!] Expire<30j : " + str(stats.get("expiringIn30Days", 0)),
        "",
    ]

    certs = registry.get("certs", [])
    if certs:
        lines.append("── CERTIFICATIONS ──────────────────────────────────────")
        for c in certs:
            status = c.get("_resolvedStatus", c.get("status", "?"))
            days = c.get("_daysUntilExpiry", "?")
            icon = "[OK]" if status == "Valid" else ("[!!]" if status == "Warning" else "[KO]")
            lines.append("  " + icon + " [" + str(c.get("id", "?"))[:8] + "] " + c.get("name", "?"))
            lines.append("        Organisme : " + c.get("issuer", "?"))
            lines.append("        Expiration: " + str(c.get("dateExpiry") or c.get("expiry", "?")) + " (" + str(days) + " jours)")
            lines.append("")

    permits = registry.get("permits", [])
    if permits:
        lines.append("── PERMIS DE CONDUIRE ───────────────────────────────────")
        for p in permits:
            status = p.get("_resolvedStatus", p.get("status", "?"))
            days = p.get("_daysUntilExpiry", "?")
            icon = "[OK]" if status == "Valid" else ("[!!]" if status == "Warning" else "[KO]")
            lines.append("  " + icon + " " + p.get("driver", "?") + " — " + p.get("category", "?"))
            lines.append("        Expiration: " + str(p.get("dateExpiry") or p.get("expiry", "?")) + " (" + str(days) + " jours)")
            lines.append("")

    insurances = registry.get("insurances", [])
    if insurances:
        lines.append("── CONTRATS D'ASSURANCE ─────────────────────────────────")
        for i in insurances:
            status = i.get("_resolvedStatus", i.get("status", "?"))
            days = i.get("_daysUntilExpiry", "?")
            icon = "[OK]" if status == "Valid" else ("[!!]" if status == "Warning" else "[KO]")
            lines.append("  " + icon + " " + i.get("company", "?") + " — " + str(i.get("policyNumber") or i.get("policy", "?")))
            lines.append("        Couverture : " + str(i.get("coverage") or i.get("coverageType", "?")))
            lines.append("        Vehicule   : " + str(i.get("vehicle", "Flotte Generale")))
            lines.append("        Expiration : " + str(i.get("dateExpiry") or i.get("expiry", "?")) + " (" + str(days) + " jours)")
            lines.append("")

    lines += [
        "═══════════════════════════════════════════════════════════",
        "  FIN DU REGISTRE — Genere par Sovereign Sync Engine v3",
        "═══════════════════════════════════════════════════════════",
    ]
    return "\n".join(lines)

# ── File Writer ───────────────────────────────────────────────────────────────

def save_registry(registry, logger):
    """Sauvegarde atomiquement le registre JSON et le résumé texte."""
    CONFIG["data_dir"].mkdir(parents=True, exist_ok=True)

    registry_path = CONFIG["data_dir"] / CONFIG["registry_file"]
    summary_path = CONFIG["data_dir"] / CONFIG["summary_file"]
    tmp_registry = registry_path.with_suffix(".tmp")
    tmp_summary = summary_path.with_suffix(".tmp")

    try:
        with open(tmp_registry, "w", encoding="utf-8") as f:
            json.dump(registry, f, indent=2, ensure_ascii=False, default=str)
        tmp_registry.replace(registry_path)

        summary = generate_llm_summary(registry)
        with open(tmp_summary, "w", encoding="utf-8") as f:
            f.write(summary)
        tmp_summary.replace(summary_path)

        logger.info("[Save] ✅ Registre JSON -> %s", registry_path)
        logger.info("[Save] ✅ Resume LLM   -> %s", summary_path)
        return True

    except OSError as e:
        logger.error("[Save] ❌ Erreur d'ecriture: %s", e)
        for tmp in [tmp_registry, tmp_summary]:
            try:
                tmp.unlink(missing_ok=True)
            except Exception:
                pass
        return False


def get_current_checksum(logger):
    """Lit le checksum du registre local actuel pour détecter les changements."""
    try:
        registry_path = CONFIG["data_dir"] / CONFIG["registry_file"]
        with open(registry_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data.get("_meta", {}).get("checksum")
    except Exception:
        return None

# ── Main Sync Logic ───────────────────────────────────────────────────────────

def run_sync_cycle(logger):
    """Exécute un cycle de synchronisation complet."""
    logger.info("━" * 60)
    logger.info("[Sync] 🔄 Demarrage du cycle de synchronisation...")
    logger.info("[Sync]    Terminal : %s", CONFIG["hardware_id"])
    logger.info("[Sync]    Org ID   : %s", CONFIG["org_id"])
    logger.info("[Sync]    API      : %s", CONFIG["api_url"])

    raw_data = fetch_compliance_registry(logger)
    if raw_data is None:
        logger.error("[Sync] ❌ Impossible de recuperer le registre. Cycle annule.")
        notify_heartbeat(logger, sync_status="fetch_failed")
        return False

    current_checksum = get_current_checksum(logger)
    new_checksum = compute_checksum(raw_data)
    if current_checksum == new_checksum:
        logger.info("[Sync] 📋 Donnees identiques au miroir local. Pas de mise a jour necessaire.")
        notify_heartbeat(logger, sync_status="no_change")
        return True

    enriched = enrich_registry(raw_data)
    score = enriched.get("compliance_score", 0)
    stats = enriched.get("stats", {})
    logger.info("[Sync] 📊 Score de conformite : %s%%", score)
    logger.info("[Sync]    Total: %d | Conformes: %d | Vigilance: %d | Expires: %d",
                stats.get("total", 0), stats.get("valid", 0),
                stats.get("warning", 0), stats.get("expired", 0))

    saved = save_registry(enriched, logger)
    if not saved:
        notify_heartbeat(logger, sync_status="save_failed")
        return False

    notify_heartbeat(logger, sync_status="success")

    # Alertes pour les expirations critiques
    all_items = enriched.get("certs", []) + enriched.get("permits", []) + enriched.get("insurances", [])
    critical = [i for i in all_items if 0 <= i.get("_daysUntilExpiry", -1) <= 30]
    if critical:
        logger.warning("[Alert] 🔔 %d element(s) expirent dans moins de 30 jours !", len(critical))
        for item in critical:
            name = item.get("name") or item.get("driver") or item.get("company") or "?"
            logger.warning("[Alert]    • %s — expire dans %d jours", name, item.get("_daysUntilExpiry", 0))

    logger.info("[Sync] ✅ Cycle termine avec succes.")
    return True


# ── Entry Point ───────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="SENSORIUM — Sovereign Compliance Sync Engine v3",
    )
    parser.add_argument("--once", action="store_true", help="Executer une seule fois et quitter")
    parser.add_argument("--verbose", action="store_true", help="Logs detailles")
    parser.add_argument("--api-url", type=str, help="Override URL de l'API Cloud")
    args = parser.parse_args()

    if args.api_url:
        CONFIG["api_url"] = args.api_url.rstrip("/")

    logger = setup_logging(verbose=args.verbose)

    logger.info("╔══════════════════════════════════════════════════════╗")
    logger.info("║  SENSORIUM — Sovereign Compliance Sync Engine v3     ║")
    logger.info("╚══════════════════════════════════════════════════════╝")

    if args.once:
        success = run_sync_cycle(logger)
        sys.exit(0 if success else 1)
    else:
        logger.info("[Main] Mode daemon — cycle toutes les %dh.", CONFIG["sync_interval_seconds"] // 3600)
        while True:
            try:
                run_sync_cycle(logger)
            except KeyboardInterrupt:
                logger.info("[Main] Arret demande par l'utilisateur.")
                break
            except Exception as e:
                logger.exception("[Main] ❌ Erreur non-geree dans le cycle: %s", e)

            logger.info("[Main] Prochain cycle dans %dh...", CONFIG["sync_interval_seconds"] // 3600)
            try:
                time.sleep(CONFIG["sync_interval_seconds"])
            except KeyboardInterrupt:
                logger.info("[Main] Arret demande durant l'attente.")
                break


if __name__ == "__main__":
    main()
