import { Response } from "express";

export interface SseClient {
  id: string;
  tenantId: string;
  userId?: string;
  res: Response;
}

export class SseService {
  private static clients: Map<string, SseClient> = new Map();

  /**
   * Enregistre un nouveau client SSE avec ses en-têtes de streaming
   */
  static addClient(clientId: string, tenantId: string, userId: string | undefined, res: Response): void {
    // Configuration des en-têtes SSE standards
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
      "Access-Control-Allow-Origin": "*",
    });

    res.write(`data: ${JSON.stringify({ type: "CONNECTED", tenantId, timestamp: new Date().toISOString() })}\n\n`);

    this.clients.set(clientId, { id: clientId, tenantId, userId, res });

    // Nettoyage à la déconnexion
    res.on("close", () => {
      this.clients.delete(clientId);
    });
  }

  /**
   * Diffuse un événement SSE à tous les clients connectés d'un tenant spécifique
   */
  static broadcastToTenant(tenantId: string, eventType: string, data: any): void {
    const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;

    for (const [id, client] of this.clients.entries()) {
      if (client.tenantId === tenantId) {
        try {
          client.res.write(payload);
        } catch {
          this.clients.delete(id);
        }
      }
    }
  }

  /**
   * Diffuse un événement ciblé à un utilisateur précis
   */
  static sendToUser(userId: string, eventType: string, data: any): void {
    const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;

    for (const [id, client] of this.clients.entries()) {
      if (client.userId === userId) {
        try {
          client.res.write(payload);
        } catch {
          this.clients.delete(id);
        }
      }
    }
  }

  /**
   * Diffuse un événement SSE à l'ensemble des clients connectés (inter-tenants / superviseurs)
   */
  static broadcastToAll(eventType: string, data: any): void {
    const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;

    for (const [id, client] of this.clients.entries()) {
      try {
        client.res.write(payload);
      } catch {
        this.clients.delete(id);
      }
    }
  }

  /**
   * Diffuse une alerte de sécurité critique WAF ou Zero-Trust
   */
  static broadcastSecurityEvent(event: any): void {
    this.broadcastToAll("security.events", {
      ...event,
      timestamp: new Date().toISOString()
    });
  }

  private static healthTimer: any = null;

  /**
   * Démarre la diffusion automatique du heartbeat de santé système (Circuit Breaker IA + Observabilité)
   * toutes les 10 secondes.
   */
  static startSystemHealthBroadcast(): void {
    if (this.healthTimer) return;

    this.healthTimer = setInterval(async () => {
      if (this.clients.size === 0) return;

      try {
        const { AIService } = await import("./ai.service.js");
        const circuit = AIService.getCircuitStatus();

        this.broadcastToAll("system.health", {
          circuitBreaker: {
            state: circuit.state,
            failureCount: circuit.failureCount,
            lastFailureAt: circuit.lastFailureTime > 0 ? new Date(circuit.lastFailureTime).toISOString() : null,
            isHealthy: circuit.state === "CLOSED"
          },
          connectedClients: this.clients.size,
          timestamp: new Date().toISOString()
        });
      } catch (err) {
        // Ignorer silencieusement si AIService est en cours de rechargement
      }
    }, 10000);
  }

  /**
   * Retourne le nombre de clients connectés
   */
  static getStats() {
    return {
      connectedClients: this.clients.size,
      tenantsActive: new Set(Array.from(this.clients.values()).map(c => c.tenantId)).size
    };
  }
}

// Initialisation immédiate du broadcast santé système
SseService.startSystemHealthBroadcast();
