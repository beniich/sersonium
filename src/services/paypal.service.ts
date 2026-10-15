import axios from "axios";
import authService from "./auth.service";
import rbacService from "./rbac.service";

const API_BASE_URL = (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL) || "/api/v1";

export interface InitSubscriptionResponse {
  success: boolean;
  subscriptionId?: string;
  orderId?: string;
  approvalUrl?: string;
  data?: any;
}

export class PayPalService {
  private getTenantId(): string {
    return (
      authService.getSession().user?.tenantId ||
      rbacService.getSession()?.tenantId ||
      (typeof localStorage !== "undefined" && localStorage.getItem("tenantId")) ||
      "tenant_enterprise_lacaza"
    );
  }

  /**
   * Lance le processus d'abonnement récurrent (Vault & Subscription Model)
   * @param planId L'identifiant de plan PayPal (ex: P-PRO-MONTHLY ou forfait)
   * @param cycle Périodicité ("monthly" | "yearly")
   */
  async createSubscription(planId: string = "P-PRO-MONTHLY", cycle: "monthly" | "yearly" = "monthly"): Promise<InitSubscriptionResponse> {
    try {
      const tenantId = this.getTenantId();
      const csrfToken = await authService.getCsrfToken();
      const accessToken = authService.getSession().accessToken;
      
      const response = await axios.post(
        `${API_BASE_URL}/payments/paypal/create-order`,
        { planId, cycle, tenantId },
        {
          headers: {
            "Content-Type": "application/json",
            ...(csrfToken ? { "x-csrf-token": csrfToken, "x-xsrf-token": csrfToken } : {}),
            ...(accessToken ? { "Authorization": `Bearer ${accessToken}` } : {}),
          },
          withCredentials: true,
        }
      );

      return response.data;
    } catch (error) {
      console.error("[PayPal Frontend Service] Init Subscription Error:", error);
      throw error;
    }
  }

  /**
   * Confirmation côté client après approbation de l'utilisateur sur PayPal
   */
  async confirmSubscription(subscriptionIdOrOrderId: string): Promise<any> {
    const tenantId = this.getTenantId();
    const csrfToken = await authService.getCsrfToken();
    const accessToken = authService.getSession().accessToken;
    
    const response = await axios.post(
      `${API_BASE_URL}/payments/paypal/capture-order`,
      {
        orderId: subscriptionIdOrOrderId,
        subscriptionId: subscriptionIdOrOrderId,
        tenantId,
      },
      {
        headers: {
          "Content-Type": "application/json",
          ...(csrfToken ? { "x-csrf-token": csrfToken, "x-xsrf-token": csrfToken } : {}),
          ...(accessToken ? { "Authorization": `Bearer ${accessToken}` } : {}),
        },
        withCredentials: true,
      }
    );
    return response.data;
  }
}

export const paypalService = new PayPalService();
export default paypalService;
