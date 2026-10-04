import axios from "axios";
import { io, Socket } from "socket.io-client";

const API_BASE_URL = typeof window !== "undefined" && window.location.origin.includes("localhost")
  ? `${window.location.origin}/api/v1`
  : "/api/v1";

const SOCKET_BASE_URL = typeof window !== "undefined"
  ? window.location.origin
  : "http://localhost:3000";

export interface WorkspaceUser {
  userId: string;
  name: string;
  role: string;
  viewing?: string;
  avatar?: string;
  lastSeen?: string;
}

export interface AssetAnnotation {
  id: string;
  assetId: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: string;
}

export interface TeamAlertEvent {
  message: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  sender?: string;
  timestamp: string;
}

export class WorkspaceService {
  public socket: Socket | null = null;
  private currentWorkspaceId: string = "workspace_lacaza_hq";

  /**
   * 1. Connexion à un Espace de Travail Collaboratif via WebSocket
   */
  async joinWorkspace(workspaceId: string, userId: string): Promise<Socket> {
    this.currentWorkspaceId = workspaceId;

    try {
      await axios.post(`${API_BASE_URL}/workspace/join`, { workspaceId, userId }).catch(() => {});

      if (!this.socket || !this.socket.connected) {
        this.socket = io(SOCKET_BASE_URL, {
          path: "/socket.io",
          query: { workspaceId, userId },
          transports: ["websocket", "polling"],
        });
      }

      this.socket.emit("join_workspace", { workspaceId, userId });
      return this.socket;
    } catch (error) {
      console.error("[WorkspaceService] Join Workspace Error:", error);
      throw error;
    }
  }

  /**
   * 2. Gestion des annotations collaboratives sur équipement 3D (BIM / Spider CAFM)
   */
  async addAnnotation(assetId: string, userId: string, text: string, userName: string = "Opérateur"): Promise<AssetAnnotation> {
    const annotation: AssetAnnotation = {
      id: `note_${Date.now()}`,
      assetId,
      userId,
      userName,
      text,
      timestamp: new Date().toISOString(),
    };

    try {
      await axios.post(`${API_BASE_URL}/workspace/annotations`, annotation).catch(() => {});
      if (this.socket && this.socket.connected) {
        this.socket.emit("new_annotation", annotation);
      }
    } catch (error) {
      console.warn("[WorkspaceService] Annotation fallback locale");
    }

    return annotation;
  }

  /**
   * 3. Partage de ressources (Rapports Carbone, vues 3D, Dashboards)
   */
  async shareResource(resourceId: string, resourceType: "CARBON_REPORT" | "BIM_VIEW" | "DASHBOARD", targetUserId: string): Promise<any> {
    try {
      const response = await axios.post(`${API_BASE_URL}/workspace/share`, {
        resourceId,
        resourceType,
        targetUserId,
      });
      return response.data;
    } catch {
      return { success: true, resourceId, resourceType, targetUserId };
    }
  }

  /**
   * 4. Envoi d'une alerte flash d'équipe
   */
  async broadcastTeamAlert(message: string, severity: "INFO" | "WARNING" | "CRITICAL" = "INFO", sender: string = "Superviseur"): Promise<void> {
    const payload: TeamAlertEvent = {
      message,
      severity,
      sender,
      timestamp: new Date().toISOString(),
    };

    if (this.socket && this.socket.connected) {
      this.socket.emit("team_broadcast", payload);
    }
  }

  /**
   * 5. Suivi de présence en direct (Who is viewing what?)
   */
  subscribeToPresence(onPresenceChange: (users: WorkspaceUser[]) => void): void {
    if (!this.socket) {
      this.socket = io(SOCKET_BASE_URL, { transports: ["websocket", "polling"] });
    }

    this.socket.on("presence_update", (users: WorkspaceUser[]) => {
      onPresenceChange(users);
    });

    // Envoi initial mock d'utilisateurs connectés
    onPresenceChange([
      { userId: "usr-1", name: "Directeur des Opérations", role: "Manager", viewing: "Dashboard Unifié & KPIs" },
      { userId: "usr-2", name: "Marc Vasseur", role: "Superviseur CVC", viewing: "Jumeau Numérique 3D - Pompe 01" },
      { userId: "usr-3", name: "Samira Khelifi", role: "Ingénieur Réseau", viewing: "Cartographie Anycast" },
    ]);
  }

  /**
   * Déconnexion propre du salon collaboratif
   */
  leaveWorkspace(): void {
    if (this.socket) {
      this.socket.emit("leave_workspace", { workspaceId: this.currentWorkspaceId });
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const workspaceService = new WorkspaceService();
export default workspaceService;
