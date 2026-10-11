/**
 * SENSORIUM — UEM Service (Unified Endpoint Management)
 * Gestion complète des terminaux, commandes à distance, politiques de sécurité & DLP
 */

import { TenantPrismaClient } from "../db/tenantPrisma.js";
import { rawPrisma as prisma } from "../db/prisma.js";

// ─── Types ────────────────────────────────────────────────────────────────────

export type CommandType =
  | "BLOCK_USB"
  | "UNBLOCK_USB"
  | "BLOCK_BLUETOOTH"
  | "UNBLOCK_BLUETOOTH"
  | "INSTALL_APP"
  | "UNINSTALL_APP"
  | "REBOOT"
  | "SHUTDOWN"
  | "LOCK_SCREEN"
  | "POLICY_UPDATE"
  | "WIPE_DEVICE"
  | "COLLECT_LOGS"
  | "DEPLOY_PATCH";

export type CommandStatus = "PENDING" | "EXECUTING" | "DONE" | "FAILED" | "TIMEOUT";

export type TerminalStatus = "ONLINE" | "OFFLINE" | "WARNING" | "CRITICAL" | "UNKNOWN";

export interface TerminalInventory {
  terminalId: string;
  hostname: string;
  os: string;
  osVersion: string;
  cpuCores: number;
  ramGb: number;
  diskGb: number;
  installedApps: string[];
  lastIp: string;
  agentVersion: string;
  timestamp: string;
}

export interface UemCommand {
  id: string;
  terminalId: string;
  commandType: CommandType;
  payload: Record<string, any>;
  status: CommandStatus;
  result?: string;
  createdAt: Date;
  executedAt?: Date;
}

export interface SecurityPolicy {
  usbBlocked: boolean;
  bluetoothBlocked: boolean;
  firewallStrict: boolean;
  screenLockMinutes: number;
  allowedApps: string[];
  blacklistedApps: string[];
  dlpEnabled: boolean;
  encryptionRequired: boolean;
  allowedFileExtensions: string[];
}

// ─── UEM Service ──────────────────────────────────────────────────────────────

export class UemService {
  /**
   * 1. Enregistre ou met à jour l'inventaire d'un terminal
   *    Appelé par l'agent toutes les 60 secondes
   */
  static async registerInventory(
    tenantId: string,
    data: TerminalInventory
  ) {
    const existing = await prisma.uemTerminal.findFirst({
      where: { terminalId: data.terminalId, tenantId }
    });

    const record = {
      terminalId: data.terminalId,
      tenantId,
      hostname: data.hostname,
      os: data.os,
      osVersion: data.osVersion,
      cpuCores: data.cpuCores,
      ramGb: data.ramGb,
      diskGb: data.diskGb,
      installedApps: JSON.stringify(data.installedApps),
      lastIp: data.lastIp,
      agentVersion: data.agentVersion,
      status: "ONLINE" as TerminalStatus,
      lastSeen: new Date(),
    };

    if (existing) {
      return prisma.uemTerminal.update({
        where: { id: existing.id },
        data: record
      });
    } else {
      return prisma.uemTerminal.create({ data: record });
    }
  }

  /**
   * 2. Récupère la liste de tous les terminaux d'un tenant
   */
  static async getAllTerminals(tenantId: string) {
    const terminals = await prisma.uemTerminal.findMany({
      where: { tenantId },
      orderBy: { lastSeen: "desc" }
    });

    // Marquer OFFLINE les terminaux sans heartbeat depuis 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    return terminals.map(t => ({
      ...t,
      installedApps: JSON.parse(t.installedApps || "[]"),
      status: t.lastSeen < fiveMinutesAgo ? "OFFLINE" : t.status,
    }));
  }

  /**
   * 3. Envoie une commande à un terminal (ajout dans la file d'attente)
   */
  static async sendCommand(
    tenantId: string,
    userId: string,
    terminalId: string,
    commandType: CommandType,
    payload: Record<string, any> = {}
  ) {
    // Vérifier que le terminal appartient bien au tenant
    const terminal = await prisma.uemTerminal.findFirst({
      where: { terminalId, tenantId }
    });
    if (!terminal) throw new Error(`Terminal ${terminalId} introuvable.`);

    const cmd = await prisma.uemCommandQueue.create({
      data: {
        tenantId,
        terminalId,
        commandType,
        payload: JSON.stringify(payload),
        status: "PENDING",
        createdBy: userId,
      }
    });

    // Audit trail
    await prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action: `UEM_COMMAND_${commandType}`,
        resource: "UemCommandQueue",
        resourceId: cmd.id,
        details: JSON.stringify({ terminalId, payload }),
      }
    });

    return cmd;
  }

  /**
   * 4. L'agent endpoint appelle cet endpoint pour récupérer ses ordres
   *    Retourne les commandes PENDING, les marque EXECUTING
   */
  static async pollCommands(terminalId: string): Promise<UemCommand[]> {
    const pending = await prisma.uemCommandQueue.findMany({
      where: { terminalId, status: "PENDING" },
      orderBy: { createdAt: "asc" },
      take: 10
    });

    if (pending.length > 0) {
      await prisma.uemCommandQueue.updateMany({
        where: {
          id: { in: pending.map(c => c.id) }
        },
        data: {
          status: "EXECUTING",
          executedAt: new Date()
        }
      });
    }

    return pending.map(c => ({
      id: c.id,
      terminalId: c.terminalId,
      commandType: c.commandType as CommandType,
      payload: JSON.parse(c.payload || "{}"),
      status: "EXECUTING" as CommandStatus,
      createdAt: c.createdAt,
    }));
  }

  /**
   * 5. L'agent reporte le résultat d'une commande exécutée
   */
  static async reportCommandResult(
    commandId: string,
    success: boolean,
    result: string
  ) {
    return prisma.uemCommandQueue.update({
      where: { id: commandId },
      data: {
        status: success ? "DONE" : "FAILED",
        result,
        updatedAt: new Date()
      }
    });
  }

  /**
   * 6. Définit/met à jour la politique de sécurité d'un terminal ou groupe
   */
  static async setSecurityPolicy(
    tenantId: string,
    userId: string,
    groupId: string,
    policy: SecurityPolicy
  ) {
    const existing = await prisma.uemSecurityPolicy.findFirst({
      where: { groupId, tenantId }
    });

    const record = {
      tenantId,
      groupId,
      policy: JSON.stringify(policy),
      updatedBy: userId,
      updatedAt: new Date(),
    };

    let result;
    if (existing) {
      result = await prisma.uemSecurityPolicy.update({
        where: { id: existing.id },
        data: record
      });
    } else {
      result = await prisma.uemSecurityPolicy.create({
        data: { ...record, createdAt: new Date() }
      });
    }

    // Audit
    await prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action: "UEM_POLICY_UPDATE",
        resource: "UemSecurityPolicy",
        resourceId: result.id,
        details: JSON.stringify({ groupId, policy }),
      }
    });

    return result;
  }

  /**
   * 7. L'agent récupère la politique active pour son terminal
   */
  static async getTerminalPolicy(terminalId: string, tenantId: string): Promise<SecurityPolicy> {
    const policy = await prisma.uemSecurityPolicy.findFirst({
      where: { tenantId, groupId: { in: [terminalId, "default", "all"] } },
      orderBy: { updatedAt: "desc" }
    });

    if (!policy) {
      return {
        usbBlocked: false,
        bluetoothBlocked: false,
        firewallStrict: true,
        screenLockMinutes: 15,
        allowedApps: [],
        blacklistedApps: [],
        dlpEnabled: false,
        encryptionRequired: false,
        allowedFileExtensions: [],
      };
    }

    return JSON.parse(policy.policy);
  }

  /**
   * 8. Détection de logiciels non conformes (blacklist / DLP)
   */
  static async detectNonCompliantSoftware(
    tenantId: string,
    terminalId: string,
    installedApps: string[]
  ) {
    const policy = await this.getTerminalPolicy(terminalId, tenantId);
    const violations = installedApps.filter(app =>
      policy.blacklistedApps.some(b => app.toLowerCase().includes(b.toLowerCase()))
    );

    if (violations.length > 0) {
      await prisma.uemAlert.create({
        data: {
          tenantId,
          terminalId,
          alertType: "NON_COMPLIANT_SOFTWARE",
          severity: "HIGH",
          message: `Applications non autorisées détectées: ${violations.join(", ")}`,
          details: JSON.stringify({ violations }),
          status: "OPEN",
        }
      });
    }

    return { violations, compliant: violations.length === 0 };
  }

  /**
   * 9. Récupère les alertes UEM d'un tenant
   */
  static async getAlerts(tenantId: string, status?: string) {
    return prisma.uemAlert.findMany({
      where: {
        tenantId,
        ...(status ? { status } : {})
      },
      orderBy: { createdAt: "desc" },
      take: 100
    });
  }

  /**
   * 10. Statistiques globales UEM pour le dashboard
   */
  static async getUemStats(tenantId: string) {
    const [totalTerminals, onlineTerminals, pendingCommands, openAlerts] =
      await Promise.all([
        prisma.uemTerminal.count({ where: { tenantId } }),
        prisma.uemTerminal.count({
          where: {
            tenantId,
            status: "ONLINE",
            lastSeen: { gte: new Date(Date.now() - 5 * 60 * 1000) }
          }
        }),
        prisma.uemCommandQueue.count({ where: { tenantId, status: "PENDING" } }),
        prisma.uemAlert.count({ where: { tenantId, status: "OPEN" } }),
      ]);

    return {
      totalTerminals,
      onlineTerminals,
      offlineTerminals: totalTerminals - onlineTerminals,
      complianceRate: totalTerminals > 0 ? Math.round((onlineTerminals / totalTerminals) * 100) : 100,
      pendingCommands,
      openAlerts,
    };
  }

  /**
   * 11. Ferme/acknowledge une alerte
   */
  static async acknowledgeAlert(tenantId: string, alertId: string, userId: string) {
    return prisma.uemAlert.update({
      where: { id: alertId },
      data: { status: "ACKNOWLEDGED", acknowledgedBy: userId, acknowledgedAt: new Date() }
    });
  }

  /**
   * 12. Historique des commandes pour un terminal
   */
  static async getCommandHistory(tenantId: string, terminalId: string) {
    return prisma.uemCommandQueue.findMany({
      where: { tenantId, terminalId },
      orderBy: { createdAt: "desc" },
      take: 50
    });
  }

  /**
   * 13. Enregistrement d'un nouveau client / organisation et initialisation UEM
   */
  static async registerClient(data: {
    tenantId: string;
    name: string;
    plan?: string;
    serverHost: string;
    serverPort: number;
    serverProtocol: string;
    agentKey: string;
    policy?: Partial<SecurityPolicy>;
  }) {
    const slug = data.tenantId.toLowerCase().replace(/[^a-z0-9]/g, "-");

    const org = await prisma.organization.upsert({
      where: { slug },
      update: {
        name: data.name,
        plan: data.plan || "PRO",
      },
      create: {
        id: data.tenantId,
        name: data.name,
        slug,
        plan: data.plan || "PRO",
      },
    });

    const defaultPolicy: SecurityPolicy = {
      usbBlocked: data.policy?.usbBlocked ?? false,
      bluetoothBlocked: data.policy?.bluetoothBlocked ?? false,
      firewallStrict: data.policy?.firewallStrict ?? true,
      screenLockMinutes: data.policy?.screenLockMinutes ?? 15,
      allowedApps: [],
      blacklistedApps: ["TorrentClient", "BitTorrent", "uTorrent"],
      dlpEnabled: data.policy?.dlpEnabled ?? true,
      encryptionRequired: false,
      allowedFileExtensions: [".exe", ".msi"],
      ...data.policy,
    };

    await this.setSecurityPolicy(data.tenantId, "system", "default", defaultPolicy);

    return {
      organization: org,
      policy: defaultPolicy,
    };
  }
}
